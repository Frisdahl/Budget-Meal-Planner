import {
  getLocalRecipes,
  registerExternalRecipes,
  clearExternalRecipes,
  type Recipe,
  type RecipeMealType,
} from "@/data/recipes";
import {
  filterRecipesForCriteria,
  getRecipesByMealTypeFromPool,
} from "@/lib/recipeFilter";
import type { MealPlanCriteria } from "@/types/mealPlan";
import { fetchSpoonacularRecipesByMealType } from "./spoonacularService";
import { filterUsableRecipes } from "./recipeUsability";

const FULL_DAY_MEAL_TYPES = ["breakfast", "lunch", "dinner"] as const;
type DayMealType = (typeof FULL_DAY_MEAL_TYPES)[number];

const POOL_LIMITS: Record<DayMealType, number> = {
  breakfast: 12,
  lunch: 12,
  dinner: 16,
};

function isTightBudget(criteria: MealPlanCriteria): boolean {
  const mealSlots = criteria.days * FULL_DAY_MEAL_TYPES.length;
  return criteria.budget / mealSlots < 45;
}

function rankRecipeForPool(recipe: Recipe, tightBudget: boolean): number {
  let score = 0;

  if (recipe.image) score += 100;
  score -= recipe.ingredients.length * 3;

  if (!recipe.id.startsWith("spoonacular-")) {
    score += 15;
  }

  if (recipe.tags.some((tag) => /billig|budget|cheap/i.test(tag))) {
    score += 25;
  }

  if (tightBudget) {
    if (!recipe.id.startsWith("spoonacular-")) score += 50;
    if (recipe.tags.some((tag) => /billig|budget|cheap/i.test(tag))) score += 35;
  }

  return score;
}

function trimAndRankRecipes(
  recipes: Recipe[],
  criteria: MealPlanCriteria,
  limit: number,
): { recipes: Recipe[]; spoonacular: number; local: number } {
  const ranked = [...recipes].sort(
    (a, b) =>
      rankRecipeForPool(b, isTightBudget(criteria)) -
      rankRecipeForPool(a, isTightBudget(criteria)),
  );
  const trimmed = ranked.slice(0, limit);
  const spoonacular = trimmed.filter((recipe) =>
    recipe.id.startsWith("spoonacular-"),
  ).length;

  return {
    recipes: trimmed,
    spoonacular,
    local: trimmed.length - spoonacular,
  };
}

export type MealTypePoolBreakdown = {
  spoonacular: number;
  local: number;
  total: number;
};

export type RecipePoolDiagnostics = {
  breakfast: MealTypePoolBreakdown;
  lunch: MealTypePoolBreakdown;
  dinner: MealTypePoolBreakdown;
  repeatedRecipesAllowed: boolean;
  source: "spoonacular" | "local";
};

export type RecipePoolResult = {
  pool: Recipe[];
  diagnostics: RecipePoolDiagnostics;
};

function logRecipePool(diagnostics: RecipePoolDiagnostics): void {
  console.log("[Recipe pool]", diagnostics);
}

function buildLocalPoolForCriteria(criteria: MealPlanCriteria): Recipe[] {
  return filterRecipesForCriteria(getLocalRecipes(), criteria);
}

function fillMealTypePool(
  spoonacularRecipes: Recipe[],
  mealType: RecipeMealType,
  criteria: MealPlanCriteria,
  limit: number,
): { recipes: Recipe[]; breakdown: MealTypePoolBreakdown } {
  const usableSpoonacular = filterUsableRecipes(
    filterRecipesForCriteria(spoonacularRecipes, criteria),
  );
  const byId = new Map<string, Recipe>();

  for (const recipe of usableSpoonacular) {
    byId.set(recipe.id, recipe);
  }

  const localCandidates = getRecipesByMealTypeFromPool(
    mealType,
    buildLocalPoolForCriteria(criteria),
  );

  for (const recipe of localCandidates) {
    if (!byId.has(recipe.id)) {
      byId.set(recipe.id, recipe);
    }
  }

  const { recipes, spoonacular, local } = trimAndRankRecipes(
    [...byId.values()],
    criteria,
    limit,
  );

  return {
    recipes,
    breakdown: {
      spoonacular,
      local,
      total: recipes.length,
    },
  };
}

function canAvoidRepeats(pool: Recipe[], days: number, mealType: DayMealType): boolean {
  const typeCount = getRecipesByMealTypeFromPool(mealType, pool).length;
  return typeCount >= days;
}

function buildDiagnostics(
  breakdowns: Record<DayMealType, MealTypePoolBreakdown>,
  pool: Recipe[],
  criteria: MealPlanCriteria,
  hasSpoonacular: boolean,
): RecipePoolDiagnostics {
  const repeatedRecipesAllowed = !FULL_DAY_MEAL_TYPES.every((mealType) =>
    canAvoidRepeats(pool, criteria.days, mealType),
  );

  return {
    breakfast: breakdowns.breakfast,
    lunch: breakdowns.lunch,
    dinner: breakdowns.dinner,
    repeatedRecipesAllowed,
    source: hasSpoonacular ? "spoonacular" : "local",
  };
}

function buildLocalFallbackResult(criteria: MealPlanCriteria): RecipePoolResult {
  const localPool = buildLocalPoolForCriteria(criteria);
  const poolByType: Recipe[] = [];
  const breakdowns: Record<DayMealType, MealTypePoolBreakdown> = {
    breakfast: { spoonacular: 0, local: 0, total: 0 },
    lunch: { spoonacular: 0, local: 0, total: 0 },
    dinner: { spoonacular: 0, local: 0, total: 0 },
  };

  for (const mealType of FULL_DAY_MEAL_TYPES) {
    const candidates = getRecipesByMealTypeFromPool(mealType, localPool);
    const { recipes, spoonacular, local } = trimAndRankRecipes(
      candidates,
      criteria,
      POOL_LIMITS[mealType],
    );
    breakdowns[mealType] = { spoonacular, local, total: recipes.length };
    poolByType.push(...recipes);
  }

  const byId = new Map<string, Recipe>();
  for (const recipe of poolByType) {
    byId.set(recipe.id, recipe);
  }
  const pool = [...byId.values()];
  const diagnostics = buildDiagnostics(
    breakdowns,
    pool,
    criteria,
    false,
  );
  logRecipePool(diagnostics);
  return { pool, diagnostics };
}

/**
 * Fetches Spoonacular recipes once per meal type, fills gaps from local data
 * per meal type, and registers external recipes for lookup during the session.
 */
export async function resolveRecipePoolForGeneration(
  criteria: MealPlanCriteria,
): Promise<RecipePoolResult> {
  clearExternalRecipes();

  try {
    const fetched = await fetchSpoonacularRecipesByMealType(criteria);
    const breakdowns: Record<DayMealType, MealTypePoolBreakdown> = {
      breakfast: { spoonacular: 0, local: 0, total: 0 },
      lunch: { spoonacular: 0, local: 0, total: 0 },
      dinner: { spoonacular: 0, local: 0, total: 0 },
    };
    const poolByType: Recipe[] = [];

    for (const mealType of FULL_DAY_MEAL_TYPES) {
      const spoonacularForType =
        mealType === "breakfast"
          ? fetched.breakfast
          : mealType === "lunch"
            ? fetched.lunch
            : fetched.dinner;

      const { recipes, breakdown } = fillMealTypePool(
        spoonacularForType,
        mealType,
        criteria,
        POOL_LIMITS[mealType],
      );
      breakdowns[mealType] = breakdown;
      poolByType.push(...recipes);
    }

    const byId = new Map<string, Recipe>();
    for (const recipe of poolByType) {
      byId.set(recipe.id, recipe);
    }
    const pool = [...byId.values()];

    const hasSpoonacular = pool.some((recipe) =>
      recipe.id.startsWith("spoonacular-"),
    );

    if (pool.length === 0) {
      console.warn("[recipes] Spoonacular unavailable, using local recipes");
      return buildLocalFallbackResult(criteria);
    }

    registerExternalRecipes(
      pool.filter((recipe) => recipe.id.startsWith("spoonacular-")),
    );

    const diagnostics = buildDiagnostics(
      breakdowns,
      pool,
      criteria,
      hasSpoonacular,
    );
    logRecipePool(diagnostics);

    return { pool, diagnostics };
  } catch {
    console.warn("[recipes] Spoonacular unavailable, using local recipes");
    return buildLocalFallbackResult(criteria);
  }
}
