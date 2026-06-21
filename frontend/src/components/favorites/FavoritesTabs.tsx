import { cn } from "@/lib/cn";

export type FavoritesTab = "all" | "recipes" | "products";

type FavoritesTabsProps = {
  active: FavoritesTab;
  onChange: (tab: FavoritesTab) => void;
  recipeCount: number;
  productCount: number;
};

const tabs: { id: FavoritesTab; label: string }[] = [
  { id: "all", label: "Alle" },
  { id: "recipes", label: "Opskrifter" },
  { id: "products", label: "Produkter" },
];

export function FavoritesTabs({
  active,
  onChange,
  recipeCount,
  productCount,
}: FavoritesTabsProps) {
  const counts: Record<FavoritesTab, number> = {
    all: recipeCount + productCount,
    recipes: recipeCount,
    products: productCount,
  };

  return (
    <div
      role="tablist"
      aria-label="Favorittyper"
      className="inline-flex w-full rounded-lg border border-neutral-200 bg-neutral-100 p-1 sm:w-auto"
    >
      {tabs.map(({ id, label }) => (
        <button
          key={id}
          type="button"
          role="tab"
          aria-selected={active === id}
          onClick={() => onChange(id)}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors sm:flex-initial",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500",
            active === id
              ? "bg-white text-neutral-900 shadow-sm"
              : "text-neutral-600 hover:text-neutral-900",
          )}
        >
          {label}
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-xs",
              active === id ? "bg-brand-50 text-brand-700" : "bg-neutral-200 text-neutral-600",
            )}
          >
            {counts[id]}
          </span>
        </button>
      ))}
    </div>
  );
}
