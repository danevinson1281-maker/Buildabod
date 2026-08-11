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
      basic: 'Basic',
      pro: 'Pro',
      elite: 'Elite',
    }

    const planName = planNames[planType] || planType

    // Send confirmation email to client
    const clientEmailResult = await resend.emails.send({
      from: 'BuildABod <dane@buildabod.co>',
      to: email,
      subject: '✓ Payment Confirmed - Your Meal Plan is Being Prepared',
      html: `
        <div style="background-color: #000; color: #fff; font-family: Arial, sans-serif; padding: 40px 20px;">
          <div style="max-width: 600px; margin: 0 auto;">
            <!-- Header -->
            <div style="text-align: center; margin-bottom: 40px;">
              <h1 style="font-size: 32px; margin: 0; color: #FFD700;">✓ Payment Confirmed!</h1>
            </div>

            <!-- Main Content -->
            <div style="background-color: #1a1a1a; border: 2px solid #FFD700; border-radius: 8px; padding: 30px; margin-bottom: 30px;">
              <p style="font-size: 16px; margin-top: 0; color: #fff;">Hi ${fullName},</p>
              
              <p style="font-size: 14px; color: #ccc; line-height: 1.6;">
                Your payment has been confirmed and processed successfully. Your <strong>${planName} Plan</strong> is now active.
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

              <p style="font-size: 14px; color: #ccc; line-height: 1.6;">
                If you have any questions while your plan is being prepared, reply to this email or reach out to <strong>dane@buildabod.co</strong>.
              </p>
            </div>

            <!-- Plan Details -->
            <div style="background-color: #1a1a1a; border: 1px solid #333; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
              <h3 style="color: #FFD700; margin-top: 0; font-size: 16px;">Your Plan Details</h3>
              <div style="font-size: 14px; color: #ccc; line-height: 2;">
                <div style="display: flex; justify-content: space-between; padding-bottom: 10px; border-bottom: 1px solid #333;">
                  <span>Plan Type:</span>
                  <strong style="color: #FFD700;">${planName}</strong>
                </div>
                <div style="display: flex; justify-content: space-between; padding-bottom: 10px; border-bottom: 1px solid #333;">
                  <span>Status:</span>
                  <strong style="color: #00c853;">✓ Active</strong>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span>Confirmation Date:</span>
                  <strong>${new Date().toLocaleDateString()}</strong>
                </div>
              </div>
            </div>

            <!-- CTA -->
            <div style="text-align: center; margin-bottom: 30px; background-color: #1a1a1a; border: 1px solid #333; border-radius: 8px; padding: 20px;">
              <p style="font-size: 14px; color: #ccc; margin: 0;">Your personalized meal plan will arrive within 24 hours. Check your email (including spam folder).</p>
            </div>

            <!-- Footer -->
            <div style="text-align: center; border-top: 1px solid #333; padding-top: 20px;">
              <p style="font-size: 12px; color: #666; margin: 5px 0;">
                BuildABod | Personalized Nutrition by Dane Vinson
              </p>
              <p style="font-size: 12px; color: #FFD700; margin: 5px 0;">
                buildabod.co
              </p>
            </div>
          </div>
        </div>
      `,
    })

    if (clientEmailResult.error) {
      console.error('❌ Failed to send client email:', clientEmailResult.error)
      throw new Error(clientEmailResult.error.message)
    }

    console.log('✅ Payment confirmation email sent to client:', email)

    // Send notification email to Dane
    const daneEmailResult = await resend.emails.send({
      from: 'BuildABod <system@buildabod.co>',
      to: 'dane@buildabod.co',
      subject: `🎉 New ${planName} Client Payment - ${fullName} - ACTION NEEDED`,
      html: `
        <div style="background-color: #000; color: #fff; font-family: Arial, sans-serif; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto;">
            <h2 style="color: #FFD700; text-align: center;">⚡ New Client Payment Received</h2>
            
            <div style="background-color: #1a1a1a; border: 1px solid #FFD700; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <p style="margin-top: 0;"><strong>Client:</strong> ${fullName}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Plan:</strong> ${planName}</p>
              <p><strong>Client ID:</strong> ${clientId}</p>
              <p style="margin-bottom: 0;"><strong>Time:</strong> ${new Date().toLocaleString()}</p>
            </div>

            <div style="background-color: #0a0a0a; border-left: 4px solid #FFD700; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="margin-top: 0; color: #FFD700; font-weight: bold;">⚠️ ACTION REQUIRED:</p>
              <ol style="color: #ccc; font-size: 14px; margin-bottom: 0;">
                <li>Review their intake form and selected foods in the admin dashboard</li>
                <li>Verify their macro calculations are correct</li>
                <li>Click "Approve & Generate Plan" to create their meal plan</li>
                <li>They will automatically receive their plan via email</li>
              </ol>
            </div>

            <p style="text-align: center; color: #ccc;">
              <a href="${process.env.NEXT_PUBLIC_BASE_URL}/admin/clients/${clientId}" style="color: #FFD700; text-decoration: none; font-weight: bold;">
                → Go to Admin Dashboard
              </a>
            </p>
          </div>
        </div>
      `,
    })

    if (daneEmailResult.error) {
      console.error('⚠️ Failed to send Dane notification (non-blocking):', daneEmailResult.error)
    } else {
      console.log('✅ Notification email sent to Dane')
    }

    return Response.json({
      success: true,
      message: 'Payment confirmation emails sent',
    }, { status: 200 })
  } catch (error) {
    console.error('❌ Email sending error:', error)
    return Response.json(
      { error: error.message || 'Failed to send confirmation email' },
      { status: 500 }
    )
  }
}
