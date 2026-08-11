// /api/admin/update-and-send-plan/route.js

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
    const {
      clientId,
      mealsData,
      targetCalories,
      targetProteinG,
      targetCarbsG,
      targetFatsG,
      adminNote,
    } = body;

    if (!clientId || !mealsData || !targetCalories) {
      console.error('❌ Missing required fields');
      return Response.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    console.log('🔍 Updating plan for client:', clientId);

    // ── Get client ────────────────────────────────────────────────────────────
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .single();

    if (clientError || !client) {
      console.error('❌ Client not found:', clientError);
      return Response.json({ error: 'Client not found' }, { status: 404 });
    }

    console.log('✅ Client found:', client.full_name);

    // ── Get current meal plan ──────────────────────────────────────────────────
    const { data: currentPlans, error: plansError } = await supabase
      .from('meal_plans')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })
      .limit(1);

    if (plansError || !currentPlans || currentPlans.length === 0) {
      console.error('❌ No current meal plan found');
      return Response.json(
        { error: 'No meal plan found for this client' },
        { status: 404 }
      );
    }

    const currentPlan = currentPlans[0];

    // ── Update meal plan with new data ────────────────────────────────────────
    const { error: updateError } = await supabase
      .from('meal_plans')
      .update({
        meals_data: mealsData,
        target_calories: targetCalories,
        target_protein_g: targetProteinG,
        target_carbs_g: targetCarbsG,
        target_fats_g: targetFatsG,
        updated_at: new Date().toISOString(),
      })
      .eq('id', currentPlan.id);

    if (updateError) {
      console.error('❌ Failed to update meal plan:', updateError);
      return Response.json(
        { error: 'Failed to update meal plan' },
        { status: 500 }
      );
    }

    console.log('✅ Meal plan updated');

    // ── Record in meal plan history ────────────────────────────────────────────
    const { error: historyError } = await supabase
      .from('meal_plan_history')
      .insert({
        client_id: clientId,
        meal_plan_id: currentPlan.id,
        meals: mealsData.meals,
        substitutions: mealsData.substitutions,
        daily_calories: targetCalories,
        daily_protein: targetProteinG,
        daily_carbs: targetCarbsG,
        daily_fats: targetFatsG,
        action_type: 'updated',
        admin_notes: adminNote || 'Plan updated by Dane',
        status: 'active',
      });

    if (historyError) {
      console.warn('⚠️ Failed to record history:', historyError);
    } else {
      console.log('✅ History recorded');
    }

    // ── Send email to client ───────────────────────────────────────────────────
    const firstName = client.full_name?.split(' ')[0] || 'there';

    const emailHtml = buildPlanUpdateEmail({
      firstName,
      planType: client.plan_type,
      adminNote,
      targetCalories,
      targetProteinG,
      targetCarbsG,
      targetFatsG,
      previousCalories: currentPlan.target_calories,
      previousProtein: currentPlan.target_protein_g,
      previousCarbs: currentPlan.target_carbs_g,
      previousFats: currentPlan.target_fats_g,
    });

    try {
      const emailResult = await resend.emails.send({
        from: 'Dane @ BuildABod <noreply@buildabod.co>',
        to: client.email,
        subject: '✅ Your Meal Plan Has Been Updated!',
        html: emailHtml,
      });

      if (emailResult.error) {
        console.error('⚠️ Email error:', emailResult.error);
      } else {
        console.log('✅ Email sent to client');
      }
    } catch (emailErr) {
      console.error('❌ Email send failed:', emailErr);
    }

    return Response.json({
      success: true,
      message: 'Plan updated and client notified!',
      planId: currentPlan.id,
    });

  } catch (error) {
    console.error('❌ Catch error:', error);
    return Response.json(
      { error: error.message || 'Failed to update plan' },
      { status: 500 }
    );
  }
}

function buildPlanUpdateEmail({
  firstName,
  planType,
  adminNote,
  targetCalories,
  targetProteinG,
  targetCarbsG,
  targetFatsG,
  previousCalories,
  previousProtein,
  previousCarbs,
  previousFats,
}) {
  const calDiff = targetCalories - previousCalories;
  const protDiff = targetProteinG - previousProtein;
  const carbDiff = targetCarbsG - previousCarbs;
  const fatDiff = targetFatsG - previousFats;

  const formatDiff = (diff) => {
    if (diff === 0) return '—';
    return (diff > 0 ? '+' : '') + diff;
  };

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Plan Has Been Updated</title>
</head>
<body style="margin:0;padding:0;background-color:#000000;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#000000;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Header -->
        <tr><td style="background-color:#111111;border-top:4px solid #FFD700;border-radius:12px 12px 0 0;padding:36px 32px;text-align:center;">
          <h1 style="margin:0;font-size:32px;font-weight:900;color:#FFD700;letter-spacing:3px;">BUILD<span style="color:#ffffff;">A</span>BOD</h1>
          <p style="margin:8px 0 0;color:#888888;font-size:12px;letter-spacing:2px;text-transform:uppercase;">Custom Nutrition by Dane Vinson</p>
        </td></tr>

        <!-- Hero -->
        <tr><td style="background-color:#111111;padding:24px 32px;border-bottom:1px solid #222222;">
          <h2 style="margin:0 0 8px;color:#FFD700;font-size:24px;font-weight:900;">✅ Your Meal Plan Has Been Updated!</h2>
          <p style="margin:0;color:#999999;font-size:14px;line-height:1.6;">
            Based on your feedback, Dane has updated your personalized meal plan and macros.
          </p>
        </td></tr>

        <!-- Admin Note (if provided) -->
        ${adminNote ? `
        <tr><td style="background-color:#111111;padding:24px 32px;border-bottom:1px solid #222222;">
          <div style="background-color:#0a2a0a;border:1px solid #1a3a1a;border-left:4px solid #22c55e;border-radius:8px;padding:16px;">
            <p style="color:#22c55e;font-size:11px;font-weight:700;letter-spacing:1px;margin:0 0 8px;text-transform:uppercase;">Dane's Message</p>
            <p style="color:#cccccc;font-size:13px;line-height:1.6;margin:0;">${adminNote}</p>
          </div>
        </td></tr>
        ` : ''}

        <!-- Macro Changes -->
        <tr><td style="background-color:#111111;padding:24px 32px;border-bottom:1px solid #222222;">
          <p style="margin:0 0 12px;color:#FFD700;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">Your New Daily Macros</p>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="text-align:center;padding:16px 8px;background-color:#0a0a0a;border-radius:8px;">
                <div style="font-size:28px;font-weight:900;color:#FFD700;">${targetCalories}</div>
                <div style="font-size:10px;color:#666666;letter-spacing:1px;text-transform:uppercase;margin-top:4px;">Calories</div>
                <div style="font-size:9px;color:#888;margin-top:4px;">${formatDiff(calDiff)}</div>
              </td>
              <td style="width:8px;"></td>
              <td style="text-align:center;padding:16px 8px;background-color:#0a0a0a;border-radius:8px;">
                <div style="font-size:28px;font-weight:900;color:#ef4444;">${targetProteinG}g</div>
                <div style="font-size:10px;color:#666666;letter-spacing:1px;text-transform:uppercase;margin-top:4px;">Protein</div>
                <div style="font-size:9px;color:#888;margin-top:4px;">${formatDiff(protDiff)}g</div>
              </td>
              <td style="width:8px;"></td>
              <td style="text-align:center;padding:16px 8px;background-color:#0a0a0a;border-radius:8px;">
                <div style="font-size:28px;font-weight:900;color:#3b82f6;">${targetCarbsG}g</div>
                <div style="font-size:10px;color:#666666;letter-spacing:1px;text-transform:uppercase;margin-top:4px;">Carbs</div>
                <div style="font-size:9px;color:#888;margin-top:4px;">${formatDiff(carbDiff)}g</div>
              </td>
              <td style="width:8px;"></td>
              <td style="text-align:center;padding:16px 8px;background-color:#0a0a0a;border-radius:8px;">
                <div style="font-size:28px;font-weight:900;color:#22c55e;">${targetFatsG}g</div>
                <div style="font-size:10px;color:#666666;letter-spacing:1px;text-transform:uppercase;margin-top:4px;">Fats</div>
                <div style="font-size:9px;color:#888;margin-top:4px;">${formatDiff(fatDiff)}g</div>
              </td>
            </tr>
          </table>
        </td></tr>

        <!-- CTA Button -->
        <tr><td style="background-color:#111111;padding:24px 32px;border-bottom:1px solid #222222;text-align:center;">
          <a href="${process.env.NEXT_PUBLIC_BASE_URL}/dashboard" style="display:inline-block;background-color:#FFD700;color:#000000;font-weight:900;font-size:16px;padding:16px 40px;border-radius:10px;text-decoration:none;letter-spacing:1px;text-transform:uppercase;">View My Updated Plan →</a>
        </td></tr>

        <!-- Next Steps -->
        <tr><td style="background-color:#111111;padding:24px 32px;border-bottom:1px solid #222222;">
          <div style="background-color:#0a0a1f;border:1px solid #1a1a3a;border-left:4px solid #3b82f6;border-radius:8px;padding:16px;">
            <p style="margin:0 0 12px;color:#3b82f6;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">What's Next</p>
            <p style="margin:0 0 6px;color:#cccccc;font-size:13px;">1. Log in to your dashboard</p>
            <p style="margin:0 0 6px;color:#cccccc;font-size:13px;">2. Review your updated meals and macros</p>
            <p style="margin:0 0 6px;color:#cccccc;font-size:13px;">3. Download your PDF for easy reference</p>
            <p style="margin:0;color:#cccccc;font-size:13px;">4. Remember: you can swap any foods as long as serving sizes match</p>
          </div>
        </td></tr>

        <!-- Footer -->
        <tr><td style="background-color:#0a0a0a;border-top:1px solid #1a1a1a;border-radius:0 0 12px 12px;padding:20px 32px;text-align:center;">
          <p style="margin:0 0 4px;color:#444444;font-size:12px;font-weight:700;">BuildABod.co</p>
<p style="margin:0;color:#333333;font-size:11px;">© 2026–${new Date().getFullYear()} All rights reserved · Custom Nutrition by Dane Vinson</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
  `;
}
