import type { IngredientUnit, Recipe } from "@/data/recipes";
import { findBestProductForIngredient, getEffectivePrice } from "@/lib/products";
import { calculatePacksNeeded } from "@/lib/productPackSize";
import type { MealPlanCriteria } from "@/types/mealPlan";
import type { Product } from "@/types";

const PLACEHOLDER_UNIT_PRICE = 12.5;

export type GenerationCacheContext = {
  store: string;
  people: number;
  products: Product[];
  recipeCostCache: Map<string, number>;
  productMatchCache: Map<string, Product | undefined>;
  estimateRecipeCost: (recipe: Recipe) => number;
  findProductForIngredient: (ingredientName: string) => Product | undefined;
};

let activeGenerationCache: GenerationCacheContext | null = null;

export function getActiveGenerationCache(): GenerationCacheContext | null {
  return activeGenerationCache;
}

function estimateIngredientLineCost(
  requiredAmount: number,
  requiredUnit: IngredientUnit,
  ingredientName: string,
  ctx: GenerationCacheContext,
): number {
  const matchedProduct = ctx.findProductForIngredient(ingredientName);

  if (matchedProduct) {
    const packCalc = calculatePacksNeeded(
      requiredAmount,
      requiredUnit,
      matchedProduct,
    );
    if (packCalc) {
      return packCalc.packsNeeded * getEffectivePrice(matchedProduct);
    }
    return getEffectivePrice(matchedProduct);
  }

  return PLACEHOLDER_UNIT_PRICE;
}

function estimateRecipeCostUncached(
  recipe: Recipe,
  people: number,
  ctx: GenerationCacheContext,
): number {
  const scale = people / recipe.servings;

  return recipe.ingredients.reduce(
    (sum, ingredient) =>
      sum +
      estimateIngredientLineCost(
        ingredient.amount * scale,
        ingredient.unit,
        ingredient.name,
        ctx,
      ),
    0,
  );
}

export function createGenerationCache(
  criteria: MealPlanCriteria,
  products: Product[],
): GenerationCacheContext {
  const recipeCostCache = new Map<string, number>();
  const productMatchCache = new Map<string, Product | undefined>();

  const ctx: GenerationCacheContext = {
    store: criteria.store,
    people: criteria.people,
    products,
    recipeCostCache,
    productMatchCache,
    estimateRecipeCost: (recipe) => {
      const key = `${recipe.id}|${criteria.people}|${criteria.store}`;
      const cached = recipeCostCache.get(key);
      if (cached != null) return cached;

      const cost = estimateRecipeCostUncached(recipe, criteria.people, ctx);
      recipeCostCache.set(key, cost);
      return cost;
    },
    findProductForIngredient: (ingredientName) => {
      const key = `${ingredientName}|${criteria.store}`;
      if (productMatchCache.has(key)) {
        return productMatchCache.get(key);
      }

      const product = findBestProductForIngredient(ingredientName, products);
      productMatchCache.set(key, product);
      return product;
    },
  };

  return ctx;
}

export async function runWithGenerationCache<T>(
  criteria: MealPlanCriteria,
  products: Product[],
  fn: () => T | Promise<T>,
): Promise<T> {
  activeGenerationCache = createGenerationCache(criteria, products);
  try {
    return await fn();
  } finally {
    activeGenerationCache = null;
  }
}

export function yieldToMain(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

export function estimatePlanTotalFromCachedRecipeCosts(
  recipes: Recipe[],
  people: number,
): number {
  const cache = activeGenerationCache;
  if (cache && cache.people === people) {
    return recipes.reduce((sum, recipe) => sum + cache.estimateRecipeCost(recipe), 0);
  }

  throw new Error("estimatePlanTotalFromCachedRecipeCosts requires active generation cache");
}
