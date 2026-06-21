import { getRecipeById } from "@/data/recipes";
import { MEAL_TYPE_LABELS } from "@/data/mockMeals";
import { Badge, Button } from "@/components/ui";
import { formatCurrency } from "@/lib/format";
import { Clock, RefreshCw } from "lucide-react";
import {
  getMealTypeBadgeVariant,
  getRecipeTagBadgeVariant,
  type MealPlanBadgeVariant,
} from "./badgeUtils";
import { MealTypeIcon } from "./MealTypeIcon";
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
  const recipe = getRecipeById(meal.id);
  const lineTotal = meal.cost * people;
  const dietBadges =
    recipe?.dietTags
      .filter((tag) => DIET_TAG_LABELS[tag])
      .slice(0, 2)
      .map((tag) => DIET_TAG_LABELS[tag]!) ?? [];

  return (
    <article className="flex gap-3 rounded-xl border border-neutral-200/90 bg-neutral-50/70 p-3 transition-colors hover:border-neutral-300 hover:bg-white sm:p-4">
      <MealTypeIcon type={meal.type} size="sm" />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <Badge variant={getMealTypeBadgeVariant(meal.type)}>
              {MEAL_TYPE_LABELS[meal.type]}
            </Badge>
            <h4 className="mt-2 text-[15px] font-semibold leading-snug text-neutral-900 sm:text-base">
              {meal.name}
            </h4>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-sm font-semibold tabular-nums text-neutral-900">
              {formatCurrency(lineTotal)}
            </p>
            {people > 1 && (
              <p className="text-caption tabular-nums text-neutral-500">
                {formatCurrency(meal.cost)} pr. person
              </p>
            )}
          </div>
        </div>

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
    </article>
  );
}
