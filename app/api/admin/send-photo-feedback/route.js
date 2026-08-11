import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  try {
    const { clientEmail, clientName, feedback, photoUrl } = await request.json();

    if (!clientEmail || !clientName || !feedback) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Build email HTML
    const emailHTML = '<html><head><style>body{font-family:Arial,sans-serif;background-color:#000;color:#fff;margin:0;padding:20px;}a{color:#FFD700;text-decoration:none;}.container{max-width:600px;margin:0 auto;background-color:#1a1a1a;border:1px solid rgba(255,215,0,0.3);border-radius:12px;padding:32px;}.header{text-align:center;margin-bottom:32px;}.header h1{color:#FFD700;font-size:28px;margin:0;}.header p{color:#999;margin:8px 0 0 0;font-size:14px;}.photo-section{margin:24px 0;text-align:center;}.photo-section img{max-width:100%;height:auto;border-radius:8px;margin-bottom:16px;}.feedback-box{background-color:#111;border-left:4px solid #FFD700;padding:16px;border-radius:6px;margin:16px 0;}.feedback-box p{margin:0;color:#e0e0e0;line-height:1.6;}.footer{text-align:center;padding-top:24px;border-top:1px solid rgba(255,215,0,0.2);color:#666;font-size:12px;margin-top:24px;}.button{display:inline-block;background-color:#FFD700;color:#000;padding:12px 32px;border-radius:6px;font-weight:bold;margin-top:16px;}.button:hover{background-color:#ffed4e;}</style></head><body><div class="container"><div class="header"><h1>💪 Dane Reviewed Your Photo</h1><p>Your progress is being noticed</p></div><div class="photo-section"><h2 style="color:#FFD700;font-size:20px;margin-top:0;">Your Latest Upload</h2><img src="' + photoUrl + '" alt="Your progress photo" style="max-width:300px;max-height:400px;"/></div><div><h3 style="color:#FFD700;font-size:18px;">Dane\'s Feedback</h3><div class="feedback-box"><p>' + feedback.replace(/\n/g, '<br>') + '</p></div></div><p style="text-align:center;margin-top:32px;"><a href="' + process.env.NEXT_PUBLIC_BASE_URL + '/dashboard" class="button">View Your Dashboard</a></p><div class="footer"><p>Keep crushing it! Your transformation is happening.</p><p>— BuildABod by Dane Vinson</p></div></div></body></html>';

    // Send email
    const response = await resend.emails.send({
      from: 'noreply@buildabod.co',
      to: clientEmail,
      subject: '💪 Dane reviewed your progress photo',
      html: emailHTML,
    });

    if (response.error) {
      console.error('Resend error:', response.error);
      return new Response(
        JSON.stringify({ error: 'Failed to send email' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Email sent successfully' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error sending feedback email:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
