export type ApiProduct = {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  unit: string;
  unitPrice?: number;
  store: string;
  inStock: boolean;
  onSale: boolean;
  salePrice?: number;
  description?: string;
  imageUrl?: string;
  externalUrl?: string;
  source: "salling-recommendations";
};

export type ProductFeedMeta = {
  store: string;
  provider: "salling";
  feedSlug: string;
  cached: boolean;
  fetchedAt: string;
  count: number;
};

export type ProductFeedResponse = {
  data: ApiProduct[];
  meta: ProductFeedMeta;
};

export type ApiErrorBody = {
  error: {
    code: string;
    message: string;
    status: number;
  };
};
