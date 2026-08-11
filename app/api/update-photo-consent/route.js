import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(request) {
  try {
    const { photoConsent } = await request.json()

    if (!photoConsent || !['private', 'public'].includes(photoConsent)) {
      return Response.json(
        { error: 'Invalid photo consent value' },
        { status: 400 }
      )
    }

    // Get client ID from request context
    // This assumes you have auth middleware that sets clientId
    const clientId = request.headers.get('x-client-id') || null

    if (!clientId) {
      return Response.json(
        { error: 'Client not authenticated' },
        { status: 401 }
      )
    }

    // Update client's photo consent preference
    const { error: updateError } = await supabase
      .from('clients')
      .update({
        photo_consent: photoConsent,
        updated_at: new Date().toISOString(),
      })
      .eq('id', clientId)

    if (updateError) {
      console.error('Error updating photo consent:', updateError)
      throw new Error('Failed to update photo consent')
    }

    return Response.json({
      success: true,
      message: 'Photo consent preference updated',
      photoConsent,
    })
  } catch (error) {
    console.error('Photo consent error:', error)
    return Response.json(
      { error: error.message || 'Failed to update consent' },
      { status: 500 }
    )
  }
}
