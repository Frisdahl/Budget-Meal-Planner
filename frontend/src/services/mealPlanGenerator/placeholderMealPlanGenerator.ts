import { getDayLabels } from "@/data/mealPlanOptions";
import { DAYS_OF_WEEK, getMealsByDay } from "@/data/mockMeals";
import { fetchProductFeed, toProducts } from "@/services/productFeedService";
import type {
  GeneratedMealPlanResult,
  MealPlanCriteria,
  MealPlanDay,
} from "@/types/mealPlan";
import type { Meal, Product, ShoppingItem } from "@/types";

function normalizeName(value: string): string {
  return value.toLowerCase().trim();
}

function findProductForIngredient(
  ingredient: string,
  products: Product[],
): Product | undefined {
  const needle = normalizeName(ingredient);

  const exact = products.find(
    (product) => normalizeName(product.name) === needle,
  );
  if (exact) return exact;

  const nameContains = products.find((product) =>
    normalizeName(product.name).includes(needle),
  );
  if (nameContains) return nameContains;

  return products.find((product) =>
    needle.includes(normalizeName(product.name)),
  );
}
function buildPlanDays(days: number): MealPlanDay[] {
  const daySlice = DAYS_OF_WEEK.slice(0, days);
  const labels = getDayLabels(days);

  return daySlice.map((day, index) => ({
    day,
    label: labels[index] ?? day,
    meals: getMealsByDay(day),
  }));
}

function buildPlaceholderShoppingList(
  meals: Meal[],
  criteria: MealPlanCriteria,
  products: Product[],
): ShoppingItem[] {
  const byIngredient = new Map<string, Set<string>>();

  for (const meal of meals) {
    for (const ingredient of meal.ingredients) {
      const refs = byIngredient.get(ingredient) ?? new Set<string>();
      refs.add(meal.name);
      byIngredient.set(ingredient, refs);
    }
  }

  return Array.from(byIngredient.entries()).map(([name, mealRefs], index) => {
    const matchedProduct = findProductForIngredient(name, products);

    return {
      id: `plan-ingredient-${index}-${name.toLowerCase().replace(/\s+/g, "-")}`,
      name,
      brand: matchedProduct?.brand ?? "Estimat",
      category: matchedProduct?.category ?? "Generelt",
      unit: "stk",
      quantity: criteria.people,
      unitPrice: 12.5,
      checked: false,
      store: criteria.store,
      mealRef: Array.from(mealRefs).join(", "),
      imageUrl: matchedProduct?.imageUrl,
    };
  });
}
function buildSummary(
  planDays: MealPlanDay[],
  criteria: MealPlanCriteria,
) {
  const allMeals = planDays.flatMap((day) => day.meals);
  const totalCost = allMeals.reduce((sum, meal) => sum + meal.cost, 0);
  const scaledCost = totalCost * criteria.people;
  const underBudget = scaledCost <= criteria.budget;

  return {
    totalCost,
    scaledCost,
    budgetUsedPercent: Math.round((scaledCost / criteria.budget) * 100),
    underBudget,
    mealCount: allMeals.length,
    averageCostPerDay: scaledCost / criteria.days,
  };
}

export async function generatePlaceholderMealPlan(
  criteria: MealPlanCriteria,
): Promise<GeneratedMealPlanResult> {
  const [products] = await Promise.all([
    fetchProductFeed(criteria.store)
      .then(toProducts)
      .catch(() => [] as Product[]),
    new Promise((resolve) => window.setTimeout(resolve, 600)),
  ]);

  const days = buildPlanDays(criteria.days);
  const allMeals = days.flatMap((day) => day.meals);

  return {
    criteria,
    days,
    summary: buildSummary(days, criteria),
    shoppingListItems: buildPlaceholderShoppingList(
      allMeals,
      criteria,
      products,
    ),
    generatedAt: new Date().toISOString(),
    source: "placeholder",
  };
}