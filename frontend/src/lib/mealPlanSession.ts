import { DEFAULT_MEAL_PLAN_CRITERIA } from "@/data/mealPlanOptions";
import { getRecipeById } from "@/data/recipes";
import { getErrorMessage } from "@/lib/errors";
import { swapMealInPlan } from "@/lib/recipeSwap";
import {
  getSnapshot as getShoppingListItems,
  replaceShoppingList,
} from "@/lib/shoppingList";
import { mealPlanGenerator } from "@/services/mealPlanGenerator";
import { optimizePlanForBudget } from "@/services/mealPlanOptimizer";
import { fetchProductFeed, toProducts } from "@/services/productFeedService";
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
  optimizeMessage: null,
  optimizationSavings: null,
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
    optimizeMessage: null,
    optimizationSavings: null,
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

export async function makePlanCheaper(): Promise<void> {
  const currentPlan = state.plan;
  if (!currentPlan || currentPlan.summary.underBudget) return;

  state = {
    ...state,
    status: "optimizing",
    error: null,
    optimizeMessage: null,
  };
  emit();

  try {
    const products = await fetchProductFeed(currentPlan.criteria.store)
      .then(toProducts)
      .catch(() => []);

    const liveItems = getShoppingListItems().map((item) => ({ ...item }));
    const previousTotal = currentPlan.summary.scaledCost;
    const { plan, applied, message } = optimizePlanForBudget(
      { ...currentPlan, shoppingListItems: liveItems },
      products,
    );

    if (applied) {
      replaceShoppingList(plan.shoppingListItems);
      const savings = Math.max(0, previousTotal - plan.summary.scaledCost);

      state = {
        ...state,
        plan,
        status: "ready",
        optimizeMessage: message ?? "Vi fandt billigere alternativer",
        optimizationSavings: savings > 0 ? savings : null,
      };
    } else {
      state = {
        ...state,
        status: "ready",
        optimizeMessage:
          message ?? "Ingen billigere alternativer fundet",
      };
    }
  } catch (error) {
    state = {
      ...state,
      status: "ready",
      error: getErrorMessage(error),
    };
  }

  emit();
}

export async function swapMealRecipe(
  dayIndex: number,
  mealIndex: number,
  recipeId: string,
): Promise<void> {
  const currentPlan = state.plan;
  if (!currentPlan) return;

  const newRecipe = getRecipeById(recipeId);
  if (!newRecipe) {
    throw new Error("Opskrift ikke fundet");
  }

  const products = await fetchProductFeed(currentPlan.criteria.store)
    .then(toProducts)
    .catch(() => []);

  const liveItems = getShoppingListItems().map((item) => ({ ...item }));
  const updatedPlan = swapMealInPlan(
    currentPlan,
    dayIndex,
    mealIndex,
    newRecipe,
    products,
    liveItems,
  );

  replaceShoppingList(updatedPlan.shoppingListItems);

  state = {
    ...state,
    plan: updatedPlan,
    optimizeMessage: null,
    optimizationSavings: null,
  };
  emit();
}

export function clearPlan(): void {
  state = {
    ...state,
    plan: null,
    status: "idle",
    error: null,
    optimizeMessage: null,
    optimizationSavings: null,
  };
  emit();
}
