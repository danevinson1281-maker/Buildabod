'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

export default function ReferEarnTab({ clientId, clientName }) {
  const [referralCode, setReferralCode] = useState('')
  const [referralStats, setReferralStats] = useState({
    totalReferrals: 0,
    creditsEarned: 0,
  })
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(true)
  const [referralHistory, setReferralHistory] = useState([])
  const [error, setError] = useState('')

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
  const referralLink = referralCode ? `${baseUrl}/intake?ref=${referralCode}` : ''

  useEffect(() => {
    if (clientId) {
      fetchReferralCode()
      fetchReferralStats()
    }
  }, [clientId])

  const fetchReferralCode = async () => {
    try {
      setLoading(true)
      setError('')

      const res = await fetch(`/api/generate-referral-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId })
      })

      if (!res.ok) {
        const text = await res.text()
        console.error('API error:', text)
        setError('Failed to load referral code. Please refresh.')
        return
      }

      const data = await res.json()
      if (data.referralCode) {
        setReferralCode(data.referralCode)
      }
    } catch (err) {
      console.error('Error fetching referral code:', err)
      setError('Something went wrong. Please refresh.')
    } finally {
      setLoading(false)
    }
  }

  const fetchReferralStats = async () => {
    try {
      const res = await fetch(`/api/get-referral-stats?clientId=${clientId}`)
      if (!res.ok) return

      const data = await res.json()
      setReferralStats({
        totalReferrals: data.totalReferrals || 0,
        creditsEarned: (data.totalReferrals || 0) * 40,
      })

      setReferralHistory(data.history || [])
    } catch (err) {
      console.error('Error fetching referral stats:', err)
    }
  }

  const handleCopy = () => {
    if (!referralLink) return
    
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(referralLink)
        .then(() => {
          setCopied(true)
          setTimeout(() => setCopied(false), 2000)
        })
        .catch(() => {
          fallbackCopy()
        })
    } else {
      fallbackCopy()
    }
  }

  const fallbackCopy = () => {
    const textArea = document.createElement('textarea')
    textArea.value = referralLink
    textArea.style.position = 'fixed'
    textArea.style.left = '-9999px'
    textArea.style.top = '-9999px'
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()
    try {
      document.execCommand('copy')
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Fallback copy failed:', err)
    }
    document.body.removeChild(textArea)
  }

  const handleShare = async () => {
    if (navigator.share && referralLink) {
      try {
        await navigator.share({
          title: 'BuildABod — Custom Meal Plans',
          text: 'I use BuildABod for my custom meal plan — check it out!',
          url: referralLink,
        })
      } catch (err) {
        handleCopy()
      }
    } else {
      handleCopy()
    }
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', color: '#888' }}>
        <div style={{ fontSize: '32px', marginBottom: '12px' }}>💰</div>
        <p>Loading your referral link...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <div style={{ fontSize: '32px', marginBottom: '12px' }}>⚠️</div>
        <p style={{ color: '#ef4444', marginBottom: '16px' }}>{error}</p>
        <button
          onClick={fetchReferralCode}
          style={{
            padding: '10px 20px',
            background: '#FFD700',
            color: '#000',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div style={{ padding: '8px 0' }}>

      {/* HERO SECTION */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: 'linear-gradient(135deg, rgba(255,215,0,0.15) 0%, rgba(255,165,0,0.05) 100%)',
          border: '1px solid rgba(255,215,0,0.3)',
          borderRadius: '16px',
          padding: '28px',
          marginBottom: '24px',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: '48px', marginBottom: '12px' }}>💰</div>
        <h2 style={{ color: '#FFD700', fontSize: '24px', fontWeight: 'bold', margin: '0 0 8px 0' }}>
          Refer & Earn
        </h2>
        <p style={{ color: '#ccc', fontSize: '15px', margin: '0 0 4px 0' }}>
          Share your link. Every time someone signs up —
        </p>
        <p style={{ color: '#FFD700', fontSize: '18px', fontWeight: 'bold', margin: 0 }}>
          you get $40 in credits to use or gift
        </p>
      </motion.div>

      {/* REFERRAL LINK */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{
          background: '#111',
          border: '1px solid #333',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '24px',
        }}
      >
        <p style={{
          color: '#888',
          fontSize: '12px',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          margin: '0 0 12px 0',
        }}>
          Your Referral Code
        </p>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          background: '#1a1a1a',
          border: '1px solid #333',
          borderRadius: '8px',
          padding: '12px 16px',
          marginBottom: '12px',
          wordBreak: 'break-all',
        }}>
          <span style={{ color: '#FFD700', fontSize: '18px', fontWeight: 'bold', flex: 1, fontFamily: 'monospace', letterSpacing: '2px' }}>
            {referralCode || 'Loading...'}
          </span>
        </div>
        <p style={{ color: '#888', fontSize: '12px', margin: '0 0 12px 0', fontStyle: 'italic' }}>
          Share this code with friends, or copy your full referral link below
        </p>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={handleCopy}
            disabled={!referralLink}
            style={{
              flex: 1,
              padding: '12px',
              background: copied ? '#4CAF50' : '#FFD700',
              color: '#000',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 'bold',
              fontSize: '14px',
              cursor: referralLink ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s',
              opacity: referralLink ? 1 : 0.6,
            }}
          >
            {copied ? '✅ Copied!' : '📋 Copy Full Link'}
          </button>
          <button
            onClick={handleShare}
            disabled={!referralLink}
            style={{
              flex: 1,
              padding: '12px',
              background: 'transparent',
              color: '#FFD700',
              border: '1px solid #FFD700',
              borderRadius: '8px',
              fontWeight: 'bold',
              fontSize: '14px',
              cursor: referralLink ? 'pointer' : 'not-allowed',
              opacity: referralLink ? 1 : 0.6,
            }}
          >
            🚀 Share
          </button>
        </div>
      </motion.div>

      {/* STATS */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px',
          marginBottom: '24px',
        }}
      >
        <div style={{
          background: '#111',
          border: '1px solid #333',
          borderRadius: '12px',
          padding: '20px',
          textAlign: 'center',
        }}>
          <p style={{
            color: '#888',
            fontSize: '11px',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            margin: '0 0 8px 0',
          }}>
            Total Referrals
          </p>
          <p style={{ color: '#FFD700', fontSize: '36px', fontWeight: 'bold', margin: 0 }}>
            {referralStats.totalReferrals}
          </p>
        </div>
        <div style={{
          background: '#111',
          border: '1px solid #333',
          borderRadius: '12px',
          padding: '20px',
          textAlign: 'center',
        }}>
          <p style={{
            color: '#888',
            fontSize: '11px',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            margin: '0 0 8px 0',
          }}>
            Credits Earned
          </p>
          <p style={{ color: '#4CAF50', fontSize: '36px', fontWeight: 'bold', margin: 0 }}>
            ${referralStats.creditsEarned}
          </p>
        </div>
      </motion.div>

            {/* HOW IT WORKS — ✅ FIXED COPY */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        style={{
          background: '#111',
          border: '1px solid #333',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '24px',
        }}
      >
        <h3 style={{ color: '#fff', fontSize: '16px', fontWeight: 'bold', margin: '0 0 16px 0' }}>
          How It Works
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[
            { num: '1', text: 'Share your referral code with friends & family' },
            { num: '2', text: 'They sign up using your code and make their first payment' },
            { num: '3', text: 'You automatically get $40 in reward credits' },
            { num: '4', text: 'Apply credits toward your upgrade or next billing cycle — credits expire in 6 months'},
          ].map(step => (
            <div key={step.num} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <span style={{
                background: '#FFD700',
                color: '#000',
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 'bold',
                flexShrink: 0,
              }}>
                {step.num}
              </span>
              <p style={{ color: '#ccc', fontSize: '14px', margin: 0, paddingTop: '3px' }}>
                {step.text}
              </p>
            </div>
          ))}
        </div>
      </motion.div>


      {/* INFO BOX */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        style={{
          background: '#4CAF5011',
          border: '1px solid #4CAF5033',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '24px',
        }}
      >
        <p style={{ color: '#4CAF50', fontSize: '13px', margin: 0, lineHeight: '1.6' }}>
          <strong>💡 Your Rewards:</strong> View all your earned credits in the "My Rewards" tab. You can apply them to your account or share codes with anyone!
        </p>
      </motion.div>

      {/* REFERRAL HISTORY */}
      {referralHistory.length > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          style={{
            background: '#111',
            border: '1px solid #333',
            borderRadius: '12px',
            padding: '20px',
          }}
        >
          <h3 style={{ color: '#fff', fontSize: '16px', fontWeight: 'bold', margin: '0 0 16px 0' }}>
            Referral History
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {referralHistory.map((ref, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px',
                  background: '#1a1a1a',
                  borderRadius: '8px',
                  border: '1px solid #222',
                }}
              >
                <div>
                  <p style={{ color: '#fff', fontSize: '14px', fontWeight: 'bold', margin: '0 0 4px 0' }}>
                    ✅ {ref.referred_name || 'Friend'}
                  </p>
                  <p style={{ color: '#888', fontSize: '12px', margin: 0 }}>
                    {new Date(ref.created_at).toLocaleDateString()}
                  </p>
                </div>
                <span style={{
                  color: '#4CAF50',
                  fontSize: '13px',
                  fontWeight: 'bold',
                  background: 'rgba(76,175,80,0.1)',
                  border: '1px solid rgba(76,175,80,0.3)',
                  borderRadius: '999px',
                  padding: '4px 10px',
                }}>
                  +$40
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          style={{
            background: '#111',
            border: '1px solid #333',
            borderRadius: '12px',
            padding: '32px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>🚀</div>
          <p style={{ color: '#fff', fontWeight: 'bold', margin: '0 0 8px 0' }}>
            No referrals yet
          </p>
          <p style={{ color: '#888', fontSize: '14px', margin: 0 }}>
            Share your code and start earning $40 credits!
          </p>
        </motion.div>
      )}
    </div>
  )
}
