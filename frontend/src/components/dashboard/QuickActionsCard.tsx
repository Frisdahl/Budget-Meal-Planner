import { Link } from "react-router-dom";
import { Badge, Card, CardHeader, CardTitle, Text } from "@/components/ui";
import { mockFavorites } from "@/data/mockFavorites";
import { formatCurrency } from "@/lib/format";
import { ROUTES } from "@/routes/paths";

export function QuickActionsCard() {
  const actions = [
    { label: "Madplan", path: ROUTES.mealPlan, description: "Se ugens plan" },
    { label: "Produkter", path: ROUTES.products, description: "Søg varer" },
    { label: "Favoritter", path: ROUTES.favorites, description: "Gemte retter" },
  ];

  return (
    <Card padding="none">
      <CardHeader className="px-5 pt-5">
        <CardTitle>Hurtige links</CardTitle>
      </CardHeader>
      <ul className="divide-y divide-neutral-100">
        {actions.map((action) => (
          <li key={action.path}>
            <Link
              to={action.path}
              className="flex items-center justify-between px-5 py-3 transition-colors hover:bg-neutral-50"
            >
              <div>
                <p className="text-sm font-medium text-neutral-900">{action.label}</p>
                <Text variant="caption" as="span">{action.description}</Text>
              </div>
              <span className="text-neutral-400" aria-hidden="true">→</span>
            </Link>
          </li>
        ))}
      </ul>
    </Card>
  );
}

export function FavoritesPreviewCard() {
  const topFavorites = [...mockFavorites]
    .sort((a, b) => b.timesUsed - a.timesUsed)
    .slice(0, 3);

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Populære favoritter</CardTitle>
        <Link
          to={ROUTES.favorites}
          className="text-sm font-medium text-brand-600 hover:text-brand-700"
        >
          Se alle
        </Link>
      </CardHeader>
      <ul className="flex flex-col gap-3">
        {topFavorites.map((fav) => (
          <li
            key={fav.id}
            className="flex items-center justify-between gap-3 rounded-md bg-neutral-50 px-3 py-2"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-neutral-900">
                {fav.name}
              </p>
              <Text variant="caption" as="span">
                Brugt {fav.timesUsed} gange
              </Text>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Badge variant="brand">{formatCurrency(fav.cost)}</Badge>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}
