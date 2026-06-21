import { useMemo } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { ShoppingCategorySection } from "@/components/shopping-list/ShoppingListItemCard";
import { ShoppingListSummary } from "@/components/shopping-list/ShoppingListSummary";
import { Button, EmptyState } from "@/components/ui";
import { useShoppingList } from "@/hooks/useShoppingList";
import { groupItemsByCategory } from "@/lib/shoppingList";

export function ShoppingListPage() {
  const {
    items,
    toggleChecked,
    updateQuantity,
    removeItem,
    clearChecked,
  } = useShoppingList();

  const groupedItems = useMemo(
    () => groupItemsByCategory(items),
    [items],
  );

  const hasCheckedItems = items.some((item) => item.checked);

  return (
    <PageContainer
      title="Indkøbsliste"
      description="Genereret fra din madplan — justér antal, kryds af og fjern varer efter behov."
      actions={
        hasCheckedItems ? (
          <Button variant="outline" size="sm" onClick={clearChecked}>
            Ryd afkrydsede
          </Button>
        ) : undefined
      }
    >
      <div className="flex flex-col gap-stack-xl">
        <ShoppingListSummary items={items} />

        {items.length === 0 ? (
          <EmptyState
            icon={<span className="text-2xl">🛒</span>}
            title="Din indkøbsliste er tom"
            description="Tilføj varer fra produktsiden eller generer en madplan for at fylde listen."
          />
        ) : (
          <div className="flex flex-col gap-stack-xl">
            {groupedItems.map(({ category, items: categoryItems }) => (
              <ShoppingCategorySection
                key={category}
                category={category}
                items={categoryItems}
                onToggleChecked={toggleChecked}
                onQuantityChange={updateQuantity}
                onRemove={removeItem}
              />
            ))}
          </div>
        )}
      </div>
    </PageContainer>
  );
}
