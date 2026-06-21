import { DEFAULT_MEAL_PLAN_CRITERIA } from "@/data/mealPlanOptions";
import { getErrorMessage } from "@/lib/errors";
import { replaceShoppingList } from "@/lib/shoppingList";
import { mealPlanGenerator } from "@/services/mealPlanGenerator";
import type {
  GeneratedMealPlanResult,
  MealPlanCriteria,
  MealPlanSessionState,
} from "@/types/mealPlan";

let state: MealPlanSessionState = {
  criteria: DEFAULT_MEAL_PLAN_CRITERIA,
  plan: null,
  status: "idle",
  error: null,
};

const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) {
    listener();
  }
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getSnapshot(): MealPlanSessionState {
  return state;
}

export function updateCriteria(partial: Partial<MealPlanCriteria>): void {
  state = {
    ...state,
    criteria: { ...state.criteria, ...partial },
  };
  emit();
}

export function setCriteria(criteria: MealPlanCriteria): void {
  state = {
    ...state,
    criteria,
  };
  emit();
}

export async function generatePlan(): Promise<void> {
  state = {
    ...state,
    status: "generating",
    error: null,
  };
  emit();

  try {
    const plan: GeneratedMealPlanResult = await mealPlanGenerator.generate(
      state.criteria,
    );

    replaceShoppingList(plan.shoppingListItems);

    state = {
      ...state,
      plan,
      status: "ready",
      error: null,
    };
  } catch (error) {
    state = {
      ...state,
      status: "error",
      error: getErrorMessage(error),
    };
  }

  emit();
}

export function clearPlan(): void {
  state = {
    ...state,
    plan: null,
    status: "idle",
    error: null,
  };
  emit();
}
