import { apiGet } from "@/services/apiClient";
import type { FeedStore } from "@/lib/stores";
import type { ProductFeedResponse } from "@/types/api/product";
import type { Product } from "@/types";

export async function fetchProductFeed(store: FeedStore): Promise<ProductFeedResponse> {
  return apiGet<ProductFeedResponse>("/api/products/feed", {
    params: { store },
  });
}

/** Maps API products to domain Product (identical shape today). */
export function toProducts(response: ProductFeedResponse): Product[] {
  return response.data.map((item) => ({
    id: item.id,
    name: item.name,
    brand: item.brand,
    category: item.category,
    price: item.price,
    unit: item.unit,
    unitPrice: item.unitPrice,
    store: item.store,
    inStock: item.inStock,
    onSale: item.onSale,
    salePrice: item.salePrice,
    description: item.description,
    imageUrl: item.imageUrl,
    externalUrl: item.externalUrl,
    source: item.source,
  }));
}
