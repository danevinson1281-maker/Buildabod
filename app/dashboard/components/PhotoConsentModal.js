'use client'

import { useState } from 'react'
import styles from './PhotoConsentModal.module.css'

export default function PhotoConsentModal({ isOpen, currentConsent, onSave, onClose }) {
  const [selectedConsent, setSelectedConsent] = useState(currentConsent || 'private')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSave = async () => {
    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/clients/update-photo-consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoConsent: selectedConsent }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update consent')
      }

      onSave(selectedConsent)
      onClose()
    } catch (err) {
      console.error('Consent update error:', err)
      setError(err.message || 'Failed to update consent')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>Photo Privacy Settings</h2>
          <button
            onClick={onClose}
            className={styles.closeBtn}
            disabled={isSubmitting}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className={styles.content}>
          <p className={styles.description}>
            Control how your progress photos are used. You can change this anytime.
          </p>

          {/* Option 1: Private */}
          <div className={styles.optionContainer}>
            <button
              onClick={() => setSelectedConsent('private')}
              className={`${styles.option} ${selectedConsent === 'private' ? styles.active : ''}`}
            >
              <div className={styles.optionHeader}>
                <input
                  type="radio"
                  name="consent"
                  value="private"
                  checked={selectedConsent === 'private'}
                  onChange={() => setSelectedConsent('private')}
                  className={styles.radio}
                />
                <span className={styles.optionTitle}>🔒 Private Only</span>
              </div>
              <p className={styles.optionDesc}>
                My photos are for Dane's coaching use only. Will NOT be posted publicly or used in marketing.
              </p>
            </button>
          </div>

          {/* Option 2: Public */}
          <div className={styles.optionContainer}>
            <button
              onClick={() => setSelectedConsent('public')}
              className={`${styles.option} ${selectedConsent === 'public' ? styles.active : ''}`}
            >
              <div className={styles.optionHeader}>
                <input
                  type="radio"
                  name="consent"
                  value="public"
                  checked={selectedConsent === 'public'}
                  onChange={() => setSelectedConsent('public')}
                  className={styles.radio}
                />
                <span className={styles.optionTitle}>🌍 Public - Share My Progress</span>
              </div>
              <p className={styles.optionDesc}>
                I allow my before/after photos to be used on BuildABod.co, social media, and marketing materials. I'll be identified by first name + city/state only.
              </p>
            </button>
          </div>

          {/* Info Box */}
          <div className={styles.infoBox}>
            <p className={styles.infoTitle}>💡 You Can Change This Anytime</p>
            <p className={styles.infoText}>
              Uploaded photos won't be shared publicly until you enable "Public" consent. If you change your mind later, you can update this anytime.
            </p>
          </div>

          {error && <p className={styles.error}>{error}</p>}
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className={styles.cancelBtn}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSubmitting || selectedConsent === currentConsent}
            className={styles.saveBtn}
          >
            {isSubmitting ? 'Saving...' : 'Save Preference'}
          </button>
        </div>
      </div>
    </div>
  )
}
