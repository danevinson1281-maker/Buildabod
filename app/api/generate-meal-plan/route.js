// app/api/generate-meal-plan/route.js

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import { generateMealPlan } from '@/lib/mealPlanGenerator';
import { calculateMacros } from '@/lib/macroCalculator';

export async function POST(request) {
  try {
    const body = await request.json();
    const { clientId, clientData, planType, macros: adminMacros } = body;

    console.log('🔄 Generating meal plan for client:', clientId);

    if (!clientId || !clientData) {
      return NextResponse.json({ error: 'Missing clientId or clientData' }, { status: 400 });
    }

    const supabaseUrl            = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
// ── ALWAYS fetch client from database (for meal_pattern fallback) ──────
let clientRecord = null;
try {
  const { data } = await supabase
    .from('clients')
    .select('target_calories, target_protein_g, target_carbs_g, target_fats_g, meal_pattern, meals_per_day')
    .eq('id', clientId)
    .single();
  clientRecord = data;
} catch (e) {
  console.warn('Could not fetch client record:', e);
}
    // ── Resolve macros ────────────────────────────────────────────────────
    let targetCalories, targetProtein, targetCarbs, targetFats;

    // FIRST: Check if admin provided macros
    if (adminMacros && adminMacros.daily_calories) {
      targetCalories = Math.round(adminMacros.daily_calories);
      targetProtein = Math.round(adminMacros.daily_protein);
      targetCarbs = Math.round(adminMacros.daily_carbs);
      targetFats = Math.round(adminMacros.daily_fats);
      console.log('✅ Using admin-provided macros:', { targetCalories, targetProtein, targetCarbs, targetFats });
    } 
    // SECOND: Try to get from database if client already exists
    else if (clientId) {
      const { data: existingClient, error: clientFetchError } = await supabase
  .from('clients')
  .select('target_calories, target_protein_g, target_carbs_g, target_fats_g, meal_pattern, meals_per_day')
  .eq('id', clientId)
  .single();


      if (existingClient && existingClient.target_calories) {
        targetCalories = Math.round(existingClient.target_calories);
        targetProtein = Math.round(existingClient.target_protein_g);
        targetCarbs = Math.round(existingClient.target_carbs_g);
        targetFats = Math.round(existingClient.target_fats_g);
        console.log('✅ Using macros from database:', { targetCalories, targetProtein, targetCarbs, targetFats });
      } else {
        // FALLBACK: Calculate from client data
        const calculated = calculateMacros(clientData);
        targetCalories = Math.round(calculated.calories || 2000);
        targetProtein = Math.round(calculated.protein || 150);
        targetCarbs = Math.round(calculated.carbs || 200);
        targetFats = Math.round(calculated.fats || 65);
        console.log('✅ Calculated macros from client data:', { targetCalories, targetProtein, targetCarbs, targetFats });
      }
    } else {
      // FINAL FALLBACK: Use hardcoded defaults
      targetCalories = 2000;
      targetProtein = 150;
      targetCarbs = 200;
      targetFats = 65;
      console.log('⚠️ Using default macros:', { targetCalories, targetProtein, targetCarbs, targetFats });
    }

    // VERIFY MACROS ARE VALID
    if (!targetCalories || !targetProtein || !targetCarbs || !targetFats) {
      console.error('❌ CRITICAL: Invalid macros:', { targetCalories, targetProtein, targetCarbs, targetFats });
      return NextResponse.json({ 
        error: 'Failed to resolve macro targets',
        received: { targetCalories, targetProtein, targetCarbs, targetFats }
      }, { status: 400 });
    }

    const selectedFoods = clientData.selectedFoods || [];
    const mealsPerDay   = clientData.mealsPerDay   || '4';
    const mealVariety   = clientData.mealVariety   || 'mix';
    const dietaryType   = clientData.dietaryType   || 'omnivore';
    const allergies     = clientData.allergies     || [];

    console.log('🍽️  Meal plan config:', {
      foods: selectedFoods.length,
      mealsPerDay,
      mealVariety,
      dietaryType,
      allergies,
      targetCalories,
      targetProtein,
      targetCarbs,
      targetFats,
    });

       // ── Resolve meal pattern ──────────────────────────────────────────────
const resolvedPattern = body.meal_pattern || clientData.mealPattern || clientData.meal_pattern || (clientRecord && clientRecord.meal_pattern) || 'balanced';
console.log('🎯 RESOLVED meal_pattern:', resolvedPattern, {
  fromBody: body.meal_pattern,
  fromClientDataCamel: clientData.mealPattern,
  fromClientDataSnake: clientData.meal_pattern,
  fromDatabase: clientRecord?.meal_pattern,
});

// ── Generate meal plan ─────────────────────────────────────────────
const mealPlan = generateMealPlan({
  selectedFoods: selectedFoods,
  fullName: clientData.full_name || clientData.fullName || 'Client',
  mealsPerDay: mealsPerDay,
  mealVariety: mealVariety,
  dietaryType: dietaryType,
  allergies: allergies,
  targetCalories,
  targetProtein,
  targetCarbs,
  targetFats,
  mealPattern: resolvedPattern,
});




    console.log('✅ Meal plan generated successfully');

    if (!mealPlan.meals) {
      throw new Error('Generator returned invalid meal plan structure');
    }

    console.log('🍴 Generated meals:', Object.keys(mealPlan.meals).length);

    // ── Check if plan already exists ──────────────────────────────────────
    const { data: existingPlans } = await supabase
      .from('meal_plans')
      .select('id, target_calories, target_protein_g, target_carbs_g, target_fats_g, meals_data')
      .eq('client_id', clientId)
      .limit(1);

    const isRegeneration = existingPlans && existingPlans.length > 0;
    let savedMealPlan = null;

    if (isRegeneration) {
      const oldPlan = existingPlans[0];
      console.log('📚 Recording old plan in history...');

      const oldMealsData = oldPlan.meals_data || {};
      const oldSubstitutions = oldMealsData.substitutions || {};
      const oldMeals = oldMealsData.meals || oldMealsData;

      await supabase.from('meal_plan_history').insert([{
        client_id: clientId,
        meal_plan_id: oldPlan.id,
        meals: oldMeals,
        substitutions: oldSubstitutions,
        daily_calories: oldPlan.target_calories || 0,
        daily_protein: oldPlan.target_protein_g || 0,
        daily_carbs: oldPlan.target_carbs_g || 0,
        daily_fats: oldPlan.target_fats_g || 0,
        action_type: 'regenerated',
        admin_notes: 'Plan regenerated by admin',
        status: 'archived',
      }]);

      console.log('✅ Old plan archived');

      const { data: updatedPlan, error: updateError } = await supabase
  .from('meal_plans')
  .update({
    plan_name: clientData.fullName + "'s Custom Plan",
    target_calories: targetCalories,
    target_protein_g: targetProtein,
    target_carbs_g: targetCarbs,
    target_fats_g: targetFats,
meal_pattern: resolvedPattern,

    meals_data: mealPlan,
    status: 'pending_review',
    updated_at: new Date().toISOString(),
  })
  .eq('client_id', clientId)
  .select()
  .single();


      if (updateError) {
        console.error('❌ Update error:', updateError);
        throw updateError;
      }

      savedMealPlan = updatedPlan;
      console.log('✅ Meal plan updated:', savedMealPlan.id);

    } else {
      console.log('📝 Creating new meal plan...');

      const { data: mealPlanData, error: mealPlanError } = await supabase
  .from('meal_plans')
  .insert([{
    client_id: clientId,
    plan_name: clientData.fullName + "'s Custom Plan",
    target_calories: targetCalories,
    target_protein_g: targetProtein,
    target_carbs_g: targetCarbs,
    target_fats_g: targetFats,
meal_pattern: resolvedPattern,

    meals_data: mealPlan,
    status: 'pending_review',
  }])
  .select()
  .single();


      if (mealPlanError) {
        console.error('❌ Insert error:', mealPlanError);
        throw mealPlanError;
      }

      savedMealPlan = mealPlanData;
      console.log('✅ New meal plan created:', savedMealPlan.id);
    }

    // ── Save macro targets ────────────────────────────────────────────────
    await supabase.from('macro_targets').delete().eq('client_id', clientId);

    await supabase
      .from('macro_targets')
      .insert([{
        client_id: clientId,
        weight_lbs: clientData.currentWeight || 200,
        height_inches: clientData.height_inches || clientData.height || 70,
        activity_level: clientData.activityLevel || 'moderately-active',
        goal_type: clientData.primaryGoal || 'fat-loss',
        daily_calories: targetCalories,
        daily_protein_g: targetProtein,
        daily_carbs_g: targetCarbs,
        daily_fats_g: targetFats,
      }]);

    // ── Update client record ──────────────────────────────────────────────
    await supabase
      .from('clients')
      .update({
        target_calories: targetCalories,
        target_protein_g: targetProtein,
        target_carbs_g: targetCarbs,
        target_fats_g: targetFats,
        last_plan_updated_at: new Date().toISOString(),
      })
      .eq('id', clientId);

    console.log('✅ Client record updated');

    // ── Pre-generate magic link token ─────────────────────────────────────
    try {
      await supabase.from('magic_link_tokens').delete().eq('client_id', clientId);

      const token = crypto.randomBytes(32).toString('hex');
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + 7);

      await supabase.from('magic_link_tokens').insert({
        client_id: clientId,
        token: token,
        expires_at: expiry.toISOString(),
      });

      console.log('🔑 Magic link token pre-generated (7 days)');
    } catch (tokenErr) {
      console.log('⚠️ Token error (non-blocking):', tokenErr);
    }

    console.log('✅ PLAN SAVED - Status: pending_review');

    return NextResponse.json({
      success: true,
      message: 'Meal plan generated and awaiting admin approval',
      mealPlanId: savedMealPlan ? savedMealPlan.id : null,
      status: 'pending_review',
      macros: {
        calories: targetCalories,
        protein: targetProtein,
        carbs: targetCarbs,
        fats: targetFats,
      },
    });

  } catch (error) {
    console.error('❌ MEAL PLAN GENERATION ERROR:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate meal plan' },
      { status: 500 }
    );
  }
}
