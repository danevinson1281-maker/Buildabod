// app/api/admin/update-macros/[clientId]/route.js

import { createClient } from '@supabase/supabase-js';
import { generateMealPlan } from '@/lib/mealPlanGenerator';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request, { params }) {
  const { clientId } = await params;

  if (!clientId) {
    return Response.json({ error: 'Client ID required' }, { status: 400 });
  }

  try {
    console.log('=== UPDATE MACROS & REGENERATE MEALS ===');
    console.log('clientId:', clientId);

    const macroData = await request.json();
    console.log('New macros received:', macroData);

    // ── Get client data ───────────────────────────────────────────────────
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .single();

    if (clientError || !client) {
      console.error('Client not found:', clientError);
      return Response.json({ error: 'Client not found' }, { status: 404 });
    }

    console.log('✅ Client found:', client.full_name);

    // ── Get current meal plan ─────────────────────────────────────────────
    const { data: mealPlan, error: fetchError } = await supabase
      .from('meal_plans')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

    if (!mealPlan) {
      return Response.json({ error: 'No meal plan found' }, { status: 404 });
    }

    console.log('✅ Current meal plan found');

    // ── Parse new macros ─────────────────────────────────────────────────
    const newCalories = Math.round(macroData.daily_calories) || 0;
    const newProtein = Math.round(macroData.daily_protein_g) || 0;
    const newCarbs = Math.round(macroData.daily_carbs_g) || 0;
    const newFats = Math.round(macroData.daily_fats_g) || 0;

    console.log('📊 New macro targets:', {
      calories: newCalories,
      protein: newProtein,
      carbs: newCarbs,
      fats: newFats,
    });

    // ── Get selected foods for regeneration ───────────────────────────────
    let selectedFoods = [];
    if (client.selected_foods) {
      try {
        selectedFoods = typeof client.selected_foods === 'string'
          ? JSON.parse(client.selected_foods)
          : client.selected_foods;
      } catch (e) {
        console.warn('Could not parse selected_foods:', e);
        selectedFoods = [];
      }
    }

    console.log('🥗 Selected foods:', selectedFoods.length);

    // ── Get allergies ────────────────────────────────────────────────────
    let allergies = [];
    if (client.allergies) {
      try {
        allergies = typeof client.allergies === 'string'
          ? JSON.parse(client.allergies)
          : client.allergies || [];
      } catch (e) {
        allergies = [];
      }
    }

    // ── REGENERATE MEAL PLAN WITH NEW MACROS ──────────────────────────────
    console.log('🔄 Regenerating meals with new macros...');

    let newMealsData;
    try {
      newMealsData = await generateMealPlan({
        fullName: client.full_name,
        currentWeight: parseInt(client.current_weight) || 0,
        height: parseInt(client.height_inches) || 0,
        age: parseInt(client.age) || 0,
        gender: client.gender || 'male',
        primaryGoal: client.primary_goal,
        activityLevel: client.activity_level,
        selectedFoods: selectedFoods,
        mealsPerDay: parseInt(client.meals_per_day) || 3,
        dietaryType: client.dietary_restrictions || 'omnivore',
        allergies: allergies,
        mealVariety: client.meal_variety || 'mix',
        // CRITICAL: Pass new macro targets to generator
        targetCalories: newCalories,
        targetProtein: newProtein,
        targetCarbs: newCarbs,
        targetFats: newFats,
      });

      console.log('✅ New meals generated');
    } catch (genError) {
      console.error('❌ Meal generation error:', genError);
      throw new Error('Failed to generate meals: ' + genError.message);
    }

    // ── SCALE MEALS TO HIT EXACT TARGETS ──────────────────────────────────
    // Calculate actual totals
    let actualCal = 0, actualP = 0, actualC = 0, actualF = 0;
    Object.values(newMealsData.meals).forEach(m => {
      actualCal += m.totals.calories;
      actualP += m.totals.protein_g;
      actualC += m.totals.carbs_g;
      actualF += m.totals.fats_g;
    });

    console.log('Before scaling:', { actualCal, actualP, actualC, actualF });
    console.log('Target totals:', { newCalories, newProtein, newCarbs, newFats });

    // Scale ALL foods proportionally to hit exact targets
    const scaleP = actualP > 0 ? newProtein / actualP : 1;
    const scaleC = actualC > 0 ? newCarbs / actualC : 1;
    const scaleF = actualF > 0 ? newFats / actualF : 1;

    Object.keys(newMealsData.meals).forEach(mealName => {
      const meal = newMealsData.meals[mealName];
      meal.foods.forEach(food => {
        food.protein_g = Math.round(food.protein_g * scaleP * 100) / 100;
        food.carbs_g = Math.round(food.carbs_g * scaleC * 100) / 100;
        food.fats_g = Math.round(food.fats_g * scaleF * 100) / 100;
        food.calories = Math.round(food.protein_g * 4 + food.carbs_g * 4 + food.fats_g * 9);
      });
      meal.totals.protein_g = Math.round(meal.foods.reduce((s, f) => s + f.protein_g, 0) * 10) / 10;
      meal.totals.carbs_g = Math.round(meal.foods.reduce((s, f) => s + f.carbs_g, 0) * 10) / 10;
      meal.totals.fats_g = Math.round(meal.foods.reduce((s, f) => s + f.fats_g, 0) * 10) / 10;
      meal.totals.calories = Math.round(meal.foods.reduce((s, f) => s + f.calories, 0));
    });

    // Verify final totals
    let finalCal = 0, finalP = 0, finalC = 0, finalF = 0;
    Object.values(newMealsData.meals).forEach(m => {
      finalCal += m.totals.calories;
      finalP += m.totals.protein_g;
      finalC += m.totals.carbs_g;
      finalF += m.totals.fats_g;
    });

    console.log('AFTER SCALING:', { finalCal, finalP, finalC, finalF });

    // ── Update meal_plans with NEW MACROS and SCALED MEALS ────────────────
    const { error: updateError } = await supabase
      .from('meal_plans')
      .update({
        target_calories: newCalories,
        target_protein_g: newProtein,
        target_carbs_g: newCarbs,
        target_fats_g: newFats,
        meals_data: newMealsData,
        status: 'pending_review',
        updated_at: new Date().toISOString(),
      })
      .eq('id', mealPlan.id);

    if (updateError) {
      console.error('❌ Meal plan update error:', updateError);
      throw updateError;
    }

    console.log('✅ Meal plan updated with scaled meals');

    // ── Record in plan history ────────────────────────────────────────────
    const { error: historyError } = await supabase
      .from('meal_plan_history')
      .insert([{
        client_id: clientId,
        meal_plan_id: mealPlan.id,
        meals: newMealsData.meals,
        substitutions: newMealsData.substitutions || {},
        daily_calories: finalCal,
        daily_protein: finalP,
        daily_carbs: finalC,
        daily_fats: finalF,
        action_type: 'macro_updated',
        admin_notes: 'Macros edited: ' + newProtein + 'g P, ' + newCarbs + 'g C, ' + newFats + 'g F',
        status: 'active',
      }]);

    if (historyError) {
      console.warn('⚠️ History insert warning:', historyError);
    } else {
      console.log('✅ History recorded');
    }

    // ── Update client last_plan_updated_at ────────────────────────────────
    await supabase
      .from('clients')
      .update({ last_plan_updated_at: new Date().toISOString() })
      .eq('id', clientId);

    console.log('✅ All updates complete!');

    return Response.json({
      success: true,
      message: 'Macros updated and meals scaled to hit exact targets',
      finalTotals: { finalCal, finalP, finalC, finalF },
    });
  } catch (error) {
    console.error('❌ Error updating macros:', error.message);
    return Response.json(
      { error: error.message || 'Failed to update macros' },
      { status: 500 }
    );
  }
}
