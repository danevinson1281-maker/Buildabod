import { createClient } from '@supabase/supabase-js';
import { calculateMacros } from '@/lib/macroCalculator';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  try {
    // Verify admin token
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '').trim();

    if (!token) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let decoded;
    try {
      const raw = Buffer.from(token, 'base64').toString('utf-8');
      decoded = JSON.parse(raw);
    } catch (e) {
      return Response.json({ error: 'Invalid token' }, { status: 401 });
    }

    const adminEmail = process.env.ADMIN_EMAIL || 'dane@buildabod.co';
    if (!decoded?.email || decoded.email !== adminEmail) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ── Generate unique demo email ──────────────────────────────────────
    const timestamp = Date.now();
    const demoEmail = `demo-${timestamp}@buildabod.co`;

    // ── Generate unique referral code ──────────────────────────────────
    const newReferralCode = `DEMO${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

    // ── Calculate sample macros ────────────────────────────────────────
    const macros = calculateMacros({
      currentWeight: 185,
      heightInches: 70,
      age: 30,
      gender: 'male',
      primaryGoal: 'build-muscle',
      activityLevel: 'moderately-active',
    });

    // ── Create demo client ──────────────────────────────────────────────
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .insert([
        {
          full_name: 'Demo Client',
          email: demoEmail,
          phone: '(555) 123-4567',
          age: 30,
          gender: 'male',
          height: 70,
          current_weight: 185,
          goal_weight: 200,
          primary_goal: 'build-muscle',
          experience_level: 'intermediate',
          activity_level: 'moderately-active',
          cardio_duration: 'low',
          meals_per_day: 5,
          meal_pattern: 'balanced',
          dietary_restrictions: 'omnivore',
          allergies: JSON.stringify(['peanuts']),
          cooking_methods: JSON.stringify(['baked', 'grilled']),
          selected_foods: JSON.stringify({
            proteins: ['Chicken Breast', 'Salmon', 'Lean Ground Beef'],
            carbs: ['Brown Rice', 'Sweet Potato', 'Oats'],
            vegetables: ['Broccoli', 'Spinach', 'Bell Peppers'],
            fats: ['Olive Oil', 'Almonds', 'Avocado'],
            fruits: ['Banana', 'Blueberries', 'Apple'],
          }),
          plan_type: 'pro',
          photo_consent: 'private',
          referral_code: newReferralCode,
          payment_status: 'completed',
          client_status: 'active',
          subscription_status: 'active',
          subscription_tier: 'pro',
          stripe_customer_id: `demo_${timestamp}`,
          stripe_subscription_id: `demo_sub_${timestamp}`,
          subscription_started_at: new Date().toISOString(),
          subscription_next_billing_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          tier: null,
          payments_made: 1,
          is_demo: true, // ✅ KEY: Mark as demo
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (clientError) {
      console.error('Error creating demo client:', clientError);
      return Response.json({ error: clientError.message }, { status: 500 });
    }

    console.log('✅ Demo client created:', clientData.id, demoEmail);

    // ── Create sample meal plan ────────────────────────────────────────
    const sampleMeals = [
      { name: 'Breakfast', time: '7:00 AM', protein: 40, carbs: 60, fat: 15 },
      { name: 'Snack 1', time: '10:00 AM', protein: 20, carbs: 30, fat: 8 },
      { name: 'Lunch', time: '1:00 PM', protein: 45, carbs: 65, fat: 18 },
      { name: 'Snack 2', time: '4:00 PM', protein: 20, carbs: 30, fat: 8 },
      { name: 'Dinner', time: '7:00 PM', protein: 45, carbs: 55, fat: 20 },
    ];

    await supabase
      .from('meal_plans')
      .insert([
        {
          client_id: clientData.id,
          plan_type: 'weekly',
          macros: macros,
          meals: sampleMeals,
          shopping_list: ['Chicken Breast', 'Brown Rice', 'Broccoli', 'Olive Oil'],
          generated_at: new Date().toISOString(),
        },
      ]);

    // ── Create sample payment record ────────────────────────────────────
    await supabase
      .from('payments')
      .insert([
        {
          client_id: clientData.id,
          stripe_payment_id: `demo_${timestamp}`,
          amount: 127,
          currency: 'usd',
          status: 'succeeded',
          plan_type: 'pro',
          created_at: new Date().toISOString(),
        },
      ]);

    return Response.json({
      success: true,
      clientId: clientData.id,
      email: demoEmail,
      message: 'Demo client created successfully!',
    });

  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
