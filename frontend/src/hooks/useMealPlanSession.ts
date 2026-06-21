import { useCallback, useSyncExternalStore } from "react";
import {
  clearPlan,
  generatePlan,
  getSnapshot,
  makePlanCheaper,
  setCriteria,
  subscribe,
  swapMealRecipe,
  updateCriteria,
} from "@/lib/mealPlanSession";
import type { MealPlanCriteria } from "@/types/mealPlan";

export function useMealPlanSession() {
  const session = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const generate = useCallback(async () => {
    await generatePlan();
  }, []);

  const patchCriteria = useCallback((partial: Partial<MealPlanCriteria>) => {
    updateCriteria(partial);
  }, []);

  const replaceCriteria = useCallback((criteria: MealPlanCriteria) => {
    setCriteria(criteria);
  }, []);

  const makeCheaper = useCallback(async () => {
    await makePlanCheaper();
  }, []);

  const swapMeal = useCallback(
    async (dayIndex: number, mealIndex: number, recipeId: string) => {
      await swapMealRecipe(dayIndex, mealIndex, recipeId);
    },
    [],
  );

  return {
    criteria: session.criteria,
    plan: session.plan,
    status: session.status,
    error: session.error,
    optimizeMessage: session.optimizeMessage,
    optimizationSavings: session.optimizationSavings,
    isGenerating: session.status === "generating",
    isOptimizing: session.status === "optimizing",
    updateCriteria: patchCriteria,
    setCriteria: replaceCriteria,
    generate,
    makeCheaper,
    swapMeal,
    clearPlan,
  };
}
