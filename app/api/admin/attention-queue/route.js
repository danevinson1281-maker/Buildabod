import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function GET(req) {
  try {
    const token = req.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
    }

    // Fetch all clients
    const { data: clientsData, error: clientsError } = await supabase
      .from('clients')
      .select('id, full_name, email, plan_type')

    if (clientsError) throw clientsError

    // Fetch unreviewed photos (oldest first)
    const { data: photosData, error: photosError } = await supabase
      .from('progress_photos')
      .select('id, client_id, week_number, created_at, dane_feedback')
      .is('dane_feedback', null)
      .order('created_at', { ascending: true })

    if (photosError) throw photosError

    // Fetch unanswered check-ins (oldest first)
    const { data: checkinsData, error: checkinsError } = await supabase
      .from('check_ins')
      .select('id, client_id, week_number, created_at, admin_response')
      .is('admin_response', null)
      .order('created_at', { ascending: true })

    if (checkinsError) throw checkinsError

    // Fetch recent weight logs (last 12 hours)
    const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
    const { data: weightData, error: weightError } = await supabase
      .from('weight_logs')
      .select('id, client_id, logged_at')
      .gte('logged_at', twelveHoursAgo)
      .order('logged_at', { ascending: false })

    if (weightError) throw weightError

    // Build attention queue by client
    const attentionMap = {}

    // Add photos
    photosData?.forEach(photo => {
      if (!attentionMap[photo.client_id]) {
        attentionMap[photo.client_id] = {
          client_id: photo.client_id,
          photos: [],
          checkins: [],
          weightLogs: [],
          urgencyScore: 0,
        }
      }
      attentionMap[photo.client_id].photos.push({
        id: photo.id,
        type: 'photo',
        week: photo.week_number,
        created_at: photo.created_at,
      })
    })

    // Add check-ins
    checkinsData?.forEach(checkin => {
      if (!attentionMap[checkin.client_id]) {
        attentionMap[checkin.client_id] = {
          client_id: checkin.client_id,
          photos: [],
          checkins: [],
          weightLogs: [],
          urgencyScore: 0,
        }
      }
      attentionMap[checkin.client_id].checkins.push({
        id: checkin.id,
        type: 'checkin',
        week: checkin.week_number,
        created_at: checkin.created_at,
      })
    })

    // Only add weight logs if client has pending photos or check-ins
    weightData?.forEach(log => {
      // Only show weight log if there are actual pending items
      if (attentionMap[log.client_id] && 
          (attentionMap[log.client_id].photos.length > 0 || 
           attentionMap[log.client_id].checkins.length > 0)) {
        attentionMap[log.client_id].weightLogs.push({
          id: log.id,
          type: 'weight',
          logged_at: log.logged_at,
        })
      }
    })

    // Calculate urgency score (days waiting)
    const now = new Date()
    Object.values(attentionMap).forEach(item => {
      const allItems = [...item.photos, ...item.checkins]
      if (allItems.length > 0) {
        const oldestDate = new Date(Math.min(...allItems.map(i => new Date(i.created_at))))
        const daysWaiting = Math.floor((now - oldestDate) / (1000 * 60 * 60 * 24))
        item.urgencyScore = daysWaiting
      }
    })

    // Enrich with client info and sort by urgency
    const queue = Object.values(attentionMap)
      .map(item => {
        const client = clientsData?.find(c => c.id === item.client_id)
        return {
          ...item,
          client_name: client?.full_name || 'Unknown',
          client_email: client?.email || '',
          plan_type: client?.plan_type || 'unknown',
        }
      })
      .sort((a, b) => b.urgencyScore - a.urgencyScore) // Highest urgency first

    return new Response(JSON.stringify({
      success: true,
      queue,
      totalClients: queue.length,
      totalItems: queue.reduce((sum, item) => sum + item.photos.length + item.checkins.length + item.weightLogs.length, 0),
    }), { status: 200 })

  } catch (error) {
    console.error('Attention queue error:', error)
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
}
