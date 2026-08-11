import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request) {
  try {
    const { clientId, email, fullName, planType } = await request.json()

    if (!clientId || !email || !planType) {
      return Response.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const planNames = {
      basic: 'Kickstart Plan',
      pro: 'Pro',
      elite: 'Elite',
    }

    const planName = planNames[planType] || planType

    const emailResult = await resend.emails.send({
      from: 'Dane @ BuildABod <noreply@buildabod.co>',
      to: email,
      subject: `✓ Payment Confirmed — Your Custom Plan is Being Built, ${fullName}!`,
      html: `
        <div style="background-color: #000; color: #fff; font-family: Arial, sans-serif; padding: 40px 20px;">
          <div style="max-width: 600px; margin: 0 auto;">
            <div style="text-align: center; margin-bottom: 40px;">
              <h1 style="font-size: 32px; margin: 0; color: #FFD700;">✓ Payment Confirmed!</h1>
            </div>

            <div style="background-color: #1a1a1a; border: 2px solid #FFD700; border-radius: 8px; padding: 30px; margin-bottom: 30px;">
              <p style="font-size: 16px; margin-top: 0; color: #fff;">Hi ${fullName},</p>
              
              <p style="font-size: 14px; color: #ccc; line-height: 1.6;">
                Your payment has been confirmed and processed successfully. Your <strong>${planName}</strong> is now active.
              </p>

              <div style="background-color: #0a0a0a; border-left: 4px solid #FFD700; padding: 20px; margin: 20px 0; border-radius: 4px;">
                <h3 style="color: #FFD700; margin-top: 0; font-size: 16px;">What Happens Next:</h3>
                <ol style="color: #ccc; font-size: 14px; line-height: 1.8; padding-left: 20px;">
                  <li><strong>Right now:</strong> Dane is reviewing your intake information and macro calculations</li>
                  <li><strong>Within 24 hours:</strong> Your personalized meal plan will be generated using YOUR selected foods and approved by Dane</li>
                  <li><strong>Your inbox:</strong> You'll receive a professional email with your complete meal plan, macro targets, and meal swap options</li>
                  ${planType !== 'basic' ? `<li><strong>Immediately after:</strong> Your ${planType === 'pro' ? 'monthly' : 'weekly'} check-ins with Dane begin</li>` : ''}
                </ol>
              </div>

              <p style="font-size: 14px; color: #ccc; line-height: 1.6;">
                <strong>Your meal plan is customized for YOUR body, YOUR goals, and YOUR food preferences.</strong> This is why it works when generic diets don't.
              </p>
            </div>

            <div style="text-align: center; border-top: 1px solid #333; padding-top: 20px;">
              <p style="font-size: 12px; color: #666; margin: 5px 0;">
                BuildABod.co | Personalized Nutrition by Dane Vinson
              </p>
            </div>
          </div>
        </div>
      `,
    })

    if (emailResult.error) {
      console.error('Email error:', emailResult.error)
      return Response.json({ error: 'Failed to send email' }, { status: 500 })
    }

    console.log('✅ Payment confirmation email sent')
    return Response.json({ success: true })
  } catch (error) {
    console.error('Error:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
