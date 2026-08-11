import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET(request, { params }) {
  const { clientId } = await params;

  if (!clientId) {
    return Response.json({ error: 'Client ID required' }, { status: 400 });
  }

  try {
    console.log('🍽️ Fetching meal plan for client:', clientId);

    const { data: mealPlan, error } = await supabase
      .from('meal_plans')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    if (!mealPlan) {
      console.log('⚠️ No meal plan found');
      return Response.json({ mealPlan: null });
    }

    console.log('✅ Meal plan found');
    return Response.json({ mealPlan });
  } catch (error) {
    console.error('❌ Error fetching meal plan:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
