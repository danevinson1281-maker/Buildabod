import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  try {
    const { clientId } = await request.json();

    if (!clientId) {
      return Response.json({ error: 'Missing clientId' }, { status: 400 });
    }

    // ── GET CLIENT ────────────────────────────────────────────────────
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('id, full_name, email, plan_type')
      .eq('id', clientId)
      .single();

    if (clientError || !client) {
      return Response.json({ error: 'Client not found' }, { status: 404 });
    }

    // ── ONLY ALLOW PRO/ELITE ──────────────────────────────────────────
    if (!['pro', 'elite'].includes(client.plan_type?.toLowerCase())) {
      return Response.json(
        { error: 'Gift codes are only available for Pro and Elite members.' },
        { status: 400 }
      );
    }

    // ── FIND AN ACTIVE REFERRER_REWARD TO CONVERT ─────────────────────
    // Only convert referrer_reward credits (not referral_discount or other types)
    const { data: activeRewards, error: rewardError } = await supabase
      .from('reward_codes')
      .select('*')
      .eq('earned_by_client_id', clientId)
      .eq('status', 'active')
      .eq('reward_type', 'referrer_reward')
      .order('created_at', { ascending: true })
      .limit(1);

    if (rewardError) {
      console.error('❌ Error fetching rewards:', rewardError);
      return Response.json({ error: 'Failed to check available credits' }, { status: 500 });
    }

    if (!activeRewards || activeRewards.length === 0) {
      return Response.json(
        { error: 'No available $40 credits to convert into a gift code.' },
        { status: 400 }
      );
    }

    const sourceReward = activeRewards[0];

    // ── GENERATE UNIQUE CODE ──────────────────────────────────────────
    let giftCode = null;
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 10) {
      const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
      giftCode = `GIFT-${randomStr}`;

      const { data: existing } = await supabase
        .from('reward_codes')
        .select('id')
        .eq('code', giftCode)
        .single();

      if (!existing) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      return Response.json({ error: 'Failed to generate unique code' }, { status: 500 });
    }

    // ── MARK SOURCE REWARD AS "GIFTED" ────────────────────────────────
    const { error: updateError } = await supabase
      .from('reward_codes')
      .update({
        status: 'redeemed',
        redeemed_by_client_id: clientId,
        redeemed_at: new Date().toISOString(),
      })
      .eq('id', sourceReward.id);

    if (updateError) {
      console.error('❌ Error marking source reward as gifted:', updateError);
      return Response.json({ error: 'Failed to process credit' }, { status: 500 });
    }

    // ── CREATE THE GIFT CODE ──────────────────────────────────────────
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 180);

    const { data: newCode, error: insertError } = await supabase
      .from('reward_codes')
      .insert([
        {
          code: giftCode,
          earned_by_client_id: clientId,
          amount: 40,
          reward_type: 'gift_code',
          status: 'active',
          expires_at: expiresAt.toISOString(),
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (insertError) {
      console.error('❌ Error creating gift code:', insertError);
      // Rollback: restore the source reward
      await supabase
        .from('reward_codes')
        .update({ status: 'active', redeemed_by_client_id: null, redeemed_at: null })
        .eq('id', sourceReward.id);
      return Response.json({ error: 'Failed to create gift code' }, { status: 500 });
    }

    console.log(`✅ Gift code generated: ${giftCode} by ${client.email} (converted from ${sourceReward.code})`);

    return Response.json({
      success: true,
      code: giftCode,
      amount: 40,
      expiresAt: expiresAt.toISOString(),
    });

  } catch (error) {
    console.error('❌ Error in generate-gift-code API:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
