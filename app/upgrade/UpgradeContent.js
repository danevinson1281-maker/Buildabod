'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

const UPGRADE_PLANS = {
  pro: {
    name: 'Pro',
    price: 12700,
    displayPrice: '$127/month',
    creditApplied: 6700,
    finalPrice: 6000,
    finalDisplay: '$60/month',

    description: 'Monthly subscription with ongoing support',
    features: [
      'Everything in Kickstart, plus:',
      'Monthly meal plan regeneration',
      'Monthly macro optimization & review',
      'Monthly check-in via email',
      'Monthly photo review & feedback',
      'Priority email support (24hr response)',
    ]
  },
    elite: {
    name: 'Elite',
    price: 19700,
    displayPrice: '$197/month',
    creditApplied: 6700,
    finalPrice: 13000,
    finalDisplay: '$130/month',
    description: 'Weekly support with priority access',
    features: [
      'Everything in Pro, plus:',
      'Weekly meal plan regeneration',
      'Weekly macro optimization & review',
      'Weekly check-in via email',
      'Weekly photo review & feedback',
      'Direct messaging with Dane',
      'Priority support (12hr response)',
    ]
  },
};

function UpgradePageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const clientIdFromUrl = searchParams.get('clientId');

  const [clientId, setClientId] = useState(clientIdFromUrl);
  const [clientData, setClientData] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState('pro');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [upgrading, setUpgrading] = useState(false);
  const [daysRemaining, setDaysRemaining] = useState(null);

  // Fetch client data
  useEffect(() => {
    const fetchClient = async () => {
      try {
        let id = clientIdFromUrl;
        if (!id) {
          id = localStorage.getItem('clientId');
        }

        if (!id) {
          setError('No client ID found. Please contact support.');
          setLoading(false);
          return;
        }

        setClientId(id);
        const response = await fetch(`/api/clients/${id}`);
        if (!response.ok) throw new Error('Failed to fetch client data');

        const data = await response.json();
        setClientData(data);

        // Calculate days remaining
        if (data.kickstart_upgrade_expires) {
          const deadline = new Date(data.kickstart_upgrade_expires);
          const now = new Date();
          const days = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
          setDaysRemaining(Math.max(0, days));
        }

        setLoading(false);
      } catch (err) {
        setError(err.message || 'Failed to load client data');
        setLoading(false);
      }
    };

    fetchClient();
  }, [clientIdFromUrl]);

  const handleUpgrade = async () => {
    setUpgrading(true);
    setError('');

    try {
      const response = await fetch('/api/clients/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId,
          newPlan: selectedPlan,
          email: clientData?.email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.expired) {
          setError('Your 7-day upgrade window has expired. You can still upgrade at full price.');
          // Optionally offer full-price upgrade
        } else {
          throw new Error(data.error || 'Upgrade failed');
        }
        setUpgrading(false);
        return;
      }

      console.log('✅ Upgrade approved:', data);

      // Redirect to checkout with upgrade info
      const plan = UPGRADE_PLANS[selectedPlan];
      router.push(
        `/payment?clientId=${clientId}&planType=${selectedPlan}&isUpgrade=true&discount=5000`
      );
    } catch (err) {
      setError(err.message || 'Upgrade failed');
      setUpgrading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderBottomColor: '#FFD700' }}></div>
          <p className="text-gray-300 mt-4">Loading upgrade options...</p>
        </div>
      </div>
    );
  }

  if (error && error.includes('No client ID')) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-red-900/20 border border-red-700/50 rounded-lg p-6 text-center">
          <p className="text-red-200 mb-4">{error}</p>
          <Link
            href="/dashboard"
            className="inline-block py-2 px-6 rounded-lg transition text-black font-bold"
            style={{ backgroundColor: '#FFD700' }}
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (!clientData || clientData.plan_type !== 'kickstart') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-6 text-center">
          <p className="text-yellow-200 mb-4">This upgrade page is only for Kickstart clients.</p>
          <Link
            href="/dashboard"
            className="inline-block py-2 px-6 rounded-lg transition text-black font-bold"
            style={{ backgroundColor: '#FFD700' }}
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const plan = UPGRADE_PLANS[selectedPlan];

  return (
    <div className="min-h-screen bg-black py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Upgrade to <span style={{ color: '#FFD700' }}>Pro</span> or <span style={{ color: '#FFD700' }}>Elite</span>
          </h1>
          <p className="text-gray-400 text-lg mb-6">
            Get personalized support, monthly/weekly updates, and unlock your full potential.
          </p>

          {/* Days Remaining */}
          {daysRemaining !== null && daysRemaining > 0 && (
            <div className="bg-green-900/30 border border-green-700/50 rounded-lg p-4 inline-block mb-8">
              <p className="text-green-300 font-semibold">
                ⏰ Limited Time: <span className="text-xl">{daysRemaining} days remaining</span>
              </p>
                            <p className="text-green-400 text-sm mt-1">
                Get $67 credit toward your first month
              </p>

            </div>
          )}

          {daysRemaining === 0 && (
            <div className="bg-yellow-900/30 border border-yellow-700/50 rounded-lg p-4 inline-block mb-8">
              <p className="text-yellow-300 font-semibold">
                ⏰ Your upgrade window expires today
              </p>
                            <p className="text-yellow-400 text-sm mt-1">
                Upgrade now to keep your $67 credit
              </p>
            </div>
          )}
        </div>

        {/* Plan Selector */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {['pro', 'elite'].map((planKey) => {
            const p = UPGRADE_PLANS[planKey];
            const isSelected = selectedPlan === planKey;

            return (
              <button
                key={planKey}
                onClick={() => setSelectedPlan(planKey)}
                className={`p-8 rounded-xl border-2 transition-all text-left ${
                  isSelected
                    ? 'border-yellow-500 bg-yellow-500/10'
                    : 'border-gray-700 bg-gray-900/50 hover:border-yellow-500/50'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-white">{p.name}</h3>
                    <p className="text-gray-400 text-sm mt-1">{p.description}</p>
                  </div>
                  {isSelected && (
                    <div className="bg-yellow-500 text-black rounded-full w-6 h-6 flex items-center justify-center">
                      ✓
                    </div>
                  )}
                </div>

                {/* Price */}
                <div className="mb-6 p-4 bg-black/50 rounded-lg">
                  <p className="text-gray-400 text-xs mb-2">Regular Price</p>
                  <p className="text-gray-400 line-through text-sm mb-3">{p.displayPrice}</p>
                  
                  <p className="text-gray-400 text-xs mb-2">With $67 Credit</p>
                  <p className="text-3xl font-bold" style={{ color: '#FFD700' }}>
                    {p.finalDisplay}
                  </p>
                                   <p className="text-green-400 text-xs mt-2">
                    Save $67 on your first month
                  </p>
                </div>

                {/* Features */}
                <div className="space-y-2">
                  {p.features.map((feature, idx) => (
                    <div key={idx} className="flex gap-2 items-start">
                      <span style={{ color: '#FFD700' }} className="flex-shrink-0 mt-0.5">✓</span>
                      <span className={idx === 0 ? 'text-gray-300 font-semibold text-sm' : 'text-gray-400 text-xs'}>
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </button>
            );
          })}
        </div>

        {/* Summary Card */}
        <div className="bg-gray-900/50 border border-yellow-700/30 rounded-xl p-8 mb-8">
          <h3 className="text-xl font-bold text-white mb-6">Upgrade Summary</h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-black/30 rounded">
              <span className="text-gray-400">Current Plan</span>
              <span className="text-white font-medium">Kickstart (One-time)</span>
            </div>

            <div className="flex justify-between items-center p-3 bg-black/30 rounded">
              <span className="text-gray-400">Upgrade to</span>
              <span className="text-white font-medium capitalize">{selectedPlan}</span>
            </div>

            <div className="flex justify-between items-center p-3 bg-green-900/30 rounded border border-green-700/50">
              <span className="text-green-300">Your $67 Credit</span>
              <span className="text-green-300 font-bold">-$67.00</span>
            </div>

            <div className="flex justify-between items-center p-4 bg-yellow-500/10 rounded-lg border border-yellow-700/30">
              <span className="text-white font-semibold">First Month Total</span>
              <span className="text-2xl font-bold" style={{ color: '#FFD700' }}>
                {plan.finalDisplay}
              </span>
            </div>
          </div>

          {error && (
            <div className="mt-6 p-4 bg-red-900/20 border border-red-700/50 rounded-lg">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          <button
            onClick={handleUpgrade}
            disabled={upgrading}
            className="w-full mt-6 py-4 px-6 font-bold rounded-lg transition text-black text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: '#FFD700' }}
          >
            {upgrading ? 'Processing...' : `Upgrade to ${plan.name} → Checkout`}
          </button>

          <p className="text-center text-gray-500 text-xs mt-4">
            🔒 Secure payment • Billing starts next month
          </p>
        </div>

        {/* Info */}
        <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-6">
          <h4 className="text-blue-100 font-semibold mb-3">What Happens Next</h4>
          <ul className="space-y-2 text-blue-200 text-sm">
            <li>✓ You complete payment below</li>
            <li>✓ Your new plan starts immediately</li>
            <li>✓ Your meal plan is regenerated with new macros</li>
            <li>✓ You unlock weekly/monthly check-ins and support</li>
            <li>✓ You get a referral code to share (earn $40 per referral)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function UpgradeContent() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderBottomColor: '#FFD700' }}></div>
            <p className="text-gray-300 mt-4">Loading...</p>
          </div>
        </div>
      }
    >
      <UpgradePageContent />
    </Suspense>
  );
}
