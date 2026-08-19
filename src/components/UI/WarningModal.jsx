/**
 * WarningModal.jsx — "Daily Budget Exceeded!" overlay.
 *
 * Two exit paths for the user:
 *   1. "Skip This Meal" — calls skipLastMeal() to undo the offending
 *      entry so the user can log something lighter instead.
 *      The modal closes and the meal list reflects the change instantly.
 *
 *   2. "I'll Manage It" — calls dismissBudgetModal() and leaves the
 *      meal list completely untouched. The user owns the decision.
 *
 * The tip copy nudges the user toward swapping the meal rather than
 * just deleting it — framing it as a hunger-friendly choice, not a failure.
 */
import { useEffect, useRef } from 'react';
import { useTracker } from '../../context/TrackerContext.jsx';

export function WarningModal() {
  const {
    showBudgetModal,
    dismissBudgetModal,
    skipLastMeal,
    totals,
    activeGoal,
    meals,
  } = useTracker();

  const skipBtnRef = useRef(null);

  // Move focus to the primary action when the modal opens (accessibility)
  useEffect(() => {
    if (showBudgetModal) {
      skipBtnRef.current?.focus();
    }
  }, [showBudgetModal]);

  // Close on Escape — maps to "I'll Manage It" (non-destructive path)
  useEffect(() => {
    if (!showBudgetModal) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') dismissBudgetModal();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [showBudgetModal, dismissBudgetModal]);

  if (!showBudgetModal) return null;

  const overBy       = Math.round(totals.calories - activeGoal.maxCalories);
  // Name of the last logged meal — shown so the user knows exactly which item to reconsider
  const lastMealName = meals.length > 0 ? meals[meals.length - 1].name : 'that last item';

  return (
    <div
      className="modal-backdrop"
      onClick={dismissBudgetModal}
      aria-hidden="true"
    >
      <div
        className="modal animate-modalEnter"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Warning Icon */}
        <div className="modal__icon" aria-hidden="true">🚨</div>

        <h2 id="modal-title" className="modal__title">
          Daily Budget Exceeded!
        </h2>

        <p id="modal-description" className="modal__body">
          You're{' '}
          <strong className="text-danger">{overBy} kcal</strong> over your{' '}
          <strong>{activeGoal.label}</strong> daily limit of{' '}
          <strong>{activeGoal.maxCalories} kcal</strong>.
        </p>

        {/* Nudge copy — frames this as a swap, not a punishment */}
        <div className="modal__tip-card">
          <span className="modal__tip-icon" aria-hidden="true">💡</span>
          <p className="modal__tip">
            Still hungry? Try swapping{' '}
            <strong className="text-warn">"{lastMealName}"</strong> for a
            lighter option — like veggies, yogurt, or a small salad — to
            keep your goal on track without the hunger!
          </p>
        </div>

        {/* Two-button row */}
        <div className="modal__actions">
          {/* Primary: Undo the offending meal */}
          <button
            id="modal-skip-btn"
            ref={skipBtnRef}
            className="btn btn--primary modal__btn"
            onClick={skipLastMeal}
          >
            <span aria-hidden="true">🥗</span>
            Skip This Meal
          </button>

          {/* Secondary: User owns the choice */}
          <button
            id="modal-manage-btn"
            className="btn btn--secondary modal__btn"
            onClick={dismissBudgetModal}
          >
            I'll Manage It
          </button>
        </div>
      </div>
    </div>
  );
}
