export type MealType = "breakfast" | "lunch" | "dinner";

export type MealSource = "spoonacular" | "local";

export type Meal = {
  id: string;
  recipeId?: string;
  name: string;
  description: string;
  type: MealType;
  day: string;
  cost: number;
  prepTimeMinutes: number;
  calories: number;
  tags: string[];
  ingredients: string[];
  image?: string;
  source?: MealSource;
};

export type Product = {
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
  source?: "salling-recommendations";
};

export type ShoppingItem = {
  id: string;
  name: string;
  brand: string;
  category: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  originalPrice?: number;
  onSale?: boolean;
  checked: boolean;
  mealRef?: string;
  store: string;
  imageUrl?: string;
  sourceProductId?: string;
  requiredAmount?: number;
  requiredUnit?: string;
  packSize?: number;
  packUnit?: string;
  packsNeeded?: number;
};

export type FavoriteMeal = {
  id: string;
  name: string;
  description: string;
  cost: number;
  prepTimeMinutes: number;
  servings: number;
  tags: string[];
  lastUsed: string;
  timesUsed: number;
};

export type { FavoriteProduct } from "./favorites";
export type {
  GeneratedMealPlanResult,
  MealPlanCriteria,
  MealPlanDay,
  MealPlanSessionState,
  MealPlanSessionStatus,
  MealPlanSource,
  MealPlanSummary,
} from "./mealPlan";

export type BudgetSummary = {
  weeklyBudget: number;
  spent: number;
  remaining: number;
  mealsPlanned: number;
  totalMeals: number;
};

export type DayOfWeek =
  | "mandag"
  | "tirsdag"
  | "onsdag"
  | "torsdag"
  | "fredag"
  | "lørdag"
  | "søndag";
