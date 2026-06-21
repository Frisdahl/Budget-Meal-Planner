import { getEnv } from "../config/env.js";
import { getFeedSlug, type StoreName } from "../config/stores.js";
import {
  extractFeedProducts,
  fetchRecommendationFeed,
} from "../clients/sallingClient.js";
import { MemoryCache } from "../lib/cache.js";
import { mapRecommendationProducts } from "../mappers/recommendationProductMapper.js";
import type { ProductFeedResponse } from "../types/api/product.js";

let cache: MemoryCache<ProductFeedResponse> | null = null;

function getCache(): MemoryCache<ProductFeedResponse> {
  if (!cache) {
    cache = new MemoryCache(getEnv().CACHE_TTL_SECONDS * 1000);
  }
  return cache;
}

export async function getProductFeed(store: StoreName): Promise<ProductFeedResponse> {
  const feedSlug = getFeedSlug(store);
  const cacheKey = `feed:${feedSlug}`;

  const cached = getCache().get(cacheKey);
  if (cached) {
    return {
      ...cached,
      meta: { ...cached.meta, cached: true },
    };
  }

  const rawResponse = await fetchRecommendationFeed(feedSlug);
  const rawProducts = extractFeedProducts(rawResponse);
  const data = mapRecommendationProducts(rawProducts, store);

  const response: ProductFeedResponse = {
    data,
    meta: {
      store,
      provider: "salling",
      feedSlug,
      cached: false,
      fetchedAt: new Date().toISOString(),
      count: data.length,
    },
  };

  getCache().set(cacheKey, response);
  return response;
}