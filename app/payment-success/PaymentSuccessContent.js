'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import WaiverModal from '@/app/dashboard/components/WaiverModal'
import WaiverSuccessScreen from '../dashboard/components/WaiverSuccessScreen'

export default function PaymentSuccessContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const planType = searchParams.get('plan_type')

  const [verified, setVerified] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [clientName, setClientName] = useState('')
  const [clientId, setClientId] = useState('')
  const [clientData, setClientData] = useState(null)
  const [showWaiver, setShowWaiver] = useState(false)
  const [waiverSigned, setWaiverSigned] = useState(false)

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId) {
        setError('No session ID found')
        setLoading(false)
        return
      }

      try {
        const response = await fetch('/api/verify-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId }),
        })

        const data = await response.json()

        if (!response.ok) {
          setError(data.error || 'Payment verification failed')
          setLoading(false)
          return
        }

        setVerified(true)
        setClientName(data.clientName || '')
        setClientId(data.clientId || '')

        console.log('📥 Fetching full client data for:', data.clientId)
        const clientResponse = await fetch(`/api/clients/${data.clientId}`)
        const fullClientData = await clientResponse.json()

        if (clientResponse.ok) {
          console.log('✅ Full client data loaded:', fullClientData)
          setClientData({
            id: data.clientId,
            full_name: data.clientName,
            email: fullClientData.email,
            photo_consent: fullClientData.photo_consent || 'not-set',
          })
        } else {
          console.error('⚠️ Could not fetch full client data')
          setClientData({
            id: data.clientId,
            full_name: data.clientName,
            photo_consent: 'not-set',
          })
        }

        setShowWaiver(true)
      } catch (err) {
        setError('Error verifying payment')
        console.error(err)
      }

      setLoading(false)
    }

    verifyPayment()
  }, [sessionId])

  const handleWaiverAccepted = (success) => {
    if (success) {
      setWaiverSigned(true)
    }
    setShowWaiver(false)
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div
            className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 mx-auto mb-4"
            style={{ borderColor: '#FFD700' }}
          ></div>
          <p className="text-gray-400">Verifying payment...</p>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen bg-black text-white py-12 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4" style={{ color: '#FFD700' }}>
            Payment Error
          </h1>
          <p className="text-gray-400 mb-6">{error}</p>
          <Link href="/">
            <button
              className="text-black font-bold py-3 px-8 rounded-full text-lg transition duration-300 hover:opacity-90"
              style={{ backgroundColor: '#FFD700' }}
            >
              Go Home
            </button>
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-black text-white py-16 px-4">
      {showWaiver && clientData && (
        <WaiverModal
          clientData={clientData}
          onAccept={handleWaiverAccepted}
          onCancel={() => setShowWaiver(false)}
        />
      )}

      {waiverSigned && (
        <WaiverSuccessScreen clientName={clientName} />
      )}
    </main>
  )
}
