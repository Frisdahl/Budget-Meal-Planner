import { cn } from "@/lib/cn";
import {
  Badge,
  Button,
  QuantitySelector,
  Text,
} from "@/components/ui";
import { ProductImagePlaceholder } from "@/components/products/ProductImagePlaceholder";
import { getLineSavings, getLineTotal } from "@/lib/shoppingList";
import { formatCurrency } from "@/lib/format";
import type { ShoppingItem } from "@/types";

type ShoppingListItemCardProps = {
  item: ShoppingItem;
  onToggleChecked: (id: string) => void;
  onQuantityChange: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
};

export function ShoppingListItemCard({
  item,
  onToggleChecked,
  onQuantityChange,
  onRemove,
}: ShoppingListItemCardProps) {
  const lineTotal = getLineTotal(item);
  const lineSavings = getLineSavings(item);

  return (
    <article
      className={cn(
        "flex flex-col gap-4 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm transition-all sm:flex-row sm:items-center",
        item.checked && "opacity-60 bg-neutral-50",
      )}
    >
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <input
          type="checkbox"
          checked={item.checked}
          onChange={() => onToggleChecked(item.id)}
          aria-label={`Markér ${item.name} som købt`}
          className="mt-1 h-4 w-4 shrink-0 rounded border-neutral-300 text-brand-600 focus:ring-brand-500"
        />

        <div
          className={cn(
            "h-16 w-16 shrink-0 overflow-hidden rounded-lg",
            item.imageUrl && "bg-neutral-50",
          )}
        >
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt={item.name}
              loading="lazy"
              className="h-full w-full object-contain p-1"
            />
          ) : (
            <ProductImagePlaceholder
              category={item.category}
              brand={item.brand}
              name={item.name}
              className="aspect-auto h-16 w-16"
            />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Text variant="caption" as="span" className="text-neutral-400">
              {item.brand}
            </Text>
            {item.onSale && (
              <Badge variant="accent">Tilbud</Badge>
            )}
            <Badge variant="neutral">{item.store}</Badge>
          </div>
          <h3
            className={cn(
              "mt-0.5 text-sm font-semibold text-neutral-900",
              item.checked && "line-through",
            )}
          >
            {item.name}
          </h3>
          {item.mealRef && (
            <Text variant="caption" as="span" className="mt-0.5 block">
              Til: {item.mealRef}
            </Text>
          )}
          {lineSavings > 0 && (
            <Text variant="caption" as="span" className="mt-1 block text-brand-600">
              Spar {formatCurrency(lineSavings)}
            </Text>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 sm:shrink-0 sm:flex-col sm:items-end lg:flex-row lg:items-center">
        <QuantitySelector
          value={item.quantity}
          onChange={(qty) => onQuantityChange(item.id, qty)}
          disabled={item.checked}
          label={`Antal ${item.name}`}
        />

        <div className="flex flex-col items-end gap-2 sm:flex-row sm:items-center">
          <div className="text-right">
            {item.onSale && item.originalPrice != null && (
              <span className="block text-caption line-through">
                {formatCurrency(item.originalPrice * item.quantity)}
              </span>
            )}
            <span
              className={cn(
                "text-base font-bold text-neutral-900",
                item.checked && "line-through",
              )}
            >
              {formatCurrency(lineTotal)}
            </span>
            <Text variant="caption" as="span" className="block">
              {formatCurrency(item.unitPrice)}/{item.unit}
            </Text>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-label={`Fjern ${item.name}`}
            onClick={() => onRemove(item.id)}
            className="text-neutral-500 hover:text-error"
          >
            Fjern
          </Button>
        </div>
      </div>
    </article>
  );
}

type ShoppingCategorySectionProps = {
  category: string;
  items: ShoppingItem[];
  onToggleChecked: (id: string) => void;
  onQuantityChange: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
};

export function ShoppingCategorySection({
  category,
  items,
  onToggleChecked,
  onQuantityChange,
  onRemove,
}: ShoppingCategorySectionProps) {
  const categoryTotal = items.reduce((sum, item) => sum + getLineTotal(item), 0);
  const categorySavings = items.reduce((sum, item) => sum + getLineSavings(item), 0);

  return (
    <section className="flex flex-col gap-stack-md">
      <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold text-neutral-900">{category}</h2>
          <Badge variant="neutral">{items.length}</Badge>
        </div>
        <div className="text-right">
          <span className="text-sm font-semibold text-neutral-800">
            {formatCurrency(categoryTotal)}
          </span>
          {categorySavings > 0 && (
            <Text variant="caption" as="span" className="block text-brand-600">
              Spar {formatCurrency(categorySavings)}
            </Text>
          )}
        </div>
      </div>

      <ul className="flex flex-col gap-3">
        {items.map((item) => (
          <li key={item.id}>
            <ShoppingListItemCard
              item={item}
              onToggleChecked={onToggleChecked}
              onQuantityChange={onQuantityChange}
              onRemove={onRemove}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
