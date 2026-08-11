// app/api/clients/upload-progress-photo-server/route.js

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const clientId = formData.get('clientId');

    if (!file || !clientId) {
      return NextResponse.json(
        { error: 'Missing file or clientId' },
        { status: 400 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    console.log('Uploading progress photo for client:', clientId);

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Supabase Storage
    const fileName = `${clientId}/${Date.now()}-${file.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('buildabod-progress-photos')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return NextResponse.json(
        { error: uploadError.message },
        { status: 500 }
      );
    }

        console.log('✅ File uploaded to storage:', fileName);

    // Get signed URL (valid for 1 year) — works even if bucket is private
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from('buildabod-progress-photos')
      .createSignedUrl(fileName, 60 * 60 * 24 * 365);

    if (signedUrlError) {
      console.error('Signed URL error:', signedUrlError);
      return NextResponse.json(
        { error: signedUrlError.message },
        { status: 500 }
      );
    }

    const photoUrl = signedUrlData.signedUrl;

    // Get client plan type for tier_at_upload
    const { data: clientData } = await supabase
      .from('clients')
      .select('plan_type')
      .eq('id', clientId)
      .single();

    // Calculate week number (how many photos they have + 1)
    const { count } = await supabase
      .from('progress_photos')
      .select('*', { count: 'exact', head: true })
      .eq('client_id', clientId);

    const weekNumber = (count || 0) + 1;

    // Save to database
    const { data: photoData, error: insertError } = await supabase
      .from('progress_photos')
      .insert([
        {
          client_id: clientId,
          photo_url: photoUrl,  // ← Now using signed URL
          storage_key: fileName,
          week_number: weekNumber,
          tier_at_upload: clientData?.plan_type || 'basic',
          dane_feedback: null,
          dane_feedback_at: null,
        },
      ])
      .select()
      .single();


    if (insertError) {
      console.error('Database insert error:', insertError);
      return NextResponse.json(
        { error: insertError.message },
        { status: 500 }
      );
    }

    console.log('✅ Progress photo saved to database:', photoData.id);

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
