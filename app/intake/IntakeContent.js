'use client';

import PhotoConsentModal from '@/app/components/PhotoConsentModal';
import ReviewScreen from './ReviewScreen';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { foodDatabase } from '../../lib/foodDatabase';
import PlanSelectorBar from './PlanSelectorBar';


export default function IntakeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const goalFromUrl = searchParams.get('goal');
const refFromUrl = searchParams.get('ref'); // Only from URL, NOT from localStorage
  const [showPhotoConsentModal, setShowPhotoConsentModal] = useState(false);
  const [photoConsent, setPhotoConsent] = useState(null);

  // ─── ORGANIZE FOOD DATABASE ───────────────────────────────────────────────
  const [organizedFoods, setOrganizedFoods] = useState({
    proteins:   [],
    carbs:      [],
    vegetables: [],
    fats:       [],
    fruits:     [],
  });
  const [foodsLoaded, setFoodsLoaded] = useState(false);

  useEffect(() => {
    try {
      console.log('📥 Loading food database...');
      console.log('foodDatabase structure:', Object.keys(foodDatabase));

      // foodDatabase is already organized by category from foodDatabase.js
      if (foodDatabase && typeof foodDatabase === 'object') {
        const organized = {
          proteins:   foodDatabase.proteins || [],
          carbs:      foodDatabase.carbs || [],
          vegetables: foodDatabase.vegetables || [],
          fats:       foodDatabase.fats || [],
          fruits:     foodDatabase.fruits || [],
        };

        console.log('✅ Food counts:', {
          proteins:   organized.proteins.length,
          carbs:      organized.carbs.length,
          vegetables: organized.vegetables.length,
          fats:       organized.fats.length,
          fruits:     organized.fruits.length,
        });

        setOrganizedFoods(organized);
        setFoodsLoaded(true);
      } else {
        console.error('❌ foodDatabase format invalid');
        setFoodsLoaded(false);
      }
    } catch (error) {
      console.error('❌ Error loading food database:', error);
      setFoodsLoaded(false);
    }
  }, []);

  const [currentStep, setCurrentStep]   = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors]             = useState({});

  const [formData, setFormData] = useState({
    firstName:           '',
    lastName:            '',
    email:               '',
    phone:               '',
    age:                 '',
    gender:              '',
    referralCode:        '',
    heightFeet:          '',
    heightInches:        '',
    currentWeight:       '',
    goalWeight:          '',
    primaryGoal:         goalFromUrl || '',
    experienceLevel:     '',
    activityLevel:       '',
    cardioPreference:    '',
    mealsPerDay:         '',
    meal_pattern:        'balanced',
    mealVariety:         'mix',
    dietaryType:         'omnivore',
    allergies:           [],
    cookingMethods:      [],
    categoryPreferences: {
      proteins:   'all',
      carbs:      'all',
      vegetables: 'all',
      fats:       'all',
      fruits:     'all',
    },
    selectedFoods: {
      proteins:   [],
      carbs:      [],
      vegetables: [],
      fats:       [],
      fruits:     [],
    },
  });
  

  useEffect(() => {
  const saved = localStorage.getItem('intakeFormData');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      setFormData(prev => ({
        ...prev,
        ...parsed,
        mealVariety: parsed.mealVariety || 'mix',
        dietaryType: parsed.dietaryType || 'omnivore',
        allergies: parsed.allergies || [],
        categoryPreferences: {
          proteins:   'all',
          carbs:      'all',
          vegetables: 'all',
          fats:       'all',
          fruits:     'all',
          ...(parsed.categoryPreferences || {}),
        },
        selectedFoods: {
          proteins:   [],
          carbs:      [],
          vegetables: [],
          fats:       [],
          fruits:     [],
          ...(parsed.selectedFoods || {}),
        },
      }));
    } catch (e) {
      console.error('Error loading saved form data:', e);
    }
  }
}, []);

useEffect(() => {
  localStorage.setItem('intakeFormData', JSON.stringify(formData));
}, [formData]);

// Clear stale referral code from localStorage on fresh intake
useEffect(() => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('referralCode');
  }
}, []);

// ─── SYNC PLAN SELECTOR TO FORM DATA ───────────────────────────────────────
useEffect(() => {
  const syncPlanFromStorage = () => {
    const stored = localStorage.getItem('selectedPlanType');
    console.log('🔄 Syncing plan from storage:', stored);
    if (stored) {
      const planId = stored === 'basic' ? 'kickstart' : stored;
      console.log('✅ Setting planType to:', planId);
      setFormData(prev => ({ ...prev, planType: planId }));
    }
  };

  // Sync on mount
  syncPlanFromStorage();

  // Also sync on storage change
  const handleStorageChange = (e) => {
    if (e.key === 'selectedPlanType') {
      console.log('📢 Storage changed:', e.newValue);
      syncPlanFromStorage();
    }
  };

  window.addEventListener('storage', handleStorageChange);
  window.addEventListener('planChanged', syncPlanFromStorage);

  return () => {
    window.removeEventListener('storage', handleStorageChange);
    window.removeEventListener('planChanged', syncPlanFromStorage);
  };
}, []);

useEffect(() => {
  if (goalFromUrl && !formData.primaryGoal) {
    setFormData(prev => ({ ...prev, primaryGoal: goalFromUrl }));
  }
}, [goalFromUrl]);

useEffect(() => {
  if (refFromUrl && !formData.referralCode) {
    setFormData(prev => ({ ...prev, referralCode: refFromUrl }));
  }
}, [refFromUrl]);




  const totalSteps = 7; // Was 6, now 7 (added Review Screen)


  // ─── CALCULATE TOTAL FOODS SELECTED ────────────────────────────────────────
  const calculateTotalFoodsSelected = () => {
    const categoryPrefs = formData.categoryPreferences || {};
    const selectedFoods = formData.selectedFoods || {};
    let total = 0;

    const categories = ['proteins', 'carbs', 'vegetables', 'fats', 'fruits'];
    categories.forEach(category => {
      const preference = categoryPrefs[category] || 'all';
      if (preference === 'all') {
        total += organizedFoods[category]?.length || 0;
      } else if (preference === 'choose') {
        total += (selectedFoods[category] || []).length;
      }
    });

    return total;
  };

  const totalFoodsSelected = calculateTotalFoodsSelected();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleCookingMethodToggle = (method) => {
    setFormData(prev => {
      const currentMethods = prev.cookingMethods || [];
      const isSelected     = currentMethods.includes(method);
      return {
        ...prev,
        cookingMethods: isSelected
          ? currentMethods.filter(m => m !== method)
          : [...currentMethods, method],
      };
    });
  };

  const handleAllergyToggle = (allergy) => {
    setFormData(prev => {
      const currentAllergies = prev.allergies || [];
      const isSelected       = currentAllergies.includes(allergy);
      return {
        ...prev,
        allergies: isSelected
          ? currentAllergies.filter(a => a !== allergy)
          : [...currentAllergies, allergy],
      };
    });
  };

  const handleCategoryPreference = (category, preference) => {
    setFormData(prev => ({
      ...prev,
      categoryPreferences: {
        ...prev.categoryPreferences,
        [category]: preference,
      },
      selectedFoods: {
        ...prev.selectedFoods,
        [category]: preference === 'choose' ? (prev.selectedFoods[category] || []) : [],
      },
    }));
  };

  const handleFoodSelection = (category, foodName) => {
    setFormData(prev => {
      const current    = prev.selectedFoods[category] || [];
      const isSelected = current.includes(foodName);
      return {
        ...prev,
        selectedFoods: {
          ...prev.selectedFoods,
          [category]: isSelected
            ? current.filter(f => f !== foodName)
            : [...current, foodName],
        },
      };
    });
  };

  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case 1:
        if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
        if (!formData.lastName.trim())  newErrors.lastName  = 'Last name is required';
        if (!formData.email.trim())     newErrors.email     = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          newErrors.email = 'Please enter a valid email';
        }
        if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
        if (!formData.age) newErrors.age = 'Age is required';
        else if (formData.age < 16 || formData.age > 100) {
          newErrors.age = 'Age must be between 16 and 100';
        }
        if (!formData.gender) newErrors.gender = 'Please select your gender';
        break;

      case 2:
        if (!formData.heightFeet)    newErrors.heightFeet    = 'Height is required';
        if (!formData.currentWeight) newErrors.currentWeight = 'Current weight is required';
        if (!formData.goalWeight)    newErrors.goalWeight    = 'Goal weight is required';
        if (!formData.primaryGoal)   newErrors.primaryGoal   = 'Please select your primary goal';
        break;

      case 3:
        if (!formData.experienceLevel) newErrors.experienceLevel = 'Please select your experience level';
        if (!formData.activityLevel)   newErrors.activityLevel   = 'Please select your activity level';
        break;

      case 4:
        if (!formData.cardioPreference) newErrors.cardioPreference = 'Please select your cardio preference';
        if (!formData.mealsPerDay)      newErrors.mealsPerDay      = 'Please select meals per day';
        if (!formData.mealVariety)      newErrors.mealVariety      = 'Please select your meal variety preference';
        if (!formData.dietaryType)      newErrors.dietaryType      = 'Please select your dietary type';
        const cookingMethods = formData.cookingMethods || [];
        if (cookingMethods.length === 0) {
          newErrors.cookingMethods = 'Please select at least one cooking method';
        }
        break;

      case 5:
        if (!formData.meal_pattern) newErrors.meal_pattern = 'Please select your meal pattern';
        break;

      case 6:
        break;

      case 7:
        break;

    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
      window.scrollTo(0, 0);
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    window.scrollTo(0, 0);
  };

  const handleEditStep = (stepNumber) => {
    setCurrentStep(stepNumber);
    window.scrollTo(0, 0);
  };

  const handleSubmit = async () => {
    console.log('🔵 handleSubmit called, photoConsent:', photoConsent);
    
    if (!validateStep(currentStep)) {
      console.log('❌ Validation failed');
      return;
    }

    // ── SHOW PHOTO CONSENT MODAL before submission ──────────────────────
    if (!photoConsent) {
      console.log('📸 No photo consent yet, showing modal');
      setShowPhotoConsentModal(true);
      return;
    }

    console.log('✅ Photo consent confirmed:', photoConsent);
    setIsSubmitting(true);

    try {
      const finalFoodSelections = {};
      const categories    = ['proteins', 'carbs', 'vegetables', 'fats', 'fruits'];
      const categoryPrefs = formData.categoryPreferences || {};
      const selectedFoods = formData.selectedFoods || {};

      categories.forEach(category => {
        const preference = categoryPrefs[category] || 'all';
        if (preference === 'all') {
          finalFoodSelections[category] = organizedFoods[category].map(f => f.name);
        } else if (preference === 'choose') {
          finalFoodSelections[category] = selectedFoods[category] || [];
        } else {
          finalFoodSelections[category] = [];
        }
      });

      const heightInches = (parseInt(formData.heightFeet) * 12) + (parseInt(formData.heightInches) || 0);

      const payload = {
        firstName:        formData.firstName,
        lastName:         formData.lastName,
        email:            formData.email,
        phone:            formData.phone,
        age:              parseInt(formData.age),
        gender:           formData.gender,
        heightInches,
        currentWeight:    parseFloat(formData.currentWeight),
        goalWeight:       parseFloat(formData.goalWeight),
        primaryGoal:      formData.primaryGoal,
        experienceLevel:  formData.experienceLevel,
        activityLevel:    formData.activityLevel,
        cardioPreference: formData.cardioPreference,
        mealsPerDay:      parseInt(formData.mealsPerDay),
        meal_pattern:     formData.meal_pattern || 'balanced',
        mealVariety:      formData.mealVariety,
        dietaryType:      formData.dietaryType,
        allergies:        formData.allergies,
        cookingMethods:   formData.cookingMethods || [],
        selectedFoods:    finalFoodSelections,
        planType:         localStorage.getItem('selectedPlanType') || 'kickstart',
        photoConsent:     photoConsent,
        referralCode:     formData.referralCode || '',
      };

      console.log('📤 Submitting payload:', payload);

      const response = await fetch('/api/intake/submit', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      });

      console.log('📡 Response status:', response.status);

      const data = await response.json();
      console.log('📡 Response data:', data);

      if (!response.ok) {
        throw new Error(data.error || `Failed to submit form: ${response.status}`);
      }

      console.log('✅ Submission successful!');
      localStorage.removeItem('intakeFormData');

      const planType = localStorage.getItem('selectedPlanType') || 'kickstart';
      console.log('🚀 Redirecting to payment with clientId:', data.clientId);
      router.push(`/payment?clientId=${data.clientId}&goal=${formData.primaryGoal}&planType=${planType}`);

      // Reset photo consent for future submissions
      setPhotoConsent(null);

    } catch (error) {
      console.error('🔴 Submit error:', error.message, error);
      setErrors({ submit: error.message });
      setIsSubmitting(false);
    }
  };

  const handlePhotoConsentConfirm = (consent) => {
    console.log('📸 Photo consent chosen:', consent);
    setPhotoConsent(consent);
    setShowPhotoConsentModal(false);
    // Don't auto-submit, let them click the button again
  };

  // ─── STEP RENDERS ─────────────────────────────────────────────────────────

  const renderStep1 = () => {
    // Determine if Kickstart plan is selected
const isKickstart = (formData.planType || '').toLowerCase() === 'kickstart';
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-white mb-6">Personal Information</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">First Name</label>
            <input
              type="text" name="firstName" value={formData.firstName} onChange={handleChange}
              className={`w-full px-4 py-3 bg-gray-900/50 border ${errors.firstName ? 'border-red-500' : 'border-yellow-700/30'} rounded-lg text-white focus:outline-none focus:border-yellow-500`}
              placeholder="John"
            />
            {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Last Name</label>
            <input
              type="text" name="lastName" value={formData.lastName} onChange={handleChange}
              className={`w-full px-4 py-3 bg-gray-900/50 border ${errors.lastName ? 'border-red-500' : 'border-yellow-700/30'} rounded-lg text-white focus:outline-none focus:border-yellow-500`}
              placeholder="Doe"
            />
            {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
          <input
            type="email" name="email" value={formData.email} onChange={handleChange}
            className={`w-full px-4 py-3 bg-gray-900/50 border ${errors.email ? 'border-red-500' : 'border-yellow-700/30'} rounded-lg text-white focus:outline-none focus:border-yellow-500`}
            placeholder="john@example.com"
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Phone Number</label>
          <input
            type="tel" name="phone" value={formData.phone} onChange={handleChange}
            className={`w-full px-4 py-3 bg-gray-900/50 border ${errors.phone ? 'border-red-500' : 'border-yellow-700/30'} rounded-lg text-white focus:outline-none focus:border-yellow-500`}
            placeholder="(555) 123-4567"
          />
          {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Age</label>
            <input
              type="number" name="age" value={formData.age} onChange={handleChange}
              min="16" max="100"
              className={`w-full px-4 py-3 bg-gray-900/50 border ${errors.age ? 'border-red-500' : 'border-yellow-700/30'} rounded-lg text-white focus:outline-none focus:border-yellow-500`}
              placeholder="25"
            />
            {errors.age && <p className="text-red-500 text-sm mt-1">{errors.age}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Gender</label>
            <select
              name="gender" value={formData.gender} onChange={handleChange}
              className={`w-full px-4 py-3 bg-gray-900/50 border ${errors.gender ? 'border-red-500' : 'border-yellow-700/30'} rounded-lg text-white focus:outline-none focus:border-yellow-500`}
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
            {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender}</p>}
          </div>
        </div>

        {/* REFERRAL CODE INPUT — ONLY FOR PRO & ELITE */}
{formData.planType === 'pro' || formData.planType === 'elite' ? (
  <div>
    <label className="block text-sm font-medium text-gray-300 mb-2">Referred by Someone? (Optional)</label>
    <p className="text-gray-500 text-xs mb-3">
      If a friend referred you, enter their referral code here to get 10% off your first month!
    </p>
    <input
      type="text"
      name="referralCode"
      value={formData.referralCode || ''}
      onChange={(e) => {
        let value = e.target.value;
        if (value.includes('ref=')) {
          const match = value.match(/ref=([A-Za-z0-9]+)/);
          if (match) value = match[1];
        }
        value = value.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
        setFormData(prev => ({ ...prev, referralCode: value }));
      }}
      className="w-full px-4 py-3 bg-gray-900/50 border border-yellow-700/30 rounded-lg text-white focus:outline-none focus:border-yellow-500 uppercase"
      placeholder="e.g., BLACK912"
      maxLength="20"
    />
    {formData.referralCode && (
      <p className="text-green-400 text-xs mt-2">
        ✅ Referral code: {formData.referralCode}
      </p>
    )}
    {!formData.referralCode && (
      <p className="text-gray-400 text-xs mt-2">
        Your referrer gets $40 in rewards when you complete your purchase.
      </p>
    )}
  </div>
) : null}


      </div>
    );
  };

  const renderStep2 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white mb-6">Body Metrics & Goals</h2>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Height</label>
        <div className="grid grid-cols-2 gap-4">
          <select
            name="heightFeet" value={formData.heightFeet} onChange={handleChange}
            className={`w-full px-4 py-3 bg-gray-900/50 border ${errors.heightFeet ? 'border-red-500' : 'border-yellow-700/30'} rounded-lg text-white focus:outline-none focus:border-yellow-500`}
          >
            <option value="">Feet</option>
            {[4, 5, 6, 7].map(ft => <option key={ft} value={ft}>{ft} ft</option>)}
          </select>
          <select
            name="heightInches" value={formData.heightInches} onChange={handleChange}
            className="w-full px-4 py-3 bg-gray-900/50 border border-yellow-700/30 rounded-lg text-white focus:outline-none focus:border-yellow-500"
          >
            <option value="">Inches</option>
            {[0,1,2,3,4,5,6,7,8,9,10,11].map(inch => <option key={inch} value={inch}>{inch} in</option>)}
          </select>
        </div>
        {errors.heightFeet && <p className="text-red-500 text-sm mt-1">{errors.heightFeet}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Current Weight (lbs)</label>
          <input
            type="number" name="currentWeight" value={formData.currentWeight} onChange={handleChange}
            min="80" max="500"
            className={`w-full px-4 py-3 bg-gray-900/50 border ${errors.currentWeight ? 'border-red-500' : 'border-yellow-700/30'} rounded-lg text-white focus:outline-none focus:border-yellow-500`}
            placeholder="180"
          />
          {errors.currentWeight && <p className="text-red-500 text-sm mt-1">{errors.currentWeight}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Goal Weight (lbs)</label>
          <input
            type="number" name="goalWeight" value={formData.goalWeight} onChange={handleChange}
            min="80" max="500"
            className={`w-full px-4 py-3 bg-gray-900/50 border ${errors.goalWeight ? 'border-red-500' : 'border-yellow-700/30'} rounded-lg text-white focus:outline-none focus:border-yellow-500`}
            placeholder="165"
          />
          {errors.goalWeight && <p className="text-red-500 text-sm mt-1">{errors.goalWeight}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Primary Goal</label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { value: 'fat-loss',     label: 'Lose Fat',     icon: '🔥' },
            { value: 'build-muscle', label: 'Build Muscle', icon: '💪' },
            { value: 'stay-healthy', label: 'Stay Healthy', icon: '❤️' },
          ].map(goal => (
            <button
              key={goal.value} type="button"
              onClick={() => {
                setFormData(prev => ({ ...prev, primaryGoal: goal.value }));
                if (errors.primaryGoal) setErrors(prev => ({ ...prev, primaryGoal: null }));
              }}
              className={`p-4 rounded-lg border-2 transition-all ${
                formData.primaryGoal === goal.value
                  ? 'border-yellow-500 bg-yellow-500/20'
                  : 'border-yellow-700/30 bg-gray-900/50 hover:border-yellow-500/50'
              }`}
            >
              <span className="text-3xl mb-2 block">{goal.icon}</span>
              <span className="text-white font-medium">{goal.label}</span>
            </button>
          ))}
        </div>
        {errors.primaryGoal && <p className="text-red-500 text-sm mt-1">{errors.primaryGoal}</p>}
      </div>
    </div>
  );


  const renderStep3 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white mb-6">Experience & Activity Level</h2>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Fitness Experience</label>
        <div className="space-y-3">
          {[
            { value: 'beginner',     label: 'Beginner',     desc: 'New to fitness or returning after a long break' },
            { value: 'intermediate', label: 'Intermediate', desc: '1-3 years of consistent training' },
            { value: 'advanced',     label: 'Advanced',     desc: '3+ years of dedicated training' },
          ].map(exp => (
            <button
              key={exp.value} type="button"
              onClick={() => {
                setFormData(prev => ({ ...prev, experienceLevel: exp.value }));
                if (errors.experienceLevel) setErrors(prev => ({ ...prev, experienceLevel: null }));
              }}
              className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                formData.experienceLevel === exp.value
                  ? 'border-yellow-500 bg-yellow-500/20'
                  : 'border-yellow-700/30 bg-gray-900/50 hover:border-yellow-500/50'
              }`}
            >
              <span className="text-white font-medium block">{exp.label}</span>
              <span className="text-gray-400 text-sm">{exp.desc}</span>
            </button>
          ))}
        </div>
        {errors.experienceLevel && <p className="text-red-500 text-sm mt-1">{errors.experienceLevel}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Activity Level</label>
        <div className="space-y-3">
          {[
            { value: 'sedentary',         label: 'Sedentary',        desc: 'Little or no exercise, desk job' },
            { value: 'lightly-active',    label: 'Lightly Active',   desc: 'Light exercise 1-3 days/week' },
            { value: 'moderately-active', label: 'Moderately Active',desc: 'Moderate exercise 3-5 days/week' },
            { value: 'very-active',       label: 'Very Active',      desc: 'Hard exercise 6-7 days/week' },
            { value: 'extremely-active',  label: 'Extremely Active', desc: 'Very hard exercise, physical job' },
          ].map(act => (
            <button
              key={act.value} type="button"
              onClick={() => {
                setFormData(prev => ({ ...prev, activityLevel: act.value }));
                if (errors.activityLevel) setErrors(prev => ({ ...prev, activityLevel: null }));
              }}
              className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                formData.activityLevel === act.value
                  ? 'border-yellow-500 bg-yellow-500/20'
                  : 'border-yellow-700/30 bg-gray-900/50 hover:border-yellow-500/50'
              }`}
            >
              <span className="text-white font-medium block">{act.label}</span>
              <span className="text-gray-400 text-sm">{act.desc}</span>
            </button>
          ))}
        </div>
        {errors.activityLevel && <p className="text-red-500 text-sm mt-1">{errors.activityLevel}</p>}
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white mb-6">Lifestyle & Preferences</h2>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Cardio Preference</label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { value: 'none', label: 'No Cardio',      icon: '🚫' },
            { value: 'low',  label: 'Low Intensity',  icon: '🚶' },
            { value: 'high', label: 'High Intensity', icon: '🏃' },
          ].map(cardio => (
            <button
              key={cardio.value} type="button"
              onClick={() => {
                setFormData(prev => ({ ...prev, cardioPreference: cardio.value }));
                if (errors.cardioPreference) setErrors(prev => ({ ...prev, cardioPreference: null }));
              }}
              className={`p-4 rounded-lg border-2 transition-all ${
                formData.cardioPreference === cardio.value
                  ? 'border-yellow-500 bg-yellow-500/20'
                  : 'border-yellow-700/30 bg-gray-900/50 hover:border-yellow-500/50'
              }`}
            >
              <span className="text-3xl mb-2 block">{cardio.icon}</span>
              <span className="text-white font-medium">{cardio.label}</span>
            </button>
          ))}
        </div>
        {errors.cardioPreference && <p className="text-red-500 text-sm mt-1">{errors.cardioPreference}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Meals Per Day</label>
        <div className="grid grid-cols-4 gap-4">
          {[3, 4, 5, 6].map(num => (
            <button
              key={num} type="button"
              onClick={() => {
                setFormData(prev => ({ ...prev, mealsPerDay: num }));
                if (errors.mealsPerDay) setErrors(prev => ({ ...prev, mealsPerDay: null }));
              }}
              className={`p-4 rounded-lg border-2 transition-all ${
  formData.mealsPerDay === num
    ? 'border-yellow-500 bg-yellow-500/20'
    : 'border-yellow-700/30 bg-gray-900/50 hover:border-yellow-500/50'
}`}

            >
              <span className="text-2xl text-white font-bold">{num}</span>
            </button>
          ))}
        </div>
        {errors.mealsPerDay && <p className="text-red-500 text-sm mt-1">{errors.mealsPerDay}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Meal Variety Preference
        </label>
        <p className="text-gray-500 text-xs mb-3">
          How do you prefer your meals structured? This helps us build a plan you'll actually stick to.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              value: 'mix',
              icon:  '🔄',
              label: 'Mix It Up',
              desc:  'Different foods each meal — keeps things interesting and maximizes nutrition variety',
            },
            {
              value: 'some-repeats',
              icon:  '🍱',
              label: 'Some Repeats',
              desc:  'A few meals repeat — great for meal prep without getting bored',
            },
            {
              value: 'simple',
              icon:  '📦',
              label: 'Keep It Simple',
              desc:  'Meals repeat as much as possible — cook once, eat all week',
            },
          ].map(opt => (
            <button
              key={opt.value} type="button"
              onClick={() => {
                setFormData(prev => ({ ...prev, mealVariety: opt.value }));
                if (errors.mealVariety) setErrors(prev => ({ ...prev, mealVariety: null }));
              }}
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                formData.mealVariety === opt.value
                  ? 'border-yellow-500 bg-yellow-500/20'
                  : 'border-yellow-700/30 bg-gray-900/50 hover:border-yellow-500/50'
              }`}
            >
              <span className="text-3xl mb-2 block">{opt.icon}</span>
              <span className="text-white font-semibold block mb-1">{opt.label}</span>
              <span className="text-gray-400 text-xs leading-relaxed">{opt.desc}</span>
            </button>
          ))}
        </div>
        {errors.mealVariety && <p className="text-red-500 text-sm mt-1">{errors.mealVariety}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Dietary Type</label>
        <p className="text-gray-500 text-xs mb-3">
          Select your dietary preference. This ensures your meal plan includes only foods you eat.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              value: 'omnivore',
              icon:  '🍽️',
              label: 'Omnivore',
              desc:  'I eat everything — meat, poultry, fish, dairy, plants',
            },
            {
              value: 'vegetarian',
              icon:  '🥬',
              label: 'Vegetarian',
              desc:  'No meat or fish, but I eat dairy, eggs, and all plants',
            },
            {
              value: 'vegan',
              icon:  '🌱',
              label: 'Vegan',
              desc:  'No animal products — only plant-based foods',
            },
          ].map(opt => (
            <button
              key={opt.value} type="button"
              onClick={() => {
                setFormData(prev => ({ ...prev, dietaryType: opt.value }));
                if (errors.dietaryType) setErrors(prev => ({ ...prev, dietaryType: null }));
              }}
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                formData.dietaryType === opt.value
                  ? 'border-yellow-500 bg-yellow-500/20'
                  : 'border-yellow-700/30 bg-gray-900/50 hover:border-yellow-500/50'
              }`}
            >
              <span className="text-3xl mb-2 block">{opt.icon}</span>
              <span className="text-white font-semibold block mb-1">{opt.label}</span>
              <span className="text-gray-400 text-xs leading-relaxed">{opt.desc}</span>
            </button>
          ))}
        </div>
        {errors.dietaryType && <p className="text-red-500 text-sm mt-1">{errors.dietaryType}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Allergies & Intolerances</label>
        <p className="text-gray-500 text-xs mb-3">
          Select any allergies or intolerances. We'll exclude these from your meal plan.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { value: 'peanuts',   label: 'Peanuts',   icon: '🥜' },
            { value: 'tree-nuts', label: 'Tree Nuts', icon: '🌰' },
            { value: 'shellfish', label: 'Shellfish', icon: '🦐' },
            { value: 'dairy',     label: 'Dairy',     icon: '🥛' },
            { value: 'gluten',    label: 'Gluten',    icon: '🌾' },
            { value: 'eggs',      label: 'Eggs',      icon: '🥚' },
          ].map(allergy => {
            const isSelected = (formData.allergies || []).includes(allergy.value);
            return (
              <button
                key={allergy.value} type="button"
                onClick={() => handleAllergyToggle(allergy.value)}
                className={`p-3 rounded-lg border-2 transition-all text-center ${
                  isSelected
                    ? 'border-red-500 bg-red-500/20'
                    : 'border-yellow-700/30 bg-gray-900/50 hover:border-yellow-500/50'
                }`}
              >
                <span className="text-2xl mb-1 block">{allergy.icon}</span>
                <span className={`text-sm font-medium ${isSelected ? 'text-red-400' : 'text-white'}`}>
                  {allergy.label}
                </span>
              </button>
            );
          })}
        </div>
        <p className="text-gray-500 text-xs mt-2">
          {formData.allergies && formData.allergies.length > 0
            ? `Excluded: ${formData.allergies.join(', ')}`
            : 'No allergies selected'}
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Preferred Cooking Methods</label>
        <p className="text-gray-400 text-sm mb-3">Select all that apply</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { value: 'baked',     label: 'Baked',     icon: '🍳' },
            { value: 'air-fried', label: 'Air Fried', icon: '🌀' },
            { value: 'grilled',   label: 'Grilled',   icon: '🔥' },
          ].map(method => {
            const isSelected = (formData.cookingMethods || []).includes(method.value);
            return (
              <button
                key={method.value} type="button"
                onClick={() => {
                  handleCookingMethodToggle(method.value);
                  if (errors.cookingMethods) setErrors(prev => ({ ...prev, cookingMethods: null }));
                }}
                className={`p-4 rounded-lg border-2 transition-all ${
                  isSelected
                    ? 'border-yellow-500 bg-yellow-500/20'
                    : 'border-yellow-700/30 bg-gray-900/50 hover:border-yellow-500/50'
                }`}
              >
                <span className="text-3xl mb-2 block">{method.icon}</span>
                <span className="text-white font-medium">{method.label}</span>
              </button>
            );
          })}
        </div>
        {errors.cookingMethods && <p className="text-red-500 text-sm mt-1">{errors.cookingMethods}</p>}
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">How Do You Like Your Meals?</h2>
        <p className="text-gray-400 text-sm mb-6">
          Choose how you want your meals distributed. Your daily macros stay the same — just split differently.
        </p>
      </div>

      <div className="space-y-3">
        {[
          {
            id: 'balanced',
            label: 'Balanced',
            description: 'All meals similar size — easiest to follow',
            example: 'Each meal ~454 cal (for 2271 daily)',
            icon: '⚖️',
          },
          {
            id: 'heavy-light',
            label: 'Heavy & Light',
            description: '3 larger meals, 2 smaller meals — great for bigger appetites',
            example: '3 meals ~550 cal, 2 meals ~330 cal',
            icon: '📊',
            disabled: formData.mealsPerDay !== 5 && formData.mealsPerDay !== '5',
          },
          {
            id: 'custom',
            label: 'Custom',
            description: 'You\'ll adjust meal sizes after receiving your plan',
            example: 'We start with balanced, you modify',
            icon: '🎯',
          },
        ].map(option => (
          <button
            key={option.id}
            onClick={() => {
              setFormData(prev => ({ ...prev, meal_pattern: option.id }));
              if (errors.meal_pattern) setErrors(prev => ({ ...prev, meal_pattern: null }));
            }}
            disabled={option.disabled}
            type="button"
            className={`w-full p-5 rounded-xl border-2 text-left transition ${
              formData.meal_pattern === option.id
                ? 'border-yellow-500 bg-yellow-500/10'
                : 'border-gray-700 bg-gray-800/30 hover:border-gray-600'
            } ${option.disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <div className="flex items-start gap-3">
              <div className="text-3xl">{option.icon}</div>
              <div className="flex-1">
                <h3 className="font-bold text-white mb-1">{option.label}</h3>
                <p className="text-gray-400 text-sm mb-2">{option.description}</p>
                <p className="text-gray-500 text-xs italic">{option.example}</p>
                {option.disabled && (
                  <p className="text-yellow-600 text-xs font-bold mt-2">
                    Only available with 5 meals/day
                  </p>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>

      {!formData.meal_pattern && (
        <p className="text-yellow-600 text-sm font-bold">
          ⚠️ Please select a meal pattern to continue
        </p>
      )}

      {errors.meal_pattern && <p className="text-red-500 text-sm mt-1">{errors.meal_pattern}</p>}
    </div>
  );

  const renderStep6 = () => {
    const categories = [
      { key: 'proteins',   label: 'Proteins',      icon: '🥩' },
      { key: 'carbs',      label: 'Carbohydrates', icon: '🍚' },
      { key: 'vegetables', label: 'Vegetables',    icon: '🥦' },
      { key: 'fats',       label: 'Healthy Fats',  icon: '🥑' },
      { key: 'fruits',     label: 'Fruits',        icon: '🍎' },
    ];

    const categoryPrefs = formData.categoryPreferences || {};
    const selectedFoods = formData.selectedFoods || {};

    return (
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Food Preferences</h2>
          <p className="text-gray-400">
            Choose your preferences for each food category. Your meal plan will only include foods you select.
          </p>
        </div>

        {/* FOODS SELECTED SUMMARY */}
        <div className="bg-yellow-500/10 border-2 border-yellow-500/50 rounded-xl p-6">
          <div className="text-center">
            <p className="text-gray-300 text-sm mb-1">Total Foods Selected</p>
            <p className="text-4xl font-bold text-yellow-500">{totalFoodsSelected}</p>
            <p className="text-gray-400 text-xs mt-2">Foods available for your custom meal plan</p>
          </div>
        </div>

        {categories.map(category => {
          const preference    = categoryPrefs[category.key] || 'all';
          const categoryFoods = selectedFoods[category.key] || [];
          const foods         = organizedFoods[category.key] || [];

          return (
            <div
              key={category.key}
              className="bg-gray-900/50 border border-yellow-700/30 rounded-lg p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">{category.icon}</span>
                <h3 className="text-xl font-bold text-white">{category.label}</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                <button
                  type="button"
                  onClick={() => handleCategoryPreference(category.key, 'all')}
                  className={`p-3 rounded-lg border-2 transition-all text-sm ${
                    preference === 'all'
                      ? 'border-yellow-500 bg-yellow-500/20 text-white'
                      : 'border-yellow-700/30 bg-gray-800/50 text-gray-300 hover:border-yellow-500/50'
                  }`}
                >
                  ✅ I eat all {category.label.toLowerCase()}
                </button>

                <button
                  type="button"
                  onClick={() => handleCategoryPreference(category.key, 'choose')}
                  className={`p-3 rounded-lg border-2 transition-all text-sm ${
                    preference === 'choose'
                      ? 'border-yellow-500 bg-yellow-500/20 text-white'
                      : 'border-yellow-700/30 bg-gray-800/50 text-gray-300 hover:border-yellow-500/50'
                  }`}
                >
                  📝 Let me choose
                </button>

                <button
                  type="button"
                  onClick={() => handleCategoryPreference(category.key, 'skip')}
                  className={`p-3 rounded-lg border-2 transition-all text-sm ${
                    preference === 'skip'
                      ? 'border-red-500 bg-red-500/20 text-white'
                      : 'border-yellow-700/30 bg-gray-800/50 text-gray-300 hover:border-yellow-500/50'
                  }`}
                >
                  🚫 Skip entirely
                </button>
              </div>

              {preference === 'choose' && (
                <div className="mt-4 pt-4 border-t border-yellow-700/20">
                  <p className="text-gray-400 text-sm mb-3">
                    Select the {category.label.toLowerCase()} you want in your meal plan:
                    <span className="text-yellow-500 ml-2">({categoryFoods.length} selected)</span>
                  </p>

                  {!foodsLoaded ? (
                    <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-yellow-500" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <p className="text-gray-400 text-sm">Loading food options...</p>
                      </div>
                    </div>
                  ) : foods.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                      {foods.map(food => {
                        const isSelected = categoryFoods.includes(food.name);
                        return (
                          <button
                            key={food.name} type="button"
                            onClick={() => handleFoodSelection(category.key, food.name)}
                            className={`p-2 rounded-lg border text-sm text-left transition-all ${
                              isSelected
                                ? 'border-yellow-500 bg-yellow-500/20 text-white'
                                : 'border-gray-700 bg-gray-800/30 text-gray-300 hover:border-yellow-500/50'
                            }`}
                          >
                            <span className="block font-medium truncate">{food.name}</span>
                            <span className="text-xs text-gray-500">
                              {food.servings && food.servings[0] ? `${food.servings[0].calories} cal` : 'N/A'}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                      <p className="text-gray-400 text-sm">No foods available for this category.</p>
                    </div>
                  )}
                </div>
              )}

              {preference === 'skip' && (
                <p className="text-red-400 text-sm mt-2">
                  ⚠️ No {category.label.toLowerCase()} will be included in your meal plan.
                </p>
              )}

              {preference === 'all' && (
                <p className="text-green-400 text-sm mt-2">
                  ✓ All {foods.length} {category.label.toLowerCase()} options will be available for your meal plan.
                </p>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderProgressBar = () => (
    <div className="mb-8">
      <div className="flex justify-between mb-2">
        {[1, 2, 3, 4, 5, 6, 7].map(step => (
          <div
            key={step}
            className={`flex items-center justify-center w-10 h-10 rounded-full font-bold transition-all ${
              step === currentStep
                ? 'bg-yellow-500 text-black'
                : step < currentStep
                ? 'bg-yellow-500/50 text-black'
                : 'bg-gray-700 text-gray-400'
            }`}
          >
            {step < currentStep ? '✓' : step === 7 ? '✓' : step}
          </div>
        ))}
      </div>
      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-yellow-500 transition-all duration-300"
          style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
        />
      </div>
      <div className="flex justify-between mt-2 text-xs text-gray-400">
        <span>Personal</span>
        <span>Metrics</span>
        <span>Activity</span>
        <span>Lifestyle</span>
        <span>Foods</span>
        <span>Pattern</span>
        <span>Review</span>
      </div>
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      case 5: return renderStep5();
      case 6: return renderStep6();
      case 7: return (
        <ReviewScreen 
          formData={formData}
          organizedFoods={organizedFoods}
          onEdit={handleEditStep}
          onConfirm={handleSubmit}
          isSubmitting={isSubmitting}
        />
      );
      default: return null;
    }
  };

  return (
  <div className="min-h-screen bg-black py-12 px-4">
    <PlanSelectorBar />
    <div className="max-w-3xl mx-auto">

      <div className="text-center mb-8">

          <h1 className="text-4xl font-bold text-white mb-2">
            Build Your <span className="text-yellow-500">Custom Plan</span>
          </h1>
          <p className="text-gray-400">Complete the form below to get your personalized meal plan</p>
        </div>

        {renderProgressBar()}

        <div className="bg-gray-900/30 border border-yellow-700/30 rounded-xl p-6 md:p-8">
          {renderStepContent()}

          {errors.submit && (
            <div className="mt-6 p-4 bg-red-500/20 border border-red-500 rounded-lg">
              <p className="text-red-400">{errors.submit}</p>
            </div>
          )}

          <div className="flex justify-between mt-8 pt-6 border-t border-yellow-700/20">
            <button
              type="button"
              onClick={handleBack}
              disabled={currentStep === 1}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                currentStep === 1
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-700 text-white hover:bg-gray-600'
              }`}
            >
              ← Back
            </button>

            {currentStep < totalSteps ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-8 py-3 bg-yellow-500 hover:bg-yellow-600 text-black font-bold rounded-lg transition-all"
              >
                Next →
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-center items-center gap-6 text-gray-500 text-sm">
        <span className="flex items-center gap-2">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
          Secure & Encrypted
        </span>
        <span className="flex items-center gap-2">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          100% Personalized
        </span>
      </div>

      {/* Photo Consent Modal */}
      <PhotoConsentModal 
        isOpen={showPhotoConsentModal}
        onConfirm={handlePhotoConsentConfirm}
        clientName={formData.firstName}
      />

    </div>
  );
}
