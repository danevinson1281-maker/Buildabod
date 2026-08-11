import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');

    if (!clientId) {
      return Response.json({ error: 'Missing clientId' }, { status: 400 });
    }

    console.log('=== GET CLIENT MEAL PLAN ===');
    console.log('clientId:', clientId);

    // ── Get client ────────────────────────────────────────────────────────
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .single();

    if (clientError || !client) {
      console.error('Client not found:', clientError);
      return Response.json({ error: 'Client not found' }, { status: 404 });
    }

    console.log('Client found:', client.full_name);

    // ── Get meal plan — ONLY APPROVED STATUS ──────────────────────────────
    const { data: mealPlanArray, error: mealError } = await supabase
      .from('meal_plans')
      .select('*')
      .eq('client_id', clientId)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(1);

    if (mealError && mealError.code !== 'PGRST116') {
      throw mealError;
    }

    if (!mealPlanArray || mealPlanArray.length === 0) {
      console.log('No APPROVED meal plan found for client:', clientId);
      return Response.json({
        success: true,
        pending: true,
        mealPlan: null,
        client: {
          id: client.id,
          full_name: client.full_name,
          email: client.email,
          plan_type: client.plan_type,
        },
        error: 'Plan pending admin approval',
      });
    }

    const mealPlanData = mealPlanArray[0];

    console.log('APPROVED Meal plan found:', {
      id: mealPlanData.id,
      status: mealPlanData.status,
      target_calories: mealPlanData.target_calories,
      target_protein_g: mealPlanData.target_protein_g,
      target_carbs_g: mealPlanData.target_carbs_g,
      target_fats_g: mealPlanData.target_fats_g,
    });

    // ── Destructure meals_data
    const rawMealsData = mealPlanData.meals_data || {};

    let mealsOnly = {};
    let substitutionsOnly = {};

    if (rawMealsData.meals && typeof rawMealsData.meals === 'object') {
      mealsOnly = rawMealsData.meals;
      substitutionsOnly = rawMealsData.substitutions || {};
    } else {
      mealsOnly = rawMealsData;
      substitutionsOnly = {};
    }

    console.log('Meals extracted:', Object.keys(mealsOnly).length, 'meals');

    // ── Format response — USE CORRECT FIELD NAMES ──────────────────────────
    const formattedMealPlan = {
      id: mealPlanData.id,
      meals_data: mealsOnly,
      substitutions: substitutionsOnly,
      target_calories: mealPlanData.target_calories || 0,
      target_protein_g: mealPlanData.target_protein_g || 0,
      target_carbs_g: mealPlanData.target_carbs_g || 0,
      target_fats_g: mealPlanData.target_fats_g || 0,
      meal_pattern: mealPlanData.meal_pattern || 'balanced',
      status: mealPlanData.status,
      created_at: mealPlanData.created_at,
      updated_at: mealPlanData.updated_at,
    };

    return Response.json({
      success: true,
      pending: false,
      client: {
  id: client.id,
  full_name: client.full_name,
  email: client.email,
  age: client.age,
  gender: client.gender,
  height_inches: client.height_inches,
  current_weight: client.current_weight,
  goal_weight: client.goal_weight,
  primary_goal: client.primary_goal,
  experience_level: client.experience_level,
  activity_level: client.activity_level,
  plan_type: client.plan_type,
  meal_variety: client.meal_variety || 'mix',
  selected_foods: client.selected_foods,
  subscription_status: client.subscription_status,
  subscription_tier: client.subscription_tier,
  onboarding_complete: client.onboarding_complete,
  tier: client.tier,
},

      mealPlan: formattedMealPlan,
    });
  } catch (error) {
    console.error('Error in get-client-meal-plan:', error.message);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { clientId } = await request.json();
    if (!clientId) {
      return Response.json({ error: 'Missing clientId' }, { status: 400 });
    }
    const url = new URL(request.url);
    url.searchParams.set('clientId', clientId);
    return GET(new Request(url.toString()));
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
