// app/api/send-magic-link/route.js

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
    const { email } = await request.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log('Sending magic link to:', email);

    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('email', email)
      .single();

    if (clientError || !client) {
      // Always return success to prevent email enumeration
      return new Response(
        JSON.stringify({
          success: true,
          message: 'If that email is in our system, we sent a login link.',
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log('Client found:', client.id, client.full_name);

    // ✅ FIX 1: Delete old tokens for this client before creating new one
    await supabase
      .from('magic_link_tokens')
      .delete()
      .eq('client_id', client.id);

    // ✅ FIX 2: 7-day expiry instead of 30 minutes
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const { error: tokenError } = await supabase
      .from('magic_link_tokens')
      .insert({
        client_id: client.id,
        token: token,
        expires_at: expiresAt.toISOString(),
      });

    if (tokenError) {
      console.error('Error creating token:', tokenError);
      return new Response(
        JSON.stringify({ error: 'Failed to create login link' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log('Token created successfully');

    // ✅ FIX 3: Correct URL path /dashboard not /client-dashboard
    const loginUrl = process.env.NEXT_PUBLIC_BASE_URL + '/dashboard?token=' + token;

    console.log('Login URL:', loginUrl);

    const emailHtml = '<!DOCTYPE html>'
      + '<html lang="en"><head><meta charset="UTF-8">'
      + '<meta name="viewport" content="width=device-width, initial-scale=1.0">'
      + '<style>'
      + '* { margin: 0; padding: 0; box-sizing: border-box; }'
      + 'body { font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif; background: #000; color: #fff; line-height: 1.6; }'
      + '.container { max-width: 600px; margin: 0 auto; background: #1a1a1a; }'
      + '.header { background: linear-gradient(135deg, #FFD700 0%, #FFC700 100%); padding: 40px 20px; text-align: center; }'
      + '.header h1 { color: #000; margin: 0; font-size: 28px; font-weight: 700; }'
      + '.content { padding: 40px 20px; color: #e0e0e0; }'
      + '.content h2 { color: #FFD700; font-size: 20px; margin: 20px 0 15px 0; }'
      + '.content p { margin: 0 0 15px 0; font-size: 15px; }'
      + '.button-container { text-align: center; margin: 30px 0; }'
      + '.link-button { background: #FFD700; color: #000; padding: 18px 48px; text-decoration: none; border-radius: 8px; font-size: 18px; font-weight: 700; display: inline-block; }'
      + '.backup { background: #2a2a2a; border-left: 4px solid #FFD700; padding: 16px 20px; margin: 20px 0; border-radius: 4px; word-break: break-all; }'
      + '.backup p { font-size: 13px; color: #999; margin-bottom: 8px; }'
      + '.backup a { color: #FFD700; text-decoration: none; font-size: 13px; }'
      + '.notice { background: #2a2a2a; border-left: 4px solid #22c55e; padding: 14px 20px; margin: 20px 0; border-radius: 4px; font-size: 13px; color: #ccc; }'
      + '.footer { background: #0a0a0a; padding: 30px 20px; text-align: center; color: #666; font-size: 12px; border-top: 1px solid #333; }'
      + '</style></head><body>'
      + '<div class="container">'
      + '<div class="header"><h1>Your Login Link</h1></div>'
      + '<div class="content">'
      + '<p>Hey ' + client.full_name + ',</p>'
      + '<h2>Access Your Custom Meal Plan</h2>'
      + '<p>Click the button below to view your personalized meal plan, track your progress, and submit your check-ins.</p>'
      + '<div class="button-container">'
      + '<a href="' + loginUrl + '" class="link-button">Access My Meal Plan</a>'
      + '</div>'
      + '<div class="backup">'
      + '<p>Button not working? Copy and paste this link into your browser:</p>'
      + '<a href="' + loginUrl + '">' + loginUrl + '</a>'
      + '</div>'
      + '<div class="notice">'
      + 'This link expires in <strong>7 days</strong>. After that, just request a new one from the login page.'
      + '</div>'
      + '<p style="font-size:13px;color:#888;margin-top:20px">Questions? Reply to this email or contact <a href="mailto:dane@buildabod.co" style="color:#FFD700">dane@buildabod.co</a></p>'
      + '</div>'
      + '<div class="footer"><p><strong>BuildABod by Dane Vinson</strong></p><p>2026 All rights reserved</p></div>'
      + '</div></body></html>';

    const emailResult = await resend.emails.send({
      from: 'Dane @ BuildABod <noreply@buildabod.co>',
      to: client.email,
      subject: 'Your BuildABod Login Link',
      html: emailHtml,
    });

    if (emailResult.error) {
      console.error('Email send error:', emailResult.error);
      return new Response(
        JSON.stringify({ error: 'Failed to send login link' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log('Magic link email sent to:', client.email);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Login link sent! Check your email.',
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error sending magic link:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to send login link' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
