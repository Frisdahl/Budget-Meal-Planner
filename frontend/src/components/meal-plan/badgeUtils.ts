import type { Meal } from "@/types";

export type MealPlanBadgeVariant =
  | "default"
  | "brand"
  | "accent"
  | "success"
  | "warning"
  | "neutral"
  | "budget"
  | "protein"
  | "vegetarian"
  | "gluten"
  | "lactose"
  | "breakfast"
  | "lunch"
  | "dinner"
  | "diet";

export function getMealTypeBadgeVariant(
  mealType: Meal["type"],
): MealPlanBadgeVariant {
  if (mealType === "breakfast") return "breakfast";
  if (mealType === "lunch") return "lunch";
  return "dinner";
}

export function getRecipeTagBadgeVariant(tag: string): MealPlanBadgeVariant {
  const normalized = tag.toLowerCase();

  if (normalized.includes("budget")) return "budget";
  if (normalized.includes("protein")) return "protein";
  if (normalized.includes("vegetar") || normalized.includes("vegan"))
    return "vegetarian";
  if (normalized.includes("gluten")) return "gluten";
  if (normalized.includes("laktose")) return "lactose";
  if (normalized.includes("hurtig")) return "accent";
  if (normalized.includes("sund")) return "success";

  return "neutral";
}

export function getDietFilterBadgeVariant(label: string): MealPlanBadgeVariant {
  if (label === "Vegetar") return "vegetarian";
  if (label === "Glutenfri") return "gluten";
  if (label === "Laktosefri") return "lactose";
  if (label.includes("fisk") || label.includes("svinekød") || label.includes("Nødde"))
    return "warning";
  return "diet";
}
