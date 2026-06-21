import { Badge, Button, Text } from "@/components/ui";
import { ProductImagePlaceholder } from "./ProductImagePlaceholder";
import { getEffectivePrice } from "@/lib/products";
import { formatCurrency } from "@/lib/format";
import type { Product } from "@/types";

type ProductCardProps = {
  product: Product;
  isInShoppingList: boolean;
  onAddToShoppingList: (product: Product) => void;
};

export function ProductCard({
  product,
  isInShoppingList,
  onAddToShoppingList,
}: ProductCardProps) {
  const effectivePrice = getEffectivePrice(product);

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm transition-all hover:border-neutral-300 hover:shadow-md">
      <div className="relative">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            loading="lazy"
            className="aspect-[4/3] w-full bg-neutral-50 object-contain p-4"
          />
        ) : (
          <ProductImagePlaceholder
            category={product.category}
            brand={product.brand}
            name={product.name}
          />
        )}
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {product.onSale && product.inStock && (
            <Badge variant="accent">Tilbud</Badge>
          )}
          {!product.inStock && (
            <Badge variant="warning">Udsolgt</Badge>
          )}
        </div>
        <div className="absolute right-3 top-3">
          <Badge variant="neutral">{product.store}</Badge>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="min-w-0">
          <Text variant="caption" as="span" className="text-neutral-400">
            {product.brand}
          </Text>
          <h3 className="mt-0.5 line-clamp-2 text-sm font-semibold leading-snug text-neutral-900">
            {product.name}
          </h3>
          {product.description && (
            <p className="mt-1 line-clamp-2 text-caption">{product.description}</p>
          )}
        </div>

        <Badge variant="brand" className="self-start">
          {product.category}
        </Badge>

        <div className="mt-auto flex flex-col gap-3 border-t border-neutral-100 pt-3">
          <div className="flex items-end justify-between gap-2">
            <div>
              {product.onSale && product.salePrice != null ? (
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                  <span className="text-xl font-bold text-brand-600">
                    {formatCurrency(product.salePrice)}
                  </span>
                  <span className="text-caption line-through">
                    {formatCurrency(product.price)}
                  </span>
                </div>
              ) : (
                <span className="text-xl font-bold text-neutral-900">
                  {formatCurrency(effectivePrice)}
                </span>
              )}
              <Text variant="caption" as="span" className="block">
                {product.unit}
                {product.unitPrice != null && /g|kg|l/i.test(product.unit) && (
                  <> · {formatCurrency(product.unitPrice)}/kg</>
                )}
              </Text>
            </div>
          </div>

          <Button
            variant={isInShoppingList ? "secondary" : "primary"}
            size="sm"
            className="w-full"
            disabled={!product.inStock}
            onClick={() => onAddToShoppingList(product)}
          >
            {isInShoppingList ? (
              <>✓ Tilføjet til liste</>
            ) : (
              <>+ Tilføj til indkøbsliste</>
            )}
          </Button>
        </div>
      </div>
    </article>
  );
}
