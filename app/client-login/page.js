'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function ClientLoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    try {
      const response = await fetch('/api/send-magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to send login link')
        setLoading(false)
        return
      }

      setMessage('success')
      setEmail('')
    } catch (err) {
      setError('Error sending login link. Please try again.')
      console.error(err)
    }

    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-black text-white py-12 px-4">
      <div className="max-w-md mx-auto">

        <div className="text-center mb-10">
          <Link href="/">
            <p className="text-gray-500 text-sm mb-4 hover:text-yellow-400 cursor-pointer">
              Back to Home
            </p>
          </Link>
          <h1 className="text-4xl font-bold mb-2" style={{ color: '#FFD700' }}>BuildABod</h1>
          <p className="text-gray-400 text-lg">Access your custom meal plan</p>
        </div>

        <div className="bg-gray-900 rounded-xl p-8 border border-gray-800">

          {message === 'success' ? (
            <div className="text-center py-4">
              <div className="text-6xl mb-4">📧</div>
              <h2 className="text-2xl font-bold mb-3" style={{ color: '#FFD700' }}>Check Your Email!</h2>
              <p className="text-gray-300 mb-2">
                We sent a login link to your email address.
              </p>
              <p className="text-gray-400 text-sm mb-6">
                Click the link in the email to access your meal plan. The link is valid for <strong className="text-white">7 days</strong>.
              </p>
              <div className="bg-gray-800 rounded-lg p-4 mb-6 text-left">
                <p className="text-xs text-gray-400 mb-2">
                  <strong style={{ color: '#FFD700' }}>Did not get the email?</strong>
                </p>
                <ul className="text-xs text-gray-500 space-y-1">
                  <li>Check your spam or junk folder</li>
                  <li>Make sure you used the email you signed up with</li>
                  <li>Wait 1-2 minutes and refresh</li>
                </ul>
              </div>
              <button
                onClick={() => setMessage('')}
                className="text-yellow-400 text-sm underline hover:text-yellow-300"
              >
                Try a different email
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold mb-2" style={{ color: '#FFD700' }}>Login to Your Plan</h2>
              <p className="text-gray-400 text-sm mb-6">
                Enter your email and we will send you a secure login link — no password needed.
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="you@example.com"
                    className="w-full bg-black border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-yellow-400 transition"
                    disabled={loading}
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Use the email you signed up with
                  </p>
                </div>

                {error && (
                  <div className="p-4 rounded-lg bg-red-900/20 border border-red-800 text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full text-black font-bold py-3 px-6 rounded-lg text-lg transition duration-300 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: '#FFD700' }}
                >
                  {loading ? 'Sending...' : 'Send My Login Link'}
                </button>
              </form>

              <div className="mt-8 pt-6 border-t border-gray-800">
                <p className="text-gray-500 text-xs text-center mb-3 font-semibold uppercase tracking-wider">
                  How it works
                </p>
                <ol className="text-gray-400 text-sm space-y-2">
                  <li className="flex items-start gap-2">
                    <span style={{ color: '#FFD700' }} className="font-bold flex-shrink-0">1.</span>
                    Enter your email above
                  </li>
                  <li className="flex items-start gap-2">
                    <span style={{ color: '#FFD700' }} className="font-bold flex-shrink-0">2.</span>
                    Check your inbox for the login link
                  </li>
                  <li className="flex items-start gap-2">
                    <span style={{ color: '#FFD700' }} className="font-bold flex-shrink-0">3.</span>
                    Click the link to access your meal plan
                  </li>
                  <li className="flex items-start gap-2">
                    <span style={{ color: '#FFD700' }} className="font-bold flex-shrink-0">4.</span>
                    Download your PDF anytime
                  </li>
                </ol>
              </div>
            </>
          )}
        </div>

        <p className="text-center text-gray-500 text-sm mt-8">
          Do not have a plan yet?{' '}
          <Link href="/pricing">
            <span className="text-yellow-400 hover:underline cursor-pointer">Get started here</span>
          </Link>
        </p>

        <div className="text-center text-gray-600 text-xs mt-8">
          <p>2026 BuildABod by Dane Vinson</p>
        </div>
      </div>
    </main>
  )
}
