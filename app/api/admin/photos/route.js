import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || 'all';

    // Step 1 — Get photos without join
    const { data: photos, error: photosError } = await supabase
      .from('progress_photos')
      .select('*')
      .order('created_at', { ascending: false });

    if (photosError) throw photosError;

    if (!photos || photos.length === 0) {
      return Response.json({ photos: [], clientGroups: [], unreviewedCount: 0 });
    }

    // Step 2 — Get unique client IDs from photos
    const clientIds = [...new Set(photos.map(p => p.client_id).filter(Boolean))]

    // Step 3 — Fetch those clients separately
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
.select('id, full_name, email, plan_type, primary_goal')
      .in('id', clientIds)

    if (clientsError) throw clientsError

    // Step 4 — Map clients by id for easy lookup
    const clientMap = {}
    ;(clients || []).forEach(c => { clientMap[c.id] = c })

    // Step 5 — Filter by plan type if needed
    let filtered = photos.map(p => ({
      ...p,
      clients: clientMap[p.client_id] || null
    }))

    if (filter === 'unreviewed') {
      filtered = filtered.filter(p => !p.dane_feedback)
    } else if (filter === 'pro') {
      filtered = filtered.filter(p => p.clients?.plan_type?.toLowerCase() === 'pro')
    } else if (filter === 'elite') {
      filtered = filtered.filter(p => p.clients?.plan_type?.toLowerCase() === 'elite')
    }

    // Step 6 — Generate signed URLs
    const photosWithUrls = await Promise.all(
      filtered.map(async (photo) => {
        if (!photo.storage_key) return { ...photo, signedUrl: photo.photo_url }
        try {
          const { data: urlData } = await supabase.storage
            .from('buildabod-progress-photos')
            .createSignedUrl(photo.storage_key, 3600)
          return { ...photo, signedUrl: urlData?.signedUrl || photo.photo_url }
        } catch {
          return { ...photo, signedUrl: photo.photo_url }
        }
      })
    )

    // Step 7 — Count unreviewed
    const unreviewedCount = photos.filter(p => !p.dane_feedback).length

    // Step 8 — Group by client
    const groupMap = {}
    photosWithUrls.forEach(photo => {
      const cid = photo.client_id
      if (!cid) return
      if (!groupMap[cid]) {
        groupMap[cid] = {
          client: photo.clients,
          photos: [],
        }
      }
      groupMap[cid].photos.push(photo)
    })

    const clientGroups = Object.values(groupMap).map(group => ({
      ...group,
      firstPhoto: group.photos[group.photos.length - 1],
      latestPhoto: group.photos[0],
      totalPhotos: group.photos.length,
    }))

    return Response.json({
      photos: photosWithUrls,
      clientGroups,
      unreviewedCount,
    })

  } catch (err) {
    console.error('GET /api/admin/photos error:', err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}
