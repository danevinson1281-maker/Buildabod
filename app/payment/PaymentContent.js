'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

const PLAN_DETAILS = {
  kickstart: {
    name: 'Kickstart Plan',
    price: 6700,
    displayPrice: '$67',
    type: 'one-time',
    description: 'One-time custom plan — no ongoing commitment',
    features: [
      'Personalized meal plan based on your stats & goals',
      'Unlimited food swaps',
      'PDF download',
      'Dashboard access',
    ]
  },
    pro: {
    name: 'Pro',
    price: 12700,
    displayPrice: '$127/month',
    type: 'subscription',
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
    type: 'subscription',
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

function PaymentFormContent({ planType, clientId, clientEmail, clientName, intakeData, isUpgrade }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const plan = PLAN_DETAILS[planType] || PLAN_DETAILS['kickstart'];

  const handleCheckout = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!clientId) {
      setError('Payment system not ready. Please refresh and try again.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId,
          planType,
          email: clientEmail,
          isUpgrade, // ✅ NEW: Pass upgrade flag to checkout
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create checkout session');
      }

      const { url } = await response.json();
      if (!url) {
        throw new Error('No checkout URL received from server');
      }

      window.location.href = url;
    } catch (err) {
      setError(err.message || 'Checkout failed. Please try again.');
      setLoading(false);
    }
  };

  const handleChangePlan = () => {
    router.push('/pricing');
  };

  const calculateTotalFoods = () => {
    if (!intakeData?.selected_foods) return 0;
    
    const foods = intakeData.selected_foods;
    
    if (Array.isArray(foods)) {
      return foods.length;
    }
    
    if (typeof foods === 'object') {
      let total = 0;
      Object.values(foods).forEach(category => {
        if (Array.isArray(category)) {
          total += category.length;
        }
      });
      return total;
    }
    
    return 0;
  };

  const totalFoods = calculateTotalFoods();

  if (!plan) {
    return (
      <div className="text-center p-6">
        <p className="text-red-400">Invalid plan selected. Please try again.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleCheckout} className="space-y-6">
      {/* ✅ UPGRADE CONTEXT BANNER — shows when upgrading from Kickstart */}
      {isUpgrade && (
        <div
          className="rounded-lg p-4 border-l-4"
          style={{
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            borderColor: '#22c55e',
          }}
        >
          <p className="text-green-300 font-bold text-sm">
            ✅ Your $50 credit is applied! Complete your upgrade below.
          </p>
        </div>
      )}

      <div className="bg-gray-900/50 border border-yellow-700/30 rounded-lg p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
            <p className="text-sm text-gray-400 mt-1">{plan.description}</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold" style={{ color: '#FFD700' }}>
              {plan.displayPrice}
            </p>
            {isUpgrade && (
              <p className="text-xs text-green-400 font-bold mt-1">
                Save $50 with credit
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2 pt-4 border-t border-yellow-700/20">
          {plan.features.map((feature, idx) => (
            <div key={idx} className="flex gap-2 items-start">
              <span style={{ color: '#FFD700' }} className="text-lg flex-shrink-0 mt-0.5">✓</span>
              <span className={idx === 0 ? 'text-gray-300 font-semibold' : 'text-gray-400 text-sm'}>
                {feature}
              </span>
            </div>
          ))}
        </div>

        {!isUpgrade && (
          <button
            type="button"
            onClick={handleChangePlan}
            className="text-xs mt-4 pt-4 border-t border-yellow-700/20 text-yellow-600 hover:text-yellow-500 transition inline-block font-medium"
          >
            ← Want to choose a different plan?
          </button>
        )}
      </div>

      {/* ✅ UPGRADE: Show which plan they're upgrading to */}
      {isUpgrade && (
        <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-4">
          <p className="text-blue-200 font-bold text-sm mb-2">📈 Upgrading from Kickstart</p>
          <p className="text-blue-100 text-xs">
            You'll get immediate access to {planType === 'pro' ? 'monthly coaching, plan updates, and photo feedback.' : 'weekly coaching, priority support, and all Pro features.'}
          </p>
        </div>
      )}

      <div className="bg-gradient-to-br from-yellow-900/30 to-yellow-900/10 border-2 border-yellow-700/50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <span style={{ color: '#FFD700' }}>✓</span>
          Your Custom Plan Details
        </h3>
        <p className="text-sm text-gray-300 mb-4">
          Based on YOUR body, YOUR goals, and YOUR food preferences:
        </p>
        <div className="space-y-3 text-sm text-gray-300">
          <div className="flex justify-between items-center p-3 bg-black/30 rounded">
            <span className="text-gray-400">Primary Goal:</span>
            <span className="font-medium text-white capitalize">
              {intakeData?.primary_goal?.replace(/-/g, ' ') || 'N/A'}
            </span>
          </div>
          <div className="flex justify-between items-center p-3 bg-black/30 rounded">
            <span className="text-gray-400">Foods Selected:</span>
            <span className="font-medium text-white">
              {totalFoods} foods
            </span>
          </div>
          <div className="flex justify-between items-center p-3 bg-black/30 rounded">
            <span className="text-gray-400">Meals Per Day:</span>
            <span className="font-medium text-white">{intakeData?.meals_per_day || '3'}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-black/30 rounded">
            <span className="text-gray-400">Experience Level:</span>
            <span className="font-medium text-white capitalize">
              {intakeData?.experience_level?.replace(/-/g, ' ') || 'N/A'}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-6">
        <h4 className="text-blue-100 font-semibold mb-4">
          {isUpgrade ? '⏭️ What Happens Next' : '📋 What Happens Next'}
        </h4>
        <div className="space-y-4">
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600/30 flex items-center justify-center border border-blue-500">
              <span className="text-blue-300 font-bold text-sm">1</span>
            </div>
            <div>
              <p className="text-blue-100 font-medium">Payment Confirmed</p>
              <p className="text-xs text-blue-200 mt-1">Confirmation sent to {clientEmail}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600/30 flex items-center justify-center border border-blue-500">
              <span className="text-blue-300 font-bold text-sm">2</span>
            </div>
            <div>
              <p className="text-blue-100 font-medium">
                {isUpgrade ? 'Plan Activated Immediately' : 'Dane Reviews Your Macros'}
              </p>
              <p className="text-xs text-blue-200 mt-1">
                {isUpgrade ? 'Get access to all Pro/Elite features right away' : 'Personal review within 24 hours'}
              </p>
            </div>
          </div>
          {!isUpgrade && (
            <>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600/30 flex items-center justify-center border border-blue-500">
                  <span className="text-blue-300 font-bold text-sm">3</span>
                </div>
                <div>
                  <p className="text-blue-100 font-medium">Meal Plan Generated</p>
                  <p className="text-xs text-blue-200 mt-1">Built with YOUR foods + YOUR approved macros</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-yellow-600/30 flex items-center justify-center border border-yellow-500">
                  <span className="text-yellow-300 font-bold text-sm">4</span>
                </div>
                <div>
                  <p className="text-yellow-100 font-medium">Plan Delivered to Email</p>
                  <p className="text-xs text-yellow-200 mt-1">Professional PDF with full meal plan & macros</p>
                </div>
              </div>
            </>
          )}
          {isUpgrade && (
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-yellow-600/30 flex items-center justify-center border border-yellow-500">
                <span className="text-yellow-300 font-bold text-sm">3</span>
              </div>
              <div>
                <p className="text-yellow-100 font-medium">Referral Code Generated</p>
                <p className="text-xs text-yellow-200 mt-1">Start earning $40 per friend who signs up for a pro or elite tier plan</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {clientEmail && (
        <div className="p-4 bg-gray-900/50 border border-yellow-700/30 rounded-lg">
          <p className="text-sm text-gray-300">
            📧 Confirmation {!isUpgrade && '& your meal plan'} will be sent to:<br />
            <span className="font-medium text-white">{clientEmail}</span>
          </p>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-900/20 border border-red-700/50 rounded-lg text-red-200 text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-4 px-6 font-bold rounded-lg transition text-black text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
        style={{ backgroundColor: '#FFD700' }}
      >
        {loading
          ? 'Redirecting to Secure Checkout...'
          : isUpgrade
          ? `Complete Upgrade - ${plan.displayPrice}`
          : `Complete Payment - ${plan.displayPrice}`}
      </button>

      <div className="space-y-2 text-center text-xs text-gray-400">
        <div className="flex justify-center gap-4">
          <span>🔒 Secure Stripe Payment</span>
        </div>
        <p className="text-yellow-600 font-medium">
          {isUpgrade
            ? 'Your upgrade is just one click away'
            : 'You are 30 seconds away from your custom meal plan'}
        </p>
      </div>
    </form>
  );
}

function PaymentPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const planType = searchParams.get('planType') || 'kickstart';
  const clientIdFromUrl = searchParams.get('clientId');
  const isUpgrade = searchParams.get('isUpgrade') === 'true'; // ✅ NEW: Detect upgrade parameter

  const [clientId, setClientId] = useState(clientIdFromUrl);
  const [intakeData, setIntakeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let id = clientIdFromUrl;
    
    if (!id) {
      const stored = localStorage.getItem('clientId');
      id = stored;
      if (id) setClientId(id);
    }

    if (!id) {
      setError('No intake data found. Please complete the form first.');
      setLoading(false);
      return;
    }

    const fetchIntakeData = async () => {
      try {
        const response = await fetch(`/api/clients/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch intake data');
        }
        const data = await response.json();
        setIntakeData(data);
        setClientId(id);
        localStorage.setItem('clientId', id);
      } catch (err) {
        setError(err.message || 'Failed to load intake data');
      } finally {
        setLoading(false);
      }
    };

    fetchIntakeData();
  }, [clientIdFromUrl]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderBottomColor: '#FFD700' }}></div>
          <p className="text-gray-300 mt-4">Loading your payment details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-red-900/20 border border-red-700/50 rounded-lg p-6 text-center">
          <p className="text-red-200 mb-4">{error}</p>
          <Link
            href="/intake"
            className="inline-block py-2 px-6 rounded-lg transition text-black font-bold"
            style={{ backgroundColor: '#FFD700' }}
          >
            Back to Intake Form
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="text-gray-400 hover:text-yellow-400 text-sm mb-4 inline-block">
            Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-white mb-2">
            {isUpgrade ? 'Complete Your Upgrade' : 'Complete Your Payment'}
          </h1>
          <p className="text-gray-400">
            {isUpgrade
              ? 'Upgrade to Pro or Elite and unlock monthly/weekly coaching, plan updates, and more.'
              : 'Secure your custom meal plan. Dane will personally review your macros.'}
          </p>
        </div>

        <div className="bg-gray-900/50 border border-yellow-700/30 rounded-xl p-6 md:p-8">
          <PaymentFormContent 
            planType={planType} 
            clientId={clientId}
            clientEmail={intakeData?.email}
            clientName={intakeData?.full_name}
            intakeData={intakeData}
            isUpgrade={isUpgrade}
          />
        </div>
      </div>
    </div>
  );
}

export default function PaymentContent() {
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
      <PaymentPageContent />
    </Suspense>
  );
}
