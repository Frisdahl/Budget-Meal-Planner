import { Badge, MealIcon, Text } from "@/components/ui";
import { MEAL_TYPE_LABELS } from "@/data/mockMeals";
import { formatCurrency } from "@/lib/format";
import type { Meal } from "@/types";

type MealCardProps = {
  meal: Meal;
  compact?: boolean;
};

export function MealCard({ meal, compact = false }: MealCardProps) {
  return (
    <article
      className={`flex gap-3 rounded-lg border border-neutral-200 bg-white transition-shadow hover:shadow-md ${compact ? "p-3" : "p-4"}`}
    >
      <MealIcon type={meal.type} size={compact ? "sm" : "md"} />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Text variant="caption" as="span" className="text-brand-600">
              {MEAL_TYPE_LABELS[meal.type]}
            </Text>
            <h4 className="truncate text-sm font-semibold text-neutral-900">
              {meal.name}
            </h4>
          </div>
          <span className="shrink-0 text-sm font-semibold text-neutral-800">
            {formatCurrency(meal.cost)}
          </span>
        </div>
        {!compact && (
          <p className="mt-1 line-clamp-2 text-caption">{meal.description}</p>
        )}
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Text variant="caption" as="span">
            {meal.prepTimeMinutes} min · {meal.calories} kcal
          </Text>
          {meal.tags.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="neutral">
              {tag}
            </Badge>
          ))}
        </div>
      </div>
    </article>
  );
}
