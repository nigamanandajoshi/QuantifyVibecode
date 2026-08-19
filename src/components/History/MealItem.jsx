/**
 * MealItem.jsx — A single row in the meal history list.
 *
 * Displays the food name, weight, and its four nutrient values.
 * The trash button fires deleteMeal() and the row animates out.
 */
import { useTracker } from '../../context/TrackerContext.jsx';

export function MealItem({ meal }) {
  const { deleteMeal } = useTracker();

  return (
    <li className="meal-item animate-fadeInUp" id={`meal-${meal.id}`}>
      <div className="meal-item__info">
        <span className="meal-item__name">{meal.name}</span>
        <span className="meal-item__weight">{meal.weightInGrams}g</span>
      </div>

      <div className="meal-item__macros">
        <span className="macro-chip macro-chip--cal">
          🔥 {meal.calories} kcal
        </span>
        <span className="macro-chip macro-chip--protein">
          🥩 {meal.protein}g
        </span>
        <span className="macro-chip macro-chip--carbs">
          🍚 {meal.carbs}g
        </span>
        <span className="macro-chip macro-chip--fats">
          🥑 {meal.fats}g
        </span>
      </div>

      <button
        className="btn btn--danger btn--icon meal-item__delete"
        onClick={() => deleteMeal(meal.id)}
        aria-label={`Delete ${meal.name} from meal log`}
        title="Remove item"
      >
        🗑️
      </button>
    </li>
  );
}
