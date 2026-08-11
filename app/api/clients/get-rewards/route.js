import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('clientId')

    if (!clientId) {
      return Response.json({ error: 'clientId required' }, { status: 400 })
    }

    // ✅ FIX: Include redeemed_at in the select
    const { data, error } = await supabase
      .from('reward_codes')
      .select('id, code, amount, reward_type, status, expires_at, redeemed_at, created_at')
      .eq('earned_by_client_id', clientId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Error fetching rewards:', error)
      return Response.json({ error: 'Failed to fetch rewards' }, { status: 500 })
    }

    // Separate by status
    const active = data?.filter(r => r.status === 'active') || []
    const redeemed = data?.filter(r => r.status === 'redeemed') || []
    const expired = data?.filter(r => r.status === 'expired') || []

    // Calculate totals
    const totalEarned = active.reduce((sum, r) => sum + r.amount, 0)

    console.log(`✅ Fetched ${data?.length || 0} rewards for client ${clientId}`)

    return Response.json({
      all: data || [],
      active,
      redeemed,
      expired,
      totalEarned,
      stats: {
        activeCount: active.length,
        redeemedCount: redeemed.length,
        expiredCount: expired.length,
        totalEarned,
      }
    })
  } catch (err) {
    console.error('❌ Error in get-rewards API:', err)
    return Response.json({ error: 'Server error' }, { status: 500 })
  }
}
