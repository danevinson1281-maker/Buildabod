import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');

    if (!clientId) {
      return Response.json({ error: 'Missing clientId' }, { status: 400 });
    }

    // Get weight logs
    const { data: weightLogs, error: weightError } = await supabase
      .from('weight_logs')
      .select('*')
      .eq('client_id', clientId)
      .order('logged_at', { ascending: true });

    if (weightError) {
      console.error('Weight logs error:', weightError);
    }

    // Get check-ins including admin response
    const { data: checkIns, error: checkInError } = await supabase
      .from('check_ins')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });

    if (checkInError) {
      console.error('Check-ins error:', checkInError);
    }

    // Get progress photos
    const { data: progressPhotos, error: photoError } = await supabase
      .from('progress_photos')
      .select('*')
      .eq('client_id', clientId)
      .order('uploaded_at', { ascending: false });

    if (photoError) {
      console.error('Progress photos error:', photoError);
    }

    console.log('✅ Progress data fetched for client:', clientId);
    console.log('Weight logs:', weightLogs?.length || 0);
    console.log('Check-ins:', checkIns?.length || 0);
    console.log('Photos:', progressPhotos?.length || 0);

    return Response.json({
      weightLogs: weightLogs || [],
      checkIns: checkIns || [],
      progressPhotos: progressPhotos || [],
    });

  } catch (err) {
    console.error('get-progress error:', err);
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
}
