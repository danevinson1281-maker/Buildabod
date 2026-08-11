import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { clientId, notes } = req.body;

  if (!clientId || !notes) {
    return res.status(400).json({ error: 'Client ID and notes required' });
  }

  try {
    const { error } = await supabase
      .from('clients')
      .update({
        coaching_notes: notes,
        updated_at: new Date().toISOString()
      })
      .eq('id', clientId);

    if (error) throw error;

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error updating notes:', error);
    return res.status(500).json({ error: error.message });
  }
}
