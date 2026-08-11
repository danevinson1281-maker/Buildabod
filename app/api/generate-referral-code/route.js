import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

function generateCode(fullName) {
  const firstName = fullName?.split(' ')[0]?.toUpperCase() || 'BAB'
  const cleanName = firstName.replace(/[^A-Z]/g, '').substring(0, 8)
  const randomNum = Math.floor(100 + Math.random() * 900)
  return `${cleanName}${randomNum}`
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { clientId } = body

    console.log('🔑 Generating referral code for:', clientId)

    if (!clientId) {
      return Response.json({ error: 'Client ID required' }, { status: 400 })
    }

    // Check if client exists and already has a code
    const { data: client, error: fetchError } = await supabase
      .from('clients')
      .select('id, full_name, referral_code')
      .eq('id', clientId)
      .single()

    if (fetchError) {
      console.error('Supabase fetch error:', fetchError)
      return Response.json({ error: 'Database error: ' + fetchError.message }, { status: 500 })
    }

    if (!client) {
      return Response.json({ error: 'Client not found' }, { status: 404 })
    }

    console.log('👤 Client found:', client.full_name)

    // Return existing code if already has one
    if (client.referral_code) {
      console.log('✅ Existing code found:', client.referral_code)
      return Response.json({ referralCode: client.referral_code })
    }

    // Generate unique code
    let code = generateCode(client.full_name)
    let attempts = 0

    while (attempts < 10) {
      const { data: existing } = await supabase
        .from('clients')
        .select('id')
        .eq('referral_code', code)
        .maybeSingle()

      if (!existing) break
      code = generateCode(client.full_name)
      attempts++
    }

    console.log('🎯 Generated code:', code)

    // Save code to client
    const { error: updateError } = await supabase
      .from('clients')
      .update({ referral_code: code })
      .eq('id', clientId)

    if (updateError) {
      console.error('Supabase update error:', updateError)
      return Response.json({ error: 'Failed to save code: ' + updateError.message }, { status: 500 })
    }

    console.log('✅ Referral code saved:', code)
    return Response.json({ referralCode: code })

  } catch (error) {
    console.error('Generate referral code error:', error)
    return Response.json({ error: error.message || 'Failed to generate code' }, { status: 500 })
  }
}
