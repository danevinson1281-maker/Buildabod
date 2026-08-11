// /app/api/clients/change-meal-frequency/route.js

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateMealPlan } from '@/lib/mealPlanGenerator';
import { checkFrequencyCooldown } from '@/lib/frequencyHelpers';
import PDFDocument from 'pdfkit';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  try {
    const { clientId, newMealsPerDay } = await request.json();

    if (!clientId || !newMealsPerDay) {
      return NextResponse.json(
        { error: 'Missing clientId or newMealsPerDay' },
        { status: 400 }
      );
    }

    // ── STEP 1: Fetch client ──────────────────────────────────────────────
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select(
        'id, full_name, email, meals_per_day, last_frequency_change_date, selected_foods, meal_variety, meal_pattern'
      )
      .eq('id', clientId)
      .single();

    if (clientError || !client) {
      console.error('Client fetch error:', clientError);
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    // ── STEP 1b: Fetch CURRENT daily macro targets (these stay the same!) ──
    const { data: currentPlan, error: planError } = await supabase
      .from('meal_plans')
      .select('target_calories, target_protein_g, target_carbs_g, target_fats_g')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (planError || !currentPlan) {
      console.error('Current plan fetch error:', planError);
      return NextResponse.json({ error: 'No existing meal plan found' }, { status: 404 });
    }


    // IMPORTANT: Keep the SAME daily targets — don't recalculate!
    const targetCalories = currentPlan.target_calories;
    const targetProtein = currentPlan.target_protein_g;
    const targetCarbs = currentPlan.target_carbs_g;
    const targetFats = currentPlan.target_fats_g;

    console.log(`Keeping same daily targets: ${targetCalories} cal, ${targetProtein}g P, ${targetCarbs}g C, ${targetFats}g F`);

    // ── STEP 2: Check cooldown ────────────────────────────────────────────
    const cooldown = checkFrequencyCooldown(client.last_frequency_change_date);
    if (!cooldown.canChange) {
      return NextResponse.json(
        {
          error: 'Cooldown active',
          message: `You can change meal frequency again on ${cooldown.nextChangeDate.toLocaleDateString()}`,
          nextChangeDate: cooldown.nextChangeDate,
        },
        { status: 429 }
      );
    }

    // ── STEP 3: Validate new meal count ───────────────────────────────────
    const newMeals = Math.max(2, Math.min(6, parseInt(newMealsPerDay)));
    if (newMeals === client.meals_per_day) {
      return NextResponse.json(
        { error: 'New meal frequency is same as current' },
        { status: 400 }
      );
    }

    // ── STEP 3b: Determine pattern to use ─────────────────────────────────
    // Get the client's current pattern
    const currentPattern = client.meal_pattern || 'balanced';
    
    // Heavy-light only works with 5 meals
    // For 6+ meals, keep the pattern (heavy-light still works with adjusted weights)
    // For 3-4 meals, reset to balanced (heavy-light is disabled)
    const newPattern = parseInt(newMeals) <= 4 ? 'balanced' : currentPattern;

    console.log('🎯 Pattern logic:', {
      currentPattern,
      newMeals,
      newPattern,
      reason: parseInt(newMeals) <= 4 ? 'Reset to balanced (heavy-light disabled for 3-4 meals)' : 'Preserve pattern',
    });

    // ── STEP 4: Generate new meal plan with SAME daily targets ────────────
    console.log(`Generating new meal plan for ${client.full_name}: ${client.meals_per_day} → ${newMeals} meals`);
    console.log(`Using daily targets: Cal=${targetCalories}, P=${targetProtein}g, C=${targetCarbs}g, F=${targetFats}g`);

    const newMealPlanResult = generateMealPlan({
      selectedFoods: client.selected_foods,
      fullName: client.full_name,
      mealsPerDay: newMeals,
      mealVariety: client.meal_variety || 'mix',
      targetCalories,
      targetProtein,
      targetCarbs,
      targetFats,
      mealPattern: newPattern, // ✅ Use the resolved pattern (not hardcoded 'balanced')
    });

    if (!newMealPlanResult || !newMealPlanResult.meals) {
      return NextResponse.json(
        { error: 'Failed to generate new meal plan' },
        { status: 500 }
      );
    }

    // ── STEP 5: Calculate actual totals and apply precision micro-adjustment ──
    let actualCalories = 0;
    let actualProtein = 0;
    let actualCarbs = 0;
    let actualFats = 0;

    Object.values(newMealPlanResult.meals).forEach(meal => {
      if (meal.totals) {
        actualCalories += meal.totals.calories || 0;
        actualProtein += meal.totals.protein_g || 0;
        actualCarbs += meal.totals.carbs_g || 0;
        actualFats += meal.totals.fats_g || 0;
      }
    });

    actualCalories = Math.round(actualCalories);
    actualProtein = Math.round(actualProtein);
    actualCarbs = Math.round(actualCarbs);
    actualFats = Math.round(actualFats);

    console.log(`Generated meal plan totals (before adjustment): Cal=${actualCalories}, P=${actualProtein}g, C=${actualCarbs}g, F=${actualFats}g`);

    // ── STEP 5b: PRECISION MICRO-ADJUSTMENT (same logic as generator) ──
    // Apply remaining macro differences to last meal
    const pError = targetProtein - actualProtein;
    const cError = targetCarbs - actualCarbs;
    const fError = targetFats - actualFats;

    if (Math.abs(pError) > 0.05 || Math.abs(cError) > 0.05 || Math.abs(fError) > 0.05) {
      const mealsArray = Object.values(newMealPlanResult.meals);
      const lastMeal = mealsArray[mealsArray.length - 1];
      
      if (lastMeal) {
        // Adjust ONLY macros on last meal
        lastMeal.totals.protein_g = Math.round((lastMeal.totals.protein_g + pError) * 10) / 10;
        lastMeal.totals.carbs_g = Math.round((lastMeal.totals.carbs_g + cError) * 10) / 10;
        lastMeal.totals.fats_g = Math.round((lastMeal.totals.fats_g + fError) * 10) / 10;

        // Recalculate calories from adjusted macros
        lastMeal.totals.calories = Math.round(
          lastMeal.totals.protein_g * 4 +
          lastMeal.totals.carbs_g * 4 +
          lastMeal.totals.fats_g * 9
        );
      }

      // Safety floor: prevent negative macros
      Object.values(newMealPlanResult.meals).forEach(meal => {
        meal.foods.forEach(food => {
          if (food.protein_g < 0) food.protein_g = 0;
          if (food.carbs_g < 0) food.carbs_g = 0;
          if (food.fats_g < 0) food.fats_g = 0;
          if (food.calories < 0) food.calories = 0;
        });

        // Recalculate meal totals
        meal.totals.protein_g = Math.max(0, meal.totals.protein_g);
        meal.totals.carbs_g = Math.max(0, meal.totals.carbs_g);
        meal.totals.fats_g = Math.max(0, meal.totals.fats_g);
        meal.totals.calories = Math.max(100, meal.totals.calories);
      });
    }

    // Recalculate actuals after adjustment
    actualCalories = 0;
    actualProtein = 0;
    actualCarbs = 0;
    actualFats = 0;

    Object.values(newMealPlanResult.meals).forEach(meal => {
      if (meal.totals) {
        actualCalories += meal.totals.calories || 0;
        actualProtein += meal.totals.protein_g || 0;
        actualCarbs += meal.totals.carbs_g || 0;
        actualFats += meal.totals.fats_g || 0;
      }
    });

    console.log(`Generated meal plan totals (after micro-adjustment): Cal=${Math.round(actualCalories)}, P=${actualProtein.toFixed(1)}g, C=${actualCarbs.toFixed(1)}g, F=${actualFats.toFixed(1)}g`);
    console.log(`Target vs Actual: Cal=${targetCalories} vs ${Math.round(actualCalories)} | P=${targetProtein} vs ${actualProtein.toFixed(1)}g | C=${targetCarbs} vs ${actualCarbs.toFixed(1)}g | F=${targetFats} vs ${actualFats.toFixed(1)}g`);

    // ── STEP 6: Update client record ──────────────────────────────────────
    const now = new Date();
const nextChangeDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

const { error: updateError } = await supabase
  .from('clients')
  .update({
    meals_per_day: newMeals,
    meal_pattern: newPattern, // ✅ Update to resolved pattern
    last_frequency_change_date: now.toISOString(),
    can_change_frequency_at: nextChangeDate.toISOString(),
  })
  .eq('id', clientId);

if (updateError) {
  console.error('Error updating client:', updateError);
  return NextResponse.json(
    { error: 'Failed to update client' },
    { status: 500 }
  );
}


    // ── STEP 7: Update meal plan — keep ORIGINAL daily targets! ──────────
    // IMPORTANT: Store the ORIGINAL targets (not the actual generated totals)
    // This ensures meal swaps work from the correct baseline
    
    const { error: mealPlanError } = await supabase
      .from('meal_plans')
      .update({
        meals_data: newMealPlanResult,
        meal_pattern: newPattern, // ✅ Update to resolved pattern
        target_calories: targetCalories,
        target_protein_g: targetProtein,
        target_carbs_g: targetCarbs,
        target_fats_g: targetFats,
        status: 'approved',
        updated_at: now.toISOString(),
      })
      .eq('client_id', clientId);

    if (mealPlanError) {
      console.error('Error updating meal plan:', mealPlanError);
      return NextResponse.json(
        { error: 'Failed to save meal plan' },
        { status: 500 }
      );
    }

    // ── STEP 8: Log the frequency change ──────────────────────────────────
    await supabase
      .from('frequency_change_log')
      .insert({
        client_id: clientId,
        old_meals_per_day: client.meals_per_day,
        new_meals_per_day: newMeals,
      });

    // ── STEP 9: Generate PDF ──────────────────────────────────────────────
    let pdfBuffer = null;
    try {
      pdfBuffer = await generateMealPlanPDF(client.full_name, newMealPlanResult, {
        calories: targetCalories,
        protein: targetProtein,
        carbs: targetCarbs,
        fats: targetFats,
      });
    } catch (pdfError) {
      console.error('PDF generation error:', pdfError);
    }

    return NextResponse.json(
      {
        success: true,
        message: `Meal plan updated! Changed from ${client.meals_per_day} to ${newMeals} meals per day.`,
        newMealsPerDay: newMeals,
        newPattern: newPattern,
        nextChangeDate,
        newMealPlan: newMealPlanResult,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in change-meal-frequency:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * Generate meal plan PDF
 */
async function generateMealPlanPDF(clientName, mealsData, macroTargets) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'letter',
      margin: 40,
    });

    const chunks = [];
    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // Header
    doc.fontSize(24).font('Helvetica-Bold').text('Your Custom Meal Plan', { align: 'center' });
    doc.fontSize(12).font('Helvetica').text(clientName, { align: 'center' });
    doc.moveDown(0.5);

    // Macros summary
    doc.fontSize(11).font('Helvetica-Bold').text('Daily Targets', { underline: true });
    doc.fontSize(10).font('Helvetica')
      .text(`Protein: ${macroTargets.protein}g | Carbs: ${macroTargets.carbs}g | Fats: ${macroTargets.fats}g | Calories: ${macroTargets.calories}`);
    doc.moveDown(0.8);

    // Meals
    const meals = mealsData.meals || {};
    Object.entries(meals).forEach(([mealName, mealData]) => {
      doc.fontSize(12).font('Helvetica-Bold').text(mealName);
      
      if (mealData.foods && Array.isArray(mealData.foods)) {
        mealData.foods.forEach(food => {
          doc.fontSize(9).font('Helvetica')
            .text(`• ${food.name} — ${food.portion}`, { marginLeft: 20 });
        });
      }

      if (mealData.totals) {
        const { calories, protein_g, carbs_g, fats_g } = mealData.totals;
        doc.fontSize(9).font('Helvetica-Bold').text(
          `Cal: ${calories} | P: ${protein_g}g | C: ${carbs_g}g | F: ${fats_g}g`,
          { marginLeft: 20, color: '#FFD700' }
        );
      }

      doc.moveDown(0.5);
    });

    doc.end();
  });
}
