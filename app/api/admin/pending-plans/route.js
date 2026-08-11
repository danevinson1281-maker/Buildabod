// app/api/admin/pending-plans/route.js

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET(request) {
  try {
    // Get all pending plans with client details
    const { data: pendingPlans, error: plansError } = await supabase
      .from('meal_plans')
      .select(`
        id,
        client_id,
        created_at,
        daily_calories,
        daily_protein,
        daily_carbs,
        daily_fats,
        clients (
          id,
          full_name,
          email,
          age,
          gender,
          current_weight,
          goal_weight,
          primary_goal,
          activity_level
        )
      `)
      .eq('status', 'pending_review')
      .order('created_at', { ascending: false });

    if (plansError) {
      console.error('Error fetching pending plans:', plansError);
      return new Response(
        JSON.stringify({ error: 'Failed to load plans' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Format response
    const formattedPlans = pendingPlans.map((plan) => ({
      client_id: plan.client_id,
      client_name: plan.clients?.full_name || 'Unknown',
      email: plan.clients?.email,
      age: plan.clients?.age,
      gender: plan.clients?.gender,
      current_weight: plan.clients?.current_weight,
      goal_weight: plan.clients?.goal_weight,
      primary_goal: plan.clients?.primary_goal,
      activity_level: plan.clients?.activity_level,
      daily_calories: plan.daily_calories,
      daily_protein: plan.daily_protein,
      daily_carbs: plan.daily_carbs,
      daily_fats: plan.daily_fats,
      created_at: plan.created_at,
    }));

    return new Response(
      JSON.stringify({ plans: formattedPlans }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in pending-plans route:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
