import type { Recipe, RecipeMealType } from "@/data/recipes";
import type { MealPlanCriteria } from "@/types/mealPlan";

export const INSUFFICIENT_RECIPES_MESSAGE =
  "Der er ikke nok opskrifter, der matcher dine valg.";

const FULL_DAY_MEAL_TYPES: RecipeMealType[] = ["breakfast", "lunch", "dinner"];

export type DietFilterOptions = {
  vegetarian?: boolean;
  noPork?: boolean;
  noFish?: boolean;
  lactoseFree?: boolean;
  glutenFree?: boolean;
  nutFree?: boolean;
};

export class InsufficientRecipesError extends Error {
  constructor(message = INSUFFICIENT_RECIPES_MESSAGE) {
    super(message);
    this.name = "InsufficientRecipesError";
  }
}

export function getDietFiltersFromCriteria(
  criteria: MealPlanCriteria,
): Required<DietFilterOptions> {
  return {
    vegetarian: criteria.vegetarian,
    noPork: criteria.noPork,
    noFish: criteria.noFish,
    lactoseFree: criteria.lactoseFree,
    glutenFree: criteria.glutenFree,
    nutFree: criteria.nutFree,
  };
}

export function recipeMatchesDietFilters(
  recipe: Recipe,
  filters: DietFilterOptions,
): boolean {
  if (filters.vegetarian && (recipe.containsMeat || recipe.containsFish)) {
    return false;
  }
  if (filters.noPork && recipe.containsPork) return false;
  if (filters.noFish && recipe.containsFish) return false;
  if (filters.lactoseFree && recipe.containsDairy) return false;
  if (filters.glutenFree && recipe.containsGluten) return false;
  if (filters.nutFree && recipe.containsNuts) return false;
  return true;
}

export function filterRecipesForCriteria(
  recipes: Recipe[],
  criteria: MealPlanCriteria,
): Recipe[] {
  const filters = getDietFiltersFromCriteria(criteria);
  return recipes.filter((recipe) => recipeMatchesDietFilters(recipe, filters));
}

export function getRecipesByMealTypeFromPool(
  mealType: RecipeMealType,
  pool: Recipe[],
): Recipe[] {
  return pool.filter((recipe) => recipe.mealType === mealType);
}

export function hasEnoughRecipesForPlan(recipes: Recipe[]): boolean {
  return FULL_DAY_MEAL_TYPES.every(
    (mealType) =>
      getRecipesByMealTypeFromPool(mealType, recipes).length > 0,
  );
}

export function assertEnoughRecipesForPlan(recipes: Recipe[]): void {
  if (!hasEnoughRecipesForPlan(recipes)) {
    throw new InsufficientRecipesError();
  }
}
