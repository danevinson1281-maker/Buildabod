import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'
import { Resend } from 'resend'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request) {
  try {
    const { referralCode, newClientId } = await request.json()

    if (!referralCode || !newClientId) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Find referring client
    const { data: referrer } = await supabase
      .from('clients')
      .select('id, full_name, email, free_months_earned, stripe_customer_id')
      .eq('referral_code', referralCode)
      .single()

    if (!referrer) {
      return Response.json({ error: 'Invalid referral code' }, { status: 404 })
    }

    // Make sure they're not referring themselves
    if (referrer.id === newClientId) {
      return Response.json({ error: 'Cannot refer yourself' }, { status: 400 })
    }

    // Check if referral already processed
    const { data: existingReferral } = await supabase
      .from('referrals')
      .select('id')
      .eq('referred_client_id', newClientId)
      .eq('referral_code', referralCode)
      .single()

    if (existingReferral) {
      return Response.json({ message: 'Referral already processed' })
    }

    // Get new client info
    const { data: newClient } = await supabase
      .from('clients')
      .select('id, full_name, email, plan_type')
      .eq('id', newClientId)
      .single()

    if (!newClient) {
      return Response.json({ error: 'New client not found' }, { status: 404 })
    }

    // Referral credit: $40 flat per completed referral
    const creditAmount = 4000; // $40 in cents (fixed amount, not based on plan)

    // Apply Stripe credit to referring client
    if (referrer.stripe_customer_id) {
      await stripe.customers.createBalanceTransaction(
        referrer.stripe_customer_id,
        {
          amount: -creditAmount, // Negative = credit
          currency: 'usd',
          description: `Free month earned — referral: ${newClient.full_name}`,
        }
      )
      console.log(`✅ Stripe credit applied: $${creditAmount / 100} to ${referrer.email}`)
    }

    // Update referrer's free months earned
    await supabase
      .from('clients')
      .update({
        free_months_earned: (referrer.free_months_earned || 0) + 1,
      })
      .eq('id', referrer.id)

    // Update new client with referral info
    await supabase
      .from('clients')
      .update({ referred_by: referralCode })
      .eq('id', newClientId)

    // Log referral in referrals table
    await supabase
      .from('referrals')
      .insert([{
        referrer_client_id: referrer.id,
        referred_client_id: newClientId,
        referral_code: referralCode,
        status: 'completed',
        free_month_applied: true,
      }])

    // Send celebration email to referrer
    await resend.emails.send({
      from: 'Dane <dane@buildabod.co>',
      to: referrer.email,
      subject: '🎉 You earned a free month!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #000; color: #fff; padding: 20px;">
          <div style="background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: #000; margin: 0; font-size: 28px;">🎉 Free Month Earned!</h1>
          </div>
          <div style="background: #111; padding: 30px; border: 1px solid #333; border-radius: 0 0 8px 8px;">
            <p>Hey ${referrer.full_name?.split(' ')[0]},</p>
            <p><strong>${newClient.full_name?.split(' ')[0]}</strong> just signed up through your referral link.</p>
            
            <div style="background: rgba(255,215,0,0.1); padding: 20px; border-left: 4px solid #FFD700; margin: 20px 0;">
              <h3 style="color: #FFD700; margin: 0 0 10px 0;">Your Reward:</h3>
              <p style="margin: 0; font-size: 20px; font-weight: bold; color: #fff;">
                ✅ 1 Free Month — $${creditAmount / 100} credit applied to your account
              </p>
            </div>

            <p>The credit has been automatically applied to your next billing cycle.</p>
            <p>Keep sharing your link — every signup = another free month. No limit.</p>
            
            <div style="background: #1a1a1a; border: 1px solid #333; border-radius: 8px; padding: 16px; margin: 20px 0;">
              <p style="margin: 0; font-size: 12px; color: #888;">Your referral link:</p>
              <p style="margin: 8px 0 0 0; font-size: 14px; color: #FFD700; font-weight: bold;">
                ${process.env.NEXT_PUBLIC_BASE_URL}/?ref=${referrer.referral_code}
              </p>
            </div>

            <p style="color: #FFD700; font-weight: bold;">— Dane</p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #333; text-align: center; color: #888; font-size: 12px;">
              <p>BuildABod · Custom Nutrition by Dane Vinson</p>
            </div>
          </div>
        </div>
      `,
    })

    console.log(`✅ Referral processed: ${referrer.full_name} referred ${newClient.full_name}`)
    return Response.json({ success: true })

  } catch (error) {
    console.error('Error applying referral:', error)
    return Response.json({ error: 'Failed to apply referral' }, { status: 500 })
  }
}
