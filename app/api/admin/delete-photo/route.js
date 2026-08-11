import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function DELETE(request) {
  try {
    const { photoId } = await request.json();

    if (!photoId) {
      return Response.json(
        { error: 'Photo ID is required' },
        { status: 400 }
      );
    }

    // Get the photo record first so we have the storage_key
    const { data: photo, error: fetchError } = await supabase
      .from('progress_photos')
      .select('storage_key')
      .eq('id', photoId)
      .single();

    if (fetchError) throw fetchError;

    // Delete from Supabase Storage if storage_key exists
    if (photo?.storage_key) {
      const { error: storageError } = await supabase.storage
        .from('buildabod-progress-photos')
        .remove([photo.storage_key]);

      if (storageError) {
        // Log but don't block — still delete the DB record
        console.warn('Storage delete warning:', storageError.message);
      }
    }

    // Delete the database record
    const { error: dbError } = await supabase
      .from('progress_photos')
      .delete()
      .eq('id', photoId);

    if (dbError) throw dbError;

    return Response.json({ success: true });
  } catch (err) {
    console.error('DELETE /api/admin/delete-photo error:', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
