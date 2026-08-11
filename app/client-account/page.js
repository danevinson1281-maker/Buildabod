'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ClientAccountPage() {
  const router = useRouter()
  const [client, setClient] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [payments, setPayments] = useState([])
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    current_weight: '',
    goal_weight: '',
  })
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [canceling, setCanceling] = useState(false)

  useEffect(() => {
    const fetchAccountData = async () => {
      try {
        const clientId = localStorage.getItem('clientId')
        const authToken = localStorage.getItem('authToken')

        if (!clientId || !authToken) {
          router.push('/client-login')
          return
        }

        // Fetch client data
        const clientResponse = await fetch('/api/get-client-meal-plan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ clientId }),
        })

        if (!clientResponse.ok) {
          throw new Error('Failed to fetch account data')
        }

        const clientData = await clientResponse.json()
        setClient(clientData.client)
        setFormData({
          current_weight: clientData.client.current_weight || '',
          goal_weight: clientData.client.goal_weight || '',
        })

        // Fetch payment history
        const paymentsResponse = await fetch('/api/get-client-payments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ clientId }),
        })

        if (paymentsResponse.ok) {
          const paymentsData = await paymentsResponse.json()
          setPayments(paymentsData.payments || [])
        }
      } catch (err) {
        console.error('Error fetching account data:', err)
        setError('Failed to load account data')
      } finally {
        setLoading(false)
      }
    }

    fetchAccountData()
  }, [router])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleUpdateInfo = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    try {
      const clientId = localStorage.getItem('clientId')

      const response = await fetch('/api/update-client-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId,
          current_weight: parseFloat(formData.current_weight),
          goal_weight: parseFloat(formData.goal_weight),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to update information')
        return
      }

      setClient(data.client)
      setSuccess('Your information has been updated successfully!')
      setEditing(false)
    } catch (err) {
      console.error('Error updating client info:', err)
      setError('Failed to update information')
    }
  }

  const handleCancelSubscription = async () => {
    setCanceling(true)
    setError('')
    setSuccess('')

    try {
      const clientId = localStorage.getItem('clientId')

      const response = await fetch('/api/cancel-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to cancel subscription')
        setCanceling(false)
        return
      }

      setSuccess('Your subscription has been canceled. You can reactivate it anytime.')
      setClient(data.client)
      setShowCancelConfirm(false)

      // Redirect after 2 seconds
      setTimeout(() => {
        router.push('/client-dashboard')
      }, 2000)
    } catch (err) {
      console.error('Error canceling subscription:', err)
      setError('Failed to cancel subscription')
      setCanceling(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500 mb-4"></div>
          <p className="text-gray-400">Loading your account...</p>
        </div>
      </div>
    )
  }

  if (!client) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4" style={{ color: '#FFD700' }}>Access Denied</h1>
          <p className="text-gray-400 mb-6">Please log in to access your account</p>
          <Link href="/client-login">
            <button className="px-6 py-2 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-600 transition">
              Go to Login
            </button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-black text-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <Link href="/client-dashboard" className="text-gray-400 hover:text-yellow-500 transition mb-4 inline-block">
            ← Back to Meal Plan
          </Link>
          <h1 className="text-4xl font-bold mb-2" style={{ color: '#FFD700' }}>
            Account Settings
          </h1>
          <p className="text-gray-400">Manage your profile and subscription</p>
        </div>

        {/* Error & Success Messages */}
        {error && (
          <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 mb-6 text-red-400">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-900/20 border border-green-800 rounded-lg p-4 mb-6 text-green-400">
            {success}
          </div>
        )}

        {/* Cancel Confirmation Modal */}
        {showCancelConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 max-w-sm">
              <h3 className="text-xl font-bold mb-4 text-red-400">Cancel Subscription?</h3>
              <p className="text-gray-400 mb-2">
                Are you sure you want to cancel your {client.subscription_tier?.toUpperCase()} subscription?
              </p>
              <p className="text-gray-500 text-sm mb-6">
                You'll lose access to monthly/weekly check-ins, but your meal plan will remain available until {new Date(client.subscription_next_billing_at).toLocaleDateString()}.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCancelConfirm(false)}
                  disabled={canceling}
                  className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white hover:bg-gray-700 transition disabled:opacity-50"
                >
                  Keep Subscription
                </button>
                <button
                  onClick={handleCancelSubscription}
                  disabled={canceling}
                  className="flex-1 px-4 py-2 bg-red-600 rounded-lg text-white hover:bg-red-700 transition disabled:opacity-50"
                >
                  {canceling ? 'Canceling...' : 'Cancel Now'}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-8">
          {/* Personal Information */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold" style={{ color: '#FFD700' }}>
                  Personal Information
                </h2>
                <p className="text-gray-400 text-sm mt-1">Update your profile details</p>
              </div>
              {!editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-semibold"
                >
                  Edit
                </button>
              )}
            </div>

            {!editing ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 md:gap-6">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Name</p>
                    <p className="text-white font-semibold text-lg">{client.full_name}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Email</p>
                    <p className="text-white font-semibold text-lg">{client.email}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Current Weight</p>
                    <p className="text-white font-semibold text-lg">{client.current_weight} lbs</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Goal Weight</p>
                    <p className="text-white font-semibold text-lg">{client.goal_weight} lbs</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Age</p>
                    <p className="text-white font-semibold text-lg">{client.age || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Goal</p>
                    <p className="text-white font-semibold text-lg">{client.primary_goal}</p>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleUpdateInfo} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Current Weight (lbs)</label>
                    <input
                      type="number"
                      name="current_weight"
                      value={formData.current_weight}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500"
                      placeholder="Enter current weight"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Goal Weight (lbs)</label>
                    <input
                      type="number"
                      name="goal_weight"
                      value={formData.goal_weight}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500"
                      placeholder="Enter goal weight"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white hover:bg-gray-700 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-semibold"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Subscription Status */}
          {client.subscription_status && client.subscription_status !== 'none' && (
            <div className={`border rounded-xl p-8 ${
              client.subscription_status === 'active'
                ? 'bg-blue-900/20 border-blue-800'
                : 'bg-yellow-900/20 border-yellow-800'
            }`}>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className={`text-2xl font-bold mb-1 ${
                    client.subscription_status === 'active' ? 'text-blue-400' : 'text-yellow-400'
                  }`}>
                    {client.subscription_tier?.toUpperCase()} Subscription
                  </h2>
                  <p className={`text-sm ${
                    client.subscription_status === 'active' ? 'text-blue-300' : 'text-yellow-300'
                  }`}>
                    Status: <span className="font-semibold capitalize">{client.subscription_status}</span>
                  </p>
                </div>
                {client.subscription_status === 'active' && (
                  <button
                    onClick={() => setShowCancelConfirm(true)}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition font-semibold"
                  >
                    Cancel Subscription
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 md:gap-6">
                {client.subscription_started_at && (
                  <div>
                    <p className={`text-sm mb-1 ${
                      client.subscription_status === 'active' ? 'text-blue-300' : 'text-yellow-300'
                    }`}>
                      Started
                    </p>
                    <p className="text-white font-semibold">
                      {new Date(client.subscription_started_at).toLocaleDateString()}
                    </p>
                  </div>
                )}

                {client.subscription_next_billing_at && (
                  <div>
                    <p className={`text-sm mb-1 ${
                      client.subscription_status === 'active' ? 'text-blue-300' : 'text-yellow-300'
                    }`}>
                      Next Billing Date
                    </p>
                    <p className="text-white font-semibold">
                      {new Date(client.subscription_next_billing_at).toLocaleDateString()}
                    </p>
                  </div>
                )}

                {client.subscription_canceled_at && (
                  <div>
                    <p className={`text-sm mb-1 ${
                      client.subscription_status === 'active' ? 'text-blue-300' : 'text-yellow-300'
                    }`}>
                      Canceled
                    </p>
                    <p className="text-white font-semibold">
                      {new Date(client.subscription_canceled_at).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>

              {client.subscription_status !== 'active' && (
                <div className="mt-6 p-4 bg-black/40 border border-gray-700 rounded-lg">
                  <p className="text-gray-400 text-sm">
                    Your subscription is currently {client.subscription_status}. If you'd like to reactivate it, please contact support.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Billing History */}
          {payments && payments.length > 0 && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-8">
              <h2 className="text-2xl font-bold mb-6" style={{ color: '#FFD700' }}>
                Billing History
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left py-3 px-4 text-gray-400 text-sm">Date</th>
                      <th className="text-left py-3 px-4 text-gray-400 text-sm">Description</th>
                      <th className="text-left py-3 px-4 text-gray-400 text-sm">Amount</th>
                      <th className="text-left py-3 px-4 text-gray-400 text-sm">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((payment, idx) => (
                      <tr key={idx} className="border-b border-gray-800 hover:bg-gray-800/50 transition">
                        <td className="py-4 px-4 text-white">
                          {new Date(payment.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-4 text-gray-300">
                          {payment.plan_type?.toUpperCase() || 'Payment'} Plan
                          {payment.billing_cycle_start && ` (${new Date(payment.billing_cycle_start).toLocaleDateString()})`}
                        </td>
                        <td className="py-4 px-4 text-white font-semibold">
                          ${(payment.amount).toFixed(2)}
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            payment.status === 'succeeded'
                              ? 'bg-green-900/30 text-green-400'
                              : payment.status === 'pending'
                              ? 'bg-yellow-900/30 text-yellow-400'
                              : 'bg-red-900/30 text-red-400'
                          }`}>
                            {payment.status?.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Support Section */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-8">
            <h2 className="text-2xl font-bold mb-4" style={{ color: '#FFD700' }}>
              Need Help?
            </h2>
            <p className="text-gray-400 mb-6">
              Have questions about your account or subscription? Reach out to Dane directly.
            </p>
            <div className="space-y-2">
              <p className="text-gray-300">
                📧 <a href="mailto:dane@buildabod.co" className="text-yellow-500 hover:underline">
                  dane@buildabod.co
                </a>
              </p>
              <p className="text-gray-300">
                🌐 <a href="https://buildabod.co" target="_blank" rel="noopener noreferrer" className="text-yellow-500 hover:underline">
                  buildabod.co
                </a>
              </p>
            </div>
          </div>

          {/* Footer Navigation */}
          <div className="flex gap-4">
            <Link href="/client-dashboard" className="flex-1">
              <button className="w-full px-6 py-3 bg-gray-900 border border-gray-800 text-white rounded-lg hover:border-gray-700 transition font-semibold">
                Back to Meal Plan
              </button>
            </Link>
            <button
              onClick={() => {
                localStorage.removeItem('clientId')
                localStorage.removeItem('authToken')
                router.push('/client-login')
              }}
              className="flex-1 px-6 py-3 bg-gray-900 border border-gray-800 text-white rounded-lg hover:border-gray-700 transition font-semibold"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
