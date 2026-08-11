'use client';

import { useState, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import PhotoConsentModal from './PhotoConsentModal';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function ProgressPhotosTab({ clientId, subscriptionTier, clientPhotoConsent, onConsentChange }) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [nextUploadDate, setNextUploadDate] = useState(null);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const fileInputRef = useRef(null);

  // Check if client can upload (weekly limit)
  const checkUploadLimit = async () => {
    try {
      const today = new Date();
      const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

      const { data, error: fetchError } = await supabase
        .from('progress_photos')
        .select('created_at')
        .eq('client_id', clientId)
        .gte('created_at', sevenDaysAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(1);

      if (fetchError) throw fetchError;

      if (data && data.length > 0) {
        const lastUpload = new Date(data[0].created_at);
        const nextAllowed = new Date(lastUpload.getTime() + 7 * 24 * 60 * 60 * 1000);
        setNextUploadDate(nextAllowed);
        return false;
      }

      setNextUploadDate(null);
      return true;
    } catch (err) {
      console.error('Error checking upload limit:', err);
      return true;
    }
  };

  const validateFile = (file) => {
    const maxSize = 10 * 1024 * 1024; // 10 MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

    if (!allowedTypes.includes(file.type)) {
      setError('Only JPG, PNG, and WebP images are allowed');
      return false;
    }

    if (file.size > maxSize) {
      setError('File size must be under 10 MB');
      return false;
    }

    return true;
  };

  const handleUpload = async (file) => {
    if (!validateFile(file)) return;

    const canUpload = await checkUploadLimit();
    if (!canUpload) {
      setError(`You can upload 1 photo per week. Next upload available: ${nextUploadDate?.toLocaleDateString()}`);
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(null);
    setUploadProgress(0);

    try {
      // Generate unique filename
      const timestamp = Date.now();
      const fileName = `${clientId}/${timestamp}-${file.name}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('buildabod-progress-photos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: publicUrl } = supabase.storage
        .from('buildabod-progress-photos')
        .getPublicUrl(fileName);

      // Save metadata to database with photo consent
      const { error: dbError } = await supabase
        .from('progress_photos')
        .insert([
          {
            client_id: clientId,
            photo_url: publicUrl.publicUrl,
            tier_at_upload: subscriptionTier,
            feedback_visible: false,
            photo_consent: clientPhotoConsent || 'private',
            consent_changed_at: new Date().toISOString(),
          },
        ]);

      if (dbError) throw dbError;

      setSuccess('Photo uploaded successfully! ✓');
      setUploadProgress(100);
      setNextUploadDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));

      // Reset after 2 seconds
      setTimeout(() => {
        setSuccess(null);
        setUploadProgress(0);
        fileInputRef.current.value = '';
      }, 2000);

    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleUpload(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header with Privacy Settings */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Progress Photos</h2>
          <p className="text-gray-400">
            Track your transformation week by week.
          </p>
        </div>
        <button
          onClick={() => setShowConsentModal(true)}
          className="text-xs px-3 py-1.5 rounded border border-yellow-500/50 bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 transition whitespace-nowrap"
          title="Manage photo privacy settings"
        >
          ⚙️ Privacy
        </button>
      </div>

      {/* Photo Consent Status */}
      <div className="p-3 rounded-lg text-sm" style={{
        backgroundColor: clientPhotoConsent === 'public' ? 'rgba(255, 215, 0, 0.1)' : 'rgba(33, 150, 243, 0.1)',
        borderLeft: `3px solid ${clientPhotoConsent === 'public' ? '#FFD700' : '#2196F3'}`
      }}>
        <p style={{ color: clientPhotoConsent === 'public' ? '#FFD700' : '#2196F3', margin: 0 }}>
          {clientPhotoConsent === 'public' 
            ? '🌍 Public: Your photos can be used in marketing and social media'
            : '🔒 Private: Only Dane sees your photos for coaching'}
        </p>
      </div>

      {/* Upload Area */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-12 text-center transition-all cursor-pointer ${
          dragActive
            ? 'border-yellow-500 bg-yellow-500/10'
            : 'border-yellow-700/30 bg-gray-900/50 hover:border-yellow-500/50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileSelect}
          disabled={uploading || (nextUploadDate && new Date() < nextUploadDate)}
          className="hidden"
        />

        <div className="space-y-4">
          <div className="text-5xl">📸</div>

          {nextUploadDate && new Date() < nextUploadDate ? (
            <>
              <div>
                <h3 className="text-lg font-bold text-white mb-1">Next upload available</h3>
                <p className="text-yellow-400 text-sm font-medium">
                  {nextUploadDate.toLocaleDateString()} at 12:00 PM
                </p>
                <p className="text-gray-400 text-xs mt-2">
                  You can upload 1 photo per week to stay consistent with your progress tracking.
                </p>
              </div>
            </>
          ) : (
            <>
              <div>
                <h3 className="text-lg font-bold text-white mb-1">Upload your progress photo</h3>
                <p className="text-gray-400 text-sm">
                  Drag and drop your photo here, or click to select
                </p>
              </div>

              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className={`inline-block px-6 py-2 rounded-lg font-medium transition-all ${
                  uploading
                    ? 'bg-yellow-500/50 text-black/50 cursor-not-allowed'
                    : 'bg-yellow-500 hover:bg-yellow-600 text-black'
                }`}
              >
                {uploading ? 'Uploading...' : 'Choose Photo'}
              </button>

              <p className="text-gray-500 text-xs">JPG, PNG or WebP. Max 10 MB.</p>
            </>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      {uploading && (
        <div>
          <div className="flex justify-between mb-2">
            <p className="text-sm text-gray-400">Uploading...</p>
            <p className="text-sm text-yellow-400 font-medium">{uploadProgress}%</p>
          </div>
          <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-yellow-500 transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-500/20 border border-red-500 rounded-lg">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="p-4 bg-green-500/20 border border-green-500 rounded-lg">
          <p className="text-green-400 text-sm">{success}</p>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-yellow-500/10 border border-yellow-700/30 rounded-lg p-4">
        <p className="text-sm text-gray-300">
          <span className="text-yellow-400 font-semibold">💡 Tip:</span> Upload every week for the best progress tracking. 
          {subscriptionTier === 'pro' && ' Your photos + monthly feedback from Dane help keep you accountable.'}
          {subscriptionTier === 'elite' && ' Your photos + weekly feedback from Dane accelerate your results.'}
        </p>
      </div>

      {/* Photo Consent Modal */}
      <PhotoConsentModal
        isOpen={showConsentModal}
        currentConsent={clientPhotoConsent}
        onSave={(newConsent) => {
          onConsentChange(newConsent);
          setShowConsentModal(false);
        }}
        onClose={() => setShowConsentModal(false)}
      />
    </div>
  );
}
