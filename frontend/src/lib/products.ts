import type { Product } from "@/types";

export function getEffectivePrice(product: Product): number {
  return product.onSale && product.salePrice != null
    ? product.salePrice
    : product.price;
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
