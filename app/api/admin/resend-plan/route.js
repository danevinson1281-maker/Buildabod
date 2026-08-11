// app/api/admin/resend-plan/route.js

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
    const { clientId } = await request.json();

    if (!clientId) {
      return Response.json({ error: 'Missing clientId' }, { status: 400 });
    }

    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .single();

    if (clientError || !client) {
      return Response.json({ error: 'Client not found' }, { status: 404 });
    }

    // ── Delete all old tokens for this client first ───────────────────────────
    await supabase
      .from('magic_link_tokens')
      .delete()
      .eq('client_id', clientId);

    console.log('🗑️ Old tokens cleared for resend');

    // ── Generate fresh 7-day token ────────────────────────────────────────────
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

    if (tokenError) throw tokenError;

    const loginUrl  = process.env.NEXT_PUBLIC_BASE_URL + '/dashboard?token=' + token;
    const firstName = client.full_name?.split(' ')[0] || 'there';

    const emailHtml =
      '<!DOCTYPE html>' +
      '<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>' +
      '<body style="margin:0;padding:0;background-color:#000000;font-family:Arial,sans-serif;">' +
      '<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#000000;padding:40px 20px;">' +
      '<tr><td align="center">' +
      '<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">' +

      '<tr><td style="background-color:#111111;border-top:4px solid #FFD700;border-radius:12px 12px 0 0;padding:36px 32px;text-align:center;">' +
      '<h1 style="margin:0;font-size:32px;font-weight:900;color:#FFD700;letter-spacing:3px;">BUILD<span style="color:#ffffff;">A</span>BOD</h1>' +
      '<p style="margin:8px 0 0;color:#888888;font-size:12px;letter-spacing:2px;">Custom Nutrition by Dane Vinson</p>' +
      '</td></tr>' +

      '<tr><td style="background-color:#111111;padding:36px 32px;">' +
      '<h2 style="margin:0 0 12px;color:#ffffff;font-size:22px;font-weight:900;">Hey ' + firstName + ', here\'s your fresh access link 🔗</h2>' +
      '<p style="margin:0 0 28px;color:#999999;font-size:15px;line-height:1.7;">' +
      'Your previous link may have expired. Here\'s a brand new one valid for <strong style="color:#FFD700;">7 days.</strong>' +
      '</p>' +

      '<div style="text-align:center;margin-bottom:24px;">' +
      '<a href="' + loginUrl + '" style="display:inline-block;background-color:#FFD700;color:#000000;font-weight:900;font-size:16px;padding:18px 40px;border-radius:10px;text-decoration:none;letter-spacing:1px;text-transform:uppercase;">View My Meal Plan →</a>' +
      '</div>' +

      '<div style="background-color:#0a0a0a;border:1px solid #1a1a1a;border-radius:8px;padding:14px;text-align:center;margin-bottom:24px;">' +
      '<p style="margin:0 0 6px;color:#666666;font-size:11px;">Button not working? Copy this link:</p>' +
      '<p style="margin:0;color:#FFD700;font-size:11px;word-break:break-all;">' + loginUrl + '</p>' +
      '</div>' +

      '<p style="margin:0;color:#666666;font-size:13px;text-align:center;">' +
      'Questions? Email <a href="mailto:dane@buildabod.co" style="color:#FFD700;text-decoration:none;">dane@buildabod.co</a>' +
      '</p>' +
      '</td></tr>' +

      '<tr><td style="background-color:#0a0a0a;border-top:1px solid #1a1a1a;border-radius:0 0 12px 12px;padding:20px;text-align:center;">' +
`<p style="margin:0;color:#333333;font-size:11px;">© 2026–${new Date().getFullYear()} BuildABod.co · Custom Nutrition by Dane Vinson</p>` +
      '</td></tr>' +

      '</table></td></tr></table>' +
      '</body></html>';

    await resend.emails.send({
      from:    'Dane @ BuildABod <noreply@buildabod.co>',
      to:      client.email,
      subject: 'Your BuildABod Access Link — ' + firstName,
      html:    emailHtml,
    });

    console.log('✅ Resend plan email sent to:', client.email);

    return Response.json({ success: true, message: 'Plan link resent to client' });

  } catch (error) {
    console.error('Resend plan error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
