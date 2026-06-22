import type { Product } from "@/types";
import { logMealPlanDebug } from "@/lib/mealPlanDebug";

export function getEffectivePrice(product: Product): number {
  return product.onSale && product.salePrice != null
    ? product.salePrice
    : product.price;
}

function normalizeText(value: string): string {
  return value.toLowerCase().trim();
}

function pickCheapestInStock(candidates: Product[]): Product | undefined {
  if (candidates.length === 0) return undefined;

  const inStock = candidates.filter((product) => product.inStock);
  const pool = inStock.length > 0 ? inStock : candidates;

  return pool.reduce((best, product) =>
    getEffectivePrice(product) < getEffectivePrice(best) ? product : best,
  );
}

const INGREDIENT_MATCH_TIERS: Array<
  (needle: string, product: Product) => boolean
> = [
  (needle, product) => normalizeText(product.name) === needle,
  (needle, product) => normalizeText(product.name).includes(needle),
  (needle, product) => needle.includes(normalizeText(product.name)),
  (needle, product) =>
    normalizeText(product.description ?? "").includes(needle),
];

export function findMatchingProductsForIngredient(
  ingredient: string,
  products: Product[],
): Product[] {
  const needle = normalizeText(ingredient);

  for (const matchesTier of INGREDIENT_MATCH_TIERS) {
    const candidates = products.filter((product) => matchesTier(needle, product));
    if (candidates.length > 0) return candidates;
  }

  return [];
}

export function findCheaperAlternativeForIngredient(
  ingredient: string,
  products: Product[],
  currentProductId: string,
  currentUnitPrice: number,
): Product | undefined {
  const candidates = findMatchingProductsForIngredient(
    ingredient,
    products,
  ).filter(
    (product) =>
      product.id !== currentProductId &&
      getEffectivePrice(product) < currentUnitPrice,
  );

  return pickCheapestInStock(candidates);
}

export function findBestProductForIngredient(
  ingredient: string,
  products: Product[],
): Product | undefined {
  const needle = normalizeText(ingredient);

  for (const matchesTier of INGREDIENT_MATCH_TIERS) {
    const candidates = products.filter((product) => matchesTier(needle, product));
    if (candidates.length === 0) continue;

    const chosen = pickCheapestInStock(candidates);

    if (chosen) {
      logMealPlanDebug("[MealPlan ingredient match]", {
        ingredient,
        matchedProductName: chosen.name,
        productId: chosen.id,
        chosenPrice: getEffectivePrice(chosen),
        candidateCount: candidates.length,
      });
    }

    return chosen;
  }

  return undefined;
}

export const PRODUCTS_PAGE_SIZE = 12;

export function getCategoryCounts(products: Product[]): Record<string, number> {
  const counts: Record<string, number> = { Alle: products.length };
  for (const product of products) {
    counts[product.category] = (counts[product.category] ?? 0) + 1;
  }
  return counts;
}

export function getUniqueCategories(products: Product[]): string[] {
  const categories = new Set(products.map((p) => p.category));
  return Array.from(categories).sort((a, b) => a.localeCompare(b, "da"));
}
