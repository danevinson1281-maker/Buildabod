'use client'

import { useState } from 'react'
import styles from './WaiverModal.module.css'

const WAIVER_TEXT = `BUILDABOD.CO MEAL PLAN AGREEMENT

I acknowledge and agree that:

• This meal plan is a nutrition recommendation designed by Coach Dane Vinson, a certified personal trainer, and is for educational purposes.

• I will consult with my doctor or healthcare provider before starting this plan, especially if I have any medical conditions, take medications, or have dietary restrictions.

• I take full responsibility for following this meal plan and listening to my body throughout my transformation journey.

• Results depend on my individual effort, consistency, metabolism, and dedication — and I'm committed to putting in the work.

PHOTO & YOUR CONTROL (YOU DECIDE)

These are YOUR photos. YOU decide what happens with them.

☐ PRIVATE: My progress photos are for Coach Dane's feedback only. They stay between us. No sharing, no posting, no exceptions.

☐ PUBLIC: I'm proud of my transformation and I give BuildABod.co permission to:
  - Share my before/after photos on the website and social media to inspire others
  - Feature my story as a BuildABod.co success story
  - Tag me by first name only (e.g., "Sarah's Transformation")

I can change this choice anytime. My confidence, my control, my choice.

HEALTH & SAFETY

I understand that:
• Coach Dane is a certified personal trainer, not a doctor or registered dietitian
• Any health concerns should be discussed with my healthcare provider immediately
• I release Coach Dane and BuildABod.co from liability for health outcomes I choose to manage responsibly

I'M READY

By typing my name below, I'm committing to this journey and confirming I've read and understand this agreement.`

export default function WaiverModal({ clientData, onAccept, onCancel }) {
  const [photoConsent, setPhotoConsent] = useState('private') // 'private' or 'public'
  const [signature, setSignature] = useState('')
  const [confirmChecked, setConfirmChecked] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [expandedSections, setExpandedSections] = useState({})

  const toggleSection = (id) => {
    setExpandedSections((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const handleAccept = async () => {
    // Validate
    const newErrors = {}
    const trimmedSig = signature.trim()
    const nameParts = trimmedSig.split(' ').filter(part => part.length > 0)
    
    if (!trimmedSig) {
      newErrors.signature = 'Please sign with your full name'
    } else if (nameParts.length < 2) {
      newErrors.signature = 'Please enter both first and last name'
    }
    if (!photoConsent) {
      newErrors.photoConsent = 'Please select a photo preference'
    }
    if (!confirmChecked) {
      newErrors.confirmChecked = 'Please confirm you agree to the meal plan agreement'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setLoading(true)

    try {
      console.log('📝 Signing waiver...')

      // Call the waiver signing endpoint
      const response = await fetch('/api/sign-waiver', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: clientData.id,
          signedName: trimmedSig,
          photoConsent: photoConsent,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to sign waiver')
      }

console.log('✅ Waiver signed successfully')
onAccept(true)

// Pass back success - the parent component sets waiverSigned = true
onAccept(true)

    } catch (error) {
      console.error('❌ Error signing waiver:', error)
      setErrors({ submit: error.message || 'Failed to sign waiver. Please try again.' })
      setLoading(false)
    }
  }


  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onCancel()}>
      <div className={styles.accordionModal}>
        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>Meal Plan Agreement</h2>
          <p className={styles.subtitle}>Read, choose your photo preference, then sign below</p>
        </div>

        {/* Scrollable Content */}
        <div className={styles.accordionContainer}>
          {/* Photo Consent Section */}
          <div className={styles.photoConsentSection}>
            <div className={styles.photoConsentHeader}>
              <span className={styles.photoIcon}>📸</span>
              <h3 className={styles.photoConsentTitle}>Your Photos, Your Choice</h3>
            </div>

            {/* PRIVATE Option */}
            <div
              className={styles.photoConsentBox}
              style={{
                border: photoConsent === 'private' ? '2px solid #FFD700' : '1px solid #FFD700',
                background: photoConsent === 'private' ? 'rgba(255, 215, 0, 0.05)' : '#0f0f0f',
                cursor: 'pointer',
                marginBottom: '12px',
              }}
              onClick={() => {
                setPhotoConsent('private')
                setErrors({ ...errors, photoConsent: '' })
              }}
            >
              <input
                type="radio"
                className={styles.checkbox}
                checked={photoConsent === 'private'}
                onChange={() => setPhotoConsent('private')}
              />
              <label className={styles.consentText}>
                <strong>🔒 PRIVATE</strong> — My photos are for Coach Dane's feedback only. No sharing, no posting.
              </label>
            </div>

            {/* PUBLIC Option */}
            <div
              className={styles.photoConsentBox}
              style={{
                border: photoConsent === 'public' ? '2px solid #FFD700' : '1px solid #FFD700',
                background: photoConsent === 'public' ? 'rgba(255, 215, 0, 0.05)' : '#0f0f0f',
                cursor: 'pointer',
              }}
              onClick={() => {
                setPhotoConsent('public')
                setErrors({ ...errors, photoConsent: '' })
              }}
            >
              <input
                type="radio"
                className={styles.checkbox}
                checked={photoConsent === 'public'}
                onChange={() => setPhotoConsent('public')}
              />
              <label className={styles.consentText}>
                <strong>🌟 PUBLIC</strong> — I'm proud of my transformation! Share my before/afters to inspire others.
              </label>
            </div>

            {errors.photoConsent && <p className={styles.error}>{errors.photoConsent}</p>}
         {errors.confirmChecked && <p className={styles.error}>{errors.confirmChecked}</p>}
          </div>

          {/* Waiver Text as Accordion */}
          <div className={styles.accordionSections}>
            <div className={styles.accordionItem}>
              <button
                className={styles.accordionButton}
                onClick={() => toggleSection('waiver-full')}
              >
                <span className={styles.accordionTitle}>Full Agreement Text</span>
                <span
                  className={styles.accordionIcon}
                  style={{
                    transform: expandedSections['waiver-full'] ? 'rotate(180deg)' : 'rotate(0deg)',
                  }}
                >
                  ▼
                </span>
              </button>
              {expandedSections['waiver-full'] && (
                <div className={styles.accordionContent}>
                  {WAIVER_TEXT.split('\n').map((line, idx) => (
                    <p key={idx}>{line || '\u00A0'}</p>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Signature Section */}
          <div className={styles.signatureSection}>
            <label htmlFor="signature" className={styles.label}>
              Sign With Your Full Name
            </label>
            <input
              id="signature"
              type="text"
              placeholder="First and Last Name"
              className={styles.input}
              value={signature}
              onChange={(e) => {
                setSignature(e.target.value)
                setErrors({ ...errors, signature: '' })
              }}
              disabled={loading}
            />
            {errors.signature && <p className={styles.error}>{errors.signature}</p>}

            {/* Confirmation Checkbox */}
            <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#0f0f0f', borderRadius: '6px', border: '1px solid #333', cursor: 'pointer' }} onClick={() => setConfirmChecked(!confirmChecked)}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: '#ccc' }}>
                <input
                  type="checkbox"
                  id="confirm-checkbox"
                  checked={confirmChecked}
                  onChange={() => setConfirmChecked(!confirmChecked)}
                  style={{ cursor: 'pointer' }}
                />
                <span>I confirm I've read and agree to this meal plan agreement</span>
              </label>
            </div>




            <p className={styles.note} style={{ marginTop: '12px', color: '#666', fontSize: '12px' }}>
              By signing above, you're committing to your transformation journey.
            </p>
          </div>



          {errors.submit && <p className={styles.error}>{errors.submit}</p>}
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <button className={styles.acceptBtn} onClick={handleAccept} disabled={loading}>
            {loading && <span className={styles.spinner}></span>}
            {loading ? 'Signing...' : 'I Accept & Continue'}
          </button>
          <button
            className={styles.acceptBtn}
            style={{ background: '#555', color: '#fff' }}
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
