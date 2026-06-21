import { Link } from "react-router-dom";
import {
  Badge,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  MealIcon,
  Text,
} from "@/components/ui";
import { mockMeals } from "@/data/mockMeals";
import { MEAL_TYPE_LABELS } from "@/data/mockMeals";
import { formatCurrency } from "@/lib/format";
import { ROUTES } from "@/routes/paths";

const todayMeals = mockMeals.filter((m) => m.day === "mandag");

export function TodaysMealsCard() {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <div>
          <CardTitle>Dagens måltider</CardTitle>
          <CardDescription>Mandag · 3 måltider planlagt</CardDescription>
        </div>
        <Link
          to={ROUTES.mealPlan}
          className="text-sm font-medium text-brand-600 hover:text-brand-700"
        >
          Se uge
        </Link>
      </CardHeader>
      <ul className="flex flex-col divide-y divide-neutral-100">
        {todayMeals.map((meal) => (
          <li key={meal.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
            <MealIcon type={meal.type} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-neutral-900">
                {meal.name}
              </p>
              <Text variant="caption" as="span">
                {MEAL_TYPE_LABELS[meal.type]} · {meal.prepTimeMinutes} min
              </Text>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1">
              <span className="text-sm font-medium text-neutral-700">
                {formatCurrency(meal.cost)}
              </span>
              {meal.tags[0] && (
                <Badge variant="neutral">{meal.tags[0]}</Badge>
              )}
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}
