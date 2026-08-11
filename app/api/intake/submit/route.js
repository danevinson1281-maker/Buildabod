// app/api/intake/submit/route.js

import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
import { calculateMacros } from '@/lib/macroCalculator';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ── Generate unique referral code ────────────────────────────────────────
async function generateUniqueReferralCode() {
  let code;
  let isUnique = false;

  while (!isUnique) {
    const randomNum = Math.floor(Math.random() * 1000);
    const randomName = ['THOR', 'IRON', 'HULK', 'HAWK', 'BLACK', 'SPIDER', 'CAP', 'QUICK', 'WITCH', 'VISION'][Math.floor(Math.random() * 10)];
    code = `${randomName}${randomNum}`;

    const { data: existing } = await supabase
      .from('clients')
      .select('id')
      .eq('referral_code', code)
      .single();

    if (!existing) {
      isUnique = true;
    }
  }

  return code;
}

export async function POST(request) {
  try {
    const body = await request.json();

    const {
      firstName,
      lastName,
      email,
      phone,
      age,
      gender,
      heightInches,
      currentWeight,
      goalWeight,
      primaryGoal,
      experienceLevel,
      activityLevel,
      cardioPreference,
      mealsPerDay,
      dietaryType,
      allergies,
      cookingMethods,
      selectedFoods,
      planType,
      photoConsent,
      meal_pattern,
      referralCode,
    } = body;

    console.log('📥 FULL INTAKE DEBUG:', { 
      firstName, 
      lastName, 
      email, 
      photoConsent, 
      referralCode,
      referralCodeType: typeof referralCode,
      referralCodeTruthy: !!referralCode,
      referralCodeLength: referralCode?.length
    });

    // ── Count selected foods ──────────────────────────────────────────────
    let foodCount = 0;
    if (selectedFoods) {
      if (Array.isArray(selectedFoods)) {
        foodCount = selectedFoods.length;
      } else if (typeof selectedFoods === 'object') {
        Object.values(selectedFoods).forEach(category => {
          if (Array.isArray(category)) {
            foodCount += category.length;
          }
        });
      }
    }

    console.log('🍽️ Foods selected:', foodCount);

    // ── CALCULATE MACROS ─────────────────────────────────────────────────
    const macros = calculateMacros({
      currentWeight: parseFloat(currentWeight),
      heightInches: parseInt(heightInches),
      age: parseInt(age),
      gender,
      primaryGoal,
      activityLevel,
    });

    console.log('✅ Macros calculated:', macros);

    // ── Validate photo consent ────────────────────────────────────────────
    const validPhotoConsent = ['private', 'public'].includes(photoConsent) ? photoConsent : 'private';

    // ── Generate unique referral code for this client ─────────────────────
    const newReferralCode = await generateUniqueReferralCode();
    console.log('🎁 Generated referral code:', newReferralCode);

    // ── Create client record ──────────────────────────────────────────────
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .insert([
        {
          full_name: `${firstName} ${lastName}`,
          email,
          phone: phone || null,
          age: parseInt(age),
          gender,
          height: parseInt(heightInches),
          current_weight: parseFloat(currentWeight),
          goal_weight: parseFloat(goalWeight),
          primary_goal: primaryGoal,
          experience_level: experienceLevel,
          activity_level: activityLevel,
          cardio_duration: cardioPreference || null,
          meals_per_day: parseInt(mealsPerDay),
          meal_pattern: meal_pattern || 'balanced',
          dietary_restrictions: dietaryType || 'omnivore',
          allergies: allergies && allergies.length > 0 ? JSON.stringify(allergies) : null,
          cooking_methods: cookingMethods && cookingMethods.length > 0 ? JSON.stringify(cookingMethods) : null,
          selected_foods: selectedFoods ? JSON.stringify(selectedFoods) : null,
          plan_type: planType || null,

          // ✅ FIX: Set Kickstart upgrade window (7 days from purchase)
          ...(planType === 'kickstart' && {
            kickstart_purchased_at: new Date().toISOString(),
            kickstart_upgrade_expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          }),

          photo_consent: validPhotoConsent,
          referral_code: newReferralCode,
          referred_by: referralCode || null,
          payment_status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (clientError) {
      console.error('❌ SUPABASE ERROR:', {
        code: clientError.code,
        message: clientError.message,
        details: clientError.details,
      });
      return new Response(
        JSON.stringify({
          error: `Failed to create client: ${clientError.message}`,
          code: clientError.code,
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Client created:', clientData.id, 'with code:', newReferralCode);

    // ── PROCESS REFERRAL (record + discount only — reward created after payment) ──
    if (referralCode && referralCode.trim()) {
      console.log('🎁 Processing referral code...');

      const { data: referrerData, error: referrerError } = await supabase
        .from('clients')
        .select('id, full_name')
        .eq('referral_code', referralCode.toUpperCase())
        .single();

      if (referrerError) {
        console.warn('⚠️ Referrer not found for code:', referralCode);
      } else if (referrerData) {
        console.log('✅ Referrer found:', referrerData.id, referrerData.full_name);

        // 1. CREATE REFERRAL RECORD (status = pending_payment — not completed yet)
        const { data: referralRecord, error: referralError } = await supabase
          .from('referrals')
          .insert({
            referrer_client_id: referrerData.id,
            referred_client_id: clientData.id,
            referral_code: referralCode.toUpperCase(),
            status: 'pending_payment', // ✅ NOT completed until they pay
            created_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (referralError) {
          console.error('❌ Failed to create referral record:', referralError.message);
        } else {
          console.log('✅ Referral record created (pending_payment):', referralRecord.id);
        }

        // 2. CREATE 10% DISCOUNT FOR NEW CUSTOMER (so checkout can find it)
        try {
          const referralDiscountCoupon = await stripe.coupons.create({
            percent_off: 10,
            duration: 'once',
            max_redemptions: 1,
          });

          const discountExpires = new Date();
          discountExpires.setDate(discountExpires.getDate() + 30);

          const uniqueDiscountCode = `REF-${clientData.id.substring(0, 8).toUpperCase()}`;

          const { error: refDiscountError } = await supabase
            .from('reward_codes')
            .insert({
              code: uniqueDiscountCode,
              earned_by_client_id: clientData.id, // ✅ Discount belongs to NEW customer
              amount: 9.70,
              reward_type: 'referral_discount',
              status: 'active',
              expires_at: discountExpires.toISOString(),
              stripe_coupon_id: referralDiscountCoupon.id,
              created_at: new Date().toISOString(),
            });

          if (refDiscountError) {
            console.error('❌ Failed to create referral discount:', refDiscountError.message);
          } else {
            console.log('✅ 10% discount created for new customer:', clientData.id);
          }
        } catch (stripeErr) {
          console.error('❌ Stripe discount creation failed:', stripeErr.message);
        }

        // ❌ NO $40 REWARD HERE — that happens in the webhook after payment succeeds
      }
    }

    console.log('⏭️ Redirecting to payment page...');

    return new Response(
      JSON.stringify({
        success: true,
        clientId: clientData.id,
        referralCode: newReferralCode,
        foodCount: foodCount,
        photoConsent: validPhotoConsent,
        macros: macros,
        message: 'Intake form submitted successfully. Redirecting to payment...',
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('🔴 CATCH ERROR:', error.message, error.stack);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        type: error.constructor.name,
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
