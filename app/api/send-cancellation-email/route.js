import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request) {
  try {
    const { clientEmail, clientName } = await request.json()

    if (!clientEmail) {
      return Response.json({ error: 'Client email required' }, { status: 400 })
    }

    const emailResponse = await resend.emails.send({
      from: 'BuildABod <noreply@buildabod.co>',
      to: clientEmail,
      subject: 'Subscription Canceled - We\'d Love to Have You Back',
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #000; color: #fff; padding: 40px 20px;">
          <div style="max-width: 600px; margin: 0 auto;">
            
            <h1 style="color: #FFD700; margin-bottom: 20px;">Subscription Canceled</h1>
            
            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              Hi ${clientName},
            </p>
            
            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              We're sorry to see you go! Your subscription has been successfully canceled. 
            </p>
            
            <div style="background-color: #1a1a1a; border: 1px solid #333; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
              <p style="margin: 0; color: #999; font-size: 14px;">
                <strong>Your meal plan remains available until your next billing date.</strong> You can still access it from your client portal anytime.
              </p>
            </div>
            
            <h3 style="color: #FFD700; margin-bottom: 15px;">We'd Love Your Feedback</h3>
            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              What could we have done better? Reply to this email or reach out to Dane directly at dane@buildabod.co
            </p>
            
            <h3 style="color: #FFD700; margin-bottom: 15px;">Want to Reactivate?</h3>
            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              Change your mind? You can reactivate your subscription anytime. Just log back in to your account and reach out to us.
            </p>
            
            <div style="border-top: 1px solid #333; padding-top: 20px; margin-top: 30px;">
              <p style="font-size: 14px; color: #999; margin: 0;">
                BuildABod | Custom Meal Plans by Dane Vinson<br>
                <a href="mailto:dane@buildabod.co" style="color: #FFD700; text-decoration: none;">dane@buildabod.co</a>
              </p>
            </div>

          </div>
        </div>
      `,
    })

    if (emailResponse.error) {
      console.error('Resend error:', emailResponse.error)
      return Response.json({ error: 'Failed to send email' }, { status: 500 })
    }

    return Response.json({ success: true }, { status: 200 })
  } catch (err) {
    console.error('Send cancellation email error:', err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}
