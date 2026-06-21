/** Raw product shape from Salling Recommendations / product feeds. */
export type SallingRecommendationProduct = {
  productId: string;
  sku?: string;
  availableInStore?: boolean;
  brand?: string;
  contents?: number;
  contentsUnit?: string;
  description?: string;
  gtins?: string[];
  image?: string | null;
  inStock?: boolean;
  link?: string;
  name?: string;
  offer?: boolean;
  price?: number;
  priceUnit?: string;
  unitPrice?: number;
  specifications?: Array<{ title: string; value: string }>;
};

export type SallingRecommendationFeedResponse =
  | SallingRecommendationProduct[]
  | { products?: SallingRecommendationProduct[] }
  | { data?: SallingRecommendationProduct[] };
