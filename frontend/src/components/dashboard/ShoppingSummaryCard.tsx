import { Link } from "react-router-dom";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  ProgressBar,
  Text,
} from "@/components/ui";
import { mockShoppingList } from "@/data/mockShoppingList";
import { getLineTotal } from "@/lib/shoppingList";
import { formatCurrency } from "@/lib/format";
import { ROUTES } from "@/routes/paths";

export function ShoppingSummaryCard() {
  const checked = mockShoppingList.filter((i) => i.checked).length;
  const total = mockShoppingList.length;
  const totalCost = mockShoppingList.reduce((sum, i) => sum + getLineTotal(i), 0);
  const uncheckedCost = mockShoppingList
    .filter((i) => !i.checked)
    .reduce((sum, i) => sum + getLineTotal(i), 0);

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <div>
          <CardTitle>Indkøbsliste</CardTitle>
          <CardDescription>
            {checked} af {total} varer købt
          </CardDescription>
        </div>
        <Link
          to={ROUTES.shoppingList}
          className="text-sm font-medium text-brand-600 hover:text-brand-700"
        >
          Se liste
        </Link>
      </CardHeader>
      <div className="flex flex-col gap-stack-md">
        <ProgressBar
          value={checked}
          max={total}
          label="Fremskridt"
          variant="brand"
        />
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Text variant="caption" as="span" className="block">
              Estimeret total
            </Text>
            <p className="text-lg font-semibold text-neutral-900">
              {formatCurrency(totalCost)}
            </p>
          </div>
          <div>
            <Text variant="caption" as="span" className="block">
              Mangler at købe
            </Text>
            <p className="text-lg font-semibold text-accent-600">
              {formatCurrency(uncheckedCost)}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
