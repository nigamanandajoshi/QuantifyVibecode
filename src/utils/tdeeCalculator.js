/**
 * tdeeCalculator.js — Science-backed calorie & macro target engine.
 *
 * Formula: Mifflin-St Jeor (1990) — the most validated BMR equation.
 *   Male:   BMR = (10 × weight_kg) + (6.25 × height_cm) − (5 × age) + 5
 *   Female: BMR = (10 × weight_kg) + (6.25 × height_cm) − (5 × age) − 161
 *
 * TDEE = BMR × Activity Multiplier
 *
 * Goal adjustments (evidence-based):
 *   Weight Loss : TDEE − 500 kcal  (~0.5kg/week safe deficit)
 *   Maintenance : TDEE
 *   Muscle Gain : TDEE + 300 kcal  (lean bulk surplus)
 *
 * Macro splits (% of calories, converted to grams):
 *   Protein  = 4 kcal/g
 *   Carbs    = 4 kcal/g
 *   Fats     = 9 kcal/g
 */

/** @typedef {'male' | 'female'} Gender */
/** @typedef {'sedentary' | 'light' | 'moderate' | 'active' | 'veryActive'} ActivityLevel */
/** @typedef {'weightLoss' | 'maintenance' | 'muscleGain'} GoalKey */

/** Activity multipliers mapped from lifestyle descriptions. */
export const ACTIVITY_LEVELS = [
  { key: 'sedentary',  label: 'Sedentary',        description: 'Desk job, little or no exercise',   multiplier: 1.2   },
  { key: 'light',      label: 'Lightly Active',    description: 'Light exercise 1–3 days/week',       multiplier: 1.375 },
  { key: 'moderate',   label: 'Moderately Active', description: 'Moderate exercise 3–5 days/week',    multiplier: 1.55  },
  { key: 'active',     label: 'Very Active',        description: 'Hard exercise 6–7 days/week',        multiplier: 1.725 },
  { key: 'veryActive', label: 'Athlete',            description: 'Physical job or 2× daily training',  multiplier: 1.9   },
];

/** Calorie delta applied to TDEE for each fitness goal. */
const GOAL_DELTAS = {
  weightLoss:  -500,
  maintenance:  0,
  muscleGain:  +300,
};

/**
 * Macro split ratios (protein / carbs / fats as fraction of total calories).
 * Protein and carbs = 4 kcal/g, Fats = 9 kcal/g.
 */
const MACRO_RATIOS = {
  weightLoss:  { protein: 0.40, carbs: 0.35, fats: 0.25 },
  maintenance: { protein: 0.30, carbs: 0.45, fats: 0.25 },
  muscleGain:  { protein: 0.35, carbs: 0.45, fats: 0.20 },
};

/**
 * @typedef {Object} UserProfile
 * @property {number}        weightKg      - Body weight in kilograms.
 * @property {number}        heightCm      - Height in centimetres.
 * @property {number}        age           - Age in years.
 * @property {Gender}        gender        - 'male' or 'female'.
 * @property {ActivityLevel} activityLevel - One of the ACTIVITY_LEVELS keys.
 */

/**
 * @typedef {Object} GoalTargets
 * @property {number} maxCalories
 * @property {number} maxProtein
 * @property {number} maxCarbs
 * @property {number} maxFats
 */

/**
 * calculateBMR — Mifflin-St Jeor basal metabolic rate.
 *
 * @param {UserProfile} profile
 * @returns {number} BMR in kcal/day, rounded to nearest whole number.
 */
export function calculateBMR({ weightKg, heightCm, age, gender }) {
  const base = (10 * weightKg) + (6.25 * heightCm) - (5 * age);
  const bmr  = gender === 'male' ? base + 5 : base - 161;
  return Math.round(bmr);
}

/**
 * calculateTDEE — Total Daily Energy Expenditure.
 *
 * @param {UserProfile} profile
 * @returns {number} TDEE in kcal/day.
 */
export function calculateTDEE(profile) {
  const bmr        = calculateBMR(profile);
  const activity   = ACTIVITY_LEVELS.find((a) => a.key === profile.activityLevel);
  const multiplier = activity?.multiplier ?? 1.2; // Fallback to sedentary
  return Math.round(bmr * multiplier);
}

/**
 * deriveGoalTargets — Builds the GoalTargets object for a given fitness goal
 * based on a user's computed TDEE.
 *
 * @param {number}  tdee    - Computed TDEE in kcal.
 * @param {GoalKey} goalKey - The fitness goal to derive targets for.
 * @returns {GoalTargets}
 */
export function deriveGoalTargets(tdee, goalKey) {
  const calories = Math.max(1200, tdee + GOAL_DELTAS[goalKey]); // Hard floor: 1200 kcal
  const ratios   = MACRO_RATIOS[goalKey];

  return {
    maxCalories: calories,
    maxProtein:  Math.round((calories * ratios.protein) / 4),
    maxCarbs:    Math.round((calories * ratios.carbs)   / 4),
    maxFats:     Math.round((calories * ratios.fats)    / 9),
  };
}

/**
 * deriveAllGoalTargets — Precomputes targets for all three goals at once.
 * Used by the Context so switching goals is a simple lookup, not a recalculation.
 *
 * @param {number} tdee
 * @returns {Record<GoalKey, GoalTargets>}
 */
export function deriveAllGoalTargets(tdee) {
  return {
    weightLoss:  deriveGoalTargets(tdee, 'weightLoss'),
    maintenance: deriveGoalTargets(tdee, 'maintenance'),
    muscleGain:  deriveGoalTargets(tdee, 'muscleGain'),
  };
}

/**
 * Validates user profile inputs before calculation.
 * Returns an array of error strings (empty = valid).
 *
 * @param {{ weightKg: any, heightCm: any, age: any }} raw
 * @returns {string[]}
 */
export function validateProfile({ weightKg, heightCm, age }) {
  const errors = [];
  if (!weightKg || weightKg < 20 || weightKg > 300)
    errors.push('Weight must be between 20 and 300 kg.');
  if (!heightCm || heightCm < 50 || heightCm > 280)
    errors.push('Height must be between 50 and 280 cm.');
  if (!age || age < 10 || age > 120)
    errors.push('Age must be between 10 and 120 years.');
  return errors;
}
