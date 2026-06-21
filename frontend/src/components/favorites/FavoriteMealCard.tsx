import { Badge, Button, MealIcon, Text } from "@/components/ui";
import { formatCurrency } from "@/lib/format";
import type { FavoriteMeal } from "@/types";

type FavoriteMealCardProps = {
  meal: FavoriteMeal;
  onRemove?: (id: string) => void;
};

function formatLastUsed(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("da-DK", { day: "numeric", month: "short" });
}

export function FavoriteMealCard({ meal, onRemove }: FavoriteMealCardProps) {
  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-center justify-center border-b border-neutral-100 bg-gradient-to-br from-brand-50 to-accent-50 p-8">
        <MealIcon type="default" size="lg" />
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <h3 className="text-base font-semibold text-neutral-900">{meal.name}</h3>
          <p className="mt-1 line-clamp-2 text-body-sm text-neutral-500">
            {meal.description}
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {meal.tags.map((tag) => (
            <Badge key={tag} variant="brand">
              {tag}
            </Badge>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-2 border-t border-neutral-100 pt-3">
          <div>
            <Text variant="caption" as="span" className="block">
              Pris
            </Text>
            <span className="text-sm font-semibold text-neutral-900">
              {formatCurrency(meal.cost)}
            </span>
          </div>
          <div>
            <Text variant="caption" as="span" className="block">
              Tid
            </Text>
            <span className="text-sm font-semibold text-neutral-900">
              {meal.prepTimeMinutes} min
            </span>
          </div>
          <div>
            <Text variant="caption" as="span" className="block">
              Portioner
            </Text>
            <span className="text-sm font-semibold text-neutral-900">
              {meal.servings}
            </span>
          </div>
        </div>
        <Text variant="caption" as="span">
          Sidst brugt {formatLastUsed(meal.lastUsed)} · {meal.timesUsed} gange i alt
        </Text>
        <div className="mt-auto flex gap-2">
          <Button variant="outline" size="sm" className="flex-1">
            Tilføj til madplan
          </Button>
          {onRemove && (
            <Button
              variant="ghost"
              size="sm"
              aria-label={`Fjern ${meal.name} fra favoritter`}
              onClick={() => onRemove(meal.id)}
              className="text-neutral-500 hover:text-error"
            >
              Fjern
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}
