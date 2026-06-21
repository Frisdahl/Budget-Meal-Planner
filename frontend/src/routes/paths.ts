export const ROUTES = {
  home: "/",
  mealPlan: "/meal-plan",
  products: "/products",
  shoppingList: "/shopping-list",
  favorites: "/favorites",
} as const;

export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES];

export const NAV_ITEMS = [
  { label: "Dashboard", path: ROUTES.home },
  { label: "Madplan", path: ROUTES.mealPlan },
  { label: "Produkter", path: ROUTES.products },
  { label: "Indkøbsliste", path: ROUTES.shoppingList },
  { label: "Favoritter", path: ROUTES.favorites },
] as const;
