/**
 * TrackerContext.jsx — Global state for the NutriTrack application.
 *
 * ── What lives here ──
 *   • meals[]            — The user's logged food items for the day.
 *   • activeGoalKey      — Which fitness goal is currently selected.
 *   • showBudgetModal    — Controls whether the "Budget Exceeded" modal is visible.
 *
 * ── What is DERIVED (not stored) ──
 *   • totals             — Aggregated calories/protein/carbs/fats across all meals.
 *   • activeGoal         — The full GoalConfig object for the current key.
 *   • isOverBudget       — Boolean flag; true when totals.calories > activeGoal.maxCalories.
 *
 * ── Vibe Check design ──
 *   Changing `activeGoalKey` swaps the limits without touching `meals[]`.
 *   Because `totals` and `isOverBudget` are derived from BOTH meals AND the
 *   active goal, they automatically re-evaluate whenever either changes.
 *   No extra logic needed — React's useMemo handles the reactivity.
 */

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

import { aggregateMeals, calculateMeal } from '../utils/nutrientCalculator.js';
import { GOAL_CONFIGS, DEFAULT_GOAL_KEY } from '../utils/goalConfig.js';
import { IMAGE_UPLOAD_MOCKS } from '../utils/mockDatabase.js';

// ── Context creation ──────────────────────────────────────────────
const TrackerContext = createContext(null);

// ── Provider ──────────────────────────────────────────────────────
export function TrackerProvider({ children }) {
  const [meals, setMeals] = useState([]);
  const [activeGoalKey, setActiveGoalKey] = useState(DEFAULT_GOAL_KEY);
  const [showBudgetModal, setShowBudgetModal] = useState(false);

  // ── Derived: full config for the currently selected goal ──
  const activeGoal = useMemo(
    () => GOAL_CONFIGS[activeGoalKey],
    [activeGoalKey]
  );

  // ── Derived: aggregated daily totals across all logged meals ──
  const totals = useMemo(() => aggregateMeals(meals), [meals]);

  // ── Derived: budget exceeded flag ──
  // Re-evaluates whenever meals OR the active goal changes.
  // This is the key to the Vibe Check behaviour: switching goals
  // can instantly flip this flag without touching the meal list.
  const isOverBudget = useMemo(
    () => totals.calories > activeGoal.maxCalories,
    [totals.calories, activeGoal.maxCalories]
  );

  // ── Derived: near-limit warning flag ──
  // True when the user has 100 kcal or fewer left AND has not yet exceeded
  // the budget. Once isOverBudget is true this flag turns off — the
  // "exceeded" modal takes precedence and we don't want two warnings at once.
  const NEAR_LIMIT_THRESHOLD = 100; // kcal
  const isNearLimit = useMemo(() => {
    const remaining = activeGoal.maxCalories - totals.calories;
    return remaining <= NEAR_LIMIT_THRESHOLD && remaining > 0 && !isOverBudget;
  }, [totals.calories, activeGoal.maxCalories, isOverBudget]);

  // ── Action: Add a meal ────────────────────────────────────────────
  /**
   * Validates and calculates a new meal from raw user inputs, then
   * appends it to the meal list. If the new total exceeds the budget,
   * the warning modal is surfaced.
   *
   * @param {string} foodName       - Raw food name from the text input.
   * @param {string|number} weight  - Portion weight in grams from the number input.
   * @throws {Error} Re-throws validation errors so the UI can display them.
   */
  const addMeal = useCallback((foodName, weight) => {
    // calculateMeal throws descriptive errors — let them bubble to the UI.
    const newMeal = calculateMeal(foodName, weight);

    setMeals((prev) => {
      const updated = [...prev, newMeal];
      // Check budget against the updated list's aggregate + active goal limit.
      // We calculate inline here rather than relying on the stale `isOverBudget`
      // derived value, which hasn't re-evaluated yet at this point in the cycle.
      const updatedTotals = aggregateMeals(updated);
      if (updatedTotals.calories > activeGoal.maxCalories) {
        setShowBudgetModal(true);
      }
      return updated;
    });
  }, [activeGoal.maxCalories]);

  // ── Action: Delete a meal ─────────────────────────────────────────
  /**
   * Removes a meal by its unique ID. Progress bars update automatically
   * because `totals` is derived from `meals`.
   *
   * @param {string} mealId - The UUID of the meal to remove.
   */
  const deleteMeal = useCallback((mealId) => {
    setMeals((prev) => prev.filter((m) => m.id !== mealId));
    // Modal auto-dismisses via the isOverBudget derived value recomputing.
    // We also explicitly close it here in case the user is at exactly the limit.
    setShowBudgetModal(false);
  }, []);

  // ── Action: Skip last meal (used by the budget-exceeded modal) ──────────
  /**
   * Removes the most recently added meal from the list.
   * This is the "Skip This Meal" path in the Warning Modal — it lets the
   * user undo the meal that pushed them over budget so they can log
   * something lighter instead. Closes the modal automatically.
   *
   * We target meals[meals.length - 1] (the tail) rather than a specific ID
   * because the modal appears immediately after the offending meal is added.
   */
  const skipLastMeal = useCallback(() => {
    setMeals((prev) => {
      if (prev.length === 0) return prev; // Guard: nothing to skip
      return prev.slice(0, -1);           // Drop the last entry
    });
    setShowBudgetModal(false);
  }, []);

  // ── Action: Switch fitness goal ────────────────────────────────────
  /**
   * Updates the active fitness goal key. All progress bars and the
   * isOverBudget flag re-derive automatically — meals are not modified.
   *
   * If the new goal's calorie limit is lower than current consumption,
   * the warning modal will surface immediately on the next render cycle.
   *
   * @param {import('../utils/goalConfig.js').GoalKey} goalKey
   */
  const setGoal = useCallback((goalKey) => {
    setActiveGoalKey(goalKey);
    // Close any open modal — the derived isOverBudget will re-open it
    // if the new limits are still exceeded, handled via a useEffect in
    // the component layer (or checked via the derived flag directly).
  }, []);

  // ── Action: Simulate "Image Upload" ───────────────────────────────
  /**
   * Picks a random entry from IMAGE_UPLOAD_MOCKS and returns its
   * name and weight. The Food Input Card uses these values to
   * auto-fill its controlled inputs, simulating an AI photo scan.
   *
   * Returns an object instead of calling addMeal directly because the
   * UI should show the user what was "scanned" before they confirm.
   *
   * @returns {{ name: string, weight: number }}
   */
  const simulateImageUpload = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * IMAGE_UPLOAD_MOCKS.length);
    return IMAGE_UPLOAD_MOCKS[randomIndex];
  }, []);

  // ── Action: Dismiss the budget modal ──────────────────────────────
  const dismissBudgetModal = useCallback(() => {
    setShowBudgetModal(false);
  }, []);

  // ── Context value ─────────────────────────────────────────────────
  const value = useMemo(() => ({
    // State
    meals,
    activeGoalKey,
    activeGoal,
    showBudgetModal,
    // Derived
    totals,
    isOverBudget,
    isNearLimit,
    // Actions
    addMeal,
    deleteMeal,
    skipLastMeal,
    setGoal,
    simulateImageUpload,
    dismissBudgetModal,
  }), [
    meals, activeGoalKey, activeGoal, showBudgetModal,
    totals, isOverBudget, isNearLimit,
    addMeal, deleteMeal, skipLastMeal, setGoal, simulateImageUpload, dismissBudgetModal,
  ]);

  return (
    <TrackerContext.Provider value={value}>
      {children}
    </TrackerContext.Provider>
  );
}

// ── Custom hook ───────────────────────────────────────────────────
/**
 * useTracker — Consume the TrackerContext from any component.
 * Throws a descriptive error if used outside of TrackerProvider,
 * catching accidental mis-use early in development.
 */
export function useTracker() {
  const ctx = useContext(TrackerContext);
  if (!ctx) {
    throw new Error('useTracker must be used within a <TrackerProvider>.');
  }
  return ctx;
}
