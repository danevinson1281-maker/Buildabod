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
    console.log('💳 RAW REQUEST BODY:', JSON.stringify(body, null, 2));

    // ✅ Added isUpgrade to destructuring
    const { clientId, planType, email, isUpgrade } = body;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

    console.log('💳 Parsed values:', { clientId, planType, email, baseUrl, isUpgrade });

    // Validate inputs
    if (!clientId) {
      console.log('❌ Missing clientId');
      return new Response(
        JSON.stringify({ error: 'Missing clientId' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    if (!planType) {
      console.log('❌ Missing planType');
      return new Response(
        JSON.stringify({ error: 'Missing planType' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    if (!email) {
      console.log('❌ Missing email');
      return new Response(
        JSON.stringify({ error: 'Missing email' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Normalize planType to handle both "kickstart" and "Kickstart"
    const normalizedPlan = planType.toLowerCase();
    console.log('📋 Normalized plan:', normalizedPlan);

    // Determine Stripe mode and pricing (UPDATED SESSION 32)
    const mode = normalizedPlan === 'kickstart' ? 'payment' : 'subscription';
    let lineItems = [];
    let amount = 0;

    if (normalizedPlan === 'kickstart') {
      amount = 6700; // ✅ Updated: $67 (was $50)
      lineItems = [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'BuildABod Kickstart Plan',
              description: 'Custom meal plan with personalized macros',
            },
            unit_amount: 6700, // ✅ Updated: $67
          },
          quantity: 1,
        },
      ];
    } else if (normalizedPlan === 'pro') {
      amount = 12700; // ✅ Updated: $127/mo (was $97)
      const proPriceId = 'price_1U37ofQVIGuBoBPoEJYglWcE'; // ✅ New Stripe Price ID
      console.log('📋 Pro Price ID:', proPriceId);
      if (!proPriceId) {
        console.log('❌ Missing Pro Price ID');
        return new Response(
          JSON.stringify({ error: 'Pro plan not configured' }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
      }
      lineItems = [{ price: proPriceId, quantity: 1 }];
    } else if (normalizedPlan === 'elite') {
      amount = 19700; // ✅ Updated: $197/mo (was $167)
      const elitePriceId = 'price_1U37ovQVIGuBoBPoKxx3Khud'; // ✅ New Stripe Price ID
      console.log('📋 Elite Price ID:', elitePriceId);
      if (!elitePriceId) {
        console.log('❌ Missing Elite Price ID');
        return new Response(
          JSON.stringify({ error: 'Elite plan not configured' }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
      }
      lineItems = [{ price: elitePriceId, quantity: 1 }];
    } else {
      console.log('❌ Invalid plan type:', planType);
      return new Response(
        JSON.stringify({ error: 'Invalid plan type: ' + planType }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Creating Stripe session:', { mode, normalizedPlan, amount, lineItems });

    // ── DISCOUNT LOOKUP ────────────────────────────────────────────────────────
    let discounts = [];

    try {
      if (isUpgrade) {
        // ✅ Upgrade path: apply the $67 Kickstart upgrade coupon (updated)
        console.log('🔄 isUpgrade=true — looking for kickstart_upgrade_credit coupon...');
        const { data: upgradeCode, error: upgradeError } = await supabase
          .from('reward_codes')
          .select('stripe_coupon_id')
          .eq('earned_by_client_id', clientId)
          .eq('reward_type', 'kickstart_upgrade_credit')
          .eq('status', 'active')
          .single();

        if (!upgradeError && upgradeCode?.stripe_coupon_id) {
          console.log('✅ Found upgrade coupon:', upgradeCode.stripe_coupon_id);
          discounts = [{ coupon: upgradeCode.stripe_coupon_id }];
        } else {
          console.log('⚠️ No active kickstart_upgrade_credit coupon found for client:', clientId);
        }

      } else {
        // ✅ Normal path: Check if THIS client was referred and has a referral_discount
        const { data: referralDiscount, error: discError } = await supabase
          .from('reward_codes')
          .select('stripe_coupon_id')
          .eq('earned_by_client_id', clientId)
          .eq('reward_type', 'referral_discount')
          .eq('status', 'active')
          .gt('expires_at', new Date().toISOString())
          .single();

        if (!discError && referralDiscount?.stripe_coupon_id) {
          console.log('✅ Found referral discount coupon:', referralDiscount.stripe_coupon_id);
          discounts = [{ coupon: referralDiscount.stripe_coupon_id }];
        } else {
          console.log('ℹ️ No active referral discount found for this customer');
        }
      }
    } catch (discountError) {
      console.log('⚠️ Discount lookup failed (continuing anyway):', discountError.message);
      // Non-fatal — continue without discount
    }

    // ── BUILD SESSION PARAMS ───────────────────────────────────────────────────
    const sessionParams = {
      customer_email: email,
      mode: mode,
      success_url: `${baseUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}&plan_type=${normalizedPlan}`,
      cancel_url: `${baseUrl}/payment?planType=${normalizedPlan}&clientId=${clientId}`,
      metadata: {
        clientId: clientId,
        planType: normalizedPlan,
        isUpgrade: isUpgrade ? 'true' : 'false',
      },
      line_items: lineItems,
    };

    // ✅ Only add discounts if we found one
    if (discounts.length > 0) {
      sessionParams.discounts = discounts;
      console.log('💸 Applying discount(s) to session:', discounts);
    } else {
      sessionParams.allow_promotion_codes = true;
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create(sessionParams);

    console.log('✅ Stripe session created:', session.id, '| discounts applied:', discounts.length > 0);

    // Store session info in database (fire-and-forget, non-blocking)
    supabase
      .from('payments')
      .insert({
        client_id: clientId,
        stripe_payment_id: session.id,
        amount: amount,
        currency: 'usd',
        status: 'pending',
        plan_type: normalizedPlan,
      })
      .then(() => console.log('✅ Payment record inserted'))
      .catch(err => console.error('⚠️ Payment record insert error (non-blocking):', err));

    return new Response(
      JSON.stringify({ sessionId: session.id, url: session.url }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('💥 Checkout session error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
