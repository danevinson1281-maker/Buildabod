import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  try {
    const {
      clientId,
      clientName,
      planType,
      feeling_rating,
      hit_macros,
      energy_level,
      sleep_quality,
      food_swap_requests,
      notes_for_dane,
    } = await request.json();

    if (!clientId) {
      return Response.json({ error: 'Missing clientId' }, { status: 400 });
    }

    // Check if client is allowed to submit check-in based on plan
    if (planType === 'kickstart') {
      return Response.json({ error: 'Check-ins are not available on the kickstart plan. Upgrade to Pro or Elite.' }, { status: 403 });
    }

    // For Pro plan — check they haven't submitted one this week
    if (planType === 'pro') {
      const startOfWeek = new Date();
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
      startOfWeek.setHours(0, 0, 0, 0);

      const { data: existingCheckins } = await supabase
        .from('check_ins')
        .select('id')
        .eq('client_id', clientId)
        .gte('created_at', startOfWeek.toISOString());

      if (existingCheckins && existingCheckins.length > 0) {
        return Response.json({
          error: 'You have already submitted your weekly check-in. Your next check-in is available next week.',
          alreadySubmitted: true,
        }, { status: 429 });
      }
    }

    // For Elite — check they haven't submitted one this week
    if (planType === 'elite') {
      const startOfWeek = new Date();
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
      startOfWeek.setHours(0, 0, 0, 0);

      const { data: existingCheckins } = await supabase
        .from('check_ins')
        .select('id')
        .eq('client_id', clientId)
        .gte('created_at', startOfWeek.toISOString());

      if (existingCheckins && existingCheckins.length > 0) {
        return Response.json({
          error: 'You have already submitted your weekly check-in. Your next check-in is available next week.',
          alreadySubmitted: true,
        }, { status: 429 });
      }
    }

    // Get week number
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const weekNumber = Math.ceil(((now - startOfYear) / 86400000 + startOfYear.getDay() + 1) / 7);

    // Save check-in
    const { data: checkin, error: checkinError } = await supabase
      .from('check_ins')
      .insert([{
        client_id: clientId,
        week_number: weekNumber,
        feeling_rating: feeling_rating || null,
        hit_macros: hit_macros || null,
        energy_level: energy_level || null,
        sleep_quality: sleep_quality || null,
        food_swap_requests: food_swap_requests || null,
        notes_for_dane: notes_for_dane || null,
      }])
      .select()
      .single();

    if (checkinError) throw checkinError;

    // Notify Dane by email
    try {
      const feelingStars = '⭐'.repeat(feeling_rating || 0);
      const macrosText = hit_macros === 'yes' ? 'Yes - nailed it!' : hit_macros === 'mostly' ? 'Mostly' : 'No';

      await resend.emails.send({
        from: 'BuildABod <noreply@buildabod.co>',
        to: 'dane@buildabod.co',
        subject: 'New Check-in from ' + clientName + ' (' + planType.toUpperCase() + ')',
        html: '<div style="font-family:Arial,sans-serif;background:#1a1a1a;color:#fff;padding:30px;border-radius:10px;max-width:600px">'
          + '<h2 style="color:#FFD700;margin-top:0">New Client Check-in</h2>'
          + '<p style="color:#ccc"><strong style="color:#fff">' + clientName + '</strong> (' + planType.toUpperCase() + ' plan) just submitted their check-in.</p>'
          + '<div style="background:#222;border-left:4px solid #FFD700;padding:16px;border-radius:4px;margin:20px 0">'
          + '<p style="margin:6px 0">Overall feeling: <strong style="color:#FFD700">' + feelingStars + ' (' + (feeling_rating || 0) + '/5)</strong></p>'
          + '<p style="margin:6px 0">Hit macros: <strong style="color:#FFD700">' + macrosText + '</strong></p>'
          + '<p style="margin:6px 0">Energy: <strong style="color:#FFD700">' + (energy_level || 'N/A') + '</strong></p>'
          + '<p style="margin:6px 0">Sleep: <strong style="color:#FFD700">' + (sleep_quality || 'N/A') + '</strong></p>'
          + '</div>'
          + (food_swap_requests ? '<div style="background:#222;padding:16px;border-radius:4px;margin:10px 0"><p style="margin:0;color:#ccc"><strong style="color:#fff">Food swap requests:</strong><br>' + food_swap_requests + '</p></div>' : '')
          + (notes_for_dane ? '<div style="background:#222;padding:16px;border-radius:4px;margin:10px 0"><p style="margin:0;color:#ccc"><strong style="color:#fff">Notes for Dane:</strong><br>' + notes_for_dane + '</p></div>' : '')
          + '<p style="color:#666;font-size:12px;margin-top:20px">View this client in your admin dashboard to respond and make adjustments.</p>'
          + '</div>',
      });
    } catch (emailErr) {
      console.log('Email notification failed (non-fatal):', emailErr);
    }

    return Response.json({ success: true, checkin });
  } catch (error) {
    console.error('Error submitting check-in:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');

    if (!clientId) {
      return Response.json({ error: 'Missing clientId' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('check_ins')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return Response.json({ success: true, checkins: data || [] });
  } catch (error) {
    console.error('Error fetching check-ins:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
