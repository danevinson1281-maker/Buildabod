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

    // Update correction status to denied
    const { error: updateErr } = await supabase
      .from('weight_corrections')
      .update({
        status: 'denied',
        corrected_by: 'admin',
        corrected_at: new Date().toISOString(),
      })
      .eq('id', correctionId)

    if (updateErr) {
      return Response.json({ error: 'Failed to deny: ' + updateErr.message }, { status: 500 })
    }

    return Response.json({ success: true })
  } catch (error) {
    console.error('Error denying weight correction:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
