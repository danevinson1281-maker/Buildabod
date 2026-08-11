import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  try {
    const { clientId, weight_lbs, notes } = await request.json();

    if (!clientId || !weight_lbs) {
      return Response.json({ error: 'Missing clientId or weight' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('weight_logs')
      .insert([{
        client_id: clientId,
        weight_lbs: parseFloat(weight_lbs),
        notes: notes || null,
      }])
      .select()
      .single();

    if (error) throw error;

    return Response.json({ success: true, log: data });
  } catch (error) {
    console.error('Error logging weight:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');

    if (!clientId) {
      return Response.json({ error: 'Missing clientId' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('weight_logs')
      .select('*')
      .eq('client_id', clientId)
      .order('logged_at', { ascending: true });

    if (error) throw error;

    return Response.json({ success: true, logs: data || [] });
  } catch (error) {
    console.error('Error fetching weight logs:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
