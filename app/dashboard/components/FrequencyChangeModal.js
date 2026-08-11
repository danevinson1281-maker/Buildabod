// /app/dashboard/components/FrequencyChangeModal.js
'use client';

import { useState, useEffect } from 'react';
import { generateMealPlan } from '@/lib/mealPlanGenerator';
import { daysUntilNextChange } from '@/lib/frequencyHelpers';
import styles from './FrequencyChangeModal.module.css';

export default function FrequencyChangeModal({
  client,
  currentMealsPerDay,
  lastFrequencyChangeDate,
  selectedFoods,
  targetCalories,
  targetProtein,
  targetCarbs,
  targetFats,
  mealVariety,
  onClose,
  onConfirm,
}) {
  const [selectedFrequency, setSelectedFrequency] = useState(null);
  const [previewMeals, setPreviewMeals] = useState(null);
  const [loading, setLoading] = useState(false);
  const [canChange, setCanChange] = useState(true);
  const [daysUntil, setDaysUntil] = useState(0);

  useEffect(() => {
    // Check cooldown
    const days = daysUntilNextChange(lastFrequencyChangeDate);
    setDaysUntil(days);
    setCanChange(days === 0);
  }, [lastFrequencyChangeDate]);

  const handleSelectFrequency = async (freq) => {
    if (freq === currentMealsPerDay) {
      alert('You are already on ' + freq + ' meals per day');
      return;
    }

    setSelectedFrequency(freq);
    setLoading(true);

    try {
      // Generate preview
      const preview = generateMealPlan({
        selectedFoods,
        fullName: client.full_name,
        mealsPerDay: freq,
        mealVariety: mealVariety || 'mix',
        targetCalories,
        targetProtein,
        targetCarbs,
        targetFats,
      });

      setPreviewMeals(preview.meals);
    } catch (error) {
      console.error('Error generating preview:', error);
      alert('Error generating preview: ' + error.message);
      setSelectedFrequency(null);
    } finally {
      setLoading(false);
    }
  };

    const handleConfirmChange = async () => {
  if (!selectedFrequency || !canChange) return;

  setLoading(true);
  try {
    const response = await fetch('/api/clients/change-meal-frequency', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientId: client.id,
        newMealsPerDay: selectedFrequency,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to change meal frequency');
    }

    alert(`✅ Meal plan updated! You now have ${selectedFrequency} meals per day.`);
    
    // FIXED: Keep the ORIGINAL daily targets — don't recalculate from meals!
    onConfirm?.({
      newMealsPerDay: selectedFrequency,
      newMealPlan: data.newMealPlan,
      newTargets: {
        calories: targetCalories,
        protein: targetProtein,
        carbs: targetCarbs,
        fats: targetFats,
      },
    });
    
    onClose();
  } catch (error) {
    alert('Error: ' + error.message);
  } finally {
    setLoading(false);
  }
};



  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Adjust Meal Frequency</h2>
          <button onClick={onClose} className={styles.modalClose}>✕</button>
        </div>

        {!canChange && (
          <div className={styles.cooldownWarning}>
            ⏱️ You can change meal frequency again in <strong>{daysUntil} day{daysUntil !== 1 ? 's' : ''}</strong>
          </div>
        )}

        <div className={styles.modalBody}>
          {!previewMeals ? (
            <div className={styles.frequencySelector}>
              <p className={styles.selectorLabel}>Current: <strong>{currentMealsPerDay} meals/day</strong></p>
              <p className={styles.selectorSubtext}>Your daily macros stay the same. We'll split them across your new meal count.</p>

              <div className={styles.frequencyOptions}>
                {[2, 3, 4, 5, 6].map(freq => (
                  <button
                    key={freq}
                    onClick={() => handleSelectFrequency(freq)}
                    disabled={!canChange || freq === currentMealsPerDay || loading}
                    className={`${styles.frequencyOption} ${
                      selectedFrequency === freq ? styles.selected : ''
                    } ${freq === currentMealsPerDay ? styles.disabled : ''}`}
                  >
                    {freq} meals/day
                  </button>
                ))}
              </div>

              {!canChange && (
                <p className={styles.cooldownNotice}>
                  Your last change was {lastFrequencyChangeDate ? new Date(lastFrequencyChangeDate).toLocaleDateString() : 'never'}. Come back in {daysUntil} day{daysUntil !== 1 ? 's' : ''}.
                </p>
              )}
            </div>
          ) : (
            <div className={styles.preview}>
              <h3 className={styles.previewTitle}>Preview: {selectedFrequency} Meals/Day</h3>
              <p className={styles.previewSubtext}>Here's what your new meal plan will look like:</p>

              <div className={styles.previewMeals}>
                {Object.entries(previewMeals).map(([mealName, mealData]) => (
                  <div key={mealName} className={styles.previewMeal}>
                    <h4 className={styles.mealName}>{mealName}</h4>
                    <div className={styles.foodsList}>
                      {mealData.foods?.map((food, idx) => (
                        <div key={idx} className={styles.foodItem}>
                          <span className={styles.foodName}>{food.name}</span>
                          <span className={styles.foodPortion}>{food.portion}</span>
                        </div>
                      ))}
                    </div>
                    <div className={styles.mealMacros}>
                      {mealData.totals?.calories} cal | P: {mealData.totals?.protein_g}g | C: {mealData.totals?.carbs_g}g | F: {mealData.totals?.fats_g}g
                    </div>
                  </div>
                ))}
              </div>

              <div className={styles.previewActions}>
                <button
                  onClick={() => setPreviewMeals(null)}
                  className={styles.backBtn}
                  disabled={loading}
                >
                  ← Back
                </button>
                <button
                  onClick={handleConfirmChange}
                  disabled={loading}
                  className={styles.confirmBtn}
                >
                  {loading ? 'Updating...' : '✅ Confirm & Apply'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
