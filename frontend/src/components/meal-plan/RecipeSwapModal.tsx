import { useEffect, useMemo, useState } from "react";
import { Badge, Button, Modal, Text } from "@/components/ui";
import { getRecipeById } from "@/data/recipes";
import { MEAL_TYPE_LABELS } from "@/data/mockMeals";
import { formatCurrency } from "@/lib/format";
import { estimateRecipeTotalCost } from "@/lib/recipePlan";
import {
  formatRecipeSwapImpact,
  getRecipeAlternativesForMeal,
  mealTypeToRecipeMealType,
  type MealSwapTarget,
  type RecipeAlternative,
} from "@/lib/recipeSwap";
import { fetchProductFeed, toProducts } from "@/services/productFeedService";
import { getRecipeTagBadgeVariant } from "./badgeUtils";
import { LoadingSpinner } from "./LoadingSpinner";
import type { GeneratedMealPlanResult } from "@/types/mealPlan";
import type { Product } from "@/types";
import { Clock, Users } from "lucide-react";

type RecipeSwapModalProps = {
  open: boolean;
  target: MealSwapTarget | null;
  plan: GeneratedMealPlanResult;
  onClose: () => void;
  onSelect: (recipeId: string) => Promise<void>;
};

type AlternativeGroup = {
  label: string;
  items: RecipeAlternative[];
};

function groupAlternatives(
  alternatives: RecipeAlternative[],
  currentCost: number,
): AlternativeGroup[] {
  const cheaper = alternatives.filter(
    (item) => item.estimatedCost < currentCost,
  );
  const samePrice = alternatives.filter(
    (item) => item.estimatedCost === currentCost,
  );
  const costlier = alternatives.filter(
    (item) => item.estimatedCost > currentCost,
  );

  return [
    { label: "Billigere", items: cheaper },
    { label: "Samme pris", items: samePrice },
    { label: "Dyrere", items: costlier },
  ].filter((group) => group.items.length > 0);
}

type AlternativeCardProps = {
  alternative: RecipeAlternative;
  currentCost: number;
  people: number;
  disabled: boolean;
  onSelect: (recipeId: string) => void;
};

function AlternativeCard({
  alternative,
  currentCost,
  people,
  disabled,
  onSelect,
}: AlternativeCardProps) {
  const { recipe, estimatedCost } = alternative;
  const scaledCost = estimatedCost * people;

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onSelect(recipe.id)}
      className="flex w-full flex-col gap-3 rounded-xl border border-neutral-200 bg-white p-4 text-left transition-all hover:border-brand-300 hover:bg-brand-50/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[15px] font-semibold leading-snug text-neutral-900">
            {recipe.title}
          </p>
          <p className="mt-1 text-caption text-brand-700">
            {formatRecipeSwapImpact(currentCost, estimatedCost)}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-sm font-semibold tabular-nums text-neutral-900">
            {formatCurrency(scaledCost)}
          </p>
          {people > 1 && (
            <p className="text-caption tabular-nums text-neutral-500">
              {formatCurrency(estimatedCost)} pr. person
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <span className="inline-flex items-center gap-1 text-caption text-neutral-500">
          <Clock className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
          {recipe.estimatedTimeMinutes} min
        </span>
        <span className="inline-flex items-center gap-1 text-caption text-neutral-500">
          <Users className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
          {recipe.servings} pers.
        </span>
        {recipe.tags.slice(0, 3).map((tag) => (
          <Badge key={tag} variant={getRecipeTagBadgeVariant(tag)}>
            {tag}
          </Badge>
        ))}
      </div>
    </button>
  );
}

export function RecipeSwapModal({
  open,
  target,
  plan,
  onClose,
  onSelect,
}: RecipeSwapModalProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [alternatives, setAlternatives] = useState<RecipeAlternative[]>([]);

  useEffect(() => {
    if (!open || !target) {
      setAlternatives([]);
      setProducts([]);
      setError(null);
      return;
    }

    let cancelled = false;
    const swapTarget = target;

    async function loadAlternatives() {
      setIsLoading(true);
      setError(null);

      try {
        const fetchedProducts = await fetchProductFeed(plan.criteria.store)
          .then(toProducts)
          .catch(() => [] as Product[]);

        if (cancelled) return;

        setProducts(fetchedProducts);

        const recipeMealType = mealTypeToRecipeMealType(swapTarget.meal.type);
        const options = getRecipeAlternativesForMeal(
          swapTarget.meal.id,
          recipeMealType,
          plan.criteria,
          fetchedProducts,
        );

        setAlternatives(options);

        if (options.length === 0) {
          setError("Ingen alternative opskrifter matcher dine valg.");
        }
      } catch {
        if (!cancelled) {
          setError("Kunne ikke hente alternative opskrifter.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadAlternatives();

    return () => {
      cancelled = true;
    };
  }, [open, target, plan]);

  const currentRecipe = target ? getRecipeById(target.meal.id) : null;

  const currentCost = useMemo(() => {
    if (!target || !currentRecipe) return 0;
    return estimateRecipeTotalCost(
      currentRecipe,
      products,
      plan.criteria.people,
    );
  }, [target, currentRecipe, products, plan.criteria.people]);

  const groupedAlternatives = useMemo(
    () => groupAlternatives(alternatives, currentCost),
    [alternatives, currentCost],
  );

  async function handleSelect(recipeId: string) {
    setIsApplying(true);
    setError(null);
    try {
      await onSelect(recipeId);
      onClose();
    } catch {
      setError("Kunne ikke skifte opskrift. Prøv igen.");
    } finally {
      setIsApplying(false);
    }
  }

  if (!target) return null;

  const { meal, dayIndex } = target;
  const dayLabel = plan.days[dayIndex]?.label ?? "";
  const mealTypeLabel = MEAL_TYPE_LABELS[meal.type];
  const people = plan.criteria.people;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Skift opskrift"
      description={`${dayLabel} · ${mealTypeLabel}`}
      className="sm:max-w-xl"
    >
      <div className="flex flex-col gap-4">
        <div className="rounded-xl border border-neutral-200 bg-neutral-50/80 p-4">
          <p className="text-caption font-medium uppercase tracking-wide text-neutral-500">
            Nuværende opskrift
          </p>
          <div className="mt-2 flex items-start justify-between gap-3">
            <p className="text-[15px] font-semibold text-neutral-900">
              {meal.name}
            </p>
            <p className="shrink-0 text-sm font-semibold tabular-nums text-neutral-900">
              {formatCurrency(currentCost * people)}
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-10 text-body-sm text-neutral-500">
            <LoadingSpinner />
            Henter alternative opskrifter...
          </div>
        ) : error && alternatives.length === 0 ? (
          <Text variant="body-sm" className="text-accent-800">
            {error}
          </Text>
        ) : (
          <div className="flex flex-col gap-5">
            {groupedAlternatives.map((group) => (
              <div key={group.label}>
                <p className="mb-2 text-caption font-medium uppercase tracking-wide text-neutral-500">
                  {group.label}
                </p>
                <div className="flex flex-col gap-2">
                  {group.items.map((alternative) => (
                    <AlternativeCard
                      key={alternative.recipe.id}
                      alternative={alternative}
                      currentCost={currentCost}
                      people={people}
                      disabled={isApplying}
                      onSelect={(recipeId) => void handleSelect(recipeId)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {error && alternatives.length > 0 && (
          <Text variant="body-sm" className="text-accent-800">
            {error}
          </Text>
        )}

        <div className="flex justify-end border-t border-neutral-100 pt-2">
          <Button variant="ghost" onClick={onClose} disabled={isApplying}>
            Annuller
          </Button>
        </div>
      </div>
    </Modal>
  );
}
