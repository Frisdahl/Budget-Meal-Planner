import { generateBudgetAwarePlan } from "@/lib/recipePlan";
import { fetchProductFeed, toProducts } from "@/services/productFeedService";
import type { GeneratedMealPlanResult, MealPlanCriteria } from "@/types/mealPlan";
import type { Product } from "@/types";

export async function generatePlaceholderMealPlan(
  criteria: MealPlanCriteria,
): Promise<GeneratedMealPlanResult> {
  const [products] = await Promise.all([
    fetchProductFeed(criteria.store)
      .then(toProducts)
      .catch(() => [] as Product[]),
    new Promise((resolve) => window.setTimeout(resolve, 600)),
  ]);

  return generateBudgetAwarePlan(criteria, products);
}
