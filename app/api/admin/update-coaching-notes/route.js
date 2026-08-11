import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  try {
    const { clientId, notes } = await request.json();

    if (!clientId || notes === undefined) {
      return Response.json(
        { error: 'Client ID and notes required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('clients')
      .update({
        coaching_notes: notes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', clientId);

    if (error) throw error;

    return Response.json({ success: true });
  } catch (error) {
    console.error('Error updating coaching notes:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
