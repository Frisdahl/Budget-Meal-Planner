import {
  buildPlanFromRecipes,
  buildSummaryFromShoppingList,
  getSelectedRecipesFromPlan,
  getShoppingListTotal,
  isSuspiciousPriceDrop,
  OPTIMIZE_FAILED_MESSAGE,
  optimizeRecipesIncrementally,
  validatePlanStructure,
} from "@/lib/recipePlan";
import type { GeneratedMealPlanResult } from "@/types/mealPlan";
import type { Product, ShoppingItem } from "@/types";

export { buildSummaryFromShoppingList, getShoppingListTotal } from "@/lib/recipePlan";
export { OPTIMIZE_FAILED_MESSAGE } from "@/lib/recipePlan";

export type OptimizePlanResult = {
  plan: GeneratedMealPlanResult;
  applied: boolean;
  failedSafety?: boolean;
  message?: string;
};

function preserveCheckedState(
  previousItems: ShoppingItem[],
  nextItems: ShoppingItem[],
): ShoppingItem[] {
  const checkedById = new Map(
    previousItems.map((item) => [item.id, item.checked]),
  );

  return nextItems.map((item) => ({
    ...item,
    checked: checkedById.get(item.id) ?? item.checked,
  }));
}

export function optimizePlanForBudget(
  plan: GeneratedMealPlanResult,
  products: Product[],
): OptimizePlanResult {
  const currentTotal = getShoppingListTotal(plan.shoppingListItems);
  const currentRecipes = getSelectedRecipesFromPlan(plan);

  if (currentRecipes.length === 0) {
    return { plan, applied: false, message: OPTIMIZE_FAILED_MESSAGE };
  }

  const optimizedRecipes = optimizeRecipesIncrementally(
    currentRecipes,
    plan.criteria,
    products,
  );

  const rebuiltPlan = buildPlanFromRecipes(
    optimizedRecipes,
    plan.criteria,
    products,
  );

  const shoppingListItems = preserveCheckedState(
    plan.shoppingListItems,
    rebuiltPlan.shoppingListItems,
  );

  const candidatePlan: GeneratedMealPlanResult = {
    ...rebuiltPlan,
    shoppingListItems,
    summary: buildSummaryFromShoppingList(
      shoppingListItems,
      plan.criteria,
      rebuiltPlan.summary.mealCount,
    ),
    generatedAt: new Date().toISOString(),
  };

  const newTotal = getShoppingListTotal(shoppingListItems);

  if (!validatePlanStructure(plan, candidatePlan)) {
    return {
      plan,
      applied: false,
      failedSafety: true,
      message: OPTIMIZE_FAILED_MESSAGE,
    };
  }

  if (newTotal >= currentTotal) {
    return {
      plan,
      applied: false,
      message: "Ingen billigere alternativer fundet",
    };
  }

  if (isSuspiciousPriceDrop(currentTotal, newTotal)) {
    return {
      plan,
      applied: false,
      failedSafety: true,
      message: OPTIMIZE_FAILED_MESSAGE,
    };
  }

  return {
    plan: candidatePlan,
    applied: true,
    message: "Vi fandt billigere alternativer",
  };
}

/** @deprecated Use optimizePlanForBudget */
export const optimizeShoppingListForBudget = optimizePlanForBudget;
