import type { FeedStore } from "@/lib/stores";
import type { DayOfWeek, Meal, ShoppingItem } from "@/types";
import type { DietaryPreferenceId } from "@/data/mealPlanOptions";

export type MealPlanCriteria = {
  budget: number;
  people: number;
  days: number;
  store: FeedStore;
  dietaryPreferences: DietaryPreferenceId[];
  allergies: string;
};

export type MealPlanDay = {
  day: DayOfWeek;
  label: string;
  meals: Meal[];
};

export type MealPlanSummary = {
  totalCost: number;
  scaledCost: number;
  budgetUsedPercent: number;
  underBudget: boolean;
  mealCount: number;
  averageCostPerDay: number;
};

export type MealPlanSource = "placeholder" | "rule-based" | "openai";

export type GeneratedMealPlanResult = {
  criteria: MealPlanCriteria;
  days: MealPlanDay[];
  summary: MealPlanSummary;
  shoppingListItems: ShoppingItem[];
  generatedAt: string;
  source: MealPlanSource;
};

export type MealPlanSessionStatus = "idle" | "generating" | "ready" | "error";

export type MealPlanSessionState = {
  criteria: MealPlanCriteria;
  plan: GeneratedMealPlanResult | null;
  status: MealPlanSessionStatus;
  error: string | null;
};
