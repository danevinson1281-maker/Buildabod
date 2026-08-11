'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@supabase/supabase-js';
import { ChevronRight, Check } from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function OnboardingFlow({ clientId, mealPlan, onComplete, tier, clientName }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const steps = [
    // ... rest of your code

    {
      id: 'welcome',
      title: 'Your Plan is Ready',
      subtitle: 'Let me show you how to use it',
      content: (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg p-8 text-center">
            <div className="text-6xl mb-6">🎯</div>
            <p className="text-lg text-slate-100 mb-2 font-semibold">
              Your macros are calculated.
            </p>
            <p className="text-slate-300 mb-8">
              Your meals are planned. Now you just follow it and watch your body change.
            </p>
            
                                    <div className="grid grid-cols-4 gap-2 sm:gap-3 mb-8">
              <div className="bg-slate-700 rounded p-2 sm:p-3">
                <p className="text-xs text-slate-400">Calories</p>
                <p className="text-xl sm:text-2xl font-bold text-white">
                  {mealPlan?.target_calories || '—'}
                </p>
              </div>
              <div className="bg-slate-700 rounded p-2 sm:p-3">
                <p className="text-xs text-slate-400">Protein</p>
                <p className="text-xl sm:text-2xl font-bold text-white">
                  {mealPlan?.target_protein_g || '—'}<span className="text-sm">g</span>
                </p>
              </div>
              <div className="bg-slate-700 rounded p-2 sm:p-3">
                <p className="text-xs text-slate-400">Carbs</p>
                <p className="text-xl sm:text-2xl font-bold text-white">
                  {mealPlan?.target_carbs_g || '—'}<span className="text-sm">g</span>
                </p>
              </div>
              <div className="bg-slate-700 rounded p-2 sm:p-3">
                <p className="text-xs text-slate-400">Fats</p>
                <p className="text-xl sm:text-2xl font-bold text-white">
                  {mealPlan?.target_fats_g || '—'}<span className="text-sm">g</span>
                </p>
              </div>
            </div>



            <p className="text-sm text-slate-400">
              These are personalized to YOUR body, YOUR goals, and YOUR foods.
            </p>
          </div>

          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <p className="text-sm text-amber-900 dark:text-amber-100">
              <strong>Here's what's different about this plan:</strong>
            </p>
            <ul className="mt-3 space-y-2 text-sm text-amber-900 dark:text-amber-100">
              <li>✓ Built around foods YOU actually like</li>
              <li>✓ Flexible (swap anything anytime)</li>
              <li>✓ Designed for YOUR lifestyle</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: 'swap',
      title: 'Swap Foods in Seconds',
      subtitle: "Don't like something? Change it without breaking your macros",
      content: (
        <div className="space-y-6">
          <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-6">
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 font-semibold">
              Real example:
            </p>
            <div className="flex gap-3 items-center mb-4">
              <div className="bg-red-100 dark:bg-red-900 rounded p-3 flex-1 text-center">
                <p className="text-xs text-slate-600 dark:text-slate-300 mb-1">Current</p>
                <p className="font-bold text-slate-900 dark:text-white">Chicken Breast</p>
              </div>
              <div className="text-2xl">→</div>
              <div className="bg-green-100 dark:bg-green-900 rounded p-3 flex-1 text-center">
                <p className="text-xs text-slate-600 dark:text-slate-300 mb-1">Swap to</p>
                <p className="font-bold text-slate-900 dark:text-white">Ground Turkey</p>
              </div>
            </div>
            <p className="text-sm text-slate-700 dark:text-slate-300 bg-green-50 dark:bg-green-950/40 p-3 rounded text-center font-semibold">
              ✓ Macros stay balanced automatically
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              How it works:
            </p>
            <ol className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
              <li className="flex gap-3">
                <span className="font-bold text-amber-600 flex-shrink-0">1.</span>
                <span>Click any food in your meal</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-amber-600 flex-shrink-0">2.</span>
                <span>Tap "Swap Food"</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-amber-600 flex-shrink-0">3.</span>
                <span>Choose an alternative (same macros)</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-amber-600 flex-shrink-0">4.</span>
                <span>Done — macros auto-adjusted</span>
              </li>
            </ol>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
            This is the flexibility that makes meal plans actually stick.
          </p>
        </div>
      ),
    },
    {
      id: 'tracking',
      title: 'Log Your Weight Weekly',
      subtitle: 'This is how you prove the plan is working',
      content: (
        <div className="space-y-6">
          <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
            <p className="text-sm font-semibold text-slate-900 dark:text-white mb-4">
              Every week, log your weight. We'll track:
            </p>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="text-lg flex-shrink-0">📉</div>
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">Pounds Lost (Trending)</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Real progress over time</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="text-lg flex-shrink-0">🔥</div>
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">Your Consistency Streak</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Days you've logged (discipline builds fast)</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="text-lg flex-shrink-0">📊</div>
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">Progress to Goal</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">How far you've come and how far to go</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4">
            <p className="text-sm text-slate-700 dark:text-slate-300">
              <strong>Pro tip:</strong> Weigh yourself same time every week (Saturday morning is ideal). Your weight fluctuates daily — weekly tracking shows the real trend.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: tier === 'BUILT FOR LIFE' || tier === 'DEDICATED' ? 'checkin' : 'ready',
      title: tier === 'BUILT FOR LIFE' || tier === 'DEDICATED' ? 'Weekly Check-Ins' : "You're All Set",
      subtitle:
        tier === 'BUILT FOR LIFE' || tier === 'DEDICATED'
          ? "I'll coach you personally every week"
          : 'Time to get to work',
      content:
        tier === 'BUILT FOR LIFE' || tier === 'DEDICATED' ? (
          <div className="space-y-6">
            <div className="bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 rounded-lg p-6">
              <p className="text-sm font-semibold text-slate-900 dark:text-white mb-4">
                Every week, answer a quick check-in:
              </p>
              <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300 mb-6">
                <li>• How's the week been going?</li>
                <li>• Any struggles or wins?</li>
                <li>• Questions for your coaching?</li>
              </ul>
              <div className="pt-4 border-t border-purple-200 dark:border-purple-800">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  💬 I reply with personalized feedback based on your progress.
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
                  This is where real coaching happens. Use it.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 rounded-lg p-8 text-center">
              <p className="text-5xl mb-6">🚀</p>
              <p className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                You're ready. Now execute.
              </p>
              <p className="text-sm text-slate-700 dark:text-slate-300 mb-6">
                Your meal plan is personalized to your goals. 
                <br />
                Follow it. Log your weight weekly. Hit your macros.
                <br />
                <strong>Results will follow.</strong>
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 rounded p-3">
                Need help? Email support anytime. But you've got everything you need right here.
              </p>
            </div>
          </div>
        ),
    },
  ];

    const handleNext = async () => {
    if (currentStep === steps.length - 1) {
      // Completed onboarding
      setIsLoading(true);
      try {
        const response = await fetch('/api/complete-onboarding', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ clientId }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Failed to complete onboarding');
        }

        console.log('✅ Onboarding marked complete for client:', clientId);
        onComplete();
      } catch (error) {
        console.error('Error completing onboarding:', error.message);
        setIsLoading(false);
      }
    } else {
      setCurrentStep(currentStep + 1);
    }
  };


    const handleSkip = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/complete-onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to skip onboarding');
      }

      console.log('⏭️ Onboarding skipped for client:', clientId);
      onComplete();
    } catch (error) {
      console.error('Error skipping onboarding:', error.message);
      setIsLoading(false);
    }
  };


  const step = steps[currentStep];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`step-${currentStep}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
        className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center p-4"
      >
        <div className="w-full max-w-2xl">
          {/* Header */}
          <div className="text-center mb-12">
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              <p className="text-sm font-semibold text-amber-600 dark:text-amber-400 mb-4 uppercase tracking-wide">
                Step {currentStep + 1} of {steps.length}
              </p>
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-3">
                {step.title}
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400">
                {step.subtitle}
              </p>
            </motion.div>
          </div>

          {/* Content */}
          <div className="mb-12">{step.content}</div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex gap-2">
              {steps.map((_, i) => (
                <motion.div
                  key={i}
                  layoutId={`progress-${i}`}
                  className={`h-2 flex-1 rounded-full transition-all ${
                    i <= currentStep
                      ? 'bg-amber-600'
                      : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleSkip}
              disabled={isLoading}
              className="flex-1 px-6 py-3 text-slate-700 dark:text-slate-300 font-semibold rounded-lg border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Skip
            </button>
            <button
              onClick={handleNext}
              disabled={isLoading}
              className="flex-1 px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {currentStep === steps.length - 1 ? (
                <>
                  <Check size={18} /> Start Using Plan
                </>
              ) : (
                <>
                  Next <ChevronRight size={18} />
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
