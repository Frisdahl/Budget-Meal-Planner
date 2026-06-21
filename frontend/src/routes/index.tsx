import { createBrowserRouter } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { DashboardPage } from "@/pages/DashboardPage";
import { FavoritesPage } from "@/pages/FavoritesPage";
import { MealPlanPage } from "@/pages/MealPlanPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { ProductsPage } from "@/pages/ProductsPage";
import { ShoppingListPage } from "@/pages/ShoppingListPage";
import { ROUTES } from "./paths";

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { path: ROUTES.home, element: <DashboardPage /> },
      { path: ROUTES.mealPlan, element: <MealPlanPage /> },
      { path: ROUTES.products, element: <ProductsPage /> },
      { path: ROUTES.shoppingList, element: <ShoppingListPage /> },
      { path: ROUTES.favorites, element: <FavoritesPage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);
