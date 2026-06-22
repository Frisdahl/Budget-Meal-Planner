import type { Recipe } from "@/data/recipes";

export type RecipeSource = "spoonacular" | "local";

export function inferRecipeSource(recipe: Recipe): RecipeSource {
  if (recipe.source) return recipe.source;
  return recipe.id.startsWith("spoonacular-") ? "spoonacular" : "local";
}

export function countRecipesWithImages(recipes: Recipe[]): number {
  return recipes.filter((recipe) => Boolean(recipe.image?.trim())).length;
}
