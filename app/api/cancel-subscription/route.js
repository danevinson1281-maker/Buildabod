import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey)

export async function POST(request) {
  try {
    const { clientId } = await request.json()

    if (!clientId) {
      return Response.json({ error: 'Client ID required' }, { status: 400 })
    }

    // Get client data to find subscription ID
    const { data: client, error: clientError } = await supabaseAdmin
      .from('clients')
      .select('stripe_subscription_id, subscription_status')
      .eq('id', clientId)
      .single()

    if (clientError || !client) {
      return Response.json({ error: 'Client not found' }, { status: 404 })
    }

    // Check if client has an active subscription
    if (!client.stripe_subscription_id) {
      return Response.json(
        { error: 'No active subscription found' },
        { status: 400 }
      )
    }

    // Cancel the Stripe subscription
    try {
      await stripe.subscriptions.del(client.stripe_subscription_id)
    } catch (stripeError) {
      console.error('Stripe error:', stripeError)
      // Continue anyway - update database even if Stripe fails
    }

    // Update client subscription status in database
    const { data: updatedClient, error: updateError } = await supabaseAdmin
      .from('clients')
      .update({
        subscription_status: 'canceled',
        subscription_canceled_at: new Date(),
        updated_at: new Date(),
      })
      .eq('id', clientId)
      .select()
      .single()

    if (updateError) {
      console.error('Database error:', updateError)
      return Response.json({ error: 'Failed to cancel subscription' }, { status: 500 })
    }

    // Send cancellation email to client
    try {
      await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/send-cancellation-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId,
          clientEmail: updatedClient.email,
          clientName: updatedClient.full_name,
        }),
      })
    } catch (emailError) {
      console.error('Email error:', emailError)
      // Don't fail if email fails
    }

    return Response.json(
      {
        message: 'Subscription canceled successfully',
        client: updatedClient,
      },
      { status: 200 }
    )
  } catch (err) {
    console.error('Cancel subscription error:', err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}
