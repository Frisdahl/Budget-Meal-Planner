import { generateBudgetAwarePlan } from "@/lib/recipePlan";
import { resolveRecipePoolForGeneration } from "@/services/recipes/recipePoolService";
import { fetchProductFeed, toProducts } from "@/services/productFeedService";
import type { GeneratedMealPlanResult, MealPlanCriteria } from "@/types/mealPlan";
import type { Product } from "@/types";

export async function generatePlaceholderMealPlan(
  criteria: MealPlanCriteria,
): Promise<GeneratedMealPlanResult> {
  const devMode = import.meta.env.DEV;
  if (devMode) {
    console.time("[MealPlan] generation");
  }

  try {
    const [products, recipePoolResult] = await Promise.all([
      fetchProductFeed(criteria.store)
        .then(toProducts)
        .catch(() => [] as Product[]),
      resolveRecipePoolForGeneration(criteria),
      new Promise((resolve) => window.setTimeout(resolve, 600)),
    ]);

    return await generateBudgetAwarePlan(
      criteria,
      products,
      recipePoolResult.pool,
    );
  } finally {
    if (devMode) {
      console.timeEnd("[MealPlan] generation");
    }
  }
}
