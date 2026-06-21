import { useCallback, useSyncExternalStore } from "react";
import {
  clearPlan,
  generatePlan,
  getSnapshot,
  setCriteria,
  subscribe,
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

  return {
    criteria: session.criteria,
    plan: session.plan,
    status: session.status,
    error: session.error,
    isGenerating: session.status === "generating",
    updateCriteria: patchCriteria,
    setCriteria: replaceCriteria,
    generate,
    clearPlan,
  };
}
