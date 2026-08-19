/**
 * mockDatabase.js — Simulated food nutrition database.
 *
 * All values are per 100g of the food item.
 * Source: Approximated from USDA nutritional data for prototype use.
 *
 * Structure per entry:
 *   calories : kcal per 100g
 *   protein  : grams of protein per 100g
 *   carbs    : grams of carbohydrates per 100g
 *   fats     : grams of fat per 100g
 */

/** @typedef {{ calories: number, protein: number, carbs: number, fats: number }} NutrientProfile */

/** @type {Record<string, NutrientProfile>} */
export const FOOD_DATABASE = {
  // ── Proteins ──
  'chicken breast':  { calories: 165, protein: 31.0, carbs: 0.0,  fats: 3.6  },
  'salmon':          { calories: 208, protein: 20.0, carbs: 0.0,  fats: 13.0 },
  'tuna':            { calories: 132, protein: 28.0, carbs: 0.0,  fats: 1.3  },
  'eggs':            { calories: 155, protein: 13.0, carbs: 1.1,  fats: 11.0 },
  'greek yogurt':    { calories: 59,  protein: 10.0, carbs: 3.6,  fats: 0.4  },

  // ── Carbs ──
  'white rice':      { calories: 130, protein: 2.7,  carbs: 28.0, fats: 0.3  },
  'brown rice':      { calories: 112, protein: 2.6,  carbs: 23.5, fats: 0.9  },
  'oats':            { calories: 389, protein: 17.0, carbs: 66.0, fats: 7.0  },
  'banana':          { calories: 89,  protein: 1.1,  carbs: 23.0, fats: 0.3  },
  'sweet potato':    { calories: 86,  protein: 1.6,  carbs: 20.0, fats: 0.1  },
  'whole wheat bread':{ calories: 247, protein: 13.0, carbs: 41.0, fats: 3.4 },

  // ── Fats ──
  'avocado':         { calories: 160, protein: 2.0,  carbs: 9.0,  fats: 15.0 },
  'almonds':         { calories: 579, protein: 21.0, carbs: 22.0, fats: 50.0 },
  'peanut butter':   { calories: 588, protein: 25.0, carbs: 20.0, fats: 50.0 },
  'olive oil':       { calories: 884, protein: 0.0,  carbs: 0.0,  fats: 100.0},

  // ── Vegetables ──
  'broccoli':        { calories: 34,  protein: 2.8,  carbs: 7.0,  fats: 0.4  },
  'spinach':         { calories: 23,  protein: 2.9,  carbs: 3.6,  fats: 0.4  },

  // ── Mixed / Snacks ──
  'avocado toast':   { calories: 195, protein: 5.5,  carbs: 18.5, fats: 11.0 },
  'pizza':           { calories: 266, protein: 11.0, carbs: 33.0, fats: 10.0 },
  'burger':          { calories: 295, protein: 17.0, carbs: 24.0, fats: 14.0 },
};

/**
 * A safe fallback profile used when the user types a food name
 * that doesn't exist in the database.
 * Represents a rough average across common whole foods.
 * @type {NutrientProfile}
 */
export const FALLBACK_NUTRIENT_PROFILE = {
  calories: 150,
  protein:  10.0,
  carbs:    18.0,
  fats:     5.0,
};

/**
 * Mock data sets for the "Image Upload" simulation.
 * Each entry mimics what an AI food scanner might return —
 * a pre-identified food with a suggested portion weight.
 */
export const IMAGE_UPLOAD_MOCKS = [
  { name: 'Avocado Toast',    weight: 200 },
  { name: 'Chicken Breast',   weight: 150 },
  { name: 'Salmon',           weight: 180 },
  { name: 'Greek Yogurt',     weight: 250 },
  { name: 'Oats',             weight: 80  },
  { name: 'Banana',           weight: 120 },
  { name: 'Brown Rice',       weight: 200 },
  { name: 'Peanut Butter',    weight: 32  },
];

/**
 * Looks up a food entry from the database using a case-insensitive,
 * trimmed match. Returns the FALLBACK_NUTRIENT_PROFILE if not found.
 *
 * @param {string} foodName - Raw user input or image mock food name.
 * @returns {NutrientProfile} The matched (or fallback) nutrient profile.
 */
export function lookupFood(foodName) {
  const normalised = foodName.trim().toLowerCase();
  return FOOD_DATABASE[normalised] ?? FALLBACK_NUTRIENT_PROFILE;
}
