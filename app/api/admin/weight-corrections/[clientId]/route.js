import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function GET(request, { params }) {
  try {
    const { clientId } = await params

    const { data, error } = await supabase
      .from('weight_corrections')
      .select('*')
      .eq('client_id', clientId)
      .eq('status', 'pending_review')
      .order('created_at', { ascending: false })

    if (error) throw error

    return Response.json({ corrections: data || [] })
  } catch (error) {
    console.error('Error fetching weight corrections:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
