// app/api/client/upload-progress-photo/route.js

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request) {
  try {
    const body = await request.json();
    const { clientId, photoUrl, storageKey } = body;

    if (!clientId || !photoUrl) {
      return NextResponse.json(
        { error: 'Missing clientId or photoUrl' },
        { status: 400 }
      );
    }

    // Use service role key for database operations
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    console.log('Saving progress photo for client:', clientId);

    // Insert into progress_photos table
    const { data: photoData, error: insertError } = await supabase
      .from('progress_photos')
      .insert([
        {
          client_id: clientId,
          photo_url: photoUrl,
          storage_key: storageKey,
          uploaded_at: new Date().toISOString(),
          dane_feedback: null,
        },
      ])
      .select()
      .single();

    if (insertError) {
      console.error('Error saving progress photo:', insertError);
      return NextResponse.json(
        { error: insertError.message },
        { status: 500 }
      );
    }

    console.log('✅ Progress photo saved:', photoData.id);

    return NextResponse.json({
      success: true,
      message: 'Photo uploaded successfully',
      photo: photoData,
    });
  } catch (error) {
    console.error('Upload progress photo error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upload photo' },
      { status: 500 }
    );
  }
}
