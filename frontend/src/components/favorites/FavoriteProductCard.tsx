import { Badge, Button, ProductIcon, Text } from "@/components/ui";
import { getFavoriteProductPrice } from "@/data/mockFavoriteProducts";
import { formatCurrency } from "@/lib/format";
import type { FavoriteProduct } from "@/types/favorites";

type FavoriteProductCardProps = {
  product: FavoriteProduct;
  onRemove?: (id: string) => void;
};

function formatAddedAt(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("da-DK", { day: "numeric", month: "short", year: "numeric" });
}

export function FavoriteProductCard({ product, onRemove }: FavoriteProductCardProps) {
  const displayPrice = getFavoriteProductPrice(product);

  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className="relative flex aspect-[4/3] items-center justify-center bg-gradient-to-br from-neutral-100 to-neutral-50">
        <ProductIcon category={product.category} size="lg" />
        <div className="absolute left-3 top-3 flex gap-1.5">
          {product.onSale && <Badge variant="accent">Tilbud</Badge>}
        </div>
        <div className="absolute right-3 top-3">
          <Badge variant="neutral">{product.store}</Badge>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <Text variant="caption" as="span" className="text-neutral-400">
            {product.brand}
          </Text>
          <h3 className="mt-0.5 text-base font-semibold text-neutral-900">
            {product.name}
          </h3>
          <Badge variant="brand" className="mt-2">
            {product.category}
          </Badge>
        </div>

        <div className="border-t border-neutral-100 pt-3">
          {product.onSale && product.salePrice != null ? (
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-brand-600">
                {formatCurrency(product.salePrice)}
              </span>
              <span className="text-caption line-through">
                {formatCurrency(product.price)}
              </span>
            </div>
          ) : (
            <span className="text-xl font-bold text-neutral-900">
              {formatCurrency(displayPrice)}
            </span>
          )}
          <Text variant="caption" as="span" className="block">
            {product.unit}
          </Text>
        </div>

        <Text variant="caption" as="span">
          Gemt {formatAddedAt(product.addedAt)} · Købt {product.timesPurchased} gange
        </Text>

        <div className="mt-auto flex gap-2">
          <Button variant="outline" size="sm" className="flex-1">
            Tilføj til indkøbsliste
          </Button>
          {onRemove && (
            <Button
              variant="ghost"
              size="sm"
              aria-label={`Fjern ${product.name} fra favoritter`}
              onClick={() => onRemove(product.id)}
              className="text-neutral-500 hover:text-error"
            >
              Fjern
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}
