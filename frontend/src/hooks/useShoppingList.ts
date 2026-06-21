import { useCallback, useSyncExternalStore } from "react";
import {
  addProduct,
  clearChecked,
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
    isInList: (id: string) => items.some((item) => item.id === id),
    toggleChecked,
    updateQuantity,
    removeItem,
    clearChecked,
  };
}
