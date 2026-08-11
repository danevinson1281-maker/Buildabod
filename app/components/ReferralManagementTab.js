'use client';

import { useState, useEffect, useImperativeHandle, forwardRef } from 'react';

const ReferralManagementTab = forwardRef(function ReferralManagementTab(props, ref) {
  const [referrals, setReferrals] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchReferrer, setSearchReferrer] = useState('');
  const [revoking, setRevoking] = useState(null);
  const [showRevokeConfirm, setShowRevokeConfirm] = useState(null);
  
  const [stats, setStats] = useState({
    totalReferrals: 0,
    completedReferrals: 0,
    pendingReferrals: 0,
    totalCreditsGiven: 0,
  });

  const [referrerStats, setReferrerStats] = useState([]);

  useEffect(() => {
    fetchReferrals();
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/clients', {
        headers: { 'Authorization': 'Bearer ' + token },
      });
      if (response.ok) {
        const data = await response.json();
        setClients(data.clients || []);
      }
    } catch (err) {
      console.error('Error fetching clients:', err);
    }
  };

  const fetchReferrals = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/referrals');
      const data = await response.json();

      if (response.ok) {
        setReferrals(data.referrals || []);
        setStats({
          totalReferrals: data.totalReferrals || 0,
          completedReferrals: data.completedReferrals || 0,
          pendingReferrals: data.pendingReferrals || 0,
          totalCreditsGiven: data.totalCreditsGiven || 0,
        });

        // Calculate referrer stats
        if (data.referrals) {
          const referrerMap = {};
          data.referrals.forEach(ref => {
            if (!referrerMap[ref.referrer_client_id]) {
              referrerMap[ref.referrer_client_id] = {
                id: ref.referrer_client_id,
                name: ref.referrer_name,
                email: ref.referrer_email || 'N/A',
                total: 0,
                completed: 0,
                pending: 0,
                creditsEarned: 0,
              };
            }
            referrerMap[ref.referrer_client_id].total++;
            if (ref.status === 'completed') {
              referrerMap[ref.referrer_client_id].completed++;
              referrerMap[ref.referrer_client_id].creditsEarned += 40;
            } else if (ref.status === 'pending') {
              referrerMap[ref.referrer_client_id].pending++;
            }
          });
          const sorted = Object.values(referrerMap).sort((a, b) => b.completed - a.completed);
          setReferrerStats(sorted);
        }
      } else {
        setError(data.error || 'Failed to fetch referrals');
      }
    } catch (err) {
      setError('Error loading referrals');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Expose fetchReferrals to parent component
  useImperativeHandle(ref, () => ({
    fetchReferrals,
  }));

  // ✅ NEW: Revoke Referral Credit
  const handleRevokeCredit = async (rewardCodeId) => {
    if (!rewardCodeId) return;
    
    setRevoking(rewardCodeId);
    try {
      const response = await fetch('/api/admin/revoke-referral', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          rewardCodeId,
          reason: 'Revoked by admin'
        }),
      });

      if (response.ok) {
        alert('Credit revoked successfully');
        setShowRevokeConfirm(null);
        await fetchReferrals();
      } else {
        const error = await response.json();
        alert('Failed to revoke: ' + error.error);
      }
    } catch (err) {
      console.error('Revoke error:', err);
      alert('Failed to revoke credit');
    } finally {
      setRevoking(null);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '400px' }}>
        <div style={{ textAlign: 'center', color: '#666' }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>⏳</div>
          <p>Loading referral data...</p>
        </div>
      </div>
    );
  }

  // Filter referrals
  let filteredReferrals = referrals;
  if (filterStatus !== 'all') {
    filteredReferrals = filteredReferrals.filter(r => r.status === filterStatus);
  }

  // Filter by referrer search
  if (searchReferrer.trim()) {
    filteredReferrals = filteredReferrals.filter(r =>
      r.referrer_name?.toLowerCase().includes(searchReferrer.toLowerCase())
    );
  }

  const pendingReferrals = referrals.filter(r => r.status === 'pending');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* HEADER */}
      <div>
        <h2 style={{ color: '#fff', fontSize: '28px', fontWeight: 'bold', margin: '0 0 4px' }}>
          🎁 Referral Management
        </h2>
        <p style={{ color: '#666', fontSize: '13px', margin: 0 }}>
          Track, approve, and manage your client referral network
        </p>
      </div>

      {/* STATS CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
        <div style={{ background: 'linear-gradient(135deg, #FFD700, #FFA500)', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 12px rgba(255,215,0,0.2)' }}>
          <p style={{ color: 'rgba(0,0,0,0.7)', fontSize: '12px', fontWeight: 'bold', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Referrals</p>
          <p style={{ color: '#000', fontSize: '32px', fontWeight: 'bold', margin: '8px 0 0' }}>{stats.totalReferrals}</p>
        </div>
        <div style={{ background: 'linear-gradient(135deg, #4CAF50, #45a049)', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 12px rgba(76,175,80,0.2)' }}>
          <p style={{ color: 'rgba(0,0,0,0.7)', fontSize: '12px', fontWeight: 'bold', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Completed</p>
          <p style={{ color: '#fff', fontSize: '32px', fontWeight: 'bold', margin: '8px 0 0' }}>{stats.completedReferrals}</p>
        </div>
        <div style={{ background: 'linear-gradient(135deg, #FF9800, #F57C00)', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 12px rgba(255,152,0,0.2)' }}>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px', fontWeight: 'bold', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Completed (Auto-approved)</p>
          <p style={{ color: '#fff', fontSize: '32px', fontWeight: 'bold', margin: '8px 0 0' }}>{stats.completedReferrals}</p>
        </div>
        <div style={{ background: 'linear-gradient(135deg, #2196F3, #1976D2)', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 12px rgba(33,150,243,0.2)' }}>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px', fontWeight: 'bold', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Revenue</p>
          <p style={{ color: '#fff', fontSize: '32px', fontWeight: 'bold', margin: '8px 0 0' }}>${stats.totalCreditsGiven}</p>
        </div>
      </div>

      {/* TWO COLUMN LAYOUT */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
        
        {/* LEFT: REFERRER LEADERBOARD */}
        <div style={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: '14px', padding: '20px', height: 'fit-content' }}>
          <h3 style={{ color: '#FFD700', fontSize: '16px', fontWeight: 'bold', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            🏆 TOP REFERRERS
          </h3>
          
          {referrerStats.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#666' }}>
              <p style={{ fontSize: '13px', margin: 0 }}>No referrers yet</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {referrerStats.slice(0, 10).map((referrer, idx) => (
                <div
                  key={referrer.id}
                  style={{
                    background: '#111',
                    border: '1px solid #222',
                    borderRadius: '8px',
                    padding: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = '#FFD700';
                    e.currentTarget.style.boxShadow = '0 0 12px rgba(255,215,0,0.1)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = '#222';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ color: '#FFD700', fontSize: '18px', fontWeight: 'bold', minWidth: '24px' }}>
                      #{idx + 1}
                    </span>
                    <span style={{ color: '#fff', fontSize: '13px', fontWeight: 'bold', flex: 1, marginLeft: '8px' }}>
                      {referrer.name}
                    </span>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '11px' }}>
                    <div>
                      <span style={{ color: '#888' }}>Total:</span>
                      <span style={{ color: '#fff', fontWeight: 'bold', marginLeft: '4px' }}>{referrer.total}</span>
                    </div>
                    <div>
                      <span style={{ color: '#888' }}>✅:</span>
                      <span style={{ color: '#4CAF50', fontWeight: 'bold', marginLeft: '4px' }}>{referrer.completed}</span>
                    </div>
                  </div>

                  <div style={{ background: '#FFD70011', border: '1px solid #FFD70022', borderRadius: '4px', padding: '8px', marginTop: '8px', textAlign: 'center' }}>
                    <p style={{ color: '#FFD700', fontSize: '12px', fontWeight: 'bold', margin: 0 }}>
                      ${referrer.creditsEarned} earned
                    </p>
                    <p style={{ color: '#888', fontSize: '10px', margin: '4px 0 0', fontStyle: 'italic' }}>
                      $40 per completed referral
                    </p>
                  </div>

                  {referrer.pending > 0 && (
                    <div style={{ background: '#FF990022', border: '1px solid #FF990033', borderRadius: '4px', padding: '6px', marginTop: '8px', textAlign: 'center' }}>
                      <p style={{ color: '#FF9800', fontSize: '10px', fontWeight: 'bold', margin: 0 }}>
                        ✅ {referrer.pending} auto-approved
                      </p>
                    </div>
                  )}

                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT: ALL REFERRALS */}
        <div style={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: '14px', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ color: '#FFD700', fontSize: '16px', fontWeight: 'bold', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              📋 ALL REFERRALS
              <span style={{ background: '#FFD70033', color: '#FFD700', fontSize: '12px', fontWeight: 'bold', borderRadius: '999px', padding: '2px 8px' }}>
                {filteredReferrals.length}
              </span>
            </h3>
          </div>

          {/* SEARCH & FILTER */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            <input
              type="text"
              placeholder="Search by referrer name..."
              value={searchReferrer}
              onChange={(e) => setSearchReferrer(e.target.value)}
              style={{
                flex: 1,
                background: '#111',
                border: '1px solid #333',
                borderRadius: '6px',
                color: '#fff',
                padding: '8px 12px',
                fontSize: '12px',
                outline: 'none',
              }}
              onFocus={e => e.target.style.borderColor = '#FFD700'}
              onBlur={e => e.target.style.borderColor = '#333'}
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{
                background: '#111',
                border: '1px solid #333',
                borderRadius: '6px',
                color: '#fff',
                padding: '8px 12px',
                fontSize: '12px',
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="denied">Denied</option>
              <option value="revoked">Revoked</option>
            </select>
          </div>

          {/* ALL REFERRALS LIST */}
          {filteredReferrals.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#666' }}>
              <p style={{ fontSize: '48px', margin: '0 0 12px' }}>🔍</p>
              <p style={{ fontSize: '14px', fontWeight: 'bold', margin: '0 0 4px' }}>No referrals found</p>
              <p style={{ fontSize: '12px', margin: 0 }}>Try changing your search or filter</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '600px', overflowY: 'auto' }}>
              {filteredReferrals.map((ref) => (
                <div
                  key={ref.id}
                  style={{
                    background: '#111',
                    border: '1px solid ' + (ref.status === 'completed' ? '#4CAF50' : ref.status === 'denied' ? '#ef4444' : '#555'),
                    borderRadius: '8px',
                    padding: '14px',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <div>
                      <p style={{ color: '#fff', fontSize: '13px', fontWeight: 'bold', margin: '0 0 4px' }}>
                        {ref.referrer_name} → {ref.referred_name}
                      </p>
                      <p style={{ color: '#888', fontSize: '11px', margin: 0 }}>
                        Code: <span style={{ color: '#FFD700', fontFamily: 'monospace' }}>{ref.referral_code}</span>
                        <span style={{ margin: '0 6px', color: '#444' }}>•</span>
                        {new Date(ref.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        fontSize: '10px',
                        fontWeight: 'bold',
                        padding: '3px 10px',
                        borderRadius: '999px',
                        backgroundColor: ref.status === 'completed' ? '#4CAF5022' : ref.status === 'denied' ? '#ef444422' : ref.status === 'revoked' ? '#55555522' : '#FFD70022',
                        color: ref.status === 'completed' ? '#4CAF50' : ref.status === 'denied' ? '#ef4444' : ref.status === 'revoked' ? '#888' : '#FFD700',
                        textTransform: 'uppercase',
                      }}>
                        {ref.status}
                      </span>
                      {ref.status === 'completed' && (
                        <span style={{ color: '#FFD700', fontSize: '12px', fontWeight: 'bold' }}>+$40</span>
                      )}
                    </div>
                  </div>

                  {ref.status === 'completed' && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => setShowRevokeConfirm(ref.reward_code_id)}
                        style={{
                          flex: 1,
                          background: '#ef4444',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '8px 12px',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={e => e.target.style.background = '#dc2626'}
                        onMouseLeave={e => e.target.style.background = '#ef4444'}
                      >
                        🗑️ Revoke Credit
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

        </div>
      </div>

      {/* REVOKE CONFIRMATION MODAL */}
      {showRevokeConfirm && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}>
          <div style={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: '16px', padding: '28px', maxWidth: '360px', width: '90%', textAlign: 'center' }}>
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>🗑️</div>
            <h3 style={{ color: '#fff', fontWeight: 'bold', fontSize: '18px', margin: '0 0 8px' }}>Revoke Credit?</h3>
            <p style={{ color: '#888', fontSize: '13px', margin: '0 0 24px' }}>This will remove the $40 credit from the referrer's account. This cannot be undone.</p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setShowRevokeConfirm(null)}
                style={{ flex: 1, background: '#2a2a2a', border: '1px solid #333', color: '#fff', fontWeight: 'bold', padding: '10px', borderRadius: '10px', cursor: 'pointer', fontSize: '13px' }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleRevokeCredit(showRevokeConfirm)}
                disabled={revoking === showRevokeConfirm}
                style={{ flex: 1, background: '#ef4444', border: 'none', color: '#fff', fontWeight: 'bold', padding: '10px', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', opacity: revoking === showRevokeConfirm ? 0.6 : 1 }}
              >
                {revoking === showRevokeConfirm ? 'Revoking...' : 'Revoke'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ERROR MESSAGE */}
      {error && (
        <div style={{ background: '#ef444422', border: '1px solid #ef4444', borderRadius: '8px', padding: '12px' }}>
          <p style={{ color: '#ef4444', fontSize: '13px', margin: 0 }}>⚠️ {error}</p>
        </div>
      )}
    </div>
  );
});

ReferralManagementTab.displayName = 'ReferralManagementTab';

export default ReferralManagementTab;
