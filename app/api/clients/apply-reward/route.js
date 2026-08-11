import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  try {
    const body = await request.json();
    const { rewardCodeId, clientId } = body;

    if (!rewardCodeId || !clientId) {
      return Response.json(
        { error: 'Missing rewardCodeId or clientId' },
        { status: 400 }
      );
    }

    // Fetch the reward code
    const { data: rewardCode, error: fetchError } = await supabase
      .from('reward_codes')
      .select('*')
      .eq('id', rewardCodeId)
      .single();

    if (fetchError || !rewardCode) {
      return Response.json({ error: 'Reward code not found' }, { status: 404 });
    }

    // Check if already redeemed
    if (rewardCode.status === 'redeemed') {
      return Response.json(
        { error: 'This credit has already been redeemed' },
        { status: 400 }
      );
    }

        // ── LIMIT: 2 CREDITS PER BILLING CYCLE ──────────────────────────
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { data: recentRedemptions } = await supabase
      .from('reward_codes')
      .select('id')
      .eq('redeemed_by_client_id', clientId)
      .gte('redeemed_at', startOfMonth.toISOString());

    if (recentRedemptions && recentRedemptions.length >= 2) {
      return Response.json(
        { error: 'You can apply up to 2 credits per billing cycle. Try again next month!' },
        { status: 400 }
      );
    }


    // Check if expired
    if (new Date(rewardCode.expires_at) < new Date()) {
      await supabase
        .from('reward_codes')
        .update({ status: 'expired' })
        .eq('id', rewardCodeId);
      return Response.json({ error: 'This credit has expired' }, { status: 400 });
    }

    // Get client's Stripe customer ID
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('stripe_customer_id, full_name, email')
      .eq('id', clientId)
      .single();

    if (clientError || !client) {
      return Response.json({ error: 'Client not found' }, { status: 404 });
    }

    // ── APPLY REAL STRIPE CREDIT ─────────────────────────────────────
    if (client.stripe_customer_id) {
      const creditAmountCents = Math.round(rewardCode.amount * 100); // Convert to cents

      await stripe.customers.createBalanceTransaction(
        client.stripe_customer_id,
        {
          amount: -creditAmountCents, // Negative = credit on account
          currency: 'usd',
          description: `$${rewardCode.amount} reward credit applied — code: ${rewardCode.code}`,
        }
      );

      console.log(`✅ Stripe credit applied: $${rewardCode.amount} to ${client.email}`);
    } else {
      console.log('⚠️ No Stripe customer ID found — marking redeemed in DB only');
    }

    // Mark as redeemed in database
    const { error: updateError } = await supabase
      .from('reward_codes')
      .update({
        status: 'redeemed',
        redeemed_by_client_id: clientId,
        redeemed_at: new Date().toISOString(),
      })
      .eq('id', rewardCodeId);

    if (updateError) {
      console.error('❌ Error updating reward:', updateError);
      return Response.json({ error: 'Failed to apply credit' }, { status: 500 });
    }

    console.log('✅ Reward redeemed:', rewardCodeId, 'for client:', clientId);

    return Response.json({
      success: true,
      message: `$${rewardCode.amount} credit applied to your account! It will automatically deduct from your next payment.`,
    });

  } catch (error) {
    console.error('❌ Error in apply-reward API:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
