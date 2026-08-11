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
    console.log('📋 Fetching plan history for client:', clientId);

    const { data: history, error } = await supabase
      .from('meal_plan_history')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });

    if (error && error.code !== 'PGRST116') throw error;

    console.log('✅ History found:', history?.length || 0, 'records');
    return Response.json({ history: history || [] });
  } catch (error) {
    console.error('❌ Error fetching history:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
