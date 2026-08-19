/**
 * TrackerContext.jsx — Global state for the NutriTrack application.
 *
 * ── What lives here ──
 *   • meals[]            — The user's logged food items for the day.
 *   • activeGoalKey      — Which fitness goal is currently selected.
 *   • userProfile        — Weight, height, age, gender, activity level.
 *   • showBudgetModal    — Controls whether the "Budget Exceeded" modal is visible.
 *   • showProfileModal   — Controls whether the Profile Setup modal is visible.
 *
 * ── What is DERIVED (not stored) ──
 *   • tdee               — Computed TDEE from user profile (or null if no profile).
 *   • allGoalTargets     — Precomputed limits for all 3 goals based on TDEE.
 *   • activeGoal         — The active goal's limits + metadata.
 *   • totals             — Aggregated calories/protein/carbs/fats across all meals.
 *   • isOverBudget       — Boolean flag; true when totals.calories > activeGoal.maxCalories.
 *   • isNearLimit        — True when ≤100 kcal remaining and not yet over budget.
 *
 * ── Profile → Limits flow ──
 *   saveProfile(profile) → computeTDEE → deriveAllGoalTargets →
 *   activeGoal.maxCalories changes → progress bars recompute automatically.
 *   Meals are NEVER touched when the profile or goal changes.
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
import {
  calculateTDEE,
  deriveAllGoalTargets,
} from '../utils/tdeeCalculator.js';

// ── Context creation ──────────────────────────────────────────────
const TrackerContext = createContext(null);

// ── Provider ──────────────────────────────────────────────────────
export function TrackerProvider({ children }) {
  const [meals, setMeals]               = useState([]);
  const [activeGoalKey, setActiveGoalKey] = useState(DEFAULT_GOAL_KEY);
  const [showBudgetModal, setShowBudgetModal] = useState(false);

  // Profile state — null means the user hasn't set up their profile yet.
  // showProfileModal starts as true so the setup window appears on first load.
  const [userProfile, setUserProfile]       = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(true);

  // ── Derived: TDEE from profile (null if no profile saved yet) ──
  const tdee = useMemo(
    () => userProfile ? calculateTDEE(userProfile) : null,
    [userProfile]
  );

  // ── Derived: goal limits — dynamic when profile exists, static fallback otherwise ──
  // allGoalTargets is a Record<GoalKey, { maxCalories, maxProtein, maxCarbs, maxFats }>
  const allGoalTargets = useMemo(() => {
    if (tdee) return deriveAllGoalTargets(tdee);
    // Fallback to the static defaults from goalConfig.js until profile is saved
    return {
      weightLoss:  GOAL_CONFIGS.weightLoss,
      maintenance: GOAL_CONFIGS.maintenance,
      muscleGain:  GOAL_CONFIGS.muscleGain,
    };
  }, [tdee]);

  // ── Derived: active goal — merges static metadata with dynamic limits ──
  const activeGoal = useMemo(() => ({
    ...GOAL_CONFIGS[activeGoalKey],        // label, emoji, description, key
    ...allGoalTargets[activeGoalKey],      // maxCalories, maxProtein, maxCarbs, maxFats (dynamic)
  }), [activeGoalKey, allGoalTargets]);

  // ── Derived: aggregated daily totals across all logged meals ──
  const totals = useMemo(() => aggregateMeals(meals), [meals]);

  // ── Derived: budget exceeded flag ──
  const isOverBudget = useMemo(
    () => totals.calories > activeGoal.maxCalories,
    [totals.calories, activeGoal.maxCalories]
  );

  // ── Derived: near-limit warning flag (≤100 kcal remaining, not yet exceeded) ──
  const NEAR_LIMIT_THRESHOLD = 100;
  const isNearLimit = useMemo(() => {
    const remaining = activeGoal.maxCalories - totals.calories;
    return remaining <= NEAR_LIMIT_THRESHOLD && remaining > 0 && !isOverBudget;
  }, [totals.calories, activeGoal.maxCalories, isOverBudget]);

  // ── Action: Save user profile ────────────────────────────────────
  /**
   * Persists the user's physical profile. Triggers immediate TDEE recalculation
   * and updates all goal limits. Meals and activeGoalKey are untouched.
   *
   * @param {import('../utils/tdeeCalculator.js').UserProfile} profile
   */
  const saveProfile = useCallback((profile) => {
    setUserProfile(profile);
  }, []);

  const openProfileModal  = useCallback(() => setShowProfileModal(true),  []);
  const closeProfileModal = useCallback(() => setShowProfileModal(false), []);

  // ── Action: Add a meal ────────────────────────────────────────────
  const addMeal = useCallback((foodName, weight) => {
    const newMeal = calculateMeal(foodName, weight);
    setMeals((prev) => {
      const updated       = [...prev, newMeal];
      const updatedTotals = aggregateMeals(updated);
      if (updatedTotals.calories > activeGoal.maxCalories) {
        setShowBudgetModal(true);
      }
      return updated;
    });
  }, [activeGoal.maxCalories]);

  // ── Action: Delete a meal ─────────────────────────────────────────
  const deleteMeal = useCallback((mealId) => {
    setMeals((prev) => prev.filter((m) => m.id !== mealId));
    setShowBudgetModal(false);
  }, []);

  // ── Action: Skip last meal (used by the budget-exceeded modal) ────
  const skipLastMeal = useCallback(() => {
    setMeals((prev) => {
      if (prev.length === 0) return prev;
      return prev.slice(0, -1);
    });
    setShowBudgetModal(false);
  }, []);

  // ── Action: Switch fitness goal ────────────────────────────────────
  const setGoal = useCallback((goalKey) => {
    setActiveGoalKey(goalKey);
  }, []);

  // ── Action: Simulate "Image Upload" ───────────────────────────────
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
    userProfile,
    tdee,
    showBudgetModal,
    showProfileModal,
    // Derived
    totals,
    isOverBudget,
    isNearLimit,
    // Actions
    addMeal,
    deleteMeal,
    skipLastMeal,
    setGoal,
    saveProfile,
    openProfileModal,
    closeProfileModal,
    simulateImageUpload,
    dismissBudgetModal,
  }), [
    meals, activeGoalKey, activeGoal, userProfile, tdee,
    showBudgetModal, showProfileModal,
    totals, isOverBudget, isNearLimit,
    addMeal, deleteMeal, skipLastMeal, setGoal,
    saveProfile, openProfileModal, closeProfileModal,
    simulateImageUpload, dismissBudgetModal,
  ]);

  return (
    <TrackerContext.Provider value={value}>
      {children}
    </TrackerContext.Provider>
  );
}

// ── Custom hook ───────────────────────────────────────────────────
export function useTracker() {
  const ctx = useContext(TrackerContext);
  if (!ctx) {
    throw new Error('useTracker must be used within a <TrackerProvider>.');
  }
  return ctx;
}
