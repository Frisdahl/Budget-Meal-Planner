import { Link } from "react-router-dom";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  ProgressBar,
  Text,
} from "@/components/ui";
import { mockBudget } from "@/data/mockBudget";
import { formatCurrency } from "@/lib/format";
import { ROUTES } from "@/routes/paths";

export function BudgetOverviewCard() {
  const { weeklyBudget, spent, remaining } = mockBudget;
  const isOverBudget = remaining < 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ugebudget</CardTitle>
        <CardDescription>
          Uge 25 · 16.–22. juni 2026
        </CardDescription>
      </CardHeader>
      <div className="flex flex-col gap-stack-lg">
        <div className="flex items-end justify-between gap-4">
          <div>
            <Text variant="caption" as="span" className="block">
              Forbrugt
            </Text>
            <p className="text-3xl font-semibold text-neutral-900">
              {formatCurrency(spent)}
            </p>
          </div>
          <div className="text-right">
            <Text variant="caption" as="span" className="block">
              {isOverBudget ? "Over budget" : "Tilbage"}
            </Text>
            <p
              className={`text-xl font-semibold ${isOverBudget ? "text-error" : "text-brand-600"}`}
            >
              {formatCurrency(Math.abs(remaining))}
            </p>
          </div>
        </div>
        <ProgressBar
          value={spent}
          max={weeklyBudget}
          label={`Budget: ${formatCurrency(weeklyBudget)}`}
          variant={spent / weeklyBudget > 0.85 ? "accent" : "brand"}
        />
        <Link
          to={ROUTES.mealPlan}
          className="text-sm font-medium text-brand-600 hover:text-brand-700"
        >
          Se madplan →
        </Link>
      </div>
    </Card>
  );
}
