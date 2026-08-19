/**
 * FitnessGoalToggle.jsx — The "Vibe Check" toggle component.
 *
 * Renders three pill buttons (Weight Loss, Maintenance, Muscle Gain).
 * Clicking any button fires setGoal() from context, instantly updating
 * the daily limits and recomputing all progress bars — without touching meals.
 */
import { useTracker } from '../../context/TrackerContext.jsx';
import { GOAL_CONFIGS, GOAL_ORDER } from '../../utils/goalConfig.js';

export function FitnessGoalToggle() {
  const { activeGoalKey, setGoal } = useTracker();

  return (
    <div className="goal-toggle" role="group" aria-label="Select your fitness goal">
      <span className="goal-toggle__label">Fitness Goal</span>
      <div className="goal-toggle__pills">
        {GOAL_ORDER.map((key) => {
          const config = GOAL_CONFIGS[key];
          const isActive = key === activeGoalKey;
          return (
            <button
              key={key}
              id={`goal-${key}`}
              className={`goal-pill ${isActive ? 'goal-pill--active' : ''}`}
              onClick={() => setGoal(key)}
              aria-pressed={isActive}
              title={config.description}
            >
              <span className="goal-pill__emoji" aria-hidden="true">
                {config.emoji}
              </span>
              <span className="goal-pill__text">{config.label}</span>
            </button>
          );
        })}
      </div>
      <p className="goal-toggle__description">
        {GOAL_CONFIGS[activeGoalKey].description}
      </p>
    </div>
  );
}
