'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function HomeContent() {
  const searchParams = useSearchParams();
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [referralCode, setReferralCode] = useState(null);

  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref) {
      setReferralCode(ref);
      localStorage.setItem('referralCode', ref);
    }
  }, [searchParams]);

  const goals = [
    {
      id: 'fat-loss',
      title: 'Lose Fat',
      description: 'Burn fat while keeping every pound of muscle',
      icon: '🔥',
      benefits: [
        'Precise calorie deficit calculated for YOUR body',
        'High protein to protect muscle while cutting',
        'Foods you actually enjoy — no starvation',
      ],
    },
    {
      id: 'build-muscle',
      title: 'Build Muscle',
      description: 'Pack on size and strength the right way',
      icon: '💪',
      benefits: [
        'Calorie surplus dialed in to your stats',
        'Protein targets optimized for muscle growth',
        'Meal timing built around your training',
      ],
    },
    {
      id: 'stay-healthy',
      title: 'Stay Healthy',
      description: 'Look and feel your best year round',
      icon: '❤️',
      benefits: [
        'Maintenance calories calculated precisely',
        'Balanced nutrition across all macros',
        'Sustainable — built to last, not just 30 days',
      ],
    },
  ];

  const faqs = [
    {
      question: 'How personalized is my meal plan really?',
      answer:
        'Completely custom. Your exact calorie and macro targets are calculated from your height, weight, age, activity level, and goal. Every meal is built using foods YOU chose. Then I personally review it before it ever reaches you. No templates. No copy-paste.',
    },
    {
      question: 'How fast do I get my plan?',
      answer:
        'Your plan is ready by tomorrow morning. I personally review every single plan — no automated nonsense. You fill out the form today, pay, and wake up to your custom plan in your inbox.',
    },
    {
      question: 'What if I want to swap foods in my plan?',
      answer:
        'Every plan comes with a full substitution list — every food has swap options already calculated to match your macros exactly. You can make swaps yourself directly in your dashboard anytime. If you need more significant changes or a completely new plan built, just reach out and I\'ll handle it.',
    },
    {
      question: 'What if I have dietary restrictions?',
      answer:
        'Fully supported. You choose every food in your plan during the intake process. Vegan, keto, gluten-free, dairy-free — just skip those categories and your plan is built around what you actually eat.',
    },
    {
      question: 'How long until I see results?',
      answer:
        'Most clients see noticeable changes in 3-5 weeks. Some faster. The key is consistency — and having a plan that fits your life makes that a lot easier. Pro and Elite clients get regular check-ins to make sure you stay on track.',
    },
    {
      question: 'What makes this different from apps like MyFitnessPal?',
      answer:
        'Those apps track what you eat. This builds what you should eat — from scratch, for your body, with your foods. Then a real certified trainer with 10+ years reviews it. You\'re not getting an algorithm. You\'re getting expertise.',
    },
    {
      question: 'What if my plan needs adjustments?',
      answer:
        'Kickstart clients can request 1 plan adjustment if there was an error. Pro clients get monthly check-ins and monthly adjustments. Elite clients get weekly check-ins and priority adjustments. Either way, you can always reach out and we\'ll make sure the plan is working for you.',
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white">

      {/* ── REFERRAL BANNER ────────────────────────────────────────────────── */}
{referralCode && (
  <div className="bg-gradient-to-r from-yellow-500/20 to-yellow-500/10 border-b border-yellow-500/50 px-4 py-4">
    <div className="max-w-7xl mx-auto text-center">
      <p className="text-sm font-bold">
🎉 <span className="text-yellow-400">You were referred to BuildABod!</span> Get <span className="text-yellow-300">10% off</span> your first month. Your referrer also gets $40 in rewards!
      </p>
    </div>
  </div>
)}


      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <header className="border-b border-yellow-700/30 py-5 px-4 sticky top-0 z-50 bg-black/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-yellow-500 tracking-tight">
            BuildABod
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/client-login"
              className="text-sm text-gray-400 hover:text-yellow-500 transition hidden sm:block"
            >
              Client Login
            </Link>
            <Link
              href="/pricing"
              className="text-sm font-bold py-2 px-5 rounded-lg transition"
              style={{ backgroundColor: '#FFD700', color: '#000' }}
            >
              Get My Plan
            </Link>
          </div>
        </div>
      </header>

      {/* ── HERO ───────────────────────────────────────────────────────────── */}
      <section className="py-16 md:py-24 px-4">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">

          {/* Left: Text */}
          <div className="flex flex-col justify-center order-1 md:order-1">
            <div className="inline-flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/30 rounded-full px-4 py-2 mb-6 w-fit">
              <span className="text-yellow-500 text-sm font-bold">✓ Certified Trainer · 10+ Years · 500+ Transformations</span>
            </div>

            <h2 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
              The Diet That
              <span className="text-yellow-500 block">Finally Fits</span>
              <span className="text-white block">Your Life</span>
            </h2>

            <p className="text-lg text-gray-300 mb-4 leading-relaxed">
              Custom meal plans built from <strong className="text-white">your stats, your goals, and the foods you actually enjoy.</strong> No generic templates. No guessing. Just a plan that works — reviewed personally by Dane.
            </p>

            <p className="text-yellow-500 font-bold mb-8">
              ⚡ Your plan delivered by tomorrow morning.
            </p>

            <div className="bg-gray-900/60 border-l-4 border-yellow-500 p-5 mb-8 rounded-r-lg">
              <p className="text-gray-200 italic text-sm leading-relaxed">
                "10+ years. Certified trainer. I've helped 500+ people transform their bodies using exact nutrition. The plan you get is built using the same system I use on myself — and never stop until you win."
              </p>
              <p className="text-yellow-500 font-bold text-sm mt-3">— Dane Vinson, CPT</p>
            </div>

            <Link
              href="/pricing"
              className="py-4 px-8 bg-yellow-500 hover:bg-yellow-600 text-black font-bold rounded-lg transition text-center text-lg w-fit"
            >
              Build My Plan →
            </Link>

            <p className="text-gray-400 text-sm mt-6">
              Plans start at $67 · Delivered by tomorrow morning · Every plan personally approved by Dane
            </p>
          </div>

          {/* Right: Dane photo */}
          <div className="relative flex justify-center order-2 md:order-2">
            <div className="relative">
              <div className="absolute inset-0 bg-yellow-500/20 rounded-2xl blur-3xl scale-95"></div>
              <div className="relative w-72 md:w-80 rounded-2xl overflow-hidden border-2 border-yellow-500/60 shadow-2xl shadow-yellow-500/10">
                <Image
                  src="/dane.jpg"
                  alt="Dane Vinson - Certified Personal Trainer - BuildABod"
                  width={320}
                  height={500}
                  className="w-full h-auto"
                  priority
                />
              </div>
              <div
                className="absolute -bottom-4 -right-4 py-3 px-5 rounded-xl font-bold text-center shadow-xl border border-yellow-600"
                style={{ backgroundColor: '#FFD700', color: '#000' }}
              >
                <p className="text-xs font-bold">Certified Personal Trainer</p>
                <p className="text-sm font-black">Dane Vinson · CPT</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SOCIAL PROOF BAR ───────────────────────────────────────────────── */}
      <section className="py-10 px-4 border-y border-yellow-700/30" style={{ background: 'linear-gradient(135deg, rgba(255,215,0,0.08), rgba(255,215,0,0.03))' }}>
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: '500+', label: 'Transformations' },
              { value: '10+', label: 'Years Certified' },
              { value: '$67', label: 'Plans Start At' },
              { value: '24hrs', label: 'Plan Delivery' },
            ].map((stat, i) => (
              <div key={i}>
                <p className="text-3xl md:text-4xl font-black text-yellow-500">{stat.value}</p>
                <p className="text-gray-400 text-sm mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ───────────────────────────────────────────────── */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h3 className="text-3xl md:text-5xl font-black text-white mb-4">
              Here's Exactly How It Works
            </h3>
            <p className="text-gray-400 max-w-xl mx-auto">
              From zero to a fully personalized meal plan in less than 24 hours.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-10 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-yellow-500/0 via-yellow-500/50 to-yellow-500/0" />

            {[
              {
                step: '1',
                title: 'Complete Your Intake',
                desc: 'Tell Dane your goal, body stats, and the foods you actually want to eat. Takes about 5 minutes.',
                icon: '📋',
              },
              {
                step: '2',
                title: 'Dane Reviews & Builds',
                desc: 'Your exact macros are calculated and every meal is built from your chosen foods. Dane personally approves it.',
                icon: '⚡',
              },
              {
                step: '3',
                title: 'Follow It & Transform',
                desc: 'Wake up to your plan in your inbox. Follow it consistently and watch your body change.',
                icon: '🏆',
              },
            ].map((item, i) => (
              <div key={i} className="text-center relative">
                <div className="text-4xl mb-4">{item.icon}</div>
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center font-black text-black text-xl mx-auto mb-5"
                  style={{ backgroundColor: '#FFD700' }}
                >
                  {item.step}
                </div>
                <h4 className="text-xl font-bold text-white mb-3">{item.title}</h4>
                <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-14">
            <div className="inline-block bg-gray-900/60 border border-yellow-700/30 rounded-xl p-6 max-w-2xl">
              <p className="text-gray-200 text-sm leading-relaxed">
                Every single client gets a plan designed using real nutrition science and 10+ years of training expertise — reviewed and approved by Dane before you ever see it.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHY IT WORKS ───────────────────────────────────────────────────── */}
      <section className="py-20 px-4 border-y border-yellow-700/30" style={{ backgroundColor: 'rgba(255,215,0,0.02)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h3 className="text-3xl md:text-5xl font-black text-white mb-4">
              Why This Actually Works
            </h3>
            <p className="text-gray-400 max-w-xl mx-auto">
              Most diets fail because they're built for someone else. This one is built for you.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {[
              {
                icon: '📊',
                title: 'Science-Backed Formulas',
                desc: 'Your calories and macros are calculated using verified formulas based on your exact stats — not estimates or averages.',
                points: ['Accurate BMR calculation', 'Real activity level adjustments', 'Goal-specific macro targets'],
              },
              {
                icon: '🍽️',
                title: 'Foods You Actually Want',
                desc: 'You pick every food in your plan. No bland chicken and broccoli unless you want it. Real adherence = real results.',
                points: ['100+ foods to choose from', 'All dietary restrictions supported', 'Meals you will actually look forward to'],
              },
              {
                icon: '👨‍🏫',
                title: 'Real Expertise Behind It',
                desc: '500+ transformations across 10+ years of certified training. I know what patterns work, what stalls people, and how to fix it fast.',
                points: ['Every plan personally reviewed', 'Adjustment expertise built in', 'Ongoing support on Pro/Elite tiers'],
              },
            ].map((card, i) => (
              <div key={i} className="bg-gray-900/50 border border-yellow-700/30 hover:border-yellow-500/50 rounded-xl p-8 transition">
                <div className="text-4xl mb-4">{card.icon}</div>
                <h4 className="text-xl font-bold text-white mb-3">{card.title}</h4>
                <p className="text-gray-400 text-sm mb-5 leading-relaxed">{card.desc}</p>
                <ul className="space-y-2">
                  {card.points.map((p, j) => (
                    <li key={j} className="text-sm text-gray-300 flex items-start gap-2">
                      <span className="text-yellow-500 flex-shrink-0">✓</span>{p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Dane's personal stat card + comparison */}
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div
              className="rounded-2xl p-10 text-center border-2"
              style={{ backgroundColor: 'rgba(255,215,0,0.06)', borderColor: 'rgba(255,215,0,0.3)' }}
            >
              <p className="text-7xl font-black text-yellow-500 mb-2">8%</p>
              <p className="text-xl text-white font-bold mb-1">Body Fat — Year Round</p>
              <p className="text-gray-400 text-sm mb-6">Maintained using this exact system</p>
              <div className="border-t border-yellow-500/20 pt-6">
                <p className="text-2xl font-black text-yellow-500 mb-2">
                  "You Can't Out Train A Bad Diet"
                </p>
                <p className="text-gray-400 text-sm">
                  That's why nutrition is everything. That's why every plan is custom. That's why this works.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-2xl font-bold text-white">The difference between this and everything else you've tried:</h4>
              {[
                { label: 'Generic app', value: 'Same plan for everyone', bad: true },
                { label: 'Random YouTube', value: 'No idea if it fits your body', bad: true },
                { label: 'Most coaches', value: 'Template with your name on it', bad: true },
                { label: 'BuildABod', value: 'Built for YOU. Reviewed by Dane.', bad: false },
              ].map((row, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-4 rounded-lg border"
                  style={{
                    backgroundColor: row.bad ? 'rgba(239,68,68,0.05)' : 'rgba(255,215,0,0.08)',
                    borderColor: row.bad ? 'rgba(239,68,68,0.2)' : 'rgba(255,215,0,0.4)',
                  }}
                >
                  <span className="font-bold text-sm" style={{ color: row.bad ? '#9ca3af' : '#FFD700' }}>
                    {row.label}
                  </span>
                  <span className="text-sm" style={{ color: row.bad ? '#6b7280' : '#ffffff' }}>
                    {row.bad ? '✗ ' : '✓ '}{row.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── GOAL SELECTION ─────────────────────────────────────────────────── */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h3 className="text-3xl md:text-5xl font-black text-white mb-4">What's Your Goal?</h3>
            <p className="text-gray-400 max-w-xl mx-auto">
              Every plan is built differently based on what you're trying to achieve. Pick yours.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {goals.map((goal) => (
              <div
                key={goal.id}
                className="bg-gray-900/50 border border-yellow-700/30 hover:border-yellow-500/60 rounded-xl p-8 transition group"
              >
                <div className="text-5xl mb-4">{goal.icon}</div>
                <h4 className="text-2xl font-black text-white mb-2">{goal.title}</h4>
                <p className="text-gray-400 mb-6 text-sm">{goal.description}</p>
                <ul className="mb-8 space-y-3">
                  {goal.benefits.map((benefit, idx) => (
                    <li key={idx} className="text-sm text-gray-300 flex items-start gap-2">
                      <span className="text-yellow-500 flex-shrink-0 mt-0.5">✓</span>
                      {benefit}
                    </li>
                  ))}
                </ul>
                <Link
                  href={`/pricing?goal=${goal.id}`}
                  className="block w-full py-3 px-6 bg-yellow-500 hover:bg-yellow-600 text-black font-bold rounded-lg transition text-center text-sm"
                >
                  See {goal.title} Plans →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY I BUILT THIS ───────────────────────────────────────────────── */}
      <section className="py-20 px-4 border-t border-yellow-700/30" style={{ backgroundColor: 'rgba(255,215,0,0.02)' }}>
        <div className="max-w-4xl mx-auto">
          <h3 className="text-3xl md:text-5xl font-black text-white mb-8 leading-tight">
            Why I Built <span className="text-yellow-500">BuildABod</span>
          </h3>
          <div className="space-y-5">
            {[
              'For years I watched people get generic plans that ignored their food preferences, their schedule, their life. They quit in 2 weeks.',
              "I got obsessed with nutrition. Maintained 8% body fat year-round. Helped 500+ clients transform. And I realized the #1 reason people fail isn't effort — it's having the wrong plan.",
              "So I built the system I wish existed. One where the plan is actually yours. Where someone who knows what they're doing reviews it. Where you have someone to contact when you need changes.",
              "This is that system. And it works.",
            ].map((text, i) => (
              <div key={i} className="flex gap-4">
                <div
                  className="w-6 h-6 rounded-full flex-shrink-0 mt-1 flex items-center justify-center text-black text-xs font-black"
                  style={{ backgroundColor: '#FFD700' }}
                >
                  {i + 1}
                </div>
                <p className="text-gray-300 leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ────────────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 border-t border-yellow-700/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h3 className="text-3xl md:text-5xl font-black text-white mb-4">
              Common Questions
            </h3>
            <p className="text-gray-400">Everything you need to know before getting started.</p>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="border rounded-xl overflow-hidden transition"
                style={{
                  backgroundColor: expandedFaq === idx ? 'rgba(255,215,0,0.06)' : 'rgba(255,255,255,0.02)',
                  borderColor: expandedFaq === idx ? 'rgba(255,215,0,0.4)' : 'rgba(255,215,0,0.15)',
                }}
              >
                <button
                  onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                  className="w-full p-6 text-left flex justify-between items-center transition"
                >
                  <span className="font-bold text-white pr-4">{faq.question}</span>
                  <span
                    className="text-xl font-black flex-shrink-0 transition-transform"
                    style={{
                      color: '#FFD700',
                      transform: expandedFaq === idx ? 'rotate(45deg)' : 'rotate(0deg)',
                    }}
                  >
                    +
                  </span>
                </button>
                {expandedFaq === idx && (
                  <div className="px-6 pb-6 text-gray-300 text-sm leading-relaxed border-t border-yellow-700/20 pt-4">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ──────────────────────────────────────────────────────── */}
      <section
        className="py-24 px-4 text-center border-t border-yellow-700/30"
        style={{ background: 'linear-gradient(135deg, rgba(255,215,0,0.08), rgba(0,0,0,0) 70%)' }}
      >
        <div className="max-w-3xl mx-auto">
          <p className="text-yellow-500 font-bold text-sm uppercase tracking-widest mb-4">
            Ready to transform?
          </p>
          <h3 className="text-4xl md:text-6xl font-black text-white mb-4 leading-tight">
            Stop Guessing.
            <span className="text-yellow-500 block">Start Winning.</span>
          </h3>
          <p className="text-xl text-gray-300 mb-6 max-w-xl mx-auto leading-relaxed">
            A plan built for your body, your foods, your goal — reviewed by a certified trainer and ready by tomorrow morning.
          </p>

          {/* Mini objection handler */}
          <div
            className="rounded-xl p-6 mb-10 max-w-lg mx-auto text-left border"
            style={{ backgroundColor: 'rgba(255,215,0,0.05)', borderColor: 'rgba(255,215,0,0.2)' }}
          >
            <p className="text-yellow-500 font-bold text-sm mb-3">Still on the fence?</p>
            <ul className="space-y-2 text-sm text-gray-300">
              {[
                'Your foods. Your macros. 100% personalized — not a template.',
                'If something needs adjusting, we fix it.',
                'Pro/Elite clients get monthly/weekly check-ins and accountability.',
                'Plans start at $67 — less than two months of supplements.',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-yellow-500 flex-shrink-0">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/pricing"
              className="py-5 px-12 bg-yellow-500 hover:bg-yellow-600 text-black font-black rounded-xl transition text-lg shadow-lg"
              style={{ boxShadow: '0 0 30px rgba(255,215,0,0.3)' }}
            >
              Build My Custom Plan →
            </Link>
            <Link
              href="/transformations"
              className="py-5 px-12 border-2 border-yellow-500/40 hover:border-yellow-500 hover:bg-yellow-500/10 text-white font-bold rounded-xl transition text-lg"
            >
              See Real Transformations
            </Link>
          </div>

          <p className="text-gray-400 text-sm mt-6">
            Plans start at $67 · Delivered by tomorrow morning · Every plan personally approved by Dane
          </p>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────────────────── */}
      <footer className="border-t border-yellow-700/30 py-14 px-4" style={{ backgroundColor: 'rgba(255,255,255,0.01)' }}>
        <div className="max-w-6xl mx-auto">

          <div className="grid md:grid-cols-3 gap-10 mb-12">
            {/* Brand */}
            <div>
              <h4 className="text-2xl font-black text-yellow-500 mb-3">BuildABod</h4>
              <p className="text-gray-400 text-sm leading-relaxed mb-4">
                Custom meal plans built by certified trainer Dane Vinson. 10+ years. 500+ transformations. Every plan personally reviewed.
              </p>
              <p className="text-gray-500 text-xs">
                Questions? <a href="mailto:dane@buildabod.co" className="text-yellow-500 hover:underline">dane@buildabod.co</a>
              </p>
            </div>

                        {/* Quick links */}
            <div>
              <h5 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">Quick Links</h5>
              <ul className="space-y-2">
                {[
                  { label: 'Pricing', href: '/pricing' },
                  { label: 'Transformations', href: '/transformations' },
                  { label: 'Client Login', href: '/client-login' },
                  { label: 'Terms of Service', href: '/terms' },
                ].map((link, i) => (
                  <li key={i}>
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-yellow-500 transition text-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Plans */}
            <div>
              <h5 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">Plans</h5>
              <ul className="space-y-2">
                {[
                  { label: 'Kickstart — $67 one-time', href: '/pricing' },
                  { label: 'Pro — $127/month', href: '/pricing' },
                  { label: 'Elite — $197/month', href: '/pricing' },
                ].map((link, i) => (
                  <li key={i}>
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-yellow-500 transition text-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-yellow-700/20 pt-8">
            <p className="text-center text-gray-500 text-xs mb-4">
© {new Date().getFullYear()} BuildABod by Dane Vinson. All rights reserved.
            </p>
            <p className="text-xs text-gray-600 text-center max-w-4xl mx-auto leading-relaxed">
              <strong className="text-gray-500">DISCLAIMER:</strong> BuildABod provides personalized nutritional
              recommendations and meal planning guidance for general wellness purposes only. Dane Vinson is a
              certified personal trainer and nutrition advisor, not a registered dietitian. These meal plans are
              not medical advice and should not be used to diagnose, treat, cure, or prevent any medical condition.
              If you have medical conditions, allergies, or take medications, consult a qualified healthcare provider
              before starting any new nutrition plan. Results vary based on individual factors including adherence,
              activity level, and overall lifestyle.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
