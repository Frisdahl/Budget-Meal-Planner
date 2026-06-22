import { getRecipeById } from "@/data/recipes";
import { getMealRecipeId } from "@/lib/mealRecipe";
import { MEAL_TYPE_LABELS } from "@/data/mockMeals";
import { Badge, Button } from "@/components/ui";
import { formatCurrency } from "@/lib/format";
import { Clock, RefreshCw } from "lucide-react";
import {
  getMealTypeBadgeVariant,
  getRecipeTagBadgeVariant,
  type MealPlanBadgeVariant,
} from "./badgeUtils";
import { MealThumbnail } from "./MealThumbnail";
import type { Meal } from "@/types";

const DIET_TAG_LABELS: Record<string, string> = {
  vegetar: "Vegetar",
  vegansk: "Vegansk",
  glutenfri: "Glutenfri",
  laktosefri: "Laktosefri",
};

const DIET_BADGE_VARIANT: Record<string, MealPlanBadgeVariant> = {
  Vegetar: "vegetarian",
  Vegansk: "vegetarian",
  Glutenfri: "gluten",
  Laktosefri: "lactose",
};

type MealCardProps = {
  meal: Meal;
  people?: number;
  onSwap?: () => void;
};

export function MealCard({ meal, people = 1, onSwap }: MealCardProps) {
  const recipe = getRecipeById(getMealRecipeId(meal));
  const image = meal.image ?? recipe?.image;
  const lineTotal = meal.cost * people;
  const dietBadges =
    recipe?.dietTags
      .filter((tag) => DIET_TAG_LABELS[tag])
      .slice(0, 2)
      .map((tag) => DIET_TAG_LABELS[tag]!) ?? [];

  return (
    <article className="meal-card rounded-xl border border-neutral-200/90 bg-neutral-50/70 transition-colors hover:border-neutral-300 hover:bg-white">
      <MealThumbnail image={image} mealType={meal.type} title={meal.name} />

      <div className="meal-card-content">
        <Badge variant={getMealTypeBadgeVariant(meal.type)}>
          {MEAL_TYPE_LABELS[meal.type]}
        </Badge>
        <h4 className="mt-2 text-[15px] font-semibold leading-snug text-neutral-900 sm:text-base">
          {meal.name}
        </h4>

        {meal.description && (
          <p className="mt-2 line-clamp-2 text-caption leading-relaxed text-neutral-500">
            {meal.description}
          </p>
        )}

        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center gap-1 text-caption text-neutral-500">
            <Clock className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
            {meal.prepTimeMinutes} min
          </span>
          {dietBadges.map((label) => (
            <Badge key={label} variant={DIET_BADGE_VARIANT[label] ?? "diet"}>
              {label}
            </Badge>
          ))}
          {meal.tags.slice(0, 2).map((tag) => (
            <Badge key={tag} variant={getRecipeTagBadgeVariant(tag)}>
              {tag}
            </Badge>
          ))}
        </div>

        {onSwap && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-3 w-full sm:w-auto"
            onClick={onSwap}
          >
            <RefreshCw className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
            Skift opskrift
          </Button>
        )}
      </div>

      <div className="meal-price">
        <p className="text-sm font-semibold tabular-nums text-neutral-900">
          {formatCurrency(lineTotal)}
        </p>
        {people > 1 && (
          <p className="text-caption tabular-nums text-neutral-500">
            {formatCurrency(meal.cost)} pr. person
          </p>
        )}
      </div>
    </article>
  );
}
