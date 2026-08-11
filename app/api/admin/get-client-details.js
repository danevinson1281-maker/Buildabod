import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { clientId } = req.query;

  if (!clientId) {
    return res.status(400).json({ error: 'Client ID required' });
  }

  try {
    // Get client full details
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .single();

    if (clientError) throw clientError;

    // Get current meal plan
    const { data: mealPlan, error: mealError } = await supabase
      .from('meal_plans')
      .select('*')
      .eq('client_id', clientId)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (mealError && mealError.code !== 'PGRST116') throw mealError;

    // Get plan history
    const { data: history, error: historyError } = await supabase
      .from('meal_plan_history')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });

    if (historyError && historyError.code !== 'PGRST116') throw historyError;

    return res.status(200).json({
      client,
      currentMealPlan: mealPlan || null,
      planHistory: history || []
    });
  } catch (error) {
    console.error('Error fetching client details:', error);
    return res.status(500).json({ error: error.message });
  }
}
