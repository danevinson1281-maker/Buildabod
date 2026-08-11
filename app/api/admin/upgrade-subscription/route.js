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

// Define valid upgrade paths
const VALID_UPGRADES = {
  kickstart: ['pro', 'elite'],
  pro: ['elite'],
  elite: [],
};

export async function POST(request) {
  try {
    const { clientId, newPlan } = await request.json();

    if (!clientId || !newPlan) {
      return Response.json({ error: 'Missing clientId or newPlan' }, { status: 400 });
    }

    if (!['pro', 'elite'].includes(newPlan)) {
      return Response.json({ error: 'Invalid plan type. Must be pro or elite.' }, { status: 400 });
    }

    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('id, email, full_name, stripe_subscription_id, plan_type')
      .eq('id', clientId)
      .single();

    if (clientError || !client) {
      return Response.json({ error: 'Client not found' }, { status: 404 });
    }

    // Validate upgrade path
    const currentPlan = client.plan_type?.toLowerCase() || 'kickstart';
    const validUpgrades = VALID_UPGRADES[currentPlan] || [];

    if (!validUpgrades.includes(newPlan)) {
      return Response.json(
        { error: `Cannot upgrade from ${currentPlan} to ${newPlan}. Valid options: ${validUpgrades.length ? validUpgrades.join(', ') : 'none (already highest tier)'}` },
        { status: 400 }
      );
    }

    const newPriceId = STRIPE_PRICE_IDS[newPlan];
    if (!newPriceId) {
      return Response.json({ error: 'Invalid plan price ID' }, { status: 400 });
    }

    // If client has a Stripe subscription, update it
    if (client.stripe_subscription_id) {
      try {
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

        console.log(`💳 Stripe subscription updated: ${currentPlan} → ${newPlan}`);
      } catch (stripeError) {
        console.error('Stripe update error:', stripeError);
        return Response.json(
          { error: 'Failed to update Stripe subscription: ' + stripeError.message },
          { status: 500 }
        );
      }
    } else {
      // Kickstart clients don't have a subscription yet
      // They need to go through checkout for the new plan
      console.log(`ℹ️ No Stripe subscription for ${client.full_name} (${currentPlan}). DB updated only.`);
    }

    // Update client in DB
    const { error: updateError } = await supabase
      .from('clients')
      .update({
        plan_type: newPlan,
        subscription_tier: newPlan,
        updated_at: new Date().toISOString(),
      })
      .eq('id', clientId);

    if (updateError) {
      console.error('DB update error:', updateError);
      return Response.json(
        { error: 'Failed to update client record', details: updateError.message },
        { status: 500 }
      );
    }

    console.log(`✅ Upgraded ${client.full_name} from ${currentPlan} to ${newPlan}`);

    return Response.json({
      success: true,
      message: `Upgraded to ${newPlan}`,
      stripeUpdated: !!client.stripe_subscription_id,
    });
  } catch (error) {
    console.error('Upgrade subscription error:', error);
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
