import { cn } from "@/lib/cn";
import { getCategoryCounts, getUniqueCategories } from "@/lib/products";
import { FEED_STORES, type FeedStore } from "@/lib/stores";
import { SearchInput } from "@/components/ui/Input";
import { Text } from "@/components/ui/Typography";
import type { Product } from "@/types";

export type SortOption = "name" | "price-asc" | "price-desc";
export type ProductCategory = "Alle" | string;

type ProductFiltersProps = {
  products: Product[];
  search: string;
  onSearchChange: (value: string) => void;
  category: ProductCategory;
  onCategoryChange: (category: ProductCategory) => void;
  store: FeedStore;
  onStoreChange: (store: FeedStore) => void;
  sort: SortOption;
  onSortChange: (sort: SortOption) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
  className?: string;
};

function FilterSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold text-neutral-900">{title}</h3>
      {children}
    </div>
  );
}

function FilterPill({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count?: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-brand-50 text-brand-700 ring-1 ring-brand-200"
          : "text-neutral-700 hover:bg-neutral-50",
      )}
    >
      <span>{label}</span>
      {count != null && (
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-xs",
            active ? "bg-brand-100 text-brand-700" : "bg-neutral-100 text-neutral-500",
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
}

export function ProductFilters({
  products,
  search,
  onSearchChange,
  category,
  onCategoryChange,
  store,
  onStoreChange,
  sort,
  onSortChange,
  onClearFilters,
  hasActiveFilters,
  className,
}: ProductFiltersProps) {
  const categoryCounts = getCategoryCounts(products);
  const categories: ProductCategory[] = ["Alle", ...getUniqueCategories(products)];

  return (
    <aside className={cn("flex flex-col gap-stack-lg", className)}>
      <div className="lg:hidden">
        <SearchInput
          placeholder="Søg produkt, mærke..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label="Søg produkter"
        />
      </div>

      <div className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
        <FilterSection title="Butik">
          <div className="flex flex-col gap-0.5">
            {FEED_STORES.map((s) => (
              <FilterPill
                key={s}
                label={s}
                active={store === s}
                onClick={() => onStoreChange(s)}
              />
            ))}
          </div>
          <Text variant="caption" className="mt-2">
            Henter populære produkter fra den valgte butik.
          </Text>
        </FilterSection>
      </div>

      <div className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
        <FilterSection title="Kategori">
          <div className="flex flex-col gap-0.5">
            {categories.map((cat) => (
              <FilterPill
                key={cat}
                label={cat}
                count={categoryCounts[cat]}
                active={category === cat}
                onClick={() => onCategoryChange(cat)}
              />
            ))}
          </div>
        </FilterSection>
      </div>

      <div className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
        <FilterSection title="Sortér">
          <select
            id="product-sort"
            value={sort}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          >
            <option value="name">Navn A–Å</option>
            <option value="price-asc">Pris: lav → høj</option>
            <option value="price-desc">Pris: høj → lav</option>
          </select>
        </FilterSection>
      </div>

      {hasActiveFilters && (
        <button
          type="button"
          onClick={onClearFilters}
          className="text-sm font-medium text-brand-600 hover:text-brand-700"
        >
          Ryd filtre
        </button>
      )}

      <Text variant="caption" className="hidden lg:block">
        Live produktfeed fra Salling Group. Søgning og kategorier filtreres lokalt.
      </Text>
    </aside>
  );
}

export function ProductFilterBar({
  store,
  onStoreChange,
}: Pick<ProductFiltersProps, "store" | "onStoreChange">) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 lg:hidden">
      {FEED_STORES.map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onStoreChange(s)}
          className={cn(
            "shrink-0 rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
            store === s
              ? "bg-brand-600 text-white"
              : "bg-neutral-100 text-neutral-700",
          )}
        >
          {s}
        </button>
      ))}
    </div>
  );
}
