/**
 * nutrientCalculator.js — Core nutrient scaling engine.
 *
 * ── Self-Evaluation Loop (v2 — Final) ──
 *
 * Draft v1: `(baseValue / 100) * weight`
 *
 * Edge cases evaluated and resolved:
 *   1. weight <= 0     → Rejected at the entry point; throws a descriptive error
 *                        so the UI can show a validation message instead of
 *                        logging a 0-calorie or negative-calorie meal silently.
 *   2. weight > 5000g  → Hard cap enforced. No single food entry should exceed 5kg.
 *                        Prevents nonsensical data from corrupting the budget totals.
 *   3. Floating-point  → Raw JS math on (3.1 / 100) * 200 yields 6.200000000001.
 *      precision         All outputs are rounded to 1 decimal place via
 *                        Math.round(value * 10) / 10, giving clean 6.2g.
 *   4. Food not in DB  → Handled upstream in lookupFood() via FALLBACK_NUTRIENT_PROFILE.
 *                        This function only receives an already-resolved NutrientProfile,
 *                        so NaN propagation is impossible at this layer.
 *   5. NaN inputs      → If a non-numeric weight somehow bypasses the UI (e.g., via
 *                        programmatic calls), the guard `Number.isFinite(weight)` catches it.
 */

import { v4 as uuidv4 } from './uuid.js';
import { lookupFood } from './mockDatabase.js';

/** Maximum allowed portion weight in grams (hard cap). */
const MAX_WEIGHT_G = 5000;

/** Minimum allowed portion weight in grams. */
const MIN_WEIGHT_G = 1;

/**
 * Rounds a number to exactly 1 decimal place, eliminating
 * floating-point artifacts like 10.000000001.
 *
 * @param {number} value
 * @returns {number}
 */
function roundToOne(value) {
  return Math.round(value * 10) / 10;
}

/**
 * Validates the user-provided portion weight.
 * Throws a user-facing Error if the weight is outside acceptable bounds.
 *
 * @param {number} weight - The weight in grams to validate.
 * @throws {Error} With a descriptive message for UI display.
 */
function validateWeight(weight) {
  if (!Number.isFinite(weight)) {
    throw new Error('Please enter a valid number for the portion weight.');
  }
  if (weight < MIN_WEIGHT_G) {
    throw new Error(`Portion weight must be at least ${MIN_WEIGHT_G}g.`);
  }
  if (weight > MAX_WEIGHT_G) {
    throw new Error(`Portion weight cannot exceed ${MAX_WEIGHT_G}g.`);
  }
}

/**
 * Scales a single nutrient value from its per-100g baseline to the
 * user-specified portion weight.
 *
 * Formula: (baseValuePer100g / 100) × portionWeightInGrams
 * Result is rounded to 1 decimal to eliminate FP precision artifacts.
 *
 * @param {number} basePer100g - The nutrient value per 100g.
 * @param {number} weight - The actual portion weight in grams.
 * @returns {number} Scaled and rounded nutrient value.
 */
function scaleNutrient(basePer100g, weight) {
  return roundToOne((basePer100g / 100) * weight);
}

/**
 * calculateMeal — The primary public API of this module.
 *
 * Takes a raw food name and portion weight, looks up the food's
 * nutrient profile, validates the weight, scales all four macros,
 * and returns a complete Meal object ready to be added to state.
 *
 * @param {string} foodName - The food name as typed by the user.
 * @param {number} weightInGrams - The portion weight as entered by the user.
 * @returns {{ id: string, name: string, weightInGrams: number, calories: number, protein: number, carbs: number, fats: number }}
 * @throws {Error} If weight is invalid (propagated from validateWeight).
 */
export function calculateMeal(foodName, weightInGrams) {
  const weight = Number(weightInGrams); // Coerce string from input fields

  // ── Guard: validate weight before any calculation ──
  validateWeight(weight);

  const trimmedName = foodName.trim();
  if (!trimmedName) {
    throw new Error('Please enter a food name.');
  }

  // Resolve the nutrient profile (returns fallback if food not in DB)
  const profile = lookupFood(trimmedName);

  return {
    id:            uuidv4(),               // Unique key for React list rendering & deletion
    name:          trimmedName,
    weightInGrams: weight,
    calories:      scaleNutrient(profile.calories, weight),
    protein:       scaleNutrient(profile.protein,  weight),
    carbs:         scaleNutrient(profile.carbs,    weight),
    fats:          scaleNutrient(profile.fats,     weight),
  };
}

/**
 * aggregateMeals — Sums all nutritional values across a list of meals.
 *
 * Used by Context to derive the current daily totals.
 * All values are re-rounded after summation to prevent cumulative
 * floating-point drift (e.g., 6.2 + 4.1 = 10.299999999 → 10.3).
 *
 * @param {Array<{ calories: number, protein: number, carbs: number, fats: number }>} meals
 * @returns {{ calories: number, protein: number, carbs: number, fats: number }}
 */
export function aggregateMeals(meals) {
  const totals = meals.reduce(
    (acc, meal) => ({
      calories: acc.calories + meal.calories,
      protein:  acc.protein  + meal.protein,
      carbs:    acc.carbs    + meal.carbs,
      fats:     acc.fats     + meal.fats,
    }),
    { calories: 0, protein: 0, carbs: 0, fats: 0 }
  );

  // Re-round after summation to kill accumulated FP drift
  return {
    calories: roundToOne(totals.calories),
    protein:  roundToOne(totals.protein),
    carbs:    roundToOne(totals.carbs),
    fats:     roundToOne(totals.fats),
  };
}

/**
 * getProgressPercent — Calculates a progress bar fill percentage.
 *
 * Clamps output to [0, 100] so the bar never visually overflows its track,
 * even when the user is significantly over budget.
 *
 * @param {number} current - Current consumed amount.
 * @param {number} limit - The daily target limit.
 * @returns {number} A percentage between 0 and 100 (inclusive).
 */
export function getProgressPercent(current, limit) {
  if (!limit || limit <= 0) return 0;
  return Math.min(100, Math.max(0, (current / limit) * 100));
}
