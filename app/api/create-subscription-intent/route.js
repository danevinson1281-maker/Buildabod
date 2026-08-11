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
    const { clientId, plan, email } = body;

    console.log('🔗 Create subscription intent request:', { clientId, plan, email });

    if (!clientId || !plan || !email) {
      console.log('❌ Missing required fields');
      return new Response(
        JSON.stringify({ error: 'Missing required fields: clientId, plan, email' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Define subscription details
    const subscriptionPlans = {
      pro: {
        priceId: process.env.STRIPE_PRO_PRICE_ID,
        name: 'Pro',
      },
      elite: {
        priceId: process.env.STRIPE_ELITE_PRICE_ID,
        name: 'Elite',
      },
    };

    const planDetails = subscriptionPlans[plan];

    if (!planDetails) {
      console.log('❌ Invalid plan type:', plan);
      return new Response(
        JSON.stringify({ error: 'Invalid plan type' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    console.log('💳 Creating Stripe subscription checkout session:', {
      plan,
      priceId: planDetails.priceId,
      clientId,
    });

    const session = await stripe.checkout.sessions.create({
      customer_email: email,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: planDetails.priceId,
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/payment-success?plan=${plan}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/payment?plan=${plan}&clientId=${clientId}`,
      metadata: {
        clientId,
        plan,
        email,
      },
    });

    console.log('✅ Subscription checkout session created:', session.id);

    return new Response(
      JSON.stringify({ url: session.url, sessionId: session.id }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ Error creating subscription checkout session:', error.message);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to create checkout session' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
