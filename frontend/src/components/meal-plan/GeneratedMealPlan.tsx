import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Badge,
  StatCard,
  Text,
} from "@/components/ui";
import { BudgetSummaryCard } from "./BudgetSummaryCard";
import { DayPlanCard } from "./DayPlanCard";
import { LoadingSpinner } from "./LoadingSpinner";
import { RecipeSwapModal } from "./RecipeSwapModal";
import {
  getDietFilterBadgeVariant,
} from "./badgeUtils";
import { formatCurrency } from "@/lib/format";
import { ROUTES } from "@/routes/paths";
import { getActiveDietFilterLabels } from "@/data/mealPlanOptions";
import type { MealSwapTarget } from "@/lib/recipeSwap";
import {
  CalendarDays,
  ShoppingBag,
  User,
  UtensilsCrossed,
} from "lucide-react";
import type { GeneratedMealPlanResult } from "@/types/mealPlan";

type GeneratedMealPlanProps = {
  plan: GeneratedMealPlanResult;
  onMakeCheaper?: () => void;
  onSwapMeal?: (
    dayIndex: number,
    mealIndex: number,
    recipeId: string,
  ) => Promise<void>;
  isOptimizing?: boolean;
  optimizeMessage?: string | null;
  optimizationSavings?: number | null;
};

export function GeneratedMealPlan({
  plan,
  onMakeCheaper,
  onSwapMeal,
  isOptimizing = false,
  optimizeMessage,
  optimizationSavings,
}: GeneratedMealPlanProps) {
  const [swapTarget, setSwapTarget] = useState<MealSwapTarget | null>(null);
  const { criteria, days, summary, shoppingListItems, source } = plan;
  const activeDietFilterLabels = getActiveDietFilterLabels(criteria);

  function openSwapModal(dayIndex: number, mealIndex: number) {
    const meal = days[dayIndex]?.meals[mealIndex];
    if (!meal) return;
    setSwapTarget({ dayIndex, mealIndex, meal });
  }

  async function handleSwapSelect(recipeId: string) {
    if (!swapTarget || !onSwapMeal) return;
    await onSwapMeal(swapTarget.dayIndex, swapTarget.mealIndex, recipeId);
  }

  return (
    <section
      className="flex flex-col gap-12"
      aria-label="Genereret madplan"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <h2 className="text-section-title">Din madplan</h2>
          <p className="max-w-2xl text-[15px] leading-relaxed text-neutral-500">
            {source === "placeholder"
              ? "Genereret ud fra opskrifter og produktpriser."
              : "Genereret ud fra dine valg og supermarkedets produkter."}
          </p>
        </div>

        <Link
          to={ROUTES.shoppingList}
          className="inline-flex h-11 w-full shrink-0 items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 text-sm font-medium text-neutral-800 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-neutral-300 hover:bg-neutral-50 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 sm:w-auto"
        >
          <ShoppingBag className="h-4 w-4" strokeWidth={2} aria-hidden />
          Se indkøbsliste ({shoppingListItems.length})
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        <Badge variant="brand">{criteria.days} dage</Badge>
        <Badge variant="neutral">{criteria.people} personer</Badge>
        <Badge variant="budget">{criteria.store}</Badge>
        {activeDietFilterLabels.map((label) => (
          <Badge key={label} variant={getDietFilterBadgeVariant(label)}>
            {label}
          </Badge>
        ))}
        {criteria.allergies.trim() && (
          <Badge variant="warning">Note: {criteria.allergies}</Badge>
        )}
      </div>

      <BudgetSummaryCard
        plan={plan}
        onMakeCheaper={onMakeCheaper}
        isOptimizing={isOptimizing}
        optimizeMessage={optimizeMessage}
        optimizationSavings={optimizationSavings}
      />

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Måltider i alt"
          value={String(summary.mealCount)}
          hint={`${criteria.days} dage planlagt`}
          icon={<UtensilsCrossed className="h-5 w-5" strokeWidth={2} />}
        />
        <StatCard
          label="Gns. pr. dag"
          value={formatCurrency(summary.averageCostPerDay)}
          hint="Baseret på indkøbsliste"
          icon={<CalendarDays className="h-5 w-5" strokeWidth={2} />}
        />
        <StatCard
          label="Pr. person"
          value={formatCurrency(summary.totalCost)}
          hint="Estimeret total pr. person"
          icon={<User className="h-5 w-5" strokeWidth={2} />}
          className="sm:col-span-2 lg:col-span-1"
        />
      </div>

      {isOptimizing && (
        <div
          className="flex items-center gap-2 rounded-2xl border border-brand-100 bg-brand-50/50 px-4 py-3 text-body-sm text-brand-800"
          role="status"
        >
          <LoadingSpinner />
          Optimerer madplanen — finder billigere alternativer...
        </div>
      )}

      <div>
        <div className="mb-6 space-y-1">
          <h3 className="text-section-title">Ugeoversigt</h3>
          <Text variant="body-sm" className="text-neutral-500">
            Morgenmad, frokost og aftensmad for hver dag
          </Text>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {days.map((dayPlan, dayIndex) => (
            <DayPlanCard
              key={dayPlan.day}
              dayPlan={dayPlan}
              dayIndex={dayIndex}
              people={criteria.people}
              onSwapMeal={onSwapMeal ? openSwapModal : undefined}
            />
          ))}
        </div>
      </div>

      {onSwapMeal && (
        <RecipeSwapModal
          open={swapTarget != null}
          target={swapTarget}
          plan={plan}
          onClose={() => setSwapTarget(null)}
          onSelect={handleSwapSelect}
        />
      )}
    </section>
  );
}
