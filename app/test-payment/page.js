'use client';

import { useState } from 'react';

export default function TestPaymentPage() {
  const [planType, setPlanType] = useState('pro');
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    const clientId = 'e1ec9d0a-7b1b-4a9d-99e7-fb453d9b347a';
    const email = 'vegeta@example.com';

    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId,
          planType,
          email,
        }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error('No checkout URL:', data);
        alert('Failed to create checkout session');
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <h1 className="text-2xl font-bold text-white mb-2">Test Second Payment</h1>
        <p className="text-gray-400 mb-6">Make a second payment with the same client</p>

        <div className="bg-gray-900/50 border border-yellow-700/30 rounded-lg p-6 space-y-4">
          <div>
            <label className="block text-white mb-2 font-medium">Plan Type</label>
            <select
              value={planType}
              onChange={(e) => setPlanType(e.target.value)}
              disabled={loading}
              className="w-full px-4 py-2 bg-gray-800 border border-yellow-700/30 rounded text-white focus:border-yellow-500 disabled:opacity-50"
            >
              <option value="kickstart">Kickstart ($67)</option>
              <option value="pro">Pro ($127)</option>
              <option value="elite">Elite ($197)</option>
            </select>
          </div>

          <button
            onClick={handlePayment}
            disabled={loading}
            className="w-full py-3 bg-yellow-500 hover:bg-yellow-600 disabled:bg-yellow-500/50 text-black font-bold rounded-lg transition"
          >
            {loading ? 'Loading...' : 'Proceed to Checkout'}
          </button>

          <p className="text-gray-500 text-xs text-center">
            Testing payment for existing client
          </p>
        </div>
      </div>
    </div>
  );
}
