import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  try {
    const { clientId, months } = await request.json();

    if (!clientId || !months) {
      return Response.json({ error: 'Missing clientId or months' }, { status: 400 });
    }

    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('id, email, full_name, stripe_subscription_id, plan_type')
      .eq('id', clientId)
      .single();

    if (clientError || !client) {
      return Response.json({ error: 'Client not found' }, { status: 404 });
    }

    if (!client.stripe_subscription_id) {
      return Response.json({ error: 'Client has no active subscription' }, { status: 400 });
    }

    // Calculate pause until date
    const pauseUntil = new Date();
    pauseUntil.setMonth(pauseUntil.getMonth() + months);

    // Pause subscription in Stripe
    await stripe.subscriptions.update(client.stripe_subscription_id, {
      pause_collection: {
        behavior: 'mark_uncollectible',
      },
    });

    // Update client in DB
    await supabase
      .from('clients')
      .update({
        subscription_status: 'paused',
        subscription_paused_until: pauseUntil.toISOString(),
      })
      .eq('id', clientId);

    console.log(`✅ Paused subscription for ${client.full_name} until ${pauseUntil.toLocaleDateString()}`);

    return Response.json({
      success: true,
      message: `Subscription paused until ${pauseUntil.toLocaleDateString()}`,
    });
  } catch (error) {
    console.error('Pause subscription error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
