import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request) {
  try {
    const { clientId, clientName, planType, reason } = await request.json()

    if (!clientId || !reason?.trim()) {
      return Response.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // SAVE TO DATABASE
    const { data, error } = await supabase
      .from('plan_change_requests')
      .insert({
        client_id: clientId,
        reason: reason.trim(),
        status: 'pending',
      })
      .select()
      .single()

    if (error) throw error

    console.log('✅ Plan change request saved:', data.id)

    // SEND EMAIL TO DANE
    try {
      await resend.emails.send({
        from: 'BuildABod <noreply@buildabod.co>',
        to: process.env.ADMIN_EMAIL || 'dane@buildabod.co',
        subject: '🔄 Plan Change Request — ' + (clientName || 'Client'),
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #111; color: #fff; padding: 32px; border-radius: 12px; border: 2px solid #FFD700;">
            <h2 style="color: #FFD700; margin: 0 0 8px;">🔄 Plan Change Request</h2>
            <p style="color: #888; margin: 0 0 24px; font-size: 14px;">A client wants a meal plan adjustment</p>

            <div style="background: #1a1a1a; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
              <p style="color: #888; font-size: 12px; margin: 0 0 4px; text-transform: uppercase;">Client</p>
              <p style="color: #fff; font-size: 16px; font-weight: bold; margin: 0;">${clientName || 'Unknown'}</p>
              ${planType ? `<p style="color: #FFD700; font-size: 12px; margin: 4px 0 0;">${planType.toUpperCase()} Plan</p>` : ''}
            </div>

            <div style="background: #1a1a1a; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
              <p style="color: #888; font-size: 12px; margin: 0 0 8px; text-transform: uppercase;">Their Reason</p>
              <p style="color: #fff; font-size: 14px; line-height: 1.6; margin: 0; white-space: pre-wrap;">${reason}</p>
            </div>

            <div style="background: #0a2a0a; border: 1px solid #1a4a1a; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
              <p style="color: #22c55e; font-size: 12px; font-weight: bold; margin: 0 0 4px;">Next Step</p>
              <p style="color: #ccc; font-size: 13px; margin: 0;">Review in your admin dashboard and approve or dismiss. Only regenerate if it genuinely helps their progress.</p>
            </div>

            <a href="${process.env.NEXT_PUBLIC_BASE_URL}/admin/clients"
               style="display: block; background: #FFD700; color: #000; text-align: center; padding: 14px; border-radius: 8px; font-weight: bold; text-decoration: none; font-size: 15px; margin-bottom: 16px;">
              Review in Admin Dashboard →
            </a>

            <p style="color: #666; font-size: 12px; margin: 0; text-align: center;">
              BuildABod | Personalized Nutrition by Dane Vinson
            </p>
          </div>
        `,
      })
      console.log('✅ Admin notification email sent')
    } catch (emailErr) {
      console.error('⚠️ Email error (non-blocking):', emailErr)
    }

    return Response.json(
      {
        success: true,
        message: 'Plan change request submitted',
        requestId: data.id,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('❌ Error submitting plan change request:', error)
    return Response.json(
      { error: error.message || 'Failed to submit request' },
      { status: 500 }
    )
  }
}
