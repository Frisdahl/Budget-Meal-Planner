import { useEffect, useMemo, useState } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { ProductCard } from "@/components/products/ProductCard";
import {
  ProductFilterBar,
  ProductFilters,
  type ProductCategory,
  type SortOption,
} from "@/components/products/ProductFilters";
import { ProductGridSkeleton } from "@/components/products/ProductGridSkeleton";
import { Badge, Button, EmptyState, SearchInput, Text } from "@/components/ui";
import { Pagination } from "@/components/ui/Pagination";
import { useProductFeed } from "@/hooks/useProductFeed";
import { useShoppingList } from "@/hooks/useShoppingList";
import { getErrorMessage } from "@/lib/errors";
import {
  getEffectivePrice,
  PRODUCTS_PAGE_SIZE,
} from "@/lib/products";
import { DEFAULT_FEED_STORE, type FeedStore } from "@/lib/stores";
import { formatCurrency } from "@/lib/format";
import type { Product } from "@/types";

export function ProductsPage() {
  const [feedStore, setFeedStore] = useState<FeedStore>(DEFAULT_FEED_STORE);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<ProductCategory>("Alle");
  const [sort, setSort] = useState<SortOption>("name");
  const [currentPage, setCurrentPage] = useState(1);
  const [toast, setToast] = useState<string | null>(null);
  const { items: shoppingListItems, addProduct, isInList } = useShoppingList();

  const {
    products: feedProducts,
    meta,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useProductFeed(feedStore);

  const hasActiveFilters = search !== "" || category !== "Alle";

  const filteredProducts = useMemo(() => {
    let results = feedProducts.filter((product) => {
      const query = search.toLowerCase();
      const matchesSearch =
        query === "" ||
        product.name.toLowerCase().includes(query) ||
        product.brand.toLowerCase().includes(query) ||
        (product.description?.toLowerCase().includes(query) ?? false);
      const matchesCategory = category === "Alle" || product.category === category;
      return matchesSearch && matchesCategory;
    });

    results = [...results].sort((a, b) => {
      const priceA = getEffectivePrice(a);
      const priceB = getEffectivePrice(b);
      if (sort === "price-asc") return priceA - priceB;
      if (sort === "price-desc") return priceB - priceA;
      return a.name.localeCompare(b.name, "da");
    });

    return results;
  }, [feedProducts, search, category, sort]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PRODUCTS_PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);

  const paginatedProducts = useMemo(() => {
    const start = (safePage - 1) * PRODUCTS_PAGE_SIZE;
    return filteredProducts.slice(start, start + PRODUCTS_PAGE_SIZE);
  }, [filteredProducts, safePage]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2500);
    return () => window.clearTimeout(timer);
  }, [toast]);

  function updateSearch(value: string) {
    setSearch(value);
    setCurrentPage(1);
  }

  function updateCategory(value: ProductCategory) {
    setCategory(value);
    setCurrentPage(1);
  }

  function updateStore(value: FeedStore) {
    setFeedStore(value);
    setCategory("Alle");
    setSearch("");
    setCurrentPage(1);
  }

  function updateSort(value: SortOption) {
    setSort(value);
    setCurrentPage(1);
  }

  function handleAddToShoppingList(product: Product) {
    addProduct(product);
    setToast(`${product.name} tilføjet til indkøbslisten`);
  }

  function handleClearFilters() {
    setSearch("");
    setCategory("Alle");
    setSort("name");
    setCurrentPage(1);
  }

  const onSaleInResults = filteredProducts.filter((p) => p.onSale).length;
  const avgPrice =
    filteredProducts.reduce((sum, p) => sum + getEffectivePrice(p), 0) /
    (filteredProducts.length || 1);

  return (
    <PageContainer
      title="Produkter"
      description="Gennemse populære varer fra danske supermarkeder — sekundær browsing til din madplan."
    >
      {toast && (
        <div
          role="status"
          className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-neutral-900 px-4 py-3 text-sm font-medium text-white shadow-lg"
        >
          {toast}
        </div>
      )}

      <div className="hidden lg:block mb-stack-lg">
        <SearchInput
          placeholder="Søg efter produkt, mærke eller beskrivelse..."
          value={search}
          onChange={(e) => updateSearch(e.target.value)}
          aria-label="Søg produkter"
        />
      </div>

      <ProductFilterBar store={feedStore} onStoreChange={updateStore} />

      <div className="mt-stack-lg grid gap-stack-xl lg:grid-cols-[240px_1fr]">
        <ProductFilters
          products={feedProducts}
          search={search}
          onSearchChange={updateSearch}
          category={category}
          onCategoryChange={updateCategory}
          store={feedStore}
          onStoreChange={updateStore}
          sort={sort}
          onSortChange={updateSort}
          onClearFilters={handleClearFilters}
          hasActiveFilters={hasActiveFilters}
          className="hidden lg:flex"
        />

        <div className="flex min-w-0 flex-col gap-stack-lg">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-neutral-200 bg-white px-4 py-3 shadow-sm">
            <div className="flex flex-wrap items-center gap-2">
              {isLoading ? (
                <Text variant="body-sm" as="span" className="font-medium text-neutral-800">
                  Henter produkter...
                </Text>
              ) : (
                <>
                  <Text variant="body-sm" as="span" className="font-medium text-neutral-800">
                    {filteredProducts.length} produkter
                  </Text>
                  {onSaleInResults > 0 && (
                    <Badge variant="accent">{onSaleInResults} på tilbud</Badge>
                  )}
                  {meta?.cached && (
                    <Badge variant="neutral">Cachet</Badge>
                  )}
                  {isFetching && !isLoading && (
                    <Badge variant="neutral">Opdaterer...</Badge>
                  )}
                </>
              )}
              {shoppingListItems.length > 0 && (
                <Badge variant="brand">{shoppingListItems.length} i indkøbsliste</Badge>
              )}
            </div>
            {!isLoading && filteredProducts.length > 0 && (
              <Text variant="caption" as="span">
                Gns. pris: {formatCurrency(avgPrice)}
              </Text>
            )}
          </div>

          {hasActiveFilters && !isLoading && !isError && (
            <div className="flex flex-wrap items-center gap-2">
              <Text variant="caption" as="span">
                Aktive filtre:
              </Text>
              {search && <Badge variant="neutral">Søg: {search}</Badge>}
              {category !== "Alle" && <Badge variant="brand">{category}</Badge>}
              <button
                type="button"
                onClick={handleClearFilters}
                className="text-caption font-medium text-brand-600 hover:text-brand-700"
              >
                Ryd
              </button>
            </div>
          )}

          {isLoading && <ProductGridSkeleton count={6} />}

          {isError && !isLoading && (
            <EmptyState
              icon={<span className="text-2xl">⚠️</span>}
              title="Kunne ikke hente produkter"
              description={getErrorMessage(error)}
              action={
                <Button variant="primary" size="sm" onClick={() => refetch()}>
                  Prøv igen
                </Button>
              }
            />
          )}

          {!isLoading && !isError && feedProducts.length === 0 && (
            <EmptyState
              icon={<span className="text-2xl">🛒</span>}
              title="Ingen produkter i feedet"
              description={`Der returneredes ingen produkter for ${feedStore}. Prøv en anden butik.`}
              action={
                <Button variant="outline" size="sm" onClick={() => refetch()}>
                  Opdater
                </Button>
              }
            />
          )}

          {!isLoading && !isError && feedProducts.length > 0 && filteredProducts.length === 0 && (
            <EmptyState
              icon={<span className="text-2xl">🔍</span>}
              title="Ingen produkter fundet"
              description="Prøv at ændre din søgning eller kategori."
              action={
                <Button variant="outline" size="sm" onClick={handleClearFilters}>
                  Ryd filtre
                </Button>
              }
            />
          )}

          {!isLoading && !isError && filteredProducts.length > 0 && (
            <>
              <div className="grid gap-stack-lg sm:grid-cols-2 xl:grid-cols-3">
                {paginatedProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    isInShoppingList={isInList(product.id)}
                    onAddToShoppingList={handleAddToShoppingList}
                  />
                ))}
              </div>

              <Pagination
                currentPage={safePage}
                totalPages={totalPages}
                totalItems={filteredProducts.length}
                pageSize={PRODUCTS_PAGE_SIZE}
                onPageChange={setCurrentPage}
                className="mt-stack-md border-t border-neutral-200 pt-stack-lg"
              />
            </>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
