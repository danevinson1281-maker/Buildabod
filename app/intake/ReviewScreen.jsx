'use client';

export default function ReviewScreen({ formData, organizedFoods, onEdit, onConfirm, isSubmitting }) {
  const heightFeet = parseInt(formData.heightFeet);
  const heightInches = parseInt(formData.heightInches);
  const heightDisplay = `${heightFeet}'${heightInches}"`;

  // Calculate total foods selected (same logic as form)
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

  // Format allergen list
  const allergyList = (formData.allergies || []).length > 0 
    ? formData.allergies.join(', ')
    : 'None';

  // Format cooking methods
  const cookingMethodsList = (formData.cookingMethods || []).length > 0
    ? formData.cookingMethods.map(m => m.charAt(0).toUpperCase() + m.slice(1)).join(', ')
    : 'Not specified';

  // Goal label mapping
  const goalLabels = {
    'fat-loss': '🔥 Lose Fat',
    'build-muscle': '💪 Build Muscle',
    'stay-healthy': '❤️ Stay Healthy',
  };

  const mealPatternLabels = {
    'balanced': '⚖️ Balanced',
    'heavy-light': '📊 Heavy & Light',
    'custom': '🎯 Custom',
  };

  const dietaryLabels = {
    'omnivore': '🍽️ Omnivore',
    'vegetarian': '🥬 Vegetarian',
    'vegan': '🌱 Vegan',
  };

  const experienceLabels = {
    'beginner': 'Beginner',
    'intermediate': 'Intermediate',
    'advanced': 'Advanced',
  };

  const activityLabels = {
    'sedentary': 'Sedentary',
    'lightly-active': 'Lightly Active',
    'moderately-active': 'Moderately Active',
    'very-active': 'Very Active',
    'extremely-active': 'Extremely Active',
  };

  const cardioLabels = {
    'none': '🚫 No Cardio',
    'low': '🚶 Low Intensity',
    'high': '🏃 High Intensity',
  };

  const mealVarietyLabels = {
    'mix': 'Mix It Up',
    'some-repeats': 'Some Repeats',
    'simple': 'Keep It Simple',
  };

  // Determine if plan is Kickstart
  const isKickstart = (formData.planType || '').toLowerCase() === 'kickstart';

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Review Your Information</h2>
        <p className="text-gray-400">
          Make sure everything looks correct before we proceed to payment. You can edit any section below.
        </p>
      </div>

      {/* EMAIL ALERT CARD */}
      <div className="bg-red-500/10 border-2 border-red-500/30 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="text-3xl">📧</div>
          <div className="flex-1">
            <h3 className="font-bold text-white mb-2">Confirm Your Email</h3>
            <p className="text-gray-300 text-sm mb-3">
              Your meal plan and login credentials will be sent to this email address.
            </p>
            <p className="text-lg font-mono bg-gray-900/50 border border-red-500/30 rounded-lg px-4 py-2 text-yellow-400">
              {formData.email}
            </p>
            <button
              type="button"
              onClick={() => onEdit(1)}
              className="mt-3 text-red-400 hover:text-red-300 text-sm font-medium underline"
            >
              ✏️ Edit Email
            </button>
          </div>
        </div>
      </div>

      {/* PLAN SELECTION CARD */}
      <div className="bg-yellow-500/10 border-2 border-yellow-500/30 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="text-3xl">📋</div>
          <div className="flex-1">
            <h3 className="font-bold text-white mb-2">Your Plan</h3>
            <div className="flex items-baseline gap-2 mb-3">
              <p className="text-2xl font-bold text-yellow-400">
                {formData.planType === 'kickstart' ? 'Kickstart — $67' : 
                 formData.planType === 'pro' ? 'Pro — $127/month' :
                 formData.planType === 'elite' ? 'Elite — $197/month' : 'Select a plan'}
              </p>
            </div>
            <p className="text-gray-300 text-sm mb-3">
              {formData.planType === 'kickstart' ? 'One-time custom meal plan. Perfect for testing or a specific event.' :
               formData.planType === 'pro' ? 'Monthly subscription with weekly check-ins and monthly adjustments.' :
               formData.planType === 'elite' ? 'Premium monthly subscription with weekly check-ins and priority support.' :
               'No plan selected'}
            </p>
            <button
              type="button"
              onClick={() => onEdit(1)}
              className="text-yellow-400 hover:text-yellow-300 text-sm font-medium underline"
            >
              ✏️ Change Plan
            </button>
          </div>
        </div>
      </div>

      {/* REFERRAL CODE CARD — ONLY FOR PRO & ELITE */}
      {formData.referralCode && !isKickstart && (
        <div className="bg-green-500/10 border-2 border-green-500/30 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="text-3xl">🎁</div>
            <div className="flex-1">
              <h3 className="font-bold text-white mb-2">Referral Code Applied</h3>
              <p className="text-gray-300 text-sm mb-3">
                Get <span className="text-green-400 font-bold">10% off your first month</span> with this referral code. Your referrer also gets $40 in rewards!
              </p>
              <p className="text-lg font-mono bg-gray-900/50 border border-green-500/30 rounded-lg px-4 py-2 text-green-400">
                {formData.referralCode}
              </p>
              <button
                type="button"
                onClick={() => onEdit(1)}
                className="mt-3 text-green-400 hover:text-green-300 text-sm font-medium underline"
              >
                ✏️ Edit Referral Code
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PERSONAL INFO CARD */}
      <div className="bg-gray-900/50 border border-yellow-700/30 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white">👤 Personal Information</h3>
          <button
            type="button"
            onClick={() => onEdit(1)}
            className="text-yellow-500 hover:text-yellow-400 text-sm font-medium"
          >
            ✏️ Edit
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <p className="text-gray-400 text-xs font-semibold uppercase">Name</p>
            <p className="text-white font-medium">{formData.firstName} {formData.lastName}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs font-semibold uppercase">Age</p>
            <p className="text-white font-medium">{formData.age}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs font-semibold uppercase">Gender</p>
            <p className="text-white font-medium capitalize">{formData.gender}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs font-semibold uppercase">Phone</p>
            <p className="text-white font-medium">{formData.phone}</p>
          </div>
        </div>
      </div>

      {/* BODY METRICS CARD */}
      <div className="bg-gray-900/50 border border-yellow-700/30 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white">📊 Body Metrics</h3>
          <button
            type="button"
            onClick={() => onEdit(2)}
            className="text-yellow-500 hover:text-yellow-400 text-sm font-medium"
          >
            ✏️ Edit
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <p className="text-gray-400 text-xs font-semibold uppercase">Height</p>
            <p className="text-white font-medium">{heightDisplay}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs font-semibold uppercase">Current Weight</p>
            <p className="text-white font-medium">{formData.currentWeight} lbs</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs font-semibold uppercase">Goal Weight</p>
            <p className="text-white font-medium">{formData.goalWeight} lbs</p>
          </div>
        </div>
      </div>

      {/* GOALS & FITNESS CARD */}
      <div className="bg-gray-900/50 border border-yellow-700/30 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white">🎯 Goals & Experience</h3>
          <button
            type="button"
            onClick={() => onEdit(2)}
            className="text-yellow-500 hover:text-yellow-400 text-sm font-medium"
          >
            ✏️ Edit
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
          <div>
            <p className="text-gray-400 text-xs font-semibold uppercase">Primary Goal</p>
            <p className="text-white font-medium">{goalLabels[formData.primaryGoal] || formData.primaryGoal}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs font-semibold uppercase">Experience Level</p>
            <p className="text-white font-medium capitalize">{experienceLabels[formData.experienceLevel] || formData.experienceLevel}</p>
          </div>
        </div>
      </div>

      {/* ACTIVITY & CARDIO CARD */}
      <div className="bg-gray-900/50 border border-yellow-700/30 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white">💪 Activity & Cardio</h3>
          <button
            type="button"
            onClick={() => onEdit(3)}
            className="text-yellow-500 hover:text-yellow-400 text-sm font-medium"
          >
            ✏️ Edit
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
          <div>
            <p className="text-gray-400 text-xs font-semibold uppercase">Activity Level</p>
            <p className="text-white font-medium">{activityLabels[formData.activityLevel] || formData.activityLevel}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs font-semibold uppercase">Cardio Preference</p>
            <p className="text-white font-medium">{cardioLabels[formData.cardioPreference] || formData.cardioPreference}</p>
          </div>
        </div>
      </div>

      {/* MEALS & PREFERENCES CARD */}
      <div className="bg-gray-900/50 border border-yellow-700/30 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white">🍽️ Meals & Preferences</h3>
          <button
            type="button"
            onClick={() => onEdit(4)}
            className="text-yellow-500 hover:text-yellow-400 text-sm font-medium"
          >
            ✏️ Edit
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <p className="text-gray-400 text-xs font-semibold uppercase">Meals Per Day</p>
            <p className="text-white font-medium">{formData.mealsPerDay} meals</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs font-semibold uppercase">Meal Variety</p>
            <p className="text-white font-medium">{mealVarietyLabels[formData.mealVariety] || formData.mealVariety}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs font-semibold uppercase">Diet Type</p>
            <p className="text-white font-medium">{dietaryLabels[formData.dietaryType] || formData.dietaryType}</p>
          </div>
        </div>
      </div>

      {/* ALLERGIES & RESTRICTIONS CARD */}
      <div className="bg-gray-900/50 border border-yellow-700/30 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white">⚠️ Allergies & Restrictions</h3>
          <button
            type="button"
            onClick={() => onEdit(4)}
            className="text-yellow-500 hover:text-yellow-400 text-sm font-medium"
          >
            ✏️ Edit
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-gray-400 text-xs font-semibold uppercase mb-1">Allergies</p>
            <p className={`font-medium ${formData.allergies && formData.allergies.length > 0 ? 'text-red-400': 'text-green-400'}`}>
              {allergyList}
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-xs font-semibold uppercase mb-1">Cooking Methods</p>
            <p className="text-white font-medium">{cookingMethodsList}</p>
          </div>
        </div>
      </div>

      {/* MEAL PATTERN CARD */}
      <div className="bg-gray-900/50 border border-yellow-700/30 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white">📋 Meal Pattern</h3>
          <button
            type="button"
            onClick={() => onEdit(5)}
            className="text-yellow-500 hover:text-yellow-400 text-sm font-medium"
          >
            ✏️ Edit
          </button>
        </div>
        <p className="text-white font-medium">
          {mealPatternLabels[formData.meal_pattern] || formData.meal_pattern}
        </p>
      </div>

      {/* FOOD SELECTIONS CARD */}
      <div className="bg-gray-900/50 border border-yellow-700/30 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white">🥗 Food Selections</h3>
          <button
            type="button"
            onClick={() => onEdit(6)}
            className="text-yellow-500 hover:text-yellow-400 text-sm font-medium"
          >
            ✏️ Edit
          </button>
        </div>
        <div className="bg-yellow-500/10 border border-yellow-500/50 rounded-lg p-4 text-center">
          <p className="text-gray-300 text-sm mb-1">Total Foods Selected</p>
          <p className="text-3xl font-bold text-yellow-500">{totalFoodsSelected}</p>
          <p className="text-gray-400 text-xs mt-2">Foods available for your custom meal plan</p>
        </div>
      </div>

      {/* CTA SECTION */}
      <div className="border-t border-yellow-700/20 pt-8 mt-8">
        <div className="space-y-4">
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className={`w-full py-4 rounded-lg font-bold text-lg transition-all ${
              isSubmitting
                ? 'bg-yellow-500/50 text-black/50 cursor-not-allowed'
                : 'bg-yellow-500 hover:bg-yellow-600 text-black'
            }`}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Processing...
              </span>
            ) : (
              '✓ Everything Looks Good → Continue to Payment'
            )}
          </button>

          <p className="text-center text-gray-500 text-xs">
            Secure & encrypted • 100% personalized
          </p>
        </div>
      </div>
    </div>
  );
}
