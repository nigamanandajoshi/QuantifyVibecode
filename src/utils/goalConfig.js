/**
 * goalConfig.js — Fitness Goal Threshold Definitions.
 *
 * This is the single source of truth for all daily calorie and macro
 * limits. When the user switches their Fitness Goal, the Context reads
 * the corresponding entry from GOAL_CONFIGS and updates the active limits.
 *
 * ── Why separate from state? ──
 * These are static constants, not dynamic data. Keeping them here means:
 *   • The Context never needs to "compute" limits — it just looks them up.
 *   • Adjusting these values (e.g. personalisation feature later) requires
 *     changing only this file.
 *   • The Vibe Check toggle is pure: goalKey → new limits, no side effects.
 *
 * ── Macro distribution rationale ──
 *   Weight Loss:  Lower calories, moderate protein to preserve muscle,
 *                 reduced carbs, moderate fat.
 *   Maintenance:  Balanced macros at TDEE (~2000 kcal for average adult).
 *   Muscle Gain:  Caloric surplus, high protein to support hypertrophy,
 *                 higher carbs for workout fuel.
 */

/** @typedef {'weightLoss' | 'maintenance' | 'muscleGain'} GoalKey */

/**
 * @typedef {Object} GoalConfig
 * @property {GoalKey}  key         - Machine-readable identifier.
 * @property {string}   label       - Human-readable label for the toggle UI.
 * @property {string}   emoji       - Visual icon for the toggle button.
 * @property {string}   description - Short subtitle shown below the toggle.
 * @property {number}   maxCalories - Daily calorie limit in kcal.
 * @property {number}   maxProtein  - Daily protein target in grams.
 * @property {number}   maxCarbs    - Daily carbohydrate limit in grams.
 * @property {number}   maxFats     - Daily fat limit in grams.
 */

/** @type {Record<GoalKey, GoalConfig>} */
export const GOAL_CONFIGS = {
  weightLoss: {
    key:         'weightLoss',
    label:       'Weight Loss',
    emoji:       '🏃',
    description: 'Caloric deficit to shed fat',
    maxCalories: 1500,
    maxProtein:  130,
    maxCarbs:    140,
    maxFats:     50,
  },
  maintenance: {
    key:         'maintenance',
    label:       'Maintenance',
    emoji:       '⚖️',
    description: 'Balanced energy for daily life',
    maxCalories: 2000,
    maxProtein:  150,
    maxCarbs:    225,
    maxFats:     65,
  },
  muscleGain: {
    key:         'muscleGain',
    label:       'Muscle Gain',
    emoji:       '💪',
    description: 'Caloric surplus for hypertrophy',
    maxCalories: 2700,
    maxProtein:  200,
    maxCarbs:    320,
    maxFats:     85,
  },
};

/**
 * The default goal key used on initial app load.
 * @type {GoalKey}
 */
export const DEFAULT_GOAL_KEY = 'maintenance';

/**
 * An ordered array of goal keys, used by the toggle UI to render
 * buttons in the correct sequence (left → right).
 * @type {GoalKey[]}
 */
export const GOAL_ORDER = ['weightLoss', 'maintenance', 'muscleGain'];
