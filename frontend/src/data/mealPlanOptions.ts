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

export const MEAL_PLAN_DIET_FILTERS = [
  { key: "vegetarian", label: "Vegetar" },
  { key: "noPork", label: "Uden svinekød" },
  { key: "noFish", label: "Uden fisk" },
  { key: "lactoseFree", label: "Laktosefri" },
  { key: "glutenFree", label: "Glutenfri" },
  { key: "nutFree", label: "Nøddefri" },
] as const;

export type MealPlanDietFilterKey =
  (typeof MEAL_PLAN_DIET_FILTERS)[number]["key"];

export function getActiveDietFilterLabels(criteria: MealPlanCriteria): string[] {
  return MEAL_PLAN_DIET_FILTERS.filter(({ key }) => criteria[key]).map(
    ({ label }) => label,
  );
}

/** @deprecated Use MealPlanCriteria from @/types/mealPlan */
export type MealPlanFormValues = MealPlanCriteria;

export const DEFAULT_MEAL_PLAN_CRITERIA: MealPlanCriteria = {
  budget: 600,
  people: 2,
  days: 7,
  store: DEFAULT_FEED_STORE,
  dietaryPreferences: [],
  allergies: "",
  vegetarian: false,
  noPork: false,
  noFish: false,
  lactoseFree: false,
  glutenFree: false,
  nutFree: false,
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
