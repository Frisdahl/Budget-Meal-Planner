import type { Recipe, RecipeMealType } from "@/data/recipes";

const VALID_MEAL_TYPES: RecipeMealType[] = ["breakfast", "lunch", "dinner"];

export function isUsableRecipe(recipe: Recipe): boolean {
  if (!recipe.id.trim()) return false;
  if (!recipe.title.trim()) return false;
  if (!Number.isFinite(recipe.servings) || recipe.servings <= 0) return false;
  if (
    !Number.isFinite(recipe.estimatedTimeMinutes) ||
    recipe.estimatedTimeMinutes <= 0
  ) {
    return false;
  }
  if (!VALID_MEAL_TYPES.includes(recipe.mealType)) return false;
  if (recipe.ingredients.length === 0) return false;
  if (recipe.instructions.length === 0) return false;

  return recipe.ingredients.every(
    (ingredient) =>
      ingredient.name.trim().length > 0 &&
      Number.isFinite(ingredient.amount) &&
      ingredient.amount > 0 &&
      Boolean(ingredient.unit),
  );
}

export function filterUsableRecipes(recipes: Recipe[]): Recipe[] {
  return recipes.filter(isUsableRecipe);
}
