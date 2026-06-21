import { useQuery } from "@tanstack/react-query";
import {
  fetchProductFeed,
  toProducts,
} from "@/services/productFeedService";
import type { FeedStore } from "@/lib/stores";

export function productFeedQueryKey(store: FeedStore) {
  return ["products", "feed", store] as const;
}

export function useProductFeed(store: FeedStore) {
  const query = useQuery({
    queryKey: productFeedQueryKey(store),
    queryFn: () => fetchProductFeed(store),
  });

  return {
    products: query.data ? toProducts(query.data) : [],
    meta: query.data?.meta,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
