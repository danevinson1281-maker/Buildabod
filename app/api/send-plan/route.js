import { Resend } from 'resend'
import { NextResponse } from 'next/server'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request) {
  try {
    const { clientEmail, clientName, pdfBase64 } = await request.json()

    if (!pdfBase64) {
      return NextResponse.json({ error: 'Missing PDF content' }, { status: 400 })
    }

    const { data, error } = await resend.emails.send({
      from: 'BuildABod <coach@buildabod.co>',
      to: clientEmail,
      subject: 'Your Custom Meal Plan is Ready!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #111; color: #fff; padding: 30px; border-radius: 10px;">
          <h1 style="color: #FFD700;">BUILDABOD</h1>
          <p>Hey ${clientName}!</p>
          <p>Your personalized meal plan is attached to this email as a PDF.</p>
          <p>Questions? Just reply to this email!</p>
          <p>— Coach Dane</p>
        </div>
      `,
      attachments: [
        {
          filename: `BuildABod_${clientName.replace(/\s+/g, '_')}_MealPlan.pdf`,
          content: pdfBase64,
          encoding: 'base64',
          contentType: 'application/pdf',
        },
      ],
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Failed to send email' }, { status: 500 })
  }
}
