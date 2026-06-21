import { Link } from "react-router-dom";
import { cn } from "@/lib/cn";
import {
  Badge,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  ProgressBar,
  StatCard,
} from "@/components/ui";
import { MealCard } from "./MealCard";
import { formatCurrency } from "@/lib/format";
import { ROUTES } from "@/routes/paths";
import type { GeneratedMealPlanResult } from "@/types/mealPlan";

type GeneratedMealPlanProps = {
  plan: GeneratedMealPlanResult;
};

export function GeneratedMealPlan({ plan }: GeneratedMealPlanProps) {
  const { criteria, days, summary, shoppingListItems, source } = plan;
  const selectedPreferenceLabels = criteria.dietaryPreferences.length > 0;

  return (
    <section className="flex flex-col gap-stack-xl" aria-label="Genereret madplan">
      <div className="flex flex-col gap-stack-md sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-neutral-900">Din madplan</h2>
          <p className="mt-1 text-body-sm text-neutral-500">
            {source === "placeholder"
              ? "Placeholder-data — algoritme og AI tilføjes i et senere trin."
              : "Genereret ud fra dine valg og supermarkedets produkter."}
          </p>
        </div>

        <Link
          to={ROUTES.shoppingList}
          className={cn(
            "inline-flex h-8 shrink-0 items-center justify-center rounded-md border border-neutral-300",
            "bg-white px-3 text-sm font-medium text-neutral-800 transition-colors",
            "hover:bg-neutral-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500",
          )}
        >
          Se indkøbsliste ({shoppingListItems.length})
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        <Badge variant="brand">{criteria.days} dage</Badge>
        <Badge variant="neutral">{criteria.people} personer</Badge>
        <Badge variant="neutral">{criteria.store}</Badge>
        <Badge variant={summary.underBudget ? "success" : "warning"}>
          {summary.underBudget ? "Inden for budget" : "Over budget"}
        </Badge>
        {selectedPreferenceLabels &&
          criteria.dietaryPreferences.map((pref) => (
            <Badge key={pref} variant="neutral">
              {pref}
            </Badge>
          ))}
        {criteria.allergies.trim() && (
          <Badge variant="warning">Undgår: {criteria.allergies}</Badge>
        )}
      </div>

      <div className="grid gap-stack-lg sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Estimeret omkostning"
          value={formatCurrency(summary.scaledCost)}
          hint={`For ${criteria.people} person${criteria.people !== 1 ? "er" : ""}`}
        />
        <StatCard
          label="Budget"
          value={formatCurrency(criteria.budget)}
          hint={`${summary.budgetUsedPercent}% brugt`}
        />
        <StatCard
          label="Måltider"
          value={String(summary.mealCount)}
          hint={`${criteria.days} dage planlagt`}
        />
        <StatCard
          label="Gns. pr. dag"
          value={formatCurrency(summary.averageCostPerDay)}
          hint="Inkl. alle måltider"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Budgetforbrug</CardTitle>
          <CardDescription>
            Estimeret total for {criteria.people} person
            {criteria.people !== 1 ? "er" : ""} over {criteria.days} dage hos{" "}
            {criteria.store}
          </CardDescription>
        </CardHeader>
        <ProgressBar
          value={summary.scaledCost}
          max={criteria.budget}
          variant={summary.underBudget ? "brand" : "accent"}
        />
        <p className="mt-2 text-caption">
          {summary.underBudget
            ? `${formatCurrency(criteria.budget - summary.scaledCost)} tilbage i budget`
            : `${formatCurrency(summary.scaledCost - criteria.budget)} over budget`}
        </p>
      </Card>

      <div className="flex flex-col gap-stack-xl">
        {days.map(({ day, label, meals }) => (
          <div key={day}>
            <div className="mb-stack-md flex items-center justify-between">
              <h3 className="text-lg font-semibold text-neutral-900">{label}</h3>
              <span className="text-caption font-medium text-neutral-500">
                {meals.length} måltider ·{" "}
                {formatCurrency(
                  meals.reduce((sum, meal) => sum + meal.cost, 0) * criteria.people,
                )}
              </span>
            </div>

            {meals.length === 0 ? (
              <div className="rounded-lg border border-dashed border-neutral-300 bg-neutral-50 px-4 py-8 text-center text-caption">
                Ingen måltider for denne dag
              </div>
            ) : (
              <div className="grid gap-stack-md sm:grid-cols-2 lg:grid-cols-3">
                {meals.map((meal) => (
                  <MealCard key={meal.id} meal={meal} />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
