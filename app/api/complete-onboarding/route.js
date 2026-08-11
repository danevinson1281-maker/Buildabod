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

    console.log('✅ Marking onboarding complete for client:', clientId);

    const { error } = await supabaseAdmin
      .from('clients')
      .update({ onboarding_complete: true })
      .eq('id', clientId);

    if (error) {
      console.error('❌ Error completing onboarding:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ Complete onboarding error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
