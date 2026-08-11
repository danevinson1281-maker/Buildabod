import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  try {
    const { photoId, feedback } = await request.json();

    if (!photoId || !feedback?.trim()) {
      return Response.json(
        { error: 'Photo ID and feedback are required' },
        { status: 400 }
      );
    }

    if (feedback.trim().length > 500) {
      return Response.json(
        { error: 'Feedback must be 500 characters or less' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('progress_photos')
      .update({
        dane_feedback: feedback.trim(),
        feedback_given_at: new Date().toISOString(),
      })
      .eq('id', photoId)
      .select()
      .single();

    if (error) throw error;

    return Response.json({ success: true, photo: data });
  } catch (err) {
    console.error('POST /api/admin/respond-to-photo error:', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
