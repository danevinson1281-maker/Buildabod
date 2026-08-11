import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  try {
    const { code, clientId } = await request.json();

    if (!code || !clientId) {
      return Response.json({ error: 'Missing code or clientId' }, { status: 400 });
    }

    // Find the reward code
    const { data: rewardCode, error: codeError } = await supabase
      .from('reward_codes')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('status', 'active')
      .single();

    if (codeError || !rewardCode) {
      return Response.json(
        { error: 'Invalid code or already redeemed.' },
        { status: 404 }
      );
    }

    // Prevent using your OWN code
    if (rewardCode.earned_by_client_id === clientId) {
      return Response.json(
        { error: 'You cannot redeem your own reward code.' },
        { status: 400 }
      );
    }

    // Check if expired
    if (new Date(rewardCode.expires_at) < new Date()) {
      await supabase
        .from('reward_codes')
        .update({ status: 'expired' })
        .eq('id', rewardCode.id);
      return Response.json({ error: 'This code has expired.' }, { status: 400 });
    }

    // Get client details
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('stripe_customer_id, full_name, email, payments_made, plan_type')
      .eq('id', clientId)
      .single();

    if (clientError || !client) {
      return Response.json({ error: 'Client not found.' }, { status: 404 });
    }

    // ── BLOCK KICKSTART CLIENTS ───────────────────────────────────────
    if (client.plan_type?.toLowerCase() === 'kickstart') {
      return Response.json(
        { error: 'Gift credits are only valid on Pro and Elite plans. Upgrade your plan to use this credit!' },
        { status: 400 }
      );
    }

    // Must have made at least 1 payment (active client)
    if (!client.payments_made || client.payments_made < 1) {
      return Response.json(
        { error: 'You must be an active client with at least 1 payment to redeem gift codes.' },
        { status: 400 }
      );
    }

    

    // ── APPLY REAL STRIPE CREDIT ──────────────────────────────────────
    if (client.stripe_customer_id) {
      const creditAmountCents = Math.round(rewardCode.amount * 100);

      await stripe.customers.createBalanceTransaction(
        client.stripe_customer_id,
        {
          amount: -creditAmountCents,
          currency: 'usd',
          description: `$${rewardCode.amount} gift credit redeemed — code: ${rewardCode.code}`,
        }
      );

      console.log(`✅ Gift credit applied: $${rewardCode.amount} to ${client.email}`);
    } else {
      console.log('⚠️ No Stripe customer ID — credit logged in DB only');
    }

        // Mark code as redeemed
    await supabase
      .from('reward_codes')
      .update({
        status: 'redeemed',
        redeemed_by_client_id: clientId,
        redeemed_at: new Date().toISOString(),
      })
      .eq('id', rewardCode.id);

    // ── CREATE A VISIBLE CREDIT FOR THE RECIPIENT ─────────────────────
    // This lets the recipient see the credit in their My Rewards balance
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 180);

    await supabase
      .from('reward_codes')
      .insert([
        {
          code: `RECEIVED-${rewardCode.code}`,
          earned_by_client_id: clientId,
          amount: rewardCode.amount,
          reward_type: 'referrer_reward',
          status: 'active',
          expires_at: expiresAt.toISOString(),
          created_at: new Date().toISOString(),
        },
      ]);

    console.log(`✅ Gift code redeemed: ${rewardCode.code} → created visible credit for ${client.email}`);

    return Response.json({
      success: true,
      message: `$${rewardCode.amount} credit applied! It will automatically deduct from your next payment.`,
    });


  } catch (error) {
    console.error('❌ Error redeeming gift code:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
