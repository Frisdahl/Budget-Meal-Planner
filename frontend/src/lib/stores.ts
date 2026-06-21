export const FEED_STORES = ["Netto", "Føtex", "Bilka"] as const;

export type FeedStore = (typeof FEED_STORES)[number];

export const DEFAULT_FEED_STORE: FeedStore = "Netto";

export function isFeedStore(value: string): value is FeedStore {
  return (FEED_STORES as readonly string[]).includes(value);
}
