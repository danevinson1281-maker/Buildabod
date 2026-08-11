import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const resend = new Resend(process.env.RESEND_API_KEY)

const WAIVER_TEXT = `BUILDABOD.CO MEAL PLAN AGREEMENT

I acknowledge and agree that:

• This meal plan is a nutrition recommendation designed by Coach Dane Vinson, a certified personal trainer, and is for educational purposes.

• I will consult with my doctor or healthcare provider before starting this plan, especially if I have any medical conditions, take medications, or have dietary restrictions.

• I take full responsibility for following this meal plan and listening to my body throughout my transformation journey.

• Results depend on my individual effort, consistency, metabolism, and dedication — and I'm committed to putting in the work.

PHOTO & YOUR CONTROL (YOU DECIDE)

These are YOUR photos. YOU decide what happens with them.

☐ PRIVATE: My progress photos are for Coach Dane's feedback only. They stay between us. No sharing, no posting, no exceptions.

☐ PUBLIC: I'm proud of my transformation and I give BuildABod.co permission to:
  - Share my before/after photos on the website and social media to inspire others
  - Feature my story as a BuildABod.co success story
  - Tag me by first name only (e.g., "Sarah's Transformation")

I can change this choice anytime. My confidence, my control, my choice.

HEALTH & SAFETY

I understand that:
• Coach Dane is a certified personal trainer, not a doctor or registered dietitian
• Any health concerns should be discussed with my healthcare provider immediately
• I release Coach Dane and BuildABod.co from liability for health outcomes I choose to manage responsibly

I'M READY

By typing my name below, I'm committing to this journey and confirming I've read and understand this agreement.`

export async function POST(request) {
  try {
    const { clientId, signedName, photoConsent } = await request.json()

    console.log('📝 Waiver signing request:', { clientId, signedName, photoConsent })

    // VALIDATE INPUT
    if (!clientId || !signedName || !photoConsent) {
      return Response.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (signedName.trim().length < 2) {
      return Response.json(
        { error: 'Please enter a valid name' },
        { status: 400 }
      )
    }

    // GET CLIENT DATA
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .select('id, email, full_name, plan_type, waiver_accepted')
      .eq('id', clientId)
      .single()

    if (clientError || !clientData) {
      console.error('Client not found:', clientError)
      return Response.json({ error: 'Client not found' }, { status: 404 })
    }

    console.log('✅ Client found:', clientData.full_name)

    // ✅ FIX: Detect if this is an upgrade (waiver already accepted + plan_type changed)
    const isUpgrade = clientData.waiver_accepted === true

    console.log(`🔍 Is upgrade: ${isUpgrade}, previous plan: ${clientData.plan_type}`)

    // SAVE WAIVER SIGNATURE
    const { error: waiverError } = await supabase
      .from('waiver_signatures')
      .insert([
        {
          client_id: clientId,
          signed_name: signedName.trim(),
          waiver_text: WAIVER_TEXT,
          photo_consent: photoConsent,
          ip_address: request.headers.get('x-forwarded-for') || 'unknown',
          signed_at: new Date().toISOString(),
        },
      ])

    if (waiverError) {
      console.error('Error saving waiver signature:', waiverError)
      throw new Error('Failed to save waiver signature')
    }

    console.log('✅ Waiver signature saved to database')

    // UPDATE CLIENT - MARK WAIVER AS ACCEPTED
    const { error: updateError } = await supabase
      .from('clients')
      .update({
        waiver_accepted: true,
        waiver_signed_at: new Date().toISOString(),
        waiver_signed_name: signedName.trim(),
        photo_consent: photoConsent,
      })
      .eq('id', clientId)

    if (updateError) {
      console.error('Error updating client:', updateError)
      throw new Error('Failed to update client')
    }

    console.log('✅ Client updated with waiver acceptance')

    // SEND WAIVER CONFIRMATION EMAIL
    console.log('📧 Sending waiver confirmation email...')

    try {
      await resend.emails.send({
        from: 'BuildABod <dane@buildabod.co>',
        to: clientData.email,
        subject: isUpgrade 
          ? '✓ Upgrade Confirmed — Your New Plan is Ready'
          : '✓ You\'re Signed! Your Meal Plan is Coming Soon',
        html: `
          <div style="background-color: #000; color: #fff; font-family: Arial, sans-serif; padding: 40px 20px;">
            <div style="max-width: 600px; margin: 0 auto;">
              <!-- Header -->
              <div style="text-align: center; margin-bottom: 40px;">
                <h1 style="font-size: 32px; margin: 0; color: #FFD700;">✓ ${isUpgrade ? 'Upgrade Confirmed!' : 'You\'re All Set!'}</h1>
              </div>

              <!-- Main Content -->
              <div style="background-color: #1a1a1a; border: 2px solid #FFD700; border-radius: 8px; padding: 30px; margin-bottom: 30px;">
                <p style="font-size: 16px; margin-top: 0; color: #fff;">Hi ${clientData.full_name},</p>
                
                <p style="font-size: 14px; color: #ccc; line-height: 1.6;">
                  ${isUpgrade 
                    ? 'Your upgrade is complete and your agreement is confirmed. Your new plan tier is now active!'
                    : 'Your agreement is signed and confirmed. You\'re officially ready to get started!'}
                </p>

                <!-- Photo Consent Display -->
                <div style="background-color: #0a0a0a; border-left: 4px solid #FFD700; padding: 15px; margin: 20px 0; border-radius: 4px;">
                  <p style="margin-top: 0; color: #FFD700; font-weight: bold; font-size: 14px;">
                    ${photoConsent === 'public' ? '🌟 PUBLIC Photos' : '🔒 PRIVATE Photos'}
                  </p>
                  <p style="margin: 6px 0 0; color: #ccc; font-size: 13px;">
                    ${photoConsent === 'public' 
                      ? 'Your before/after photos will be featured on our transformations page to inspire others.' 
                      : 'Your photos are private and will only be used for feedback from Coach Dane.'}
                  </p>
                </div>

                <div style="background-color: #0a2a0a; border-left: 4px solid #22c55e; padding: 15px; margin: 20px 0; border-radius: 4px;">
                  <h3 style="color: #22c55e; margin-top: 0; font-size: 14px;">⏳ What's Next:</h3>
                  <ol style="color: #ccc; font-size: 13px; line-height: 1.8; padding-left: 20px; margin: 0;">
                    ${isUpgrade 
                      ? `<li><strong>Your dashboard is live now</strong> with your upgraded tier active</li>
                         <li><strong>Use your existing login:</strong> Same magic link from before still works</li>
                         <li><strong>At your next check-in:</strong> Dane will optimize your plan for your new tier</li>`
                      : `<li><strong>Dane is finalizing your meal plan</strong> based on your intake and preferences</li>
                         <li><strong>Within 24 hours:</strong> You'll receive your personalized meal plan via email</li>
                         <li><strong>Log in to your dashboard:</strong> Access your plan, track progress, and swap meals as needed</li>`}
                  </ol>
                </div>
              </div>

              <!-- Agreement Copy -->
              <div style="background-color: #0a0a0a; border: 1px solid #333; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
                <h3 style="color: #FFD700; margin-top: 0; font-size: 14px;">Agreement Signed</h3>
                <p style="color: #ccc; font-size: 12px; margin: 0 0 12px;">Client signed agreement on ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                <div style="background-color: #000; padding: 12px; margin-top: 12px; border-left: 2px solid #FFD700; font-size: 11px; color: #999; line-height: 1.8; max-height: 300px; overflow-y: auto; white-space: pre-wrap; word-wrap: break-word;">
${WAIVER_TEXT}
                </div>
              </div>

              <!-- Signature Details -->
              <div style="background-color: #0a0a0a; border: 1px solid #333; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
                <h3 style="color: #FFD700; margin-top: 0; font-size: 14px;">Signature Details</h3>
                <div style="font-size: 13px; color: #ccc; line-height: 1.8;">
                  <p style="margin: 0 0 8px;"><strong>Signed By:</strong> ${signedName.trim()}</p>
                  <p style="margin: 0 0 8px;"><strong>Date:</strong> ${new Date().toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}</p>
                  <p style="margin: 0;"><strong>Coach:</strong> Coach Dane Vinson, CPT</p>
                </div>
              </div>

              <!-- Contact -->
              <div style="text-align: center; border-top: 1px solid #333; padding-top: 20px; margin-top: 20px;">
                <p style="font-size: 12px; color: #666; margin: 0;">
                  BuildABod | Custom Nutrition by Dane Vinson
                </p>
                <p style="font-size: 12px; color: #FFD700; margin: 5px 0 0;">
                  buildabod.co
                </p>
              </div>
            </div>
          </div>
        `,
      })
      console.log('✅ Waiver confirmation email sent')
    } catch (emailError) {
      console.error('⚠️ Email error (non-blocking):', emailError)
    }

    // SEND ADMIN NOTIFICATION EMAIL
    // ✅ FIX: Only send admin notification for NEW signups, not upgrades
    if (!isUpgrade) {
      console.log('📧 Sending admin notification...')

      try {
        await resend.emails.send({
          from: 'BuildABod <noreply@buildabod.co>',
          to: process.env.ADMIN_EMAIL || 'dane@buildabod.co',
          subject: '✓ Waiver Signed — ' + clientData.full_name,
          html: `
            <div style="font-family: sans-serif; max-width: 700px; margin: 0 auto; background: #111; color: #fff; padding: 32px; border-radius: 12px; border: 2px solid #FFD700;">
              <h2 style="color: #FFD700; margin: 0 0 8px;">✓ Waiver Signed</h2>
              <p style="color: #888; margin: 0 0 24px; font-size: 14px;">${clientData.full_name} just signed their meal plan agreement</p>

              <!-- Client Info -->
              <div style="background: #1a1a1a; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
                <p style="color: #888; font-size: 12px; margin: 0 0 4px; text-transform: uppercase;">Client</p>
                <p style="color: #fff; font-size: 16px; font-weight: bold; margin: 0;">${clientData.full_name}</p>
                <p style="color: #ccc; font-size: 12px; margin: 4px 0 0;">${clientData.email}</p>
              </div>

              <!-- Photo Consent -->
              <div style="background: #1a1a1a; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
                <p style="color: #888; font-size: 12px; margin: 0 0 4px; text-transform: uppercase;">Photo Consent</p>
                <p style="color: #FFD700; font-size: 14px; font-weight: bold; margin: 0;">
                  ${photoConsent === 'public' ? '🌟 PUBLIC' : '🔒 PRIVATE'}
                </p>
                <p style="color: #ccc; font-size: 12px; margin: 4px 0 0;">
                  ${photoConsent === 'public' ? 'Client agrees to public transformations' : 'Client wants private photos only'}
                </p>
              </div>

              <!-- SIGNED AGREEMENT TEXT -->
              <div style="background: #0a0a0a; border: 1px solid #333; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                <h3 style="color: #FFD700; margin-top: 0; margin-bottom: 12px; font-size: 14px;">📋 Signed Agreement</h3>
                <p style="color: #888; font-size: 11px; margin: 0 0 12px; text-transform: uppercase;">Signed on ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} by ${signedName.trim()}</p>
                <div style="background: #000; padding: 16px; border-left: 3px solid #FFD700; font-size: 11px; color: #aaa; line-height: 1.8; max-height: 400px; overflow-y: auto; white-space: pre-wrap; word-wrap: break-word; font-family: monospace;">
${WAIVER_TEXT}
                </div>
              </div>

              <!-- Next Step -->
              <div style="background: #0a2a0a; border: 1px solid #1a4a1a; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
                <p style="color: #22c55e; font-size: 12px; font-weight: bold; margin: 0 0 4px;">Next Step</p>
                <p style="color: #ccc; font-size: 13px; margin: 0;">Generate and send their personalized meal plan. They're ready!</p>
              </div>

              <!-- CTA Button -->
              <a href="${process.env.NEXT_PUBLIC_BASE_URL}/admin/clients"
                 style="display: block; background: #FFD700; color: #000; text-align: center; padding: 14px; border-radius: 8px; font-weight: bold; text-decoration: none; font-size: 15px;">
                View Client in Admin Dashboard →
              </a>
            </div>
          `,
        })
        console.log('✅ Admin notification sent')
      } catch (adminEmailError) {
        console.error('⚠️ Admin email error (non-blocking):', adminEmailError)
      }
    } else {
      console.log('⏭️ Skipping admin notification — this is an upgrade')
    }

    return Response.json(
      {
        success: true,
        message: 'Waiver signed successfully. Confirmation email sent.',
        clientId,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('❌ Waiver signing error:', error)
    return Response.json(
      { error: error.message || 'Failed to sign waiver' },
      { status: 500 }
    )
  }
}
