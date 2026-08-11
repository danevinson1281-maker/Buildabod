// /components/PlanEditorModal.js

'use client';

import { useState, useEffect } from 'react';
import styles from './PlanEditorModal.module.css';

export default function PlanEditorModal({
  client,
  mealPlanData,
  macroData,
  onClose,
  onSave,
}) {
  const [editingMeals, setEditingMeals] = useState(null);
  const [editingMacros, setEditingMacros] = useState(null);
  const [adminNote, setAdminNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [expandedMeal, setExpandedMeal] = useState(null);

  useEffect(() => {
    if (mealPlanData?.meals_data) {
      setEditingMeals(JSON.parse(JSON.stringify(mealPlanData.meals_data)));
    }
    if (macroData) {
      setEditingMacros({
        protein: macroData.daily_protein_g || 0,
        carbs: macroData.daily_carbs_g || 0,
        fats: macroData.daily_fats_g || 0,
      });
    }
  }, [mealPlanData, macroData]);

  const calculateCalories = (protein, carbs, fats) => {
    return protein * 4 + carbs * 4 + fats * 9;
  };

  const currentCalories = editingMacros
    ? calculateCalories(editingMacros.protein, editingMacros.carbs, editingMacros.fats)
    : 0;

  const handleRemoveFood = (mealKey, foodIndex) => {
    setEditingMeals(prev => {
      const updated = { ...prev };
      const meals = updated.meals || {};
      if (meals[mealKey]) {
        meals[mealKey].foods = meals[mealKey].foods.filter((_, idx) => idx !== foodIndex);
        // Recalculate meal totals
        recalculateMealTotals(meals[mealKey]);
      }
      return updated;
    });
  };

  const handleRemoveMeal = (mealKey) => {
    setEditingMeals(prev => {
      const updated = { ...prev };
      const meals = updated.meals || {};
      delete meals[mealKey];
      return updated;
    });
  };

  const recalculateMealTotals = (meal) => {
    if (!meal.foods) return;
    const totals = {
      calories: 0,
      protein_g: 0,
      carbs_g: 0,
      fats_g: 0,
    };
    meal.foods.forEach(food => {
      totals.calories += food.calories || 0;
      totals.protein_g += food.protein_g || 0;
      totals.carbs_g += food.carbs_g || 0;
      totals.fats_g += food.fats_g || 0;
    });
    meal.totals = totals;
  };

  const handleSaveAndSend = async () => {
    if (!editingMeals || !editingMacros) return;

    setSaving(true);
    try {
      const response = await fetch('/api/admin/update-and-send-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: client.id,
          mealsData: editingMeals,
          targetCalories: currentCalories,
          targetProteinG: editingMacros.protein,
          targetCarbsG: editingMacros.carbs,
          targetFatsG: editingMacros.fats,
          adminNote: adminNote || null,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update plan');

      alert('Plan updated and client notified!');
      onSave();
      onClose();
    } catch (error) {
      alert('Error: ' + error.message);
    }
    setSaving(false);
  };

  if (!editingMeals || !editingMacros) {
    return (
      <div className={styles.modalOverlay}>
        <div className={styles.modal}>
          <div className={styles.loadingBox}>
            <div className={styles.spinner}></div>
            <p>Loading plan editor...</p>
          </div>
        </div>
      </div>
    );
  }

  const meals = editingMeals.meals || {};
  const mealsArray = Object.entries(meals)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => {
      const aNum = parseInt(a.name.match(/\d+/)?.[0] || 0);
      const bNum = parseInt(b.name.match(/\d+/)?.[0] || 0);
      return aNum - bNum;
    });

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Edit Plan for {client.full_name}</h2>
          <button onClick={onClose} className={styles.modalClose}>X</button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.twoColumn}>
            {/* LEFT: Meals */}
            <div className={styles.mealsSection}>
              <h3 className={styles.sectionTitle}>Meal Plan</h3>
              <div className={styles.mealsContainer}>
                {mealsArray.map((meal, idx) => (
                  <div key={idx} className={styles.mealCard}>
                    <button
                      className={styles.mealHeader}
                      onClick={() => setExpandedMeal(expandedMeal === idx ? null : idx)}
                    >
                      <span className={styles.mealName}>{meal.name}</span>
                      <span className={styles.mealMacros}>
                        {meal.totals?.calories || 0} cal
                      </span>
                      <span className={styles.expandIcon}>{expandedMeal === idx ? '▼' : '▶'}</span>
                    </button>

                    {expandedMeal === idx && (
                      <div className={styles.mealContent}>
                        <div className={styles.foodsList}>
                          {meal.foods?.map((food, foodIdx) => (
                            <div key={foodIdx} className={styles.foodItem}>
                              <div className={styles.foodInfo}>
                                <span className={styles.foodName}>{food.name}</span>
                                <span className={styles.foodPortion}>{food.portion}</span>
                              </div>
                              <button
                                onClick={() => handleRemoveFood(meal.name, foodIdx)}
                                className={styles.removeBtn}
                                title="Remove food"
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                        <button
                          onClick={() => handleRemoveMeal(meal.name)}
                          className={styles.removeMealBtn}
                        >
                          🗑️ Remove Entire Meal
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT: Macros */}
            <div className={styles.macrosSection}>
              <h3 className={styles.sectionTitle}>Daily Macros</h3>

              <div className={styles.macroInputs}>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Protein (g)</label>
                  <input
                    type="number"
                    value={editingMacros.protein}
                    onChange={(e) =>
                      setEditingMacros({
                        ...editingMacros,
                        protein: parseInt(e.target.value) || 0,
                      })
                    }
                    className={styles.input}
                    min="0"
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Carbs (g)</label>
                  <input
                    type="number"
                    value={editingMacros.carbs}
                    onChange={(e) =>
                      setEditingMacros({
                        ...editingMacros,
                        carbs: parseInt(e.target.value) || 0,
                      })
                    }
                    className={styles.input}
                    min="0"
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Fats (g)</label>
                  <input
                    type="number"
                    value={editingMacros.fats}
                    onChange={(e) =>
                      setEditingMacros({
                        ...editingMacros,
                        fats: parseInt(e.target.value) || 0,
                      })
                    }
                    className={styles.input}
                    min="0"
                  />
                </div>
              </div>

              <div className={styles.calorieBox}>
                <p className={styles.calorieLabel}>Total Daily Calories</p>
                <p className={styles.calorieValue}>{currentCalories}</p>
                <p className={styles.breakdown}>
                  {editingMacros.protein}g × 4 + {editingMacros.carbs}g × 4 + {editingMacros.fats}g × 9
                </p>
              </div>

              <div className={styles.noteSection}>
                <label className={styles.label}>Note to Client (Optional)</label>
                <textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="E.g., 'Increased protein for muscle gain' or 'Swapped foods for your preferences'"
                  className={styles.textarea}
                  rows={4}
                />
              </div>
            </div>
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button
            onClick={handleSaveAndSend}
            disabled={saving}
            className={styles.saveBtn}
          >
            {saving ? 'Updating...' : '✅ Approve & Send Plan'}
          </button>
          <button onClick={onClose} className={styles.cancelBtn}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
