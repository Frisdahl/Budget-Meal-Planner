import { MealCard } from "./MealCard";
import { formatCurrency } from "@/lib/format";
import { getMealsByDay } from "@/data/mockMeals";
import type { DayOfWeek } from "@/types";

type DayColumnProps = {
  day: DayOfWeek;
  isToday?: boolean;
};

export function DayColumn({ day, isToday = false }: DayColumnProps) {
  const meals = getMealsByDay(day);
  const dayCost = meals.reduce((sum, m) => sum + m.cost, 0);

  return (
    <div
      className={`flex flex-col gap-3 rounded-xl border p-4 ${
        isToday
          ? "border-brand-300 bg-brand-50/50"
          : "border-neutral-200 bg-white"
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold capitalize text-neutral-900">
            {day}
          </h3>
          {isToday && (
            <span className="text-caption font-medium text-brand-600">I dag</span>
          )}
        </div>
        <span className="text-caption font-medium text-neutral-500">
          {formatCurrency(dayCost)}
        </span>
      </div>
      <div className="flex flex-col gap-2">
        {meals.length === 0 ? (
          <p className="rounded-md border border-dashed border-neutral-200 bg-neutral-50 px-3 py-4 text-center text-caption">
            Ingen måltider planlagt
          </p>
        ) : (
          meals.map((meal) => (
            <MealCard key={meal.id} meal={meal} compact />
          ))
        )}
      </div>
    </div>
  );
}
