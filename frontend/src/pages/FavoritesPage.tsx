import { useMemo, useState } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { FavoriteMealCard } from "@/components/favorites/FavoriteMealCard";
import { FavoriteProductCard } from "@/components/favorites/FavoriteProductCard";
import {
  FavoritesTabs,
  type FavoritesTab,
} from "@/components/favorites/FavoritesTabs";
import { Button, EmptyState, StatCard, TogglePill } from "@/components/ui";
import {
  FAVORITE_PRODUCT_CATEGORIES,
  getFavoriteProductPrice,
  mockFavoriteProducts,
  type FavoriteProductCategory,
} from "@/data/mockFavoriteProducts";
import {
  FAVORITE_TAGS,
  mockFavorites,
  type FavoriteTag,
} from "@/data/mockFavorites";
import { formatCurrency } from "@/lib/format";
import type { FavoriteMeal } from "@/types";
import type { FavoriteProduct } from "@/types/favorites";

export function FavoritesPage() {
  const [activeTab, setActiveTab] = useState<FavoritesTab>("all");
  const [recipeTag, setRecipeTag] = useState<FavoriteTag>("Alle");
  const [productCategory, setProductCategory] =
    useState<FavoriteProductCategory>("Alle");
  const [recipes, setRecipes] = useState<FavoriteMeal[]>(() =>
    mockFavorites.map((item) => ({ ...item })),
  );
  const [products, setProducts] = useState<FavoriteProduct[]>(() =>
    mockFavoriteProducts.map((item) => ({ ...item })),
  );

  const filteredRecipes = useMemo(() => {
    if (recipeTag === "Alle") return recipes;
    return recipes.filter((fav) => fav.tags.includes(recipeTag));
  }, [recipes, recipeTag]);

  const filteredProducts = useMemo(() => {
    if (productCategory === "Alle") return products;
    return products.filter((p) => p.category === productCategory);
  }, [products, productCategory]);

  const showRecipes = activeTab === "all" || activeTab === "recipes";
  const showProducts = activeTab === "all" || activeTab === "products";
  const isFullyEmpty = recipes.length === 0 && products.length === 0;

  const avgRecipeCost =
    filteredRecipes.reduce((sum, f) => sum + f.cost, 0) /
    (filteredRecipes.length || 1);
  const avgProductPrice =
    filteredProducts.reduce((sum, p) => sum + getFavoriteProductPrice(p), 0) /
    (filteredProducts.length || 1);

  function removeRecipe(id: string) {
    setRecipes((prev) => prev.filter((r) => r.id !== id));
  }

  function removeProduct(id: string) {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <PageContainer
      title="Favoritter"
      description="Dine gemte opskrifter og produkter — klar til madplan og indkøb."
      actions={
        <Button variant="primary" size="sm">
          + Tilføj favorit
        </Button>
      }
    >
      {isFullyEmpty ? (
        <EmptyState
          icon={<span className="text-2xl">⭐</span>}
          title="Ingen favoritter endnu"
          description="Gem opskrifter fra madplanen eller produkter fra butikken — de vises her til hurtig genbrug."
          action={
            <Button variant="primary" size="sm">
              Udforsk produkter
            </Button>
          }
        />
      ) : (
        <div className="flex flex-col gap-stack-xl">
          <FavoritesTabs
            active={activeTab}
            onChange={setActiveTab}
            recipeCount={recipes.length}
            productCount={products.length}
          />

          <div className="grid gap-stack-lg sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Opskrifter"
              value={String(recipes.length)}
              hint={`${filteredRecipes.length} vist`}
            />
            <StatCard
              label="Produkter"
              value={String(products.length)}
              hint={`${filteredProducts.length} vist`}
            />
            <StatCard
              label="Gns. opskriftspris"
              value={formatCurrency(avgRecipeCost)}
              hint="Per portion"
            />
            <StatCard
              label="Gns. produktpris"
              value={formatCurrency(avgProductPrice)}
              hint="Favoritprodukter"
            />
          </div>

          {showRecipes && (
            <section aria-labelledby="favorite-recipes-heading">
              <div className="mb-stack-md flex flex-col gap-stack-md sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2
                    id="favorite-recipes-heading"
                    className="text-lg font-semibold text-neutral-900"
                  >
                    Favoritopskrifter
                  </h2>
                  <p className="text-body-sm text-neutral-500">
                    Gemte retter du kan tilføje til din madplan
                  </p>
                </div>
              </div>

              {recipes.length > 0 && (
                <div className="mb-stack-lg flex flex-wrap gap-2">
                  {FAVORITE_TAGS.map((tag) => (
                    <TogglePill
                      key={tag}
                      active={recipeTag === tag}
                      onClick={() => setRecipeTag(tag)}
                    >
                      {tag}
                    </TogglePill>
                  ))}
                </div>
              )}

              {recipes.length === 0 ? (
                <EmptyState
                  icon={<span className="text-2xl">🍽️</span>}
                  title="Ingen favoritopskrifter"
                  description="Gem opskrifter fra madplanen for at finde dem hurtigt igen."
                  action={
                    <Button variant="outline" size="sm">
                      Gå til madplan
                    </Button>
                  }
                />
              ) : filteredRecipes.length === 0 ? (
                <EmptyState
                  icon={<span className="text-2xl">🔍</span>}
                  title={`Ingen opskrifter med «${recipeTag}»`}
                  description="Prøv et andet filter eller tilføj flere favoritopskrifter."
                  action={
                    <Button variant="outline" size="sm" onClick={() => setRecipeTag("Alle")}>
                      Vis alle opskrifter
                    </Button>
                  }
                />
              ) : (
                <div className="grid gap-stack-lg sm:grid-cols-2 xl:grid-cols-3">
                  {filteredRecipes.map((meal) => (
                    <FavoriteMealCard
                      key={meal.id}
                      meal={meal}
                      onRemove={removeRecipe}
                    />
                  ))}
                </div>
              )}
            </section>
          )}

          {showProducts && (
            <section aria-labelledby="favorite-products-heading">
              <div className="mb-stack-md">
                <h2
                  id="favorite-products-heading"
                  className="text-lg font-semibold text-neutral-900"
                >
                  Favoritprodukter
                </h2>
                <p className="text-body-sm text-neutral-500">
                  Varer du ofte køber — tilføj dem hurtigt til indkøbslisten
                </p>
              </div>

              {products.length > 0 && (
                <div className="mb-stack-lg flex flex-wrap gap-2">
                  {FAVORITE_PRODUCT_CATEGORIES.map((cat) => (
                    <TogglePill
                      key={cat}
                      active={productCategory === cat}
                      onClick={() => setProductCategory(cat)}
                    >
                      {cat}
                    </TogglePill>
                  ))}
                </div>
              )}

              {products.length === 0 ? (
                <EmptyState
                  icon={<span className="text-2xl">🛒</span>}
                  title="Ingen favoritprodukter"
                  description="Gem produkter fra butikken, så du hurtigt kan finde dem igen."
                  action={
                    <Button variant="outline" size="sm">
                      Gå til produkter
                    </Button>
                  }
                />
              ) : filteredProducts.length === 0 ? (
                <EmptyState
                  icon={<span className="text-2xl">🔍</span>}
                  title={`Ingen produkter i «${productCategory}»`}
                  description="Prøv en anden kategori eller tilføj flere favoritprodukter."
                  action={
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setProductCategory("Alle")}
                    >
                      Vis alle produkter
                    </Button>
                  }
                />
              ) : (
                <div className="grid gap-stack-lg sm:grid-cols-2 xl:grid-cols-3">
                  {filteredProducts.map((product) => (
                    <FavoriteProductCard
                      key={product.id}
                      product={product}
                      onRemove={removeProduct}
                    />
                  ))}
                </div>
              )}
            </section>
          )}
        </div>
      )}
    </PageContainer>
  );
}
