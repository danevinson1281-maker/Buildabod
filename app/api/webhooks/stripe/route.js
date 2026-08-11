// app/api/webhooks/stripe/route.js

import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { tierUnlockEmail } from '@/lib/emails/tierUnlockEmail'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const resend = new Resend(process.env.RESEND_API_KEY);

console.log('🔧 WEBHOOK INITIALIZED - webhookSecret exists:', !!webhookSecret);

// ════════════════════════════════════════════════════════════════════════════
// HELPER: Calculate tier and silent rate lock date
// ════════════════════════════════════════════════════════════════════════════
const calculateTierAndLock = (paymentsMade) => {
  let tier, lockedUntil;

  if (paymentsMade >= 10) {
    tier = 'BUILT FOR LIFE';
    lockedUntil = new Date('2099-12-31');
  } else if (paymentsMade >= 5) {
    tier = 'DEDICATED';
    lockedUntil = new Date();
    lockedUntil.setMonth(lockedUntil.getMonth() + 6);
  } else if (paymentsMade >= 2) {
    tier = 'COMMITTED';
    lockedUntil = new Date();
    lockedUntil.setMonth(lockedUntil.getMonth() + 3);
  } else {
    tier = null;
    lockedUntil = null;
  }

  return { tier, lockedUntil: lockedUntil ? lockedUntil.toISOString() : null };
};

// ════════════════════════════════════════════════════════════════════════════
// HELPER: Send tier unlock celebration email
// ════════════════════════════════════════════════════════════════════════════
const sendTierUnlockEmail = async (client, newTier) => {
  try {
    const { subject, html } = tierUnlockEmail(client.full_name, newTier);
    await resend.emails.send({
      from: 'Dane <dane@buildabod.co>',
      to: client.email,
      subject,
      html,
    });
    console.log(`✉️ Tier unlock email sent to ${client.email} - New tier: ${newTier}`);
  } catch (error) {
    console.error('Error sending tier unlock email:', error);
  }
};

// ════════════════════════════════════════════════════════════════════════════
// HELPER: Update client tier — ONLY call this for real new payments
// ════════════════════════════════════════════════════════════════════════════
async function updateClientTier(clientId) {
  try {
    const { data: client, error: fetchError } = await supabase
      .from('clients')
      .select('id, tier, payments_made, email, full_name')
      .eq('id', clientId)
      .single();

    if (fetchError || !client) {
      console.log(`ℹ️ Client not found: ${clientId}`);
      return;
    }

    const currentPayments = (client.payments_made || 0) + 1;
    const { tier: newTier, lockedUntil } = calculateTierAndLock(currentPayments);
    const oldTier = client.tier || null;

    console.log(`📊 Tier update: ${oldTier || 'none'} → ${newTier || 'none'} (${currentPayments} payments)`);

    await supabase
      .from('clients')
      .update({
        payments_made: currentPayments,
        tier: newTier,
        rate_locked_until: lockedUntil,
      })
      .eq('id', clientId);

    if (oldTier !== newTier && newTier) {
      console.log(`🎉 Tier unlocked! Sending celebration email...`);
      await sendTierUnlockEmail(client, newTier);
    }

    console.log(`✅ Tier updated successfully`);
  } catch (error) {
    console.error('Error updating client tier:', error);
  }
}

// ════════════════════════════════════════════════════════════════════════════
// HELPER: Process referral reward AFTER payment succeeds
// ✅ Creates $40 credit for referrer + marks referral as completed
// ════════════════════════════════════════════════════════════════════════════
async function processReferralReward(clientId) {
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

    // 3. Check if reward already exists (prevent duplicates)
    const { data: existingReward, error: checkError } = await supabase
      .from('reward_codes')
      .select('id')
      .eq('earned_by_client_id', referrer.id)
      .eq('reward_type', 'referrer_reward')
      .eq('status', 'active')
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('🎁 [REFERRAL] Error checking existing reward:', checkError.message);
    }

    if (existingReward) {
      console.log('🎁 [REFERRAL] Reward already exists — skipping duplicate');
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
  }
}

// ════════════════════════════════════════════════════════════════════════════
// MAIN WEBHOOK HANDLER
// ════════════════════════════════════════════════════════════════════════════
export async function POST(request) {
  console.log('🌐 [WEBHOOK] Incoming request to /api/webhooks/stripe');
  
  const body = await request.text();
  const sig = request.headers.get('stripe-signature');

  console.log('🌐 [WEBHOOK] Signature present:', !!sig);
  console.log('🌐 [WEBHOOK] Body length:', body.length);

  let event;

  try {
    console.log('🌐 [WEBHOOK] Attempting to verify Stripe signature...');
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    console.log('🌐 [WEBHOOK] ✅ Signature verified. Event type:', event.type);
  } catch (err) {
    console.error('🌐 [WEBHOOK] ❌ Signature verification failed:', err.message);
    return Response.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'charge.succeeded':
        console.log('🌐 [WEBHOOK] → Routing to handleChargeSucceeded');
        await handleChargeSucceeded(event.data.object);
        break;

      case 'customer.subscription.created':
        console.log('🌐 [WEBHOOK] → Routing to handleSubscriptionCreated');
        await handleSubscriptionCreated(event.data.object);
        break;

      case 'customer.subscription.updated':
        console.log('🌐 [WEBHOOK] → Routing to handleSubscriptionUpdated');
        await handleSubscriptionUpdated(event.data.object);
        break;

      case 'customer.subscription.deleted':
        console.log('🌐 [WEBHOOK] → Routing to handleSubscriptionCanceled');
        await handleSubscriptionCanceled(event.data.object);
        break;

      case 'invoice.payment_failed':
        console.log('🌐 [WEBHOOK] → Routing to handleInvoicePaymentFailed');
        await handleInvoicePaymentFailed(event.data.object);
        break;

      case 'invoice.payment_succeeded':
        console.log('🌐 [WEBHOOK] → Routing to handleInvoicePaymentSucceeded');
        await handleInvoicePaymentSucceeded(event.data.object);
        break;

      default:
        console.log(`🌐 [WEBHOOK] Unhandled event type: ${event.type}`);
    }

    console.log('🌐 [WEBHOOK] ✅ Event processed successfully');
    return Response.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error('🌐 [WEBHOOK] ❌ Error processing event:', error.message, error);
    return Response.json({ error: 'Processing failed' }, { status: 500 });
  }
}

// ════════════════════════════════════════════════════════════════════════════
// CHARGE SUCCEEDED (one-time Kickstart payments ONLY)
// ════════════════════════════════════════════════════════════════════════════
async function handleChargeSucceeded(charge) {
  console.log('💳 [CHARGE] charge.succeeded event fired');
  console.log('💳 [CHARGE] charge.id:', charge.id);
  console.log('💳 [CHARGE] charge.invoice:', charge.invoice);

  if (charge.invoice) {
    console.log('💳 [CHARGE] ⏭️ Skipping — charge is part of subscription invoice');
    return;
  }

  const { metadata } = charge;

  if (!metadata?.clientDataJson) {
    console.log('💳 [CHARGE] ❌ No client data in metadata');
    return;
  }

  const clientData = JSON.parse(metadata.clientDataJson);
  const plan = metadata.plan;

  console.log('💳 [CHARGE] Email:', clientData.email);
  console.log('💳 [CHARGE] Plan:', plan);

  const { data: existingClient } = await supabase
    .from('clients')
    .select('id, payments_made')
    .eq('email', clientData.email)
    .single();

  let clientId;

  if (existingClient) {
    clientId = existingClient.id;
    console.log('💳 [CHARGE] ✅ Existing client found:', clientId);

    const updateData = {
      plan_type: plan,
      payment_status: 'completed',
      updated_at: new Date().toISOString(),
      payments_made: (existingClient.payments_made || 0) + 1,
    };

    const { error: updateError } = await supabase
      .from('clients')
      .update(updateData)
      .eq('id', clientId);

    if (updateError) {
      console.error('💳 [CHARGE] Error updating client:', updateError);
      return;
    }

    console.log(`💳 [CHARGE] ✅ Client updated`);
    await updateClientTier(clientId);

  } else {
    console.log('💳 [CHARGE] Creating new client...');

    const { tier: initialTier, lockedUntil } = calculateTierAndLock(1);

    const insertData = {
      email: clientData.email,
      full_name: clientData.fullName || '',
      phone: clientData.phone || '',
      age: clientData.age || null,
      gender: clientData.gender || '',
      height: clientData.height || '',
      current_weight: clientData.currentWeight || null,
      goal_weight: clientData.goalWeight || null,
      primary_goal: clientData.primaryGoal || '',
      experience_level: clientData.experienceLevel || '',
      activity_level: clientData.activityLevel || '',
      workout_frequency: clientData.workoutFrequency || '',
      cardio_duration: clientData.cardioDuration || '',
      meals_per_day: clientData.mealsPerDay || 3,
      meal_pattern: clientData.mealPattern || 'balanced',
      diabetic: clientData.diabetic === 'yes',
      dietary_restrictions: clientData.dietaryRestrictions || '',
      other_notes: clientData.otherNotes || '',
      selected_foods: clientData.selectedFoods || [],
      plan_type: plan,
      payment_status: 'completed',
      tier: initialTier,
      payments_made: 1,
      rate_locked_until: lockedUntil,
    };

    if (plan === 'kickstart') {
      insertData.last_kickstart_purchase = new Date().toISOString();
    }

    const { data: newClient, error: insertError } = await supabase
      .from('clients')
      .insert([insertData])
      .select()
      .single();

    if (insertError) {
      console.error('💳 [CHARGE] Error creating client:', insertError);
      return;
    }

    clientId = newClient.id;
    console.log(`💳 [CHARGE] ✅ New client created:`, clientId);
  }

  await supabase.from('payments').insert([{
    client_id: clientId,
    stripe_payment_id: charge.id,
    amount: charge.amount / 100,
    currency: charge.currency.toUpperCase(),
    status: 'succeeded',
    plan_type: plan,
  }]);

  console.log('💳 [CHARGE] ✅ Payment record inserted');

  // ✅ Process referral reward (creates $40 credit for referrer AFTER payment)
  await processReferralReward(clientId);

  console.log('💳 [CHARGE] ✅ handleChargeSucceeded complete');
}

// ════════════════════════════════════════════════════════════════════════════
// SUBSCRIPTION CREATED
// ════════════════════════════════════════════════════════════════════════════
async function handleSubscriptionCreated(subscription) {
  console.log('📅 [SUBSCRIPTION] customer.subscription.created event fired');
  console.log('📅 [SUBSCRIPTION] subscription.id:', subscription.id);

  const { customer, metadata, id } = subscription;

  if (!metadata?.clientDataJson) {
    console.log('📅 [SUBSCRIPTION] ❌ No client data in metadata');
    return;
  }

  const clientData = JSON.parse(metadata.clientDataJson);
  const plan = metadata.plan;

  console.log('📅 [SUBSCRIPTION] Email:', clientData.email);
  console.log('📅 [SUBSCRIPTION] Plan:', plan);

  const { data: existingClient } = await supabase
    .from('clients')
    .select('id, payments_made, plan_type')
    .eq('email', clientData.email)
    .single();

  const isUpgrade = !!(existingClient && existingClient.plan_type === 'kickstart');
  console.log(`📅 [SUBSCRIPTION] isUpgrade: ${isUpgrade}`);

  let clientId;

  if (existingClient) {
    clientId = existingClient.id;
    console.log(`📅 [SUBSCRIPTION] ✅ Existing client found:`, clientId);

    const updateData = {
      subscription_status: 'active',
      subscription_tier: plan,
      stripe_subscription_id: id,
      stripe_customer_id: customer,
      subscription_started_at: new Date(subscription.created * 1000).toISOString(),
      subscription_next_billing_at: new Date(
        subscription.current_period_end * 1000
      ).toISOString(),
      plan_type: plan,
      payment_status: 'completed',
      updated_at: new Date().toISOString(),
      payments_made: isUpgrade
        ? (existingClient.payments_made || 1)
        : 1,
    };

    const { error: updateError } = await supabase
      .from('clients')
      .update(updateData)
      .eq('id', clientId);

    if (updateError) {
      console.error('📅 [SUBSCRIPTION] Error updating client:', updateError);
      return;
    }

    console.log(`📅 [SUBSCRIPTION] ✅ Client updated`);

    if (!isUpgrade) {
      await updateClientTier(clientId);
    } else {
      console.log('📅 [SUBSCRIPTION] ⏭️ Skipping tier update — upgrade');
    }

  } else {
    console.log('📅 [SUBSCRIPTION] Creating new client with subscription...');

    const { tier: initialTier, lockedUntil } = calculateTierAndLock(1);

    const insertData = {
      email: clientData.email,
      full_name: clientData.fullName || '',
      phone: clientData.phone || '',
      age: clientData.age || null,
      gender: clientData.gender || '',
      height: clientData.height || '',
      current_weight: clientData.currentWeight || null,
      goal_weight: clientData.goalWeight || null,
      primary_goal: clientData.primaryGoal || '',
      experience_level: clientData.experienceLevel || '',
      activity_level: clientData.activityLevel || '',
      workout_frequency: clientData.workoutFrequency || '',
      cardio_duration: clientData.cardioDuration || '',
      meals_per_day: clientData.mealsPerDay || 3,
      meal_pattern: clientData.mealPattern || 'balanced',
      diabetic: clientData.diabetic === 'yes',
      dietary_restrictions: clientData.dietaryRestrictions || '',
      other_notes: clientData.otherNotes || '',
      selected_foods: clientData.selectedFoods || [],
      plan_type: plan,
      payment_status: 'completed',
      subscription_status: 'active',
      subscription_tier: plan,
      stripe_subscription_id: id,
      stripe_customer_id: customer,
      subscription_started_at: new Date(subscription.created * 1000).toISOString(),
      subscription_next_billing_at: new Date(
        subscription.current_period_end * 1000
      ).toISOString(),
      tier: initialTier,
      payments_made: 1,
      rate_locked_until: lockedUntil,
    };

    const { data: newClient, error: insertError } = await supabase
      .from('clients')
      .insert([insertData])
      .select()
      .single();

    if (insertError) {
      console.error('📅 [SUBSCRIPTION] Error creating client:', insertError);
      return;
    }

    clientId = newClient.id;
    console.log(`📅 [SUBSCRIPTION] ✅ New client created:`, clientId);
  }

  // ✅ Process referral reward (creates $40 credit for referrer AFTER payment)
  await processReferralReward(clientId);

  console.log('📅 [SUBSCRIPTION] ✅ handleSubscriptionCreated complete');
}

// ════════════════════════════════════════════════════════════════════════════
// SUBSCRIPTION UPDATED
// ════════════════════════════════════════════════════════════════════════════
async function handleSubscriptionUpdated(subscription) {
  console.log('🔄 [UPDATE] customer.subscription.updated event');

  const { id, status } = subscription;
  const subStatus = status === 'active' ? 'active' : status === 'paused' ? 'paused' : 'inactive';

  await supabase
    .from('clients')
    .update({
      subscription_status: subStatus,
      subscription_next_billing_at: new Date(
        subscription.current_period_end * 1000
      ).toISOString(),
    })
    .eq('stripe_subscription_id', id);

  console.log('🔄 [UPDATE] ✅ Subscription updated');
}

// ════════════════════════════════════════════════════════════════════════════
// SUBSCRIPTION CANCELED
// ════════════════════════════════════════════════════════════════════════════
async function handleSubscriptionCanceled(subscription) {
  console.log('❌ [CANCEL] customer.subscription.deleted event');

  const { id } = subscription;

  await supabase
    .from('clients')
    .update({
      subscription_status: 'canceled',
      subscription_canceled_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', id);

  console.log('❌ [CANCEL] ✅ Subscription canceled');
}

// ════════════════════════════════════════════════════════════════════════════
// INVOICE PAYMENT FAILED
// ════════════════════════════════════════════════════════════════════════════
async function handleInvoicePaymentFailed(invoice) {
  console.log('💳 [FAILED] invoice.payment_failed event');

  const { subscription, attempt_count } = invoice;

  if (!subscription) {
    console.log('💳 [FAILED] ⏭️ No subscription');
    return;
  }

  const { data: client } = await supabase
    .from('clients')
    .select('id, email, full_name, plan_type')
    .eq('stripe_subscription_id', subscription)
    .single();

  if (!client) {
    console.log('💳 [FAILED] ⏭️ No client found');
    return;
  }

  console.log(`💳 [FAILED] Payment failed for ${client.full_name} (attempt ${attempt_count}/3)`);

  await supabase
    .from('clients')
    .update({
      subscription_status: 'past_due',
      last_payment_failed_at: new Date().toISOString(),
      payment_failure_retry_count: attempt_count || 1,
    })
    .eq('id', client.id);

  if (attempt_count === 1) {
    try {
      const planLabel = client.plan_type === 'elite' ? 'Elite' : 'Pro';
      
      await resend.emails.send({
        from: 'Dane <dane@buildabod.co>',
        to: client.email,
        subject: `⚠️ Payment Failed — Update Your Card to Keep Your Plan Active`,
        html: `
          <!DOCTYPE html>
          <html>
            <head><meta charset="utf-8"></head>
            <body style="margin:0;padding:0;background-color:#000;font-family:Arial,sans-serif;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#000;padding:40px 20px;">
                <tr><td align="center">
                  <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
                    <tr><td style="background-color:#111;border-top:4px solid #FFD700;border-radius:12px 12px 0 0;padding:32px;text-align:center;">
                      <h1 style="margin:0;font-size:24px;font-weight:900;color:#FFD700;">⚠️ Payment Failed</h1>
                    </td></tr>
                    <tr><td style="background-color:#111;padding:32px;border-bottom:1px solid #1a1a1a;">
                      <p style="margin:0 0 16px;color:#ccc;font-size:15px;">Hi ${client.full_name?.split(' ')[0]},</p>
                      <p style="margin:0 0 16px;color:#ccc;font-size:15px;line-height:1.6;">
                        We tried to charge your card for your <strong style="color:#FFD700;">${planLabel}</strong> subscription, but the payment was declined.
                      </p>
                      <p style="margin:0 0 24px;color:#ccc;font-size:15px;line-height:1.6;">
                        <strong style="color:#FFD700;">You have 3 days</strong> to update your payment method, or your dashboard access will be locked.
                      </p>
                      <p style="margin:0 0 24px;font-size:13px;">
                        <a href="${process.env.NEXT_PUBLIC_BASE_URL}/payment" style="display:inline-block;padding:12px 28px;background-color:#FFD700;color:#000;font-weight:bold;text-decoration:none;border-radius:8px;">
                          Update Payment Method
                        </a>
                      </p>
                      <p style="margin:0;color:#888;font-size:13px;border-top:1px solid #1a1a1a;padding-top:16px;">
                        <strong>What happens next:</strong><br>
                        • Stripe will retry your payment 2 more times automatically<br>
                        • If payment succeeds, your access continues normally<br>
                        • If all 3 attempts fail, your dashboard locks after 3 days<br>
                      </p>
                    </td></tr>
                    <tr><td style="background-color:#0a0a0a;border-radius:0 0 12px 12px;padding:20px;text-align:center;border-top:1px solid #1a1a1a;">
                      <p style="margin:0;color:#666;font-size:11px;">BuildABod.co — Custom Nutrition by Dane Vinson</p>
                    </td></tr>
                  </table>
                </td></tr>
              </table>
            </body>
          </html>
        `,
      });

      console.log(`💳 [FAILED] ✅ Email sent to ${client.email}`);
    } catch (emailError) {
      console.error('💳 [FAILED] Error sending email:', emailError);
    }
  }

  console.log(`💳 [FAILED] ⏳ Stripe will retry ${3 - attempt_count} more times`);
}

// ════════════════════════════════════════════════════════════════════════════
// INVOICE PAYMENT SUCCEEDED
// ════════════════════════════════════════════════════════════════════════════
async function handleInvoicePaymentSucceeded(invoice) {
  console.log('✅ [INVOICE] invoice.payment_succeeded event');

  const { customer, subscription, amount_paid, currency, billing_reason } = invoice;

  if (!subscription) {
    console.log('✅ [INVOICE] ⏭️ No subscription');
    return;
  }

  console.log(`✅ [INVOICE] billing_reason: ${billing_reason}`);

  if (billing_reason !== 'subscription_cycle') {
    console.log(`✅ [INVOICE] ⏭️ Skipping — not a subscription_cycle`);
    return;
  }

  const { data: client } = await supabase
    .from('clients')
    .select('id, referred_by, payments_made')
    .eq('stripe_subscription_id', subscription)
    .single();

  if (!client) {
    console.log('✅ [INVOICE] ⏭️ No client found');
    return;
  }

  console.log('✅ [INVOICE] Updating tier...');
  await updateClientTier(client.id);

  if (client.referred_by) {
    console.log('✅ [INVOICE] Checking referral reward...');
    const { data: existingReferral } = await supabase
            .from('referrals')
      .select('id, free_month_applied')
      .eq('referred_client_id', client.id)
      .single();

    if (!existingReferral?.free_month_applied) {
      await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/apply-referral`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          referralCode: client.referred_by,
          newClientId: client.id,
        }),
      }).catch(err => console.error('✅ [INVOICE] Referral apply error:', err));
    }
  }

  await supabase.from('payments').insert([{
    client_id: client.id,
    stripe_payment_id: invoice.id,
    subscription_id: subscription,
    amount: amount_paid / 100,
    currency: currency.toUpperCase(),
    status: 'succeeded',
    billing_cycle_start: new Date(invoice.period_start * 1000).toISOString(),
    billing_cycle_end: new Date(invoice.period_end * 1000).toISOString(),
  }]);

  console.log('✅ [INVOICE] ✅ Invoice payment processed');
}
