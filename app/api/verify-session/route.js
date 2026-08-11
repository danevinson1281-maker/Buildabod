// app/api/verify-session/route.js

import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

// ════════════════════════════════════════════════════════════════════════════
// TIER CALCULATION
// ════════════════════════════════════════════════════════════════════════════
function calculateTierAndLock(paymentCount) {
  if (paymentCount >= 10) {
    return { tier: 'BUILT FOR LIFE', lockedUntil: null };
  } else if (paymentCount >= 5) {
    const lockedUntil = new Date();
    lockedUntil.setMonth(lockedUntil.getMonth() + 6);
    return { tier: 'DEDICATED', lockedUntil: lockedUntil.toISOString() };
  } else if (paymentCount >= 2) {
    const lockedUntil = new Date();
    lockedUntil.setMonth(lockedUntil.getMonth() + 3);
    return { tier: 'COMMITTED', lockedUntil: lockedUntil.toISOString() };
  }
  return { tier: null, lockedUntil: null };
}

// ════════════════════════════════════════════════════════════════════════════
// PROCESS REFERRAL REWARD — Create $40 credit for referrer after payment
// ════════════════════════════════════════════════════════════════════════════
async function processReferralReward(clientId, supabase) {
  console.log('🎁 [REFERRAL] Starting processReferralReward for clientId:', clientId);
  
  try {
    // 1. Get the client's referred_by code
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('id, referred_by, full_name')
      .eq('id', clientId)
      .single();

    if (clientError) {
      console.error('🎁 [REFERRAL] Error fetching client:', clientError.message);
      return;
    }

    if (!client?.referred_by) {
      console.log('🎁 [REFERRAL] No referral to process — client.referred_by is:', client?.referred_by);
      return;
    }

    console.log('🎁 [REFERRAL] Found referral code:', client.referred_by, 'for client:', client.full_name);

    // 2. Find the referrer by their referral code
    const { data: referrer, error: referrerError } = await supabase
      .from('clients')
      .select('id, full_name')
      .eq('referral_code', client.referred_by)
      .single();

    if (referrerError) {
      console.error('🎁 [REFERRAL] Error finding referrer:', referrerError.message);
      return;
    }

    if (!referrer) {
      console.warn('🎁 [REFERRAL] Referrer not found for code:', client.referred_by);
      return;
    }

    console.log('🎁 [REFERRAL] Found referrer:', referrer.full_name, 'ID:', referrer.id);

    // 3. Check if reward already exists (prevent duplicates from webhook + verify-session)
    const { data: existingReward, error: checkError } = await supabase
      .from('reward_codes')
      .select('id')
      .eq('earned_by_client_id', referrer.id)
      .eq('reward_type', 'referrer_reward')
      .eq('status', 'active');

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('🎁 [REFERRAL] Error checking existing reward:', checkError.message);
    }

    // Count how many rewards this referrer already has from this specific referral
    const existingForThisReferral = existingReward?.filter(r => {
      // Simple check: if created within last 5 minutes, likely a duplicate
      const createdAt = new Date(r.created_at);
      const now = new Date();
      return (now - createdAt) < 5 * 60 * 1000;
    }) || [];

    if (existingForThisReferral.length > 0) {
      console.log('🎁 [REFERRAL] Reward already created recently — skipping duplicate');
      return;
    }

    // 4. Create $40 reward for referrer
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 180);

    const uniqueCode = `GIFT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    console.log('🎁 [REFERRAL] Creating reward code:', uniqueCode, 'for referrer:', referrer.id);

    const { data: rewardData, error: rewardError } = await supabase
      .from('reward_codes')
      .insert({
        code: uniqueCode,
        earned_by_client_id: referrer.id,
        amount: 40.00,
        reward_type: 'referrer_reward',
        status: 'active',
        expires_at: expiresAt.toISOString(),
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (rewardError) {
      console.error('🎁 [REFERRAL] Failed to create reward:', rewardError.message, rewardError);
      return;
    }

    console.log('🎁 [REFERRAL] ✅ $40 reward created:', uniqueCode, 'ID:', rewardData.id);

    // 5. Update referral record to completed + link reward
    const { error: updateError } = await supabase
      .from('referrals')
      .update({
        status: 'completed',
        reward_code_id: rewardData.id,
      })
      .eq('referred_client_id', clientId)
      .eq('referrer_client_id', referrer.id);

    if (updateError) {
      console.error('🎁 [REFERRAL] Failed to update referral status:', updateError.message);
    } else {
      console.log('🎁 [REFERRAL] ✅ Referral marked as completed');
    }

  } catch (error) {
    console.error('🎁 [REFERRAL] ❌ Unexpected error:', error.message);
    // Non-fatal — don't block the payment verification
  }
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  try {
    const { sessionId } = await request.json();

    if (!sessionId) {
      return new Response(JSON.stringify({ error: 'Missing session ID' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session) {
      return new Response(JSON.stringify({ error: 'Session not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { metadata } = session;
    const { clientId, planType, isUpgrade } = metadata;

    if (!clientId) {
      return new Response(JSON.stringify({ error: 'Missing clientId in metadata' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    console.log('=== VERIFY SESSION ===');
    console.log('sessionId:', sessionId);
    console.log('clientId:', clientId);
    console.log('planType:', planType);
    console.log('isUpgrade:', isUpgrade);

    let paymentStatus = 'failed';

    if (session.mode === 'payment') {
      if (session.payment_status === 'paid') {
        paymentStatus = 'completed';
      }
    } else if (session.mode === 'subscription') {
      if (session.subscription) {
        const subscription = await stripe.subscriptions.retrieve(session.subscription);
        if (subscription.status === 'active') {
          paymentStatus = 'completed';
        }
      }
    }

    if (paymentStatus !== 'completed') {
      return new Response(
        JSON.stringify({ success: false, message: 'Payment was not completed' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // ── GET CLIENT FROM DATABASE ──────────────────────────────────────────
    const { data: client, error: fetchError } = await supabase
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .single();

    if (fetchError || !client) {
      console.error('Client fetch error:', fetchError);
      return new Response(JSON.stringify({ error: 'Client not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    console.log('✅ Client found:', client.full_name, '|', client.email);

    // ── IDEMPOTENCY CHECK: Skip if already processed ────────────────────
    const { data: existingPayment } = await supabase
      .from('payments')
      .select('id, status')
      .eq('stripe_payment_id', session.id)
      .single();

    if (existingPayment && existingPayment.status === 'completed') {
      console.log('⏭️ IDEMPOTENCY: Payment already processed, skipping...');
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Payment already verified.',
          planType,
          clientId,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // ── BUILD UPDATE DATA ─────────────────────────────────────────────────
    const isUpgradeFlag = isUpgrade === 'true';
    const newPaymentCount = isUpgradeFlag 
      ? (client.payments_made || 1)
      : (client.payments_made || 0) + 1;

    console.log(`📊 Payment count: ${newPaymentCount} (isUpgrade: ${isUpgradeFlag})`);

    const { tier: newTier, lockedUntil: newLock } = calculateTierAndLock(
      newPaymentCount
    );

    // ── GET SUBSCRIPTION INFO FOR NEXT BILLING DATE ───────────────────────
    let subscriptionId = null;
    let nextBillingDate = null;

    if (session.mode === 'subscription' && session.subscription) {
      subscriptionId = session.subscription;
      
      // Simple: Calculate 30 days from now for Pro/Elite
      const nextBilling = new Date();
      nextBilling.setDate(nextBilling.getDate() + 30);
      nextBillingDate = nextBilling.toISOString();
      
      console.log('📅 Next billing date (30 days):', nextBillingDate);
    }

    // For Kickstart (one-time), calculate 30-day expiry
    let kickstartExpiresAt = null;
    if (planType === 'kickstart') {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 30);
      kickstartExpiresAt = expiryDate.toISOString();
    }

    const updateData = {
      plan_type: planType,
      payment_status: 'completed',
      stripe_payment_id: session.id,
      stripe_customer_id: session.customer,
      updated_at: new Date().toISOString(),
      payments_made: newPaymentCount,
      // ✅ NEW: Subscription columns
      subscription_tier: planType,
      subscription_status: 'active',
      stripe_subscription_id: subscriptionId,
      subscription_started_at: new Date().toISOString(),
      subscription_next_billing_at: nextBillingDate,
      kickstart_expires_at: kickstartExpiresAt,
    };

    // Update tier if it progressed
    if (newTier && newTier !== client.tier) {
      updateData.tier = newTier;
      updateData.rate_locked_until = newLock;
      console.log(
        `🎉 TIER UPGRADED: ${client.tier || 'NO TIER'} → ${newTier} (payments: ${newPaymentCount})`
      );
    }

    // ── UPDATE CLIENT IN DATABASE ─────────────────────────────────────────
    const { error: updateError } = await supabase
      .from('clients')
      .update(updateData)
      .eq('id', clientId);

    if (updateError) {
      console.error('Client update error:', updateError);
      return new Response(JSON.stringify({ error: 'Failed to update client' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    console.log('✅ Client updated');

    // ── UPDATE PAYMENT RECORD ─────────────────────────────────────────────
    await supabase
      .from('payments')
      .update({ status: 'completed' })
      .eq('stripe_payment_id', session.id);

    console.log('✅ Payment record updated');

    // ✅ NEW: PROCESS REFERRAL REWARD (after payment confirms) ──────────────
    await processReferralReward(clientId, supabase);

    // ── SEND CONFIRMATION EMAIL ───────────────────────────────────────────
    try {
      const firstName = client.full_name ? client.full_name.split(' ')[0] : 'there';
      const planLabel =
        planType === 'elite' ? 'Elite' : planType === 'pro' ? 'Pro' : 'Kickstart';

      // ✅ FIX: Different email copy for upgrades
      const upgradeEmailContent = isUpgradeFlag
        ? `<p style="margin:0 0 28px;color:#999999;font-size:15px;line-height:1.7;text-align:center;">
            Your upgrade to <strong style="color:#FFD700;">${planLabel}</strong> is confirmed! 🚀<br><br>
            Your meal plan and dashboard access remain active. Dane will review and update your plan at your next scheduled check-in based on your ${planLabel} tier.
          </p>`
        : `<p style="margin:0 0 28px;color:#999999;font-size:15px;line-height:1.7;text-align:center;">
            Your <strong style="color:#FFD700;">${planLabel} Plan</strong> is confirmed. Dane is now building your custom meal plan from scratch — built around your body, your goals, and the foods you actually eat.
          </p>`;

      const whatsNextContent = isUpgradeFlag
        ? `<table width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="padding:10px 0;border-bottom:1px solid #1a1a1a;">
              <span style="color:#FFD700;font-weight:900;font-size:14px;">IMMEDIATELY</span>
              <span style="color:#cccccc;font-size:14px;margin-left:12px;">Your plan is updated to ${planLabel}</span>
            </td></tr>
            <tr><td style="padding:10px 0;border-bottom:1px solid #1a1a1a;">
              <span style="color:#FFD700;font-weight:900;font-size:14px;">YOUR LINK</span>
              <span style="color:#cccccc;font-size:14px;margin-left:12px;">Dashboard access link from before still works</span>
            </td></tr>
            <tr><td style="padding:10px 0;">
              <span style="color:#FFD700;font-weight:900;font-size:14px;">NEXT CHECK-IN</span>
              <span style="color:#cccccc;font-size:14px;margin-left:12px;">Dane updates your plan for your new tier</span>
            </td></tr>
          </table>`
        : `<table width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="padding:10px 0;border-bottom:1px solid #1a1a1a;">
              <span style="color:#FFD700;font-weight:900;font-size:14px;">NOW</span>
              <span style="color:#cccccc;font-size:14px;margin-left:12px;">Dane reviews your intake & builds your plan</span>
            </td></tr>
            <tr><td style="padding:10px 0;border-bottom:1px solid #1a1a1a;">
              <span style="color:#FFD700;font-weight:900;font-size:14px;">1-2 HRS</span>
              <span style="color:#cccccc;font-size:14px;margin-left:12px;">Your custom meal plan is finalized</span>
            </td></tr>
            <tr><td style="padding:10px 0;border-bottom:1px solid #1a1a1a;">
              <span style="color:#FFD700;font-weight:900;font-size:14px;">TODAY</span>
              <span style="color:#cccccc;font-size:14px;margin-left:12px;">You get an email with your plan + dashboard access</span>
            </td></tr>
            <tr><td style="padding:10px 0;">
              <span style="color:#FFD700;font-weight:900;font-size:14px;">THEN</span>
              <span style="color:#cccccc;font-size:14px;margin-left:12px;">Start eating, tracking, and transforming</span>
            </td></tr>
          </table>`;

      const planBenefits =
        planType === 'elite'
          ? '<li style="padding:6px 0;color:#cccccc;">Weekly check-ins with Dane</li>' +
            '<li style="padding:6px 0;color:#cccccc;">Weekly photo review & feedback</li>' +
            '<li style="padding:6px 0;color:#cccccc;">Weekly macro adjustments</li>' +
            '<li style="padding:6px 0;color:#cccccc;">Unlimited meal swaps</li>' +
            '<li style="padding:6px 0;color:#cccccc;">Priority support within 12 hours</li>'
          : planType === 'pro'
          ? '<li style="padding:6px 0;color:#cccccc;">Monthly check-in with Dane</li>' +
            '<li style="padding:6px 0;color:#cccccc;">Monthly photo review & feedback</li>' +
            '<li style="padding:6px 0;color:#cccccc;">Monthly macro adjustments</li>' +
            '<li style="padding:6px 0;color:#cccccc;">Unlimited meal swaps</li>' +
            '<li style="padding:6px 0;color:#cccccc;">Priority email support</li>'
          : '<li style="padding:6px 0;color:#cccccc;">Custom meal plan built for your body</li>' +
            '<li style="padding:6px 0;color:#cccccc;">Personally reviewed by Dane</li>' +
            '<li style="padding:6px 0;color:#cccccc;">Unlimited meal swaps</li>' +
            '<li style="padding:6px 0;color:#cccccc;">Downloadable PDF</li>' +
            '<li style="padding:6px 0;color:#cccccc;">Dashboard access to view your plan</li>';

      const confirmationEmail =
        '<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>' +
        '<body style="margin:0;padding:0;background-color:#000000;font-family:Arial,sans-serif;">' +
        '<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#000000;padding:40px 20px;">' +
        '<tr><td align="center">' +
        '<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">' +
        // Header
        '<tr><td style="background-color:#111111;border-top:4px solid #FFD700;border-radius:12px 12px 0 0;padding:36px 32px;text-align:center;">' +
        '<h1 style="margin:0;font-size:32px;font-weight:900;color:#FFD700;letter-spacing:3px;">BUILD<span style="color:#ffffff;">A</span>BOD</h1>' +
        '<p style="margin:8px 0 0;color:#888888;font-size:12px;letter-spacing:2px;">Custom Nutrition by Dane Vinson</p>' +
        '</td></tr>' +
        // Body
        '<tr><td style="background-color:#111111;padding:36px 32px;">' +
        // Success badge
        '<div style="text-align:center;margin-bottom:28px;">' +
        '<div style="display:inline-block;background-color:#FFD700;color:#000000;font-weight:900;font-size:13px;padding:8px 20px;border-radius:20px;letter-spacing:1px;">PAYMENT CONFIRMED</div>' +
        '</div>' +
        `<h2 style="margin:0 0 12px;color:#ffffff;font-size:26px;font-weight:900;text-align:center;">${isUpgradeFlag ? 'Your Upgrade is Complete!' : 'You are officially in, ' + firstName + '!'} 💪</h2>` +
        upgradeEmailContent +
        // What happens next
        '<div style="background-color:#0a0a0a;border:1px solid #222222;border-radius:12px;padding:24px;margin-bottom:24px;">' +
        '<p style="margin:0 0 16px;color:#FFD700;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">What Happens Next</p>' +
        whatsNextContent +
        '</div>' +
        // Plan benefits
        '<div style="background-color:#0a0a0a;border:1px solid #222222;border-radius:12px;padding:24px;margin-bottom:24px;">' +
        '<p style="margin:0 0 16px;color:#FFD700;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">Your ' +
        planLabel +
        ' Plan Includes</p>' +
        '<ul style="margin:0;padding-left:20px;list-style:none;">' +
        planBenefits +
        '</ul>' +
        '</div>' +
        // Note — different for upgrades
        (isUpgradeFlag
          ? '<div style="background-color:#0a1f0a;border:1px solid #1a3a1a;border-left:4px solid #22c55e;border-radius:8px;padding:20px;margin-bottom:24px;">' +
            '<p style="margin:0;color:#cccccc;font-size:14px;line-height:1.7;">' +
            '<strong style="color:#22c55e;">Your dashboard is ready.</strong> ' +
            'Use the same login link from your original email to access your account. Your upgraded plan is active now.' +
            '</p>' +
            '</div>'
          : '<div style="background-color:#0a1f0a;border:1px solid #1a3a1a;border-left:4px solid #22c55e;border-radius:8px;padding:20px;margin-bottom:24px;">' +
            '<p style="margin:0;color:#cccccc;font-size:14px;line-height:1.7;">' +
            '<strong style="color:#22c55e;">Keep an eye on your inbox.</strong> ' +
            'Your meal plan email will arrive within a few hours. If you don\'t see it, check your spam folder and mark us as safe.' +
            '</p>' +
            '</div>') +
        // Contact
        '<p style="margin:0;color:#666666;font-size:13px;text-align:center;">' +
        'Questions? Email <a href="mailto:dane@buildabod.co" style="color:#FFD700;text-decoration:none;">dane@buildabod.co</a>' +
        '</p>' +
        '</td></tr>' +
        // Footer
        '<tr><td style="background-color:#0a0a0a;border-top:1px solid #1a1a1a;border-radius:0 0 12px 12px;padding:20px;text-align:center;">' +
        '<p style="margin:0 0 4px;color:#333333;font-size:11px;">BuildABod.co — Custom Nutrition by Dane Vinson</p>' +
        '<p style="margin:0;color:#333333;font-size:11px;">500+ Transformations | 10+ Years Experience</p>' +
        '</td></tr>' +
        '</table></td></tr></table>' +
        '</body></html>';

      console.log('📬 Sending confirmation email...');
      const emailResult = await resend.emails.send({
        from: 'Dane @ BuildABod <noreply@buildabod.co>',
        to: client.email,
        subject: isUpgradeFlag 
          ? `Welcome to ${planLabel}, ${firstName}! Your Upgrade is Complete ✓`
          : `Payment Confirmed — Your Custom Plan is Being Built, ${firstName}!`,
        html: confirmationEmail,
      });

      if (emailResult.error) {
        console.error('❌ EMAIL SEND ERROR:', JSON.stringify(emailResult.error));
      } else {
        console.log('✅ Confirmation email sent successfully to:', client.email);
      }
    } catch (emailError) {
      console.error('❌ EMAIL EXCEPTION:', emailError.message);
    }

    // ── NOTIFY ADMIN ──────────────────────────────────────────────────────
    // ✅ FIX: Only notify admin for NEW clients, not upgrades
    if (!isUpgradeFlag) {
      try {
        console.log('📬 Notifying admin...');

        // Format allergies
        let allergiesArray = [];
        if (client.allergies) {
          try {
            allergiesArray = typeof client.allergies === 'string'
              ? JSON.parse(client.allergies)
              : client.allergies;
          } catch (e) {
            allergiesArray = [];
          }
        }

        // Format cooking methods
        let cookingArray = [];
        if (client.cooking_methods) {
          try {
            cookingArray = typeof client.cooking_methods === 'string'
              ? JSON.parse(client.cooking_methods)
              : client.cooking_methods;
          } catch (e) {
            cookingArray = [];
          }
        }

        await fetch(process.env.NEXT_PUBLIC_BASE_URL + '/api/notify-admin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'payment_received',
            planType: planType,
            clientId: clientId,
            clientData: {
              fullName: client.full_name,
              email: client.email,
              age: client.age,
              gender: client.gender,
              height: client.height,
              currentWeight: client.current_weight,
              goalWeight: client.goal_weight,
              primaryGoal: client.primary_goal,
              experienceLevel: client.experience_level,
              activityLevel: client.activity_level,
              mealsPerDay: client.meals_per_day,
              mealPattern: client.meal_pattern,
              dietaryType: client.dietary_restrictions,
              allergies: allergiesArray,
              cookingMethods: cookingArray,
              selectedFoods: client.selected_foods ? JSON.parse(client.selected_foods) : {},
              planType: planType,
              clientId: clientId,
            },
          }),
        });

        console.log('✅ Admin notified');
      } catch (notifyError) {
        console.error('⚠️ Error notifying admin:', notifyError);
      }
    } else {
      console.log('⏭️ Skipping admin notification — this is an upgrade');
    }

    console.log('✅ PAYMENT VERIFICATION COMPLETE');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Payment verified. Confirmation email sent.',
        planType,
        clientId,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ Verify session error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
