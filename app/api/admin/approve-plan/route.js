// app/api/admin/approve-plan/route.js

export const dynamic = 'force-dynamic';

import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import crypto from 'crypto';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  try {
    const body = await request.json();
    const { clientId } = body;

    if (!clientId) {
      console.error('❌ No clientId provided');
      return Response.json({ error: 'Missing clientId' }, { status: 400 });
    }

    console.log('🔍 Approving plan for client:', clientId);

    // ── Get client ────────────────────────────────────────────────────────────
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .single();

    if (clientError || !client) {
      console.error('❌ Client fetch error:', clientError);
      return Response.json({ error: 'Client not found' }, { status: 404 });
    }

    console.log('✅ Client found:', client.full_name);

    // ── Debug: Verify intake data is present ──────────────────────────────────
    console.log('🔍 INTAKE CHECK:', {
      age: client.age,
      gender: client.gender,
      height_inches: client.height_inches,
      current_weight: client.current_weight,
      goal_weight: client.goal_weight,
      primary_goal: client.primary_goal,
      experience_level: client.experience_level,
      activity_level: client.activity_level,
      meals_per_day: client.meals_per_day,
      meal_variety: client.meal_variety,
    });

    // ── Get meal plan ─────────────────────────────────────────────────────────
    const { data: plans, error: planError } = await supabase
      .from('meal_plans')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });

    if (planError || !plans || plans.length === 0) {
      console.error('❌ No meal plan found');
      return Response.json({ error: 'No meal plan found for this client' }, { status: 404 });
    }

    const existingPlan = plans[0];

    // ── Read macros from correct columns (target_*) ───────────────────────────
    const planCalories = existingPlan.target_calories  || 0;
    const planProtein  = existingPlan.target_protein_g || 0;
    const planCarbs    = existingPlan.target_carbs_g   || 0;
    const planFats     = existingPlan.target_fats_g    || 0;

    console.log('✅ Meal plan macros:', { planCalories, planProtein, planCarbs, planFats });

    // ── Update meal plan status to approved ───────────────────────────────────
    console.log('📝 Attempting to update plan:', { planId: existingPlan.id, currentStatus: existingPlan.status });
    
    const { error: updatePlanError, data: updateData } = await supabase
      .from('meal_plans')
      .update({
        status:     'approved',
        updated_at: new Date().toISOString(),
      })
      .eq('id', existingPlan.id)
      .select();

    if (updatePlanError) {
      console.error('❌ Meal plan update error:', updatePlanError);
      return Response.json({ error: 'Failed to update meal plan: ' + updatePlanError.message }, { status: 500 });
    }

    console.log('✅ Meal plan status updated to approved', { updated: updateData });

    // ── Update the client's meal_plan_generated flag immediately ─────────────
    const { error: flagError } = await supabase
      .from('clients')
      .update({
  plan_approved_at: new Date().toISOString(),
  plan_sent_at: new Date().toISOString(),
})

      .eq('id', clientId);

    if (flagError) {
      console.error('⚠️ Flag update error:', flagError);
      return Response.json({ error: 'Failed to update client flag: ' + flagError.message }, { status: 500 });
    }

    console.log('✅ Client meal_plan_generated flag set to true');

    // ── Delete old tokens before creating new one ─────────────────────────────
    await supabase
      .from('magic_link_tokens')
      .delete()
      .eq('client_id', clientId);

    console.log('🗑️ Old tokens cleared');

    // ── Generate fresh 7-day magic link token ─────────────────────────────────
    const token     = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const { error: tokenError } = await supabase
      .from('magic_link_tokens')
      .insert({
        client_id:  clientId,
        token:      token,
        expires_at: expiresAt.toISOString(),
      });

    if (tokenError) {
      console.error('❌ Token insert error:', tokenError);
      return Response.json({ error: 'Failed to create magic link' }, { status: 500 });
    }

    console.log('✅ Magic link token created (7 days)');

    // ── Build login URL ───────────────────────────────────────────────────────
    const loginUrl = process.env.NEXT_PUBLIC_BASE_URL + '/dashboard?token=' + token;

    // ── Prepare display values ────────────────────────────────────────────────
    const firstName = client.full_name?.split(' ')[0] || 'there';

    // Format height from inches to feet'inches"
    const heightDisplay = (() => {
      const inches = client.height_inches || client.height;
      if (!inches) return 'N/A';
      const ft = Math.floor(Number(inches) / 12);
      const rem = Number(inches) % 12;
      return ft + "'" + rem + '"';
    })();

    // Format allergies array
    const allergiesDisplay = (() => {
      if (!client.allergies) return 'None';
      try {
        const parsed = typeof client.allergies === 'string'
          ? JSON.parse(client.allergies)
          : client.allergies;
        return Array.isArray(parsed) && parsed.length > 0 ? parsed.join(', ') : 'None';
      } catch (e) {
        return client.allergies || 'None';
      }
    })();

    // Format cooking methods array
    const cookingDisplay = (() => {
      if (!client.cooking_methods) return 'N/A';
      try {
        const parsed = typeof client.cooking_methods === 'string'
          ? JSON.parse(client.cooking_methods)
          : client.cooking_methods;
        return Array.isArray(parsed) && parsed.length > 0 ? parsed.join(', ') : 'N/A';
      } catch (e) {
        return 'N/A';
      }
    })();

    // Format goal label
    const goalDisplay = (() => {
      const goals = {
        'fat-loss': 'Fat Loss',
        'muscle-gain': 'Muscle Gain',
        'body-recomp': 'Body Recomposition',
        'maintain': 'Maintain Weight',
      };
      return goals[client.primary_goal] || client.primary_goal || 'N/A';
    })();

    // Format experience label
    const experienceDisplay = (() => {
      const levels = {
        'beginner': 'Beginner',
        'intermediate': 'Intermediate',
        'advanced': 'Advanced',
      };
      return levels[client.experience_level] || client.experience_level || 'N/A';
    })();

    // Format activity label
    const activityDisplay = (() => {
      const levels = {
        'sedentary': 'Sedentary',
        'lightly-active': 'Lightly Active',
        'moderately-active': 'Moderately Active',
        'very-active': 'Very Active',
        'extremely-active': 'Extremely Active',
      };
      return levels[client.activity_level] || client.activity_level || 'N/A';
    })();

    // Format dietary type
    const dietDisplay = (() => {
      const types = {
        'omnivore': 'Omnivore',
        'vegetarian': 'Vegetarian',
        'vegan': 'Vegan',
        'pescatarian': 'Pescatarian',
        'keto': 'Keto',
        'paleo': 'Paleo',
      };
      return types[client.dietary_restrictions] || client.dietary_restrictions || 'Omnivore';
    })();

    // Format meal variety
    const varietyDisplay = (() => {
      const options = {
        'same': 'Same Every Day',
        'mix': 'Mix It Up',
      };
      return options[client.meal_variety] || client.meal_variety || 'N/A';
    })();

    // Store all values in variables so string concat can't fail
    const clientAge = client.age != null ? String(client.age) : 'N/A';
    const clientGender = client.gender ? client.gender.charAt(0).toUpperCase() + client.gender.slice(1) : 'N/A';
    const clientWeight = client.current_weight != null ? String(client.current_weight) : 'N/A';
    const clientGoalWeight = client.goal_weight != null ? String(client.goal_weight) : 'N/A';
    const clientMeals = client.meals_per_day != null ? String(client.meals_per_day) : 'N/A';
    const clientPlan = client.plan_type ? client.plan_type.toUpperCase() : 'N/A';
    const clientPayment = client.payment_status || 'N/A';

    console.log('🔍 EMAIL VALUES:', {
      clientAge, clientGender, heightDisplay, clientWeight,
      clientGoalWeight, goalDisplay, experienceDisplay, activityDisplay,
      clientMeals, varietyDisplay, dietDisplay, allergiesDisplay, cookingDisplay
    });

    // ── Build email HTML ──────────────────────────────────────────────────────
    const emailHtml = [
      '<!DOCTYPE html>',
      '<html lang="en"><head>',
      '<meta charset="UTF-8">',
      '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
      '<title>Your Meal Plan is Ready</title>',
      '</head>',
      '<body style="margin:0;padding:0;background-color:#000000;font-family:Arial,sans-serif;">',

      '<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#000000;padding:40px 20px;">',
      '<tr><td align="center">',
      '<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">',

      // Header
      '<tr><td style="background-color:#111111;border-top:4px solid #FFD700;border-radius:12px 12px 0 0;padding:36px 32px;text-align:center;">',
      '<h1 style="margin:0;font-size:32px;font-weight:900;color:#FFD700;letter-spacing:3px;">BUILD<span style="color:#ffffff;">A</span>BOD</h1>',
      '<p style="margin:8px 0 0;color:#888888;font-size:12px;letter-spacing:2px;text-transform:uppercase;">Custom Nutrition by Dane Vinson</p>',
      '</td></tr>',

      // Client Information Section
      '<tr><td style="background-color:#111111;padding:24px 32px;border-bottom:1px solid #222222;">',
      '<p style="margin:0 0 14px;color:#FFD700;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">Client Information</p>',
      '<table width="100%" cellpadding="0" cellspacing="0">',
      '<tr><td style="padding:6px 0;"><span style="color:#888;font-size:12px;">Name:</span> <span style="color:#fff;font-size:12px;font-weight:bold;">' + client.full_name + '</span></td>',
      '<td style="padding:6px 0;"><span style="color:#888;font-size:12px;">Email:</span> <span style="color:#fff;font-size:12px;font-weight:bold;">' + client.email + '</span></td></tr>',

      '<tr><td style="padding:6px 0;"><span style="color:#888;font-size:12px;">Age:</span> <span style="color:#fff;font-size:12px;font-weight:bold;">' + clientAge + '</span></td>',
      '<td style="padding:6px 0;"><span style="color:#888;font-size:12px;">Gender:</span> <span style="color:#fff;font-size:12px;font-weight:bold;">' + clientGender + '</span></td></tr>',

      '<tr><td style="padding:6px 0;"><span style="color:#888;font-size:12px;">Height:</span> <span style="color:#fff;font-size:12px;font-weight:bold;">' + heightDisplay + '</span></td>',
      '<td style="padding:6px 0;"><span style="color:#888;font-size:12px;">Current Weight:</span> <span style="color:#fff;font-size:12px;font-weight:bold;">' + clientWeight + ' lbs</span></td></tr>',

      '<tr><td style="padding:6px 0;"><span style="color:#888;font-size:12px;">Goal Weight:</span> <span style="color:#fff;font-size:12px;font-weight:bold;">' + clientGoalWeight + ' lbs</span></td>',
      '<td style="padding:6px 0;"><span style="color:#888;font-size:12px;">Goal:</span> <span style="color:#fff;font-size:12px;font-weight:bold;">' + goalDisplay + '</span></td></tr>',

      '<tr><td style="padding:6px 0;"><span style="color:#888;font-size:12px;">Experience:</span> <span style="color:#fff;font-size:12px;font-weight:bold;">' + experienceDisplay + '</span></td>',
      '<td style="padding:6px 0;"><span style="color:#888;font-size:12px;">Activity Level:</span> <span style="color:#fff;font-size:12px;font-weight:bold;">' + activityDisplay + '</span></td></tr>',

      '<tr><td colspan="2" style="padding:6px 0;"><span style="color:#888;font-size:12px;">Dietary Type:</span> <span style="color:#fff;font-size:12px;font-weight:bold;">' + dietDisplay + '</span></td></tr>',
      '<tr><td colspan="2" style="padding:6px 0;"><span style="color:#888;font-size:12px;">Allergies:</span> <span style="color:#fff;font-size:12px;font-weight:bold;">' + allergiesDisplay + '</span></td></tr>',
      '<tr><td colspan="2" style="padding:6px 0;"><span style="color:#888;font-size:12px;">Preferred Cooking:</span> <span style="color:#fff;font-size:12px;font-weight:bold;">' + cookingDisplay + '</span></td></tr>',
      '<tr><td style="padding:6px 0;"><span style="color:#888;font-size:12px;">Meals/Day:</span> <span style="color:#fff;font-size:12px;font-weight:bold;">' + clientMeals + '</span></td>',
      '<td style="padding:6px 0;"><span style="color:#888;font-size:12px;">Meal Variety:</span> <span style="color:#fff;font-size:12px;font-weight:bold;">' + varietyDisplay + '</span></td></tr>',
      '</table>',
      '</td></tr>',

      // Intake Summary Section (Plan & Payment)
      '<tr><td style="background-color:#111111;padding:24px 32px;border-bottom:1px solid #222222;">',
      '<p style="margin:0 0 14px;color:#FFD700;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">Plan Details</p>',
      '<table width="100%" cellpadding="0" cellspacing="0">',
      '<tr><td style="padding:6px 0;"><span style="color:#888;font-size:12px;">Plan:</span> <span style="color:#FFD700;font-size:12px;font-weight:bold;">' + clientPlan + '</span></td>',
      '<td style="padding:6px 0;"><span style="color:#888;font-size:12px;">Payment Status:</span> <span style="color:#fff;font-size:12px;font-weight:bold;">' + clientPayment + '</span></td></tr>',
      '<tr><td colspan="2" style="padding:6px 0;"><span style="color:#888;font-size:12px;">Client ID:</span> <span style="color:#666;font-size:11px;font-family:monospace;">' + clientId + '</span></td></tr>',
      '</table>',
      '</td></tr>',

      // Hero
      '<tr><td style="background-color:#111111;padding:24px 32px;border-bottom:1px solid #222222;">',
      '<h2 style="margin:0 0 8px;color:#ffffff;font-size:20px;font-weight:900;">Your Meal Plan is Ready! 🎉</h2>',
      '<p style="margin:0;color:#999999;font-size:14px;line-height:1.6;">',
      'Dane personally reviewed your intake and built your custom meal plan around <strong style="color:#FFD700;">your body, your goals, and the foods you love.</strong>',
      '</p>',
      '</td></tr>',

      // Macro cards
      '<tr><td style="background-color:#111111;padding:24px 32px;border-bottom:1px solid #222222;">',
      '<p style="margin:0 0 12px;color:#FFD700;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">Your Daily Macro Targets</p>',
      '<table width="100%" cellpadding="0" cellspacing="0">',
      '<tr>',
      '<td style="text-align:center;padding:16px 8px;background-color:#0a0a0a;border-radius:8px;">',
      '<div style="font-size:28px;font-weight:900;color:#FFD700;">' + planCalories + '</div>',
      '<div style="font-size:10px;color:#666666;letter-spacing:1px;text-transform:uppercase;margin-top:4px;">Calories</div>',
      '</td>',
      '<td style="width:8px;"></td>',
      '<td style="text-align:center;padding:16px 8px;background-color:#0a0a0a;border-radius:8px;">',
      '<div style="font-size:28px;font-weight:900;color:#ef4444;">' + planProtein + 'g</div>',
      '<div style="font-size:10px;color:#666666;letter-spacing:1px;text-transform:uppercase;margin-top:4px;">Protein</div>',
      '</td>',
      '<td style="width:8px;"></td>',
      '<td style="text-align:center;padding:16px 8px;background-color:#0a0a0a;border-radius:8px;">',
      '<div style="font-size:28px;font-weight:900;color:#3b82f6;">' + planCarbs + 'g</div>',
      '<div style="font-size:10px;color:#666666;letter-spacing:1px;text-transform:uppercase;margin-top:4px;">Carbs</div>',
      '</td>',
      '<td style="width:8px;"></td>',
      '<td style="text-align:center;padding:16px 8px;background-color:#0a0a0a;border-radius:8px;">',
      '<div style="font-size:28px;font-weight:900;color:#22c55e;">' + planFats + 'g</div>',
      '<div style="font-size:10px;color:#666666;letter-spacing:1px;text-transform:uppercase;margin-top:4px;">Fats</div>',
      '</td>',
      '</tr>',
      '</table>',
      '</td></tr>',

      // CTA Button
      '<tr><td style="background-color:#111111;padding:24px 32px;border-bottom:1px solid #222222;text-align:center;">',
      '<a href="' + loginUrl + '" style="display:inline-block;background-color:#FFD700;color:#000000;font-weight:900;font-size:16px;padding:16px 40px;border-radius:10px;text-decoration:none;letter-spacing:1px;text-transform:uppercase;">View My Meal Plan →</a>',
      '</td></tr>',

      // Fallback link
      '<tr><td style="background-color:#111111;padding:24px 32px;border-bottom:1px solid #222222;">',
      '<div style="background-color:#0a0a0a;border:1px solid #1a1a1a;border-radius:8px;padding:12px;">',
      '<p style="margin:0 0 6px;color:#666666;font-size:11px;">Button not working? Copy this link into your browser:</p>',
      '<p style="margin:0;color:#FFD700;font-size:11px;word-break:break-all;">' + loginUrl + '</p>',
      '</div>',
      '</td></tr>',

      // Next steps
      '<tr><td style="background-color:#111111;padding:24px 32px;border-bottom:1px solid #222222;">',
      '<div style="background-color:#0a1f0a;border:1px solid #1a3a1a;border-left:4px solid #22c55e;border-radius:8px;padding:16px;">',
      '<p style="margin:0 0 12px;color:#22c55e;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">Getting Started</p>',
      '<p style="margin:0 0 6px;color:#cccccc;font-size:13px;">1. Click the button above to access your dashboard</p>',
      '<p style="margin:0 0 6px;color:#cccccc;font-size:13px;">2. Review your meals and macro targets</p>',
      '<p style="margin:0 0 6px;color:#cccccc;font-size:13px;">3. Download your PDF for easy offline reference</p>',
      '<p style="margin:0 0 6px;color:#cccccc;font-size:13px;">4. Log your weight weekly to track progress</p>',
      '<p style="margin:0;color:#cccccc;font-size:13px;">5. Stay consistent — results always follow 💪</p>',
      '</div>',
      '</td></tr>',

      // Plan features (conditional)
      client.plan_type === 'pro' ? [
        '<tr><td style="background-color:#111111;padding:24px 32px;border-bottom:1px solid #222222;">',
        '<div style="background-color:#0a0a1f;border:1px solid #1a1a3a;border-left:4px solid #3b82f6;border-radius:8px;padding:16px;">',
        '<p style="margin:0 0 12px;color:#3b82f6;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">Your Pro Plan Includes</p>',
        '<p style="margin:0 0 6px;color:#cccccc;font-size:13px;">✓ Monthly check-in with Dane</p>',
        '<p style="margin:0 0 6px;color:#cccccc;font-size:13px;">✓ Monthly photo review & feedback</p>',
        '<p style="margin:0 0 6px;color:#cccccc;font-size:13px;">✓ Monthly macro adjustments</p>',
        '<p style="margin:0;color:#cccccc;font-size:13px;">✓ Unlimited food swaps in your dashboard</p>',
        '</div>',
        '</td></tr>',
      ].join('') : client.plan_type === 'elite' ? [
        '<tr><td style="background-color:#111111;padding:24px 32px;border-bottom:1px solid #222222;">',
        '<div style="background-color:#1a0a00;border:1px solid #3a1a00;border-left:4px solid #FFD700;border-radius:8px;padding:16px;">',
        '<p style="margin:0 0 12px;color:#FFD700;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">Your Elite Plan Includes</p>',
        '<p style="margin:0 0 6px;color:#cccccc;font-size:13px;">✓ Weekly check-ins with Dane</p>',
        '<p style="margin:0 0 6px;color:#cccccc;font-size:13px;">✓ Weekly photo review & feedback</p>',
        '<p style="margin:0 0 6px;color:#cccccc;font-size:13px;">✓ Weekly macro adjustments</p>',
        '<p style="margin:0 0 6px;color:#cccccc;font-size:13px;">✓ Unlimited food swaps in your dashboard</p>',
        '<p style="margin:0;color:#cccccc;font-size:13px;">✓ Priority support within 12 hours</p>',
        '</div>',
        '</td></tr>',
      ].join('') : '',

            // Footer
      '<tr><td style="background-color:#0a0a0a;border-top:1px solid #1a1a1a;border-radius:0 0 12px 12px;padding:20px 32px;text-align:center;">',
      '<p style="margin:0 0 4px;color:#444444;font-size:12px;font-weight:700;">BuildABod.co</p>',
      `<p style="margin:0;color:#333333;font-size:11px;">© 2026–${new Date().getFullYear()} All rights reserved · Custom Nutrition by Dane Vinson</p>`,
      '</td></tr>',


      '</table>',
      '</td></tr></table>',
      '</body></html>',
    ].join('');

    console.log('📧 Sending approval email to:', client.email);

    const emailResult = await resend.emails.send({
      from:    'Dane @ BuildABod <noreply@buildabod.co>',
      to:      client.email,
      subject: '🎉 Your Custom Meal Plan is Ready, ' + firstName + '!',
      html:    emailHtml,
    });

    if (emailResult.error) {
      console.error('⚠️ Email error:', emailResult.error);
    } else {
      console.log('✅ Approval email sent');
    }

    // ── Record in plan history ────────────────────────────────────────────────
    await supabase
      .from('meal_plan_history')
      .insert([{
        client_id:      clientId,
        meal_plan_id:   existingPlan.id,
        meals:          existingPlan.meals_data,
        substitutions:  existingPlan.substitutions,
        daily_calories: planCalories,
        daily_protein:  planProtein,
        daily_carbs:    planCarbs,
        daily_fats:     planFats,
        action_type:    'approved',
        admin_notes:    'Plan approved and sent to client',
        status:         'active',
      }]);

    console.log('✅ Plan approved and history recorded!');

    return Response.json({
      success: true,
      message: 'Plan approved! Client notified via email.',
    });

  } catch (error) {
    console.error('❌ Catch error:', error);
    return Response.json(
      { error: error.message || 'Failed to approve plan' },
      { status: 500 }
    );
  }
}
