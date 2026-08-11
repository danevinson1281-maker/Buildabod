// /api/clients/swap-meal/route.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ── Food database — MATCHES foodDatabase.js exactly ──
const FOOD_DATABASE = {
  Protein: [
    { name: 'Chicken Breast', calories: 165, protein_g: 31, carbs_g: 0, fats_g: 3.6, portion: '5 oz', primaryMacro: 'protein_g' },
    { name: 'Ground Turkey (93/7)', calories: 170, protein_g: 22, carbs_g: 0, fats_g: 9, portion: '5 oz', primaryMacro: 'protein_g' },
    { name: 'Ground Beef (93/7)', calories: 180, protein_g: 25, carbs_g: 0, fats_g: 8, portion: '3 oz', primaryMacro: 'protein_g' },
    { name: 'Salmon', calories: 208, protein_g: 28, carbs_g: 0, fats_g: 10, portion: '5 oz', primaryMacro: 'protein_g' },
    { name: 'Tilapia', calories: 128, protein_g: 26, carbs_g: 0, fats_g: 2.7, portion: '5 oz', primaryMacro: 'protein_g' },
    { name: 'Tuna (Canned in Water)', calories: 120, protein_g: 28, carbs_g: 0, fats_g: 1, portion: '5 oz', primaryMacro: 'protein_g' },
    { name: 'Shrimp', calories: 120, protein_g: 23, carbs_g: 1, fats_g: 2, portion: '5 oz', primaryMacro: 'protein_g' },
    { name: 'Egg Whites', calories: 80, protein_g: 17, carbs_g: 1, fats_g: 0, portion: '5 whites', primaryMacro: 'protein_g' },
    { name: 'Whole Eggs', calories: 140, protein_g: 12, carbs_g: 1, fats_g: 10, portion: '2 eggs', primaryMacro: 'protein_g' },
    { name: 'Greek Yogurt (Non-Fat)', calories: 100, protein_g: 17, carbs_g: 6, fats_g: 0.5, portion: '150g', primaryMacro: 'protein_g' },
    { name: 'Cottage Cheese (Low-Fat)', calories: 110, protein_g: 14, carbs_g: 6, fats_g: 2.6, portion: '120g', primaryMacro: 'protein_g' },
    { name: 'Beef (lean)', calories: 180, protein_g: 26, carbs_g: 0, fats_g: 8, portion: '5 oz', primaryMacro: 'protein_g' },
    { name: 'Pork Tenderloin', calories: 160, protein_g: 26, carbs_g: 0, fats_g: 5, portion: '5 oz', primaryMacro: 'protein_g' },
    { name: 'Turkey Breast', calories: 150, protein_g: 28, carbs_g: 0, fats_g: 3, portion: '5 oz', primaryMacro: 'protein_g' },
    { name: 'Whey Protein', calories: 120, protein_g: 24, carbs_g: 3, fats_g: 1.5, portion: '1 scoop', primaryMacro: 'protein_g' },
    { name: 'Bison (Ground)', calories: 170, protein_g: 28, carbs_g: 0, fats_g: 6, portion: '5 oz', primaryMacro: 'protein_g' },
    { name: 'Chicken Thigh (Boneless, Skinless)', calories: 140, protein_g: 19, carbs_g: 0, fats_g: 7, portion: '3 oz', primaryMacro: 'protein_g' },
    { name: 'Ground Chicken', calories: 130, protein_g: 18, carbs_g: 0, fats_g: 6, portion: '3 oz', primaryMacro: 'protein_g' },
    { name: 'Flank Steak', calories: 158, protein_g: 24, carbs_g: 0, fats_g: 6.3, portion: '3 oz', primaryMacro: 'protein_g' },
    { name: 'Sirloin Steak', calories: 166, protein_g: 26, carbs_g: 0, fats_g: 6.2, portion: '3 oz', primaryMacro: 'protein_g' },
    { name: 'Pork Chops (Boneless)', calories: 135, protein_g: 23, carbs_g: 0, fats_g: 4.2, portion: '3 oz', primaryMacro: 'protein_g' },
    { name: 'Turkey Sausage', calories: 100, protein_g: 11, carbs_g: 1, fats_g: 5.5, portion: '2 oz', primaryMacro: 'protein_g' },
    { name: 'Mahi Mahi', calories: 93, protein_g: 20, carbs_g: 0, fats_g: 0.8, portion: '3 oz', primaryMacro: 'protein_g' },
    { name: 'Scallops', calories: 75, protein_g: 14, carbs_g: 3.2, fats_g: 0.6, portion: '3 oz', primaryMacro: 'protein_g' },
    { name: 'Crab Meat', calories: 74, protein_g: 15, carbs_g: 0, fats_g: 0.9, portion: '3 oz', primaryMacro: 'protein_g' },
    { name: 'Tofu (Firm)', calories: 144, protein_g: 17, carbs_g: 3, fats_g: 8.7, portion: '100g', primaryMacro: 'protein_g' },
    { name: 'Tempeh', calories: 162, protein_g: 17, carbs_g: 9, fats_g: 6.4, portion: '85g', primaryMacro: 'protein_g' },
    { name: 'Edamame (Shelled)', calories: 95, protein_g: 8.5, carbs_g: 7, fats_g: 4, portion: '78g', primaryMacro: 'protein_g' },
    { name: 'Protein Powder (Whey)', calories: 120, protein_g: 24, carbs_g: 3, fats_g: 1, portion: '1 scoop', primaryMacro: 'protein_g' },
    { name: 'Turkey Burger Patty (93/7)', calories: 150, protein_g: 21, carbs_g: 0, fats_g: 7, portion: '3 oz', primaryMacro: 'protein_g' },
    { name: 'Cod', calories: 70, protein_g: 15, carbs_g: 0, fats_g: 0.5, portion: '3 oz', primaryMacro: 'protein_g' },
    { name: 'Lean Ground Beef (96/4)', calories: 140, protein_g: 24, carbs_g: 0, fats_g: 4.5, portion: '3 oz', primaryMacro: 'protein_g' },
  ],
  Carbs: [
    { name: 'White Rice', calories: 200, protein_g: 4, carbs_g: 44, fats_g: 0.5, portion: '1 cup cooked', primaryMacro: 'carbs_g' },
    { name: 'Brown Rice', calories: 215, protein_g: 5, carbs_g: 45, fats_g: 1.5, portion: '1 cup cooked', primaryMacro: 'carbs_g' },
    { name: 'Sweet Potato', calories: 180, protein_g: 4, carbs_g: 41, fats_g: 0.1, portion: '1 medium', primaryMacro: 'carbs_g' },
    { name: 'Oatmeal', calories: 150, protein_g: 5, carbs_g: 27, fats_g: 3, portion: '1/2 cup dry', primaryMacro: 'carbs_g' },
    { name: 'Quinoa', calories: 220, protein_g: 8, carbs_g: 39, fats_g: 3.5, portion: '1 cup cooked', primaryMacro: 'carbs_g' },
    { name: 'Pasta (Whole Wheat)', calories: 180, protein_g: 7, carbs_g: 37, fats_g: 1, portion: '1 cup cooked', primaryMacro: 'carbs_g' },
    { name: 'Bread (Whole Wheat)', calories: 140, protein_g: 6, carbs_g: 26, fats_g: 2, portion: '2 slices', primaryMacro: 'carbs_g' },
    { name: 'White Bread', calories: 75, protein_g: 2.5, carbs_g: 14, fats_g: 1, portion: '1 slice', primaryMacro: 'carbs_g' },
    { name: 'Potatoes', calories: 160, protein_g: 4, carbs_g: 36, fats_g: 0.2, portion: '1 medium', primaryMacro: 'carbs_g' },
    { name: 'Rice Cakes', calories: 70, protein_g: 1, carbs_g: 15, fats_g: 0.5, portion: '2 cakes', primaryMacro: 'carbs_g' },
    { name: 'Cream of Rice', calories: 170, protein_g: 3, carbs_g: 38, fats_g: 0.5, portion: '1/2 cup dry', primaryMacro: 'carbs_g' },
    { name: 'Ezekiel Bread', calories: 160, protein_g: 8, carbs_g: 30, fats_g: 1, portion: '2 slices', primaryMacro: 'carbs_g' },
    { name: 'Banana', calories: 105, protein_g: 1, carbs_g: 27, fats_g: 0.3, portion: '1 medium', primaryMacro: 'carbs_g' },
    { name: 'Jasmine Rice', calories: 200, protein_g: 4, carbs_g: 44, fats_g: 0.5, portion: '1 cup cooked', primaryMacro: 'carbs_g' },
    { name: 'Basmati Rice', calories: 200, protein_g: 4, carbs_g: 44, fats_g: 0.5, portion: '1 cup cooked', primaryMacro: 'carbs_g' },
    { name: 'Oats', calories: 150, protein_g: 5, carbs_g: 27, fats_g: 3, portion: '1/2 cup dry', primaryMacro: 'carbs_g' },
    { name: 'White Pasta', calories: 196, protein_g: 7, carbs_g: 38, fats_g: 1.2, portion: '1 cup cooked', primaryMacro: 'carbs_g' },
    { name: 'Couscous', calories: 88, protein_g: 3, carbs_g: 18, fats_g: 0.1, portion: '1 cup cooked', primaryMacro: 'carbs_g' },
    { name: 'Bagel (Plain)', calories: 150, protein_g: 6, carbs_g: 29, fats_g: 1, portion: '1 mini', primaryMacro: 'carbs_g' },
    { name: 'English Muffin', calories: 132, protein_g: 5, carbs_g: 25, fats_g: 1, portion: '1 muffin', primaryMacro: 'carbs_g' },
    { name: 'Corn Tortilla', calories: 52, protein_g: 1.4, carbs_g: 11, fats_g: 0.7, portion: '1 tortilla', primaryMacro: 'carbs_g' },
    { name: 'Flour Tortilla', calories: 140, protein_g: 3.5, carbs_g: 24, fats_g: 3.5, portion: '1 small', primaryMacro: 'carbs_g' },
    { name: 'Black Beans', calories: 114, protein_g: 7.6, carbs_g: 20, fats_g: 0.5, portion: '0.5 cup', primaryMacro: 'carbs_g' },
    { name: 'Lentils', calories: 115, protein_g: 9, carbs_g: 20, fats_g: 0.4, portion: '0.5 cup', primaryMacro: 'carbs_g' },
    { name: 'Chickpeas', calories: 134, protein_g: 7.3, carbs_g: 22, fats_g: 2.1, portion: '0.5 cup', primaryMacro: 'carbs_g' },
    { name: 'Granola', calories: 130, protein_g: 3, carbs_g: 18, fats_g: 5.5, portion: '0.25 cup', primaryMacro: 'carbs_g' },
    { name: 'Honey', calories: 64, protein_g: 0.1, carbs_g: 17, fats_g: 0, portion: '1 tbsp', primaryMacro: 'carbs_g' },
    { name: 'Cream of Wheat', calories: 90, protein_g: 2.5, carbs_g: 19, fats_g: 0.3, portion: '24g dry', primaryMacro: 'carbs_g' },
    { name: 'Low Sugar Cereal', calories: 100, protein_g: 3, carbs_g: 20, fats_g: 1.5, portion: '1 cup', primaryMacro: 'carbs_g' },
    { name: 'Tortilla Wraps (Whole Wheat)', calories: 130, protein_g: 4, carbs_g: 22, fats_g: 3, portion: '1 wrap', primaryMacro: 'carbs_g' },
  ],
  Vegetables: [
    { name: 'Broccoli', calories: 55, protein_g: 4, carbs_g: 11, fats_g: 0.5, portion: '2 cups', primaryMacro: 'fixed' },
    { name: 'Asparagus', calories: 40, protein_g: 4, carbs_g: 7, fats_g: 0.2, portion: '1 cup', primaryMacro: 'fixed' },
    { name: 'Spinach', calories: 20, protein_g: 2, carbs_g: 3, fats_g: 0.3, portion: '2 cups', primaryMacro: 'fixed' },
    { name: 'Green Beans', calories: 44, protein_g: 2, carbs_g: 10, fats_g: 0.2, portion: '1.5 cups', primaryMacro: 'fixed' },
    { name: 'Bell Peppers', calories: 46, protein_g: 1, carbs_g: 11, fats_g: 0.3, portion: '1 large', primaryMacro: 'fixed' },
    { name: 'Zucchini', calories: 33, protein_g: 2, carbs_g: 6, fats_g: 0.6, portion: '1.5 cups', primaryMacro: 'fixed' },
    { name: 'Mushrooms', calories: 30, protein_g: 4, carbs_g: 4, fats_g: 0.3, portion: '1.5 cups', primaryMacro: 'fixed' },
    { name: 'Cucumber', calories: 16, protein_g: 1, carbs_g: 4, fats_g: 0.1, portion: '1 cup', primaryMacro: 'fixed' },
    { name: 'Cauliflower', calories: 50, protein_g: 4, carbs_g: 10, fats_g: 0.5, portion: '2 cups', primaryMacro: 'fixed' },
    { name: 'Kale', calories: 35, protein_g: 3, carbs_g: 7, fats_g: 0.5, portion: '2 cups', primaryMacro: 'fixed' },
    { name: 'Brussels Sprouts', calories: 28, protein_g: 2, carbs_g: 5.5, fats_g: 0.3, portion: '0.5 cup', primaryMacro: 'fixed' },
    { name: 'Cabbage', calories: 22, protein_g: 1.1, carbs_g: 5.2, fats_g: 0.1, portion: '1 cup shredded', primaryMacro: 'fixed' },
    { name: 'Celery', calories: 14, protein_g: 0.7, carbs_g: 3, fats_g: 0.2, portion: '2 stalks', primaryMacro: 'fixed' },
    { name: 'Carrots', calories: 25, protein_g: 0.6, carbs_g: 5.8, fats_g: 0.1, portion: '1 medium', primaryMacro: 'fixed' },
    { name: 'Snap Peas', calories: 26, protein_g: 1.8, carbs_g: 4.8, fats_g: 0.1, portion: '0.5 cup', primaryMacro: 'fixed' },
    { name: 'Onions', calories: 22, protein_g: 0.6, carbs_g: 5.1, fats_g: 0.1, portion: '0.5 cup chopped', primaryMacro: 'fixed' },
    { name: 'Corn', calories: 66, protein_g: 2.5, carbs_g: 14.5, fats_g: 0.9, portion: '0.5 cup kernels', primaryMacro: 'fixed' },
    { name: 'Sweet Peas', calories: 59, protein_g: 4, carbs_g: 10.4, fats_g: 0.3, portion: '0.5 cup', primaryMacro: 'fixed' },
    { name: 'Artichoke Hearts', calories: 45, protein_g: 2.4, carbs_g: 9.4, fats_g: 0.3, portion: '0.5 cup', primaryMacro: 'fixed' },
    { name: 'Eggplant', calories: 20, protein_g: 0.8, carbs_g: 4.8, fats_g: 0.2, portion: '1 cup cubed', primaryMacro: 'fixed' },
    { name: 'Romaine Lettuce', calories: 8, protein_g: 0.6, carbs_g: 1.5, fats_g: 0.1, portion: '1 cup shredded', primaryMacro: 'fixed' },
    { name: 'Radishes', calories: 9, protein_g: 0.4, carbs_g: 2, fats_g: 0.1, portion: '0.5 cup sliced', primaryMacro: 'fixed' },
    { name: 'Bok Choy', calories: 9, protein_g: 1.1, carbs_g: 1.5, fats_g: 0.1, portion: '1 cup shredded', primaryMacro: 'fixed' },
    { name: 'Mixed Greens', calories: 18, protein_g: 1.5, carbs_g: 3.2, fats_g: 0.2, portion: '56g', primaryMacro: 'fixed' },
    { name: 'Tomatoes', calories: 22, protein_g: 1.1, carbs_g: 4.8, fats_g: 0.2, portion: '1 medium', primaryMacro: 'fixed' },
  ],
  'Healthy Fats': [
    { name: 'Avocado', calories: 160, protein_g: 2, carbs_g: 9, fats_g: 15, portion: '1/2 avocado', primaryMacro: 'fats_g' },
    { name: 'Almonds', calories: 170, protein_g: 6, carbs_g: 6, fats_g: 15, portion: '1 oz', primaryMacro: 'fats_g' },
    { name: 'Olive Oil', calories: 120, protein_g: 0, carbs_g: 0, fats_g: 14, portion: '1 tbsp', primaryMacro: 'fats_g' },
    { name: 'Peanut Butter', calories: 190, protein_g: 8, carbs_g: 6, fats_g: 16, portion: '2 tbsp', primaryMacro: 'fats_g' },
    { name: 'Almond Butter', calories: 200, protein_g: 7, carbs_g: 6, fats_g: 18, portion: '2 tbsp', primaryMacro: 'fats_g' },
    { name: 'Walnuts', calories: 185, protein_g: 4, carbs_g: 4, fats_g: 18, portion: '1 oz', primaryMacro: 'fats_g' },
    { name: 'Cashews', calories: 160, protein_g: 5, carbs_g: 9, fats_g: 13, portion: '1 oz', primaryMacro: 'fats_g' },
    { name: 'Coconut Oil', calories: 120, protein_g: 0, carbs_g: 0, fats_g: 14, portion: '1 tbsp', primaryMacro: 'fats_g' },
    { name: 'Flax Seeds', calories: 110, protein_g: 4, carbs_g: 6, fats_g: 9, portion: '2 tbsp', primaryMacro: 'fats_g' },
    { name: 'Chia Seeds', calories: 120, protein_g: 4, carbs_g: 10, fats_g: 8, portion: '2 tbsp', primaryMacro: 'fats_g' },
    { name: 'Cheese (Cheddar)', calories: 113, protein_g: 7, carbs_g: 0.4, fats_g: 9.3, portion: '1 oz', primaryMacro: 'fats_g' },
    { name: 'Egg Yolks', calories: 55, protein_g: 2.7, carbs_g: 0.6, fats_g: 4.5, portion: '1 yolk', primaryMacro: 'fats_g' },
    { name: 'Pecans', calories: 196, protein_g: 2.6, carbs_g: 3.9, fats_g: 20, portion: '1 oz', primaryMacro: 'fats_g' },
    { name: 'Pistachios', calories: 159, protein_g: 5.7, carbs_g: 7.7, fats_g: 12.9, portion: '1 oz', primaryMacro: 'fats_g' },
    { name: 'Macadamia Nuts', calories: 204, protein_g: 2.2, carbs_g: 3.9, fats_g: 21.5, portion: '1 oz', primaryMacro: 'fats_g' },
    { name: 'Hemp Seeds', calories: 50, protein_g: 3.3, carbs_g: 1.2, fats_g: 3.3, portion: '1 tbsp', primaryMacro: 'fats_g' },
    { name: 'Sunflower Seed Butter', calories: 93, protein_g: 3.5, carbs_g: 4, fats_g: 8, portion: '1 tbsp', primaryMacro: 'fats_g' },
    { name: 'Cream Cheese', calories: 99, protein_g: 2, carbs_g: 0.8, fats_g: 9.8, portion: '1 oz', primaryMacro: 'fats_g' },
    { name: 'Mozzarella Cheese', calories: 84, protein_g: 6.3, carbs_g: 0.6, fats_g: 6.3, portion: '1 oz', primaryMacro: 'fats_g' },
    { name: 'American Cheese', calories: 92, protein_g: 5.3, carbs_g: 0.5, fats_g: 7.6, portion: '1 slice', primaryMacro: 'fats_g' },
    { name: 'Dark Chocolate (70%+)', calories: 57, protein_g: 1, carbs_g: 4.5, fats_g: 4.5, portion: '1 square', primaryMacro: 'fats_g' },
  ],
  Fruits: [
    { name: 'Blueberries', calories: 85, protein_g: 1, carbs_g: 21, fats_g: 0.5, portion: '1 cup', primaryMacro: 'fixed' },
    { name: 'Strawberries', calories: 50, protein_g: 1, carbs_g: 12, fats_g: 0.5, portion: '1 cup', primaryMacro: 'fixed' },
    { name: 'Apple', calories: 95, protein_g: 0.5, carbs_g: 25, fats_g: 0.3, portion: '1 medium', primaryMacro: 'fixed' },
    { name: 'Orange', calories: 62, protein_g: 1, carbs_g: 15, fats_g: 0.2, portion: '1 medium', primaryMacro: 'fixed' },
    { name: 'Mango', calories: 100, protein_g: 1, carbs_g: 25, fats_g: 0.4, portion: '3/4 cup', primaryMacro: 'fixed' },
    { name: 'Pineapple', calories: 82, protein_g: 1, carbs_g: 22, fats_g: 0.2, portion: '1 cup', primaryMacro: 'fixed' },
    { name: 'Grapes', calories: 104, protein_g: 1, carbs_g: 27, fats_g: 0.2, portion: '1 cup', primaryMacro: 'fixed' },
    { name: 'Peach', calories: 58, protein_g: 1, carbs_g: 14, fats_g: 0.4, portion: '1 medium', primaryMacro: 'fixed' },
    { name: 'Banana', calories: 105, protein_g: 1.3, carbs_g: 27, fats_g: 0.3, portion: '1 medium', primaryMacro: 'fixed' },
    { name: 'Pear', calories: 101, protein_g: 0.7, carbs_g: 27, fats_g: 0.2, portion: '1 medium', primaryMacro: 'fixed' },
    { name: 'Watermelon', calories: 46, protein_g: 0.9, carbs_g: 12, fats_g: 0.2, portion: '1 cup cubed', primaryMacro: 'fixed' },
    { name: 'Raspberries', calories: 42, protein_g: 1, carbs_g: 9.6, fats_g: 0.6, portion: '1 cup', primaryMacro: 'fixed' },
    { name: 'Blackberries', calories: 52, protein_g: 1.2, carbs_g: 12, fats_g: 0.6, portion: '1 cup', primaryMacro: 'fixed' },
    { name: 'Kiwi', calories: 61, protein_g: 1, carbs_g: 15, fats_g: 0.5, portion: '1 medium', primaryMacro: 'fixed' },
    { name: 'Cantaloupe', calories: 54, protein_g: 1.3, carbs_g: 13, fats_g: 0.3, portion: '1 cup cubed', primaryMacro: 'fixed' },
    { name: 'Honeydew', calories: 60, protein_g: 0.9, carbs_g: 15, fats_g: 0.3, portion: '1 cup cubed', primaryMacro: 'fixed' },
    { name: 'Grapefruit', calories: 39, protein_g: 0.8, carbs_g: 10, fats_g: 0.1, portion: '0.5 medium', primaryMacro: 'fixed' },
    { name: 'Cherries', calories: 34, protein_g: 0.7, carbs_g: 8.5, fats_g: 0.3, portion: '0.5 cup', primaryMacro: 'fixed' },
    { name: 'Frozen Mixed Berries', calories: 38, protein_g: 0.6, carbs_g: 9, fats_g: 0.3, portion: '0.5 cup', primaryMacro: 'fixed' },
    { name: 'Mandarins', calories: 47, protein_g: 0.7, carbs_g: 12, fats_g: 0.3, portion: '1 medium', primaryMacro: 'fixed' },
  ],
};

/**
 * Find a food by name in the database
 */
function findFood(name) {
  for (const [category, foods] of Object.entries(FOOD_DATABASE)) {
    const found = foods.find(f => f.name.toLowerCase() === name.toLowerCase());
    if (found) return { ...found, category };
  }
  return null;
}

/**
 * Scale a portion string by a factor
 */
function scalePortionString(portionStr, scale) {
  const match = portionStr.match(/^([\d.\/]+)\s*(.+)$/);
  if (!match) return portionStr;

  let baseAmount = parseFloat(match[1]);
  if (match[1].includes('/')) {
    const parts = match[1].split('/');
    baseAmount = parseFloat(parts[0]) / parseFloat(parts[1]);
  }

  const unit = match[2];
  let finalAmount = baseAmount * scale;

  if (unit.includes('oz')) {
    finalAmount = Math.round(finalAmount * 2) / 2;
  } else if (unit.includes('tbsp') || unit.includes('tsp')) {
    finalAmount = Math.round(finalAmount * 4) / 4;
  } else if (unit.includes('cup')) {
    finalAmount = Math.round(finalAmount * 4) / 4;
  } else if (unit.includes('egg') || unit.includes('slice') || unit.includes('link') || unit.includes('cake') || unit.includes('scoop')) {
    finalAmount = Math.round(finalAmount * 2) / 2;
  } else if (unit.includes('g')) {
    finalAmount = Math.round(finalAmount);
  } else {
    finalAmount = Math.round(finalAmount * 2) / 2;
  }

  if (finalAmount === Math.floor(finalAmount)) {
    return `${Math.round(finalAmount)} ${unit}`;
  }
  return `${finalAmount} ${unit}`;
}

/**
 * Swap one food and recalculate its portion to hit the same primary macro
 */
function swapAndRescale(currentMeal, swappedFoodName, newFoodName) {
  const oldFoodIndex = currentMeal.foods.findIndex(
    f => f.name.toLowerCase() === swappedFoodName.toLowerCase()
  );

  if (oldFoodIndex === -1) {
    throw new Error(`Food "${swappedFoodName}" not found in this meal`);
  }

  const oldFoodInMeal = currentMeal.foods[oldFoodIndex];
  const newFoodBase = findFood(newFoodName);
  if (!newFoodBase) {
    throw new Error(`Food "${newFoodName}" not found in database`);
  }

  const oldCategory = oldFoodInMeal.category || 'unknown';

  console.log(`\n=== FOOD SWAP ===`);
  console.log(`Old: ${swappedFoodName} (P:${oldFoodInMeal.protein_g}g C:${oldFoodInMeal.carbs_g}g F:${oldFoodInMeal.fats_g}g)`);
  console.log(`New base: ${newFoodName} (P:${newFoodBase.protein_g}g C:${newFoodBase.carbs_g}g F:${newFoodBase.fats_g}g per ${newFoodBase.portion})`);

  let scaledNewFood;

  if (oldCategory === 'Protein') {
    const targetProtein = oldFoodInMeal.protein_g;
    if (newFoodBase.protein_g <= 0) {
      throw new Error(`${newFoodName} has no protein — can't swap for a protein source`);
    }
    const scale = targetProtein / newFoodBase.protein_g;
    const clampedScale = Math.max(0.3, Math.min(4, scale));

    scaledNewFood = {
      name: newFoodBase.name,
      category: 'Protein',
      portion: scalePortionString(newFoodBase.portion, clampedScale),
      calories: Math.round(newFoodBase.calories * clampedScale),
      protein_g: Math.round(newFoodBase.protein_g * clampedScale * 10) / 10,
      carbs_g: Math.round(newFoodBase.carbs_g * clampedScale * 10) / 10,
      fats_g: Math.round(newFoodBase.fats_g * clampedScale * 10) / 10,
    };

    console.log(`Scaling to ${targetProtein}g protein → ${clampedScale.toFixed(2)}x → ${scaledNewFood.portion}`);
  }
  else if (oldCategory === 'Carbs') {
    const targetCarbs = oldFoodInMeal.carbs_g;
    if (newFoodBase.carbs_g <= 0) {
      throw new Error(`${newFoodName} has no carbs — can't swap for a carb source`);
    }
    const scale = targetCarbs / newFoodBase.carbs_g;
    const clampedScale = Math.max(0.3, Math.min(4, scale));

    scaledNewFood = {
      name: newFoodBase.name,
      category: 'Carbs',
      portion: scalePortionString(newFoodBase.portion, clampedScale),
      calories: Math.round(newFoodBase.calories * clampedScale),
      protein_g: Math.round(newFoodBase.protein_g * clampedScale * 10) / 10,
      carbs_g: Math.round(newFoodBase.carbs_g * clampedScale * 10) / 10,
      fats_g: Math.round(newFoodBase.fats_g * clampedScale * 10) / 10,
    };

    console.log(`Scaling to ${targetCarbs}g carbs → ${clampedScale.toFixed(2)}x → ${scaledNewFood.portion}`);
  }
  else if (oldCategory === 'Healthy Fats') {
    const targetFats = oldFoodInMeal.fats_g;
    if (newFoodBase.fats_g <= 0) {
      throw new Error(`${newFoodName} has no fats — can't swap for a fat source`);
    }
    const scale = targetFats / newFoodBase.fats_g;
    const clampedScale = Math.max(0.3, Math.min(4, scale));

    scaledNewFood = {
      name: newFoodBase.name,
      category: 'Healthy Fats',
      portion: scalePortionString(newFoodBase.portion, clampedScale),
      calories: Math.round(newFoodBase.calories * clampedScale),
      protein_g: Math.round(newFoodBase.protein_g * clampedScale * 10) / 10,
      carbs_g: Math.round(newFoodBase.carbs_g * clampedScale * 10) / 10,
      fats_g: Math.round(newFoodBase.fats_g * clampedScale * 10) / 10,
    };

    console.log(`Scaling to ${targetFats}g fats → ${clampedScale.toFixed(2)}x → ${scaledNewFood.portion}`);
  }
  else if (oldCategory === 'Vegetables' || oldCategory === 'Fruits') {
    scaledNewFood = {
      name: newFoodBase.name,
      category: oldCategory,
      portion: newFoodBase.portion,
      calories: newFoodBase.calories,
      protein_g: newFoodBase.protein_g,
      carbs_g: newFoodBase.carbs_g,
      fats_g: newFoodBase.fats_g,
    };

    console.log(`Fixed category swap — using base portion`);
  }
  else {
    scaledNewFood = {
      name: newFoodBase.name,
      category: oldCategory,
      portion: newFoodBase.portion,
      calories: newFoodBase.calories,
      protein_g: newFoodBase.protein_g,
      carbs_g: newFoodBase.carbs_g,
      fats_g: newFoodBase.fats_g,
    };
  }

  const newMealFoods = currentMeal.foods.map((food, idx) => {
    if (idx === oldFoodIndex) {
      return scaledNewFood;
    }
    return { ...food };
  });

  const newTotals = { calories: 0, protein_g: 0, carbs_g: 0, fats_g: 0 };
  newMealFoods.forEach(food => {
    newTotals.calories += food.calories;
    newTotals.protein_g += food.protein_g;
    newTotals.carbs_g += food.carbs_g;
    newTotals.fats_g += food.fats_g;
  });

  newTotals.calories = Math.round(newTotals.calories);
  newTotals.protein_g = Math.round(newTotals.protein_g * 10) / 10;
  newTotals.carbs_g = Math.round(newTotals.carbs_g * 10) / 10;
  newTotals.fats_g = Math.round(newTotals.fats_g * 10) / 10;

  console.log(`\nOld meal totals: P:${currentMeal.totals.protein_g}g C:${currentMeal.totals.carbs_g}g F:${currentMeal.totals.fats_g}g`);
  console.log(`New meal totals: P:${newTotals.protein_g}g C:${newTotals.carbs_g}g F:${newTotals.fats_g}g`);

  return {
    foods: newMealFoods,
    totals: newTotals,
    type: currentMeal.type || 'balanced',
  };
}

/**
 * ⭐ CRITICAL: After swapping a meal, recalculate ALL daily totals and calibrate
 * This ensures macros stay accurate across the entire day
 */
function recalculateDailyTotals(allMeals, targetCalories, targetProtein, targetCarbs, targetFats) {
  console.log(`\n=== DAILY RECALIBRATION AFTER SWAP ===`);

  // Calculate current daily totals from all meals
  let dailyP = 0;
  let dailyC = 0;
  let dailyF = 0;
  let dailyCal = 0;

  Object.values(allMeals).forEach(meal => {
    dailyP += meal.totals.protein_g;
    dailyC += meal.totals.carbs_g;
    dailyF += meal.totals.fats_g;
    dailyCal += meal.totals.calories;
  });

  console.log(`Before calibration: Cal=${dailyCal} | P=${dailyP.toFixed(1)}g | C=${dailyC.toFixed(1)}g | F=${dailyF.toFixed(1)}g`);
  console.log(`Targets:            Cal=${targetCalories} | P=${targetProtein.toFixed(1)}g | C=${targetCarbs.toFixed(1)}g | F=${targetFats.toFixed(1)}g`);

  // Calculate errors
  const pError = targetProtein - dailyP;
  const cError = targetCarbs - dailyC;
  const fError = targetFats - dailyF;

  console.log(`Errors: P=${pError.toFixed(2)}g | C=${cError.toFixed(2)}g | F=${fError.toFixed(2)}g`);

  // Distribute errors proportionally across all meals
  if (Math.abs(pError) > 0.1 || Math.abs(cError) > 0.1 || Math.abs(fError) > 0.1) {
    const mealCount = Object.keys(allMeals).length;

    Object.values(allMeals).forEach(meal => {
      const mealShare = dailyCal > 0 ? meal.totals.calories / dailyCal : 1 / mealCount;

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

  // Verify final totals
  let finalP = 0;
  let finalC = 0;
  let finalF = 0;
  let finalCal = 0;

  Object.values(allMeals).forEach(meal => {
    finalP += meal.totals.protein_g;
    finalC += meal.totals.carbs_g;
    finalF += meal.totals.fats_g;
    finalCal += meal.totals.calories;
  });

  console.log(`After calibration:  Cal=${finalCal} | P=${finalP.toFixed(1)}g | C=${finalC.toFixed(1)}g | F=${finalF.toFixed(1)}g`);
  console.log(`Final diff:         P=${(finalP - targetProtein).toFixed(2)}g | C=${(finalC - targetCarbs).toFixed(2)}g | F=${(finalF - targetFats).toFixed(2)}g`);

  return allMeals;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      clientId,
      mealIndex,
      currentMeal,
      allMeals,
      swappedFoodName,
      newFoodName,
      targetCalories,
      targetProtein,
      targetCarbs,
      targetFats,
    } = body;

    if (!clientId || mealIndex === undefined || !currentMeal) {
      return Response.json(
        { error: 'Missing required fields: clientId, mealIndex, currentMeal' },
        { status: 400 }
      );
    }

    if (!swappedFoodName || !newFoodName) {
      return Response.json(
        { error: 'Missing food swap details: swappedFoodName, newFoodName' },
        { status: 400 }
      );
    }

    // Swap the food in this specific meal
    const newMeal = swapAndRescale(currentMeal, swappedFoodName, newFoodName);

    // Update the swapped meal in allMeals
    const updatedAllMeals = { ...allMeals };
    const mealKeys = Object.keys(updatedAllMeals);
    updatedAllMeals[mealKeys[mealIndex]] = newMeal;

    // ⭐ RECALIBRATE: Ensure daily totals still match targets
    const calibratedMeals = recalculateDailyTotals(
      updatedAllMeals,
      targetCalories || 2000,
      targetProtein || 150,
      targetCarbs || 200,
      targetFats || 65
    );

    return Response.json({
      success: true,
      newMeal: calibratedMeals[mealKeys[mealIndex]],
      allMeals: calibratedMeals,
    });

  } catch (err) {
    console.error('POST /api/clients/swap-meal error:', err);
    return Response.json({ error: err.message || 'Failed to swap meal' }, { status: 500 });
  }
}
