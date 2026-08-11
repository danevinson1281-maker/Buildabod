// app/api/verify-magic-link/route.js

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  try {
    let { token } = await request.json();

    if (!token) {
      return new Response(
        JSON.stringify({ error: 'Missing token' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    token = token.trim();

    console.log('Verifying magic link token:', token.substring(0, 20) + '...');

    const { data: tokenData, error: tokenError } = await supabase
      .from('magic_link_tokens')
      .select('id, client_id, token, expires_at, used')
      .eq('token', token);

    if (tokenError) {
      console.error('Database error:', tokenError);
      return new Response(
        JSON.stringify({ error: 'Database error: ' + tokenError.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!tokenData || tokenData.length === 0) {
      console.error('Token not found in database');
      return new Response(
        JSON.stringify({ error: 'Invalid or expired login link. Please request a new one.' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const foundToken = tokenData[0];

    // ✅ Check if expired
    const expiresAt = new Date(foundToken.expires_at);
    const now = new Date();

    if (now > expiresAt) {
      console.error('Token expired');
      return new Response(
        JSON.stringify({ error: 'Your login link has expired. Please request a new one from your email.' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // ✅ DO NOT mark as used — clients need to access their dashboard repeatedly
    // The token stays valid until it expires (7 days)
    // localStorage handles session persistence after first login
    console.log('Token valid for client:', foundToken.client_id);

    return new Response(
      JSON.stringify({
        success: true,
        clientId: foundToken.client_id,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error verifying magic link:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Verification failed' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
