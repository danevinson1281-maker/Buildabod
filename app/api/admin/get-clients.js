import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get all approved clients with their latest meal plan info
    const { data: clients, error } = await supabase
      .from('clients')
      .select(`
        id,
        full_name,
        email,
        phone,
        age,
        gender,
        current_weight,
        goal_weight,
        plan_type,
        subscription_tier,
        created_at,
        last_plan_updated_at,
        meal_plans (
          id,
          daily_calories,
          daily_protein,
          daily_carbs,
          daily_fats,
          created_at,
          status
        )
      `)
      .eq('payment_status', 'completed')
      .eq('meal_plans.status', 'approved')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Transform data for frontend
    const transformedClients = clients.map(client => ({
      id: client.id,
      fullName: client.full_name,
      email: client.email,
      phone: client.phone,
      age: client.age,
      gender: client.gender,
      currentWeight: client.current_weight,
      goalWeight: client.goal_weight,
      planType: client.plan_type,
      subscriptionTier: client.subscription_tier,
      lbsToLose: client.current_weight - client.goal_weight,
      mealPlanApprovedAt: client.meal_plans?.[0]?.created_at || null,
      lastPlanUpdatedAt: client.last_plan_updated_at,
      joinedDate: client.created_at
    }));

    return res.status(200).json(transformedClients);
  } catch (error) {
    console.error('Error fetching clients:', error);
    return res.status(500).json({ error: error.message });
  }
}
