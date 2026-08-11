import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  try {
    const { clientId } = await request.json();

    if (!clientId) {
      return Response.json(
        { error: 'clientId is required' },
        { status: 400 }
      );
    }

    console.log('🔍 Resuming subscription for clientId:', clientId);

    // Fetch current subscription first
    const { data: client, error: fetchError } = await supabase
      .from('clients')
      .select('id, full_name, subscription_status')
      .eq('id', clientId)
      .single();

    if (fetchError || !client) {
      console.error('❌ Client not found:', fetchError);
      return Response.json(
        { error: 'Client not found', details: fetchError?.message },
        { status: 404 }
      );
    }

    console.log('✅ Client found:', client.full_name);

    // Resume subscription
    const { data, error } = await supabase
      .from('clients')
      .update({
        subscription_status: 'active',
        subscription_paused_until: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', clientId)
      .select()
      .single();

    if (error) {
      console.error('❌ Update error:', error);
      return Response.json(
        { error: 'Failed to resume subscription', details: error.message },
        { status: 500 }
      );
    }

    console.log('✅ Subscription resumed for:', client.full_name);

    return Response.json({
      success: true,
      message: 'Subscription resumed',
      client: data,
    });
  } catch (error) {
    console.error('❌ Resume error:', error);
    return Response.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
