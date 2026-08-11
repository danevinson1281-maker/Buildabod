'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

const PLANS = [
  {
    id: 'kickstart',
    name: 'Kickstart Plan',
    icon: '⚡',
    price: '$67', // ✅ UPDATED from $50
    period: '',
    type: 'one-time',
    description: 'One-time custom plan — no ongoing commitment',
    perfectFor: [
      'Weddings, vacations, or photoshoots',
      'Testing BuildABod before you commit',
      'Full plan delivered in 24 hours',
    ],
    features: [
      'Personalized meal plan',
      "Dane's personal macro review",
      'Professional PDF delivered',
      'Client portal access',
      'Unlimited food swaps',
      'Support for technical issues',
    ],
    notIncluded: [
      'Ongoing support',
      'Check-ins',
      'Macro adjustments',
    ],
    cta: 'Get Started',
    highlighted: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    icon: '💪',
    price: '$127', // ✅ UPDATED from $97
    period: '/month',
    type: 'subscription',
    description: 'Monthly coaching with ongoing support',
    features: [
      'Everything in Kickstart, plus:',
      'Monthly photo and macro reviews & adjustments',
      'Unlimited food swaps',
      'Monthly email check-ins',
      'Email support within 24 hours',
    ],
    notIncluded: [
      'Text support',
      'Weekly check-ins',
      'Custom re-feed days',
    ],
    cta: 'Start Pro',
    highlighted: true,
  },
  {
    id: 'elite',
    name: 'Elite',
    icon: '👑',
    price: '$197', // ✅ UPDATED from $167
    period: '/month',
    type: 'subscription',
    description: 'Weekly coaching with priority access',
    features: [
      'Everything in Pro, plus:',
      'Weekly photo and macro reviews & adjustments',
      'Unlimited food swaps',
      'Weekly email check-ins',
      'Custom re-feed days',
      'Email & text support (within 12 hours)',
    ],
    notIncluded: [],
    cta: 'Start Elite',
    highlighted: false,
    best: true,
  },
];

// Rest of file stays the same...



const GOAL_CONTENT = {
  'fat-loss': {
    headline: 'Lose Fat Without Losing Muscle',
    subheadline: 'Get leaner while staying strong — with foods you actually enjoy eating.',
    icon: '🔥',
    goalLabel: 'Fat Loss',
    description:
      'Dane calculates a precise caloric deficit while keeping protein high to preserve every pound of muscle. No starvation. No guesswork.',
    whyWorks: [
      'Strategic deficit — lose fat without crashing your metabolism',
      'High protein keeps your muscle while the fat comes off',
      'Your favorite foods make the plan sustainable long-term',
      'Ongoing adjustments prevent plateaus before they happen',
    ],
    proFeature: 'Monthly macro adjustments based on your progress',
    eliteFeature: 'Weekly adjustments + custom re-feed days to boost metabolism',
  },
  'build-muscle': {
    headline: 'Build Muscle Without the Guesswork',
    subheadline: 'Strategic surplus. Precision macros. Real gains.',
    icon: '💪',
    goalLabel: 'Muscle Building',
    description:
      'Dane calculates a strategic caloric surplus with the right protein, carbs, and fats to fuel muscle growth — without packing on unnecessary fat.',
    whyWorks: [
      'Calculated surplus — enough to grow, not enough to get fat',
      '1–1.5g protein per pound to maximize recovery',
      'Carb timing around your workouts for peak performance',
      'Regular check-ins track your strength and size gains',
    ],
    proFeature: 'Monthly adjustments to increase calories as you gain weight',
    eliteFeature: 'Weekly optimization + custom carb-loading days for heavy training',
  },
  'stay-healthy': {
    headline: 'Stay Healthy Without Overthinking It',
    subheadline: 'Balanced nutrition built for real life.',
    icon: '🏆',
    goalLabel: 'Wellness',
    description:
      'Dane calculates your maintenance calories so you stay fit, energized, and healthy — without obsessing over every bite.',
    whyWorks: [
      'No extreme restrictions — eat like a normal person',
      'Real food you enjoy every single day',
      'Flexibility to eat socially without guilt',
      'Check-ins keep you consistent long-term',
    ],
    proFeature: 'Monthly macro reviews to adjust for lifestyle changes',
    eliteFeature: 'Weekly optimization + expert guidance on long-term wellness',
  },
};

export default function PricingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const goalParam = searchParams.get('goal') || 'fat-loss';
  const clientIdParam = searchParams.get('clientId');

  const [goal, setGoal] = useState(
    GOAL_CONTENT[goalParam] ? goalParam : 'fat-loss'
  );

  const goalData = GOAL_CONTENT[goal];

  const handleSelectPlan = (planId) => {
    localStorage.setItem('selectedPlanType', planId);
    const params = new URLSearchParams();
    params.set('plan', planId);
    params.set('goal', goal);
    if (clientIdParam) params.set('clientId', clientIdParam);
    router.push(`/intake?${params.toString()}`);
  };

  const handleGoalChange = (newGoal) => {
    setGoal(newGoal);
    const params = new URLSearchParams();
    params.set('goal', newGoal);
    if (clientIdParam) params.set('clientId', clientIdParam);
    window.history.replaceState({}, '', `/pricing?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-black/80 backdrop-blur border-b border-yellow-700/30">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link
            href="/"
            className="text-white font-bold text-xl hover:text-yellow-400 transition"
          >
            BuildABod
          </Link>
          <div className="flex items-center gap-8">
            <Link
              href="/"
              className="text-gray-300 hover:text-yellow-400 transition text-sm"
            >
              Home
            </Link>
            <Link
              href="/transformations"
              className="text-gray-300 hover:text-yellow-400 transition text-sm"
            >
              Transformations
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Header */}
      <div className="py-16 px-4 bg-gradient-to-b from-gray-900/30 to-black border-b border-yellow-700/30">
        <div className="max-w-6xl mx-auto text-center">
          <div className="text-6xl mb-4">{goalData.icon}</div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
            {goalData.headline}
          </h1>
          <p className="text-xl text-gray-300 mb-3">{goalData.subheadline}</p>
          <p className="text-gray-400 max-w-3xl mx-auto">{goalData.description}</p>
        </div>
      </div>

      {/* Goal Switcher */}
      <div className="py-6 px-4 bg-black border-b border-yellow-700/30">
        <div className="max-w-md mx-auto">
          <div className="flex gap-2">
            {Object.entries(GOAL_CONTENT).map(([goalKey, goalInfo]) => (
              <button
                key={goalKey}
                onClick={() => handleGoalChange(goalKey)}
                className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                  goal === goalKey
                    ? 'bg-yellow-500 text-black'
                    : 'bg-gray-900/50 text-gray-400 hover:text-white border border-gray-700/50 hover:border-gray-600'
                }`}
              >
                <span className="mr-1.5">{goalInfo.icon}</span>
                {goalInfo.goalLabel}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Why This Works */}
      <div className="py-16 px-4 bg-gray-900/30 border-b border-yellow-700/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-12 text-center">
            Why This Works for {goalData.goalLabel}
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {goalData.whyWorks.map((reason, idx) => (
              <div
                key={idx}
                className="flex gap-4 bg-gray-900/50 border border-yellow-700/20 rounded-xl p-5"
              >
                <span className="text-yellow-500 text-xl flex-shrink-0 mt-0.5">✓</span>
                <p className="text-gray-300">{reason}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

            {/* Pricing Cards */}
      <div className="py-20 px-4 bg-black">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-white text-center mb-4">
            Choose Your Plan
          </h2>
          <p className="text-gray-400 text-center mb-16 text-lg">
            Every plan includes a meal plan built specifically for your{' '}
            {goalData.goalLabel.toLowerCase()} goal.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
            {PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`relative rounded-2xl transition-all duration-300 flex flex-col ${
                  plan.highlighted
                    ? 'bg-gradient-to-br from-yellow-900/40 to-yellow-900/10 border-2 border-yellow-500 shadow-2xl shadow-yellow-500/20 md:scale-105 hover:shadow-yellow-500/30'
                    : plan.best
                    ? 'bg-gradient-to-br from-emerald-900/40 to-emerald-900/10 border-2 border-emerald-500 shadow-2xl shadow-emerald-500/20 md:scale-105 hover:shadow-emerald-500/30'
                    : 'bg-gray-900/50 border border-gray-700/50 hover:border-gray-600 hover:bg-gray-900/70'
                } p-8`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span
                      className="px-6 py-1.5 rounded-full text-sm font-bold text-black whitespace-nowrap"
                      style={{ backgroundColor: '#FFD700' }}
                    >
                      Most Popular
                    </span>
                  </div>
                )}

                {plan.best && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="px-6 py-1.5 rounded-full text-sm font-bold text-black whitespace-nowrap bg-emerald-500">
                      👑 Best Results
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{plan.icon}</span>
                  <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
                </div>
                <p className="text-sm text-gray-400 mb-6">{plan.description}</p>

                {/* PRICING DISPLAY */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-white">
                      {plan.price}
                    </span>
                    {plan.period && (
                      <span className="text-gray-300 ml-1">{plan.period}</span>
                    )}
                  </div>
                  {plan.type === 'one-time' && (
                    <p className="text-xs text-gray-500 mt-2">One-time payment</p>
                  )}
                </div>

                {/* KICKSTART: PERFECT FOR CALLOUT */}
                {plan.id === 'kickstart' && (
                  <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-4 mb-6">
                    <p className="font-bold text-blue-400 text-xs uppercase tracking-wider mb-2">
                      Perfect For
                    </p>
                    <div className="space-y-1.5">
                      {plan.perfectFor.map((item, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <span className="text-blue-400 text-sm flex-shrink-0">✓</span>
                          <span className="text-sm text-gray-300">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {plan.id === 'pro' && (
                  <div className="bg-yellow-900/20 border border-yellow-700/30 rounded-lg p-3 mb-6">
                    <p className="font-bold text-yellow-500 text-xs uppercase tracking-wider mb-1">
                      For {goalData.goalLabel}
                    </p>
                    <p className="text-sm text-gray-300">{goalData.proFeature}</p>
                  </div>
                )}

                {plan.id === 'elite' && (
                  <div className="bg-emerald-900/20 border border-emerald-700/30 rounded-lg p-3 mb-6">
                    <p className="font-bold text-emerald-400 text-xs uppercase tracking-wider mb-1">
                      For {goalData.goalLabel}
                    </p>
                    <p className="text-sm text-gray-300">{goalData.eliteFeature}</p>
                  </div>
                )}

                <div className="space-y-3 mb-4 flex-1">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <span
                        className="text-lg flex-shrink-0 mt-0.5"
                        style={{ color: plan.best ? '#10B981' : '#FFD700' }}
                      >
                        ✓
                      </span>
                      <span
                        className={`text-sm ${
                          idx === 0 ? 'text-gray-200 font-semibold' : 'text-gray-400'
                        }`}
                      >
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                {plan.notIncluded.length > 0 && (
                  <div className="space-y-2 mb-8 pt-2 border-t border-gray-800/50">
                    {plan.notIncluded.map((feature, idx) => (
                      <div key={`no-${idx}`} className="flex items-start gap-3">
                        <span className="text-gray-700 text-lg flex-shrink-0 mt-0.5">
                          ✕
                        </span>
                        <span className="text-sm text-gray-600">{feature}</span>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  onClick={() => handleSelectPlan(plan.id)}
                  className={`w-full py-3.5 px-6 font-bold rounded-xl transition text-base cursor-pointer mt-auto ${
                    plan.highlighted
                      ? 'bg-yellow-500 hover:bg-yellow-400 text-black shadow-lg shadow-yellow-500/20'
                      : plan.best
                      ? 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-lg shadow-emerald-500/20'
                      : 'border-2 border-gray-700/50 text-gray-300 hover:bg-gray-800/50'
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-500 text-sm">
              Built on 10+ years of personal training experience · Cancel anytime · No contracts
            </p>
          </div>
        </div>
      </div>


      {/* FAQ */}
      <div className="py-20 px-4 bg-black border-t border-yellow-700/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-white text-center mb-16">
            Common Questions
          </h2>

          <div className="space-y-4">
            <div className="bg-gray-900/50 border border-yellow-700/30 rounded-lg p-6">
              <h3 className="font-bold text-white mb-3 text-lg">Which plan should I choose?</h3>
              <p className="text-gray-300">
                Kickstart is perfect if you have an upcoming event or want to test BuildABod before committing to coaching. Pro is ideal if you want monthly guidance and macro adjustments to stay on track. Elite is for serious clients who want weekly optimization with priority support and custom re-feed days.
              </p>
            </div>

            <div className="bg-gray-900/50 border border-yellow-700/30 rounded-lg p-6">
              <h3 className="font-bold text-white mb-3 text-lg">Can I change my goal later?</h3>
              <p className="text-gray-300">
                Absolutely. If your goals change, Dane will recalculate your macros and build you a new plan. Pro and Elite clients get this included with their regular check-ins.
              </p>
            </div>

            <div className="bg-gray-900/50 border border-yellow-700/30 rounded-lg p-6">
              <h3 className="font-bold text-white mb-3 text-lg">How long do subscriptions last?</h3>
              <p className="text-gray-300">
                Pro and Elite are month-to-month. Cancel anytime — no contracts, no cancellation fees. Most clients stay because the results speak for themselves.
              </p>
            </div>

            <div className="bg-gray-900/50 border border-yellow-700/30 rounded-lg p-6">
              <h3 className="font-bold text-white mb-3 text-lg">What if I'm not seeing results?</h3>
              <p className="text-gray-300">
                That's exactly why Pro and Elite exist. Dane will adjust your macros based on your progress. Pro gets monthly adjustments, Elite gets weekly. Your plan evolves with your body.
              </p>
            </div>

            <div className="bg-gray-900/50 border border-yellow-700/30 rounded-lg p-6">
              <h3 className="font-bold text-white mb-3 text-lg">Can I upgrade my plan?</h3>
              <p className="text-gray-300">
                Yes. You can upgrade anytime to access more support and features. If you need any help, contact Dane and he will adjust your subscription.
              </p>
            </div>

            <div className="bg-gray-900/50 border border-yellow-700/30 rounded-lg p-6">
              <h3 className="font-bold text-white mb-3 text-lg">What's the difference between Pro and Elite?</h3>
              <p className="text-gray-300">
                Pro includes monthly macro reviews, unlimited meal swaps, and monthly email check-ins with email support within 24 hours. Elite includes weekly macro reviews, unlimited meal swaps, weekly email check-ins, custom re-feed days, and premium support via email & text within 12 hours. Elite is the premium plan for maximum results and support.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* DISCLAIMER SECTION */}
      <div className="py-16 px-4 bg-gray-900/50 border-t border-yellow-700/30">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-900/70 border border-yellow-700/50 rounded-xl p-8">
            <h3 className="text-lg font-bold text-yellow-500 mb-4">⚠️ Important Disclaimer</h3>
            <p className="text-sm text-gray-300 leading-relaxed mb-4">
              BuildABod provides personalized <span className="font-semibold">nutritional recommendations and meal planning guidance for general wellness purposes only</span>. Dane Vinson is a <span className="font-semibold">certified personal trainer</span> and nutrition advisor, not a registered dietitian. These meal plans are <span className="font-semibold">not medical advice</span> and should not be used to diagnose, treat, cure, or prevent any medical condition.
            </p>
            <p className="text-sm text-gray-300 leading-relaxed mb-4">
              <span className="font-semibold">Important:</span> If you have medical conditions, allergies, take medications, or have any health concerns, consult a qualified healthcare provider or registered dietitian before starting any new nutrition plan. Results vary based on individual factors including adherence, activity level, metabolism, and overall lifestyle.
            </p>
            <p className="text-xs text-gray-400 italic">
              For medical nutrition therapy or treatment of medical conditions, seek guidance from a registered dietitian (RD) or registered dietitian nutritionist (RDN) — qualified medical professionals regulated by state and national standards.
            </p>
          </div>
        </div>
      </div>

      {/* Real Transformations CTA */}
      <div className="py-20 px-4 bg-gradient-to-b from-black to-gray-900/30 border-t border-yellow-700/30">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            See Real Transformations
          </h2>
          <p className="text-lg text-gray-300 mb-8">
            10 years of personal training. Real clients, real results.
          </p>
          <Link
            href="/transformations"
            className="inline-block py-4 px-12 font-bold rounded-xl transition text-black text-lg hover:bg-yellow-400 cursor-pointer shadow-lg"
            style={{ backgroundColor: '#FFD700' }}
          >
            View Transformations
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 px-4 bg-black border-t border-yellow-700/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center text-gray-500 text-sm mb-6">
<p>© 2026–{new Date().getFullYear()} BuildABod. All rights reserved. | Custom Nutrition Plans by Dane Vinson, CPT</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

