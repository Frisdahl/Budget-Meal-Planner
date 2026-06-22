import type { Meal } from "@/types";

/** Recipe id stored on a generated meal (supports legacy meals using id only). */
export function getMealRecipeId(meal: Meal): string {
  return meal.recipeId ?? meal.id;
}
