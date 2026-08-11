// app/api/clients/upgrade/route.js

import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  try {
    const body = await request.json();
    const { clientId, newPlan, email } = body;

    console.log('🔄 Upgrade request:', { clientId, newPlan, email });

    if (!clientId || !newPlan || !email) {
      return new Response(
        JSON.stringify({ error: 'Missing clientId, newPlan, or email' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate newPlan
    if (!['pro', 'elite'].includes(newPlan)) {
      return new Response(
        JSON.stringify({ error: 'Invalid plan: must be pro or elite' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // ── FETCH CLIENT ──────────────────────────────────────────────────────
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .single();

    if (clientError || !client) {
      console.log('❌ Client not found:', clientError);
      return new Response(
        JSON.stringify({ error: 'Client not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // ── VALIDATE KICKSTART ────────────────────────────────────────────────
    if (client.plan_type !== 'kickstart') {
      console.log('❌ Client not on Kickstart plan');
      return new Response(
        JSON.stringify({ error: 'Only Kickstart clients can upgrade' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // ── CHECK 7-DAY WINDOW ────────────────────────────────────────────────
    const now = new Date();
    const upgradeDeadline = new Date(client.kickstart_upgrade_expires);

    if (now > upgradeDeadline) {
      console.log('❌ 7-day upgrade window expired');
      return new Response(
        JSON.stringify({ 
          error: 'Your 7-day upgrade window has expired. You can still upgrade at full price.',
          expired: true
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const daysRemaining = Math.ceil((upgradeDeadline - now) / (1000 * 60 * 60 * 24));
    console.log(`✅ Upgrade window valid: ${daysRemaining} days remaining`);

    // ── CREATE $67 CREDIT COUPON ──────────────────────────────────────────
    const coupon = await stripe.coupons.create({
      amount_off: 6700, // $67 in cents
      currency: 'usd',
      duration: 'once',
      max_redemptions: 1,
      name: 'Kickstart Upgrade $67',
    });

    console.log('✅ Stripe coupon created:', coupon.id);

    // ── GENERATE REFERRAL CODE (if doesn't exist) ─────────────────────────
    let referralCode = client.referral_code;
    if (!referralCode) {
      referralCode = generateReferralCode();
      console.log('✅ Generated referral code:', referralCode);
    }

    // ── UPDATE CLIENT: MARK AS UPGRADED ───────────────────────────────────
    const { error: updateError } = await supabase
      .from('clients')
      .update({
        upgraded_to_plan: newPlan,
        upgrade_date: new Date().toISOString(),
        referral_code: referralCode,
      })
      .eq('id', clientId);

    if (updateError) {
      console.error('❌ Error updating client:', updateError);
      throw updateError;
    }

    console.log('✅ Client updated with upgrade info');

    // ── STORE COUPON IN REWARD_CODES TABLE ────────────────────────────────
    // ✅ FIX: 6 month expiration (180 days)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 180); // 6 months from now

    const { error: rewardError } = await supabase
      .from('reward_codes')
      .insert({
        earned_by_client_id: clientId,
        code: `UPGRADE-${referralCode}`,
        reward_type: 'kickstart_upgrade_credit',
        status: 'active',
        amount: 67,
        stripe_coupon_id: coupon.id,
        expires_at: expiresAt.toISOString(),
      });

    if (rewardError) {
      console.error('⚠️ Error storing reward code (non-blocking):', rewardError);
      // Don't fail — they can still checkout
    } else {
      console.log('✅ Reward code stored in DB:', `UPGRADE-${referralCode}`);
      console.log('✅ Expires at:', expiresAt.toLocaleDateString());
    }

    console.log('✅ Upgrade process complete');

    return new Response(
      JSON.stringify({
        success: true,
        couponId: coupon.id,
        referralCode: referralCode,
        message: 'Ready to upgrade! Proceed to checkout.',
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('💥 Upgrade error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// Generate random referral code
function generateReferralCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
