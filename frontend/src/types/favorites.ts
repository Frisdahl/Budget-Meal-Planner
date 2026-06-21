export type FavoriteProduct = {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  unit: string;
  store: string;
  onSale?: boolean;
  salePrice?: number;
  addedAt: string;
  timesPurchased: number;
};
