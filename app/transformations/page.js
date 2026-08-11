// app/transformations/page.js

'use client';

import Link from 'next/link';

const STATS = [
  { number: '500+', label: 'Clients Transformed' },
  { number: '3-12', label: 'Months Average Timeline' },
  { number: '100%', label: 'Real Clients (No Filters)' },
  { number: 'All', label: 'Plans Deliver Results' },
];

const TRANSFORMATIONS = [
  { image: '/photo 1.jpg' },
  { image: '/photo 2.jpg' },
];


const TIMELINE = [
  {
    phase: 'Month 1',
    title: 'Energy Boost & Mental Clarity',
    highlights: ['Better digestion', 'More energy throughout the day', 'Mental focus increases', 'Clothes fit slightly better']
  },
  {
    phase: 'Month 2-3',
    title: 'Fat Loss Accelerates',
    highlights: ['Visible fat loss begins', 'Muscle definition appears', 'Strength increases', 'Confidence builds']
  },
  {
    phase: 'Month 4+',
    title: 'Complete Transformation',
    highlights: ['Major body composition changes', 'Significant muscle gain/tone', 'Full transformation achieved', 'New lifestyle established']
  }
];

const WHY_IT_WORKS = [
  {
    icon: '🎯',
    title: 'Built For YOU',
    description: 'Custom macros, your favorite foods, your goals. Not a generic app template.',
  },
  {
    icon: '🍽️',
    title: 'Quality Foods You Enjoy',
    description: 'I build your plan around healthy proteins, complex carbs, and good fats YOU like. That\'s the foundation of results.',
  },
  {
    icon: '📊',
    title: 'Real Adjustments',
    description: 'Your plan evolves with your body. When results plateau, we adjust. That\'s what keeps progress going.',
  },
  {
    icon: '🤝',
    title: 'You\'re Not Alone',
    description: 'Monthly (Pro) or weekly (Elite) check-ins with Dane keep you accountable and on track.',
  },
];

const OBJECTIONS = [
  {
    question: 'Will I be hungry?',
    answer: 'No. Your macros are based on YOUR body and YOUR favorite healthy foods. You eat foods you enjoy in quantities that satisfy you.',
  },
  {
    question: 'How fast will I see results?',
    answer: 'Week 1-2: more energy and mental clarity. Week 3-4: clothes fit different. Week 8-12: dramatic visual changes.',
  },
  {
    question: 'What if I mess up?',
    answer: 'You won\'t fail. Pro and Elite clients get monthly/weekly check-ins to adjust. One bad day doesn\'t derail you.',
  },
  {
    question: 'Can I eat my favorite foods?',
    answer: 'Yes — but smart. Your plan includes foods you actually enjoy, built around quality proteins, complex carbs, and healthy fats. We work with YOUR preferences to hit YOUR macros. The science is in the macros — hit them consistently and you\'ll transform.',
  },
];

const WHAT_CLIENTS_ACHIEVE = [
  {
    icon: '⚖️',
    title: 'Average Weight Loss',
    result: '20-40 lbs',
    timeframe: 'In 12 weeks',
  },
  {
    icon: '💪',
    title: 'Muscle Gain',
    result: '20+ lbs',
    timeframe: 'With proper training',
  },
];

export default function TransformationsPage() {
  return (
    <div className="min-h-screen bg-black">
      {/* Header Navigation */}
      <nav className="sticky top-0 z-50 bg-black/80 backdrop-blur border-b border-yellow-700/30">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-white font-bold text-xl hover:text-yellow-400 transition">
            BuildABod
          </Link>
          <Link
            href="/"
            className="text-gray-300 hover:text-yellow-400 transition text-sm"
          >
            ← Back to Home
          </Link>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="py-16 md:py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
            This Is What Real Results Look Like
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            No filters. No fake before/afters. Just real people who followed a plan built for THEIR body, THEIR goals, and THEIR favorite healthy foods.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/pricing"
              className="py-3 px-8 font-bold rounded-lg transition transform hover:opacity-90 text-black text-lg"
              style={{ backgroundColor: '#FFD700' }}
            >
              Start Your Transformation
            </Link>
            <Link
              href="/"
              className="py-3 px-8 text-white font-bold rounded-lg transition border-2"
              style={{ borderColor: '#FFD700', color: '#FFD700' }}
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* STATS BANNER */}
      <section className="py-12 px-4 bg-gray-900/30 border-y border-yellow-700/30">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {STATS.map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-3xl md:text-4xl font-bold mb-2" style={{ color: '#FFD700' }}>
                  {stat.number}
                </p>
                <p className="text-sm md:text-base text-gray-300">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TRANSFORMATION IMAGES - CLEAN & UNBLOCKED */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Real People. Real Plans. Real Results.
            </h2>
            <p className="text-gray-400 text-lg">
              Every transformation started with one decision. Here are some of the clients who changed their lives.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {TRANSFORMATIONS.map((transformation, index) => (
              <div key={index} className="group">
                {/* JUST THE PHOTO - NOTHING ELSE */}
                <div className="rounded-2xl overflow-hidden border border-yellow-700/30 hover:border-yellow-500/50 transition transform hover:scale-105">
                  <img
                    src={transformation.image}
                    alt={transformation.name}
                    className="w-full h-auto object-contain"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Add More Coming Soon Message */}
          <div className="mt-16 text-center">
            <p className="text-gray-400 text-lg">
              More transformations added regularly as clients continue to achieve their goals.
            </p>
          </div>
        </div>
      </section>

      {/* TIMELINE - WHAT TO EXPECT */}
      <section className="py-16 px-4 bg-gray-900/30 border-y border-yellow-700/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Here's Your <span style={{ color: '#FFD700' }}>Realistic Timeline</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Results come fast when you have a real plan. Here's what happens.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {TIMELINE.map((phase, index) => (
              <div 
                key={index} 
                className="bg-gray-900/50 border border-yellow-700/30 rounded-xl p-8 hover:border-yellow-500/50 transition relative"
              >
                <div className="absolute -top-4 left-6 bg-black px-3 py-1 rounded-full">
                  <p className="text-sm font-bold" style={{ color: '#FFD700' }}>
                    {phase.phase}
                  </p>
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-6 mt-2">
                  {phase.title}
                </h3>
                <ul className="space-y-3">
                  {phase.highlights.map((highlight, hIndex) => (
                    <li key={hIndex} className="flex gap-3 items-start">
                      <span style={{ color: '#FFD700' }} className="text-lg flex-shrink-0 mt-1">✓</span>
                      <span className="text-gray-300">{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* OBJECTIONS SECTION */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Common Questions We Get
            </h2>
            <p className="text-gray-400">
              Straight answers to the questions people ask before starting.
            </p>
          </div>

          <div className="space-y-4">
            {OBJECTIONS.map((item, index) => (
              <div key={index} className="bg-gray-900/50 border border-yellow-700/30 rounded-lg p-6 hover:border-yellow-500/50 transition">
                <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                  <span style={{ color: '#FFD700' }}>?</span>
                  {item.question}
                </h3>
                <p className="text-gray-300">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHAT CLIENTS ACHIEVE */}
      <section className="py-16 px-4 bg-gray-900/30 border-y border-yellow-700/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              What You Can Expect to Achieve
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              These aren't promises — they're what actually happens when you follow a plan built for YOUR body.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {WHAT_CLIENTS_ACHIEVE.map((item, index) => (
              <div key={index} className="bg-gray-900/50 border border-yellow-700/30 rounded-lg p-6 text-center hover:border-yellow-500/50 transition">
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                <p className="text-3xl font-bold mb-2" style={{ color: '#FFD700' }}>
                  {item.result}
                </p>
                <p className="text-sm text-gray-400">{item.timeframe}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY IT WORKS */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Why This System Works
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Built on 10+ years of coaching real clients in person — systemized into a plan you can follow anywhere.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {WHY_IT_WORKS.map((item, index) => (
              <div key={index} className="bg-gray-900/50 border border-yellow-700/30 rounded-lg p-6 hover:border-yellow-500/50 transition">
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                <p className="text-gray-300">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* URGENCY CTA */}
      <section className="py-16 px-4 bg-gradient-to-b from-yellow-900/20 to-black border-y border-yellow-700/30">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Your Transformation Starts With One Decision
          </h2>
          <p className="text-gray-300 text-lg mb-8">
            These results didn't happen by accident. They happened because someone decided "today's the day."
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/pricing"
              className="py-4 px-10 font-bold rounded-lg transition text-black text-lg hover:opacity-90"
              style={{ backgroundColor: '#FFD700' }}
            >
              See Plans & Pricing
            </Link>
            <Link
              href="/"
              className="py-4 px-10 text-white font-bold rounded-lg transition border-2"
              style={{ borderColor: '#FFD700' }}
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 bg-black border-t border-yellow-700/30 text-center text-gray-500 text-sm">
        <p>© 2026–{new Date().getFullYear()} BuildABod. All rights reserved. | Custom Diet Plans by Dane Vinson</p>

      </footer>
    </div>
  );
}
