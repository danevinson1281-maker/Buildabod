import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey)

export async function POST(request) {
  try {
    const { clientId } = await request.json()

    if (!clientId) {
      return Response.json({ error: 'Client ID required' }, { status: 400 })
    }

    // Fetch all payments for this client, ordered by date descending
    const { data: payments, error } = await supabaseAdmin
      .from('payments')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Database error:', error)
      return Response.json({ error: 'Failed to fetch payment history' }, { status: 500 })
    }

    return Response.json(
      {
        payments: payments || [],
      },
      { status: 200 }
    )
  } catch (err) {
    console.error('Get payments error:', err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}
