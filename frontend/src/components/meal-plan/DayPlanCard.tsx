import { Card } from "@/components/ui";
import { formatCurrency } from "@/lib/format";
import { MealCard } from "./MealCard";
import type { MealPlanDay } from "@/types/mealPlan";

type DayPlanCardProps = {
  dayPlan: MealPlanDay;
  dayIndex: number;
  people: number;
  onSwapMeal?: (dayIndex: number, mealIndex: number) => void;
  className?: string;
};

export function DayPlanCard({
  dayPlan,
  dayIndex,
  people,
  onSwapMeal,
  className,
}: DayPlanCardProps) {
  const dayTotal = dayPlan.meals.reduce(
    (sum, meal) => sum + meal.cost * people,
    0,
  );

  return (
    <Card
      padding="none"
      interactive
      className={`animate-fade-in overflow-hidden bg-white ${className ?? ""}`}
    >
      <div className="flex items-center justify-between border-b border-neutral-200/80 bg-neutral-50 px-4 py-4 sm:px-5">
        <div>
          <h3 className="text-card-title">{dayPlan.label}</h3>
          <p className="mt-0.5 text-caption text-neutral-500">
            {dayPlan.meals.length} måltider
          </p>
        </div>
        <span className="text-sm font-semibold tabular-nums text-neutral-900">
          {formatCurrency(dayTotal)}
        </span>
      </div>

      <div className="flex flex-col gap-2 bg-neutral-50/40 p-3 sm:gap-3 sm:p-4">
        {dayPlan.meals.length === 0 ? (
          <div className="rounded-xl border border-dashed border-neutral-200 bg-white px-4 py-8 text-center text-caption text-neutral-500">
            Ingen måltider for denne dag
          </div>
        ) : (
          dayPlan.meals.map((meal, mealIndex) => (
            <MealCard
              key={`${dayPlan.day}-${meal.id}-${mealIndex}`}
              meal={meal}
              people={people}
              onSwap={
                onSwapMeal ? () => onSwapMeal(dayIndex, mealIndex) : undefined
              }
            />
          ))
        )}
      </div>
    </Card>
  );
}
