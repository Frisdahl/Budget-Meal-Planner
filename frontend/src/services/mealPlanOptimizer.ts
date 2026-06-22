import {
  adjustPlanDownToBudget,
  buildSummaryFromShoppingList,
  getSelectedRecipesFromPlan,
  getShoppingListTotal,
  IMPOSSIBLE_BUDGET_MESSAGE,
  isSuspiciousPriceDrop,
  OPTIMIZE_FAILED_MESSAGE,
  validatePlanStructure,
} from "@/lib/recipePlan";
import { filterRecipesForCriteria } from "@/lib/recipeFilter";
import { getAllRecipes } from "@/data/recipes";
import { runWithGenerationCache } from "@/lib/generationCache";
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

export async function optimizePlanForBudget(
  plan: GeneratedMealPlanResult,
  products: Product[],
): Promise<OptimizePlanResult> {
  const currentTotal = getShoppingListTotal(plan.shoppingListItems);
  const currentRecipes = getSelectedRecipesFromPlan(plan);

  if (currentRecipes.length === 0) {
    return { plan, applied: false, message: OPTIMIZE_FAILED_MESSAGE };
  }

  const recipePool = filterRecipesForCriteria(getAllRecipes(), plan.criteria);

  const downResult = await runWithGenerationCache(plan.criteria, products, () =>
    adjustPlanDownToBudget(
      currentRecipes,
      plan.criteria,
      products,
      recipePool,
    ),
  );

  const rebuiltPlan = downResult.plan;

  const shoppingListItems = preserveCheckedState(
    plan.shoppingListItems,
    rebuiltPlan.shoppingListItems,
  );

  const newTotal = getShoppingListTotal(shoppingListItems);

  const candidatePlan: GeneratedMealPlanResult = {
    ...rebuiltPlan,
    shoppingListItems,
    summary: {
      ...buildSummaryFromShoppingList(
        shoppingListItems,
        plan.criteria,
        rebuiltPlan.summary.mealCount,
      ),
      ...(newTotal > plan.criteria.budget && downResult.noValidSwaps
        ? { budgetNotice: IMPOSSIBLE_BUDGET_MESSAGE }
        : {}),
    },
    generatedAt: new Date().toISOString(),
  };

  if (!validatePlanStructure(plan, candidatePlan)) {
    return {
      plan,
      applied: false,
      failedSafety: true,
      message: OPTIMIZE_FAILED_MESSAGE,
    };
  }

  if (newTotal >= currentTotal) {
    if (currentTotal > plan.criteria.budget && downResult.noValidSwaps) {
      return {
        plan: {
          ...plan,
          summary: {
            ...plan.summary,
            budgetNotice: IMPOSSIBLE_BUDGET_MESSAGE,
          },
        },
        applied: false,
        message: "Ingen billigere alternativer fundet",
      };
    }

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
