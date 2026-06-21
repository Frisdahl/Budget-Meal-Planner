import { useCallback, useSyncExternalStore } from "react";
import {
  addProduct,
  clearChecked,
  getShoppingItemProductKey,
  getSnapshot,
  removeItem,
  subscribe,
  toggleChecked,
  updateQuantity,
} from "@/lib/shoppingList";
import type { Product } from "@/types";

export function useShoppingList() {
  const items = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const add = useCallback((product: Product) => {
    addProduct(product);
  }, []);

  return {
    items,
    addProduct: add,
    isInList: (id: string) =>
      items.some((item) => getShoppingItemProductKey(item) === id),
    toggleChecked,
    updateQuantity,
    removeItem,
    clearChecked,
  };
}
