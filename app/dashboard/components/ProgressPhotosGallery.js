'use client';

import { useState, useEffect } from 'react';


export default function ProgressPhotosGallery({ clientId, subscriptionTier }) {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPhotos();
  }, [clientId]);

  const fetchPhotos = async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('progress_photos')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setPhotos(data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching photos:', err);
      setError('Failed to load photos');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getWeeksAgo = (dateString) => {
    const uploadDate = new Date(dateString);
    const today = new Date();
    const diffTime = Math.abs(today - uploadDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const weeks = Math.floor(diffDays / 7);

    if (weeks === 0) return 'This week';
    if (weeks === 1) return '1 week ago';
    return `${weeks} weeks ago`;
  };

  const canSeeFeedback = (photo) => {
    return (subscriptionTier === 'pro' || subscriptionTier === 'elite') && 
           photo.dane_feedback && 
           photo.feedback_visible;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block">
            <svg className="animate-spin h-8 w-8 text-yellow-500" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
          <p className="text-gray-400 mt-3">Loading your photos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-500/20 border border-red-500 rounded-lg">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-5xl mb-4">📸</div>
        <h3 className="text-lg font-bold text-white mb-2">No photos yet</h3>
        <p className="text-gray-400">
          Upload your first progress photo above to start tracking your transformation.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Gallery Header */}
      <div>
        <h3 className="text-xl font-bold text-white mb-1">Your Progress</h3>
        <p className="text-gray-400 text-sm">
          {photos.length} photo{photos.length !== 1 ? 's' : ''} uploaded
        </p>
      </div>

      {/* Photos Timeline */}
      <div className="space-y-4">
        {photos.map((photo, index) => (
          <div
            key={photo.id}
            className="bg-gray-900/50 border border-yellow-700/30 rounded-lg overflow-hidden hover:border-yellow-500/50 transition-all"
          >
            {/* Photo Preview */}
            <div className="flex flex-col md:flex-row gap-4 p-4">
              {/* Image */}
              <div
                onClick={() => setSelectedPhoto(photo)}
                className="cursor-pointer flex-shrink-0 w-full md:w-40 h-48 md:h-40 rounded-lg overflow-hidden bg-gray-800 hover:opacity-90 transition-opacity"
              >
                <img
                  src={photo.photo_url}
                  alt={`Progress photo ${index + 1}`}
className="w-full h-full object-contain object-top"                  onError={(e) => {
                    e.target.src = '/placeholder-photo.png';
                  }}
                />
              </div>

              {/* Photo Info */}
              <div className="flex-1 flex flex-col justify-between">
                {/* Date & Week Info */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <p className="text-white font-semibold">{formatDate(photo.created_at)}</p>
                    <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded">
                      {getWeeksAgo(photo.created_at)}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm">
                    Uploaded {new Date(photo.created_at).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                      meridiem: 'short',
                    })}
                  </p>
                </div>

                {/* Feedback Section */}
                {canSeeFeedback(photo) ? (
                  <div className="mt-4 pt-4 border-t border-yellow-700/20">
                    <div className="flex items-start gap-2 mb-2">
                      <span className="text-lg">💪</span>
                      <span className="text-xs font-bold text-yellow-400 uppercase tracking-wider">
                        Dane's Feedback
                      </span>
                    </div>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      {photo.dane_feedback}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(photo.dane_feedback_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                ) : photo.dane_feedback && !photo.feedback_visible ? (
                  <div className="mt-4 pt-4 border-t border-yellow-700/20">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🔒</span>
                      <p className="text-gray-400 text-sm">
                        Feedback locked — upgrade to Pro or Elite to see Dane's insights
                      </p>
                    </div>
                  </div>
                ) : subscriptionTier === 'basic' ? (
                  <div className="mt-4 pt-4 border-t border-yellow-700/20">
                    <div className="flex items-start gap-2">
                      <span className="text-lg">✨</span>
                      <p className="text-gray-400 text-sm">
                        Upgrade to Pro or Elite to get personalized feedback on your progress
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 pt-4 border-t border-yellow-700/20">
                    <div className="flex items-start gap-2">
                      <span className="text-lg">⏳</span>
                      <p className="text-gray-400 text-sm">
                        Waiting for Dane's feedback...
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal for Full Photo View */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="bg-gray-900 border border-yellow-700/30 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <div className="sticky top-0 flex justify-between items-center p-4 border-b border-yellow-700/20 bg-gray-900/95">
              <h3 className="text-white font-bold">
                {formatDate(selectedPhoto.created_at)}
              </h3>
              <button
                onClick={() => setSelectedPhoto(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Full Image */}
            <div className="bg-black flex items-center justify-center min-h-96">
              <img
                src={selectedPhoto.photo_url}
                alt="Full progress photo"
                className="max-w-full max-h-[60vh] object-contain"
                onError={(e) => {
                  e.target.src = '/placeholder-photo.png';
                }}
              />
            </div>

            {/* Photo Details */}
            <div className="p-6 space-y-4">
              <div>
                <p className="text-gray-400 text-sm mb-2">
                  {getWeeksAgo(selectedPhoto.created_at)} • Tier: <span className="text-yellow-400 capitalize">{selectedPhoto.tier_at_upload}</span>
                </p>
              </div>

              {/* Feedback in Modal */}
              {canSeeFeedback(selectedPhoto) && (
                <div className="bg-yellow-500/10 border border-yellow-700/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">💪</span>
                    <span className="text-sm font-bold text-yellow-400 uppercase tracking-wider">
                      Dane's Feedback
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {selectedPhoto.dane_feedback}
                  </p>
                  <p className="text-xs text-gray-500 mt-3">
                    {new Date(selectedPhoto.dane_feedback_at).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
