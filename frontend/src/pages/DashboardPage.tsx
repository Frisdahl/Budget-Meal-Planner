import { PageContainer } from "@/components/layout/PageContainer";
import {
  BudgetOverviewCard,
  FavoritesPreviewCard,
  QuickActionsCard,
  ShoppingSummaryCard,
  TodaysMealsCard,
} from "@/components/dashboard";
import { StatCard } from "@/components/ui";
import { mockBudget } from "@/data/mockBudget";
import { getTotalWeeklyCost } from "@/data/mockMeals";
import { mockShoppingList } from "@/data/mockShoppingList";
import { formatCurrency } from "@/lib/format";

function WalletIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
      <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
      <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
      <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
      <circle cx="8" cy="21" r="1" />
      <circle cx="19" cy="21" r="1" />
      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
      <line x1="12" x2="12" y1="20" y2="10" />
      <line x1="18" x2="18" y1="20" y2="4" />
      <line x1="6" x2="6" y1="20" y2="16" />
    </svg>
  );
}

export function DashboardPage() {
  const weeklyMealCost = getTotalWeeklyCost();
  const uncheckedItems = mockShoppingList.filter((i) => !i.checked).length;

  return (
    <PageContainer
      title="Dashboard"
      description="Overblik over dit budget, madplan og indkøb for ugen."
    >
      <div className="grid gap-stack-lg sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Ugebudget"
          value={formatCurrency(mockBudget.weeklyBudget)}
          hint="Sat for uge 25"
          icon={<WalletIcon />}
        />
        <StatCard
          label="Madplan omkostning"
          value={formatCurrency(weeklyMealCost)}
          trend={{
            value: `${Math.round((weeklyMealCost / mockBudget.weeklyBudget) * 100)}% af budget`,
            positive: weeklyMealCost <= mockBudget.weeklyBudget,
          }}
          icon={<ChartIcon />}
        />
        <StatCard
          label="Måltider planlagt"
          value={`${mockBudget.mealsPlanned}/${mockBudget.totalMeals}`}
          hint="3 måltider × 7 dage"
          icon={<CalendarIcon />}
        />
        <StatCard
          label="Indkøb mangler"
          value={`${uncheckedItems} varer`}
          hint={`${mockShoppingList.length} varer i alt`}
          icon={<CartIcon />}
        />
      </div>

      <div className="mt-stack-xl grid gap-stack-lg lg:grid-cols-3">
        <div className="lg:col-span-2 flex flex-col gap-stack-lg">
          <BudgetOverviewCard />
          <TodaysMealsCard />
        </div>
        <div className="flex flex-col gap-stack-lg">
          <ShoppingSummaryCard />
          <QuickActionsCard />
          <FavoritesPreviewCard />
        </div>
      </div>
    </PageContainer>
  );
}
