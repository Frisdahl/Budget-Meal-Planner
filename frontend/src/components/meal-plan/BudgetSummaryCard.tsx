import { cn } from "@/lib/cn";
import { Badge, Button, Card, ProgressBar, Text } from "@/components/ui";
import { formatCurrency } from "@/lib/format";
import { OVER_BUDGET_MESSAGE } from "@/lib/recipePlan";
import {
  PiggyBank,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { LoadingSpinner } from "./LoadingSpinner";
import type { GeneratedMealPlanResult } from "@/types/mealPlan";

type BudgetStatus = "under" | "near" | "over";

type BudgetSummaryCardProps = {
  plan: GeneratedMealPlanResult;
  onMakeCheaper?: () => void;
  isOptimizing?: boolean;
  optimizeMessage?: string | null;
  optimizationSavings?: number | null;
};

function getBudgetStatus(scaledCost: number, budget: number): BudgetStatus {
  if (scaledCost > budget) return "over";
  if (scaledCost >= budget * 0.85) return "near";
  return "under";
}

const STATUS_CONFIG: Record<
  BudgetStatus,
  {
    label: string;
    badgeVariant: "success" | "warning" | "brand";
    progressVariant: "brand" | "accent" | "neutral";
    shellClass: string;
  }
> = {
  under: {
    label: "Under budget",
    badgeVariant: "success",
    progressVariant: "brand",
    shellClass: "border-brand-200/80 bg-gradient-to-br from-white to-brand-50/30",
  },
  near: {
    label: "Tæt på budget",
    badgeVariant: "brand",
    progressVariant: "brand",
    shellClass: "border-brand-200 bg-gradient-to-br from-white to-brand-50/50",
  },
  over: {
    label: "Over budget",
    badgeVariant: "warning",
    progressVariant: "accent",
    shellClass: "border-accent-200/80 bg-gradient-to-br from-white to-accent-50/30",
  },
};

export function BudgetSummaryCard({
  plan,
  onMakeCheaper,
  isOptimizing = false,
  optimizeMessage,
  optimizationSavings,
}: BudgetSummaryCardProps) {
  const { criteria, summary } = plan;
  const status = getBudgetStatus(summary.scaledCost, criteria.budget);
  const config = STATUS_CONFIG[status];
  const difference = summary.scaledCost - criteria.budget;
  const remaining = criteria.budget - summary.scaledCost;
  const isOver = difference > 0;

  return (
    <Card
      padding="none"
      className={cn("animate-fade-in overflow-hidden border", config.shellClass)}
    >
      <div className="flex flex-col gap-6 p-5 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <div className="mb-3 flex items-center gap-2 text-neutral-500">
              <Wallet className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
              <p className="text-caption font-medium uppercase tracking-wide">
                Budgetstatus
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-4xl font-bold tracking-tight text-neutral-900 sm:text-[2.5rem]">
                {formatCurrency(summary.scaledCost)}
              </p>
              <Badge variant={config.badgeVariant}>{config.label}</Badge>
            </div>
            <p className="mt-2 text-caption text-neutral-500">
              af {formatCurrency(criteria.budget)} budget ·{" "}
              {summary.budgetUsedPercent}% brugt
            </p>
          </div>

          <div className="grid min-w-[14rem] gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-xl border border-neutral-200/80 bg-white/80 px-4 py-3">
              <p className="text-caption text-neutral-500">Budget</p>
              <p className="mt-1 text-lg font-semibold tabular-nums text-neutral-900">
                {formatCurrency(criteria.budget)}
              </p>
            </div>
            <div className="rounded-xl border border-neutral-200/80 bg-white/80 px-4 py-3">
              <p className="text-caption text-neutral-500">Estimeret pris</p>
              <p className="mt-1 text-lg font-semibold tabular-nums text-neutral-900">
                {formatCurrency(summary.scaledCost)}
              </p>
            </div>
            <div className="rounded-xl border border-neutral-200/80 bg-white/80 px-4 py-3 sm:col-span-2 lg:col-span-1">
              <p className="text-caption text-neutral-500">Difference</p>
              <p
                className={cn(
                  "mt-1 flex items-center gap-1.5 text-lg font-semibold tabular-nums",
                  isOver ? "text-accent-700" : "text-brand-700",
                )}
              >
                {isOver ? (
                  <TrendingUp className="h-4 w-4 shrink-0" aria-hidden />
                ) : (
                  <TrendingDown className="h-4 w-4 shrink-0" aria-hidden />
                )}
                {isOver
                  ? `${formatCurrency(difference)} over`
                  : `${formatCurrency(Math.abs(difference))} under`}
              </p>
            </div>
            {optimizationSavings != null && optimizationSavings > 0 && (
              <div className="rounded-xl border border-brand-200/80 bg-brand-50/60 px-4 py-3 sm:col-span-2 lg:col-span-1">
                <p className="flex items-center gap-1.5 text-caption text-brand-700">
                  <PiggyBank className="h-3.5 w-3.5" aria-hidden />
                  Sparet beløb
                </p>
                <p className="mt-1 text-lg font-semibold tabular-nums text-brand-800">
                  {formatCurrency(optimizationSavings)}
                </p>
              </div>
            )}
          </div>
        </div>

        <ProgressBar
          value={summary.scaledCost}
          max={criteria.budget}
          variant={config.progressVariant}
          size="lg"
          label={`${formatCurrency(summary.scaledCost)} / ${formatCurrency(criteria.budget)}`}
        />

        {status === "under" && remaining > 0 && (
          <p className="text-body-sm text-brand-800">
            {formatCurrency(remaining)} tilbage i budget
          </p>
        )}

        {status === "over" && (
          <Text variant="body-sm" className="text-accent-800">
            {summary.budgetNotice ?? OVER_BUDGET_MESSAGE}
          </Text>
        )}

        {!summary.underBudget && onMakeCheaper && (
          <div className="flex flex-col gap-3 border-t border-neutral-200/80 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={onMakeCheaper}
              disabled={isOptimizing}
              className="w-full sm:w-auto"
            >
              {isOptimizing && <LoadingSpinner />}
              {isOptimizing ? "Optimerer..." : "Gør billigere"}
            </Button>
            {optimizeMessage && (
              <Text variant="body-sm" className="text-neutral-600">
                {optimizeMessage}
              </Text>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
