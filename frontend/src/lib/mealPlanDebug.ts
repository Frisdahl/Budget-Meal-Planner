export const MEAL_PLAN_DEBUG =
  import.meta.env.DEV && import.meta.env.VITE_MEAL_PLAN_DEBUG === "true";

export function logMealPlanDebug(
  label: "[MealPlan generation]" | "[MealPlan recipes]" | "[MealPlan ingredient match]",
  payload: Record<string, unknown>,
): void {
  if (!MEAL_PLAN_DEBUG) return;
  console.log(label, payload);
}
