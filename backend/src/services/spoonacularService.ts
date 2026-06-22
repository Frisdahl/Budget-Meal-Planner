import { fetchComplexSearch } from "../clients/spoonacularClient.js";
import { MemoryCache } from "../lib/cache.js";
import { getEnv } from "../config/env.js";
import type { SpoonacularComplexSearchResponse } from "../types/spoonacular/complexSearch.js";

export type RecipeSearchQuery = {
  type?: string;
  offset?: number;
  vegetarian?: boolean;
  glutenFree?: boolean;
  lactoseFree?: boolean;
  nutFree?: boolean;
  number?: number;
  includeIngredients?: string;
};

const searchCache = new MemoryCache<SpoonacularComplexSearchResponse>(
  getEnv().CACHE_TTL_SECONDS * 1000,
);

function buildCacheKey(query: RecipeSearchQuery): string {
  return JSON.stringify({
    type: query.type ?? "",
    offset: query.offset ?? 0,
    vegetarian: query.vegetarian ?? false,
    glutenFree: query.glutenFree ?? false,
    lactoseFree: query.lactoseFree ?? false,
    nutFree: query.nutFree ?? false,
    number: Math.min(query.number ?? 12, 30),
    includeIngredients: query.includeIngredients ?? "",
  });
}

function buildSpoonacularParams(query: RecipeSearchQuery) {
  const intolerances: string[] = [];

  if (query.glutenFree) intolerances.push("gluten");
  if (query.lactoseFree) intolerances.push("dairy");
  if (query.nutFree) intolerances.push("tree nut", "peanut");

  return {
    number: Math.min(query.number ?? 12, 30),
    offset: query.offset ?? 0,
    type: query.type,
    diet: query.vegetarian ? "vegetarian" : undefined,
    intolerances: intolerances.length > 0 ? intolerances.join(",") : undefined,
    includeIngredients: query.includeIngredients,
  };
}

export async function searchSpoonacularRecipes(
  query: RecipeSearchQuery,
): Promise<SpoonacularComplexSearchResponse> {
  const cacheKey = buildCacheKey(query);
  const cached = searchCache.get(cacheKey);
  if (cached) return cached;

  const response = await fetchComplexSearch(buildSpoonacularParams(query));
  searchCache.set(cacheKey, response);
  return response;
}
