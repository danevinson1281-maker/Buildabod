import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  try {
    const { clientId, reason } = await request.json();

    if (!clientId) {
      return Response.json({ error: 'Missing clientId' }, { status: 400 });
    }

    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('id, email, full_name, stripe_subscription_id')
      .eq('id', clientId)
      .single();

    if (clientError || !client) {
      return Response.json({ error: 'Client not found' }, { status: 404 });
    }

    if (!client.stripe_subscription_id) {
      return Response.json({ error: 'Client has no subscription' }, { status: 400 });
    }

    // Cancel subscription in Stripe (correct method)
    await stripe.subscriptions.cancel(client.stripe_subscription_id);

    // Update client in DB
    await supabase
      .from('clients')
      .update({
        subscription_status: 'canceled',
        subscription_canceled_at: new Date().toISOString(),
        admin_notes: (reason || '').substring(0, 500),
      })
      .eq('id', clientId);

    console.log(`✅ Canceled subscription for ${client.full_name}`);

    return Response.json({
      success: true,
      message: 'Subscription canceled',
    });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
