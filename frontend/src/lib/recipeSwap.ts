import {
  getAllRecipes,
  getRecipeById,
  type Recipe,
  type RecipeMealType,
} from "@/data/recipes";
import {
  filterRecipesForCriteria,
  getRecipesByMealTypeFromPool,
} from "@/lib/recipeFilter";
import { getMealRecipeId } from "@/lib/mealRecipe";
import {
  buildPlanFromRecipes,
  estimateRecipeTotalCost,
  validatePlanStructure,
} from "@/lib/recipePlan";
import type { GeneratedMealPlanResult, MealPlanCriteria } from "@/types/mealPlan";
import type { Meal, MealType, Product, ShoppingItem } from "@/types";

const MEALS_PER_DAY = 3;

export type RecipeAlternative = {
  recipe: Recipe;
  estimatedCost: number;
};

export type MealSwapTarget = {
  dayIndex: number;
  mealIndex: number;
  meal: Meal;
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

export function mealTypeToRecipeMealType(mealType: MealType): RecipeMealType {
  if (mealType === "breakfast") return "breakfast";
  if (mealType === "dinner") return "dinner";
  return "lunch";
}

export function getRecipeAlternativesForMeal(
  currentRecipeId: string,
  recipeMealType: RecipeMealType,
  criteria: MealPlanCriteria,
  products: Product[],
): RecipeAlternative[] {
  const filteredPool = filterRecipesForCriteria(getAllRecipes(), criteria);

  return getRecipesByMealTypeFromPool(recipeMealType, filteredPool)
    .filter((recipe) => recipe.id !== currentRecipeId)
    .map((recipe) => ({
      recipe,
      estimatedCost: estimateRecipeTotalCost(recipe, products, criteria.people),
    }))
    .sort((a, b) => a.estimatedCost - b.estimatedCost);
}

export function formatRecipeSwapImpact(
  currentCost: number,
  alternativeCost: number,
): string {
  const difference = alternativeCost - currentCost;

  if (difference === 0) {
    return "Samme estimerede pris";
  }

  if (difference < 0) {
    return `Denne ændring sparer ca. ${Math.abs(difference).toFixed(0)} kr.`;
  }

  return `Denne ændring koster ca. ${difference.toFixed(0)} kr. mere.`;
}

export function swapMealInPlan(
  plan: GeneratedMealPlanResult,
  dayIndex: number,
  mealIndex: number,
  newRecipe: Recipe,
  products: Product[],
  previousShoppingItems: ShoppingItem[],
): GeneratedMealPlanResult {
  const recipes = plan.days.flatMap((day) =>
    day.meals
      .map((meal) => getRecipeById(getMealRecipeId(meal)))
      .filter((recipe): recipe is Recipe => recipe != null),
  );

  const slotIndex = dayIndex * MEALS_PER_DAY + mealIndex;
  if (slotIndex < 0 || slotIndex >= recipes.length) {
    throw new Error("Invalid meal slot for recipe swap");
  }

  const updatedRecipes = [...recipes];
  updatedRecipes[slotIndex] = newRecipe;

  const rebuiltPlan = buildPlanFromRecipes(
    updatedRecipes,
    plan.criteria,
    products,
  );

  if (!validatePlanStructure(plan, rebuiltPlan)) {
    throw new Error("Recipe swap would break meal plan structure");
  }

  if (rebuiltPlan.shoppingListItems.length === 0) {
    throw new Error("Recipe swap produced an empty shopping list");
  }

  return {
    ...rebuiltPlan,
    shoppingListItems: preserveCheckedState(
      previousShoppingItems,
      rebuiltPlan.shoppingListItems,
    ),
    generatedAt: new Date().toISOString(),
  };
}
