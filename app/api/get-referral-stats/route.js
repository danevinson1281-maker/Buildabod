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
      return Response.json({ error: 'Client ID required' }, { status: 400 })
    }

    // Get client's referral stats
    const { data: client } = await supabase
      .from('clients')
      .select('free_months_earned, free_months_used, referral_code')
      .eq('id', clientId)
      .single()

    // Get referral history
    const { data: referrals } = await supabase
      .from('referrals')
      .select(`
        id,
        created_at,
        status,
        free_month_applied,
        referred_client_id
      `)
      .eq('referrer_client_id', clientId)
      .order('created_at', { ascending: false })

    // Get referred client names
    const history = []
    for (const ref of referrals || []) {
      const { data: referredClient } = await supabase
        .from('clients')
        .select('full_name')
        .eq('id', ref.referred_client_id)
        .single()

      history.push({
        ...ref,
        referred_name: referredClient?.full_name?.split(' ')[0] + ' ' +
          (referredClient?.full_name?.split(' ')[1]?.[0] || '') + '.' || 'New Client',
      })
    }

    return Response.json({
      totalReferrals: referrals?.length || 0,
      freeMonthsEarned: client?.free_months_earned || 0,
      freeMonthsUsed: client?.free_months_used || 0,
      history,
    })
  } catch (error) {
    console.error('Error fetching referral stats:', error)
    return Response.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
