'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

export default function ClientSubscriptionCard({ client, onActionComplete }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [pauseMonths, setPauseMonths] = useState(1);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [showDowngradeModal, setShowDowngradeModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [newPlan, setNewPlan] = useState('kickstart');

  const status = client?.subscription_status || 'active';
  const planType = client?.plan_type || 'unknown';

  const statusConfig = {
    active: { color: '#22c55e', icon: '✅', label: 'ACTIVE', bg: '#05200f' },
    past_due: { color: '#f59e0b', icon: '⚠️', label: 'PAST DUE', bg: '#1a1410' },
    paused: { color: '#3b82f6', icon: '⏸️', label: 'PAUSED', bg: '#0f1419' },
    canceled: { color: '#ef4444', icon: '❌', label: 'CANCELED', bg: '#1a0a0a' },
  };

  const planConfig = {
    kickstart: { color: '#4CAF50', label: 'Kickstart', price: '$67' },
    pro: { color: '#2196F3', label: 'Pro', price: '$127/mo' },
    elite: { color: '#FFD700', label: 'Elite', price: '$197/mo' },
  };

  // ── PAUSE SUBSCRIPTION ──────────────────────────────────────────────────
  const handlePause = async () => {
    if (!pauseMonths) return;
    setLoading(true);
    setMessage('');

    try {
      const res = await fetch('/api/admin/pause-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId: client.id, months: parseInt(pauseMonths) }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to pause subscription');

      setMessage(`✅ Paused for ${pauseMonths} month(s)`);
      setShowPauseModal(false);
      setPauseMonths(1);
      if (onActionComplete) onActionComplete();
    } catch (error) {
      setMessage(`❌ ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // ── RESUME SUBSCRIPTION ─────────────────────────────────────────────────
  const handleResume = async () => {
    setLoading(true);
    setMessage('');

    try {
      const res = await fetch('/api/admin/resume-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId: client.id }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to resume subscription');

      setMessage('✅ Subscription resumed');
      if (onActionComplete) onActionComplete();
    } catch (error) {
      setMessage(`❌ ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // ── DOWNGRADE PLAN ──────────────────────────────────────────────────────
  const handleDowngrade = async () => {
    setLoading(true);
    setMessage('');

    try {
      const res = await fetch('/api/admin/downgrade-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId: client.id, newPlan: newPlan }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to downgrade subscription');

      setMessage(`✅ Downgraded to ${newPlan}`);
      setShowDowngradeModal(false);
      setNewPlan('kickstart');
      if (onActionComplete) onActionComplete();
    } catch (error) {
      setMessage(`❌ ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // ── UPGRADE PLAN ────────────────────────────────────────────────────────
  const handleUpgrade = async () => {
    setLoading(true);
    setMessage('');

    try {
      const res = await fetch('/api/admin/upgrade-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId: client.id, newPlan: newPlan }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to upgrade subscription');

      setMessage(`✅ Upgraded to ${newPlan}`);
      setShowUpgradeModal(false);
      setNewPlan(planType === 'kickstart' ? 'pro' : 'elite');
      if (onActionComplete) onActionComplete();
    } catch (error) {
      setMessage(`❌ ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // ── CANCEL SUBSCRIPTION ─────────────────────────────────────────────────
  const handleCancel = async () => {
    setLoading(true);
    setMessage('');

    try {
      const res = await fetch('/api/admin/cancel-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId: client.id, reason: cancelReason }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to cancel subscription');

      setMessage('✅ Subscription canceled');
      setShowCancelModal(false);
      setCancelReason('');
      if (onActionComplete) onActionComplete();
    } catch (error) {
      setMessage(`❌ ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const config = statusConfig[status];
  const planConfig_value = planConfig[planType];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: '#1a1a1a',
        border: `2px solid ${config.color}`,
        borderRadius: '14px',
        padding: '20px',
        marginBottom: '16px',
        boxShadow: `0 0 16px ${config.color}22`,
      }}
    >
      {/* HEADER ROW */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
        <div style={{ flex: 1 }}>
          <h3 style={{ color: '#fff', fontSize: '16px', fontWeight: 'bold', margin: '0 0 4px' }}>
            {client.full_name}
          </h3>
          <p style={{ color: '#888', fontSize: '12px', margin: 0 }}>
            {client.email}
          </p>
        </div>

        {/* STATUS & PLAN BADGES */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              background: config.bg,
              color: config.color,
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '11px',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              border: `1px solid ${config.color}33`,
            }}
          >
            {config.icon} {config.label}
          </span>
          <span
            style={{
              display: 'inline-block',
              background: planConfig_value.color + '22',
              color: planConfig_value.color,
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '11px',
              fontWeight: 'bold',
              border: `1px solid ${planConfig_value.color}33`,
            }}
          >
            {planConfig_value.label}
          </span>
        </div>
      </div>

      {/* STATUS INFO */}
      <div style={{ background: '#111', borderRadius: '8px', padding: '12px', marginBottom: '16px', fontSize: '12px', color: config.color }}>
        {status === 'past_due' && (
          <p style={{ margin: 0 }}>
            ⚠️ Payment failed on {new Date(client.last_payment_failed_at).toLocaleDateString()}
            <br />
            <span style={{ fontSize: '10px', color: '#888' }}>Retry count: {client.payment_failure_retry_count}/3</span>
          </p>
        )}

        {status === 'paused' && (
          <p style={{ margin: 0 }}>
            ⏸️ Paused until {new Date(client.subscription_paused_until).toLocaleDateString()}
          </p>
        )}

        {status === 'active' && (
          <p style={{ margin: 0 }}>
            ✅ Active {client.subscription_next_billing_at && `| Next billing: ${new Date(client.subscription_next_billing_at).toLocaleDateString()}`}
          </p>
        )}

        {status === 'canceled' && (
          <p style={{ margin: 0 }}>
            ❌ Canceled on {new Date(client.subscription_canceled_at).toLocaleDateString()}
          </p>
        )}
      </div>

      {/* MESSAGE */}
      {message && (
        <p
          style={{
            fontSize: '12px',
            margin: '0 0 12px',
            color: message.includes('✅') ? '#22c55e' : '#ef4444',
            fontWeight: 'bold',
          }}
        >
          {message}
        </p>
      )}

      {/* ACTION BUTTONS */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
        {/* ACTIVE SUBSCRIPTIONS */}
        {status === 'active' && client.plan_type !== 'kickstart' && (
          <>
            {/* PAUSE BUTTON */}
            <button
              onClick={() => setShowPauseModal(true)}
              disabled={loading}
              style={{
                padding: '10px 14px',
                background: '#3b82f6',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 'bold',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => !loading && (e.target.style.background = '#2563eb')}
              onMouseLeave={(e) => (e.target.style.background = '#3b82f6')}
            >
              ⏸️ Pause
            </button>

            {/* UPGRADE BUTTON (Pro → Elite or Kickstart → Pro) */}
            {(planType === 'pro' || planType === 'kickstart') && (
              <button
                onClick={() => {
                  setNewPlan(planType === 'pro' ? 'elite' : 'pro');
                  setShowUpgradeModal(true);
                }}
                disabled={loading}
                style={{
                  padding: '10px 14px',
                  background: '#10b981',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.6 : 1,
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => !loading && (e.target.style.background = '#059669')}
                onMouseLeave={(e) => (e.target.style.background = '#10b981')}
              >
                ⬆️ Upgrade
              </button>
            )}

            {/* DOWNGRADE BUTTON (Elite → Pro only) */}
            {planType === 'elite' && (
              <button
                onClick={() => setShowDowngradeModal(true)}
                disabled={loading}
                style={{
                  padding: '10px 14px',
                  background: '#8b5cf6',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.6 : 1,
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => !loading && (e.target.style.background = '#7c3aed')}
                onMouseLeave={(e) => (e.target.style.background = '#8b5cf6')}
              >
                ⬇️ Downgrade
              </button>
            )}

            {/* CANCEL BUTTON */}
            <button
              onClick={() => setShowCancelModal(true)}
              disabled={loading}
              style={{
                padding: '10px 14px',
                background: '#ef4444',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 'bold',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => !loading && (e.target.style.background = '#dc2626')}
              onMouseLeave={(e) => (e.target.style.background = '#ef4444')}
            >
              ❌ Cancel
            </button>
          </>
        )}

        {/* KICKSTART (one-time) */}
        {status === 'active' && client.plan_type === 'kickstart' && (
          <span style={{ color: '#888', fontSize: '12px', padding: '10px 0' }}>
            One-time plan — no subscription management
          </span>
        )}

        {/* PAUSED */}
        {status === 'paused' && (
          <button
            onClick={handleResume}
            disabled={loading}
            style={{
              padding: '10px 14px',
              background: '#22c55e',
              color: '#000',
              border: 'none',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => !loading && (e.target.style.background = '#16a34a')}
            onMouseLeave={(e) => (e.target.style.background = '#22c55e')}
          >
            ▶️ Resume
          </button>
        )}

        {/* PAST DUE */}
        {status === 'past_due' && (
          <button
            onClick={handleResume}
            disabled={loading}
            style={{
              padding: '10px 14px',
              background: '#22c55e',
              color: '#000',
              border: 'none',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => !loading && (e.target.style.background = '#16a34a')}
            onMouseLeave={(e) => (e.target.style.background = '#22c55e')}
          >
            ✅ Mark as Paid
          </button>
        )}
      </div>

      {/* ── PAUSE MODAL ── */}
      {showPauseModal && (
        <div style={{ background: '#111', border: '1px solid #333', borderRadius: '8px', padding: '16px', marginTop: '12px' }}>
          <p style={{ color: '#fff', fontSize: '13px', fontWeight: 'bold', margin: '0 0 12px' }}>
            Pause for how many months?
          </p>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            {[1, 2, 3].map((months) => (
              <button
                key={months}
                onClick={() => setPauseMonths(months)}
                style={{
                  flex: 1,
                  padding: '8px',
                  background: pauseMonths === months ? '#3b82f6' : '#222',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                }}
              >
                {months}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setShowPauseModal(false)}
              style={{
                flex: 1,
                padding: '8px',
                background: '#222',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              onClick={handlePause}
              disabled={loading}
              style={{
                flex: 1,
                padding: '8px',
                background: '#3b82f6',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: 'bold',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? '...' : 'Pause'}
            </button>
          </div>
        </div>
      )}

      {/* ── UPGRADE MODAL ── */}
      {showUpgradeModal && (
        <div style={{ background: '#111', border: '1px solid #333', borderRadius: '8px', padding: '16px', marginTop: '12px' }}>
          <p style={{ color: '#fff', fontSize: '13px', fontWeight: 'bold', margin: '0 0 12px' }}>
            Upgrade to which plan?
          </p>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            {planType === 'kickstart' && (
              <>
                <button
                  onClick={() => setNewPlan('pro')}
                  style={{
                    flex: 1,
                    padding: '8px',
                    background: newPlan === 'pro' ? '#10b981' : '#222',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                  }}
                >
                  PRO ($127/mo)
                </button>
                <button
                  onClick={() => setNewPlan('elite')}
                  style={{
                    flex: 1,
                    padding: '8px',
                    background: newPlan === 'elite' ? '#10b981' : '#222',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                  }}
                >
                  ELITE ($197/mo)
                </button>
              </>
            )}
            {planType === 'pro' && (
              <button
                onClick={() => setNewPlan('elite')}
                style={{
                  flex: 1,
                  padding: '8px',
                  background: newPlan === 'elite' ? '#10b981' : '#222',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                }}
              >
                ELITE ($197/mo)
              </button>
            )}
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setShowUpgradeModal(false)}
              style={{
                flex: 1,
                padding: '8px',
                background: '#222',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleUpgrade}
              disabled={loading}
              style={{
                flex: 1,
                padding: '8px',
                background: '#10b981',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: 'bold',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? '...' : 'Upgrade'}
            </button>
          </div>
        </div>
      )}

      {/* ── DOWNGRADE MODAL ── */}
      {showDowngradeModal && (
        <div style={{ background: '#111', border: '1px solid #333', borderRadius: '8px', padding: '16px', marginTop: '12px' }}>
          <p style={{ color: '#fff', fontSize: '13px', fontWeight: 'bold', margin: '0 0 12px' }}>
            Downgrade to which plan?
          </p>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            <button
              onClick={() => setNewPlan('pro')}
              style={{
                flex: 1,
                padding: '8px',
                background: newPlan === 'pro' ? '#8b5cf6' : '#222',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
            >
              PRO ($97/mo)
            </button>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setShowDowngradeModal(false)}
              style={{
                flex: 1,
                padding: '8px',
                background: '#222',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleDowngrade}
              disabled={loading}
              style={{
                flex: 1,
                padding: '8px',
                background: '#8b5cf6',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: 'bold',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? '...' : 'Downgrade'}
            </button>
          </div>
        </div>
      )}

      {/* ── CANCEL MODAL ── */}
      {showCancelModal && (
        <div style={{ background: '#111', border: '1px solid #333', borderRadius: '8px', padding: '16px', marginTop: '12px' }}>
          <p style={{ color: '#fff', fontSize: '13px', fontWeight: 'bold', margin: '0 0 12px' }}>
            Reason for cancellation (optional):
          </p>
          <textarea
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="Customer requested, payment failed, etc."
            style={{
              width: '100%',
              background: '#222',
              border: '1px solid #333',
              borderRadius: '4px',
              color: '#fff',
              padding: '8px',
              fontSize: '12px',
              marginBottom: '12px',
              minHeight: '60px',
              fontFamily: 'Arial',
            }}
          />
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => {
                setShowCancelModal(false);
                setCancelReason('');
              }}
              style={{
                flex: 1,
                padding: '8px',
                background: '#222',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
            >
              Keep
            </button>
            <button
              onClick={handleCancel}
              disabled={loading}
              style={{
                flex: 1,
                padding: '8px',
                background: '#ef4444',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: 'bold',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? '...' : 'Cancel Sub'}
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
