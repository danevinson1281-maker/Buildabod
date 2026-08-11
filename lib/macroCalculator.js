// app/lib/macroCalculator.js

export function calculateMacros(clientData) {
  // ── Unit conversions ──────────────────────────────────────────────────────
  // Mifflin-St Jeor uses imperial units directly (lbs, inches)
  const weightLbs = parseFloat(clientData.currentWeight) || 200;
  const heightIn  = parseFloat(clientData.height) || parseFloat(clientData.heightInches) || 70;
  const age = parseInt(clientData.age) || 30;
  const gender = (clientData.gender || 'male').toLowerCase();
  const primaryGoal = (clientData.primaryGoal || 'stay-healthy').toLowerCase();
  const activityLevel = (clientData.activityLevel || 'moderately-active').toLowerCase();

  console.log('=== MACRO CALCULATOR (Mifflin-St Jeor) ===');
  console.log('Input:', { weightLbs, heightIn, age, gender, primaryGoal, activityLevel });

  // ── Mifflin-St Jeor BMR (imperial) ───────────────────────────────────────
  let bmr;
  if (gender === 'male' || gender === 'other') {
    // BMR = (10 × weight_kg) + (6.25 × height_cm) - (5 × age) + 5
    bmr = (10 * (weightLbs / 2.205)) + (6.25 * (heightIn * 2.54)) - (5 * age) + 5;
  } else {
    // BMR = (10 × weight_kg) + (6.25 × height_cm) - (5 × age) - 161
    bmr = (10 * (weightLbs / 2.205)) + (6.25 * (heightIn * 2.54)) - (5 * age) - 161;
  }

  console.log('BMR:', Math.round(bmr));

  // ── Activity multiplier (NEAT factor) ─────────────────────────────────────
  const activityMultipliers = {
    'sedentary':         1.2,
    'lightly-active':    1.375,
    'moderately-active': 1.55,
    'very-active':       1.725,
    'extremely-active':  1.9,
  };

  let multiplier = 1.55;
  for (const [key, value] of Object.entries(activityMultipliers)) {
    if (activityLevel.includes(key.replace('-', ' ')) || activityLevel === key) {
      multiplier = value;
      break;
    }
  }

  const tdee = bmr * multiplier;
  console.log(`TDEE (${activityLevel}):`, Math.round(tdee), `| multiplier: ${multiplier}`);

  // ── Goal-based calorie adjustment ─────────────────────────────────────────
  let targetCalories;

  if (primaryGoal.includes('lose') || primaryGoal.includes('fat')) {
    const deficit = weightLbs > 200 ? 700 : 600;
    targetCalories = tdee - deficit;
    const floor = gender === 'female' ? 1300 : 1500;
    targetCalories = Math.max(targetCalories, floor);
    console.log(`Fat loss: deficit of ${deficit} cal`);
  } else if (primaryGoal.includes('gain') || primaryGoal.includes('muscle')) {
    targetCalories = tdee + 400;
    console.log('Muscle gain: +400 cal surplus');
  } else {
    targetCalories = tdee;
    console.log('Maintenance: at TDEE');
  }

  console.log('Target calories:', Math.round(targetCalories));

  // ── Protein — goal-based, per pound of bodyweight ─────────────────────────
  let proteinPerLb;
  if (primaryGoal.includes('lose') || primaryGoal.includes('fat')) {
    proteinPerLb = 1.1;
  } else if (primaryGoal.includes('gain') || primaryGoal.includes('muscle')) {
    proteinPerLb = 1.2;
  } else {
    proteinPerLb = 1.0;
  }

  const protein = Math.round(weightLbs * proteinPerLb);
  const proteinCalories = protein * 4;

  // ── Fats — 25% of target calories ─────────────────────────────────────────
  const fatCalories = targetCalories * 0.25;
  const fats = Math.round(fatCalories / 9);

  // ── Carbs — fill remaining calories ───────────────────────────────────────
  const remainingCalories = targetCalories - proteinCalories - (fats * 9);
  const carbs = Math.max(Math.round(remainingCalories / 4), 50);

  // ── Recalculate actual calories from macros ───────────────────────────────
  const actualCalories = Math.round(protein * 4 + carbs * 4 + fats * 9);

  // CRITICAL: Return with correct property names that the API expects
  const macros = {
    calories: actualCalories,    // ✅ was: dailyCalories
    protein: protein,             // ✅ was: dailyProtein
    carbs: carbs,                 // ✅ was: dailyCarbs
    fats: fats,                   // ✅ was: dailyFats
    tdee: Math.round(tdee),
  };

  console.log('Final macros:', macros);
  console.log('=========================================');

  return macros;
}

export function validateMacros(macros) {
  const issues = [];

  if (macros.calories < 1200) issues.push('Calories too low (minimum 1200)');
  if (macros.calories > 6000) issues.push('Calories too high (maximum 6000)');
  if (macros.protein < 50) issues.push('Protein too low (minimum 50g)');
  if (macros.protein > 500) issues.push('Protein too high (maximum 500g)');
  if (macros.carbs < 50) issues.push('Carbs too low (minimum 50g)');
  if (macros.carbs > 800) issues.push('Carbs too high (maximum 800g)');
  if (macros.fats < 20) issues.push('Fats too low (minimum 20g)');
  if (macros.fats > 300) issues.push('Fats too high (maximum 300g)');

  return { valid: issues.length === 0, issues };
}
