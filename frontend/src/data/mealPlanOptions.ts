import { DEFAULT_FEED_STORE } from "@/lib/stores";
import type { MealPlanCriteria } from "@/types/mealPlan";

export const DIETARY_PREFERENCES = [
  { id: "vegetar", label: "Vegetar" },
  { id: "vegan", label: "Vegan" },
  { id: "glutenfri", label: "Glutenfri" },
  { id: "laktosefri", label: "Laktosefri" },
  { id: "low-carb", label: "Low-carb" },
  { id: "budget", label: "Budgetvenlig" },
  { id: "hurtig", label: "Hurtig tilberedning" },
  { id: "sund", label: "Sund & næringsrig" },
] as const;

export type DietaryPreferenceId = (typeof DIETARY_PREFERENCES)[number]["id"];

/** @deprecated Use MealPlanCriteria from @/types/mealPlan */
export type MealPlanFormValues = MealPlanCriteria;

export const DEFAULT_MEAL_PLAN_CRITERIA: MealPlanCriteria = {
  budget: 600,
  people: 2,
  days: 7,
  store: DEFAULT_FEED_STORE,
  dietaryPreferences: [],
  allergies: "",
};

/** @deprecated Use DEFAULT_MEAL_PLAN_CRITERIA */
export const DEFAULT_MEAL_PLAN_FORM = DEFAULT_MEAL_PLAN_CRITERIA;

export function getDayLabels(count: number): string[] {
  const labels = [
    "Mandag",
    "Tirsdag",
    "Onsdag",
    "Torsdag",
    "Fredag",
    "Lørdag",
    "Søndag",
  ];
  return labels.slice(0, count);
}
