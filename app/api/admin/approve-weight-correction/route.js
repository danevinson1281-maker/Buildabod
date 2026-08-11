import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(req) {
  try {
    const { correctionId } = await req.json()

    if (!correctionId) {
      return Response.json({ error: 'Missing correctionId' }, { status: 400 })
    }

    // Fetch the correction
    const { data: correction, error: fetchErr } = await supabase
      .from('weight_corrections')
      .select('*')
      .eq('id', correctionId)
      .single()

    if (fetchErr || !correction) {
      return Response.json({ error: 'Correction not found' }, { status: 404 })
    }

    // Update correction status
    const { error: updateErr } = await supabase
      .from('weight_corrections')
      .update({
        status: 'approved',
        corrected_by: 'admin',
        corrected_at: new Date().toISOString(),
      })
      .eq('id', correctionId)

    if (updateErr) {
      return Response.json({ error: 'Failed to approve: ' + updateErr.message }, { status: 500 })
    }

    // Update the weight log with corrected weight
    const { error: weightErr } = await supabase
      .from('weight_logs')
      .update({ weight_lbs: correction.corrected_weight })
      .eq('id', correction.weight_log_id)

    if (weightErr) {
      console.error('Failed to update weight log:', weightErr)
      // Don't fail the whole request if weight log update fails
    }

    return Response.json({ success: true })
  } catch (error) {
    console.error('Error approving weight correction:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
