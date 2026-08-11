import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  try {
    const { checkinId, clientId, response } = await request.json();

    if (!checkinId || !clientId || !response?.trim()) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Save response to Supabase
    const { error: updateError } = await supabase
      .from('check_ins')
      .update({
        admin_response: response.trim(),
        admin_responded_at: new Date().toISOString(),
      })
      .eq('id', checkinId);

    if (updateError) {
      console.error('Supabase update error:', updateError);
      return Response.json({ error: 'Failed to save response' }, { status: 500 });
    }

    // Get client info for email
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('full_name, email')
      .eq('id', clientId)
      .single();

    if (clientError || !client) {
      return Response.json({ error: 'Client not found' }, { status: 404 });
    }

    // Send email notification to client
    const firstName = client.full_name?.split(' ')[0] || 'there';

    const emailHtml =
      '<!DOCTYPE html>' +
      '<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">' +
      '<title>Dane Responded to Your Check-in</title></head>' +
      '<body style="margin:0;padding:0;background-color:#000000;font-family:Arial,sans-serif;">' +
      '<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#000000;padding:40px 20px;">' +
      '<tr><td align="center">' +
      '<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">' +

      // Header
      '<tr><td style="background-color:#111111;border-top:3px solid #FFD700;border-radius:12px 12px 0 0;padding:32px;text-align:center;">' +
      '<h1 style="margin:0;font-size:28px;font-weight:900;color:#FFD700;letter-spacing:2px;">BUILD<span style="color:#ffffff;">A</span>BOD</h1>' +
      '<p style="margin:8px 0 0;color:#999999;font-size:13px;letter-spacing:1px;">BY DANE VINSON</p>' +
      '</td></tr>' +

      // Body
      '<tr><td style="background-color:#111111;padding:32px;">' +
      '<h2 style="margin:0 0 8px;color:#ffffff;font-size:22px;">Dane responded to your check-in 💪</h2>' +
      '<p style="margin:0 0 24px;color:#999999;font-size:15px;">Hey ' + firstName + ', Dane reviewed your check-in and left you a response.</p>' +

      // Response box
      '<div style="background-color:#1a1a1a;border-left:4px solid #FFD700;border-radius:8px;padding:20px 24px;margin-bottom:28px;">' +
      '<p style="margin:0 0 8px;color:#FFD700;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">Dane\'s Response</p>' +
      '<p style="margin:0;color:#ffffff;font-size:16px;line-height:1.7;">' + response.trim() + '</p>' +
      '</div>' +

      // CTA
      '<div style="text-align:center;margin-bottom:28px;">' +
      '<a href="' + process.env.NEXT_PUBLIC_BASE_URL + '/client-login" ' +
      'style="display:inline-block;background-color:#FFD700;color:#000000;font-weight:900;font-size:15px;' +
      'padding:14px 32px;border-radius:8px;text-decoration:none;letter-spacing:1px;">VIEW MY DASHBOARD</a>' +
      '</div>' +

      '<p style="margin:0;color:#666666;font-size:13px;text-align:center;">Log in to your dashboard to view your full check-in history and submit your next one.</p>' +
      '</td></tr>' +

      // Footer
      '<tr><td style="background-color:#0a0a0a;border-top:1px solid #222222;border-radius:0 0 12px 12px;padding:20px;text-align:center;">' +
`<p style="margin:0;color:#555555;font-size:12px;">© 2026–${new Date().getFullYear()} BuildABod.co — All rights reserved</p>` +
      '<p style="margin:6px 0 0;color:#555555;font-size:12px;">Questions? Email us at <a href="mailto:buildabod.co@gmail.com" style="color:#FFD700;text-decoration:none;">buildabod.co@gmail.com</a></p>' +
      '</td></tr>' +

      '</table>' +
      '</td></tr></table>' +
      '</body></html>';

    await resend.emails.send({
      from: 'BuildABod <noreply@buildabod.co>',
      to: client.email,
      subject: 'Dane responded to your check-in 💪',
      html: emailHtml,
    });

    return Response.json({ success: true });

  } catch (err) {
    console.error('respond-to-checkin error:', err);
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
}
