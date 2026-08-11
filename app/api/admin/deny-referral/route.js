import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  try {
    const { referralId } = await request.json();

    if (!referralId) {
      return Response.json({ error: 'Referral ID required' }, { status: 400 });
    }

    // Update referral status
    const { error } = await supabase
      .from('referrals')
      .update({
        status: 'denied',
        free_month_applied: false,
      })
      .eq('id', referralId);

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    console.log('❌ Referral denied:', referralId);
    return Response.json({ success: true });
  } catch (error) {
    console.error('Deny referral error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
