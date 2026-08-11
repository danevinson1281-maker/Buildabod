// app/api/clients/[id]/route.js

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET(request, { params }) {
  try {
    // ✅ Properly await params in Next.js 15+
    const { id } = await params;

    if (!id) {
      console.log('❌ No ID found');
      return Response.json({ error: 'Client ID required' }, { status: 400 });
    }

    console.log('📊 Querying Supabase for client:', id);

    // ── Get client ────────────────────────────────────────────────────────────
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('❌ Supabase error:', error.message);
      return Response.json(
        { error: 'Client not found', details: error.message },
        { status: 404 }
      );
    }

    if (!data) {
      console.log('❌ No data returned');
      return Response.json({ error: 'Client not found' }, { status: 404 });
    }

    // ── Parse selected_foods if needed ────────────────────────────────────────
    let parsedData = { ...data };
    if (data.selected_foods) {
      if (typeof data.selected_foods === 'string') {
        try {
          parsedData.selected_foods = JSON.parse(data.selected_foods);
        } catch (e) {
          parsedData.selected_foods = [];
        }
      }
    } else {
      parsedData.selected_foods = [];
    }

    console.log('✅ Client found:', data.full_name);

    return Response.json(parsedData, { status: 200 });
  } catch (error) {
    console.error('💥 Server error:', error.message);
    return Response.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    // ✅ Properly await params in Next.js 15+
    const { id } = await params;

    if (!id) {
      return Response.json({ error: 'Client ID required' }, { status: 400 });
    }

    const body = await request.json();

    console.log('📝 Updating client:', id, 'with body:', Object.keys(body));

    // ── Update client ─────────────────────────────────────────────────────────
    const { data, error } = await supabase
      .from('clients')
      .update(body)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Update error:', error.message);
      return Response.json({ error: error.message }, { status: 500 });
    }

    console.log('✅ Client updated:', id);

    return Response.json(data, { status: 200 });
  } catch (error) {
    console.error('💥 Server error during PUT:', error.message);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
