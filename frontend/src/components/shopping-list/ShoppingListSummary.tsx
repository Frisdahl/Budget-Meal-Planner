import {
  Badge,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  ProgressBar,
  StatCard,
} from "@/components/ui";
import { getLineSavings, getLineTotal } from "@/lib/shoppingList";
import { formatCurrency } from "@/lib/format";
import type { ShoppingItem } from "@/types";

type ShoppingListSummaryProps = {
  items: ShoppingItem[];
};

export function ShoppingListSummary({ items }: ShoppingListSummaryProps) {
  const checkedCount = items.filter((i) => i.checked).length;
  const totalCount = items.length;
  const totalPrice = items.reduce((sum, i) => sum + getLineTotal(i), 0);
  const totalSavings = items.reduce((sum, i) => sum + getLineSavings(i), 0);
  const originalTotal = totalPrice + totalSavings;
  const remainingPrice = items
    .filter((i) => !i.checked)
    .reduce((sum, i) => sum + getLineTotal(i), 0);
  const remainingSavings = items
    .filter((i) => !i.checked)
    .reduce((sum, i) => sum + getLineSavings(i), 0);

  return (
    <>
      <div className="grid gap-stack-lg sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Varer i alt"
          value={String(totalCount)}
          hint={`${checkedCount} købt · ${totalCount - checkedCount} tilbage`}
        />
        <StatCard
          label="Total pris"
          value={formatCurrency(totalPrice)}
          hint={totalCount > 0 ? `${totalCount} varer` : "Listen er tom"}
        />
        <StatCard
          label="Estimeret besparelse"
          value={formatCurrency(totalSavings)}
          hint={
            totalSavings > 0
              ? `Mod normalpris ${formatCurrency(originalTotal)}`
              : "Ingen tilbud i listen"
          }
        />
        <StatCard
          label="Mangler at købe"
          value={formatCurrency(remainingPrice)}
          hint={
            remainingSavings > 0
              ? `Spar ${formatCurrency(remainingSavings)} på resten`
              : "Ikke-afkrydsede varer"
          }
        />
      </div>

      {totalCount > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Indkøbsfremskridt</CardTitle>
            <CardDescription>
              {checkedCount} af {totalCount} varer er købt
            </CardDescription>
          </CardHeader>
          <ProgressBar value={checkedCount} max={totalCount} variant="brand" />
          <div className="mt-4 flex flex-wrap items-center gap-3">
            {totalSavings > 0 && (
              <Badge variant="accent">
                Du sparer {formatCurrency(totalSavings)} på tilbud
              </Badge>
            )}
            <Badge variant="brand">
              Total: {formatCurrency(totalPrice)}
            </Badge>
          </div>
        </Card>
      )}
    </>
  );
}
