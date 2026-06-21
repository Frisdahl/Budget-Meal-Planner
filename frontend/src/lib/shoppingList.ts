import { getEffectivePrice } from "@/lib/products";
import type { Product, ShoppingItem } from "@/types";

let items: ShoppingItem[] = [];
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) {
    listener();
  }
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getSnapshot(): ShoppingItem[] {
  return items;
}

function parseUnitLabel(unit: string): string {
  const parts = unit.trim().split(/\s+/);
  return parts.length > 1 ? parts[parts.length - 1]! : unit;
}

export function productToShoppingItem(product: Product): ShoppingItem {
  const unitPrice = getEffectivePrice(product);

  return {
    id: product.id,
    name: product.name,
    brand: product.brand,
    category: product.category,
    unit: parseUnitLabel(product.unit),
    quantity: 1,
    unitPrice,
    originalPrice: product.onSale ? product.price : undefined,
    onSale: product.onSale,
    checked: false,
    store: product.store,
    imageUrl: product.imageUrl,
  };
}

export function addProduct(product: Product): void {
  const existing = items.find((item) => item.id === product.id);

  if (existing) {
    items = items.map((item) =>
      item.id === product.id
        ? { ...item, quantity: item.quantity + 1 }
        : item,
    );
  } else {
    items = [...items, productToShoppingItem(product)];
  }

  emit();
}

export function isInShoppingList(id: string): boolean {
  return items.some((item) => item.id === id);
}

export function toggleChecked(id: string): void {
  items = items.map((item) =>
    item.id === id ? { ...item, checked: !item.checked } : item,
  );
  emit();
}

export function updateQuantity(id: string, quantity: number): void {
  if (quantity < 1) return;

  items = items.map((item) =>
    item.id === id ? { ...item, quantity } : item,
  );
  emit();
}

export function removeItem(id: string): void {
  items = items.filter((item) => item.id !== id);
  emit();
}

export function clearChecked(): void {
  items = items.filter((item) => !item.checked);
  emit();
}

export function replaceShoppingList(nextItems: ShoppingItem[]): void {
  items = nextItems.map((item) => ({ ...item }));
  emit();
}

export function getLineTotal(item: ShoppingItem): number {
  return item.quantity * item.unitPrice;
}

export function getLineSavings(item: ShoppingItem): number {
  if (!item.onSale || item.originalPrice == null) return 0;
  return (item.originalPrice - item.unitPrice) * item.quantity;
}

export function getOriginalLineTotal(item: ShoppingItem): number {
  const unitOriginal = item.originalPrice ?? item.unitPrice;
  return item.quantity * unitOriginal;
}

export function groupItemsByCategory(
  listItems: ShoppingItem[],
): { category: string; items: ShoppingItem[] }[] {
  const categories = [
    ...new Set(listItems.map((item) => item.category)),
  ].sort((a, b) => a.localeCompare(b, "da"));

  return categories.map((category) => ({
    category,
    items: listItems.filter((item) => item.category === category),
  }));
}
