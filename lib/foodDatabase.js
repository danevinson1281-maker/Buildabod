// /lib/foodDatabase.js
// BuildABod – Food Database with Intelligent Hybrid Portions
// Proteins: oz | Carbs/Veggies/Fruits: grams | Fats: tbsp/tsp
// 125 foods  ·  5 categories  ·  CLEAN, CLIENT-FRIENDLY PORTIONS

export const foodDatabase = {

  // ═══════════════════════════════════════════
  //  PROTEINS  (30) — Shown in oz
  // ═══════════════════════════════════════════
  proteins: [
    // ── EXISTING 15 ──
    {
      name: 'Chicken Breast',
      category: 'Protein',
      servings: [
        { size: '3 oz', calories: 140, protein: 26, carbs: 0, fats: 3 },
        { size: '4 oz', calories: 187, protein: 35, carbs: 0, fats: 4 },
        { size: '5 oz', calories: 234, protein: 44, carbs: 0, fats: 5 },
        { size: '6 oz', calories: 280, protein: 52, carbs: 0, fats: 6 },
        { size: '8 oz', calories: 374, protein: 70, carbs: 0, fats: 8 },
      ]
    },
    {
      name: 'Ground Turkey (93/7)',
      category: 'Protein',
      servings: [
        { size: '3 oz', calories: 150, protein: 28, carbs: 0, fats: 3.5 },
        { size: '4 oz', calories: 200, protein: 37, carbs: 0, fats: 4.7 },
        { size: '5 oz', calories: 250, protein: 46, carbs: 0, fats: 5.9 },
        { size: '6 oz', calories: 300, protein: 55, carbs: 0, fats: 7 },
        { size: '8 oz', calories: 400, protein: 74, carbs: 0, fats: 9.3 },
      ]
    },
    {
      name: 'Ground Beef (93/7)',
      category: 'Protein',
      servings: [
        { size: '3 oz', calories: 180, protein: 25, carbs: 0, fats: 8 },
        { size: '4 oz', calories: 240, protein: 33, carbs: 0, fats: 10.7 },
        { size: '5 oz', calories: 300, protein: 42, carbs: 0, fats: 13.3 },
        { size: '6 oz', calories: 360, protein: 50, carbs: 0, fats: 16 },
        { size: '8 oz', calories: 480, protein: 67, carbs: 0, fats: 21.3 },
      ]
    },
    {
      name: 'Salmon',
      category: 'Protein',
      servings: [
        { size: '3 oz', calories: 175, protein: 19, carbs: 0, fats: 10 },
        { size: '4 oz', calories: 234, protein: 25, carbs: 0, fats: 13.3 },
        { size: '5 oz', calories: 292, protein: 31, carbs: 0, fats: 16.7 },
        { size: '6 oz', calories: 350, protein: 38, carbs: 0, fats: 20 },
        { size: '8 oz', calories: 467, protein: 51, carbs: 0, fats: 27 },
      ]
    },
    {
      name: 'Egg Whites',
      category: 'Protein',
      servings: [
        { size: '3 whites', calories: 51, protein: 11, carbs: 1.1, fats: 0.2 },
        { size: '5 whites', calories: 85, protein: 18, carbs: 1.9, fats: 0.4 },
        { size: '6 whites', calories: 102, protein: 22, carbs: 2.3, fats: 0.5 },
        { size: '8 whites', calories: 136, protein: 29, carbs: 3, fats: 0.6 },
        { size: '10 whites', calories: 170, protein: 37, carbs: 3.8, fats: 0.8 },
      ]
    },
    {
      name: 'Whole Eggs',
      category: 'Protein',
      servings: [
        { size: '1 egg', calories: 72, protein: 6, carbs: 0.4, fats: 5 },
        { size: '2 eggs', calories: 144, protein: 12, carbs: 0.8, fats: 10 },
        { size: '3 eggs', calories: 216, protein: 18, carbs: 1.2, fats: 15 },
        { size: '4 eggs', calories: 288, protein: 24, carbs: 1.6, fats: 20 },
      ]
    },
    {
      name: 'Tilapia',
      category: 'Protein',
      servings: [
        { size: '3 oz', calories: 85, protein: 18, carbs: 0, fats: 1 },
        { size: '4 oz', calories: 113, protein: 24, carbs: 0, fats: 1.3 },
        { size: '5 oz', calories: 141, protein: 30, carbs: 0, fats: 1.6 },
        { size: '6 oz', calories: 170, protein: 36, carbs: 0, fats: 2 },
        { size: '8 oz', calories: 226, protein: 48, carbs: 0, fats: 2.7 },
      ]
    },
    {
      name: 'Lean Ground Beef (96/4)',
      category: 'Protein',
      servings: [
        { size: '3 oz', calories: 140, protein: 24, carbs: 0, fats: 4.5 },
        { size: '4 oz', calories: 187, protein: 32, carbs: 0, fats: 6 },
        { size: '5 oz', calories: 234, protein: 40, carbs: 0, fats: 7.5 },
        { size: '6 oz', calories: 280, protein: 48, carbs: 0, fats: 9 },
        { size: '8 oz', calories: 374, protein: 64, carbs: 0, fats: 12 },
      ]
    },
    {
      name: 'Turkey Breast',
      category: 'Protein',
      servings: [
        { size: '3 oz', calories: 90, protein: 20, carbs: 0, fats: 0.5 },
        { size: '4 oz', calories: 120, protein: 27, carbs: 0, fats: 0.7 },
        { size: '5 oz', calories: 150, protein: 34, carbs: 0, fats: 0.9 },
        { size: '6 oz', calories: 180, protein: 40, carbs: 0, fats: 1 },
      ]
    },
    {
      name: 'Cod',
      category: 'Protein',
      servings: [
        { size: '3 oz', calories: 70, protein: 15, carbs: 0, fats: 0.5 },
        { size: '4 oz', calories: 93, protein: 20, carbs: 0, fats: 0.7 },
        { size: '5 oz', calories: 116, protein: 25, carbs: 0, fats: 0.9 },
        { size: '6 oz', calories: 140, protein: 30, carbs: 0, fats: 1 },
      ]
    },
    {
      name: 'Tuna (Canned in Water)',
      category: 'Protein',
      servings: [
        { size: '3 oz', calories: 99, protein: 22, carbs: 0, fats: 0.7 },
        { size: '4 oz', calories: 132, protein: 29, carbs: 0, fats: 0.9 },
        { size: '5 oz', calories: 165, protein: 36, carbs: 0, fats: 1.1 },
        { size: '6 oz', calories: 198, protein: 43, carbs: 0, fats: 1.3 },
      ]
    },
    {
      name: 'Shrimp',
      category: 'Protein',
      servings: [
        { size: '3 oz', calories: 84, protein: 20, carbs: 0.2, fats: 0.2 },
        { size: '4 oz', calories: 112, protein: 27, carbs: 0.3, fats: 0.3 },
        { size: '5 oz', calories: 140, protein: 34, carbs: 0.3, fats: 0.3 },
        { size: '6 oz', calories: 168, protein: 40, carbs: 0.4, fats: 0.4 },
        { size: '8 oz', calories: 224, protein: 54, carbs: 0.5, fats: 0.5 },
      ]
    },
    {
      name: 'Greek Yogurt (Non-Fat)',
      category: 'Protein',
      servings: [
        { size: '100g', calories: 59, protein: 10, carbs: 3.6, fats: 0.4 },
        { size: '150g', calories: 89, protein: 15, carbs: 5.4, fats: 0.6 },
        { size: '200g', calories: 118, protein: 20, carbs: 7.2, fats: 0.8 },
        { size: '250g', calories: 148, protein: 25, carbs: 9, fats: 1 },
      ]
    },
    {
      name: 'Cottage Cheese (Low-Fat)',
      category: 'Protein',
      servings: [
        { size: '120g', calories: 92, protein: 12, carbs: 5, fats: 2.6 },
        { size: '180g', calories: 138, protein: 18, carbs: 7.5, fats: 3.9 },
        { size: '240g', calories: 183, protein: 24, carbs: 10, fats: 5.1 },
      ]
    },
    {
      name: 'Pork Tenderloin',
      category: 'Protein',
      servings: [
        { size: '3 oz', calories: 96, protein: 18, carbs: 0, fats: 2.1 },
        { size: '4 oz', calories: 128, protein: 24, carbs: 0, fats: 2.8 },
        { size: '5 oz', calories: 160, protein: 30, carbs: 0, fats: 3.5 },
        { size: '6 oz', calories: 192, protein: 36, carbs: 0, fats: 4.2 },
      ]
    },

    // ── NEW 15 ──
    {
      name: 'Chicken Thigh (Boneless, Skinless)',
      category: 'Protein',
      servings: [
        { size: '3 oz', calories: 140, protein: 19, carbs: 0, fats: 7 },
        { size: '4 oz', calories: 187, protein: 25, carbs: 0, fats: 9.3 },
        { size: '5 oz', calories: 234, protein: 32, carbs: 0, fats: 11.7 },
        { size: '6 oz', calories: 280, protein: 38, carbs: 0, fats: 14 },
        { size: '8 oz', calories: 374, protein: 51, carbs: 0, fats: 18.7 },
      ]
    },
    {
      name: 'Ground Chicken',
      category: 'Protein',
      servings: [
        { size: '3 oz', calories: 130, protein: 18, carbs: 0, fats: 6 },
        { size: '4 oz', calories: 173, protein: 24, carbs: 0, fats: 8 },
        { size: '5 oz', calories: 217, protein: 30, carbs: 0, fats: 10 },
        { size: '6 oz', calories: 260, protein: 36, carbs: 0, fats: 12 },
        { size: '8 oz', calories: 347, protein: 48, carbs: 0, fats: 16 },
      ]
    },
    {
      name: 'Flank Steak',
      category: 'Protein',
      servings: [
        { size: '3 oz', calories: 158, protein: 24, carbs: 0, fats: 6.3 },
        { size: '4 oz', calories: 211, protein: 32, carbs: 0, fats: 8.4 },
        { size: '5 oz', calories: 263, protein: 40, carbs: 0, fats: 10.5 },
        { size: '6 oz', calories: 316, protein: 48, carbs: 0, fats: 12.6 },
        { size: '8 oz', calories: 421, protein: 64, carbs: 0, fats: 16.8 },
      ]
    },
    {
      name: 'Sirloin Steak',
      category: 'Protein',
      servings: [
        { size: '3 oz', calories: 166, protein: 26, carbs: 0, fats: 6.2 },
        { size: '4 oz', calories: 221, protein: 35, carbs: 0, fats: 8.3 },
        { size: '5 oz', calories: 277, protein: 43, carbs: 0, fats: 10.3 },
        { size: '6 oz', calories: 332, protein: 52, carbs: 0, fats: 12.4 },
        { size: '8 oz', calories: 443, protein: 69, carbs: 0, fats: 16.5 },
      ]
    },
    {
      name: 'Pork Chops (Boneless)',
      category: 'Protein',
      servings: [
        { size: '3 oz', calories: 135, protein: 23, carbs: 0, fats: 4.2 },
        { size: '4 oz', calories: 180, protein: 31, carbs: 0, fats: 5.6 },
        { size: '5 oz', calories: 225, protein: 38, carbs: 0, fats: 7 },
        { size: '6 oz', calories: 270, protein: 46, carbs: 0, fats: 8.4 },
        { size: '8 oz', calories: 360, protein: 61, carbs: 0, fats: 11.2 },
      ]
    },
    {
      name: 'Turkey Sausage',
      category: 'Protein',
      servings: [
        { size: '2 oz (1 link)', calories: 100, protein: 11, carbs: 1, fats: 5.5 },
        { size: '4 oz (2 links)', calories: 200, protein: 22, carbs: 2, fats: 11 },
        { size: '6 oz (3 links)', calories: 300, protein: 33, carbs: 3, fats: 16.5 },
      ]
    },
    {
      name: 'Bison (Ground)',
      category: 'Protein',
      servings: [
        { size: '3 oz', calories: 152, protein: 22, carbs: 0, fats: 7 },
        { size: '4 oz', calories: 203, protein: 29, carbs: 0, fats: 9.3 },
        { size: '5 oz', calories: 253, protein: 37, carbs: 0, fats: 11.7 },
        { size: '6 oz', calories: 304, protein: 44, carbs: 0, fats: 14 },
        { size: '8 oz', calories: 405, protein: 59, carbs: 0, fats: 18.7 },
      ]
    },
    {
      name: 'Mahi Mahi',
      category: 'Protein',
      servings: [
        { size: '3 oz', calories: 93, protein: 20, carbs: 0, fats: 0.8 },
        { size: '4 oz', calories: 124, protein: 27, carbs: 0, fats: 1.1 },
        { size: '5 oz', calories: 155, protein: 33, carbs: 0, fats: 1.3 },
        { size: '6 oz', calories: 186, protein: 40, carbs: 0, fats: 1.6 },
        { size: '8 oz', calories: 248, protein: 53, carbs: 0, fats: 2.1 },
      ]
    },
    {
      name: 'Scallops',
      category: 'Protein',
      servings: [
        { size: '3 oz', calories: 75, protein: 14, carbs: 3.2, fats: 0.6 },
        { size: '4 oz', calories: 100, protein: 19, carbs: 4.3, fats: 0.8 },
        { size: '5 oz', calories: 125, protein: 24, carbs: 5.3, fats: 1 },
        { size: '6 oz', calories: 150, protein: 28, carbs: 6.4, fats: 1.2 },
      ]
    },
    {
      name: 'Crab Meat',
      category: 'Protein',
      servings: [
        { size: '3 oz', calories: 74, protein: 15, carbs: 0, fats: 0.9 },
        { size: '4 oz', calories: 99, protein: 20, carbs: 0, fats: 1.2 },
        { size: '5 oz', calories: 123, protein: 25, carbs: 0, fats: 1.5 },
        { size: '6 oz', calories: 148, protein: 30, carbs: 0, fats: 1.8 },
      ]
    },
    {
      name: 'Tofu (Firm)',
      category: 'Protein',
      servings: [
        { size: '100g', calories: 144, protein: 17, carbs: 3, fats: 8.7 },
        { size: '150g', calories: 216, protein: 26, carbs: 4.5, fats: 13 },
        { size: '200g', calories: 288, protein: 34, carbs: 6, fats: 17.4 },
        { size: '250g', calories: 360, protein: 43, carbs: 7.5, fats: 21.8 },
      ]
    },
    {
      name: 'Tempeh',
      category: 'Protein',
      servings: [
        { size: '85g (3 oz)', calories: 162, protein: 17, carbs: 9, fats: 6.4 },
        { size: '113g (4 oz)', calories: 216, protein: 22, carbs: 12, fats: 8.5 },
        { size: '142g (5 oz)', calories: 270, protein: 28, carbs: 15, fats: 10.7 },
        { size: '170g (6 oz)', calories: 324, protein: 34, carbs: 18, fats: 12.8 },
      ]
    },
    {
      name: 'Edamame (Shelled)',
      category: 'Protein',
      servings: [
        { size: '78g (0.5 cup)', calories: 95, protein: 8.5, carbs: 7, fats: 4 },
        { size: '116g (0.75 cup)', calories: 142, protein: 12.7, carbs: 10.5, fats: 6 },
        { size: '155g (1 cup)', calories: 190, protein: 17, carbs: 14, fats: 8 },
        { size: '233g (1.5 cup)', calories: 285, protein: 25.5, carbs: 21, fats: 12 },
      ]
    },
    {
      name: 'Protein Powder (Whey)',
      category: 'Protein',
      servings: [
        { size: '0.5 scoop (16g)', calories: 60, protein: 12, carbs: 1.5, fats: 0.5 },
        { size: '1 scoop (31g)', calories: 120, protein: 24, carbs: 3, fats: 1 },
        { size: '1.5 scoops (47g)', calories: 180, protein: 36, carbs: 4.5, fats: 1.5 },
        { size: '2 scoops (62g)', calories: 240, protein: 48, carbs: 6, fats: 2 },
      ]
    },
    {
      name: 'Turkey Burger Patty (93/7)',
      category: 'Protein',
      servings: [
        { size: '3 oz (1 small patty)', calories: 150, protein: 21, carbs: 0, fats: 7 },
        { size: '4 oz (1 patty)', calories: 200, protein: 28, carbs: 0, fats: 9.3 },
        { size: '5 oz (1 large patty)', calories: 250, protein: 35, carbs: 0, fats: 11.7 },
        { size: '6 oz (1 xl patty)', calories: 300, protein: 42, carbs: 0, fats: 14 },
      ]
    },
  ],

  // ═══════════════════════════════════════════
  //  CARBS  (28) — Shown in grams
  // ═══════════════════════════════════════════
  carbs: [
    // ── EXISTING 14 ──
    {
      name: 'White Rice',
      category: 'Carbs',
      servings: [
        { size: '75g cooked', calories: 75, protein: 1.4, carbs: 17, fats: 0.2 },
        { size: '100g cooked', calories: 100, protein: 1.9, carbs: 22, fats: 0.3 },
        { size: '150g cooked', calories: 150, protein: 2.7, carbs: 35, fats: 0.3 },
        { size: '225g cooked', calories: 225, protein: 4.1, carbs: 52, fats: 0.5 },
        { size: '300g cooked', calories: 300, protein: 5.4, carbs: 70, fats: 0.6 },
      ]
    },
    {
      name: 'Brown Rice',
      category: 'Carbs',
      servings: [
        { size: '82g cooked', calories: 82, protein: 1.8, carbs: 17, fats: 0.6 },
        { size: '110g cooked', calories: 110, protein: 2.4, carbs: 23, fats: 0.8 },
        { size: '165g cooked', calories: 165, protein: 3.6, carbs: 35, fats: 1.3 },
        { size: '248g cooked', calories: 248, protein: 5.4, carbs: 52, fats: 1.9 },
        { size: '330g cooked', calories: 330, protein: 7.2, carbs: 70, fats: 2.6 },
      ]
    },
    {
      name: 'Oats',
      category: 'Carbs',
      servings: [
        { size: '30g dry', calories: 75, protein: 2.5, carbs: 13.5, fats: 1.5 },
        { size: '40g dry', calories: 100, protein: 3.3, carbs: 18, fats: 2 },
        { size: '60g dry', calories: 150, protein: 5, carbs: 27, fats: 3 },
        { size: '80g dry', calories: 200, protein: 6.7, carbs: 36, fats: 4 },
        { size: '120g dry', calories: 300, protein: 10, carbs: 54, fats: 6 },
      ]
    },
    {
      name: 'Sweet Potato',
      category: 'Carbs',
      servings: [
        { size: '100g', calories: 86, protein: 1.6, carbs: 20, fats: 0.1 },
        { size: '150g', calories: 129, protein: 2.4, carbs: 30, fats: 0.15 },
        { size: '200g', calories: 172, protein: 3.2, carbs: 40, fats: 0.2 },
        { size: '300g', calories: 258, protein: 4.8, carbs: 60, fats: 0.3 },
      ]
    },
    {
      name: 'Jasmine Rice',
      category: 'Carbs',
      servings: [
        { size: '90g cooked', calories: 90, protein: 2, carbs: 20, fats: 0.1 },
        { size: '120g cooked', calories: 120, protein: 2.7, carbs: 27, fats: 0.15 },
        { size: '180g cooked', calories: 180, protein: 4, carbs: 40, fats: 0.2 },
        { size: '270g cooked', calories: 270, protein: 6, carbs: 60, fats: 0.3 },
      ]
    },
    {
      name: 'Whole Wheat Bread',
      category: 'Carbs',
      servings: [
        { size: '32g (1 slice)', calories: 80, protein: 4, carbs: 14, fats: 1 },
        { size: '64g (2 slices)', calories: 160, protein: 8, carbs: 28, fats: 2 },
        { size: '96g (3 slices)', calories: 240, protein: 12, carbs: 42, fats: 3 },
      ]
    },
    {
      name: 'White Bread',
      category: 'Carbs',
      servings: [
        { size: '30g (1 slice)', calories: 75, protein: 2.5, carbs: 14, fats: 1 },
        { size: '60g (2 slices)', calories: 150, protein: 5, carbs: 28, fats: 2 },
        { size: '90g (3 slices)', calories: 225, protein: 7.5, carbs: 42, fats: 3 },
      ]
    },
    {
      name: 'Potato',
      category: 'Carbs',
      servings: [
        { size: '100g', calories: 77, protein: 2, carbs: 17, fats: 0.1 },
        { size: '150g', calories: 116, protein: 3, carbs: 26, fats: 0.15 },
        { size: '200g', calories: 154, protein: 4, carbs: 34, fats: 0.2 },
        { size: '300g', calories: 231, protein: 6, carbs: 51, fats: 0.3 },
      ]
    },
    {
      name: 'Quinoa',
      category: 'Carbs',
      servings: [
        { size: '111g cooked', calories: 111, protein: 4, carbs: 20, fats: 1.6 },
        { size: '148g cooked', calories: 148, protein: 5.4, carbs: 27, fats: 2.1 },
        { size: '222g cooked', calories: 222, protein: 8, carbs: 40, fats: 3.9 },
      ]
    },
    {
      name: 'Pasta (Whole Wheat)',
      category: 'Carbs',
      servings: [
        { size: '140g cooked', calories: 174, protein: 7.5, carbs: 37, fats: 1.5 },
        { size: '210g cooked', calories: 261, protein: 11.3, carbs: 55, fats: 2.3 },
        { size: '280g cooked', calories: 348, protein: 15, carbs: 74, fats: 3 },
      ]
    },
        {
      name: 'Basmati Rice',
      category: 'Carbs',
      servings: [
        { size: '92g cooked', calories: 92, protein: 1.8, carbs: 20, fats: 0.1 },
        { size: '123g cooked', calories: 123, protein: 2.4, carbs: 27, fats: 0.15 },
        { size: '185g cooked', calories: 185, protein: 3.6, carbs: 41, fats: 0.2 },
      ]
    },
    {
      name: 'Cream of Rice',
      category: 'Carbs',
      servings: [
        { size: '20g dry', calories: 80, protein: 1.5, carbs: 18, fats: 0 },
        { size: '27g dry', calories: 107, protein: 2, carbs: 24, fats: 0 },
        { size: '40g dry', calories: 160, protein: 3, carbs: 36, fats: 0 },
        { size: '53g dry', calories: 213, protein: 4, carbs: 48, fats: 0 },
      ]
    },
    {
      name: 'Rice Cakes',
      category: 'Carbs',
      servings: [
        { size: '9g (1 cake)', calories: 35, protein: 0.7, carbs: 7.3, fats: 0.3 },
        { size: '18g (2 cakes)', calories: 70, protein: 1.4, carbs: 14.6, fats: 0.6 },
        { size: '27g (3 cakes)', calories: 105, protein: 2.1, carbs: 21.9, fats: 0.9 },
        { size: '36g (4 cakes)', calories: 140, protein: 2.8, carbs: 29.2, fats: 1.2 },
      ]
    },
    {
      name: 'Tortilla Wraps (Whole Wheat)',
      category: 'Carbs',
      servings: [
        { size: '60g (1 wrap)', calories: 130, protein: 4, carbs: 22, fats: 3 },
        { size: '120g (2 wraps)', calories: 260, protein: 8, carbs: 44, fats: 6 },
      ]
    },

    // ── NEW 14 ──
    {
      name: 'White Pasta',
      category: 'Carbs',
      servings: [
        { size: '140g cooked', calories: 196, protein: 7, carbs: 38, fats: 1.2 },
        { size: '210g cooked', calories: 294, protein: 10.5, carbs: 57, fats: 1.8 },
        { size: '280g cooked', calories: 392, protein: 14, carbs: 76, fats: 2.4 },
      ]
    },
    {
      name: 'Couscous',
      category: 'Carbs',
      servings: [
        { size: '79g cooked', calories: 88, protein: 3, carbs: 18, fats: 0.1 },
        { size: '118g cooked', calories: 132, protein: 4.5, carbs: 27, fats: 0.15 },
        { size: '157g cooked', calories: 176, protein: 6, carbs: 36, fats: 0.2 },
        { size: '236g cooked', calories: 264, protein: 9, carbs: 54, fats: 0.3 },
      ]
    },
    {
      name: 'Bagel (Plain)',
      category: 'Carbs',
      servings: [
        { size: '55g (1 mini)', calories: 150, protein: 6, carbs: 29, fats: 1 },
        { size: '95g (1 medium)', calories: 260, protein: 10, carbs: 50, fats: 1.5 },
        { size: '130g (1 large)', calories: 350, protein: 13, carbs: 68, fats: 2 },
      ]
    },
    {
      name: 'English Muffin',
      category: 'Carbs',
      servings: [
        { size: '57g (1 muffin)', calories: 132, protein: 5, carbs: 25, fats: 1 },
        { size: '114g (2 muffins)', calories: 264, protein: 10, carbs: 50, fats: 2 },
      ]
    },
    {
      name: 'Corn Tortilla',
      category: 'Carbs',
      servings: [
        { size: '26g (1 tortilla)', calories: 52, protein: 1.4, carbs: 11, fats: 0.7 },
        { size: '52g (2 tortillas)', calories: 104, protein: 2.8, carbs: 22, fats: 1.4 },
        { size: '78g (3 tortillas)', calories: 156, protein: 4.2, carbs: 33, fats: 2.1 },
        { size: '104g (4 tortillas)', calories: 208, protein: 5.6, carbs: 44, fats: 2.8 },
      ]
    },
    {
      name: 'Flour Tortilla',
      category: 'Carbs',
      servings: [
        { size: '45g (1 small)', calories: 140, protein: 3.5, carbs: 24, fats: 3.5 },
        { size: '64g (1 medium)', calories: 200, protein: 5, carbs: 34, fats: 5 },
        { size: '90g (2 small)', calories: 280, protein: 7, carbs: 48, fats: 7 },
      ]
    },
    {
      name: 'Black Beans',
      category: 'Carbs',
      servings: [
        { size: '86g (0.5 cup)', calories: 114, protein: 7.6, carbs: 20, fats: 0.5 },
        { size: '129g (0.75 cup)', calories: 171, protein: 11.4, carbs: 30, fats: 0.7 },
        { size: '172g (1 cup)', calories: 227, protein: 15.2, carbs: 41, fats: 0.9 },
      ]
    },
    {
      name: 'Lentils',
      category: 'Carbs',
      servings: [
        { size: '99g cooked (0.5 cup)', calories: 115, protein: 9, carbs: 20, fats: 0.4 },
        { size: '149g cooked (0.75 cup)', calories: 173, protein: 13.5, carbs: 30, fats: 0.6 },
        { size: '198g cooked (1 cup)', calories: 230, protein: 18, carbs: 40, fats: 0.8 },
      ]
    },
    {
      name: 'Chickpeas',
      category: 'Carbs',
      servings: [
        { size: '82g (0.5 cup)', calories: 134, protein: 7.3, carbs: 22, fats: 2.1 },
        { size: '123g (0.75 cup)', calories: 201, protein: 10.9, carbs: 33, fats: 3.2 },
        { size: '164g (1 cup)', calories: 269, protein: 14.5, carbs: 45, fats: 4.2 },
      ]
    },
    {
      name: 'Granola',
      category: 'Carbs',
      servings: [
        { size: '28g (0.25 cup)', calories: 130, protein: 3, carbs: 18, fats: 5.5 },
        { size: '42g (0.33 cup)', calories: 195, protein: 4.5, carbs: 27, fats: 8.3 },
        { size: '56g (0.5 cup)', calories: 260, protein: 6, carbs: 36, fats: 11 },
      ]
    },
    {
      name: 'Honey',
      category: 'Carbs',
      servings: [
        { size: '1 tsp (7g)', calories: 21, protein: 0, carbs: 6, fats: 0 },
        { size: '1 tbsp (21g)', calories: 64, protein: 0.1, carbs: 17, fats: 0 },
        { size: '2 tbsp (42g)', calories: 128, protein: 0.2, carbs: 34, fats: 0 },
      ]
    },
    {
      name: 'Cream of Wheat',
      category: 'Carbs',
      servings: [
        { size: '24g dry', calories: 90, protein: 2.5, carbs: 19, fats: 0.3 },
        { size: '36g dry', calories: 135, protein: 3.8, carbs: 28.5, fats: 0.5 },
        { size: '48g dry', calories: 180, protein: 5, carbs: 38, fats: 0.6 },
        { size: '72g dry', calories: 270, protein: 7.5, carbs: 57, fats: 0.9 },
      ]
    },
    {
      name: 'Ezekiel Bread',
      category: 'Carbs',
      servings: [
        { size: '34g (1 slice)', calories: 80, protein: 5, carbs: 15, fats: 0.5 },
        { size: '68g (2 slices)', calories: 160, protein: 10, carbs: 30, fats: 1 },
        { size: '102g (3 slices)', calories: 240, protein: 15, carbs: 45, fats: 1.5 },
      ]
    },
    {
      name: 'Low Sugar Cereal',
      category: 'Carbs',
      servings: [
        { size: '28g (1 cup)', calories: 100, protein: 3, carbs: 20, fats: 1.5 },
        { size: '42g (1.5 cups)', calories: 150, protein: 4.5, carbs: 30, fats: 2.3 },
        { size: '56g (2 cups)', calories: 200, protein: 6, carbs: 40, fats: 3 },
      ]
    },
  ],

  // ═══════════════════════════════════════════
  //  VEGETABLES  (25) — Shown in grams
  // ═══════════════════════════════════════════
  vegetables: [
    // ── EXISTING 12 ──
    {
      name: 'Broccoli',
      category: 'Vegetables',
      servings: [
        { size: '91g', calories: 55, protein: 3.7, carbs: 11, fats: 0.6 },
        { size: '136g', calories: 82, protein: 5.5, carbs: 16.5, fats: 0.9 },
        { size: '182g', calories: 110, protein: 7.4, carbs: 22, fats: 1.2 },
        { size: '273g', calories: 165, protein: 11, carbs: 33, fats: 1.8 },
      ]
    },
    {
      name: 'Asparagus',
      category: 'Vegetables',
      servings: [
        { size: '134g', calories: 27, protein: 3.1, carbs: 5, fats: 0.1 },
        { size: '201g', calories: 40, protein: 4.7, carbs: 7.5, fats: 0.15 },
        { size: '268g', calories: 54, protein: 6.2, carbs: 10, fats: 0.2 },
        { size: '402g', calories: 81, protein: 9.3, carbs: 15, fats: 0.3 },
      ]
    },
    {
      name: 'Green Beans',
      category: 'Vegetables',
      servings: [
        { size: '110g', calories: 31, protein: 1.8, carbs: 7, fats: 0.1 },
        { size: '165g', calories: 46, protein: 2.7, carbs: 10.5, fats: 0.15 },
        { size: '220g', calories: 62, protein: 3.6, carbs: 14, fats: 0.2 },
        { size: '330g', calories: 93, protein: 5.4, carbs: 21, fats: 0.3 },
      ]
    },
    {
      name: 'Spinach',
      category: 'Vegetables',
      servings: [
        { size: '60g raw', calories: 14, protein: 1.9, carbs: 2.2, fats: 0.2 },
        { size: '90g raw', calories: 21, protein: 2.9, carbs: 3.3, fats: 0.3 },
        { size: '120g raw', calories: 28, protein: 3.8, carbs: 4.4, fats: 0.4 },
        { size: '150g raw', calories: 35, protein: 4.8, carbs: 5.5, fats: 0.5 },
      ]
    },
    {
      name: 'Bell Peppers',
      category: 'Vegetables',
      servings: [
        { size: '119g (1 medium)', calories: 37, protein: 1.2, carbs: 9, fats: 0.3 },
        { size: '178g (1.5 medium)', calories: 55, protein: 1.8, carbs: 13.5, fats: 0.45 },
        { size: '238g (2 medium)', calories: 74, protein: 2.4, carbs: 18, fats: 0.6 },
        { size: '357g (3 medium)', calories: 111, protein: 3.6, carbs: 27, fats: 0.9 },
      ]
    },
    {
      name: 'Cauliflower',
      category: 'Vegetables',
      servings: [
        { size: '100g', calories: 25, protein: 1.9, carbs: 5, fats: 0.3 },
        { size: '150g', calories: 37, protein: 2.9, carbs: 7.5, fats: 0.45 },
        { size: '200g', calories: 50, protein: 3.8, carbs: 10, fats: 0.6 },
        { size: '300g', calories: 75, protein: 5.8, carbs: 15, fats: 0.9 },
      ]
    },
    {
      name: 'Zucchini',
      category: 'Vegetables',
      servings: [
        { size: '124g', calories: 19, protein: 1.4, carbs: 3.5, fats: 0.3 },
        { size: '186g', calories: 28, protein: 2.1, carbs: 5.3, fats: 0.45 },
        { size: '248g', calories: 38, protein: 2.8, carbs: 7, fats: 0.6 },
        { size: '372g', calories: 57, protein: 4.2, carbs: 10.5, fats: 0.9 },
      ]
    },
    {
      name: 'Cucumbers',
      category: 'Vegetables',
      servings: [
        { size: '119g', calories: 16, protein: 0.8, carbs: 3.6, fats: 0.2 },
        { size: '178g', calories: 24, protein: 1.2, carbs: 5.4, fats: 0.3 },
        { size: '238g', calories: 32, protein: 1.6, carbs: 7.2, fats: 0.4 },
      ]
    },
    {
      name: 'Mushrooms',
      category: 'Vegetables',
      servings: [
        { size: '96g sliced', calories: 15, protein: 2.2, carbs: 2.3, fats: 0.2 },
        { size: '144g sliced', calories: 22, protein: 3.3, carbs: 3.5, fats: 0.3 },
        { size: '192g sliced', calories: 30, protein: 4.4, carbs: 4.6, fats: 0.4 },
        { size: '288g sliced', calories: 45, protein: 6.6, carbs: 6.9, fats: 0.6 },
      ]
    },
    {
      name: 'Kale',
      category: 'Vegetables',
      servings: [
        { size: '67g chopped', calories: 33, protein: 2.9, carbs: 6, fats: 0.6 },
        { size: '100g chopped', calories: 50, protein: 4.4, carbs: 9, fats: 0.9 },
        { size: '134g chopped', calories: 66, protein: 5.8, carbs: 12, fats: 1.2 },
        { size: '200g chopped', calories: 99, protein: 8.7, carbs: 18, fats: 1.8 },
      ]
    },
    {
      name: 'Mixed Greens',
      category: 'Vegetables',
      servings: [
        { size: '56g', calories: 18, protein: 1.5, carbs: 3.2, fats: 0.2 },
        { size: '84g', calories: 27, protein: 2.3, carbs: 4.8, fats: 0.3 },
        { size: '112g', calories: 36, protein: 3, carbs: 6.4, fats: 0.4 },
      ]
    },
    {
      name: 'Tomatoes',
      category: 'Vegetables',
      servings: [
        { size: '123g (1 medium)', calories: 22, protein: 1.1, carbs: 4.8, fats: 0.2 },
        { size: '185g (1.5 medium)', calories: 33, protein: 1.7, carbs: 7.2, fats: 0.3 },
        { size: '246g (2 medium)', calories: 44, protein: 2.2, carbs: 9.6, fats: 0.4 },
        { size: '180g chopped', calories: 32, protein: 1.6, carbs: 7, fats: 0.4 },
      ]
    },

    // ── NEW 13 ──
    {
      name: 'Brussels Sprouts',
      category: 'Vegetables',
      servings: [
        { size: '88g (0.5 cup)', calories: 28, protein: 2, carbs: 5.5, fats: 0.3 },
        { size: '132g (0.75 cup)', calories: 42, protein: 3, carbs: 8.3, fats: 0.5 },
        { size: '176g (1 cup)', calories: 56, protein: 4, carbs: 11, fats: 0.6 },
        { size: '264g (1.5 cups)', calories: 84, protein: 6, carbs: 16.5, fats: 0.9 },
      ]
    },
    {
      name: 'Cabbage',
      category: 'Vegetables',
      servings: [
        { size: '89g (1 cup shredded)', calories: 22, protein: 1.1, carbs: 5.2, fats: 0.1 },
        { size: '134g (1.5 cups shredded)', calories: 33, protein: 1.7, carbs: 7.8, fats: 0.15 },
        { size: '178g (2 cups shredded)', calories: 44, protein: 2.2, carbs: 10.4, fats: 0.2 },
      ]
    },
    {
      name: 'Celery',
      category: 'Vegetables',
      servings: [
        { size: '101g (2 stalks)', calories: 14, protein: 0.7, carbs: 3, fats: 0.2 },
        { size: '152g (3 stalks)', calories: 21, protein: 1, carbs: 4.5, fats: 0.3 },
        { size: '202g (4 stalks)', calories: 28, protein: 1.4, carbs: 6, fats: 0.4 },
      ]
    },
    {
      name: 'Carrots',
      category: 'Vegetables',
      servings: [
        { size: '61g (1 medium)', calories: 25, protein: 0.6, carbs: 5.8, fats: 0.1 },
        { size: '122g (2 medium)', calories: 50, protein: 1.1, carbs: 11.7, fats: 0.3 },
        { size: '128g (1 cup chopped)', calories: 52, protein: 1.2, carbs: 12.3, fats: 0.3 },
        { size: '183g (3 medium)', calories: 75, protein: 1.7, carbs: 17.5, fats: 0.4 },
      ]
    },
    {
      name: 'Snap Peas',
      category: 'Vegetables',
      servings: [
        { size: '63g (0.5 cup)', calories: 26, protein: 1.8, carbs: 4.8, fats: 0.1 },
        { size: '95g (0.75 cup)', calories: 39, protein: 2.7, carbs: 7.2, fats: 0.15 },
        { size: '126g (1 cup)', calories: 52, protein: 3.5, carbs: 9.5, fats: 0.2 },
        { size: '189g (1.5 cups)', calories: 78, protein: 5.3, carbs: 14.3, fats: 0.3 },
      ]
    },
    {
      name: 'Onions',
      category: 'Vegetables',
      servings: [
        { size: '55g (0.5 cup chopped)', calories: 22, protein: 0.6, carbs: 5.1, fats: 0.1 },
        { size: '110g (1 cup chopped)', calories: 44, protein: 1.2, carbs: 10.2, fats: 0.1 },
        { size: '150g (1 medium)', calories: 60, protein: 1.7, carbs: 14, fats: 0.2 },
      ]
    },
    {
      name: 'Corn',
      category: 'Vegetables',
      servings: [
        { size: '82g (0.5 cup kernels)', calories: 66, protein: 2.5, carbs: 14.5, fats: 0.9 },
        { size: '123g (0.75 cup kernels)', calories: 99, protein: 3.8, carbs: 21.8, fats: 1.4 },
        { size: '164g (1 cup kernels)', calories: 132, protein: 5, carbs: 29, fats: 1.8 },
      ]
    },
    {
      name: 'Sweet Peas',
      category: 'Vegetables',
      servings: [
        { size: '72g (0.5 cup)', calories: 59, protein: 4, carbs: 10.4, fats: 0.3 },
        { size: '108g (0.75 cup)', calories: 89, protein: 6, carbs: 15.6, fats: 0.5 },
        { size: '145g (1 cup)', calories: 118, protein: 8, carbs: 21, fats: 0.6 },
      ]
    },
    {
      name: 'Artichoke Hearts',
      category: 'Vegetables',
      servings: [
        { size: '84g (0.5 cup)', calories: 45, protein: 2.4, carbs: 9.4, fats: 0.3 },
        { size: '126g (0.75 cup)', calories: 68, protein: 3.6, carbs: 14.1, fats: 0.5 },
        { size: '168g (1 cup)', calories: 90, protein: 4.8, carbs: 18.8, fats: 0.6 },
      ]
    },
    {
      name: 'Eggplant',
      category: 'Vegetables',
      servings: [
        { size: '82g (1 cup cubed)', calories: 20, protein: 0.8, carbs: 4.8, fats: 0.2 },
        { size: '123g (1.5 cups cubed)', calories: 30, protein: 1.2, carbs: 7.2, fats: 0.3 },
        { size: '164g (2 cups cubed)', calories: 40, protein: 1.6, carbs: 9.6, fats: 0.4 },
      ]
    },
    {
      name: 'Romaine Lettuce',
      category: 'Vegetables',
      servings: [
        { size: '47g (1 cup shredded)', calories: 8, protein: 0.6, carbs: 1.5, fats: 0.1 },
        { size: '94g (2 cups shredded)', calories: 16, protein: 1.2, carbs: 3, fats: 0.2 },
        { size: '141g (3 cups shredded)', calories: 24, protein: 1.8, carbs: 4.5, fats: 0.3 },
      ]
    },
    {
      name: 'Radishes',
      category: 'Vegetables',
      servings: [
        { size: '58g (0.5 cup sliced)', calories: 9, protein: 0.4, carbs: 2, fats: 0.1 },
        { size: '116g (1 cup sliced)', calories: 18, protein: 0.8, carbs: 4, fats: 0.1 },
        { size: '174g (1.5 cups sliced)', calories: 27, protein: 1.2, carbs: 6, fats: 0.2 },
      ]
    },
    {
      name: 'Bok Choy',
      category: 'Vegetables',
      servings: [
        { size: '70g (1 cup shredded)', calories: 9, protein: 1.1, carbs: 1.5, fats: 0.1 },
        { size: '105g (1.5 cups shredded)', calories: 14, protein: 1.6, carbs: 2.3, fats: 0.2 },
        { size: '140g (2 cups shredded)', calories: 18, protein: 2.1, carbs: 3, fats: 0.2 },
        { size: '210g (3 cups shredded)', calories: 27, protein: 3.2, carbs: 4.5, fats: 0.3 },
      ]
    },
  ],

  // ═══════════════════════════════════════════
  //  FRUITS  (21) — Shown in grams
  // ═══════════════════════════════════════════
  fruits: [
    // ── EXISTING 11 ──
    {
      name: 'Banana',
      category: 'Fruits',
      servings: [
        { size: '59g (0.5 medium)', calories: 52, protein: 0.6, carbs: 13, fats: 0.2 },
        { size: '118g (1 medium)', calories: 105, protein: 1.3, carbs: 27, fats: 0.3 },
        { size: '177g (1.5 medium)', calories: 157, protein: 1.9, carbs: 40, fats: 0.5 },
      ]
    },
    {
      name: 'Apple',
      category: 'Fruits',
      servings: [
        { size: '91g (0.5 medium)', calories: 43, protein: 0.2, carbs: 11, fats: 0.1 },
        { size: '182g (1 medium)', calories: 86, protein: 0.4, carbs: 22, fats: 0.2 },
        { size: '273g (1.5 medium)', calories: 129, protein: 0.6, carbs: 33, fats: 0.3 },
      ]
    },
    {
      name: 'Blueberries',
      category: 'Fruits',
      servings: [
        { size: '74g (0.5 cup)', calories: 42, protein: 0.3, carbs: 11, fats: 0.2 },
        { size: '148g (1 cup)', calories: 84, protein: 0.6, carbs: 21, fats: 0.3 },
        { size: '222g (1.5 cup)', calories: 126, protein: 0.9, carbs: 32, fats: 0.5 },
      ]
    },
    {
      name: 'Orange',
      category: 'Fruits',
      servings: [
        { size: '88g (0.5 medium)', calories: 31, protein: 0.5, carbs: 8, fats: 0.1 },
        { size: '177g (1 medium)', calories: 62, protein: 1, carbs: 15, fats: 0.2 },
        { size: '265g (1.5 medium)', calories: 93, protein: 1.5, carbs: 23, fats: 0.3 },
      ]
    },
        {
      name: 'Strawberries',
      category: 'Fruits',
      servings: [
        { size: '75g (0.5 cup)', calories: 24, protein: 0.5, carbs: 6, fats: 0.2 },
        { size: '149g (1 cup)', calories: 49, protein: 1, carbs: 12, fats: 0.5 },
        { size: '224g (1.5 cup)', calories: 73, protein: 1.5, carbs: 18, fats: 0.7 },
        { size: '298g (2 cup)', calories: 98, protein: 2, carbs: 24, fats: 0.9 },
      ]
    },
    {
      name: 'Pear',
      category: 'Fruits',
      servings: [
        { size: '102g (0.5 medium)', calories: 50, protein: 0.3, carbs: 13, fats: 0.1 },
        { size: '204g (1 medium)', calories: 101, protein: 0.7, carbs: 27, fats: 0.2 },
        { size: '306g (1.5 medium)', calories: 151, protein: 1, carbs: 40, fats: 0.3 },
      ]
    },
    {
      name: 'Grapes',
      category: 'Fruits',
      servings: [
        { size: '92g (0.5 cup)', calories: 52, protein: 0.5, carbs: 13, fats: 0.3 },
        { size: '184g (1 cup)', calories: 104, protein: 1, carbs: 27, fats: 0.6 },
        { size: '276g (1.5 cup)', calories: 156, protein: 1.5, carbs: 40, fats: 0.9 },
      ]
    },
    {
      name: 'Watermelon',
      category: 'Fruits',
      servings: [
        { size: '152g (1 cup cubed)', calories: 46, protein: 0.9, carbs: 12, fats: 0.2 },
        { size: '228g (1.5 cup cubed)', calories: 69, protein: 1.4, carbs: 18, fats: 0.3 },
        { size: '304g (2 cup cubed)', calories: 92, protein: 1.8, carbs: 24, fats: 0.4 },
      ]
    },
    {
      name: 'Mango',
      category: 'Fruits',
      servings: [
        { size: '82g (0.5 cup sliced)', calories: 50, protein: 0.7, carbs: 12.5, fats: 0.3 },
        { size: '165g (1 cup sliced)', calories: 99, protein: 1.4, carbs: 25, fats: 0.6 },
        { size: '247g (1.5 cup sliced)', calories: 149, protein: 2.1, carbs: 37, fats: 0.9 },
      ]
    },
    {
      name: 'Pineapple',
      category: 'Fruits',
      servings: [
        { size: '83g (0.5 cup chunks)', calories: 41, protein: 0.4, carbs: 11, fats: 0.1 },
        { size: '165g (1 cup chunks)', calories: 82, protein: 0.9, carbs: 22, fats: 0.2 },
        { size: '248g (1.5 cup chunks)', calories: 123, protein: 1.3, carbs: 33, fats: 0.3 },
      ]
    },
    {
      name: 'Peach',
      category: 'Fruits',
      servings: [
        { size: '100g (0.5 medium)', calories: 30, protein: 0.5, carbs: 7, fats: 0.2 },
        { size: '150g (1 medium)', calories: 59, protein: 1, carbs: 14, fats: 0.4 },
        { size: '225g (1.5 medium)', calories: 89, protein: 1.5, carbs: 21, fats: 0.6 },
        { size: '300g (2 medium)', calories: 118, protein: 2, carbs: 28, fats: 0.8 },
      ]
    },

    // ── NEW 10 ──
    {
      name: 'Raspberries',
      category: 'Fruits',
      servings: [
        { size: '62g (0.5 cup)', calories: 21, protein: 0.5, carbs: 4.8, fats: 0.3 },
        { size: '123g (1 cup)', calories: 42, protein: 1, carbs: 9.6, fats: 0.6 },
        { size: '185g (1.5 cup)', calories: 63, protein: 1.5, carbs: 14.4, fats: 0.9 },
        { size: '246g (2 cups)', calories: 84, protein: 2, carbs: 19.2, fats: 1.2 },
      ]
    },
    {
      name: 'Blackberries',
      category: 'Fruits',
      servings: [
        { size: '72g (0.5 cup)', calories: 26, protein: 0.6, carbs: 6, fats: 0.3 },
        { size: '144g (1 cup)', calories: 52, protein: 1.2, carbs: 12, fats: 0.6 },
        { size: '216g (1.5 cup)', calories: 78, protein: 1.8, carbs: 18, fats: 0.9 },
      ]
    },
    {
      name: 'Kiwi',
      category: 'Fruits',
      servings: [
        { size: '69g (0.5 medium)', calories: 33, protein: 0.5, carbs: 8, fats: 0.3 },
        { size: '138g (1 medium)', calories: 61, protein: 1, carbs: 15, fats: 0.5 },
        { size: '207g (1.5 medium)', calories: 92, protein: 1.5, carbs: 22, fats: 0.8 },
      ]
    },
    {
      name: 'Cantaloupe',
      category: 'Fruits',
      servings: [
        { size: '160g (1 cup cubed)', calories: 54, protein: 1.3, carbs: 13, fats: 0.3 },
        { size: '240g (1.5 cup cubed)', calories: 81, protein: 1.9, carbs: 19.5, fats: 0.5 },
        { size: '320g (2 cups cubed)', calories: 108, protein: 2.6, carbs: 26, fats: 0.6 },
      ]
    },
    {
      name: 'Honeydew',
      category: 'Fruits',
      servings: [
        { size: '170g (1 cup cubed)', calories: 60, protein: 0.9, carbs: 15, fats: 0.3 },
        { size: '255g (1.5 cup cubed)', calories: 90, protein: 1.4, carbs: 22.5, fats: 0.5 },
        { size: '340g (2 cups cubed)', calories: 120, protein: 1.8, carbs: 30, fats: 0.6 },
      ]
    },
    {
      name: 'Grapefruit',
      category: 'Fruits',
      servings: [
        { size: '123g (0.5 medium)', calories: 39, protein: 0.8, carbs: 10, fats: 0.1 },
        { size: '246g (1 medium)', calories: 78, protein: 1.5, carbs: 20, fats: 0.2 },
      ]
    },
    {
      name: 'Cherries',
      category: 'Fruits',
      servings: [
        { size: '68g (0.5 cup)', calories: 34, protein: 0.7, carbs: 8.5, fats: 0.3 },
        { size: '136g (1 cup)', calories: 68, protein: 1.4, carbs: 17, fats: 0.6 },
        { size: '204g (1.5 cups)', calories: 102, protein: 2.1, carbs: 25.5, fats: 0.9 },
      ]
    },
    {
      name: 'Frozen Mixed Berries',
      category: 'Fruits',
      servings: [
        { size: '80g (0.5 cup)', calories: 38, protein: 0.6, carbs: 9, fats: 0.3 },
        { size: '160g (1 cup)', calories: 76, protein: 1.2, carbs: 18, fats: 0.6 },
        { size: '240g (1.5 cup)', calories: 114, protein: 1.8, carbs: 27, fats: 0.9 },
      ]
    },
    {
      name: 'Mandarins',
      category: 'Fruits',
      servings: [
        { size: '88g (1 medium)', calories: 47, protein: 0.7, carbs: 12, fats: 0.3 },
        { size: '132g (1.5 medium)', calories: 70, protein: 1, carbs: 18, fats: 0.5 },
        { size: '176g (2 medium)', calories: 94, protein: 1.4, carbs: 24, fats: 0.6 },
      ]
    },
  ],

  // ═══════════════════════════════════════════
  //  HEALTHY FATS  (21) — Shown in tbsp/tsp
  // ═══════════════════════════════════════════
  fats: [
    // ── EXISTING 10 ──
    {
      name: 'Olive Oil',
      category: 'Healthy Fats',
      servings: [
        { size: '0.5 tbsp', calories: 60, protein: 0, carbs: 0, fats: 6.7 },
        { size: '1 tbsp', calories: 119, protein: 0, carbs: 0, fats: 13.5 },
        { size: '1.5 tbsp', calories: 179, protein: 0, carbs: 0, fats: 20 },
        { size: '2 tbsp', calories: 238, protein: 0, carbs: 0, fats: 27 },
      ]
    },
    {
      name: 'Peanut Butter',
      category: 'Healthy Fats',
      servings: [
        { size: '1 tbsp', calories: 96, protein: 4, carbs: 3, fats: 8 },
        { size: '1.5 tbsp', calories: 144, protein: 6, carbs: 4.5, fats: 12 },
        { size: '2 tbsp', calories: 192, protein: 8, carbs: 6, fats: 16 },
      ]
    },
    {
      name: 'Almonds',
      category: 'Healthy Fats',
      servings: [
        { size: '28g', calories: 164, protein: 6, carbs: 6, fats: 14 },
        { size: '38g', calories: 220, protein: 8, carbs: 8, fats: 19 },
        { size: '56g', calories: 328, protein: 12, carbs: 12, fats: 28 },
      ]
    },
    {
      name: 'Avocado',
      category: 'Healthy Fats',
      servings: [
        { size: '50g (0.25 fruit)', calories: 60, protein: 0.8, carbs: 3, fats: 5.5 },
        { size: '67g (0.33 fruit)', calories: 80, protein: 1, carbs: 4, fats: 7.3 },
        { size: '100g (0.5 fruit)', calories: 121, protein: 1.5, carbs: 6, fats: 11 },
        { size: '200g (1 fruit)', calories: 240, protein: 3, carbs: 12, fats: 22 },
      ]
    },
    {
      name: 'Coconut Oil',
      category: 'Healthy Fats',
      servings: [
        { size: '0.5 tbsp', calories: 60, protein: 0, carbs: 0, fats: 6.8 },
        { size: '1 tbsp', calories: 120, protein: 0, carbs: 0, fats: 13.5 },
        { size: '1.5 tbsp', calories: 180, protein: 0, carbs: 0, fats: 20 },
      ]
    },
    {
      name: 'Almond Butter',
      category: 'Healthy Fats',
      servings: [
        { size: '1 tbsp', calories: 98, protein: 3.4, carbs: 3.5, fats: 8.8 },
        { size: '1.5 tbsp', calories: 147, protein: 5.1, carbs: 5.3, fats: 13.2 },
        { size: '2 tbsp', calories: 196, protein: 6.8, carbs: 7.1, fats: 17.6 },
      ]
    },
    {
      name: 'Walnuts',
      category: 'Healthy Fats',
      servings: [
        { size: '28g', calories: 185, protein: 4.3, carbs: 4, fats: 18.5 },
        { size: '38g', calories: 260, protein: 6, carbs: 5.5, fats: 26 },
        { size: '56g', calories: 391, protein: 9, carbs: 8, fats: 39 },
      ]
    },
    {
      name: 'Cashews',
      category: 'Healthy Fats',
      servings: [
        { size: '28g', calories: 157, protein: 5, carbs: 9, fats: 12 },
        { size: '38g', calories: 210, protein: 6.7, carbs: 12, fats: 16 },
        { size: '56g', calories: 314, protein: 10, carbs: 18, fats: 24 },
      ]
    },
    {
      name: 'Cheese (Cheddar)',
      category: 'Healthy Fats',
      servings: [
        { size: '14g (0.5 oz)', calories: 57, protein: 3.5, carbs: 0.2, fats: 4.7 },
        { size: '28g (1 oz)', calories: 113, protein: 7, carbs: 0.4, fats: 9.3 },
        { size: '42g (1.5 oz)', calories: 170, protein: 10.5, carbs: 0.6, fats: 14 },
        { size: '56g (2 oz)', calories: 226, protein: 14, carbs: 0.8, fats: 18.6 },
      ]
    },
    {
      name: 'Egg Yolks',
      category: 'Healthy Fats',
      servings: [
        { size: '1 yolk', calories: 55, protein: 2.7, carbs: 0.6, fats: 4.5 },
        { size: '2 yolks', calories: 110, protein: 5.4, carbs: 1.2, fats: 9 },
        { size: '3 yolks', calories: 165, protein: 8.1, carbs: 1.8, fats: 13.5 },
        { size: '4 yolks', calories: 220, protein: 10.8, carbs: 2.4, fats: 18 },
      ]
    },

    // ── NEW 11 ──
    {
      name: 'Pecans',
      category: 'Healthy Fats',
      servings: [
        { size: '28g', calories: 196, protein: 2.6, carbs: 3.9, fats: 20 },
        { size: '38g', calories: 265, protein: 3.5, carbs: 5.3, fats: 27 },
        { size: '56g', calories: 392, protein: 5.2, carbs: 7.9, fats: 40 },
      ]
    },
    {
      name: 'Pistachios',
      category: 'Healthy Fats',
      servings: [
        { size: '28g', calories: 159, protein: 5.7, carbs: 7.7, fats: 12.9 },
        { size: '38g', calories: 215, protein: 7.7, carbs: 10.4, fats: 17.5 },
        { size: '56g', calories: 318, protein: 11.4, carbs: 15.6, fats: 25.8 },
      ]
    },
    {
      name: 'Macadamia Nuts',
      category: 'Healthy Fats',
      servings: [
        { size: '28g', calories: 204, protein: 2.2, carbs: 3.9, fats: 21.5 },
        { size: '38g', calories: 276, protein: 3, carbs: 5.3, fats: 29 },
        { size: '56g', calories: 408, protein: 4.4, carbs: 7.9, fats: 43 },
      ]
    },
    {
      name: 'Chia Seeds',
      category: 'Healthy Fats',
      servings: [
        { size: '1 tbsp (14g)', calories: 60, protein: 2, carbs: 5, fats: 3.6 },
        { size: '2 tbsp (28g)', calories: 120, protein: 4, carbs: 10, fats: 7.2 },
        { size: '3 tbsp (42g)', calories: 180, protein: 6, carbs: 15, fats: 10.8 },
      ]
    },
    {
      name: 'Flax Seeds',
      category: 'Healthy Fats',
      servings: [
        { size: '1 tbsp (10g)', calories: 55, protein: 1.9, carbs: 3, fats: 4.3 },
        { size: '2 tbsp (20g)', calories: 110, protein: 3.8, carbs: 6, fats: 8.6 },
        { size: '3 tbsp (30g)', calories: 165, protein: 5.7, carbs: 9, fats: 12.9 },
      ]
    },
    {
      name: 'Hemp Seeds',
      category: 'Healthy Fats',
      servings: [
        { size: '1 tbsp (9g)', calories: 50, protein: 3.3, carbs: 1.2, fats: 3.3 },
        { size: '2 tbsp (18g)', calories: 100, protein: 6.6, carbs: 2.4, fats: 6.6 },
        { size: '3 tbsp (27g)', calories: 150, protein: 9.9, carbs: 3.6, fats: 9.9 },
      ]
    },
    {
      name: 'Sunflower Seed Butter',
      category: 'Healthy Fats',
      servings: [
        { size: '1 tbsp', calories: 93, protein: 3.5, carbs: 4, fats: 8 },
        { size: '1.5 tbsp', calories: 140, protein: 5.3, carbs: 6, fats: 12 },
        { size: '2 tbsp', calories: 186, protein: 7, carbs: 8, fats: 16 },
      ]
    },
    {
      name: 'Cream Cheese',
      category: 'Healthy Fats',
      servings: [
        { size: '14g (0.5 oz)', calories: 49, protein: 1, carbs: 0.4, fats: 4.9 },
        { size: '28g (1 oz)', calories: 99, protein: 2, carbs: 0.8, fats: 9.8 },
        { size: '42g (1.5 oz)', calories: 148, protein: 3, carbs: 1.2, fats: 14.7 },
        { size: '56g (2 oz)', calories: 198, protein: 4, carbs: 1.6, fats: 19.6 },
      ]
    },
    {
      name: 'Mozzarella Cheese',
      category: 'Healthy Fats',
      servings: [
        { size: '28g (1 oz)', calories: 84, protein: 6.3, carbs: 0.6, fats: 6.3 },
        { size: '42g (1.5 oz)', calories: 126, protein: 9.5, carbs: 0.9, fats: 9.5 },
        { size: '56g (2 oz)', calories: 168, protein: 12.6, carbs: 1.2, fats: 12.6 },
      ]
    },
    {
      name: 'American Cheese',
      category: 'Healthy Fats',
      servings: [
        { size: '21g (1 slice)', calories: 92, protein: 5.3, carbs: 0.5, fats: 7.6 },
        { size: '42g (2 slices)', calories: 184, protein: 10.6, carbs: 1, fats: 15.2 },
        { size: '63g (3 slices)', calories: 276, protein: 15.9, carbs: 1.5, fats: 22.8 },
      ]
    },
    {
      name: 'Dark Chocolate (70%+)',
      category: 'Healthy Fats',
      servings: [
        { size: '10g (1 square)', calories: 57, protein: 1, carbs: 4.5, fats: 4.5 },
        { size: '20g (2 squares)', calories: 114, protein: 2, carbs: 9, fats: 9 },
        { size: '28g (3 squares)', calories: 159, protein: 2.8, carbs: 12.6, fats: 12.6 },
        { size: '42g (4-5 squares)', calories: 238, protein: 4.2, carbs: 18.9, fats: 18.9 },
      ]
    },
  ]
};

// ═════════════════════════════════════════════════════
//  HELPER FUNCTIONS
// ═════════════════════════════════════════════════════

// Get all foods as flat array
export const getAllFoods = () => {
  const allFoods = [];
  Object.values(foodDatabase).forEach(category => {
    allFoods.push(...category);
  });
  return allFoods;
};

// Find food by name (case-insensitive)
export const getFoodByName = (name) => {
  const allFoods = getAllFoods();
  return allFoods.find(f => f.name.toLowerCase() === name.toLowerCase());
};

// Find the preset serving closest to a calorie target
export const findClosestServing = (foodName, targetCalories) => {
  const food = getFoodByName(foodName);
  if (!food || !food.servings) return null;

  let closest = food.servings[0];
  let minDiff = Math.abs(food.servings[0].calories - targetCalories);

  for (const serving of food.servings) {
    const diff = Math.abs(serving.calories - targetCalories);
    if (diff < minDiff) {
      minDiff = diff;
      closest = serving;
    }
  }

  return closest;
};

/**
 * FIXED: Returns clean portions based on food category
 * Proteins: oz | Carbs/Veggies/Fruits: grams | Fats: tbsp/tsp
 * 
 * Strategy:
 * 1. Try to find a preset serving within tolerance
 * 2. If not found, calculate the scale and convert to clean weight
 * 3. Return portion in appropriate unit for the food type
 */
export const findBestServing = (foodName, targetCalories, tolerance = 15) => {
  const food = getFoodByName(foodName);
  if (!food || !food.servings || food.servings.length === 0) return null;

  // 1. Check if a preset serving is close enough
  const preset = findClosestServing(foodName, targetCalories);
  if (preset && Math.abs(preset.calories - targetCalories) <= tolerance) {
    return { ...preset, interpolated: false };
  }

  // 2. Calculate scale from base serving
  const base = food.servings[0];
  if (base.calories === 0) return preset ? { ...preset, interpolated: false } : null;

  const scale = targetCalories / base.calories;

  // 3. Convert to clean weight format (category-aware)
  const cleanSize = convertToCleanWeight(base.size, scale, food.category);

  return {
    size: cleanSize,
    calories: Math.round(base.calories * scale),
    protein: Math.round(base.protein * scale * 10) / 10,
    carbs: Math.round(base.carbs * scale * 10) / 10,
    fats: Math.round(base.fats * scale * 10) / 10,
    interpolated: true,
    scaleFactor: Math.round(scale * 100) / 100,
  };
};

/**
 * Convert interpolated portion to clean weight
 * Category-aware: 
 * - Protein: Keep oz
 * - Carbs/Veggies/Fruits: Convert to grams
 * - Fats: Keep tbsp/tsp
 * 
 * Examples:
 * - "3 oz" × 1.84 = "5.5 oz" (Protein)
 * - "100g cooked" × 1.5 = "150g cooked" (Carbs)
 * - "1 tbsp" × 1.5 = "1.5 tbsp" (Fats)
 */
function convertToCleanWeight(baseSize, scale, foodCategory) {
  // Extract numeric value and unit from base size
  const match = baseSize.match(/^([\d.]+)\s*(.+)$/);
  if (!match) return baseSize;

  const baseAmount = parseFloat(match[1]);
  let unit = match[2];

  // Calculate final amount
  const finalAmount = baseAmount * scale;

  // Round based on unit type
  let rounded;

  // For proteins in oz — keep oz as-is
  if (foodCategory === 'Protein' && unit.includes('oz')) {
    rounded = Math.round(finalAmount * 2) / 2; // Round to 0.5
  } 
  // For fats (tbsp/tsp) — keep as tbsp/tsp
  else if (unit.includes('tbsp') || unit.includes('tsp')) {
    rounded = Math.round(finalAmount * 4) / 4; // Round to 0.25
  }
  // For carbs/veggies/fruits that are already in grams or "cooked"
  else if (unit.includes('g') || unit.includes('cooked')) {
    rounded = Math.round(finalAmount); // Round to nearest gram
  }
  // For egg counts, serving counts
  else if (unit.includes('white') || unit.includes('egg') || unit.includes('yolk') || unit.includes('slice')) {
    rounded = Math.round(finalAmount * 2) / 2; // Round to 0.5
  }
  // Default
  else {
    rounded = Math.round(finalAmount * 2) / 2;
  }

  // Format the output (remove .0 for whole numbers)
  const formatted = rounded % 1 === 0 ? String(Math.round(rounded)) : String(rounded);
  
  return `${formatted} ${unit}`;
}

// Get all food names in a specific category
export const getFoodNamesByCategory = (categoryKey) => {
  const cat = foodDatabase[categoryKey];
  if (!cat) return [];
  return cat.map(f => f.name);
};

// BACKWARD COMPATIBILITY
export const FOOD_DATABASE = foodDatabase;
export default foodDatabase;
