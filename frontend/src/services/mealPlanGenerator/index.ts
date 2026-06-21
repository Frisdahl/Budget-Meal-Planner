import { generatePlaceholderMealPlan } from "./placeholderMealPlanGenerator";
import type { GeneratedMealPlanResult, MealPlanCriteria } from "@/types/mealPlan";

export type MealPlanGenerator = {
  generate(criteria: MealPlanCriteria): Promise<GeneratedMealPlanResult>;
};

/**
 * Single entry point for meal plan generation.
 * Swap the implementation here when adding rule-based or OpenAI strategies.
 */
export const mealPlanGenerator: MealPlanGenerator = {
  generate: generatePlaceholderMealPlan,
};
