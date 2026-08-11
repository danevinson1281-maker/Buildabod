import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET(request) {
  try {
    console.log('🔑 ENV CHECK:', {
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      hasAdminEmail:  !!process.env.ADMIN_EMAIL,
      hasAdminPassword: !!process.env.ADMIN_PASSWORD,
      adminEmail: process.env.ADMIN_EMAIL,
    });

    // ── Verify admin token ──────────────────────────────────────────────
    const authHeader = request.headers.get('Authorization');
    const token      = authHeader?.replace('Bearer ', '').trim();

    if (!token) {
      return Response.json({ error: 'Unauthorized — no token provided' }, { status: 401 });
    }

    // Decode the token — login page saves a JSON object as base64
    let decoded;
    try {
      const raw = Buffer.from(token, 'base64').toString('utf-8');
      decoded = JSON.parse(raw);
    } catch (e) {
      return Response.json({ error: 'Unauthorized — invalid token format' }, { status: 401 });
    }

    // Verify it has the right email
    const adminEmail = process.env.ADMIN_EMAIL || 'dane@buildabod.co';

    if (!decoded?.email || decoded.email !== adminEmail) {
      console.warn('⚠️ Unauthorized admin access attempt — decoded:', decoded);
      return Response.json({ error: 'Unauthorized — invalid credentials' }, { status: 401 });
    }

    // ── Fetch all clients ───────────────────────────────────────────────
    const { data: clients, error } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // ── Calculate unreviewed counts for each client ──────────────────────
    const clientsWithUpdates = await Promise.all(
      (clients || []).map(async (client) => {
        // Get unreviewed photos count (where admin_responded_at is NULL = not reviewed)
        const { count: unreviewedPhotosCount } = await supabase
          .from('progress_photos')
          .select('*', { count: 'exact', head: true })
          .eq('client_id', client.id)
          .is('feedback_given_at', null);

        // Get unreviewed check-ins (where admin_response is NULL = not reviewed)
        const { count: unreviewedCheckinsCount } = await supabase
          .from('check_ins')
          .select('*', { count: 'exact', head: true })
          .eq('client_id', client.id)
          .is('admin_responded_at', null);

        // Check if weight logged in last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const { data: recentWeights } = await supabase
          .from('weight_logs')
          .select('*', { count: 'exact', head: true })
          .eq('client_id', client.id)
          .gte('logged_at', sevenDaysAgo.toISOString());

        return {
          ...client,
          unreviewed_photos_count: unreviewedPhotosCount || 0,
          unreviewed_checkins_count: unreviewedCheckinsCount || 0,
          recent_weight_log: (recentWeights && recentWeights.length > 0) ? true : false,
        };
      })
    );

    return Response.json({
      success: true,
      clients: clientsWithUpdates || [],
    });

  } catch (error) {
    console.error('❌ Error fetching clients:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
