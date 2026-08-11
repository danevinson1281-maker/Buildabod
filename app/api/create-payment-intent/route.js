// app/api/create-payment-intent/route.js

import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  try {
    const body = await request.json();
    const { clientId, planType, amount, email } = body;

    console.log('💳 Create payment intent request:', { clientId, planType, amount, email });

    if (!clientId || !planType || !amount || !email) {
      console.log('❌ Missing required fields');
      return new Response(
        JSON.stringify({ error: 'Missing required fields: clientId, planType, amount, email' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log('📊 Creating Stripe payment intent for amount:', amount);
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount),
      currency: 'usd',
      metadata: {
        clientId,
        planType,
        email,
      },
    });

    console.log('✅ Payment intent created:', paymentIntent.id);

    return new Response(
      JSON.stringify({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ Error creating payment intent:', error.message);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to create payment intent' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
