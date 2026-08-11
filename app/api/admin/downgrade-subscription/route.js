import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Map plan to Stripe price ID
const STRIPE_PRICE_IDS = {
  kickstart: process.env.STRIPE_KICKSTART_PRICE_ID,
  pro: process.env.STRIPE_PRO_PRICE_ID,
  elite: process.env.STRIPE_ELITE_PRICE_ID,
};

// Define valid downgrade paths
const VALID_DOWNGRADES = {
  elite: ['pro'], // Elite can only downgrade to Pro
  pro: [], // Pro cannot downgrade to anything (Kickstart is one-time only)
};

export async function POST(request) {
  try {
    const { clientId, newPlan } = await request.json();

    if (!clientId || !newPlan) {
      return Response.json({ error: 'Missing clientId or newPlan' }, { status: 400 });
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
      return Response.json({ error: 'Client has no subscription' }, { status: 400 });
    }

    // Validate downgrade path
    const currentPlan = client.plan_type?.toLowerCase() || 'pro';
    const validDowngrades = VALID_DOWNGRADES[currentPlan] || [];

    if (!validDowngrades.includes(newPlan)) {
      return Response.json(
        { 
          error: `Cannot downgrade from ${currentPlan} to ${newPlan}. Valid options: ${validDowngrades.length ? validDowngrades.join(', ') : 'none (already lowest tier)'}` 
        },
        { status: 400 }
      );
    }

    const newPriceId = STRIPE_PRICE_IDS[newPlan];
    if (!newPriceId) {
      return Response.json({ error: 'Invalid plan price ID' }, { status: 400 });
    }

    // Update subscription in Stripe
    const subscription = await stripe.subscriptions.retrieve(client.stripe_subscription_id);
    
    await stripe.subscriptions.update(client.stripe_subscription_id, {
      items: [
        {
          id: subscription.items.data[0].id,
          price: newPriceId,
        },
      ],
      proration_behavior: 'create_prorations',
    });

    // Update client in DB
    await supabase
      .from('clients')
      .update({
        plan_type: newPlan,
        subscription_tier: newPlan,
      })
      .eq('id', clientId);

    console.log(`✅ Downgraded ${client.full_name} from ${currentPlan} to ${newPlan}`);

    return Response.json({
      success: true,
      message: `Downgraded to ${newPlan}`,
    });
  } catch (error) {
    console.error('Downgrade subscription error:', error);
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
