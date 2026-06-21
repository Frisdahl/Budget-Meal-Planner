export const SUPPORTED_STORES = ["Netto", "Føtex", "Bilka"] as const;

export type StoreName = (typeof SUPPORTED_STORES)[number];

/** Salling Recommendations feed slug per supermarket brand. */
const STORE_TO_FEED_SLUG: Record<StoreName, string> = {
  Netto: "nettoplus",
  Føtex: "foetexplus",
  Bilka: "bilkatogo",
};

export function isSupportedStore(value: string): value is StoreName {
  return (SUPPORTED_STORES as readonly string[]).includes(value);
}

export function getFeedSlug(store: StoreName): string {
  return STORE_TO_FEED_SLUG[store];
}
