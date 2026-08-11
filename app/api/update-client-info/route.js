import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey)

export async function POST(request) {
  try {
    const { clientId, current_weight, goal_weight } = await request.json()

    if (!clientId) {
      return Response.json({ error: 'Client ID required' }, { status: 400 })
    }

    // Update client info
    const { data: updatedClient, error } = await supabaseAdmin
      .from('clients')
      .update({
        current_weight: current_weight || null,
        goal_weight: goal_weight || null,
        updated_at: new Date(),
      })
      .eq('id', clientId)
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return Response.json({ error: 'Failed to update client info' }, { status: 500 })
    }

    return Response.json(
      {
        message: 'Client information updated successfully',
        client: updatedClient,
      },
      { status: 200 }
    )
  } catch (err) {
    console.error('Update client info error:', err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}
