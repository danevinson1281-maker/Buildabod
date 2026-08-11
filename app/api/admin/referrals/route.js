import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET(request) {
  try {
    // Fetch all referrals with related client data
    const { data: referrals, error } = await supabase
      .from('referrals')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Referrals fetch error:', error);
      return Response.json({ error: error.message }, { status: 500 });
    }

    // Enrich with client names
    const enriched = [];
    for (const ref of referrals) {
      const { data: referrer } = await supabase
        .from('clients')
        .select('full_name')
        .eq('id', ref.referrer_client_id)
        .single();

      const { data: referred } = await supabase
        .from('clients')
        .select('full_name')
        .eq('id', ref.referred_client_id)
        .single();

      enriched.push({
        ...ref,
        referrer_name: referrer?.full_name || 'Unknown',
        referred_name: referred?.full_name || 'Unknown',
      });
    }

    // Calculate stats
    const stats = {
      totalReferrals: enriched.length,
      completedReferrals: enriched.filter(r => r.status === 'completed').length,
      pendingReferrals: enriched.filter(r => r.status === 'pending').length,
totalCreditsGiven: enriched.filter(r => r.status === 'completed').length * 40,
    };

    return Response.json({
      referrals: enriched,
      ...stats,
    });
  } catch (error) {
    console.error('Admin referrals error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
