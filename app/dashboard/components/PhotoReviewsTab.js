'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default function PhotoReviewsTab() {
  const [photos, setPhotos] = useState([]);
  const [clients, setClients] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [sendingFeedback, setSendingFeedback] = useState(false);
  const [filterTier, setFilterTier] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [searchClient, setSearchClient] = useState('');

  useEffect(() => {
    fetchPhotosAndClients();
  }, []);

  const fetchPhotosAndClients = async () => {
    try {
      setLoading(true);
  const fetchWeightCorrections = async (clientId) => {
    try {
      const { data, error } = await supabase
        .from('weight_corrections')
        .select('*')
        .eq('client_id', clientId)
        .eq('status', 'pending_review')
        .order('created_at', { ascending: false })

      if (error) throw error
      setClientWeightCorrections(data || [])
    } catch (error) {
      console.error('Error fetching weight corrections:', error)
    }
  }

  const handleApproveWeightCorrection = async (correction) => {
    setApprovingCorrection(correction.id)

    try {
      // Update weight_logs table with corrected weight
      const { error: updateError } = await supabase
        .from('weight_logs')
        .update({
          weight_lbs: correction.corrected_weight,
          corrected_at: new Date().toISOString(),
          correction_id: correction.id,
        })
        .eq('id', correction.weight_log_id)

      if (updateError) throw updateError

      // Mark correction as approved
      const { error: correctionError } = await supabase
        .from('weight_corrections')
        .update({
          status: 'approved',
          corrected_by: 'admin',
        })
        .eq('id', correction.id)

      if (correctionError) throw correctionError

      // Notify client
      const { data: clientData } = await supabase
        .from('clients')
        .select('email, full_name')
        .eq('id', correction.client_id)
        .single()

      if (clientData?.email) {
        await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: clientData.email,
            subject: '✅ Weight Correction Approved',
            html: `
              <p>Hi ${clientData.full_name},</p>
              <p>Your weight entry correction has been approved and applied:</p>
              <p><strong>${parseFloat(correction.original_weight).toFixed(1)} lbs → ${parseFloat(correction.corrected_weight).toFixed(1)} lbs</strong></p>
              <p>Your weight history has been updated. Keep up the great work!</p>
            `,
          }),
        }).catch(e => console.error('Email error:', e))
      }

      // Refresh
      await fetchWeightCorrections(selectedClient.id)
      alert('✅ Correction approved and weight updated!')
    } catch (error) {
      console.error('Error approving correction:', error)
      alert('Error approving correction: ' + error.message)
    } finally {
      setApprovingCorrection(null)
    }
  }

  const handleDenyWeightCorrection = async (correction) => {
    setDenyingCorrection(correction.id)

    try {
      // Mark correction as denied
      const { error: correctionError } = await supabase
        .from('weight_corrections')
        .update({
          status: 'denied',
          corrected_by: 'admin',
        })
        .eq('id', correction.id)

      if (correctionError) throw correctionError

      // Notify client
      const { data: clientData } = await supabase
        .from('clients')
        .select('email, full_name')
        .eq('id', correction.client_id)
        .single()

      if (clientData?.email) {
        await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: clientData.email,
            subject: '📋 Weight Correction Update',
            html: `
              <p>Hi ${clientData.full_name},</p>
              <p>We reviewed your weight entry correction request. After looking at your progress, Dane determined the original entry should stand as recorded.</p>
              <p>If you believe this is incorrect, please reach out for clarification.</p>
            `,
          }),
        }).catch(e => console.error('Email error:', e))
      }

      // Refresh
      await fetchWeightCorrections(selectedClient.id)
      alert('✅ Correction denied')
    } catch (error) {
      console.error('Error denying correction:', error)
      alert('Error denying correction: ' + error.message)
    } finally {
      setDenyingCorrection(null)
    }
  }

      // Fetch all photos
      const { data: photosData, error: photosError } = await supabase
        .from('progress_photos')
        .select('*')
        .order('created_at', { ascending: false });

      if (photosError) throw photosError;

      // Fetch all clients
      const { data: clientsData, error: clientsError } = await supabase
        .from('clients')
        .select('id, full_name, email, subscription_tier, current_weight, goal_weight, primary_goal');

      if (clientsError) throw clientsError;

      setPhotos(photosData || []);

      // Create client map for quick lookup
      const clientMap = {};
      clientsData?.forEach(client => {
        clientMap[client.id] = client;
      });
      setClients(clientMap);

      setError(null);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load photos');
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortPhotos = () => {
    let filtered = [...photos];

    // Filter by tier
    if (filterTier !== 'all') {
      filtered = filtered.filter(p => p.tier_at_upload === filterTier);
    }

    // Filter by client name
    if (searchClient.trim()) {
      filtered = filtered.filter(p => {
        const client = clients[p.client_id];
        return client?.full_name.toLowerCase().includes(searchClient.toLowerCase());
      });
    }

    // Sort
    if (sortBy === 'newest') {
      filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else if (sortBy === 'oldest') {
      filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    } else if (sortBy === 'pending-feedback') {
      filtered.sort((a, b) => {
        const aHasFeedback = a.dane_feedback ? 1 : 0;
        const bHasFeedback = b.dane_feedback ? 1 : 0;
        return aHasFeedback - bHasFeedback;
      });
    }

    return filtered;
  };

  const handleSendFeedback = async () => {
    if (!selectedPhoto || !feedback.trim()) {
      setError('Please enter feedback');
      return;
    }

    if (feedback.length > 500) {
      setError('Feedback must be 500 characters or less');
      return;
    }

    setSendingFeedback(true);

    try {
      // Determine if feedback should be visible
      const shouldBeVisible = selectedPhoto.tier_at_upload === 'pro' || selectedPhoto.tier_at_upload === 'elite';

      // Update photo with feedback
      const { error: updateError } = await supabase
        .from('progress_photos')
        .update({
          dane_feedback: feedback,
          dane_feedback_at: new Date().toISOString(),
          feedback_visible: shouldBeVisible,
        })
        .eq('id', selectedPhoto.id);

      if (updateError) throw updateError;

      // Send notification email if Pro or Elite
      if (shouldBeVisible) {
        const client = clients[selectedPhoto.client_id];
        if (client) {
          await fetch('/api/admin/send-photo-feedback/route.js', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              clientEmail: client.email,
              clientName: client.full_name,
              feedback: feedback,
              photoUrl: selectedPhoto.photo_url,
            }),
          });
        }
      }

      // Update local state
      setPhotos(photos.map(p => 
        p.id === selectedPhoto.id 
          ? {
              ...p,
              dane_feedback: feedback,
              dane_feedback_at: new Date().toISOString(),
              feedback_visible: shouldBeVisible,
            }
          : p
      ));

      setFeedback('');
      setSelectedPhoto(null);
      setError(null);

      // Show success message
      setTimeout(() => {
        alert('Feedback sent! ✓');
      }, 500);

    } catch (err) {
      console.error('Error sending feedback:', err);
      setError('Failed to send feedback');
    } finally {
      setSendingFeedback(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTierBadgeColor = (tier) => {
    switch (tier) {
      case 'basic':
        return 'bg-gray-500/20 text-gray-400 border-gray-700';
      case 'pro':
        return 'bg-blue-500/20 text-blue-400 border-blue-700';
      case 'elite':
        return 'bg-purple-500/20 text-purple-400 border-purple-700';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-700';
    }
  };

  const filteredPhotos = filterAndSortPhotos();

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
          <p className="text-gray-400 mt-3">Loading photos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-2xl font-bold text-white mb-2">Photo Reviews</h3>
        <p className="text-gray-400">
          Review all client progress photos. You can provide feedback to Pro and Elite clients.
        </p>
      </div>

      {/* Filters & Search */}
      <div className="bg-gray-900/50 border border-yellow-700/30 rounded-lg p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search by client name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Search Client</label>
            <input
              type="text"
              value={searchClient}
              onChange={(e) => setSearchClient(e.target.value)}
              placeholder="Client name..."
              className="w-full px-4 py-2 bg-gray-800 border border-yellow-700/30 rounded-lg text-white focus:outline-none focus:border-yellow-500"
            />
          </div>

          {/* Filter by tier */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Filter by Tier</label>
            <select
              value={filterTier}
              onChange={(e) => setFilterTier(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 border border-yellow-700/30 rounded-lg text-white focus:outline-none focus:border-yellow-500"
            >
              <option value="all">All Tiers</option>
              <option value="basic">Basic</option>
              <option value="pro">Pro</option>
              <option value="elite">Elite</option>
            </select>
          </div>

          {/* Sort */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Sort</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 border border-yellow-700/30 rounded-lg text-white focus:outline-none focus:border-yellow-500"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="pending-feedback">Pending Feedback First</option>
            </select>
          </div>
        </div>

        <p className="text-sm text-gray-400">
          Showing <span className="font-bold text-yellow-400">{filteredPhotos.length}</span> photo{filteredPhotos.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-500/20 border border-red-500 rounded-lg">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Photos Grid */}
      {filteredPhotos.length === 0 ? (
        <div className="text-center py-12 bg-gray-900/50 border border-yellow-700/30 rounded-lg">
          <p className="text-gray-400">No photos found</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredPhotos.map((photo) => {
            const client = clients[photo.client_id];
            const hasFeedback = !!photo.dane_feedback;

            return (
              <button
                key={photo.id}
                onClick={() => {
                  setSelectedPhoto(photo);
                  setFeedback(photo.dane_feedback || '');
                }}
                className="relative group rounded-lg overflow-hidden hover:ring-2 hover:ring-yellow-500 transition-all"
              >
                {/* Image */}
                <img
                  src={photo.photo_url}
                  alt={`Photo from ${client?.full_name}`}
                  className="w-full aspect-square object-contain bg-gray-800"
                  onError={(e) => {
                    e.target.src = '/placeholder-photo.png';
                  }}
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                  <div className="text-left">
                    <p className="text-white text-xs font-bold truncate">
                      {client?.full_name || 'Unknown'}
                    </p>
                    <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded border mt-1 ${getTierBadgeColor(photo.tier_at_upload)}`}>
                      {photo.tier_at_upload.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-gray-300 text-xs">
                    {formatDate(photo.created_at)}
                  </p>
                </div>

                {/* Feedback Badge */}
                {hasFeedback && (
                  <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                    ✓
                  </div>
                )}

                {/* Pending Badge */}
                {!hasFeedback && (photo.tier_at_upload === 'pro' || photo.tier_at_upload === 'elite') && (
                  <div className="absolute top-2 right-2 bg-yellow-500 text-black rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                    !
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Photo Detail Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="bg-gray-900 border border-yellow-700/30 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <div className="sticky top-0 flex justify-between items-center p-4 border-b border-yellow-700/20 bg-gray-900/95">
              <h3 className="text-white font-bold">Review Photo</h3>
              <button
                onClick={() => setSelectedPhoto(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
              {/* Photo */}
              <div className="flex flex-col gap-4">
                <div className="bg-black rounded-lg flex items-center justify-center aspect-square overflow-hidden">
                  <img
                    src={selectedPhoto.photo_url}
                    alt="Photo review"
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.target.src = '/placeholder-photo.png';
                    }}
                  />
                </div>
                <p className="text-sm text-gray-400">
                  Uploaded: {formatDate(selectedPhoto.created_at)}
                </p>
              </div>

              {/* Client Info & Feedback */}
              <div className="space-y-6">
                {/* Client Info */}
                {clients[selectedPhoto.client_id] && (
                  <div className="bg-gray-800/50 border border-yellow-700/30 rounded-lg p-4 space-y-2">
                    <h4 className="text-white font-bold mb-3">Client Info</h4>
                    <div>
                      <p className="text-gray-400 text-sm">Name</p>
                      <p className="text-white font-semibold">{clients[selectedPhoto.client_id].full_name}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Email</p>
                      <p className="text-white">{clients[selectedPhoto.client_id].email}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div>
                        <p className="text-gray-400 text-sm">Tier</p>
                        <span className={`inline-block text-sm font-bold px-3 py-1 rounded border ${getTierBadgeColor(selectedPhoto.tier_at_upload)}`}>
                          {selectedPhoto.tier_at_upload.toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Goal</p>
                        <p className="text-white font-semibold capitalize">{clients[selectedPhoto.client_id].primary_goal?.replace('-', ' ')}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <div>
                        <p className="text-gray-400 text-sm">Current</p>
                        <p className="text-white font-semibold">{clients[selectedPhoto.client_id].current_weight} lbs</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Goal Weight</p>
                        <p className="text-white font-semibold">{clients[selectedPhoto.client_id].goal_weight} lbs</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Feedback Section */}
                <div className="space-y-3">
                  <div>
                    <h4 className="text-white font-bold mb-2">Feedback</h4>
                    <p className="text-gray-400 text-sm mb-2">
                      {selectedPhoto.tier_at_upload === 'basic'
                        ? 'Basic tier — feedback will be saved but not visible to client until upgrade.'
                        : 'Pro/Elite tier — client will be notified when you send feedback.'}
                    </p>
                  </div>

                  <div>
                    <textarea
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="Keep it short and encouraging. 1-3 sentences max..."
                      maxLength={500}
                      className="w-full px-4 py-3 bg-gray-800 border border-yellow-700/30 rounded-lg text-white focus:outline-none focus:border-yellow-500 resize-none h-24"
                    />
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-xs text-gray-500">
                        {feedback.length}/500 characters
                      </p>
                      {feedback.length > 500 && (
                        <p className="text-xs text-red-400">Too long</p>
                      )}
                    </div>
                  </div>

                  {selectedPhoto.dane_feedback && (
                    <div className="bg-green-500/10 border border-green-700/30 rounded-lg p-3">
                      <p className="text-xs font-bold text-green-400 mb-2">✓ FEEDBACK ALREADY SENT</p>
                      <p className="text-sm text-gray-300">{selectedPhoto.dane_feedback}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(selectedPhoto.dane_feedback_at).toLocaleDateString()}
                      </p>
                    </div>
                  )}

                  <button
                    onClick={handleSendFeedback}
                    disabled={sendingFeedback || !feedback.trim() || feedback.length > 500}
                    className={`w-full py-3 rounded-lg font-bold transition-all ${
                      sendingFeedback || !feedback.trim() || feedback.length > 500
                        ? 'bg-yellow-500/50 text-black/50 cursor-not-allowed'
                        : 'bg-yellow-500 hover:bg-yellow-600 text-black'
                    }`}
                  >
                    {sendingFeedback ? 'Sending...' : 'Send Feedback'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
