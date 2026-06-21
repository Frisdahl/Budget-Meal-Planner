import type { StoreName } from "../config/stores.js";
import type { ApiProduct } from "../types/api/product.js";
import type { SallingRecommendationProduct } from "../types/salling/recommendationProduct.js";

export function mapRecommendationProduct(
  raw: SallingRecommendationProduct,
  store: StoreName,
): ApiProduct | null {
  const id = raw.productId?.trim();
  if (!id) return null;

  const name = (raw.name ?? raw.description ?? "").trim();
  if (!name) return null;

  const price = raw.price ?? 0;
  const onSale = raw.offer === true;

  const unit =
    raw.contents != null && raw.contentsUnit
      ? `${raw.contents} ${raw.contentsUnit}`
      : (raw.priceUnit ?? "stk");

  return {
    id,
    name,
    brand: raw.brand?.trim() || "Ukendt",
    category: inferCategory(raw),
    price,
    unit,
    unitPrice: raw.unitPrice,
    store,
    inStock: Boolean(raw.inStock && raw.availableInStore !== false),
    onSale,
    salePrice: onSale ? price : undefined,
    description: buildDescription(raw),
    imageUrl: raw.image ?? undefined,
    externalUrl: raw.link,
    source: "salling-recommendations",
  };
}

export function mapRecommendationProducts(
  items: SallingRecommendationProduct[],
  store: StoreName,
): ApiProduct[] {
  return items
    .map((item) => mapRecommendationProduct(item, store))
    .filter((item): item is ApiProduct => item !== null);
}

function inferCategory(raw: SallingRecommendationProduct): string {
  const specCategory = raw.specifications?.find((s) =>
    s.title.toLowerCase().includes("kategori"),
  );
  if (specCategory?.value) return specCategory.value;

  return "Generelt";
}

function buildDescription(raw: SallingRecommendationProduct): string | undefined {
  const specs = raw.specifications
    ?.map((s) => `${s.title}: ${s.value}`)
    .join(" · ");

  if (specs) return specs;
  if (raw.description && raw.description !== raw.name) return raw.description;
  return undefined;
}
