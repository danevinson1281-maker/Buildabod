'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get('session_id');
  const planType = searchParams.get('plan_type');

  const [verifying, setVerifying] = useState(true);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState('');
  const [clientName, setClientName] = useState('');

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const response = await fetch('/api/verify-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setVerified(true);
          setClientName(data.clientName || 'there');
        } else {
          setError(data.error || 'Payment verification failed');
        }
      } catch (err) {
        setError('Error verifying payment');
        console.error(err);
      } finally {
        setVerifying(false);
      }
    };

    if (sessionId) {
      verifyPayment();
    }
  }, [sessionId]);

  const planTierInfo = {
    basic: {
      name: 'Basic',
      color: '#FFD700',
      features: [
        'Personalized meal plan (custom-generated once)',
        'Unlimited food swaps',
        'PDF download',
        'Dashboard access',
      ],
    },
    pro: {
      name: 'Pro',
      color: '#FFD700',
      features: [
        'Everything in Basic',
        'Monthly meal plan regeneration',
        'Monthly macro optimization & review',
        'Monthly check-in via email',
        'Monthly photo review & feedback',
        'Priority email support (24hr response)',
      ],
    },
    elite: {
      name: 'Elite',
      color: '#FFD700',
      features: [
        'Everything in Pro',
        'Weekly meal plan regeneration',
        'Weekly macro optimization & review',
        'Weekly check-in via email',
        'Weekly photo review & feedback',
        'Direct messaging with Dane',
        'Priority support (12hr response)',
      ],
    },
  };

  const tierInfo = planTierInfo[planType?.toLowerCase()] || planTierInfo.basic;

  if (verifying) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center px-4">
        <div className="text-center">
          <div
            className="animate-spin rounded-full h-16 w-16 border-4 border-t-4 mx-auto mb-6"
            style={{ borderColor: '#333', borderTopColor: '#FFD700' }}
          ></div>
          <h1 className="text-2xl font-bold mb-2">Verifying Payment...</h1>
          <p className="text-gray-400">Setting up your account and meal plan</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-black text-white py-12 px-4">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-3xl font-bold mb-4" style={{ color: '#FFD700' }}>
            Payment Issue
          </h1>
          <p className="text-gray-400 mb-8">{error}</p>
          <Link href="/pricing">
            <button
              className="text-black font-bold py-3 px-8 rounded-lg text-lg transition hover:opacity-90"
              style={{ backgroundColor: '#FFD700' }}
            >
              Return to Pricing
            </button>
          </Link>
        </div>
      </main>
    );
  }

  if (!verified) {
    return (
      <main className="min-h-screen bg-black text-white py-12 px-4">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-3xl font-bold mb-4" style={{ color: '#FFD700' }}>
            Verification Pending
          </h1>
          <p className="text-gray-400 mb-8">Payment verification in progress</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white py-20 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Celebration Header */}
        <div className="text-center mb-16">
          <div className="text-6xl mb-6">🎉</div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            You're In!
          </h1>
          <p className="text-xl text-gray-300 mb-2">
            Your payment is confirmed.
          </p>
          <p className="text-lg text-yellow-500 font-bold">
            Your custom meal plan is being prepared right now.
          </p>
        </div>

        {/* What's Happening */}
        <div className="bg-gray-900/50 border border-yellow-700/30 rounded-xl p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6" style={{ color: '#FFD700' }}>
            Here's What's Happening
          </h2>

          <div className="space-y-6">
            {/* Step 1 */}
            <div className="flex gap-4">
              <div
                className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-bold text-black text-lg"
                style={{ backgroundColor: '#FFD700' }}
              >
                ✓
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">Payment Confirmed</h3>
                <p className="text-gray-400">
                  Your transaction is secure and locked in.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-4">
              <div
                className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-bold text-black text-lg"
                style={{ backgroundColor: '#FFD700' }}
              >
                ⏳
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">Dane is Reviewing Your Plan</h3>
                <p className="text-gray-400">
                  Your stats are being analyzed. Your macros are being calculated. Your meals are being selected from your favorite foods. This usually takes 2-4 hours.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-4">
              <div
                className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-bold text-black text-lg"
                style={{ backgroundColor: '#FFD700' }}
              >
                📧
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">You'll Get an Email</h3>
                <p className="text-gray-400">
                  Once your plan is approved by Dane, you'll receive a login link. Click it, download your PDF, and start following your custom plan.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex gap-4">
              <div
                className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-bold text-black text-lg"
                style={{ backgroundColor: '#FFD700' }}
              >
                💪
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">Start Your Transformation</h3>
                <p className="text-gray-400">
                  Follow your personalized plan. Track your progress. Watch the results.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Your Plan Details */}
        <div className="bg-gray-900/50 border border-yellow-700/30 rounded-xl p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6" style={{ color: '#FFD700' }}>
            Your {tierInfo.name} Plan Includes
          </h2>

          <ul className="space-y-3">
            {tierInfo.features.map((feature, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <span className="text-yellow-500 font-bold flex-shrink-0">✓</span>
                <span className="text-gray-300">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Timeline */}
        <div className="bg-gray-900/50 border border-yellow-700/30 rounded-xl p-8 mb-8">
          <h2 className="text-xl font-bold mb-6" style={{ color: '#FFD700' }}>
            Timeline
          </h2>

          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="text-yellow-500 font-bold text-sm pt-1">NOW</div>
              <p className="text-gray-300">You're seeing this confirmation</p>
            </div>
            <div className="flex gap-4">
              <div className="text-yellow-500 font-bold text-sm pt-1">1-4 HRS</div>
              <p className="text-gray-300">Dane reviews your stats & creates your plan</p>
            </div>
            <div className="flex gap-4">
              <div className="text-yellow-500 font-bold text-sm pt-1">TOMORROW</div>
              <p className="text-gray-300">
                You receive your plan email with download link
              </p>
            </div>
            <div className="flex gap-4">
              <div className="text-yellow-500 font-bold text-sm pt-1">THEN</div>
              <p className="text-gray-300">
                Follow the plan and start seeing results in 4-6 weeks
              </p>
            </div>
          </div>
        </div>

        {/* Email Reminder */}
        <div
          className="rounded-xl p-8 mb-8 border-l-4"
          style={{
            backgroundColor: 'rgba(255, 215, 0, 0.05)',
            borderColor: '#FFD700',
          }}
        >
          <h3 className="font-bold mb-2">📬 Check Your Email</h3>
          <p className="text-gray-300 text-sm">
            A confirmation email has been sent. Check your inbox (and spam folder) for updates. Your plan email will arrive within 2-4 hours.
          </p>
        </div>

        {/* CTA */}
        <div className="text-center">
          <p className="text-gray-400 mb-6">Questions while you wait?</p>
          <a
            href="mailto:support@buildabod.co"
            className="inline-block px-8 py-3 border-2 border-yellow-500 hover:bg-yellow-500/10 text-white font-bold rounded-lg transition"
          >
            Contact Support
          </a>
        </div>

        {/* Footer */}
        <div className="text-center mt-16">
          <p className="text-gray-500 text-sm">
            Thanks for choosing BuildABod. Your transformation starts now.
          </p>
          <p className="text-gray-600 text-xs mt-4">
            500+ Transformations | 10+ Years | Every Plan Personally Approved
          </p>
        </div>
      </div>
    </main>
  );
}
