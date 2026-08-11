import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request) {
  try {
    const { clientId, weightLogId, originalWeight, correctedWeight, reason } = await request.json()

    // Validate inputs
    if (!clientId || !weightLogId || !originalWeight || !correctedWeight) {
      return Response.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (parseFloat(correctedWeight) === parseFloat(originalWeight)) {
      return Response.json(
        { error: 'Corrected weight must be different from original' },
        { status: 400 }
      )
    }

    // Get client details for email notification
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .select('id, email, full_name')
      .eq('id', clientId)
      .single()

    if (clientError || !clientData) {
      console.error('Error fetching client:', clientError)
      return Response.json(
        { error: 'Client not found' },
        { status: 404 }
      )
    }

    // Create correction record in database
    const { data: correctionData, error: correctionError } = await supabase
      .from('weight_corrections')
      .insert([
        {
          client_id: clientId,
          weight_log_id: weightLogId,
          original_weight: parseFloat(originalWeight),
          corrected_weight: parseFloat(correctedWeight),
          reason: reason || 'Client reported error',
          status: 'pending_review',
        },
      ])
      .select()
      .single()

    if (correctionError) {
      console.error('Error creating correction record:', correctionError)
      return Response.json(
        { error: 'Failed to create correction record' },
        { status: 500 }
      )
    }

    // Send email notification to admin (Dane)
    try {
      await resend.emails.send({
        from: 'BuildABod <noreply@buildabod.co>',
        to: process.env.ADMIN_EMAIL || 'dane@buildabod.co',
        subject: `⚠️ Weight Entry Correction Request - ${clientData.full_name}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
            <h2 style="color: #FFD700; border-bottom: 2px solid #FFD700; padding-bottom: 10px;">Weight Correction Request</h2>
            
            <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; margin: 16px 0;">
              <p style="margin: 0 0 12px;">
                <strong>${clientData.full_name}</strong> reported an error in their weight log entry.
              </p>
              
              <div style="background: white; border-left: 4px solid #ef4444; padding: 12px; margin: 12px 0; border-radius: 4px;">
                <p style="margin: 0; color: #666;">
                  <strong>Original Entry:</strong> <span style="color: #ef4444; font-size: 18px; font-weight: bold;">${parseFloat(originalWeight).toFixed(1)} lbs</span>
                </p>
                <p style="margin: 8px 0 0; color: #666;">
                  <strong>Should Be:</strong> <span style="color: #22c55e; font-size: 18px; font-weight: bold;">${parseFloat(correctedWeight).toFixed(1)} lbs</span>
                </p>
                <p style="margin: 8px 0 0; color: #999; font-size: 13px;">
                  Difference: ${(Math.abs(parseFloat(correctedWeight) - parseFloat(originalWeight))).toFixed(1)} lbs
                </p>
              </div>

              <p style="margin: 12px 0 0; color: #666;">
                <strong>Reason:</strong> ${reason || 'Not specified'}
              </p>
            </div>

            <div style="background: #e8f5e9; border-left: 4px solid #22c55e; padding: 12px; border-radius: 4px; margin: 16px 0;">
              <p style="margin: 0; color: #1b5e20;">
                <strong>Action Required:</strong> Review and approve/deny this correction in your admin dashboard.
              </p>
            </div>

            <p style="margin: 16px 0; padding-top: 16px; border-top: 1px solid #ddd; color: #666; font-size: 12px;">
              Client Email: <strong>${clientData.email}</strong><br>
              Client ID: <strong>${clientId}</strong>
            </p>
          </div>
        `,
      })
    } catch (emailError) {
      console.error('Error sending admin notification email:', emailError)
      // Don't fail the request if email fails
    }

    // Send confirmation email to client
    try {
      await resend.emails.send({
        from: 'BuildABod <noreply@buildabod.co>',
        to: clientData.email,
        subject: '✅ Weight Entry Correction Reported',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
            <h2 style="color: #22c55e;">✅ Correction Received</h2>
            
            <p>Hi ${clientData.full_name.split(' ')[0]},</p>
            
            <p>We received your weight entry correction request:</p>
            
            <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; margin: 16px 0;">
              <p style="margin: 0;">
                <strong>Reported:</strong> ${parseFloat(originalWeight).toFixed(1)} lbs should be ${parseFloat(correctedWeight).toFixed(1)} lbs
              </p>
              <p style="margin: 8px 0 0; color: #666; font-size: 13px;">
                Dane will review and apply this correction within 24 hours.
              </p>
            </div>

            <p style="color: #666; margin: 16px 0;">
              Once approved, your weight history will be updated automatically.
            </p>
            
            <p style="color: #888; font-size: 12px; margin-top: 24px; padding-top: 16px; border-top: 1px solid #ddd;">
              Questions? Reply to this email or contact support@buildabod.co
            </p>
          </div>
        `,
      })
    } catch (emailError) {
      console.error('Error sending client confirmation email:', emailError)
      // Don't fail the request if email fails
    }

    return Response.json({
      success: true,
      message: 'Correction reported successfully. Dane will review within 24 hours.',
      correctionId: correctionData.id,
    })
  } catch (error) {
    console.error('Weight error reporting error:', error)
    return Response.json(
      { error: error.message || 'Failed to report error' },
      { status: 500 }
    )
  }
}
