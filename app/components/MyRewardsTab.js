'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';

export default function MyRewardsTab({ clientId, clientData }) {
  const [giftCode, setGiftCode] = useState('');
  const [redeemingGift, setRedeemingGift] = useState(false);
  const [giftCodeMessage, setGiftCodeMessage] = useState('');
  const [generatingCode, setGeneratingCode] = useState(false);
  const [applyingCredit, setApplyingCredit] = useState(false);
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copiedCode, setCopiedCode] = useState(null);
  const [daysRemaining, setDaysRemaining] = useState(null);
  const [referralCode, setReferralCode] = useState(null);
  const [referralLoading, setReferralLoading] = useState(true);

  const planType = clientData?.plan_type?.toLowerCase();
  const isKickstart = planType === 'kickstart';
  const isProOrElite = planType === 'pro' || planType === 'elite';

  useEffect(() => {
    fetchRewards();
    fetchReferralCode();
    if (isKickstart) {
      checkUpgradeWindow();
    }
  }, [clientId, isKickstart]);

  // ── CALCULATE TOTALS (MOVED TO TOP - BEFORE ANY CONDITIONAL RETURNS) ────────────────────
  const { spendableCredits, totalBalance, creditsRemainingThisCycle, giftCodes, activeGiftCodes, claimedGiftCodes } = useMemo(() => {
    const spendable = rewards.filter(r =>
      r.status === 'active' && r.reward_type === 'referrer_reward'
    );
    const balance = spendable.reduce((sum, r) => sum + parseFloat(r.amount || 0), 0);

    // ✅ FIX: Get the current billing cycle start (1st of this month)
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    startOfMonth.setHours(0, 0, 0, 0);

    console.log('📊 Billing cycle check:');
    console.log('  Current date:', now.toISOString());
    console.log('  Cycle start:', startOfMonth.toISOString());

    // ✅ FIX: Count redeemed credits THIS MONTH (redeemed_at >= start of month)
    const appliedThisMonth = rewards.filter(r => {
      // Only count redeemed, non-gift rewards
      if (r.status !== 'redeemed' || !r.redeemed_at) return false;
      if (r.reward_type === 'gift_code') return false;
      
      const redeemedDate = new Date(r.redeemed_at);
      redeemedDate.setHours(0, 0, 0, 0);
      
      const isThisMonth = redeemedDate >= startOfMonth;
      console.log(`    Checked: ${r.code} redeemed at ${r.redeemed_at} — thisMonth: ${isThisMonth}`);
      
      return isThisMonth;
    }).length;

    console.log(`  Applied this month: ${appliedThisMonth}`);

    const remaining = Math.max(0, 2 - appliedThisMonth);
    console.log(`  Remaining this month: ${remaining}`);

    const giftCodesFiltered = rewards.filter(r =>
      r.reward_type === 'gift_code'
    );
    const activeGifts = giftCodesFiltered.filter(r => r.status === 'active');
    const claimedGifts = giftCodesFiltered.filter(r => r.status === 'redeemed');

    return { 
      spendableCredits: spendable, 
      totalBalance: balance, 
      creditsRemainingThisCycle: remaining,
      giftCodes: giftCodesFiltered,
      activeGiftCodes: activeGifts,
      claimedGiftCodes: claimedGifts
    };
  }, [rewards]);

  // Transaction history: all non-active rewards (redeemed, expired, gifted)
  const transactions = useMemo(() => {
    return rewards
      .filter(r => r.status === 'redeemed' || r.status === 'expired')
      .sort((a, b) => new Date(b.redeemed_at || b.created_at) - new Date(a.redeemed_at || a.created_at));
  }, [rewards]);

  const fetchReferralCode = async () => {
    try {
      const res = await fetch(`/api/clients/${clientId}`);
      const data = await res.json();
      if (data.referral_code) setReferralCode(data.referral_code);
      setReferralLoading(false);
    } catch (err) {
      console.error('Error fetching referral code:', err);
      setReferralLoading(false);
    }
  };

  const checkUpgradeWindow = async () => {
    try {
      if (clientData?.kickstart_upgrade_expires) {
        const deadline = new Date(clientData.kickstart_upgrade_expires);
        const now = new Date();
        const days = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
        setDaysRemaining(Math.max(0, days));
        return;
      }
      const res = await fetch(`/api/clients/${clientId}`);
      const data = await res.json();
      if (data.kickstart_upgrade_expires && data.plan_type === 'kickstart') {
        const deadline = new Date(data.kickstart_upgrade_expires);
        const now = new Date();
        const days = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
        setDaysRemaining(Math.max(0, days));
      }
    } catch (err) {
      console.error('Error checking upgrade window:', err);
    }
  };

  const fetchRewards = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/clients/get-rewards?clientId=${clientId}`);
      const data = await res.json();
      if (res.ok) {
        setRewards(data.all || []);
      } else {
        setError(data.error || 'Failed to load rewards');
      }
    } catch (err) {
      console.error('Error fetching rewards:', err);
      setError('Error loading rewards');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (code) => {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(code)
        .then(() => { setCopiedCode(code); setTimeout(() => setCopiedCode(null), 2000); })
        .catch(() => fallbackCopy(code));
    } else {
      fallbackCopy(code);
    }
  };

  const fallbackCopy = (code) => {
    const textArea = document.createElement('textarea');
    textArea.value = code;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try { document.execCommand('copy'); setCopiedCode(code); setTimeout(() => setCopiedCode(null), 2000); }
    catch (err) { console.error('Copy failed:', err); }
    document.body.removeChild(textArea);
  };

  const shareCode = async (code) => {
    const shareText = `Here's a $40 gift credit for BuildABod! Use code: ${code} at buildabod.co 💪`;
    
    if (navigator.share) {
      try {
        await navigator.share({ title: 'BuildABod Gift Credit', text: shareText });
        return;
      } catch (err) {
        // User cancelled — fall through to copy
      }
    }
    
    copyToClipboard(code);
  };

  const handleApplyCredit = async () => {
    if (creditsRemainingThisCycle === 0) {
      alert('⚠️ You can apply up to 2 credits per billing cycle. Try again next month!');
      return;
    }

    if (!confirm('Apply $40 credit to your next payment?')) return;

    const availableReward = rewards.find(r =>
      r.status === 'active' && r.reward_type === 'referrer_reward'
    );

    if (!availableReward) {
      alert('No available credits to apply.');
      return;
    }

    try {
      setApplyingCredit(true);
      const response = await fetch('/api/clients/apply-reward', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rewardCodeId: availableReward.id, clientId }),
      });
      if (response.ok) {
        alert('✅ $40 credit applied! It will deduct from your next payment.');
        fetchRewards();
      } else {
        const errData = await response.json();
        alert('Failed: ' + errData.error);
      }
    } catch (err) {
      console.error('Error applying reward:', err);
      alert('Error applying credit');
    } finally {
      setApplyingCredit(false);
    }
  };

  const handleGenerateGiftCode = async () => {
    if (!confirm('Convert $40 of your credits into a gift code for a friend?')) return;

    try {
      setGeneratingCode(true);
      const response = await fetch('/api/clients/generate-gift-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId }),
      });

      if (response.ok) {
        fetchRewards();
      } else {
        const errData = await response.json();
        alert('Failed: ' + errData.error);
      }
    } catch (err) {
      console.error('Error generating gift code:', err);
      alert('Error generating gift code');
    } finally {
      setGeneratingCode(false);
    }
  };

  const handleRedeemGiftCode = async () => {
    if (!giftCode.trim()) return;
    try {
      setRedeemingGift(true);
      setGiftCodeMessage('');
      const response = await fetch('/api/clients/redeem-gift-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: giftCode.trim(), clientId }),
      });
      const data = await response.json();
      if (response.ok) {
        setGiftCodeMessage('✅ Credit applied! $40 will be deducted from your next payment.');
        setGiftCode('');
        fetchRewards();
      } else {
        setGiftCodeMessage('❌ ' + (data.error || 'Invalid or already used code.'));
      }
    } catch (err) {
      setGiftCodeMessage('❌ Something went wrong. Please try again.');
    } finally {
      setRedeemingGift(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div style={{ fontSize: '24px', marginBottom: '12px' }}>⏳</div>
        <p style={{ color: '#666' }}>Loading your rewards...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ background: '#ef444422', border: '1px solid #ef4444', borderRadius: '8px', padding: '16px' }}>
        <p style={{ color: '#ef4444', margin: 0 }}>⚠️ {error}</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* HEADER */}
      <div>
        <h2 style={{ color: '#fff', fontSize: '24px', fontWeight: 'bold', margin: '0 0 8px' }}>
          🎁 My Rewards
        </h2>
        <p style={{ color: '#666', fontSize: '13px', margin: 0 }}>
          Use your earned credits or create gift codes for friends
        </p>
      </div>

      {/* ✅ KICKSTART UPGRADE CARD */}
      {isKickstart && daysRemaining !== null && daysRemaining > 0 && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(34,197,94,0.1), rgba(255,215,0,0.08))',
          border: '2px solid #22c55e',
          borderRadius: '12px',
          padding: '24px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <h3 style={{ color: '#22c55e', fontSize: '18px', fontWeight: 'bold', margin: '0 0 8px' }}>
                ⏰ Upgrade Within {daysRemaining} Day{daysRemaining !== 1 ? 's' : ''}
              </h3>
              <p style={{ color: '#888', fontSize: '14px', margin: '0 0 12px' }}>
                Your Kickstart plan includes a <strong style={{ color: '#22c55e' }}>$67 credit</strong> toward Pro or Elite.
              </p>
              <Link href={`/upgrade?clientId=${clientId}`} style={{
                display: 'inline-block', padding: '12px 24px', background: '#22c55e',
                color: '#000', fontWeight: 'bold', borderRadius: '8px', textDecoration: 'none', fontSize: '14px',
              }}>
                Upgrade Now — Save $67
              </Link>
            </div>
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(34,197,94,0.2)', border: '2px solid #22c55e', borderRadius: '12px',
              padding: '20px', minWidth: '100px',
            }}>
              <p style={{ margin: 0, fontSize: '11px', color: '#888', fontWeight: 'bold', textTransform: 'uppercase' }}>Days Left</p>
              <p style={{ margin: '8px 0 0', fontSize: '32px', fontWeight: 'black', color: '#22c55e' }}>{daysRemaining}</p>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          CREDIT BALANCE + ACTION BUTTONS (Pro/Elite Only)
      ═══════════════════════════════════════════════════════════════ */}
      {isProOrElite && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(255,215,0,0.08), rgba(34,197,94,0.04))',
          border: '2px solid #FFD700',
          borderRadius: '12px',
          padding: '28px',
        }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <p style={{ color: '#888', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px', margin: '0 0 8px' }}>
              Your Credit Balance
            </p>
            <p style={{ fontSize: '42px', fontWeight: '900', color: '#FFD700', margin: '0 0 4px' }}>
              ${totalBalance.toFixed(2)}
            </p>
            <p style={{ color: '#666', fontSize: '13px', margin: 0 }}>
              From {spendableCredits.length} referral{spendableCredits.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* ACTION BUTTONS */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={handleApplyCredit}
              disabled={applyingCredit || totalBalance < 40 || creditsRemainingThisCycle === 0}
              style={{
                padding: '14px 24px',
                background: totalBalance >= 40 && creditsRemainingThisCycle > 0 ? '#FFD700' : '#333',
                color: totalBalance >= 40 && creditsRemainingThisCycle > 0 ? '#000' : '#666',
                border: 'none', borderRadius: '10px', fontWeight: 'bold', fontSize: '14px',
                cursor: totalBalance >= 40 && creditsRemainingThisCycle > 0 ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s', minWidth: '180px',
              }}
            >
              {applyingCredit ? '⏳ Applying...' : '💰 Apply $40 to My Account'}
            </button>

            <button
              onClick={handleGenerateGiftCode}
              disabled={generatingCode || totalBalance < 40}
              style={{
                padding: '14px 24px',
                background: totalBalance >= 40 ? '#22c55e' : '#333',
                color: totalBalance >= 40 ? '#000' : '#666',
                border: 'none', borderRadius: '10px', fontWeight: 'bold', fontSize: '14px',
                cursor: totalBalance >= 40 ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s', minWidth: '180px',
              }}
            >
              {generatingCode ? '⏳ Creating...' : '🎁 Gift $40 to a Friend'}
            </button>
          </div>

          {/* STATUS NOTES */}
          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            {creditsRemainingThisCycle === 0 ? (
              <p style={{ color: '#f59e0b', fontSize: '12px', margin: 0 }}>
                ⚠️ You've used your 2 account credits this billing cycle. Try again next month.
              </p>
            ) : (
              <p style={{ color: '#666', fontSize: '12px', margin: 0 }}>
                {creditsRemainingThisCycle} account credit{creditsRemainingThisCycle !== 1 ? 's' : ''} remaining this billing cycle
              </p>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          YOUR GIFT CODES (Codes created to share)
      ═══════════════════════════════════════════════════════════════ */}
      {giftCodes.length > 0 && (
        <div>
          <h3 style={{ color: '#FFD700', fontSize: '16px', fontWeight: 'bold', margin: '0 0 12px' }}>
            🎁 Your Gift Codes
          </h3>

          {/* Active/Unclaimed Gift Codes */}
          {activeGiftCodes.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '12px' }}>
              {activeGiftCodes.map((gc, idx) => (
                <div key={idx} style={{
                  background: '#1a1a1a', border: '1px solid #22c55e', borderRadius: '10px', padding: '16px',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                        <span style={{ color: '#FFD700', fontFamily: 'monospace', fontSize: '16px', fontWeight: 'bold', letterSpacing: '1px' }}>
                          {gc.code}
                        </span>
                        <span style={{
                          background: '#22c55e22', color: '#22c55e', fontSize: '11px', fontWeight: 'bold',
                          padding: '2px 8px', borderRadius: '4px',
                        }}>
                          $40 • Unclaimed
                        </span>
                      </div>
                      <p style={{ color: '#666', fontSize: '11px', margin: 0 }}>
                        Expires {new Date(gc.expires_at).toLocaleDateString()}
                      </p>
                    </div>
                    <button onClick={() => shareCode(gc.code)} style={{
                      padding: '10px 18px', background: copiedCode === gc.code ? '#22c55e' : '#FFD700',
                      color: '#000', border: 'none', borderRadius: '8px',
                      fontSize: '13px', fontWeight: 'bold', cursor: 'pointer',
                      transition: 'all 0.2s', whiteSpace: 'nowrap',
                    }}>
                      {copiedCode === gc.code ? '✅ Copied!' : '🚀 Share Code'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Claimed Gift Codes */}
          {claimedGiftCodes.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {claimedGiftCodes.map((gc, idx) => (
                <div key={idx} style={{
                  background: '#111', border: '1px solid #333', borderRadius: '8px', padding: '12px', opacity: 0.6,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#666', fontFamily: 'monospace', fontSize: '13px' }}>{gc.code}</span>
                    <span style={{ color: '#4CAF50', fontSize: '11px', fontWeight: 'bold' }}>✅ Claimed</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          REDEEM A GIFT CODE
      ═══════════════════════════════════════════════════════════════ */}
      {isProOrElite && (
        <div style={{
          background: '#1a1a1a', border: '1px solid #4CAF50', borderRadius: '12px', padding: '20px',
        }}>
          <h3 style={{ color: '#4CAF50', fontSize: '16px', fontWeight: 'bold', margin: '0 0 8px' }}>
            🎉 Redeem a Gift Code
          </h3>
          <p style={{ color: '#888', fontSize: '13px', margin: '0 0 16px' }}>
            Got a code from a friend? Enter it to add $40 credit to your next billing.
          </p>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text" value={giftCode}
              onChange={e => setGiftCode(e.target.value.toUpperCase())}
              placeholder="Enter code (e.g., GIFT-A1B2C3)"
              style={{
                flex: 1, padding: '12px 16px', background: '#111', border: '1px solid #333',
                borderRadius: '8px', color: '#fff', fontSize: '14px', fontFamily: 'monospace', outline: 'none',
              }}
            />
            <button onClick={handleRedeemGiftCode} disabled={!giftCode || redeemingGift} style={{
              padding: '12px 20px', background: giftCode ? '#4CAF50' : '#333',
              color: giftCode ? '#000' : '#666', border: 'none', borderRadius: '8px',
              fontWeight: 'bold', fontSize: '14px', cursor: giftCode ? 'pointer' : 'not-allowed', whiteSpace: 'nowrap',
            }}>
              {redeemingGift ? '⏳...' : '✅ Redeem'}
            </button>
          </div>
          {giftCodeMessage && (
            <p style={{ fontSize: '13px', color: giftCodeMessage.includes('✅') ? '#4CAF50' : '#ef4444', fontWeight: 'bold', marginTop: '12px' }}>
              {giftCodeMessage}
            </p>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          TRANSACTION HISTORY
      ═══════════════════════════════════════════════════════════════ */}
      {transactions.length > 0 && (
        <div>
          <h3 style={{ color: '#888', fontSize: '14px', fontWeight: 'bold', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '1px' }}>
            📜 Transaction History
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {transactions.map((t, idx) => {
              const isGifted = t.reward_type === 'gift_code';
              const isExpired = t.status === 'expired';
              const isApplied = t.status === 'redeemed' && !isGifted;
              const date = new Date(t.redeemed_at || t.created_at);
              const dateStr = date.toLocaleDateString();

              let icon, label, color, sign;
              if (isExpired) {
                icon = '❌'; label = 'Expired'; color = '#666'; sign = '';
              } else if (isGifted) {
                icon = '🎁'; label = 'Gifted'; color = '#f59e0b'; sign = '-';
              } else if (isApplied) {
                icon = '💰'; label = 'Applied to account'; color = '#4CAF50'; sign = '-';
              } else {
                icon = '💰'; label = 'Redeemed'; color = '#4CAF50'; sign = '-';
              }

              return (
                <div key={idx} style={{
                  background: '#111', border: '1px solid #222', borderRadius: '8px', padding: '12px 16px',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '16px' }}>{icon}</span>
                    <div>
                      <p style={{ color: '#ccc', fontSize: '13px', fontWeight: 'bold', margin: 0 }}>{label}</p>
                      <p style={{ color: '#555', fontSize: '11px', margin: 0 }}>{dateStr}</p>
                    </div>
                  </div>
                  <span style={{ color, fontWeight: 'bold', fontSize: '14px' }}>
                    {sign}${t.amount}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          EMPTY STATE
      ═══════════════════════════════════════════════════════════════ */}
      {totalBalance === 0 && giftCodes.length === 0 && transactions.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <p style={{ fontSize: '32px', margin: '0 0 12px' }}>🎁</p>
          <p style={{ color: '#ccc', margin: '0 0 4px', fontSize: '16px', fontWeight: 'bold' }}>No rewards yet</p>
          <p style={{ color: '#666', margin: '0 0 16px', fontSize: '13px' }}>
            Share your referral code to start earning $40 credits!
          </p>
          {referralCode && (
            <div style={{
              display: 'inline-block', background: '#1a1a1a', border: '1px solid #FFD700',
              borderRadius: '8px', padding: '12px 20px',
            }}>
              <p style={{ color: '#888', fontSize: '11px', margin: '0 0 4px' }}>YOUR REFERRAL CODE</p>
              <p style={{ color: '#FFD700', fontSize: '18px', fontWeight: 'bold', fontFamily: 'monospace', margin: 0 }}>
                {referralCode}
              </p>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
