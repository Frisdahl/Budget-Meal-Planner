import type { FavoriteProduct } from "@/types/favorites";

export const FAVORITE_PRODUCT_CATEGORIES = [
  "Alle",
  "Kød & fisk",
  "Mejeri",
  "Grønt",
  "Kolonial",
  "Brød",
  "Frost",
  "Drikkevarer",
] as const;

export type FavoriteProductCategory = (typeof FAVORITE_PRODUCT_CATEGORIES)[number];

export const mockFavoriteProducts: FavoriteProduct[] = [
  {
    id: "fp1",
    name: "Kyllingebryst",
    brand: "Danpo",
    category: "Kød & fisk",
    price: 49.95,
    salePrice: 39.95,
    onSale: true,
    unit: "600 g",
    store: "Netto",
    addedAt: "2026-06-01",
    timesPurchased: 8,
  },
  {
    id: "fp2",
    name: "Græsk yoghurt 10%",
    brand: "Arla",
    category: "Mejeri",
    price: 22.95,
    salePrice: 17.95,
    onSale: true,
    unit: "500 g",
    store: "Netto",
    addedAt: "2026-05-20",
    timesPurchased: 14,
  },
  {
    id: "fp3",
    name: "Havregryn",
    brand: "Quaker",
    category: "Kolonial",
    price: 18.95,
    unit: "500 g",
    store: "Netto",
    addedAt: "2026-05-15",
    timesPurchased: 6,
  },
  {
    id: "fp4",
    name: "Laks filet",
    brand: "Royal Greenland",
    category: "Kød & fisk",
    price: 79.95,
    unit: "400 g",
    store: "Føtex",
    addedAt: "2026-06-10",
    timesPurchased: 4,
  },
  {
    id: "fp5",
    name: "Rugbrød",
    brand: "Kohberg",
    category: "Brød",
    price: 19.95,
    unit: "800 g",
    store: "Netto",
    addedAt: "2026-04-28",
    timesPurchased: 22,
  },
  {
    id: "fp6",
    name: "Cherrytomater",
    brand: "Dansk",
    category: "Grønt",
    price: 14.95,
    unit: "250 g",
    store: "Netto",
    addedAt: "2026-06-12",
    timesPurchased: 11,
  },
  {
    id: "fp7",
    name: "Tortillas",
    brand: "Old El Paso",
    category: "Kolonial",
    price: 21.95,
    salePrice: 15.95,
    onSale: true,
    unit: "8 stk",
    store: "Netto",
    addedAt: "2026-06-05",
    timesPurchased: 5,
  },
  {
    id: "fp8",
    name: "Frosne bær",
    brand: "Field Fresh",
    category: "Frost",
    price: 19.95,
    unit: "450 g",
    store: "Netto",
    addedAt: "2026-05-08",
    timesPurchased: 7,
  },
];

export function getFavoriteProductPrice(product: FavoriteProduct): number {
  return product.onSale && product.salePrice != null
    ? product.salePrice
    : product.price;
}
