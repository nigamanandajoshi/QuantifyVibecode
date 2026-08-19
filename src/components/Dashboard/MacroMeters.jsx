/**
 * MacroMeters.jsx — Three smaller progress bars for Protein, Carbs, and Fats.
 *
 * Each meter has its own color identity and reads directly from context.
 * They use the same getProgressPercent utility as the main calorie bar,
 * so their fill percentages always reflect the current goal limits.
 */
import { useMemo } from 'react';
import { useTracker } from '../../context/TrackerContext.jsx';
import { getProgressPercent } from '../../utils/nutrientCalculator.js';

/** Configuration for each macro meter — drives layout and coloring. */
const MACRO_CONFIG = [
  {
    key:       'protein',
    label:     'Protein',
    unit:      'g',
    fillClass: 'progress-fill--protein',
    limitKey:  'maxProtein',
    icon:      '🥩',
  },
  {
    key:       'carbs',
    label:     'Carbohydrates',
    unit:      'g',
    fillClass: 'progress-fill--carbs',
    limitKey:  'maxCarbs',
    icon:      '🍚',
  },
  {
    key:       'fats',
    label:     'Fats',
    unit:      'g',
    fillClass: 'progress-fill--fats',
    limitKey:  'maxFats',
    icon:      '🥑',
  },
];

function MacroMeter({ config }) {
  const { totals, activeGoal } = useTracker();

  const current = totals[config.key];
  const limit   = activeGoal[config.limitKey];

  const percent = useMemo(
    () => getProgressPercent(current, limit),
    [current, limit]
  );

  return (
    <div className="progress-block progress-block--macro">
      <div className="progress-header">
        <span className="progress-label">
          <span aria-hidden="true">{config.icon}</span> {config.label}
        </span>
        <span className="progress-values">
          <strong>{current}{config.unit}</strong>
          <span className="text-muted"> / {limit}{config.unit}</span>
        </span>
      </div>
      <div
        className="progress-track"
        role="progressbar"
        aria-valuenow={current}
        aria-valuemin={0}
        aria-valuemax={limit}
        aria-label={`${config.label} progress`}
      >
        <div
          className={`progress-fill ${config.fillClass}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

export function MacroMeters() {
  return (
    <div className="macro-meters">
      {MACRO_CONFIG.map((config) => (
        <MacroMeter key={config.key} config={config} />
      ))}
    </div>
  );
}
