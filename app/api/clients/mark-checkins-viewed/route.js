import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  try {
    const { clientId } = await request.json();

    if (!clientId) {
      return NextResponse.json({ error: 'Missing clientId' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('check_ins')
      .update({ client_viewed_response_at: new Date().toISOString() })
      .eq('client_id', clientId)
      .not('admin_response', 'is', null);

    if (error) {
      console.error('❌ Error marking check-ins as viewed:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ Mark checkins viewed error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
