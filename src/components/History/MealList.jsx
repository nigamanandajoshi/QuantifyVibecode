/**
 * MealList.jsx — The daily meal history panel.
 *
 * Renders an ordered list of MealItem rows. Shows an empty state
 * when no meals have been logged yet.
 */
import { useTracker } from '../../context/TrackerContext.jsx';
import { MealItem } from './MealItem.jsx';

export function MealList() {
  const { meals } = useTracker();

  return (
    <div className="panel panel--history">
      <div className="panel-header">
        <p className="panel-label">Today's Meals</p>
        {meals.length > 0 && (
          <span className="meal-count-badge">{meals.length} item{meals.length !== 1 ? 's' : ''}</span>
        )}
      </div>

      {meals.length === 0 ? (
        <div className="empty-state" aria-label="No meals logged yet">
          <span className="empty-state__icon" aria-hidden="true">🍽️</span>
          <p className="empty-state__title">Nothing logged yet</p>
          <p className="empty-state__subtitle">
            Add your first meal using the panel on the left.
          </p>
        </div>
      ) : (
        <ul className="meal-list" aria-label="Logged meals for today">
          {meals.map((meal) => (
            <MealItem key={meal.id} meal={meal} />
          ))}
        </ul>
      )}
    </div>
  );
}
