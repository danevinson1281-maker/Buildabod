'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

export default function WaiverSuccessScreen({ clientName }) {
  const firstName = clientName?.split(' ')[0] || 'friend'

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="bg-gray-900 border border-yellow-700/30 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Celebration Icon */}
        <div className="text-center mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-6xl mb-4 inline-block"
          >
            🎉
          </motion.div>
        </div>

        {/* Main Message */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            You're In, {firstName}!
          </h1>
          <p className="text-gray-400 text-lg">
            Your waiver has been signed and confirmed.
          </p>
        </div>

        {/* Welcome from Dane */}
        <div className="bg-black/50 border border-yellow-700/20 rounded-xl p-6 mb-8">
          <p className="text-gray-300 italic leading-relaxed">
            "Hey {firstName} — thanks for signing your waiver. I'm Dane, and I'm personally going to review your intake and build your custom meal plan. I take this seriously. You're going to get something that actually works for your goals, not some generic template. Check your email in the next 1-2 hours for your plan access. Let's build your best body. 💪"
          </p>
          <p className="text-yellow-500 font-semibold mt-4">— Dane Vinson, BuildABod</p>
        </div>

        {/* What Happens Next */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4">What Happens Next</h2>
          <div className="space-y-3">
            <div className="flex gap-3 items-start">
              <span className="text-yellow-500 font-bold text-lg flex-shrink-0">1</span>
              <div>
                <p className="text-white font-semibold">Dane Reviews Your Intake</p>
                <p className="text-gray-400 text-sm">I'm optimizing your macros specifically for your goals and preferences.</p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <span className="text-yellow-500 font-bold text-lg flex-shrink-0">2</span>
              <div>
                <p className="text-white font-semibold">Your Meal Plan is Generated</p>
                <p className="text-gray-400 text-sm">Custom meals built around foods you actually like eating.</p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <span className="text-yellow-500 font-bold text-lg flex-shrink-0">3</span>
              <div>
                <p className="text-white font-semibold">Email with Dashboard Access</p>
                <p className="text-gray-400 text-sm">You'll get a link to your plan and full dashboard. Everything is there.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-black/50 border border-yellow-700/20 rounded-xl p-4 mb-8">
          <p className="text-gray-400 text-sm">
            <span className="text-yellow-500 font-semibold">⏱️ Timeline:</span> Most plans are ready within 1-2 hours during business hours. Check your email for the access link.
          </p>
        </div>

        {/* CTA - Home Button */}
        <div className="text-center">
          <Link href="/">
            <button className="w-full py-3 px-6 bg-yellow-500 hover:bg-yellow-600 text-black font-bold rounded-lg transition duration-200">
              Back to Home
            </button>
          </Link>
          <p className="text-gray-400 text-sm mt-4">
            Your waiver is saved. You'll receive a confirmation email shortly.
          </p>
        </div>
      </motion.div>
    </div>
  )
}
