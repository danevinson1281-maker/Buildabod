// app/api/admin/clients/[id]/regenerate/route.js

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request, { params }) {
  const { id: clientId } = await params;

  if (!clientId) {
    return Response.json({ error: 'Client ID required' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const mealPattern = body.meal_pattern || 'balanced';

    console.log('🔄 REGENERATE ENDPOINT - Client:', clientId, 'Pattern:', mealPattern);

    // ── Fetch client data ─────────────────────────────────────────────────
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .single();

    if (clientError || !client) {
      console.error('Client not found:', clientError);
      return Response.json({ error: 'Client not found' }, { status: 404 });
    }

    console.log('✅ Client found:', client.full_name);

    // ── Parse selected foods ──────────────────────────────────────────────
    let selectedFoods = [];
    if (client.selected_foods) {
      try {
        selectedFoods = typeof client.selected_foods === 'string'
          ? JSON.parse(client.selected_foods)
          : client.selected_foods;
      } catch (e) {
        console.warn('Could not parse selected_foods');
        selectedFoods = [];
      }
    }

    // ── Parse allergies ──────────────────────────────────────────────────
    let allergies = [];
    if (client.allergies) {
      try {
        allergies = typeof client.allergies === 'string'
          ? JSON.parse(client.allergies)
          : client.allergies || [];
      } catch (e) {
        allergies = [];
      }
    }

    // ── Call the main generator API ───────────────────────────────────────
    console.log('📤 Calling /api/generate-meal-plan with meal_pattern:', mealPattern);

    const generatorResponse = await fetch(new URL('/api/generate-meal-plan', process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
  clientId,
  meal_pattern: mealPattern, // ✅ ADD THIS AT TOP LEVEL
  clientData: {

          fullName: client.full_name,
          email: client.email,
          currentWeight: parseInt(client.current_weight) || 0,
          height: parseInt(client.height_inches) || parseInt(client.height) || 0,
          age: parseInt(client.age) || 0,
          gender: client.gender || 'male',
          primaryGoal: client.primary_goal,
          activityLevel: client.activity_level,
          selectedFoods: selectedFoods,
          mealsPerDay: parseInt(client.meals_per_day) || 3,
          mealVariety: client.meal_variety || 'mix',
          dietaryType: client.dietary_restrictions || 'omnivore',
          allergies: allergies,
        },
        planType: client.plan_type,
        meal_pattern: mealPattern, // ✅ PASS IT HERE
      }),
    });

    if (!generatorResponse.ok) {
      const errorData = await generatorResponse.json();
      console.error('Generator error:', errorData);
      throw new Error(errorData.error || 'Failed to generate meal plan');
    }

    const result = await generatorResponse.json();
    console.log('✅ Plan regenerated successfully');

    // ── Send email to client ──────────────────────────────────────────────
    try {
      console.log('📧 Sending regeneration email...');
      await fetch(new URL('/api/send-email', process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: client.email,
          subject: 'Your Meal Plan Has Been Regenerated!',
          html: `
            <h2>Hi ${client.full_name}!</h2>
            <p>Dane has regenerated your personalized meal plan with updated calculations.</p>
            <p>Log in to your account to view your new plan.</p>
            <p>Let's go! 💪</p>
          `,
        }),
      });
      console.log('✅ Email sent');
    } catch (emailErr) {
      console.warn('⚠️ Email send failed (non-blocking):', emailErr);
    }

    return Response.json({
      success: true,
      message: 'Meal plan regenerated and email sent to client!',
      mealPlanId: result.mealPlanId,
    });

  } catch (error) {
    console.error('❌ Regenerate error:', error.message);
    return Response.json(
      { error: error.message || 'Failed to regenerate meal plan' },
      { status: 500 }
    );
  }
}
