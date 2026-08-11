'use client';

import OnboardingFlow from './components/OnboardingFlow'
import { useState, useEffect, Suspense, useMemo, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import {
  foodDatabase,
  getFoodByName,
  findBestServing,
  getFoodNamesByCategory,
} from '@/lib/foodDatabase';
import FrequencyChangeModal from './components/FrequencyChangeModal';
import PhotoConsentModal from './components/PhotoConsentModal';
import ReferEarnTab from './components/ReferEarnTab';
import MyRewardsTab from '@/app/components/MyRewardsTab';
import SubscriptionGuard from './components/SubscriptionGuard';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

function ClientDashboardPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-black text-white flex items-center justify-center">
          <div className="text-center">
            <div
              className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 mx-auto mb-4"
              style={{ borderColor: '#FFD700' }}
            ></div>
            <p className="text-gray-400">Loading your dashboard...</p>
          </div>
        </main>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}


// ════════════════════════════════════════════════════════════════════════════
// ANALYTICS HELPER
// ════════════════════════════════════════════════════════════════════════════
const recordInteraction = (eventName) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName);
  }
  console.log(`📊 Interaction: ${eventName}`);
};

// ════════════════════════════════════════════════════════════════════════════
// PLAN FEATURES HELPER
// ════════════════════════════════════════════════════════════════════════════
const getPlanFeatures = (planType) => {
  const features = [
    { feature: 'Personalized Meal Plan', included: true },
{ feature: 'Food Swaps (unlimited)', included: true },    { feature: 'Macro Tracking', included: true },
    { feature: 'Weight Logging', included: true },
    { feature: 'Progress Photos', included: planType === 'pro' || planType === 'elite' },
    { feature: 'Weekly Check-ins', included: planType === 'elite' },
    { feature: 'Monthly Check-ins', included: planType === 'pro' },
    { feature: 'Dane\'s Personalized Feedback', included: planType === 'pro' || planType === 'elite' },
    { feature: 'Meal Plan Adjustments', included: planType === 'pro' || planType === 'elite' },
    { feature: 'Email Support', included: planType === 'pro' || planType === 'elite' },
    { feature: 'Priority Support', included: planType === 'elite' },
  ];
  return features;
};

// ════════════════════════════════════════════════════════════════════════════
// WEIGHT TREND HELPER
// ════════════════════════════════════════════════════════════════════════════
const getWeightMessage = (weightLogs, client) => {
  if (!weightLogs || weightLogs.length === 0) return null;
  
  const latestWeight = parseFloat(weightLogs[weightLogs.length - 1].weight_lbs);
  const startWeight = parseFloat(client.current_weight);
  const totalLost = startWeight - latestWeight;
  
  if (totalLost > 0) {
    return {
      emoji: '📉',
      message: `${totalLost.toFixed(1)} lbs lost so far`,
      color: '#22c55e'
    };
  } else if (totalLost === 0) {
    return {
      emoji: '➡️',
      message: 'Keep pushing, next loss coming',
      color: '#3b82f6'
    };
  } else {
    return {
      emoji: '⚡',
      message: 'Small fluctuation, stay consistent',
      color: '#f59e0b'
    };
  }
};

function DashboardContent({ initialClient, initialMealPlan }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  const [planPending, setPlanPending] = useState(false);

  // ── STATE: CORE ─────────────────────────────────────────────────────────
  const [client, setClient] = useState(initialClient || null);
  const [mealPlan, setMealPlan] = useState(initialMealPlan || null);
  const [loading, setLoading] = useState(!initialClient);
  const [error, setError] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('plan');

  // ── STATE: WEIGHT TRACKING ──────────────────────────────────────────────
  const [weightLogs, setWeightLogs] = useState([]);
  const [newWeight, setNewWeight] = useState('');
  const [weightNotes, setWeightNotes] = useState('');
  const [loggingWeight, setLoggingWeight] = useState(false);
  const [weightSuccess, setWeightSuccess] = useState(false);
  const [celebrateWeight, setCelebrateWeight] = useState(false);
  const [showWeightMistakeModal, setShowWeightMistakeModal] = useState(false);
  const [selectedWeightLog, setSelectedWeightLog] = useState(null);
  const [weightCorrectionInput, setWeightCorrectionInput] = useState('');
  const [weightCorrectionReason, setWeightCorrectionReason] = useState('');
  const [weightCorrectionError, setWeightCorrectionError] = useState('');
  const [submittingCorrection, setSubmittingCorrection] = useState(false);

  // ── STATE: STREAKS & PROGRESS ───────────────────────────────────────────
  const [streak, setStreak] = useState(0);
  const [daysOnPlan, setDaysOnPlan] = useState(0);

  // ── STATE: MILESTONES ───────────────────────────────────────────────────
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [currentMilestone, setCurrentMilestone] = useState(null);

  // ── STATE: FOOD SWAPS ───────────────────────────────────────────────────
  const [showSubsModal, setShowSubsModal] = useState(false);
  const [subsModalData, setSubsModalData] = useState(null);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [swapError, setSwapError] = useState('');
  const [swapImpact, setSwapImpact] = useState(null);
  const [showSwapImpactNotif, setShowSwapImpactNotif] = useState(false);
  const [lastSwapUndo, setLastSwapUndo] = useState(null);

  // ── STATE: CHECK-INS ────────────────────────────────────────────────────
  const [checkins, setCheckins] = useState([]);
  const [checkinForm, setCheckinForm] = useState({
    feeling_rating: 0,
    hit_macros: '',
    energy_level: '',
    sleep_quality: '',
    food_swap_requests: '',
    notes_for_dane: '',
  });
  const [submittingCheckin, setSubmittingCheckin] = useState(false);
  const [checkinSuccess, setCheckinSuccess] = useState(false);
  const [checkinError, setCheckinError] = useState('');
  
  // ── DERIVED: Unread coach response count ────────────────────────────────
  const unreadResponseCount = checkins.filter(
    (c) =>
      c.admin_response &&
      (!c.client_viewed_response_at ||
        new Date(c.client_viewed_response_at) < new Date(c.admin_responded_at))
  ).length;

  // ── EFFECT: Mark check-in responses as viewed when tab opens ───────────
  useEffect(() => {
    if (activeTab !== 'checkin' || !client?.id) return;
    if (unreadResponseCount === 0) return;

    const markAsViewed = async () => {
      try {
        await fetch('/api/clients/mark-checkins-viewed', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ clientId: client.id }),
        });

        setCheckins((prev) =>
          prev.map((c) =>
            c.admin_response
              ? { ...c, client_viewed_response_at: new Date().toISOString() }
              : c
          )
        );
      } catch (err) {
        console.error('Error marking check-ins as viewed:', err);
      }
    };

    markAsViewed();
  }, [activeTab, client?.id, unreadResponseCount]);

  // ── STATE: PROGRESS PHOTOS ──────────────────────────────────────────────
  const [progressPhotos, setProgressPhotos] = useState([]);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoUploadError, setPhotoUploadError] = useState('');
  const [photoUploadSuccess, setPhotoUploadSuccess] = useState(false);
  const [lastPhotoDate, setLastPhotoDate] = useState(null);
  const [canUploadPhoto, setCanUploadPhoto] = useState(true);
  const [daysUntilNextUpload, setDaysUntilNextUpload] = useState(0);

  // ── STATE: PLAN CHANGES ─────────────────────────────────────────────────
  const [showPlanChangeModal, setShowPlanChangeModal] = useState(false);
  const [planChangeReason, setPlanChangeReason] = useState('');
  const [submittingPlanChange, setSubmittingPlanChange] = useState(false);
  const [planChangeSuccess, setPlanChangeSuccess] = useState(false);
  const [planChangeError, setPlanChangeError] = useState('');

  // ── STATE: MODALS ───────────────────────────────────────────────────────
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showFrequencyChangeModal, setShowFrequencyChangeModal] = useState(false);

  // ── STATE: UI ───────────────────────────────────────────────────────────
  const [expandedMeal, setExpandedMeal] = useState(null);
  const [downloading, setDownloading] = useState(false);
  // ════════════════════════════════════════════════════════════════════════════
  // HELPER: Calculate consecutive days streak
  // ════════════════════════════════════════════════════════════════════════════
  const calculateStreak = (logs) => {
    if (!logs || logs.length === 0) return 0;
    
    const sortedLogs = [...logs].sort((a, b) => 
      new Date(b.logged_at) - new Date(a.logged_at)
    );
    
    let count = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < sortedLogs.length; i++) {
      const logDate = new Date(sortedLogs[i].logged_at);
      logDate.setHours(0, 0, 0, 0);
      
      const expectedDate = new Date(today);
      expectedDate.setDate(expectedDate.getDate() - i);
      
      if (logDate.getTime() === expectedDate.getTime()) {
        count++;
      } else {
        break;
      }
    }
    
    return count;
  };

  // ════════════════════════════════════════════════════════════════════════════
  // HELPER: Get macro compliance status
  // ════════════════════════════════════════════════════════════════════════════
  const getMacroCompliance = (actual, target) => {
    if (!target || target === 0) return { color: '#666', label: 'N/A' };
    
    const diff = Math.abs(actual - target);
    const pctOff = (diff / target) * 100;
    
    if (pctOff <= 10) {
      return { color: '#22c55e', label: '✅ On Target' };
    } else if (pctOff <= 20) {
      return { color: '#eab308', label: '⚠️ Slightly Off' };
    } else {
      return { color: '#ef4444', label: '❌ Off Target' };
    }
  };

  // ════════════════════════════════════════════════════════════════════════════
  // MEMOIZED: meals array — only recalculates when mealPlan changes
  // ════════════════════════════════════════════════════════════════════════════
  const mealsArray = useMemo(() => {
    if (!mealPlan?.meals_data) return [];

    const mealsData = mealPlan.meals_data;
    const mealsObj = mealsData.meals || mealsData;

    if (typeof mealsObj !== 'object' || Array.isArray(mealsObj)) return [];

    const getMealNumber = key => {
      const match = key.match(/\d+/);
      return match ? parseInt(match[0]) : null;
    };

    return Object.entries(mealsObj)
      .filter(([key]) => getMealNumber(key) !== null)
      .map(([key, data]) => ({
        mealKey: key,
        mealNumber: getMealNumber(key),
        name: key,
        foods: data.foods || [],
        totals: data.totals || {},
        type: data.type || 'balanced',
      }))
      .reduce((unique, meal) => {
        const exists = unique.some(m => m.mealNumber === meal.mealNumber);
        if (!exists) unique.push(meal);
        return unique;
      }, [])
      .sort((a, b) => a.mealNumber - b.mealNumber)
      .map(({ mealKey, name, foods, totals, type }) => ({
        mealKey,
        name,
        foods,
        totals,
        type,
      }));
  }, [mealPlan]);

  // ════════════════════════════════════════════════════════════════════════════
  // MEMOIZED: Calculate today's macro status (uses mealsArray)
  // ════════════════════════════════════════════════════════════════════════════
  const calculateTodaysMacroStatus = useCallback(() => {
    if (!mealPlan || !client) return { status: 'tracking', percentage: 0, message: '' };
    
    const dailyTotals = mealsArray.reduce(
      (acc, meal) => ({
        calories: acc.calories + (meal.totals.calories || 0),
        protein_g: acc.protein_g + (meal.totals.protein_g || 0),
        carbs_g: acc.carbs_g + (meal.totals.carbs_g || 0),
        fats_g: acc.fats_g + (meal.totals.fats_g || 0),
      }),
      { calories: 0, protein_g: 0, carbs_g: 0, fats_g: 0 }
    );

    const targetCals = mealPlan.target_calories || 0;
    const actualCals = dailyTotals.calories;
    const percentage = targetCals > 0 ? (actualCals / targetCals) * 100 : 0;
    
    let status = 'tracking';
    let message = '';
    
    if (percentage >= 95 && percentage <= 105) {
      status = 'on-target';
      message = `💯 Dialed In! ${Math.round(percentage)}%`;
    } else if (percentage < 95) {
      const remaining = Math.round(targetCals - actualCals);
      status = 'under';
      message = `${remaining} cals to go`;
    } else {
      const over = Math.round(actualCals - targetCals);
      status = 'over';
      message = `${over} over target`;
    }
    
    return { status, percentage: Math.min(100, percentage), message, dailyTotals, isOnTarget: status === 'on-target' };
  }, [mealPlan, client, mealsArray]);

  // ════════════════════════════════════════════════════════════════════════════
  // HELPER: Get Dane's daily message
  // ════════════════════════════════════════════════════════════════════════════
  const getDayOfYear = useCallback(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now - start;
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
  }, []);

  const DANE_MESSAGES = [
    "Every meal choice is a step toward your goal. You got this! 💪",
    "Progress isn't always visible on the scale — trust the process.",
    "Your macros are locked in. Now just execute every single day.",
    "Consistency beats intensity. Show up every day, even when it's hard.",
    "Your future self will thank you for the discipline you're showing today.",
    "Food is fuel. Treat it with respect and watch your body respond.",
    "The scale will move. Stay patient, stay disciplined, stay consistent.",
    "You're not on a diet — you're building a lifestyle. Own it.",
    "Your body is changing faster than you think. Trust your plan.",
    "Small daily wins compound into massive transformations.",
    "Hit your macros today. That's all that matters right now.",
    "Your plan is personalized to YOU. Follow it and results will come.",
    "Every logged weight, every meal logged — that's progress.",
    "Discipline is choosing what you want most over what you want now.",
    "You're one day closer to your goal. Make today count.",
    "Macro accuracy = faster results. Get it done.",
    "Your body doesn't lie. The numbers will show your hard work.",
    "The best plan is the one you'll actually follow. You're following it.",
    "Challenge yourself to hit your macros 6 days this week.",
    "You're not just losing weight — you're gaining discipline and control.",
    "Your meals are designed perfectly for your body. Trust them.",
    "Consistency is the secret nobody wants to hear about.",
    "The only bad meal plan is the one you don't follow.",
    "You're stronger than your cravings. Prove it today.",
    "Every check-in, every photo, every log is evidence of your commitment.",
    "Your macros are your blueprint. Let's build something amazing!",
    "Change doesn't happen overnight, but it IS happening.",
    "Stop wishing and start doing. Your plan is ready. Execute.",
    "The discipline you build today becomes your superpower tomorrow.",
    "You've got 24 hours to crush your macros. Let's go. 🔥",
  ];

  const getDaneMessage = useCallback(() => {
    const dayOfYear = getDayOfYear();
    return DANE_MESSAGES[dayOfYear % DANE_MESSAGES.length];
  }, [getDayOfYear]);

  // ════════════════════════════════════════════════════════════════════════════
  // HELPER: Get streak badge
  // ════════════════════════════════════════════════════════════════════════════
  const getStreakBadge = useCallback(() => {
    if (streak >= 30) return { emoji: '🔥', label: 'On Fire', color: '#ef4444' };
    if (streak >= 14) return { emoji: '⚡', label: 'Rolling', color: '#f59e0b' };
    if (streak >= 7) return { emoji: '💪', label: 'Strong', color: '#3b82f6' };
    if (streak >= 3) return { emoji: '✅', label: 'Going', color: '#22c55e' };
    return { emoji: '🌱', label: 'Starting', color: '#6366f1' };
  }, [streak]);

  // ════════════════════════════════════════════════════════════════════════════
  // HELPER: Get next action CTA
  // ════════════════════════════════════════════════════════════════════════════
  const getNextAction = useCallback(() => {
    if (!client || !mealPlan) return null;
    
    if (weightLogs.length === 0) {
      return { action: 'Log Weight', emoji: '⚖️', description: 'Start tracking your progress', tab: 'progress' };
    }
    
    if (mealsArray.length === 0) {
      return { action: 'View Meals', emoji: '🍽️', description: 'Check out your meal plan', tab: 'plan' };
    }
    
    if (progressPhotos.length === 0 && (client.plan_type?.toLowerCase() === 'pro' || client.plan_type?.toLowerCase() === 'elite')) {
      return { action: 'Upload Photo', emoji: '📸', description: 'Show off your progress', tab: 'photos' };
    }
    
    if (checkins.length === 0 && (client.plan_type?.toLowerCase() === 'pro' || client.plan_type?.toLowerCase() === 'elite')) {
      return { action: 'Check In', emoji: '💬', description: 'Get feedback from Dane', tab: 'checkin' };
    }
    
    return null;
  }, [client, mealPlan, weightLogs.length, mealsArray.length, progressPhotos.length, checkins.length]);

  // ════════════════════════════════════════════════════════════════════════════
  // HELPER: Calculate progress to goal
  // ════════════════════════════════════════════════════════════════════════════
  const getProgressToGoal = useCallback(() => {
    if (!client || weightLogs.length === 0) return { percentage: 0, lostSoFar: 0, toGo: 0 };
    
    const startWeight = parseFloat(client.current_weight) || 0;
    const goalWeight = parseFloat(client.goal_weight) || 0;
    const latestWeight = parseFloat(weightLogs[weightLogs.length - 1].weight_lbs) || startWeight;
    
    const totalToLose = startWeight - goalWeight;
    const totalLost = startWeight - latestWeight;
    const percentage = totalToLose > 0 ? Math.min(100, (totalLost / totalToLose) * 100) : 0;
    
    return { percentage, lostSoFar: totalLost.toFixed(1), toGo: (totalToLose - totalLost).toFixed(1) };
  }, [client, weightLogs]);

  // ════════════════════════════════════════════════════════════════════════════
  // HELPER: Get selected foods
  // ════════════════════════════════════════════════════════════════════════════
  const getSelectedFoods = useCallback(() => {
    if (!client?.selected_foods) {
      return [];
    }
    try {
      let foods = client.selected_foods;

      if (typeof foods === 'string') {
        foods = JSON.parse(foods);
      }

      if (Array.isArray(foods)) {
        return foods
          .map(f => {
            if (typeof f === 'object' && f !== null && f.name) return f.name;
            if (typeof f === 'string') return f;
            return null;
          })
          .filter(Boolean);
      }

      if (typeof foods === 'object' && foods !== null) {
        const allFoods = [];
        Object.values(foods).forEach(categoryFoods => {
          if (Array.isArray(categoryFoods)) {
            categoryFoods.forEach(f => {
              if (typeof f === 'string') allFoods.push(f);
              else if (typeof f === 'object' && f?.name) allFoods.push(f.name);
            });
          }
        });
        return allFoods;
      }

      return [];
    } catch (e) {
      console.error('Error parsing selected_foods:', e);
      return [];
    }
  }, [client?.selected_foods]);

  // ════════════════════════════════════════════════════════════════════════════
  // HANDLER: Logout — SINGLE SOURCE OF TRUTH
  // ════════════════════════════════════════════════════════════════════════════
  const handleLogout = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error('Logout error:', e);
    } finally {
      localStorage.removeItem('clientId');
      localStorage.removeItem('authToken');
      window.location.href = '/';
    }
  }, []);
  // ════════════════════════════════════════════════════════════════════════════
  // HANDLER: Log weight
  // ════════════════════════════════════════════════════════════════════════════
  const handleLogWeight = async () => {
    if (!newWeight || !client) return;
    setLoggingWeight(true);

    try {
      const response = await fetch('/api/clients/log-weight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: client.id,
          weight_lbs: parseFloat(newWeight),
          notes: weightNotes,
        }),
      });

      const data = await response.json();
      if (data.success) {
        recordInteraction('weight_logged');
        const updatedLogs = [...weightLogs, data.log];
        setWeightLogs(updatedLogs);

        const newStreak = calculateStreak(updatedLogs);
        setStreak(newStreak);

        // ✅ FIX: Only check milestones on NEW weight log, not on page load
        checkMilestones(updatedLogs, client);
        setNewWeight('');
        setWeightNotes('');
        setWeightSuccess(true);
        setCelebrateWeight(true);
        setTimeout(() => setWeightSuccess(false), 3000);
        setTimeout(() => setCelebrateWeight(false), 2000);
      }
    } catch (err) {
      console.error('Error logging weight:', err);
    } finally {
      setLoggingWeight(false);
    }
  };

  // ════════════════════════════════════════════════════════════════════════════
  // HANDLER: Report weight mistake
  // ════════════════════════════════════════════════════════════════════════════
  const handleReportWeightMistake = (log) => {
    setSelectedWeightLog(log);
    setWeightCorrectionInput('');
    setWeightCorrectionReason('');
    setWeightCorrectionError('');
    setShowWeightMistakeModal(true);
  };

  // ════════════════════════════════════════════════════════════════════════════
  // HANDLER: Submit weight correction
  // ════════════════════════════════════════════════════════════════════════════
  const handleSubmitWeightCorrection = async () => {
    if (!weightCorrectionInput) {
      setWeightCorrectionError('Please enter the correct weight');
      return;
    }

    const correctedWeight = parseFloat(weightCorrectionInput);
    const originalWeight = parseFloat(selectedWeightLog.weight_lbs);

    if (correctedWeight === originalWeight) {
      setWeightCorrectionError('Corrected weight must be different from original');
      return;
    }

    if (correctedWeight < 50 || correctedWeight > 600) {
      setWeightCorrectionError('Weight must be between 50 and 600 lbs');
      return;
    }

    setSubmittingCorrection(true);
    setWeightCorrectionError('');

    try {
      const response = await fetch('/api/clients/report-weight-error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: client.id,
          weightLogId: selectedWeightLog.id,
          originalWeight: originalWeight,
          correctedWeight: correctedWeight,
          reason: weightCorrectionReason || 'Client reported error',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit report');
      }

      recordInteraction('weight_correction_submitted');
      setShowWeightMistakeModal(false);
      setWeightCorrectionInput('');
      setWeightCorrectionReason('');
      alert('✅ Mistake reported! Dane will review and correct this within 24 hours.');
    } catch (error) {
      console.error('Weight correction error:', error);
      setWeightCorrectionError(error.message || 'Failed to report error');
    } finally {
      setSubmittingCorrection(false);
    }
  };

  // ════════════════════════════════════════════════════════════════════════════
  // HANDLER: Check photo upload status
  // ════════════════════════════════════════════════════════════════════════════
  const checkPhotoUploadStatus = photos => {
    if (photos.length === 0) {
      setCanUploadPhoto(true);
      setLastPhotoDate(null);
      setDaysUntilNextUpload(0);
      return;
    }

    const sortedPhotos = [...photos].sort(
      (a, b) => new Date(b.uploaded_at) - new Date(a.uploaded_at)
    );
    const latestPhotoDate = new Date(sortedPhotos[0].uploaded_at);
    const today = new Date();
    const daysSinceLastUpload = Math.floor(
      (today - latestPhotoDate) / (1000 * 60 * 60 * 24)
    );

    setLastPhotoDate(latestPhotoDate);

    if (daysSinceLastUpload >= 7) {
      setCanUploadPhoto(true);
      setDaysUntilNextUpload(0);
    } else {
      setCanUploadPhoto(false);
      setDaysUntilNextUpload(7 - daysSinceLastUpload);
    }
  };

  // ════════════════════════════════════════════════════════════════════════════
  // HANDLER: Upload progress photo
  // ════════════════════════════════════════════════════════════════════════════
  const handleUploadProgressPhoto = async file => {
    if (!client || !file) return;
    if (!canUploadPhoto) {
      setPhotoUploadError(
        `You can upload again in ${daysUntilNextUpload} days`
      );
      return;
    }

    setUploadingPhoto(true);
    setPhotoUploadError('');

    try {
      const sanitizeFileName = (name) => {
        const parts = name.split('.');
        const ext = parts.length > 1 ? parts[parts.length - 1] : 'jpg';
        const timestamp = Date.now();
        const clientIdShort = client.id.substring(0, 8);
        return `progress_${clientIdShort}_${timestamp}.${ext.toLowerCase()}`;
      };

      const finalFileName = sanitizeFileName(file.name);
      const sanitizedFile = new File([file], finalFileName, { type: file.type });

      const formData = new FormData();
      formData.append('file', sanitizedFile);
      formData.append('clientId', client.id);

      console.log(`📸 Uploading photo as: ${finalFileName}`);

      const response = await fetch(
        '/api/clients/upload-progress-photo-server',
        {
          method: 'POST',
          body: formData,
        }
      );

      const text = await response.text();
      const data = JSON.parse(text);

      if (data.success) {
        recordInteraction('photo_uploaded');
        const updatedPhotos = [data.photo, ...progressPhotos];
        setProgressPhotos(updatedPhotos);
        checkPhotoUploadStatus(updatedPhotos);
        setPhotoUploadSuccess(true);
        setTimeout(() => setPhotoUploadSuccess(false), 3000);
      } else {
        throw new Error(data.error || 'Upload failed');
      }
    } catch (err) {
      console.error('Error uploading photo:', err);
      setPhotoUploadError('Error uploading photo: ' + err.message);
    } finally {
      setUploadingPhoto(false);
    }
  };

  // ════════════════════════════════════════════════════════════════════════════
  // HANDLER: Submit check-in
  // ════════════════════════════════════════════════════════════════════════════
  const handleSubmitCheckin = async () => {
    if (!client) return;
    if (
      !checkinForm.feeling_rating ||
      !checkinForm.hit_macros ||
      !checkinForm.energy_level ||
      !checkinForm.sleep_quality
    ) {
      setCheckinError('Please fill in all required fields');
      return;
    }

    setSubmittingCheckin(true);
    setCheckinError('');

    try {
      const response = await fetch('/api/clients/submit-checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: client.id,
          clientName: client.full_name,
          planType: client.plan_type,
          feeling_rating: parseInt(checkinForm.feeling_rating) || 0,
          hit_macros: String(checkinForm.hit_macros).toLowerCase().trim(),
          energy_level: String(checkinForm.energy_level).toLowerCase().trim(),
          sleep_quality: String(checkinForm.sleep_quality).toLowerCase().trim(),
          food_swap_requests: String(checkinForm.food_swap_requests).trim(),
          notes_for_dane: String(checkinForm.notes_for_dane).trim(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        recordInteraction('checkin_submitted');
        setCheckins([data.checkin, ...checkins]);
        setCheckinForm({
          feeling_rating: 0,
          hit_macros: '',
          energy_level: '',
          sleep_quality: '',
          food_swap_requests: '',
          notes_for_dane: '',
        });
        setCheckinSuccess(true);
        setTimeout(() => setCheckinSuccess(false), 4000);
      } else {
        setCheckinError(data.error || 'Failed to submit check-in');
      }
    } catch (err) {
      console.error('Check-in error:', err);
      setCheckinError('Error submitting check-in: ' + err.message);
    } finally {
      setSubmittingCheckin(false);
    }
  };

  // ════════════════════════════════════════════════════════════════════════════
  // HANDLER: Submit plan change request
  // ════════════════════════════════════════════════════════════════════════════
  const handleSubmitPlanChange = async () => {
    if (!planChangeReason.trim()) {
      setPlanChangeError('Please provide a reason for the plan change');
      return;
    }

    if (!client?.id) {
      setPlanChangeError('Error: Could not find client ID');
      return;
    }

    setSubmittingPlanChange(true);
    setPlanChangeError('');

    try {
      const response = await fetch('/api/request-plan-change', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: client.id,
          clientName: client.full_name,
          planType: client.plan_type,
          reason: planChangeReason.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setPlanChangeError(data.error || 'Failed to submit request');
        setSubmittingPlanChange(false);
        return;
      }

      setPlanChangeSuccess(true);
      setPlanChangeReason('');
      setTimeout(() => {
        setPlanChangeSuccess(false);
        setShowPlanChangeModal(false);
      }, 3000);
    } catch (error) {
      console.error('Error:', error);
      setPlanChangeError('Error submitting request: ' + error.message);
    } finally {
      setSubmittingPlanChange(false);
    }
  };

  // ════════════════════════════════════════════════════════════════════════════
  // HANDLER: Download PDF
  // ════════════════════════════════════════════════════════════════════════════
  const handleDownloadPDF = async () => {
    if (!mealPlan || !client) return;
    setDownloading(true);
    setError('');

    try {
      const response = await fetch('/api/download-meal-plan-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: client.id,
          clientName: client.full_name,
          mealPlan: mealPlan,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.error || 'Failed to generate PDF');
        return;
      }

      const blob = await response.blob();
      if (blob.size === 0) {
        setError('PDF is empty');
        return;
      }

      recordInteraction('pdf_downloaded');
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = client.full_name + '-meal-plan.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Error downloading PDF: ' + err.message);
    } finally {
      setDownloading(false);
    }
  };

  // ════════════════════════════════════════════════════════════════════════════
  // HANDLER: Check milestones
  // ════════════════════════════════════════════════════════════════════════════
  const checkMilestones = (logs, clientData) => {
    if (!logs.length || !clientData) return;
    const startWeight = parseFloat(clientData.current_weight);
    const goalWeight = parseFloat(clientData.goal_weight);
    const latestWeight = parseFloat(logs[logs.length - 1].weight_lbs);
    const totalLost = startWeight - latestWeight;
    const totalToLose = startWeight - goalWeight;

    let milestoneData = null;

    if (latestWeight <= goalWeight) {
      milestoneData = { 
        title: 'You Reached Your Goal Weight! 🏆',
        message: 'This is the moment we trained for. You did it. Be proud.',
        emoji: '🏆',
        color: '#FFD700'
      };
    } else if (totalLost >= totalToLose * 0.75) {
      milestoneData = { 
        title: '75% of the Way! 🔥',
        message: 'You\'re in the final stretch. The finish line is in sight.',
        emoji: '🔥',
        color: '#FFA500'
      };
    } else if (totalLost >= totalToLose * 0.5) {
      milestoneData = { 
        title: 'Halfway There! 💪',
        message: 'You\'ve hit the halfway point. Half the battle is done — keep pushing.',
        emoji: '💪',
        color: '#ef4444'
      };
    } else if (totalLost >= 10) {
      milestoneData = { 
        title: '10+ Pounds Lost! ⭐',
        message: 'Double digits. That\'s real, measurable progress. Keep it up.',
        emoji: '⭐',
        color: '#3b82f6'
      };
    } else if (totalLost >= 5) {
      milestoneData = { 
        title: 'First 5 Pounds! 🎉',
        message: 'You\'ve officially started your transformation. This is just the beginning.',
        emoji: '🎉',
        color: '#a855f7'
      };
    } else if (totalLost >= 1) {
      milestoneData = { 
        title: 'First Pound Down! ✅',
        message: 'One pound is momentum. Let\'s keep this going.',
        emoji: '✅',
        color: '#22c55e'
      };
    }

    if (milestoneData) {
      setCurrentMilestone(milestoneData);
      setShowMilestoneModal(true);
    }
  };

  // ════════════════════════════════════════════════════════════════════════════
  // HANDLER: Open swap modal
  // ════════════════════════════════════════════════════════════════════════════
  const openSubsModal = (food, mealIndex) => {
    try {
      const targetCalories = food.calories || 0;

      const categoryMap = {
        'Protein': 'proteins',
        'Carbs': 'carbs',
        'Healthy Fats': 'fats',
        'Vegetables': 'vegetables',
        'Fruits': 'fruits',
      };

      const categoryKey = categoryMap[food.category];
      const allFoodsInCategory = categoryKey ? foodDatabase[categoryKey] || [] : [];

      const selectedFoods = getSelectedFoods();
      const selectedFoodNames = selectedFoods.map(f => {
        const name = typeof f === 'object' && f.name ? f.name : String(f);
        return name.toLowerCase();
      });

      const yourPicksRaw = allFoodsInCategory
        .filter(foodItem =>
          selectedFoodNames.includes(foodItem.name.toLowerCase())
        )
        .map(foodItem => {
          const calculated = findBestServing(foodItem.name, targetCalories, 20);
          if (!calculated) return null;
          return {
            name: foodItem.name,
            category: foodItem.category,
            portion: calculated.size,
            calories: calculated.calories,
            protein: calculated.protein,
            carbs: calculated.carbs,
            fats: calculated.fats,
            interpolated: calculated.interpolated || false,
          };
        })
        .filter(Boolean);

      const otherOptionsRaw = allFoodsInCategory
        .filter(foodItem =>
          !selectedFoodNames.includes(foodItem.name.toLowerCase())
        )
        .map(foodItem => {
          const calculated = findBestServing(foodItem.name, targetCalories, 20);
          if (!calculated) return null;
          return {
            name: foodItem.name,
            category: foodItem.category,
            portion: calculated.size,
            calories: calculated.calories,
            protein: calculated.protein,
            carbs: calculated.carbs,
            fats: calculated.fats,
            interpolated: calculated.interpolated || false,
          };
        })
        .filter(Boolean);

      setSubsModalData({
        food,
        yourPicksRaw,
        otherOptionsRaw,
        currentFoodCalories: targetCalories,
        category: food.category,
        selectedFoodNames,
        mealIndex,
      });

      setShowSubsModal(true);
      setShowMoreOptions(false);
      recordInteraction('swap_modal_opened');
    } catch (err) {
      console.error('Error opening swap modal:', err);
    }
  };

  // ════════════════════════════════════════════════════════════════════════════
  // HANDLER: Swap food
  // ════════════════════════════════════════════════════════════════════════════
  const handleSwapSingleFood = async (currentFood, newFood, mealIndex) => {
    if (!mealPlan || !client) return;

    setShowSubsModal(false);
    setSwapError('');

    try {
      const mealToUpdate = mealsArray[mealIndex];
      if (!mealToUpdate) return;

      const mealKey = mealToUpdate.mealKey;
      let mealsObj = mealPlan.meals_data.meals
        ? mealPlan.meals_data.meals
        : mealPlan.meals_data;

      const currentMeal = mealsObj[mealKey];
      if (!currentMeal) return;

      const beforeMealPlan = JSON.parse(JSON.stringify(mealPlan));

      console.log(`🔄 Swapping: ${currentFood.name} → ${newFood.name}`);

      const response = await fetch('/api/clients/swap-meal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: client.id,
          mealIndex,
          currentMeal,
          allMeals: mealsObj,
          selectedFoods: client.selected_foods,
          swappedFoodName: currentFood.name,
          newFoodName: newFood.name,
          targetCalories: mealPlan.target_calories || 2000,
          targetProtein: mealPlan.target_protein_g || 150,
          targetCarbs: mealPlan.target_carbs_g || 200,
          targetFats: mealPlan.target_fats_g || 65,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to swap food');
      }

      const { allMeals: calibratedMeals } = await response.json();

      const updatedMealPlan = JSON.parse(JSON.stringify(mealPlan));
      let updatedMealsObj = updatedMealPlan.meals_data.meals
        ? updatedMealPlan.meals_data.meals
        : updatedMealPlan.meals_data;

      Object.keys(calibratedMeals).forEach(key => {
        updatedMealsObj[key] = calibratedMeals[key];
      });

      let finalTotals = { calories: 0, protein_g: 0, carbs_g: 0, fats_g: 0 };
      Object.values(updatedMealsObj).forEach(meal => {
        if (meal.totals) {
          finalTotals.calories += meal.totals.calories || 0;
          finalTotals.protein_g += meal.totals.protein_g || 0;
          finalTotals.carbs_g += meal.totals.carbs_g || 0;
          finalTotals.fats_g += meal.totals.fats_g || 0;
        }
      });

      console.log(`✅ Final totals after swap:`);
      console.log(`Targets: Cal=${Math.round(mealPlan.target_calories || 2000)} P=${mealPlan.target_protein_g || 150}g C=${mealPlan.target_carbs_g || 200}g F=${mealPlan.target_fats_g || 65}g`);
      console.log(`Actuals: Cal=${Math.round(finalTotals.calories)} P=${finalTotals.protein_g}g C=${finalTotals.carbs_g}g F=${finalTotals.fats_g}g`);

      setMealPlan(updatedMealPlan);
      setLastSwapUndo(beforeMealPlan);

      const newMealData = calibratedMeals[mealKey];
      setSwapImpact({
        oldFood: currentFood.name,
        newFood: newFood.name,
        proteinDiff: Math.round((newMealData.totals.protein_g - currentMeal.totals.protein_g) * 10) / 10,
        carbsDiff: Math.round((newMealData.totals.carbs_g - currentMeal.totals.carbs_g) * 10) / 10,
        fatsDiff: Math.round((newMealData.totals.fats_g - currentMeal.totals.fats_g) * 10) / 10,
      });

      setShowSwapImpactNotif(true);
      recordInteraction('food_swapped');
      setTimeout(() => setShowSwapImpactNotif(false), 5000);

      console.log(`✅ Swap complete!`);
    } catch (err) {
      console.error('❌ Error swapping food:', err);
      setSwapError(err.message || 'Failed to swap food. Try again.');
    }
  };

  // ════════════════════════════════════════════════════════════════════════════
  // HANDLER: Undo swap
  // ════════════════════════════════════════════════════════════════════════════
  const handleUndoSwap = () => {
    if (lastSwapUndo) {
      setMealPlan(lastSwapUndo);
      setLastSwapUndo(null);
      setShowSwapImpactNotif(false);
      setSwapError('');
      recordInteraction('swap_undone');
    }
  };
  // ════════════════════════════════════════════════════════════════════════════
  // EFFECT: Load client data on mount
  // ════════════════════════════════════════════════════════════════════════════
  const loadClientData = async clientId => {
    try {
      const [mealResponse, progressResponse] = await Promise.all([
        fetch('/api/get-client-meal-plan?clientId=' + clientId),
        fetch('/api/clients/get-progress?clientId=' + clientId),
      ]);

      const mealData = await mealResponse.json();
      let progressData = {};
      
      if (progressResponse.ok) {
        try {
          progressData = await progressResponse.json();
        } catch (e) {
          console.warn('Progress response was not valid JSON:', e.message);
        }
      }

      if (mealResponse.ok && mealData.success) {
        if (mealData.pending === true || !mealData.mealPlan) {
          setPlanPending(true);
          setClient(mealData.client || null);
          setMealPlan(null);
        } else {
          setPlanPending(false);
          setClient(mealData.client);
          setMealPlan(mealData.mealPlan);
          console.log('🔍 MEAL PLAN meal_pattern:', mealData.mealPlan?.meal_pattern);
        }
      } else {
        setPlanPending(false);
        setClient(mealData.client || null);
        setMealPlan(null);
        if (mealData.error) setError(mealData.error);
      }

      if (progressData && Object.keys(progressData).length > 0) {
        const logs = progressData.weightLogs || [];
        const ciList = progressData.checkIns || progressData.checkins || [];
        const photos = progressData.progressPhotos || [];
        
        setWeightLogs(logs);
        setCheckins(ciList);
        setProgressPhotos(photos);
        
        const calculatedStreak = calculateStreak(logs);
        setStreak(calculatedStreak);
        
        if (mealData.client && mealData.client.created_at) {
          const createdDate = new Date(mealData.client.created_at);
          const today = new Date();
          const daysDiff = Math.floor((today - createdDate) / (1000 * 60 * 60 * 24));
          setDaysOnPlan(Math.max(0, daysDiff));
        }
        
        // ✅ FIX: Removed checkMilestones from here — only call on NEW weight logs
        checkPhotoUploadStatus(photos);
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Error loading data: ' + err.message);
    }
  };

  useEffect(() => {
    if (authenticated) return;

    const verifyAndLoad = async () => {
      setLoading(true);
      const storedClientId = localStorage.getItem('clientId');
      const storedToken = localStorage.getItem('authToken');

      if (storedClientId && storedToken && !token) {
        await loadClientData(storedClientId);
        setAuthenticated(true);
        setLoading(false);
        return;
      }

      if (token) {
        try {
          const response = await fetch('/api/verify-magic-link', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token }),
          });

          const data = await response.json();

          if (!response.ok) {
            setError(data.error || 'Invalid or expired login link');
            setLoading(false);
            return;
          }

          localStorage.setItem('clientId', data.clientId);
          localStorage.setItem('authToken', token);
          await loadClientData(data.clientId);
          setAuthenticated(true);
        } catch (err) {
          console.error('Error verifying login link:', err);
          setError('Error verifying login link: ' + err.message);
        }
      } else {
        setError('Please log in first');
      }

      setLoading(false);
    };

    verifyAndLoad();
  }, []);

  // ════════════════════════════════════════════════════════════════════════════
  // LOADING STATE
  // ════════════════════════════════════════════════════════════════════════════
  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div
            className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 mx-auto mb-4"
            style={{ borderColor: '#FFD700' }}
          ></div>
          <p className="text-gray-400">Loading your dashboard...</p>
        </div>
      </main>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // AUTH ERROR
  // ════════════════════════════════════════════════════════════════════════════
  if (error && !authenticated) {
    return (
      <main className="min-h-screen bg-black text-white py-12 px-4">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4" style={{ color: '#FFD700' }}>
            Access Denied
          </h1>
          <p className="text-gray-400 mb-6">{error}</p>
          <Link href="/">
            <button
              className="text-black font-bold py-3 px-8 rounded-full text-lg"
              style={{ backgroundColor: '#FFD700' }}
            >
              Go to Home
            </button>
          </Link>
        </div>
      </main>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // PLAN PENDING — ✅ FIXED: Broken className corrected
  // ════════════════════════════════════════════════════════════════════════════
  if (!mealPlan || !client || planPending) {
    return (
      <main className="min-h-screen bg-black text-white py-12 px-4 flex items-center justify-center">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full mb-6" style={{ backgroundColor: 'rgba(255, 215, 0, 0.1)' }}>
              <div
                className="animate-spin rounded-full h-16 w-16 border-4 border-gray-700"
                style={{ borderTopColor: '#FFD700' }}
              ></div>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black mb-3" style={{ color: '#FFD700' }}>
              Your Plan is Being Built
            </h1>
            <p className="text-gray-400 text-lg mb-2">
              Dane is personally creating your custom meal plan.
            </p>
            <p className="text-gray-500 text-sm">
              We typically finish within 24 hours. You'll get an email the moment it's ready.
            </p>
          </div>

          <div className="mb-8 max-w-sm mx-auto">
            <div className="relative">
              <div className="flex justify-between text-xs text-gray-500 mb-2">
                <span>Status</span>
                <span>Usually 24 hours</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                <div
                  className="h-2 rounded-full"
                  style={{
                    width: '50%',
                    backgroundColor: '#FFD700',
                    animation: 'pulse 2s infinite',
                  }}
                />
              </div>
            </div>
          </div>

          <div
            className="rounded-xl p-6 border mb-8 text-left"
            style={{
              backgroundColor: 'rgba(255, 215, 0, 0.04)',
              borderColor: '#FFD700',
            }}
          >
            <p className="font-bold text-white mb-4">Here's what Dane is doing:</p>
            <div className="space-y-3">
              {[
                { step: 1, text: 'Analyzing your goals, activity level, and preferences' },
                { step: 2, text: 'Calculating your perfect macro targets' },
                { step: 3, text: 'Building meal combinations with YOUR selected foods' },
                { step: 4, text: 'Creating food swap options for flexibility' },
                { step: 5, text: 'Final review and approval' },
              ].map((item, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{
                      backgroundColor: '#FFD700',
                      color: '#000',
                    }}
                  >
                    {item.step}
                  </div>
                  <p className="text-gray-300 text-sm pt-0.5">{item.text}</p>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="text-black font-bold py-3 px-8 rounded-lg hover:opacity-90 transition cursor-pointer"
            style={{ backgroundColor: '#FFD700' }}
            type="button"
          >
            Logout
          </button>
        </div>
      </main>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // ONBOARDING CHECK
  // ════════════════════════════════════════════════════════════════════════════
  if (client && !client.onboarding_complete) {
    return (
      <OnboardingFlow
        clientId={client.id}
        mealPlan={mealPlan}
        tier={client.tier}
        clientName={client.full_name}
        onComplete={() => setClient({ ...client, onboarding_complete: true })}
      />
    );
  }

    // ════════════════════════════════════════════════════════════════════════════
  // MAIN DASHBOARD RETURN
  // ════════════════════════════════════════════════════════════════════════════
  return (
    <SubscriptionGuard client={client}>
      <main className="min-h-screen bg-black text-white" style={{ paddingBottom: '120px' }}>
        <style>{`
          @keyframes slideDown {
            from {
              opacity: 0;
              transform: translateX(-50%) translateY(-20px);
            }
            to {
              opacity: 1;
              transform: translateX(-50%) translateY(0);
            }
          }
          @keyframes pulse-glow {
            0%, 100% { 
              opacity: 1; 
              box-shadow: 0 0 0 0 rgba(255, 215, 0, 0.7); 
            }
            50% { 
              opacity: 0.95; 
              box-shadow: 0 0 0 15px rgba(255, 215, 0, 0); 
            }
          }
          @keyframes slide-in-up {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          .macro-bar {
            transition: width 0.5s cubic-bezier(0.4, 0.0, 0.2, 1);
          }
          .confetti {
            position: fixed;
            pointer-events: none;
            animation: confetti-fall 2.5s ease-in forwards;
          }
          div::-webkit-scrollbar { display: none; }
        `}</style>

        <div className="max-w-5xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
          {/* HEADER */}
          <div className="flex justify-between items-start gap-3 sm:gap-4 mb-6" style={{ animation: 'slide-in-up 0.5s ease-out' }}>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black leading-tight" style={{ color: '#FFD700' }}>
                {`Let's Crush It,`}
                <br />
                <span className="text-white">{client?.full_name?.split(' ')[0]}!</span>
              </h1>
              <div className="flex flex-wrap gap-2 items-center mt-2">
                <span 
                  className="inline-block text-xs font-bold px-3 py-1.5 rounded-full text-black"
                  style={{ backgroundColor: '#FFD700' }}
                >
                  {client?.plan_type?.toUpperCase()} PLAN
                </span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="text-black font-bold py-2 px-3 sm:px-4 rounded-lg text-xs sm:text-sm flex-shrink-0 hover:opacity-90 transition whitespace-nowrap"
              style={{ backgroundColor: '#FFD700' }}
              type="button"
            >
              Logout
            </button>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-6 p-4 bg-red-900/20 border border-red-700/50 rounded-lg" style={{ animation: 'slide-in-up 0.3s ease-out' }}>
              <p className="text-red-400 text-sm">{error}</p>
              <button
                onClick={() => setError('')}
                className="text-red-400 text-xs mt-2 underline hover:text-red-300 transition"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* DAILY STATUS WIDGET */}
          {(() => {
            const statusData = calculateTodaysMacroStatus();
            const streakBadge = getStreakBadge();
            const progress = getProgressToGoal();
            
            return (
              <div 
                className="mb-6 rounded-2xl p-4 sm:p-6 border-2 overflow-hidden relative"
                style={{
                  backgroundColor: 'rgba(255, 215, 0, 0.04)',
                  borderColor: '#FFD700',
                  animation: statusData.isOnTarget ? 'pulse-glow 2s infinite' : 'none',
                }}
              >
                <div
                  className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-5 blur-3xl"
                  style={{ backgroundColor: '#FFD700' }}
                />
                
                <div className="relative z-10">
                  <div className="flex justify-between items-start gap-4 mb-6">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-2">
                        ⚡ Your Daily Targets
                      </p>
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <p className="text-4xl sm:text-5xl font-black" style={{ color: '#FFD700' }}>
                          {Math.round(statusData.percentage)}%
                        </p>
                        <p className="text-sm sm:text-base text-gray-300 font-semibold">
                          {statusData.message}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-center flex-shrink-0">
                      <p className="text-4xl mb-1">{streakBadge.emoji}</p>
                      <p className="text-xs font-bold text-gray-500">{streak} day</p>
                      <p className="text-xs font-bold" style={{ color: streakBadge.color }}>
                        {streakBadge.label}
                      </p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="w-full bg-gray-800/60 rounded-full h-3 overflow-hidden border border-gray-700/50">
                      <div
                        className="h-3 rounded-full macro-bar"
                        style={{
                          width: Math.min(100, statusData.percentage) + '%',
                          backgroundColor: statusData.isOnTarget ? '#22c55e' : statusData.status === 'over' ? '#ef4444' : '#FFD700',
                        }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2 sm:gap-3 mb-4">
                    {[
                      { label: 'P', value: Math.round(statusData.dailyTotals.protein_g), target: Math.round(mealPlan?.target_protein_g), color: '#ef4444' },
                      { label: 'C', value: Math.round(statusData.dailyTotals.carbs_g), target: Math.round(mealPlan?.target_carbs_g), color: '#3b82f6' },
                      { label: 'F', value: Math.round(statusData.dailyTotals.fats_g), target: Math.round(mealPlan?.target_fats_g), color: '#22c55e' },
                      { label: 'Cal', value: Math.round(statusData.dailyTotals.calories), target: Math.round(mealPlan?.target_calories), color: '#FFD700' },
                    ].map((macro, i) => (
                      <div key={i} className="bg-gray-800/40 rounded-lg p-2.5 sm:p-3 text-center border border-gray-700/30 hover:border-gray-600/60 transition">
                        <p className="text-xs text-gray-500 font-bold mb-1">{macro.label}</p>
                        <p className="text-base sm:text-lg font-black" style={{ color: macro.color }}>
                          {macro.value}
                        </p>
                        <p className="text-xs text-gray-600">/{macro.target}</p>
                      </div>
                    ))}
                  </div>

                  <p className="text-gray-400 text-sm italic text-center font-medium">
                    "{getDaneMessage()}"
                  </p>
                  
                  <p className="text-gray-600 text-xs text-center mt-2">
                    Based on your full meal plan for today
                  </p>
                </div>
              </div>
            );
          })()}


        {/* NEXT ACTION CTA */}
        {(() => {
          const nextAction = getNextAction();
          if (!nextAction) return null;
          
          return (
            <div 
              className="mb-6 p-4 sm:p-5 rounded-xl border-2 cursor-pointer hover:border-yellow-400 transition group"
              style={{
                borderColor: '#FFD700',
                backgroundColor: 'rgba(255, 215, 0, 0.06)',
                animation: 'slide-in-up 0.5s ease-out 0.3s backwards'
              }}
              onClick={() => {
                recordInteraction(`action-${nextAction.tab}`);
                setActiveTab(nextAction.tab);
              }}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-yellow-600 uppercase tracking-wider font-bold mb-1">
                    ⚡ Next Step
                  </p>
                  <p className="text-base sm:text-lg font-bold text-white group-hover:text-yellow-300 transition">
                    {nextAction.emoji} {nextAction.action}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {nextAction.description}
                  </p>
                </div>
                <div className="text-2xl group-hover:translate-x-1 transition flex-shrink-0">→</div>
              </div>
            </div>
          );
        })()}

        {/* PROGRESS TO GOAL */}
        {weightLogs.length > 0 && (() => {
          const progress = getProgressToGoal();
          const weightMsg = getWeightMessage(weightLogs, client);
          
          return (
            <div className="mb-6 p-4 sm:p-5 rounded-xl bg-gray-900/50 border border-gray-800 hover:border-gray-700 transition">
              <div className="flex items-center justify-between gap-4 mb-3">
                <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">
                  🎯 Goal Progress
                </p>
                {weightMsg && (
                  <p className="text-sm font-bold" style={{ color: weightMsg.color }}>
                    {weightMsg.emoji} {weightMsg.message}
                  </p>
                )}
              </div>
              
              <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden mb-3 border border-gray-700/50">
                <div
                  className="h-2 rounded-full macro-bar"
                  style={{
                    width: Math.min(100, progress.percentage) + '%',
                    backgroundColor: progress.percentage >= 100 ? '#FFD700' : '#3b82f6',
                  }}
                />
              </div>
              
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500">
                  {progress.lostSoFar} lbs lost • {progress.toGo} lbs to go
                </span>
                <span className="font-bold text-blue-400">
                  {Math.round(progress.percentage)}% complete
                </span>
              </div>
            </div>
          );
        })()}

        {/* TABS — ✅ FIXED: Horizontal scroll instead of toggle menu */}
        <div className="mb-8">
          <div
            className="flex gap-2 overflow-x-auto pb-2"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {[
              { key: 'plan', label: 'My Plan', emoji: '🍽️' },
              { key: 'progress', label: 'Progress', emoji: '📊' },
              { key: 'photos', label: 'Photos', emoji: '📸' },
              { key: 'checkin', label: 'Coaching', emoji: '💬' },
              { key: 'refer', label: 'Refer & Earn', emoji: '💰' },
              ...(client?.plan_type === 'kickstart'
                ? [{ key: 'upgrade', label: 'Upgrade', emoji: '⬆️' }]
                : []),
              { key: 'rewards', label: 'My Rewards', emoji: '🎁' },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => {
                  recordInteraction(`tab-${tab.key}`);
                  setActiveTab(tab.key);
                }}
                className="relative flex items-center gap-2 px-4 py-2.5 rounded-full font-bold text-sm whitespace-nowrap transition hover:scale-105 flex-shrink-0"
                style={{
                  backgroundColor: activeTab === tab.key ? '#FFD700' : 'rgba(255,215,0,0.1)',
                  color: activeTab === tab.key ? '#000' : '#FFD700',
                  border: activeTab === tab.key
                    ? '2px solid #FFD700'
                    : '2px solid rgba(255,215,0,0.2)',
                }}
              >
                {tab.emoji} <span>{tab.label}</span>
                {tab.key === 'checkin' && unreadResponseCount > 0 && (
                  <span
                    className="absolute -top-1.5 -right-1.5 flex items-center justify-center min-w-[20px] h-5 px-1 rounded-full text-xs font-black text-white"
                    style={{ backgroundColor: '#ef4444' }}
                  >
                    {unreadResponseCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
        {/* UPGRADE TAB — ONLY FOR KICKSTART CLIENTS — ✅ FIXED: Added fallback when no expiry date */}
        {activeTab === 'upgrade' && client?.plan_type === 'kickstart' && (
          <div style={{ animation: 'slide-in-up 0.3s ease-out' }}>

            {/* Timer Card — shows countdown OR fallback if no expiry set */}
            {client.kickstart_upgrade_expires ? (() => {
              const now = new Date();
              const deadline = new Date(client.kickstart_upgrade_expires);
              const daysRemaining = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
              const isExpired = daysRemaining <= 0;

              return (
                <div
                  className="rounded-xl p-6 mb-6 border-2"
                  style={{
                    backgroundColor: isExpired ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)',
                    borderColor: isExpired ? '#ef4444' : '#22c55e',
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div style={{ fontSize: '32px' }}>
                      {isExpired ? '⏰' : '🎯'}
                    </div>
                    <div className="flex-1">
                      <h3
                        className="font-bold text-xl mb-2"
                        style={{ color: isExpired ? '#ef4444' : '#22c55e' }}
                      >
                        {isExpired
                          ? 'Upgrade Window Expired'
                          : `${daysRemaining} Day${daysRemaining === 1 ? '' : 's'} Left to Upgrade`}
                      </h3>
                      <p className="text-gray-300 text-sm mb-4">
                        {isExpired
                          ? 'Your 7-day $67 credit has expired. You can still upgrade at full price.'
                          : `Unlock Pro or Elite features with a $67 credit toward your first month. Offer expires in ${daysRemaining} day${daysRemaining === 1 ? '' : 's'}.`}
                      </p>
                      <Link
                        href={`/upgrade?clientId=${client.id}`}
                        className="inline-block px-6 py-3 rounded-lg font-bold transition hover:opacity-90"
                        style={{ backgroundColor: '#FFD700', color: '#000' }}
                      >
                        {isExpired ? 'Upgrade Now (Full Price)' : 'Upgrade with $67 Credit →'}
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })() : (
              /* Fallback — no expiry date set (existing clients before this feature) */
              <div
                className="rounded-xl p-6 mb-6 border-2"
                style={{
                  backgroundColor: 'rgba(255,215,0,0.08)',
                  borderColor: '#FFD700',
                }}
              >
                <div className="flex items-start gap-4">
                  <div style={{ fontSize: '32px' }}>🚀</div>
                  <div className="flex-1">
                    <h3 className="font-bold text-xl mb-2" style={{ color: '#FFD700' }}>
                      Ready to Upgrade?
                    </h3>
                    <p className="text-gray-300 text-sm mb-4">
                      Unlock Pro or Elite features — monthly/weekly plan updates, coaching check-ins, 
                      progress photo feedback, and priority support. Upgrade now to take your results to the next level!
                    </p>
                    <Link
                      href={`/upgrade?clientId=${client.id}`}
                      className="inline-block px-6 py-3 rounded-lg font-bold transition hover:opacity-90"
                      style={{ backgroundColor: '#FFD700', color: '#000' }}
                    >
                      View Upgrade Options →
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Features Comparison */}
            <div className="rounded-xl p-6 mb-6 border border-yellow-700/30 bg-gray-900/50">
              <h3 className="font-bold text-lg text-white mb-4" style={{ color: '#FFD700' }}>
                🚀 What You'll Unlock
              </h3>
              <div className="space-y-3">
                {[
                  { icon: '📊', title: 'Monthly and Weekly Regeneration', desc: 'Updated meal plan every week or month' },
                  { icon: '💬', title: 'Check-ins & Support', desc: 'Dane personally reviews your progress' },
                  { icon: '📈', title: 'Macro Adjustments', desc: 'Monthly/Weekly tweaks for better results' },
                  { icon: '💰', title: 'Referral Code', desc: 'Earn $40 per friend who signs up for pro or elite' },
                  { icon: '⚡', title: 'Priority Support', desc: 'Get help when you need it' },
                ].map((item, i) => (
                  <div key={i} className="flex gap-3 items-start p-3 bg-black/30 rounded-lg">
                    <span className="text-2xl flex-shrink-0">{item.icon}</span>
                    <div>
                      <p className="font-bold text-white text-sm">{item.title}</p>
                      <p className="text-gray-400 text-xs">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Plan Comparison Table */}
            <div className="rounded-xl p-6 border border-yellow-700/30 bg-gray-900/50">
              <h3 className="font-bold text-lg text-white mb-4" style={{ color: '#FFD700' }}>
                📋 Plan Comparison
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-3 px-3 text-gray-400 font-bold">Feature</th>
                      <th className="text-center py-3 px-3 text-gray-400 font-bold">Kickstart</th>
                      <th className="text-center py-3 px-3 text-gray-400 font-bold">Pro</th>
                      <th className="text-center py-3 px-3 text-gray-400 font-bold">Elite</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { name: 'Custom Meal Plan', kickstart: true, pro: true, elite: true },
                      { name: 'Food Swaps', kickstart: true, pro: true, elite: true },
                      { name: 'Monthly/Weekly Regeneration', kickstart: false, pro: true, elite: true },
                      { name: 'Monthly Check-ins', kickstart: false, pro: true, elite: true },
                      { name: 'Weekly Check-ins', kickstart: false, pro: false, elite: true },
                      { name: 'Direct Support', kickstart: false, pro: true, elite: true },
                      { name: 'Referral Code', kickstart: true, pro: true, elite: true },
                    ].map((row, i) => (
                      <tr key={i} className="border-b border-gray-800 hover:bg-black/20 transition">
                        <td className="py-3 px-3 text-white font-medium">{row.name}</td>
                        <td className="text-center py-3 px-3">
                          {row.kickstart
                            ? <span style={{ color: '#22c55e' }}>✓</span>
                            : <span className="text-gray-600">✗</span>}
                        </td>
                        <td className="text-center py-3 px-3">
                          {row.pro
                            ? <span style={{ color: '#22c55e' }}>✓</span>
                            : <span className="text-gray-600">✗</span>}
                        </td>
                        <td className="text-center py-3 px-3">
                          {row.elite
                            ? <span style={{ color: '#FFD700' }}>✓</span>
                            : <span className="text-gray-600">✗</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* PLAN TAB */}
        {activeTab === 'plan' && (
          <div style={{ animation: 'slide-in-up 0.3s ease-out' }}>
            <div
              className="rounded-xl p-4 sm:p-6 mb-6 border-l-4"
              style={{
                backgroundColor: 'rgba(255,215,0,0.08)',
                borderColor: '#FFD700',
              }}
            >
              <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#FFD700' }}>
                💬 Dane's Message
              </p>
              <p className="text-gray-300 text-sm sm:text-base italic leading-relaxed">
                "{getDaneMessage()}"
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              {[
                { 
                  label: 'Days on Plan', 
                  value: daysOnPlan, 
                  icon: '📅',
                  color: '#3b82f6'
                },
                { 
                  label: 'Weight Lost', 
                  value: client ? (parseFloat(client.current_weight) - parseFloat(weightLogs.length ? weightLogs[weightLogs.length - 1].weight_lbs : client.current_weight)).toFixed(1) + ' lbs' : '0 lbs',
                  icon: '📉',
                  color: '#22c55e'
                },
                { 
                  label: 'Check-ins', 
                  value: checkins.length,
                  icon: '✅',
                  color: '#a855f7'
                },
                { 
                  label: 'Log Streak', 
                  value: streak + ' days',
                  icon: '🔥',
                  color: '#ef4444'
                },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="bg-gray-900 rounded-lg p-4 border border-gray-800 hover:border-gray-700 transition text-center group cursor-default"
                >
                  <p className="text-2xl sm:text-3xl mb-2 group-hover:scale-110 transition">{stat.icon}</p>
                  <p className="text-gray-500 text-xs uppercase tracking-wider mb-1 font-bold">
                    {stat.label}
                  </p>
                  <p className="text-white font-black text-lg" style={{ color: stat.color }}>
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>

            <div
              className="rounded-xl p-6 mb-6 border-l-4"
              style={{
                backgroundColor: 'rgba(255,215,0,0.06)',
                borderColor: '#FFD700',
              }}
            >
              <h2 className="text-lg sm:text-xl font-black mb-2">
                ✅ Your Plan is Ready
              </h2>
              <p className="text-gray-400 text-sm leading-relaxed">
                Dane personally reviewed your goals, body type, and food preferences. This isn't a template — it's <strong>built specifically for you</strong> to get results.
              </p>
            </div>

            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 border border-yellow-700/30 mb-6">
              <h2
                className="text-xl font-black mb-4"
                style={{ color: '#FFD700' }}
              >
                Your Daily Macro Targets
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  {
                    label: 'CALORIES',
                    value: Math.round(mealPlan?.target_calories || 0),
                    unit: 'kcal',
                    color: '#FFD700',
                    icon: '🔥'
                  },
                  {
                    label: 'PROTEIN',
                    value: Math.round(mealPlan?.target_protein_g || 0),
                    unit: 'g',
                    color: '#ef4444',
                    icon: '💪'
                  },
                  {
                    label: 'CARBS',
                    value: Math.round(mealPlan?.target_carbs_g || 0),
                    unit: 'g',
                    color: '#3b82f6',
                    icon: '⚡'
                  },
                  {
                    label: 'FATS',
                    value: Math.round(mealPlan?.target_fats_g || 0),
                    unit: 'g',
                    color: '#22c55e',
                    icon: '🫒'
                  },
                ].map((m, i) => (
                  <div
                    key={i}
                    className="bg-black/40 rounded-lg p-4 text-center border border-gray-700/50 hover:border-gray-600 transition"
                  >
                    <p className="text-2xl mb-2">{m.icon}</p>
                    <p className="text-gray-500 text-xs uppercase tracking-wider mb-1 font-bold">
                      {m.label}
                    </p>
                    <p
                      className="text-3xl font-black"
                      style={{ color: m.color }}
                    >
                      {m.value}
                    </p>
                    <p className="text-gray-600 text-xs mt-1">{m.unit}</p>
                  </div>
                ))}
              </div>
              <p className="text-gray-500 text-xs mt-4 text-center">
                Hit these targets daily. Your meals below show you exactly how.
              </p>
            </div>

            <div className="bg-gray-900 rounded-xl p-6 border border-yellow-700/30 mb-6">
              <h2
                className="text-lg font-black mb-2"
                style={{ color: '#FFD700' }}
              >
                📄 Download Your Complete Plan
              </h2>
              <p className="text-gray-400 text-sm mb-4">
                Get your full PDF with all meals, macros, and food substitution options. Perfect for printing or saving to your phone.
              </p>
              <button
                onClick={() => {
                  recordInteraction('download-pdf');
                  handleDownloadPDF();
                }}
                disabled={downloading}
                className="w-full text-black font-black py-4 px-6 rounded-lg text-base transition hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#FFD700' }}
              >
                {downloading ? '⏳ Generating...' : '⬇️ Download Plan PDF'}
              </button>
            </div>

            {/* MEALS SECTION */}
            {(() => {
              const mealPattern = mealPlan?.meal_pattern || 'balanced';

              const mealTypeColors = {
                performance: '#FFD700',
                balanced: '#4CAF50',
                light: '#2196F3',
              };

              const dailyTotals = mealsArray.reduce(
                (acc, meal) => ({
                  calories: acc.calories + (meal.totals.calories || 0),
                  protein_g: acc.protein_g + (meal.totals.protein_g || 0),
                  carbs_g: acc.carbs_g + (meal.totals.carbs_g || 0),
                  fats_g: acc.fats_g + (meal.totals.fats_g || 0),
                }),
                { calories: 0, protein_g: 0, carbs_g: 0, fats_g: 0 }
              );

              return mealsArray.length > 0 ? (
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2
                      className="text-xl font-black"
                      style={{ color: '#FFD700' }}
                    >
                      🍽️ Your Meals
                    </h2>
                    <span className="text-gray-500 text-xs font-bold">
                      {mealsArray.length} meals/day
                    </span>
                  </div>

                  {/* Daily totals bar */}
                  <div
                    className="rounded-xl p-4 mb-4 border"
                    style={{ backgroundColor: 'rgba(255,215,0,0.04)', borderColor: 'rgba(255,215,0,0.2)' }}
                  >
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-3">
                      Daily Plan Total
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                      {[
                        {
                          label: 'Cal',
                          value: Math.round(dailyTotals.calories),
                          color: '#FFD700',
                        },
                        {
                          label: 'Protein',
                          value: Math.round(dailyTotals.protein_g) + 'g',
                          color: '#ef4444',
                        },
                        {
                          label: 'Carbs',
                          value: Math.round(dailyTotals.carbs_g) + 'g',
                          color: '#3b82f6',
                        },
                        {
                          label: 'Fats',
                          value: Math.round(dailyTotals.fats_g) + 'g',
                          color: '#22c55e',
                        },
                      ].map((m, i) => (
                        <div key={i}>
                          <p className="font-black text-lg" style={{ color: m.color }}>
                            {m.value}
                          </p>
                          <p className="text-gray-600 text-xs">{m.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Meal cards */}
                  <div className="space-y-3">
                    {mealsArray.map((meal, index) => {
                      let mealLabel = 'Balanced';
                      let typeColor = mealTypeColors['balanced'] || '#4CAF50';

                      if (mealPattern === 'heavy-light') {
                        if (index < 3) {
                          mealLabel = 'Heavy';
                          typeColor = '#FFD700';
                        } else {
                          mealLabel = 'Light';
                          typeColor = '#2196F3';
                        }
                      }

                      const isExpanded = expandedMeal === index;

                      return (
                        <div
                          key={meal.mealKey || index}
                          className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden hover:border-gray-700 transition"
                        >
                          <button
                            onClick={() => {
                              recordInteraction('meal-expand');
                              setExpandedMeal(isExpanded ? null : index);
                            }}
                            className="w-full p-4 flex justify-between items-center hover:bg-gray-800/50 transition text-left"
                          >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div
                                className="w-10 h-10 rounded-full flex items-center justify-center font-black text-white text-lg flex-shrink-0"
                                style={{ backgroundColor: typeColor }}
                              >
                                {index + 1}
                              </div>
                              <div className="min-w-0">
                                <h3 className="font-black text-white text-sm sm:text-base">
                                  Meal {index + 1} — {mealLabel}
                                </h3>

                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                  <span
                                    className="text-xs px-2.5 py-0.5 rounded-full font-bold"
                                    style={{
                                      backgroundColor: typeColor + '20',
                                      color: typeColor,
                                    }}
                                  >
                                    {mealLabel}
                                  </span>
                                  <span className="text-gray-500 text-xs font-bold">
                                    {Math.round(meal.totals.calories || 0)} cal
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 ml-2">
                              <div className="hidden sm:flex gap-3 text-xs font-bold">
                                <span style={{ color: '#ef4444' }}>
                                  P: {Math.round(meal.totals.protein_g || 0)}g
                                </span>
                                <span style={{ color: '#3b82f6' }}>
                                  C: {Math.round(meal.totals.carbs_g || 0)}g
                                </span>
                                <span style={{ color: '#eab308' }}>
                                  F: {Math.round(meal.totals.fats_g || 0)}g
                                </span>
                              </div>
                              <span style={{ color: typeColor }} className="text-lg">
                                {isExpanded ? '▼' : '▶'}
                              </span>
                            </div>
                          </button>

                          {isExpanded && (
                            <div className="border-t border-gray-800">
                              {meal.foods && meal.foods.length > 0 ? (
                                <>
                                  {meal.foods.map((food, foodIndex) => {
                                    const catColors = {
                                      'Protein': '#ef4444',
                                      'Carbs': '#3b82f6',
                                      'Vegetables': '#22c55e',
                                      'Healthy Fats': '#eab308',
                                      'Fruits': '#a855f7',
                                    };
                                    const catColor = catColors[food.category] || '#666';
                                    
                                    return (
                                      <div
                                        key={foodIndex}
                                        className="flex flex-col sm:flex-row sm:justify-between sm:items-center px-4 py-3 border-b border-gray-800/50 last:border-b-0 cursor-pointer hover:bg-gray-800/40 transition group"
                                        style={{
                                          backgroundColor:
                                            foodIndex % 2 === 0
                                              ? 'rgba(255,255,255,0.02)'
                                              : 'transparent',
                                        }}
                                        onClick={() => {
                                          recordInteraction('food-swap');
                                          openSubsModal(food, index);
                                        }}
                                      >
                                        <div className="flex items-center gap-3 mb-2 sm:mb-0 flex-1 min-w-0">
                                          <div
                                            className="w-2 h-8 rounded-full flex-shrink-0 group-hover:w-3 transition"
                                            style={{ backgroundColor: catColor }}
                                          />
                                          <div className="min-w-0">
                                            <p className="font-bold text-white text-sm group-hover:text-yellow-300 transition">
                                              {food.name}
                                            </p>
                                            <p className="text-gray-400 text-xs">
                                              {food.portion}
                                            </p>
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-3 justify-between sm:justify-end">
                                          <div className="text-right">
                                            <p
                                              className="font-black text-sm"
                                              style={{ color: '#FFD700' }}
                                            >
                                              {Math.round(food.calories || 0)} cal
                                            </p>
                                            <p className="text-gray-500 text-xs">
                                              P:{Math.round(food.protein_g || 0)}g C:
                                              {Math.round(food.carbs_g || 0)}g F:
                                              {Math.round(food.fats_g || 0)}g
                                            </p>
                                          </div>
                                          <span className="text-gray-500 text-xs hidden sm:inline-block ml-3 group-hover:text-yellow-300 transition whitespace-nowrap">
                                            tap to swap
                                          </span>
                                        </div>
                                      </div>
                                    );
                                  })}

                                  {/* Meal total row */}
                                  <div
                                    className="px-4 py-3 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 font-bold"
                                    style={{ backgroundColor: 'rgba(255,215,0,0.06)' }}
                                  >
                                    <span
                                      className="text-xs uppercase tracking-wider"
                                      style={{ color: typeColor }}
                                    >
                                      Meal Total
                                    </span>
                                    <div className="flex gap-3 text-xs flex-wrap">
                                      <span style={{ color: '#FFD700' }}>
                                        {Math.round(meal.totals.calories || 0)} cal
                                      </span>
                                      <span style={{ color: '#ef4444' }}>
                                        P:{Math.round(meal.totals.protein_g || 0)}g
                                      </span>
                                      <span style={{ color: '#3b82f6' }}>
                                        C:{Math.round(meal.totals.carbs_g || 0)}g
                                      </span>
                                      <span style={{ color: '#eab308' }}>
                                        F:{Math.round(meal.totals.fats_g || 0)}g
                                      </span>
                                    </div>
                                  </div>
                                </>
                              ) : (
                                <p className="text-gray-400 p-4 text-sm">
                                  No foods in this meal
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="mb-6 p-8 bg-gray-900 rounded-xl border border-gray-800 text-center">
                  <p className="text-gray-400">
                    Meal details are available in your PDF download above.
                  </p>
                </div>
              );
            })()}

            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 mb-6 hover:border-gray-700 transition">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h3 className="font-black text-white mb-1">⏰ Change Meal Frequency</h3>
                  <p className="text-gray-500 text-xs leading-relaxed">
                    Want more or fewer meals per day? Change your frequency once weekly. Your macros stay the same — they just split differently.
                  </p>
                </div>
                <button
                  onClick={() => {
                    recordInteraction('frequency-change');
                    setShowFrequencyChangeModal(true);
                  }}
                  className="flex-shrink-0 px-4 py-2.5 border font-black rounded-lg text-sm transition hover:bg-yellow-500/10 whitespace-nowrap"
                  style={{ borderColor: '#FFD700', color: '#FFD700' }}
                >
                  Change Frequency
                </button>
              </div>
            </div>

            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 mb-6 hover:border-gray-700 transition">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h3 className="font-black text-white mb-1">🔄 Request Plan Change</h3>
                  <p className="text-gray-500 text-xs leading-relaxed">
                    Foods not working for you? Send Dane a request. He'll review your reason and decide if a plan change makes sense for your progress.
                  </p>
                </div>
                <button
                  onClick={() => {
                    recordInteraction('plan-change-request');
                    setShowPlanChangeModal(true);
                  }}
                  className="flex-shrink-0 px-4 py-2.5 border font-black rounded-lg text-sm transition hover:bg-yellow-500/10 whitespace-nowrap"
                  style={{ borderColor: '#FFD700', color: '#FFD700' }}
                >
                  Request Change
                </button>
              </div>
            </div>

            <div className="bg-gray-900 rounded-xl p-6 border border-yellow-700/30 mb-6">
              <div className="flex justify-between items-start gap-4 mb-4">
                <div>
                  <h2
                    className="text-lg font-black"
                    style={{ color: '#FFD700' }}
                  >
                    Your {client?.plan_type?.toUpperCase()} Plan
                  </h2>
                  <p className="text-gray-400 text-xs mt-1">
                    {client?.plan_type?.toLowerCase() === 'elite'
                      ? 'Weekly support + unlimited everything'
                      : client?.plan_type?.toLowerCase() === 'pro'
                      ? 'Monthly support + unlimited meal swaps'
                      : 'One-time personalized plan'}
                  </p>
                </div>
                {client?.plan_type?.toLowerCase() === 'kickstart' && (
                  <button
                    onClick={() => {
                      recordInteraction('upgrade-from-plan');
                      setShowUpgradeModal(true);
                    }}
                    className="px-4 py-1.5 border border-yellow-500 text-yellow-500 font-black rounded-lg text-xs hover:bg-yellow-500/10 transition flex-shrink-0"
                  >
                    Upgrade ↑
                  </button>
                )}
              </div>
              <ul className="space-y-2">
                {getPlanFeatures(client?.plan_type).map((f, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    <span className={`mt-0.5 flex-shrink-0 text-lg ${f.included ? 'opacity-100' : 'opacity-40'}`}>
                      {f.included ? '✓' : '○'}
                    </span>
                    <span className={f.included ? 'text-gray-300' : 'text-gray-600'}>
                      {f.feature}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 text-center mb-6">
              <p className="font-bold text-white mb-1">Questions or Need Help?</p>
              <p className="text-gray-400 text-sm mb-4">
                Dane is here to help with anything about your plan.
              </p>
              <a
                href="mailto:dane@buildabod.co"
                className="inline-block px-6 py-2.5 border border-yellow-500 text-yellow-500 font-black rounded-lg hover:bg-yellow-500/10 transition text-sm"
              >
                Contact Dane
              </a>
            </div>
          </div>
        )}

        {/* PROGRESS TAB */}
        {activeTab === 'progress' && (
          <div style={{ animation: 'slide-in-up 0.3s ease-out' }}>
            {(() => {
              const startWeight = parseFloat(client?.current_weight) || 0;
              const goalWeight = parseFloat(client?.goal_weight) || 0;
              const latestWeight = weightLogs.length
                ? parseFloat(weightLogs[weightLogs.length - 1].weight_lbs)
                : startWeight;
              const totalToLose = startWeight - goalWeight;
              const totalLost = startWeight - latestWeight;
              const progressPct =
                totalToLose > 0
                  ? Math.min(100, Math.max(0, (totalLost / totalToLose) * 100))
                  : 0;

              return (
                <div>
                  <div className="bg-gray-900 rounded-xl p-6 border border-yellow-700/30 mb-6">
                    <h2 className="text-xl font-bold mb-4" style={{ color: '#FFD700' }}>
                      Progress Toward Goal
                    </h2>
                    <div className="flex justify-between text-sm mb-2 flex-wrap gap-2">
                      <span className="text-gray-400">
                        Start: <strong className="text-white">{startWeight} lbs</strong>
                      </span>
                      <span className="text-gray-400">
                        Goal: <strong className="text-white">{goalWeight} lbs</strong>
                      </span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-4 mb-2 overflow-hidden">
                      <div
                        className="h-4 rounded-full transition-all duration-700"
                        style={{
                          width: progressPct + '%',
                          background: 'linear-gradient(90deg, #FFD700, #FFA500)',
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 flex-wrap gap-2">
                      <span>{progressPct.toFixed(1)}% complete</span>
                      <span>
                        Current: <strong className="text-white">{latestWeight} lbs</strong>
                      </span>
                    </div>
                    {totalLost > 0 && (
                      <p className="text-center mt-3 font-bold text-sm" style={{ color: '#22c55e' }}>
                        Down {totalLost.toFixed(1)} lbs — {(totalToLose - totalLost).toFixed(1)} lbs to go! 🔥
                      </p>
                    )}
                  </div>

                  <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 mb-6">
                    <h3 className="font-bold mb-4" style={{ color: '#FFD700' }}>
                      Log Your Weight
                    </h3>
                    <div className="flex flex-col sm:flex-row gap-3 mb-3">
                      <input
                        type="number"
                        placeholder="Weight (lbs)"
                        value={newWeight}
                        onChange={e => setNewWeight(e.target.value)}
                        className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-yellow-500"
                        step="0.1"
                        min="50"
                        max="600"
                      />
                      <button
                        onClick={handleLogWeight}
                        disabled={loggingWeight || !newWeight}
                        className="px-5 py-2.5 font-bold rounded-lg text-sm text-black disabled:opacity-50 transition whitespace-nowrap"
                        style={{ backgroundColor: '#FFD700' }}
                      >
                        {loggingWeight ? '...' : 'Log'}
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="Notes (optional)"
                      value={weightNotes}
                      onChange={e => setWeightNotes(e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-yellow-500"
                    />
                    {weightSuccess && (
                      <p className="text-green-400 text-sm mt-3 font-bold">
                        ✅ Weight logged successfully!
                      </p>
                    )}
                  </div>

                  <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 mb-6">
                    <h3 className="font-bold mb-4" style={{ color: '#FFD700' }}>
                      Weight History
                    </h3>
                    {weightLogs.length > 0 ? (
                      <div className="space-y-2">
                        {(() => {
                          const reversed = [...weightLogs].reverse();
                          return reversed.map((log, i) => {
                            const prev = reversed[i + 1];
                            const diff = prev
                              ? parseFloat(log.weight_lbs) - parseFloat(prev.weight_lbs)
                              : 0;
                            const isFirst = i === reversed.length - 1;

                            const logDate = new Date(log.logged_at);
                            const now = new Date();
                            const daysOld = (now - logDate) / (1000 * 60 * 60 * 24);
                            const canReport = daysOld <= 7;

                            return (
                              <div
                                key={log.id || i}
                                className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 py-3 px-3 bg-gray-800/30 rounded-lg border border-gray-700/30 last:mb-0"
                              >
                                <div className="flex-1">
                                  <p className="font-bold text-white text-sm">
                                    {parseFloat(log.weight_lbs).toFixed(1)} lbs
                                  </p>
                                  <p className="text-gray-500 text-xs">
                                    {new Date(log.logged_at).toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                      year: 'numeric',
                                    })}
                                  </p>
                                  {log.notes && (
                                    <p className="text-gray-400 text-xs mt-0.5">{log.notes}</p>
                                  )}
                                </div>
                                <div className="flex items-center gap-3 sm:text-right">
                                  <div>
                                    {isFirst ? (
                                      <span className="text-gray-500 text-xs">Starting weight</span>
                                    ) : diff !== 0 ? (
                                      <span
                                        className="font-bold text-sm block"
                                        style={{ color: diff < 0 ? '#22c55e' : '#ef4444' }}
                                      >
                                        {diff > 0 ? '+' : ''}{diff.toFixed(1)} lbs
                                      </span>
                                    ) : (
                                      <span className="text-gray-500 text-xs">No change</span>
                                    )}
                                  </div>

                                  {canReport && (
                                    <button
                                      onClick={() => handleReportWeightMistake(log)}
                                      className="text-xs px-2.5 py-1.5 rounded bg-red-500/20 border border-red-500/50 text-red-400 hover:bg-red-500/30 transition whitespace-nowrap"
                                      title="Report this entry as a mistake"
                                    >
                                      🗑️ Report
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-4xl mb-3">📊</p>
                        <p className="text-gray-400 text-sm">No weight logs yet.</p>
                        <p className="text-gray-600 text-xs mt-1">
                          Log your first weight above to start tracking!
                        </p>
                      </div>
                    )}
                  </div>

                  {showWeightMistakeModal && (
                    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                      <div className="bg-gray-900 border border-gray-800 rounded-lg max-w-md w-full p-6">
                        <h3 className="font-bold text-lg mb-4" style={{ color: '#FFD700' }}>
                          Report Weight Entry Error
                        </h3>
                        <p className="text-gray-400 text-sm mb-4">
                          Let Dane know about this mistake and he'll correct it:
                        </p>

                        <div className="bg-gray-800/50 p-3 rounded mb-4 text-sm">
                          <p className="text-gray-300">
                            <strong>Current entry:</strong> {selectedWeightLog?.weight_lbs} lbs
                          </p>
                          <p className="text-gray-400 text-xs mt-1">
                            {new Date(selectedWeightLog?.logged_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </p>
                        </div>

                        <div className="mb-4">
                          <label className="block text-sm text-gray-300 mb-2">
                            What should it be?
                          </label>
                          <input
                            type="number"
                            placeholder="Correct weight (lbs)"
                            value={weightCorrectionInput}
                            onChange={e => setWeightCorrectionInput(e.target.value)}
                            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-500"
                            step="0.1"
                            min="50"
                            max="600"
                          />
                        </div>

                        <div className="mb-4">
                          <label className="block text-sm text-gray-300 mb-2">
                            What happened? (optional)
                          </label>
                          <textarea
                            placeholder="e.g., Fat finger, didn't weigh properly,..."
                            value={weightCorrectionReason}
                            onChange={e => setWeightCorrectionReason(e.target.value)}
                            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-500 resize-none"
                            rows="2"
                          />
                        </div>

                        {weightCorrectionError && (
                          <p className="text-red-400 text-sm mb-3">{weightCorrectionError}</p>
                        )}

                        <div className="flex gap-3">
                          <button
                            onClick={() => {
                              setShowWeightMistakeModal(false);
                              setWeightCorrectionInput('');
                              setWeightCorrectionReason('');
                              setWeightCorrectionError('');
                            }}
                            className="flex-1 px-4 py-2 rounded border border-gray-700 text-gray-300 hover:bg-gray-800 transition text-sm font-medium"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleSubmitWeightCorrection}
                            disabled={submittingCorrection || !weightCorrectionInput}
                            className="flex-1 px-4 py-2 rounded text-black font-bold text-sm disabled:opacity-50 transition"
                            style={{ backgroundColor: '#FFD700' }}
                          >
                            {submittingCorrection ? 'Submitting...' : 'Submit Report'}
                          </button>
                        </div>

                        <p className="text-gray-500 text-xs mt-4 text-center">
                          Dane will review and correct this within 24 hours
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        )}

        {/* PHOTOS TAB */}
        {activeTab === 'photos' && (
          <div style={{ animation: 'slide-in-up 0.3s ease-out' }}>
            {(() => {
              const canUpload = client?.plan_type?.toLowerCase() === 'pro' || client?.plan_type?.toLowerCase() === 'elite';

              if (!canUpload) {
                return (
                  <div className="bg-gray-900 rounded-xl p-8 border border-yellow-700/30 text-center">
                    <p className="text-6xl mb-4">📸</p>
                    <h3
                      className="text-2xl sm:text-3xl font-black mb-3"
                      style={{ color: '#FFD700' }}
                    >
                      Get Progress Photo Access
                    </h3>
                    <p className="text-gray-400 mb-4 leading-relaxed">
                      Upload weekly progress photos and get Dane's detailed feedback on your body composition changes.
                    </p>
                    <p className="text-gray-500 text-sm mb-8 leading-relaxed">
                      Photos help Dane track your real progress beyond the scale.
                    </p>

                    <div
                      className="rounded-lg p-6 mb-8 border-l-4"
                      style={{
                        backgroundColor: 'rgba(255,215,0,0.06)',
                        borderColor: '#FFD700',
                      }}
                    >
                      <p className="font-black text-white mb-4">What You Get:</p>
                      <ul className="space-y-2.5 text-sm text-gray-300 text-left max-w-sm mx-auto">
                        <li className="flex items-center gap-3">
                          <span style={{ color: '#FFD700' }} className="text-lg">✓</span> Weekly photo uploads
                        </li>
                        <li className="flex items-center gap-3">
                          <span style={{ color: '#FFD700' }} className="text-lg">✓</span> Dane's feedback on progress
                        </li>
                        <li className="flex items-center gap-3">
                          <span style={{ color: '#FFD700' }} className="text-lg">✓</span> Before/after comparison tracking
                        </li>
                        <li className="flex items-center gap-3">
                          <span style={{ color: '#FFD700' }} className="text-lg">✓</span> Private & secure
                        </li>
                      </ul>
                    </div>

                    <button
                      onClick={() => {
                        recordInteraction('upgrade-to-pro-photos');
                        setShowUpgradeModal(true);
                      }}
                      className="px-8 py-4 font-black rounded-lg text-black text-lg hover:opacity-90 transition"
                      style={{ backgroundColor: '#FFD700' }}
                    >
                      Upgrade to Pro — $127/month
                    </button>
                  </div>
                );
              }

              return (
                <>
                  <div className="bg-gray-900 rounded-xl p-6 border border-yellow-700/30 mb-6">
                    <h2
                      className="text-xl font-black mb-1"
                      style={{ color: '#FFD700' }}
                    >
                      📸 Upload Progress Photo
                    </h2>
                    <p className="text-gray-400 text-sm mb-4">
                      One photo per week. Show off your transformation!
                    </p>

                    <div className="mb-4 p-4 rounded-lg" style={{ backgroundColor: 'rgba(255,215,0,0.05)', borderColor: 'rgba(255,215,0,0.2)', borderWidth: '1px' }}>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleUploadProgressPhoto(e.target.files[0]);
                          }
                        }}
                        disabled={uploadingPhoto}
                        className="w-full text-sm text-gray-400 cursor-pointer"
                      />
                    </div>

                    {photoUploadError && (
                      <p className="text-red-400 text-sm mb-3">{photoUploadError}</p>
                    )}

                    {photoUploadSuccess && (
                      <p className="text-green-400 text-sm mb-3 font-bold">
                        ✅ Photo uploaded successfully!
                      </p>
                    )}

                    {!canUploadPhoto && daysUntilNextUpload > 0 && (
                      <p className="text-gray-400 text-sm">
                        You can upload again in {daysUntilNextUpload} days
                      </p>
                    )}
                  </div>

                  {progressPhotos.length > 0 ? (
                    <div className="mb-6">
                      <h3 className="text-lg font-black mb-4" style={{ color: '#FFD700' }}>
                        📷 Your Progress Photos
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {progressPhotos.map((photo, idx) => (
                          <div key={photo.id || idx} className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
                            {photo.photo_url ? (
                              <img
                                src={photo.photo_url}
                                alt={`Progress photo ${idx + 1}`}
                                className="w-full h-64 object-contain bg-gray-800"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  console.error('Photo failed to load:', photo.photo_url);
                                }}
                              />
                            ) : (
                              <div className="w-full h-48 bg-gray-800 flex items-center justify-center text-gray-500">
                                <p className="text-sm">Photo {idx + 1}</p>
                              </div>
                            )}
                            <div className="p-4">
                              <p className="text-xs text-gray-500 mb-2">
                                {new Date(photo.uploaded_at).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                })}
                              </p>
                              {photo.admin_feedback && (
                                <div className="bg-yellow-900/20 border border-yellow-700/30 rounded p-3 mt-2">
                                  <p className="text-xs text-yellow-500 font-bold mb-1">Dane's Feedback:</p>
                                  <p className="text-xs text-gray-300">{photo.admin_feedback}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-900 rounded-xl p-8 border border-gray-800 text-center">
                      <p className="text-4xl mb-3">📸</p>
                      <p className="text-gray-400 text-sm">No photos yet.</p>
                      <p className="text-gray-600 text-xs mt-1">
                        Upload your first progress photo above!
                      </p>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        )}

        {/* CHECKIN TAB */}
        {activeTab === 'checkin' && (
          <div style={{ animation: 'slide-in-up 0.3s ease-out' }}>
            {(() => {
              const canCheckIn = client?.plan_type?.toLowerCase() === 'pro' || client?.plan_type?.toLowerCase() === 'elite';

              if (!canCheckIn) {
                return (
                  <div className="bg-gray-900 rounded-xl p-8 border border-yellow-700/30 text-center">
                    <p className="text-6xl mb-4">💬</p>
                    <h3
                      className="text-2xl sm:text-3xl font-black mb-3"
                      style={{ color: '#FFD700' }}
                    >
                      Get Weekly Coaching
                    </h3>
                    <p className="text-gray-400 mb-4 leading-relaxed">
                      Submit weekly check-ins and get personalized feedback from Dane on your progress, macros, and next steps.
                    </p>
                    <p className="text-gray-500 text-sm mb-8 leading-relaxed">
                      Stay accountable and make adjustments based on real results.
                    </p>

                    <div
                      className="rounded-lg p-6 mb-8 border-l-4"
                      style={{
                        backgroundColor: 'rgba(255,215,0,0.06)',
                        borderColor: '#FFD700',
                      }}
                    >
                      <p className="font-black text-white mb-4">What You Get:</p>
                      <ul className="space-y-2.5 text-sm text-gray-300 text-left max-w-sm mx-auto">
                        <li className="flex items-center gap-3">
                          <span style={{ color: '#FFD700' }} className="text-lg">✓</span> Weekly check-in prompts
                        </li>
                        <li className="flex items-center gap-3">
                          <span style={{ color: '#FFD700' }} className="text-lg">✓</span> Dane's personalized feedback
                        </li>
                        <li className="flex items-center gap-3">
                          <span style={{ color: '#FFD700' }} className="text-lg">✓</span> Macro and plan adjustments
                        </li>
                        <li className="flex items-center gap-3">
                          <span style={{ color: '#FFD700' }} className="text-lg">✓</span> Accountability partner
                        </li>
                      </ul>
                    </div>

                    <button
                      onClick={() => {
                        recordInteraction('upgrade-to-pro-coaching');
                        setShowUpgradeModal(true);
                      }}
                      className="px-8 py-4 font-black rounded-lg text-black text-lg hover:opacity-90 transition"
                      style={{ backgroundColor: '#FFD700' }}
                    >
                      Upgrade to Pro — $127/month
                    </button>
                  </div>
                );
              }

              return (
                <>
                  <div className="bg-gray-900 rounded-xl p-6 border border-yellow-700/30 mb-6">
                    <h2
                      className="text-xl font-black mb-4"
                      style={{ color: '#FFD700' }}
                    >
                      📝 Weekly Check-in
                    </h2>

                    <div className="mb-5">
                      <label className="block text-sm font-bold text-gray-300 mb-3">
                        How are you feeling about your progress? (1-5)
                      </label>
                      <div className="flex gap-2 flex-wrap">
                        {[1, 2, 3, 4, 5].map(num => (
                          <button
                            key={num}
                            onClick={() => setCheckinForm({ ...checkinForm, feeling_rating: num })}
                            className="w-10 h-10 rounded font-bold transition hover:scale-110"
                            style={{
                              backgroundColor: checkinForm.feeling_rating === num ? '#FFD700' : '#444',
                              color: checkinForm.feeling_rating === num ? '#000' : '#fff',
                            }}
                          >
                            {num}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="mb-5">
                      <label className="block text-sm font-bold text-gray-300 mb-3">
                        Did you hit your macros this week?
                      </label>
                      <div className="flex gap-3 flex-wrap">
                        {['yes', 'mostly', 'no'].map(option => (
                          <button
                            key={option}
                            onClick={() => setCheckinForm({ ...checkinForm, hit_macros: option })}
                            className="px-4 py-2 rounded font-bold text-sm transition capitalize"
                            style={{
                              backgroundColor: checkinForm.hit_macros === option ? '#FFD700' : '#444',
                              color: checkinForm.hit_macros === option ? '#000' : '#fff',
                            }}
                          >
                            {option === 'yes' ? '✅ Yes' : option === 'mostly' ? '⚠️ Mostly' : '❌ No'}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="mb-5">
                      <label className="block text-sm font-bold text-gray-300 mb-3">
                        Energy level this week?
                      </label>
                      <div className="flex gap-3 flex-wrap">
                        {['high', 'normal', 'low'].map(option => (
                          <button
                            key={option}
                            onClick={() => setCheckinForm({ ...checkinForm, energy_level: option })}
                            className="px-4 py-2 rounded font-bold text-sm transition capitalize"
                            style={{
                              backgroundColor: checkinForm.energy_level === option ? '#FFD700' : '#444',
                              color: checkinForm.energy_level === option ? '#000' : '#fff',
                            }}
                          >
                            {option === 'high' ? '🚀 High' : option === 'normal' ? '⚡ Normal' : '😴 Low'}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="mb-5">
                      <label className="block text-sm font-bold text-gray-300 mb-3">
                        Sleep quality this week?
                      </label>
                      <div className="flex gap-3 flex-wrap">
                        {['poor', 'ok', 'great'].map(option => (
                          <button
                            key={option}
                            onClick={() => setCheckinForm({ ...checkinForm, sleep_quality: option })}
                            className="px-4 py-2 rounded font-bold text-sm transition capitalize"
                            style={{
                              backgroundColor: checkinForm.sleep_quality === option ? '#FFD700' : '#444',
                              color: checkinForm.sleep_quality === option ? '#000' : '#fff',
                            }}
                          >
                            {option === 'poor' ? '😴 Poor' : option === 'ok' ? '😌 OK' : '🌟 Great'}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="mb-5">
                      <label className="block text-sm font-bold text-gray-300 mb-2">
                        Any foods not working for you? (optional)
                      </label>
                      <textarea
                        placeholder="e.g., Chicken is boring, want more spice..."
                        value={checkinForm.food_swap_requests}
                        onChange={e => setCheckinForm({ ...checkinForm, food_swap_requests: e.target.value })}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-yellow-500 resize-none"
                        rows="2"
                      />
                    </div>

                    <div className="mb-5">
                      <label className="block text-sm font-bold text-gray-300 mb-2">
                        Anything else for Dane? (optional)
                      </label>
                      <textarea
                        placeholder="Questions, concerns, wins, anything else..."
                        value={checkinForm.notes_for_dane}
                        onChange={e => setCheckinForm({ ...checkinForm, notes_for_dane: e.target.value })}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-yellow-500 resize-none"
                        rows="3"
                      />
                    </div>

                    {checkinError && (
                      <p className="text-red-400 text-sm mb-4">{checkinError}</p>
                    )}

                    {checkinSuccess && (
                      <p className="text-green-400 text-sm mb-4 font-bold">
                        ✅ Check-in submitted! Dane will review and respond soon.
                      </p>
                    )}

                    <button
                      onClick={handleSubmitCheckin}
                      disabled={submittingCheckin}
                      className="w-full text-black font-black py-3 px-6 rounded-lg text-base transition hover:opacity-90 disabled:opacity-50"
                      style={{ backgroundColor: '#FFD700' }}
                    >
                      {submittingCheckin ? '⏳ Submitting...' : '✅ Submit Check-in'}
                                    </button>
                  </div>

                  {checkins.length > 0 ? (
                    <div className="mb-6">
                      <h3 className="text-lg font-black mb-4" style={{ color: '#FFD700' }}>
                        📋 Your Check-ins
                      </h3>
                      <div className="space-y-4">
                        {checkins.map((checkin, idx) => (
                          <div key={checkin.id || idx} className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                            <div className="flex justify-between items-start gap-4 mb-4">
                              <div>
                                <p className="text-xs text-gray-500 mb-1">
                                  {new Date(checkin.created_at).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                  })}
                                </p>
                                <div className="flex gap-3 flex-wrap text-xs font-bold">
                                  <span style={{ color: '#FFD700' }}>Feeling: {checkin.feeling_rating}/5</span>
                                  <span style={{ color: '#3b82f6' }}>Macros: {checkin.hit_macros}</span>
                                  <span style={{ color: '#22c55e' }}>Energy: {checkin.energy_level}</span>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-xs text-gray-500 mb-1">Sleep</p>
                                <p className="font-bold" style={{ color: '#FFD700' }}>{checkin.sleep_quality}</p>
                              </div>
                            </div>

                            {checkin.food_swap_requests && (
                              <div className="bg-gray-800/50 rounded p-3 mb-3">
                                <p className="text-xs text-gray-500 font-bold mb-1">Food Requests:</p>
                                <p className="text-sm text-gray-300">{checkin.food_swap_requests}</p>
                              </div>
                            )}

                            {checkin.notes_for_dane && (
                              <div className="bg-gray-800/50 rounded p-3 mb-3">
                                <p className="text-xs text-gray-500 font-bold mb-1">Notes:</p>
                                <p className="text-sm text-gray-300">{checkin.notes_for_dane}</p>
                              </div>
                            )}

                            {checkin.admin_response && (
                              <div
                                className="rounded p-4 border-l-4"
                                style={{
                                  backgroundColor: 'rgba(255, 215, 0, 0.08)',
                                  borderColor: '#FFD700',
                                }}
                              >
                                <p className="text-xs font-bold text-yellow-500 mb-2">💬 Dane's Response:</p>
                                <p className="text-sm text-gray-300">{checkin.admin_response}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-900 rounded-xl p-8 border border-gray-800 text-center">
                      <p className="text-4xl mb-3">💬</p>
                      <p className="text-gray-400 text-sm">No check-ins yet.</p>
                      <p className="text-gray-600 text-xs mt-1">
                        Submit your first check-in above to get feedback from Dane!
                      </p>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        )}

        {/* REFER & EARN TAB */}
        {activeTab === 'refer' && (
          <div style={{ animation: 'slide-in-up 0.3s ease-out' }}>
            <ReferEarnTab
              clientId={client?.id}
              clientName={client?.full_name}
            />
          </div>
        )}

        {/* MY REWARDS TAB */}
        {activeTab === 'rewards' && (
          <div style={{ animation: 'slide-in-up 0.3s ease-out' }}>
            <MyRewardsTab clientId={client?.id} clientData={client} />
          </div>
        )}

        {/* UPGRADE MODAL — ✅ FIXED: Button now routes to upgrade page */}
        {showUpgradeModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
            <div className="bg-gray-900 border border-yellow-700/50 rounded-xl p-8 max-w-sm w-full">
              <h3 className="text-2xl font-black mb-3" style={{ color: '#FFD700' }}>
                Unlock Premium
              </h3>
              <p className="text-gray-400 text-sm mb-6">
                Get unlimited food swaps, weekly coaching, progress photo feedback, and more.
              </p>

              <div className="space-y-3 mb-8">
                {[
                  { plan: 'Pro', price: '$97', period: '/month', features: ['Monthly check-ins', 'Photo feedback', 'Plan adjustments', 'Unlimited swaps'] },
                  { plan: 'Elite', price: '$167', period: '/month', features: ['Weekly check-ins', 'Priority support', 'Photo feedback', 'Unlimited swaps'] },
                ].map((p, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-lg border"
                    style={{
                      backgroundColor: i === 1 ? 'rgba(255,215,0,0.1)' : 'rgba(255,215,0,0.05)',
                      borderColor: i === 1 ? '#FFD700' : '#444',
                    }}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-black text-white">{p.plan}</h4>
                      <span style={{ color: '#FFD700' }} className="font-black text-lg">
                        {p.price}
                        <span className="text-xs text-gray-500 font-normal">{p.period}</span>
                      </span>
                    </div>
                    <ul className="space-y-1 text-xs text-gray-300">
                      {p.features.map((f, j) => (
                        <li key={j} className="flex items-center gap-2">
                          <span style={{ color: '#FFD700' }}>✓</span> {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <button
                onClick={() => {
                  setShowUpgradeModal(false);
                  recordInteraction('upgrade-modal-clicked');
                  router.push(`/upgrade?clientId=${client.id}`);
                }}
                className="w-full py-3 font-black rounded-lg text-black mb-3 hover:opacity-90 transition"
                style={{ backgroundColor: '#FFD700' }}
              >
                View Upgrade Options →
              </button>

              <button
                onClick={() => setShowUpgradeModal(false)}
                className="w-full py-2 font-bold rounded-lg border border-gray-700 text-gray-300 hover:bg-gray-800 transition"
              >
                Maybe Later
              </button>
            </div>
          </div>
        )}

        {/* SWAP MODAL */}
        {showSubsModal && subsModalData && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 px-4 py-4 overflow-y-auto">
            <div className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-2xl my-auto">
              <div className="p-6 border-b border-gray-800">
                <h2 className="text-xl font-black mb-1" style={{ color: '#FFD700' }}>
                  🔄 Swap {subsModalData.food.name}
                </h2>
                <p className="text-gray-400 text-sm">
                  Click any food to swap. Your macros will stay balanced.
                </p>
              </div>

              <div className="p-6 max-h-96 overflow-y-auto">
                {subsModalData.yourPicksRaw && subsModalData.yourPicksRaw.length > 0 && (
                  <div className="mb-6">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                      ⭐ Your Picks (From Your Plan)
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {subsModalData.yourPicksRaw.map((food, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            handleSwapSingleFood(subsModalData.food, food, subsModalData.mealIndex);
                            recordInteraction('swap-confirmed');
                          }}
                          className="text-left p-3 bg-gray-800/60 hover:bg-gray-700 border border-gray-700 hover:border-yellow-500 rounded-lg transition group"
                        >
                          <p className="font-bold text-white group-hover:text-yellow-300 transition text-sm">
                            {food.name}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {food.portion} • {Math.round(food.calories)} cal
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            P: {Math.round(food.protein)}g | C: {Math.round(food.carbs)}g | F: {Math.round(food.fats)}g
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {showMoreOptions && subsModalData.otherOptionsRaw && subsModalData.otherOptionsRaw.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                      🔍 Other Options
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {subsModalData.otherOptionsRaw.map((food, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            handleSwapSingleFood(subsModalData.food, food, subsModalData.mealIndex);
                            recordInteraction('swap-confirmed-other');
                          }}
                          className="text-left p-3 bg-gray-800/40 hover:bg-gray-800 border border-gray-700/50 hover:border-gray-500 rounded-lg transition group"
                        >
                          <p className="font-bold text-gray-300 group-hover:text-white transition text-sm">
                            {food.name}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {food.portion} • {Math.round(food.calories)} cal
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            P: {Math.round(food.protein)}g | C: {Math.round(food.carbs)}g | F: {Math.round(food.fats)}g
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {!showMoreOptions && subsModalData.otherOptionsRaw && subsModalData.otherOptionsRaw.length > 0 && (
                  <div className="text-center mt-4">
                    <button
                      onClick={() => setShowMoreOptions(true)}
                      className="text-sm font-bold px-4 py-2 rounded-lg border border-yellow-500/50 text-yellow-500 hover:bg-yellow-500/10 transition"
                    >
                      Show More Options ({subsModalData.otherOptionsRaw.length})
                    </button>
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-gray-800 flex gap-3">
                <button
                  onClick={() => {
                    setShowSubsModal(false);
                    setShowMoreOptions(false);
                  }}
                  className="flex-1 py-2.5 rounded-lg border border-gray-700 text-gray-300 hover:bg-gray-800 transition font-bold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* FREQUENCY CHANGE MODAL */}
        {showFrequencyChangeModal && (
          <FrequencyChangeModal
            client={client}
            currentMealsPerDay={client?.meals_per_day}
            lastFrequencyChangeDate={client?.last_frequency_change_date}
            selectedFoods={client?.selected_foods}
            targetCalories={mealPlan?.target_calories}
            targetProtein={mealPlan?.target_protein_g}
            targetCarbs={mealPlan?.target_carbs_g}
            targetFats={mealPlan?.target_fats_g}
            mealVariety={client?.meal_variety}
            onClose={() => setShowFrequencyChangeModal(false)}
            onConfirm={(result) => {
              if (result?.newMealPlan) {
                setMealPlan({
                  ...mealPlan,
                  meals_data: result.newMealPlan,
                  target_calories: result.newTargets.calories,
                  target_protein_g: result.newTargets.protein,
                  target_carbs_g: result.newTargets.carbs,
                  target_fats_g: result.newTargets.fats,
                });
                
                setClient({
                  ...client,
                  meals_per_day: result.newMealsPerDay,
                });
              }
              
              setShowFrequencyChangeModal(false);
              recordInteraction('frequency_changed');
            }}
          />
        )}

        {/* PLAN CHANGE MODAL */}
        {showPlanChangeModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 rounded-xl border border-yellow-700/50 p-6 max-w-md w-full">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-lg font-black" style={{ color: '#FFD700' }}>
                  Request Plan Change
                </h2>
                <button
                  onClick={() => {
                    setShowPlanChangeModal(false);
                    setPlanChangeReason('');
                  }}
                  className="text-gray-400 hover:text-white text-2xl leading-none"
                >
                  ×
                </button>
              </div>

              <p className="text-gray-400 text-sm mb-4">
                Tell Dane what's not working and why you need a change. He'll review your request and reach out with next steps.
              </p>

              <textarea
                value={planChangeReason}
                onChange={(e) => setPlanChangeReason(e.target.value)}
                placeholder="E.g., 'I'm not a fan of chicken, can we swap it out? I prefer fish.' or 'The meal sizes feel too big, I'm struggling to finish everything.'"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white placeholder-gray-500 text-sm mb-4 focus:outline-none focus:border-yellow-500 resize-none"
                rows={5}
                disabled={submittingPlanChange}
              />

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowPlanChangeModal(false);
                    setPlanChangeReason('');
                  }}
                  className="flex-1 px-4 py-2.5 border border-gray-700 text-gray-300 font-bold rounded-lg hover:bg-gray-800 transition disabled:opacity-50"
                  disabled={submittingPlanChange}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitPlanChange}
                  className="flex-1 px-4 py-2.5 bg-yellow-600 text-black font-bold rounded-lg hover:bg-yellow-500 transition disabled:opacity-50"
                  disabled={submittingPlanChange || !planChangeReason.trim()}
                >
                  {submittingPlanChange ? 'Sending...' : 'Send Request'}
                </button>
              </div>
            </div>
          </div>
        )}
              </div>
      </main>
    </SubscriptionGuard>
  );
}
export default DashboardContent;

