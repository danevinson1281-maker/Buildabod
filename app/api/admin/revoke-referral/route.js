import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  try {
    const { rewardCodeId, reason } = await request.json();

    if (!rewardCodeId) {
      return Response.json(
        { error: 'rewardCodeId is required' },
        { status: 400 }
      );
    }

    // Fetch the reward code
    const { data: rewardCode, error: fetchError } = await supabase
      .from('reward_codes')
      .select('id, earned_by_client_id, amount, status')
      .eq('id', rewardCodeId)
      .single();

    if (fetchError || !rewardCode) {
      return Response.json(
        { error: 'Reward code not found' },
        { status: 404 }
      );
    }

    if (rewardCode.status === 'revoked') {
      return Response.json(
        { error: 'Already revoked' },
        { status: 400 }
      );
    }

    // Mark reward code as revoked
    const { error: updateError } = await supabase
      .from('reward_codes')
      .update({
        status: 'revoked',
        revoked_at: new Date().toISOString(),
        admin_notes: reason || 'Revoked by admin',
      })
      .eq('id', rewardCodeId);

    if (updateError) {
      return Response.json(
        { error: 'Failed to revoke', details: updateError },
        { status: 500 }
      );
    }

    console.log(`🗑️ Revoked referral reward $${rewardCode.amount} for client: ${rewardCode.earned_by_client_id}`);

    return Response.json({
      success: true,
      message: `Revoked $${rewardCode.amount} credit`,
    });
  } catch (error) {
    console.error('Revoke referral error:', error);
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
