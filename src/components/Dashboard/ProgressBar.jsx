/**
 * ProgressBar.jsx — Dynamic calorie progress bar.
 *
 * Reads totals and activeGoal from context and determines its own
 * visual state (safe → warn → danger) based on fill percentage.
 * The bar never visually overflows — it is clamped to 100% width
 * while the text shows the true consumed value.
 */
import { useMemo } from 'react';
import { useTracker } from '../../context/TrackerContext.jsx';
import { getProgressPercent } from '../../utils/nutrientCalculator.js';

export function ProgressBar() {
  const { totals, activeGoal, isOverBudget, isNearLimit } = useTracker();

  const percent = useMemo(
    () => getProgressPercent(totals.calories, activeGoal.maxCalories),
    [totals.calories, activeGoal.maxCalories]
  );

  // Determine visual state class
  const fillClass = useMemo(() => {
    if (isOverBudget)   return 'progress-fill--danger';
    if (percent >= 75)  return 'progress-fill--warn';
    return 'progress-fill--safe';
  }, [isOverBudget, percent]);

  const remaining = Math.max(0, activeGoal.maxCalories - totals.calories);

  return (
    <div className="progress-block progress-block--main">
      <div className="progress-header">
        <div>
          <span className="progress-label">Daily Calories</span>
          {isOverBudget && (
            <span className="budget-badge budget-badge--over" aria-live="polite">
              Over Budget!
            </span>
          )}
        </div>
        <div className="progress-values">
          <strong
            className={`stat-callout ${isOverBudget ? 'text-danger' : ''}`}
            aria-label={`${totals.calories} of ${activeGoal.maxCalories} calories consumed`}
          >
            {totals.calories}
          </strong>
          <span className="stat-unit">/ {activeGoal.maxCalories} kcal</span>
        </div>
      </div>

      <div
        className="progress-track progress-track--lg"
        role="progressbar"
        aria-valuenow={totals.calories}
        aria-valuemin={0}
        aria-valuemax={activeGoal.maxCalories}
        aria-label="Calorie progress"
      >
        <div
          className={`progress-fill ${fillClass}`}
          style={{ width: `${percent}%` }}
        />
      </div>

      {/* ── Near-limit amber warning — shown when ≤100 kcal remain, hidden once exceeded ── */}
      {isNearLimit && (
        <div className="near-limit-banner" role="alert" aria-live="polite">
          <span className="near-limit-banner__icon" aria-hidden="true">⚠️</span>
          <span>
            Only{' '}
            <strong>
              {Math.round(activeGoal.maxCalories - totals.calories)} kcal
            </strong>{' '}
            left — choose your next meal wisely!
          </span>
        </div>
      )}

      <div className="progress-footer">
        <span className="progress-remaining">
          {isOverBudget
            ? `${Math.abs(Math.round(totals.calories - activeGoal.maxCalories))} kcal over limit`
            : `${remaining} kcal remaining`}
        </span>
        <span className="progress-percent">{Math.round(percent)}%</span>
      </div>
    </div>
  );
}
