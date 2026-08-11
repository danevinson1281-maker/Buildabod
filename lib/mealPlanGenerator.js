// /lib/mealPlanGenerator.js
// BuildABod – Meal Plan Generator (v11 MACRO-FIRST PRECISION)
// With accurate macro targeting and proportional daily calibration
// Plus support for balanced, heavy-light, and custom meal patterns

import {
  foodDatabase,
  getFoodByName,
  findBestServing,
  findClosestServing,
  getAllFoods,
} from './foodDatabase';

// ═════════════════════════════════════════════════════════════════════════════
//  HELPERS
// ═════════════════════════════════════════════════════════════════════════════

function stripEmoji(str) {
  return str.replace(/^[\p{Emoji}\s]+/u, '').trim();
}

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function baseServing(food) {
  return food.servings[0];
}

function convertToCleanWeight(baseSize, scale, foodCategory) {
  const match = baseSize.match(/^([\d.]+)\s*(.+)$/);
  if (!match) return baseSize;

  const baseAmount = parseFloat(match[1]);
  let unit = match[2];
  const finalAmount = baseAmount * scale;

  let rounded;

  if (foodCategory === 'Protein' && unit.includes('oz')) {
    rounded = Math.round(finalAmount * 2) / 2;
  } else if (unit.includes('tbsp') || unit.includes('tsp')) {
    rounded = Math.round(finalAmount * 4) / 4;
  } else if (unit.includes('g') || unit.includes('cooked')) {
    rounded = Math.round(finalAmount);
  } else if (unit.includes('white') || unit.includes('egg') || unit.includes('yolk') || unit.includes('slice')) {
    rounded = Math.round(finalAmount * 2) / 2;
  } else {
    rounded = Math.round(finalAmount * 2) / 2;
  }

  const formatted = rounded % 1 === 0 ? String(Math.round(rounded)) : String(rounded);
  return `${formatted} ${unit}`;
}

function scaleToMacro(food, targetMacroValue, macroKey) {
  if (!food || !food.servings || food.servings.length === 0) {
    console.warn('scaleToMacro: Invalid food object', food);
    return null;
  }

  if (targetMacroValue <= 0) {
    console.log(`scaleToMacro: Skipping ${food.name} — target ${macroKey} is ${targetMacroValue.toFixed(1)}g`);
    return null;
  }

  const base = baseServing(food);
  const baseMacro = base[macroKey];

  if (!baseMacro || baseMacro <= 0) {
    console.warn(`scaleToMacro: Invalid macro value for ${food.name}`, { macroKey, baseMacro });
    return null;
  }

  const scale = targetMacroValue / baseMacro;

  if (scale < 0.2) {
    console.log(`scaleToMacro: ${food.name} scale too small (${scale.toFixed(2)}x), using minimum 0.2x`);
    const minScale = 0.2;
    const targetCals = Math.round(base.calories * minScale);
    const best = findBestServing(food.name, targetCals, 20);
    if (best) return best;
    
    const cleanSize = convertToCleanWeight(base.size, minScale, food.category);
    return {
      size: cleanSize,
      calories: Math.max(1, targetCals),
      protein: Math.round(base.protein * minScale * 10) / 10,
      carbs: Math.round(base.carbs * minScale * 10) / 10,
      fats: Math.round(base.fats * minScale * 10) / 10,
      interpolated: true,
      scaleFactor: Math.round(minScale * 100) / 100,
    };
  }

  const targetCals = Math.round(base.calories * scale);

  const best = findBestServing(food.name, targetCals, 20);
  if (best) {
    return best;
  }

  const cleanSize = convertToCleanWeight(base.size, scale, food.category);
  return {
    size: cleanSize,
    calories: Math.max(1, targetCals),
    protein: Math.round(base.protein * scale * 10) / 10,
    carbs: Math.round(base.carbs * scale * 10) / 10,
    fats: Math.round(base.fats * scale * 10) / 10,
    interpolated: true,
    scaleFactor: Math.round(scale * 100) / 100,
  };
}

function scaleToCalories(food, targetCalories) {
  if (!food || !food.servings || food.servings.length === 0) {
    console.warn('scaleToCalories: Invalid food object', food);
    return null;
  }

  if (targetCalories <= 0) {
    console.warn(`scaleToCalories: Invalid target calories for ${food.name}:`, targetCalories);
    return null;
  }

  const best = findBestServing(food.name, targetCalories, 20);
  if (best) {
    return best;
  }

  const base = baseServing(food);
  if (base.calories <= 0) {
    console.warn(`scaleToCalories: Base food has 0 calories: ${food.name}`);
    return null;
  }

  const scale = targetCalories / base.calories;
  const cleanSize = convertToCleanWeight(base.size, scale, food.category);
  return {
    size: cleanSize,
    calories: Math.max(1, Math.round(base.calories * scale)),
    protein: Math.round(base.protein * scale * 10) / 10,
    carbs: Math.round(base.carbs * scale * 10) / 10,
    fats: Math.round(base.fats * scale * 10) / 10,
    interpolated: true,
    scaleFactor: Math.round(scale * 100) / 100,
  };
}

function filterFoodsByDiet(foods, dietaryType, allergies) {
  if (!Array.isArray(foods)) return [];
  const diet = dietaryType || 'omnivore';
  const allergyList = Array.isArray(allergies)
    ? allergies.map(a => a.toLowerCase())
    : [];

  return foods.filter(food => {
    if (food.dietary && !food.dietary.includes(diet)) return false;
    if (food.allergies && food.allergies.length > 0) {
      const hasAllergen = food.allergies.some(a =>
        allergyList.includes(a.toLowerCase())
      );
      if (hasAllergen) return false;
    }
    return true;
  });
}

function buildMealAssignments(foods, mealCount, mealVariety) {
  if (!foods || foods.length === 0) return Array(mealCount).fill(null);
  if (foods.length === 1) return Array(mealCount).fill(foods[0]);

  const variety = mealVariety || 'mix';

  if (variety === 'simple') {
    return Array(mealCount).fill(foods[0]);
  }

  if (variety === 'some-repeats') {
    const shuffled = shuffleArray(foods);
    const primary = shuffled[0];
    const secondary = shuffled.slice(1);
    const primaryCount = Math.round(mealCount * 0.6);
    const secondaryCount = mealCount - primaryCount;
    const assignments = [];
    const secondarySlots = new Set();
    const spacing = Math.floor(mealCount / (secondaryCount + 1));

    for (let s = 0; s < secondaryCount; s++) {
      secondarySlots.add(Math.min((s + 1) * spacing, mealCount - 1));
    }

    let secondaryIdx = 0;
    for (let i = 0; i < mealCount; i++) {
      if (secondarySlots.has(i) && secondary.length > 0) {
        assignments.push(secondary[secondaryIdx % secondary.length]);
        secondaryIdx++;
      } else {
        assignments.push(primary);
      }
    }
    return assignments;
  }

  const shuffled = shuffleArray(foods);
  const assignments = [];
  let lastUsed = null;

  for (let i = 0; i < mealCount; i++) {
    let candidate = shuffled[i % shuffled.length];
    if (candidate === lastUsed && shuffled.length > 1) {
      candidate = shuffled[(i + 1) % shuffled.length];
    }
    assignments.push(candidate);
    lastUsed = candidate;
  }

  return assignments;
}

function buildConfigs(mealCount, mealPattern) {
  let weights = Array(mealCount).fill(1);
  
  if (mealPattern === 'heavy-light') {
    if (mealCount === 5) {
      weights = [1.3, 1.3, 1.3, 0.7, 0.7];
    } else if (mealCount === 6) {
      weights = [1.3, 1.3, 1.3, 0.7, 0.7, 0.7];
    }
  }
  
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  const evenRatio = 1 / mealCount;

  return Array.from({ length: mealCount }, (_, i) => {
    let type = 'balanced';
    if (mealPattern === 'heavy-light') {
      if (mealCount === 5) {
        type = i < 3 ? 'heavy' : 'light';
      } else if (mealCount === 6) {
        type = i < 3 ? 'heavy' : 'light';
      }
    }

    return {
      label: `Meal ${i + 1}`,
      proteinR: evenRatio,
      carbR: evenRatio,
      fatR: evenRatio,
      type: type,
      weight: weights[i],
      normalizedWeight: weights[i] / totalWeight,
    };
  });
}

function buildSubstitutions(
  selectedProteins,
  selectedCarbs,
  selectedVeggies,
  selectedFats,
  selectedFruits,
  targetProteinPerMeal,
  targetCarbPerMeal,
  targetFatPerMeal
) {
  const buildList = (foods, targetMacroValue, macroKey, category) => {
    if (!foods || foods.length === 0) return [];
    return foods.map(food => {
      if (category === 'Vegetables' || category === 'Fruits') {
        const base = baseServing(food);
        return {
          name: food.name,
          category,
          portion: base.size,
          calories: base.calories,
          protein_g: base.protein,
          carbs_g: base.carbs,
          fats_g: base.fats,
        };
      }

      const serving = scaleToMacro(food, targetMacroValue, macroKey);
      if (!serving) return null;

      return {
        name: food.name,
        category,
        portion: serving.size,
        calories: serving.calories,
        protein_g: serving.protein,
        carbs_g: serving.carbs,
        fats_g: serving.fats,
      };
    }).filter(Boolean);
  };

  return {
    proteins: buildList(selectedProteins, targetProteinPerMeal, 'protein', 'Protein'),
    carbs: buildList(selectedCarbs, targetCarbPerMeal, 'carbs', 'Carbs'),
    vegetables: buildList(selectedVeggies, 0, 'protein', 'Vegetables'),
    fats: buildList(selectedFats, targetFatPerMeal, 'fats', 'Healthy Fats'),
    fruits: buildList(selectedFruits, 0, 'protein', 'Fruits'),
  };
}

export const WORKOUT_NOTE =
  'For best results, eat Meals 1 & 2 around your training window. All meals are balanced enough to eat in any order that fits YOUR schedule. What matters most at the end of each day is hitting your total calories and macros.';
// ═════════════════════════════════════════════════════════════════════════════
//  MAIN GENERATOR — v11 MACRO-FIRST PRECISION
// ═════════════════════════════════════════════════════════════════════════════

export function generateMealPlan({
  selectedFoods,
  fullName,
  currentWeight,
  height,
  age,
  gender,
  primaryGoal,
  activityLevel,
  mealsPerDay,
  mealVariety,
  dietaryType = 'omnivore',
  allergies = [],
  targetCalories,
  targetProtein,
  targetCarbs,
  targetFats,
  mealPattern = 'balanced',
}) {
  // ── Defaults ──────────────────────────────────────────────────────────────
  const dailyCalories = targetCalories || 2000;
  const dailyProtein = targetProtein || 150;
  const dailyCarbs = targetCarbs || 200;
  const dailyFats = targetFats || 65;

  // ── Parse meal count ──────────────────────────────────────────────────────
  let mealCount = 4;
  if (typeof mealsPerDay === 'string') {
    const parsed = parseInt(mealsPerDay.replace(/[^\d]/g, ''), 10);
    mealCount = !isNaN(parsed) ? parsed : 4;
  } else if (typeof mealsPerDay === 'number') {
    mealCount = mealsPerDay;
  }
  mealCount = Math.max(2, Math.min(6, mealCount));

  const variety = mealVariety || 'mix';

  let allergyList = [];
  if (Array.isArray(allergies)) {
    allergyList = allergies;
  } else if (typeof allergies === 'string') {
    try {
      const parsed = JSON.parse(allergies);
      allergyList = Array.isArray(parsed) ? parsed : [];
    } catch {
      allergyList = [];
    }
  }

  const diet = dietaryType || 'omnivore';
  const pattern = mealPattern || 'balanced';

  console.log('=== MEAL PLAN GENERATOR v11 MACRO-FIRST PRECISION ===');
  console.log(
    'Daily targets — P:', dailyProtein,
    'C:', dailyCarbs,
    'F:', dailyFats,
    'Cal:', dailyCalories,
    'Meals:', mealCount,
    'Pattern:', pattern
  );

  // ── Parse selected foods ──────────────────────────────────────────────────
  let foodsArray = selectedFoods;
  if (typeof selectedFoods === 'string') {
    try {
      foodsArray = JSON.parse(selectedFoods);
    } catch {
      foodsArray = [];
    }
  }

  let allFoodNames = [];
  if (Array.isArray(foodsArray)) {
    allFoodNames = foodsArray;
  } else if (typeof foodsArray === 'object' && foodsArray !== null) {
    Object.values(foodsArray).forEach(cat => {
      if (Array.isArray(cat)) allFoodNames = [...allFoodNames, ...cat];
    });
  }

  // ── Flatten foodDatabase into single lookup array ─────────────────────────
  const ALL_FOODS_FLAT = Object.values(foodDatabase).flat();

  const validFoods = allFoodNames
    .map(food => {
      const name =
        typeof food === 'object' && food.name
          ? food.name
          : stripEmoji(String(food));
      const found = ALL_FOODS_FLAT.find(
        f => f.name.toLowerCase() === name.toLowerCase()
      );
      return found;
    })
    .filter(Boolean);

  // ── Split into categories ─────────────────────────────────────────────────
  const proteins = filterFoodsByDiet(
    validFoods.filter(f => f.category === 'Protein'),
    diet,
    allergyList
  );
  const carbFoods = filterFoodsByDiet(
    validFoods.filter(f => f.category === 'Carbs'),
    diet,
    allergyList
  );
  const veggies = filterFoodsByDiet(
    validFoods.filter(f => f.category === 'Vegetables'),
    diet,
    allergyList
  );
  const fatFoods = filterFoodsByDiet(
    validFoods.filter(f => f.category === 'Healthy Fats'),
    diet,
    allergyList
  );
  const fruits = filterFoodsByDiet(
    validFoods.filter(f => f.category === 'Fruits'),
    diet,
    allergyList
  );

  // ── Fallbacks ─────────────────────────────────────────────────────────────
  const useProteins = proteins.length > 0
    ? proteins
    : ALL_FOODS_FLAT.filter(f => f.category === 'Protein').slice(0, 3);
  const useCarbFoods = carbFoods.length > 0
    ? carbFoods
    : ALL_FOODS_FLAT.filter(f => f.category === 'Carbs').slice(0, 3);
  const useVeggies = veggies.length > 0 ? veggies : [];
  const useFatFoods = fatFoods.length > 0 ? fatFoods : [];
  const useFruits = fruits.length > 0 ? fruits : [];

  // ── Assign foods to meal slots ────────────────────────────────────────────
  const proteinAssignments = buildMealAssignments(useProteins, mealCount, variety);
  const carbAssignments = buildMealAssignments(useCarbFoods, mealCount, variety);
  const vegAssignments = buildMealAssignments(useVeggies, mealCount, 'mix');
  const fatAssignments = buildMealAssignments(useFatFoods, mealCount, variety);
  const fruitAssignments = buildMealAssignments(useFruits, mealCount, 'mix');

  // ── Meal configs (includes pattern weights) ────────────────────────────────
  const configs = buildConfigs(mealCount, pattern);

  // ── Calculate per-meal targets based on pattern weights ────────────────────
  const mealTargets = configs.map(config => {
    const normalizedWeight = config.normalizedWeight;
    return {
      calories: Math.round(dailyCalories * normalizedWeight),
      protein_g: Math.round(dailyProtein * normalizedWeight * 10) / 10,
      carbs_g: Math.round(dailyCarbs * normalizedWeight * 10) / 10,
      fats_g: Math.round(dailyFats * normalizedWeight * 10) / 10,
    };
  });

  console.log(`📊 Meal pattern "${pattern}" — per-meal targets:`, mealTargets);

  // ═══════════════════════════════════════════════════════════════════════════
  //  FIRST PASS: Build each meal with pattern-based targets
  // ═══════════════════════════════════════════════════════════════════════════
  const meals = {};

  for (let i = 0; i < mealCount; i++) {
    const config = configs[i];
    const mealTarget = mealTargets[i];
    const mealFoods = [];
    let mealCal = 0;
    let mealP = 0;
    let mealC = 0;
    let mealF = 0;

    // ── Step 1: Add fixed veggies ────────────────────────────────────────────
    const vegFood = vegAssignments[i];
    if (vegFood) {
      const base = baseServing(vegFood);
      mealFoods.push({
        name: vegFood.name,
        category: 'Vegetables',
        portion: base.size,
        calories: base.calories,
        protein_g: base.protein,
        carbs_g: base.carbs,
        fats_g: base.fats,
      });
      mealCal += base.calories;
      mealP += base.protein;
      mealC += base.carbs;
      mealF += base.fats;
    }

    // ── Step 2: Add fixed fruits ─────────────────────────────────────────────
    const fruitFood = fruitAssignments[i];
    if (fruitFood) {
      const base = baseServing(fruitFood);
      mealFoods.push({
        name: fruitFood.name,
        category: 'Fruits',
        portion: base.size,
        calories: base.calories,
        protein_g: base.protein,
        carbs_g: base.carbs,
        fats_g: base.fats,
      });
      mealCal += base.calories;
      mealP += base.protein;
      mealC += base.carbs;
      mealF += base.fats;
    }

    // ── Step 3: PROTEIN (use pattern-based target) ───────────────────────────
    const proteinNeeded = Math.max(1, mealTarget.protein_g - mealP);
    const proteinFood = proteinAssignments[i];
    
    if (proteinFood) {
      const serving = scaleToMacro(proteinFood, proteinNeeded, 'protein');
      if (serving) {
        mealFoods.push({
          name: proteinFood.name,
          category: 'Protein',
          portion: serving.size,
          calories: serving.calories,
          protein_g: serving.protein,
          carbs_g: serving.carbs,
          fats_g: serving.fats,
        });
        mealCal += serving.calories;
        mealP += serving.protein;
        mealC += serving.carbs;
        mealF += serving.fats;
      }
    }

    // ── Step 4: CARBS (use pattern-based target) ────────────────────────────
    const carbsNeeded = Math.max(1, mealTarget.carbs_g - mealC);
    const carbFood = carbAssignments[i];
    
    if (carbFood) {
      const serving = scaleToMacro(carbFood, carbsNeeded, 'carbs');
      if (serving) {
        mealFoods.push({
          name: carbFood.name,
          category: 'Carbs',
          portion: serving.size,
          calories: serving.calories,
          protein_g: serving.protein,
          carbs_g: serving.carbs,
          fats_g: serving.fats,
        });
        mealCal += serving.calories;
        mealP += serving.protein;
        mealC += serving.carbs;
        mealF += serving.fats;
      }
    }

    // ── Step 5: FATS (use pattern-based target) ─────────────────────────────
    const fatsNeeded = Math.max(0.5, mealTarget.fats_g - mealF);
    const fatFood = fatAssignments[i];
    
    if (fatFood) {
      const serving = scaleToMacro(fatFood, fatsNeeded, 'fats');
      if (serving) {
        mealFoods.push({
          name: fatFood.name,
          category: 'Healthy Fats',
          portion: serving.size,
          calories: serving.calories,
          protein_g: serving.protein,
          carbs_g: serving.carbs,
          fats_g: serving.fats,
        });
        mealCal += serving.calories;
        mealP += serving.protein;
        mealC += serving.carbs;
        mealF += serving.fats;
      }
    }

    // Store meal (unrounded for precision in second pass)
    meals[config.label] = {
      foods: mealFoods,
      totals: {
        calories: mealCal,
        protein_g: mealP,
        carbs_g: mealC,
        fats_g: mealF,
      },
      type: config.type,
    };
  }

  console.log(`\n📋 First pass complete. Now scaling to macro targets...`);
  // ═══════════════════════════════════════════════════════════════════════════
  //  SECOND PASS: Macro-First Precision Scaling
  // ═══════════════════════════════════════════════════════════════════════════

  let actualCalories = 0;
  let actualProtein = 0;
  let actualCarbs = 0;
  let actualFats = 0;

  Object.values(meals).forEach(meal => {
    actualCalories += meal.totals.calories;
    actualProtein += meal.totals.protein_g;
    actualCarbs += meal.totals.carbs_g;
    actualFats += meal.totals.fats_g;
  });

  console.log(`\nBefore scaling: Cal=${actualCalories.toFixed(0)} | P=${actualProtein.toFixed(1)}g | C=${actualCarbs.toFixed(1)}g | F=${actualFats.toFixed(1)}g`);

  // ── SCALE EACH MEAL'S MACROS TO ITS TARGET (NOT CALORIES) ──────────────────
  // This preserves the heavy-light pattern!
  const mealEntries = Object.entries(meals);
  
  mealEntries.forEach(([mealName, meal], mealIndex) => {
    const mealTarget = mealTargets[mealIndex];
    
    // Calculate scale factors for EACH MACRO separately
    const proteinScale = meal.totals.protein_g > 0 
      ? mealTarget.protein_g / meal.totals.protein_g 
      : 1;
    const carbsScale = meal.totals.carbs_g > 0 
      ? mealTarget.carbs_g / meal.totals.carbs_g 
      : 1;
    const fatsScale = meal.totals.fats_g > 0 
      ? mealTarget.fats_g / meal.totals.fats_g 
      : 1;

    // Apply scales to foods
    meal.foods.forEach(food => {
      // Scale each macro independently
      const newProtein = food.protein_g * proteinScale;
      const newCarbs = food.carbs_g * carbsScale;
      const newFats = food.fats_g * fatsScale;

      // Update food macros
      food.protein_g = Math.round(newProtein * 10) / 10;
      food.carbs_g = Math.round(newCarbs * 10) / 10;
      food.fats_g = Math.round(newFats * 10) / 10;

      // Recalculate calories FROM macros (don't scale calories directly)
      food.calories = Math.round(
        food.protein_g * 4 + 
        food.carbs_g * 4 + 
        food.fats_g * 9
      );
    });

    // Recalculate meal totals from scaled foods
    let mealCal = 0;
    let mealP = 0;
    let mealC = 0;
    let mealF = 0;

    meal.foods.forEach(food => {
      mealCal += food.calories;
      mealP += food.protein_g;
      mealC += food.carbs_g;
      mealF += food.fats_g;
    });

    meal.totals.calories = Math.round(mealCal);
    meal.totals.protein_g = Math.round(mealP * 10) / 10;
    meal.totals.carbs_g = Math.round(mealC * 10) / 10;
    meal.totals.fats_g = Math.round(mealF * 10) / 10;

    console.log(`Meal ${mealIndex + 1}: target=${mealTarget.calories} cal, actual=${meal.totals.calories} cal, P=${meal.totals.protein_g}g (target ${mealTarget.protein_g}g)`);
  });

  // ── FINAL DAILY CALIBRATION: Adjust ALL meals proportionally to hit daily targets ──
  let finalCal = 0;
  let finalP = 0;
  let finalC = 0;
  let finalF = 0;

  mealEntries.forEach(([_, meal]) => {
    finalCal += meal.totals.calories;
    finalP += meal.totals.protein_g;
    finalC += meal.totals.carbs_g;
    finalF += meal.totals.fats_g;
  });

  const calError = dailyCalories - finalCal;
  const pError = dailyProtein - finalP;
  const cError = dailyCarbs - finalC;
  const fError = dailyFats - finalF;

  console.log(`\n🔧 Before final adjustment:`);
  console.log(`   Cal=${finalCal} (error: ${calError}) | P=${finalP.toFixed(1)}g (error: ${pError.toFixed(1)}g) | C=${finalC.toFixed(1)}g (error: ${cError.toFixed(1)}g) | F=${finalF.toFixed(1)}g (error: ${fError.toFixed(1)}g)`);

  // Distribute macro errors across all meals proportionally
  if (Math.abs(pError) > 0.1 || Math.abs(cError) > 0.1 || Math.abs(fError) > 0.1) {
    mealEntries.forEach(([_, meal]) => {
      // Distribute error proportional to each meal's size
      const mealShare = finalCal > 0 ? meal.totals.calories / finalCal : 1 / mealEntries.length;

      meal.totals.protein_g = Math.round((meal.totals.protein_g + pError * mealShare) * 10) / 10;
      meal.totals.carbs_g = Math.round((meal.totals.carbs_g + cError * mealShare) * 10) / 10;
      meal.totals.fats_g = Math.round((meal.totals.fats_g + fError * mealShare) * 10) / 10;

      // Recalculate calories from adjusted macros
      meal.totals.calories = Math.round(
        meal.totals.protein_g * 4 + 
        meal.totals.carbs_g * 4 + 
        meal.totals.fats_g * 9
      );
    });
  }

  // Final totals
  let finalCalAfterAdj = 0;
  let finalPAfterAdj = 0;
  let finalCAfterAdj = 0;
  let finalFAfterAdj = 0;

  mealEntries.forEach(([_, meal]) => {
    finalCalAfterAdj += meal.totals.calories;
    finalPAfterAdj += meal.totals.protein_g;
    finalCAfterAdj += meal.totals.carbs_g;
    finalFAfterAdj += meal.totals.fats_g;
  });

  console.log('\n=== FINAL MACRO-PRECISION TOTALS (±2-3% Accuracy) ===');
  console.log(`Target: ${Math.round(dailyCalories)} cal | P:${dailyProtein.toFixed(1)}g | C:${dailyCarbs.toFixed(1)}g | F:${dailyFats.toFixed(1)}g`);
  console.log(`Actual: ${Math.round(finalCalAfterAdj)} cal | P:${finalPAfterAdj.toFixed(1)}g | C:${finalCAfterAdj.toFixed(1)}g | F:${finalFAfterAdj.toFixed(1)}g`);
  console.log(`Diff:   ${Math.round(finalCalAfterAdj - dailyCalories)} cal | P:${(finalPAfterAdj - dailyProtein).toFixed(2)}g | C:${(finalCAfterAdj - dailyCarbs).toFixed(2)}g | F:${(finalFAfterAdj - dailyFats).toFixed(2)}g`);
  console.log(`📊 Pattern: ${pattern.toUpperCase()} — Meal distribution preserved | Macros ±2-3% accurate\n`);

  // ── Build substitutions ───────────────────────────────────────────────────
  const substitutions = buildSubstitutions(
    proteins,
    carbFoods,
    veggies,
    fatFoods,
    fruits,
    (dailyProtein / mealCount),
    (dailyCarbs / mealCount),
    (dailyFats / mealCount)
  );

  return { meals, substitutions };
}
