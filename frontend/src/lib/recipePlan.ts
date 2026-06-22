import { getDayLabels } from "@/data/mealPlanOptions";
import { DAYS_OF_WEEK } from "@/data/mockMeals";
import {
  getAllRecipes,
  getRecipeById,
  type IngredientUnit,
  type Recipe,
  type RecipeMealType,
} from "@/data/recipes";
import {
  assertEnoughRecipesForPlan,
  filterRecipesForCriteria,
  getDietFiltersFromCriteria,
  getRecipesByMealTypeFromPool,
} from "@/lib/recipeFilter";
import {
  estimatePlanTotalFromCachedRecipeCosts,
  getActiveGenerationCache,
  runWithGenerationCache,
  yieldToMain,
} from "@/lib/generationCache";
import { findBestProductForIngredient, getEffectivePrice } from "@/lib/products";
import { logMealPlanDebug, MEAL_PLAN_DEBUG } from "@/lib/mealPlanDebug";
import { getMealRecipeId } from "@/lib/mealRecipe";
import { inferRecipeSource } from "@/lib/recipeSource";
import {
  calculatePacksNeeded,
} from "@/lib/productPackSize";
import { productToShoppingItem } from "@/lib/shoppingList";
import type { GeneratedMealPlanResult, MealPlanCriteria, MealPlanDay, MealPlanSummary } from "@/types/mealPlan";
import type { DayOfWeek, Meal, MealType, Product, ShoppingItem } from "@/types";

export const PLACEHOLDER_UNIT_PRICE = 12.5;

export const OVER_BUDGET_MESSAGE =
  "Madplanen er over budget. Prøv færre dage, færre personer eller billigere opskrifter.";

export const IMPOSSIBLE_BUDGET_MESSAGE =
  "Budgettet er for lavt til de valgte opskrifter og produkter. Prøv færre dage, færre personer eller flere lokale budgetopskrifter.";

const FULL_DAY_MEAL_TYPES: RecipeMealType[] = ["breakfast", "lunch", "dinner"];

const IDEAL_BUDGET_MIN_RATIO = 0.85;
const INITIAL_BUDGET_LOW_RATIO = 1.05;
const INITIAL_BUDGET_HIGH_RATIO = 1.2;
const MAX_BUDGET_ADJUST_ITERATIONS = 8;
const MAX_SWAP_ALTERNATIVES = 5;

export const OPTIMIZE_FAILED_MESSAGE =
  "Kunne ikke gøre planen billigere uden at fjerne måltider.";

export function getIdealBudgetRange(budget: number): {
  idealMin: number;
  idealMax: number;
} {
  return {
    idealMin: budget * IDEAL_BUDGET_MIN_RATIO,
    idealMax: budget,
  };
}

function getInitialBudgetTargetRange(budget: number): {
  targetLow: number;
  targetHigh: number;
  targetMid: number;
} {
  return {
    targetLow: budget * INITIAL_BUDGET_LOW_RATIO,
    targetHigh: budget * INITIAL_BUDGET_HIGH_RATIO,
    targetMid: (budget * (INITIAL_BUDGET_LOW_RATIO + INITIAL_BUDGET_HIGH_RATIO)) / 2,
  };
}

function isInTargetBudgetRange(total: number, budget: number): boolean {
  return total >= budget * IDEAL_BUDGET_MIN_RATIO && total <= budget;
}

function distanceFromBudget(total: number, budget: number): number {
  return Math.abs(budget - total);
}

function logGenerationEvent(payload: Record<string, unknown>): void {
  logMealPlanDebug("[MealPlan generation]", payload);
}


function getPlanTotalFromRecipes(
  recipes: Recipe[],
  criteria: MealPlanCriteria,
  products: Product[],
): number {
  const plan = buildPlanFromRecipes(recipes, criteria, products);
  if (plan.shoppingListItems.length === 0) {
    return Infinity;
  }
  return getShoppingListTotal(plan.shoppingListItems);
}

export function getShoppingListTotal(items: ShoppingItem[]): number {
  return items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0,
  );
}

export function buildSummaryFromShoppingList(
  items: ShoppingItem[],
  criteria: MealPlanCriteria,
  mealCount: number,
): MealPlanSummary {
  const scaledCost = getShoppingListTotal(items);
  const underBudget = scaledCost <= criteria.budget;

  return {
    totalCost: scaledCost / criteria.people,
    scaledCost,
    budgetUsedPercent: Math.round((scaledCost / criteria.budget) * 100),
    underBudget,
    mealCount,
    averageCostPerDay: scaledCost / criteria.days,
  };
}

export function getRecipeCostPerPerson(
  recipe: Recipe,
  products: Product[],
): number {
  return estimateRecipeTotalCost(recipe, products, recipe.servings) / recipe.servings;
}

function estimateIngredientLineCost(
  requiredAmount: number,
  requiredUnit: IngredientUnit,
  ingredientName: string,
  products: Product[],
): number {
  const cache = getActiveGenerationCache();
  const matchedProduct = cache
    ? cache.findProductForIngredient(ingredientName)
    : findBestProductForIngredient(ingredientName, products);

  if (matchedProduct) {
    const packCalc = calculatePacksNeeded(
      requiredAmount,
      requiredUnit,
      matchedProduct,
    );
    if (packCalc) {
      return packCalc.packsNeeded * getEffectivePrice(matchedProduct);
    }
  }

  return matchedProduct ? getEffectivePrice(matchedProduct) : PLACEHOLDER_UNIT_PRICE;
}

function estimateRecipeIngredientCost(
  recipe: Recipe,
  people: number,
  products: Product[],
): number {
  const scale = people / recipe.servings;

  return recipe.ingredients.reduce((sum, ingredient) => {
    return (
      sum +
      estimateIngredientLineCost(
        ingredient.amount * scale,
        ingredient.unit,
        ingredient.name,
        products,
      )
    );
  }, 0);
}

export function estimateRecipeTotalCost(
  recipe: Recipe,
  products: Product[],
  people: number,
): number {
  const cache = getActiveGenerationCache();
  if (cache && cache.people === people) {
    return cache.estimateRecipeCost(recipe);
  }
  return estimateRecipeIngredientCost(recipe, people, products);
}

export function findCheaperRecipeAlternative(
  currentRecipe: Recipe,
  allRecipes: Recipe[],
  products: Product[],
  people: number,
): Recipe | undefined {
  const currentCost = estimateRecipeTotalCost(currentRecipe, products, people);

  let bestAlternative: Recipe | undefined;
  let bestCost = currentCost;

  for (const candidate of allRecipes) {
    if (
      candidate.mealType !== currentRecipe.mealType ||
      candidate.id === currentRecipe.id
    ) {
      continue;
    }

    const candidateCost = estimateRecipeTotalCost(candidate, products, people);
    if (candidateCost < bestCost) {
      bestCost = candidateCost;
      bestAlternative = candidate;
    }
  }

  return bestAlternative;
}

export function findCheaperRecipeSwap(
  currentRecipe: Recipe,
  products: Product[],
  people: number,
  recipePool: Recipe[],
): Recipe | undefined {
  const currentCost = estimateRecipeTotalCost(currentRecipe, products, people);

  let bestSwap: Recipe | undefined;
  let bestSwapCost = -Infinity;

  for (const candidate of getRecipesByMealTypeFromPool(
    currentRecipe.mealType,
    recipePool,
  )) {
    if (candidate.id === currentRecipe.id) continue;

    const candidateCost = estimateRecipeTotalCost(candidate, products, people);
    if (candidateCost >= currentCost) continue;

    if (candidateCost > bestSwapCost) {
      bestSwapCost = candidateCost;
      bestSwap = candidate;
    }
  }

  return bestSwap;
}

export function findMoreExpensiveRecipeSwap(
  currentRecipe: Recipe,
  products: Product[],
  people: number,
  recipePool: Recipe[],
): Recipe | undefined {
  const currentCost = estimateRecipeTotalCost(currentRecipe, products, people);

  let bestSwap: Recipe | undefined;
  let bestSwapCost = Infinity;

  for (const candidate of getRecipesByMealTypeFromPool(
    currentRecipe.mealType,
    recipePool,
  )) {
    if (candidate.id === currentRecipe.id) continue;

    const candidateCost = estimateRecipeTotalCost(candidate, products, people);
    if (candidateCost <= currentCost) continue;

    if (candidateCost < bestSwapCost) {
      bestSwapCost = candidateCost;
      bestSwap = candidate;
    }
  }

  return bestSwap;
}

function listBudgetReductionAlternatives(
  currentRecipe: Recipe,
  products: Product[],
  people: number,
  recipePool: Recipe[],
): Recipe[] {
  const currentCost = estimateRecipeTotalCost(currentRecipe, products, people);

  const cheaperThanCurrent = getRecipesByMealTypeFromPool(
    currentRecipe.mealType,
    recipePool,
  )
    .filter((candidate) => candidate.id !== currentRecipe.id)
    .filter(
      (candidate) =>
        estimateRecipeTotalCost(candidate, products, people) < currentCost,
    )
    .sort(
      (a, b) =>
        estimateRecipeTotalCost(a, products, people) -
        estimateRecipeTotalCost(b, products, people),
    );

  if (cheaperThanCurrent.length > 0) {
    return cheaperThanCurrent;
  }

  return getRecipesByMealTypeFromPool(currentRecipe.mealType, recipePool)
    .filter((candidate) => candidate.id !== currentRecipe.id)
    .sort(
      (a, b) =>
        estimateRecipeTotalCost(a, products, people) -
        estimateRecipeTotalCost(b, products, people),
    );
}

function sortSlotIndicesByDescendingCost(
  recipes: Recipe[],
  products: Product[],
  people: number,
): number[] {
  return recipes
    .map((recipe, index) => ({
      index,
      cost: estimateRecipeTotalCost(recipe, products, people),
    }))
    .sort((a, b) => b.cost - a.cost)
    .map((entry) => entry.index);
}

function listMoreExpensiveRecipeSwaps(
  currentRecipe: Recipe,
  products: Product[],
  people: number,
  recipePool: Recipe[],
): Recipe[] {
  const currentCost = estimateRecipeTotalCost(currentRecipe, products, people);

  return getRecipesByMealTypeFromPool(currentRecipe.mealType, recipePool)
    .filter((candidate) => {
      if (candidate.id === currentRecipe.id) return false;
      return (
        estimateRecipeTotalCost(candidate, products, people) > currentCost
      );
    })
    .sort(
      (a, b) =>
        estimateRecipeTotalCost(a, products, people) -
        estimateRecipeTotalCost(b, products, people),
    );
}

export async function generateHighValueInitialPlan(
  criteria: MealPlanCriteria,
  products: Product[],
  recipePool: Recipe[],
): Promise<Recipe[]> {
  const { targetMid } = getInitialBudgetTargetRange(criteria.budget);
  const usageCount = new Map<string, number>();
  const selected: Recipe[] = [];
  const totalSlots = criteria.days * FULL_DAY_MEAL_TYPES.length;

  for (let dayIndex = 0; dayIndex < criteria.days; dayIndex++) {
    for (const mealType of FULL_DAY_MEAL_TYPES) {
      const candidates = getRecipesByMealTypeFromPool(mealType, recipePool)
        .map((recipe) => ({
          recipe,
          cost: estimateRecipeTotalCost(recipe, products, criteria.people),
          uses: usageCount.get(recipe.id) ?? 0,
        }))
        .sort((a, b) => {
          if (a.uses !== b.uses) return a.uses - b.uses;
          return b.cost - a.cost;
        });

      if (candidates.length === 0) {
        throw new Error(`No recipes for meal type: ${mealType}`);
      }

      const unusedCandidates = candidates.filter((entry) => entry.uses === 0);
      const mustRepeat = unusedCandidates.length === 0;
      let pool = mustRepeat ? candidates : unusedCandidates;

      const excludeCheapestCount = Math.max(
        0,
        Math.floor(pool.length * 0.25),
      );
      if (excludeCheapestCount > 0 && pool.length > excludeCheapestCount + 1) {
        pool = pool.slice(0, pool.length - excludeCheapestCount);
      }

      const remainingSlots = totalSlots - selected.length;
      const runningEstimate = selected.reduce(
        (sum, recipe) =>
          sum + estimateRecipeTotalCost(recipe, products, criteria.people),
        0,
      );
      const slotTarget = (targetMid - runningEstimate) / remainingSlots;

      const picked = pool.reduce<(typeof candidates)[number] | null>(
        (best, entry) => {
          if (!best) return entry;

          const entryDistance = Math.abs(entry.cost - slotTarget);
          const bestDistance = Math.abs(best.cost - slotTarget);
          const entryRepeatPenalty = entry.uses > 0 ? 10000 : 0;
          const bestRepeatPenalty = best.uses > 0 ? 10000 : 0;
          const entryScore = entryDistance + entryRepeatPenalty;
          const bestScore = bestDistance + bestRepeatPenalty;

          if (entryScore !== bestScore) {
            return entryScore < bestScore ? entry : best;
          }

          return entry.cost > best.cost ? entry : best;
        },
        null,
      );

      const recipe = picked?.recipe ?? candidates[0]!.recipe;
      selected.push(recipe);
      usageCount.set(recipe.id, (usageCount.get(recipe.id) ?? 0) + 1);
    }

    await yieldToMain();
  }

  return selected;
}

type BudgetAdjustResult = {
  recipes: Recipe[];
  plan: GeneratedMealPlanResult;
  total: number;
  noValidSwaps: boolean;
};

export async function adjustPlanDownToBudget(
  recipes: Recipe[],
  criteria: MealPlanCriteria,
  products: Product[],
  recipePool: Recipe[],
): Promise<BudgetAdjustResult> {
  let currentRecipes = [...recipes];
  let plan = buildPlanFromRecipes(currentRecipes, criteria, products);
  let total = getShoppingListTotal(plan.shoppingListItems);
  const { budget } = criteria;
  let noValidSwaps = false;

  for (let iteration = 0; iteration < MAX_BUDGET_ADJUST_ITERATIONS; iteration++) {
    if (total <= budget) break;

    await yieldToMain();

    let bestSwap:
      | {
          slotIndex: number;
          swap: Recipe;
          trialRecipes: Recipe[];
          estimatedTotal: number;
        }
      | undefined;

    const estimatedCurrentTotal = estimatePlanTotalFromCachedRecipeCosts(
      currentRecipes,
      criteria.people,
    );

    const slotOrder = sortSlotIndicesByDescendingCost(
      currentRecipes,
      products,
      criteria.people,
    );

    for (const slotIndex of slotOrder) {
      const currentRecipe = currentRecipes[slotIndex]!;

      for (const cheaperSwap of listBudgetReductionAlternatives(
        currentRecipe,
        products,
        criteria.people,
        recipePool,
      ).slice(0, MAX_SWAP_ALTERNATIVES)) {
        const trialRecipes = [...currentRecipes];
        trialRecipes[slotIndex] = cheaperSwap;
        const estimatedTrialTotal = estimatePlanTotalFromCachedRecipeCosts(
          trialRecipes,
          criteria.people,
        );

        if (estimatedTrialTotal >= estimatedCurrentTotal) continue;

        const swapScore =
          estimatedTrialTotal > budget
            ? 1000 - (estimatedCurrentTotal - estimatedTrialTotal)
            : 2000 - distanceFromBudget(estimatedTrialTotal, budget);

        const currentBestScore = bestSwap
          ? bestSwap.estimatedTotal > budget
            ? 1000 - (estimatedCurrentTotal - bestSwap.estimatedTotal)
            : 2000 - distanceFromBudget(bestSwap.estimatedTotal, budget)
          : -Infinity;

        if (swapScore > currentBestScore) {
          bestSwap = {
            slotIndex,
            swap: cheaperSwap,
            trialRecipes,
            estimatedTotal: estimatedTrialTotal,
          };
        }
      }
    }

    if (!bestSwap) {
      noValidSwaps = true;
      logGenerationEvent({
        phase: "down-swap",
        iteration: iteration + 1,
        noValidSwaps: true,
        total,
        budget,
      });
      break;
    }

    const trialPlan = buildPlanFromRecipes(
      bestSwap.trialRecipes,
      criteria,
      products,
    );
    const trialTotal = getShoppingListTotal(trialPlan.shoppingListItems);

    if (trialPlan.shoppingListItems.length === 0 || !validatePlanStructure(plan, trialPlan)) {
      noValidSwaps = true;
      break;
    }

    if (trialTotal >= total) {
      noValidSwaps = true;
      break;
    }

    logGenerationEvent({
      phase: "down-swap",
      iteration: iteration + 1,
      slotIndex: bestSwap.slotIndex,
      from: currentRecipes[bestSwap.slotIndex]!.title,
      to: bestSwap.swap.title,
      oldTotal: total,
      newTotal: trialTotal,
    });

    currentRecipes = bestSwap.trialRecipes;
    plan = trialPlan;
    total = trialTotal;
  }

  return { recipes: currentRecipes, plan, total, noValidSwaps };
}

export async function upgradePlanTowardBudget(
  recipes: Recipe[],
  criteria: MealPlanCriteria,
  products: Product[],
  recipePool: Recipe[],
): Promise<BudgetAdjustResult> {
  let currentRecipes = [...recipes];
  let plan = buildPlanFromRecipes(currentRecipes, criteria, products);
  let total = getShoppingListTotal(plan.shoppingListItems);
  const { budget } = criteria;
  const { idealMin } = getIdealBudgetRange(budget);
  let noValidSwaps = false;

  for (let iteration = 0; iteration < MAX_BUDGET_ADJUST_ITERATIONS; iteration++) {
    if (isInTargetBudgetRange(total, budget)) break;

    await yieldToMain();

    let bestSwap:
      | {
          slotIndex: number;
          swap: Recipe;
          trialRecipes: Recipe[];
          estimatedTotal: number;
        }
      | undefined;

    const estimatedCurrentTotal = estimatePlanTotalFromCachedRecipeCosts(
      currentRecipes,
      criteria.people,
    );

    for (let slotIndex = 0; slotIndex < currentRecipes.length; slotIndex++) {
      const currentRecipe = currentRecipes[slotIndex]!;

      for (const expensiveSwap of listMoreExpensiveRecipeSwaps(
        currentRecipe,
        products,
        criteria.people,
        recipePool,
      ).slice(0, MAX_SWAP_ALTERNATIVES)) {
        const trialRecipes = [...currentRecipes];
        trialRecipes[slotIndex] = expensiveSwap;
        const estimatedTrialTotal = estimatePlanTotalFromCachedRecipeCosts(
          trialRecipes,
          criteria.people,
        );

        if (estimatedTrialTotal > budget) continue;
        if (estimatedTrialTotal <= estimatedCurrentTotal) continue;
        if (
          distanceFromBudget(estimatedTrialTotal, budget) >=
          distanceFromBudget(estimatedCurrentTotal, budget)
        ) {
          continue;
        }

        const swapScore = 2000 - distanceFromBudget(estimatedTrialTotal, budget);
        const currentBestScore = bestSwap
          ? 2000 - distanceFromBudget(bestSwap.estimatedTotal, budget)
          : -Infinity;

        if (swapScore > currentBestScore) {
          bestSwap = {
            slotIndex,
            swap: expensiveSwap,
            trialRecipes,
            estimatedTotal: estimatedTrialTotal,
          };
        }
      }
    }

    if (!bestSwap) {
      noValidSwaps = true;
      logGenerationEvent({
        phase: "upgrade-swap",
        iteration: iteration + 1,
        noValidSwaps: true,
        total,
        targetRange: getIdealBudgetRange(budget),
      });
      break;
    }

    const trialPlan = buildPlanFromRecipes(
      bestSwap.trialRecipes,
      criteria,
      products,
    );
    const trialTotal = getShoppingListTotal(trialPlan.shoppingListItems);

    if (trialPlan.shoppingListItems.length === 0 || !validatePlanStructure(plan, trialPlan)) {
      noValidSwaps = true;
      break;
    }

    if (trialTotal > budget || trialTotal <= total) {
      noValidSwaps = true;
      break;
    }

    logGenerationEvent({
      phase: "upgrade-swap",
      iteration: iteration + 1,
      slotIndex: bestSwap.slotIndex,
      from: currentRecipes[bestSwap.slotIndex]!.title,
      to: bestSwap.swap.title,
      oldTotal: total,
      newTotal: trialTotal,
    });

    currentRecipes = bestSwap.trialRecipes;
    plan = trialPlan;
    total = trialTotal;

    if (total >= idealMin) break;
  }

  return { recipes: currentRecipes, plan, total, noValidSwaps };
}

function estimateRecipePriceRange(
  criteria: MealPlanCriteria,
  products: Product[],
  recipePool: Recipe[],
): { minTotal: number; maxTotal: number } {
  const cheapRecipes = selectExtremeCostRecipes(
    criteria.days,
    criteria,
    products,
    "cheapest",
    recipePool,
  );
  const expensiveRecipes = selectExtremeCostRecipes(
    criteria.days,
    criteria,
    products,
    "most_expensive",
    recipePool,
  );

  return {
    minTotal: getPlanTotalFromRecipes(cheapRecipes, criteria, products),
    maxTotal: getPlanTotalFromRecipes(expensiveRecipes, criteria, products),
  };
}

function selectExtremeCostRecipes(
  days: number,
  criteria: MealPlanCriteria,
  products: Product[],
  mode: "cheapest" | "most_expensive",
  recipePool: Recipe[],
): Recipe[] {
  const selected: Recipe[] = [];

  for (let dayIndex = 0; dayIndex < days; dayIndex++) {
    for (const mealType of FULL_DAY_MEAL_TYPES) {
      const candidates = getRecipesByMealTypeFromPool(mealType, recipePool)
        .map((recipe) => ({
          recipe,
          cost: estimateRecipeTotalCost(recipe, products, criteria.people),
        }))
        .sort((a, b) => (mode === "cheapest" ? a.cost - b.cost : b.cost - a.cost));

      selected.push(candidates[0]!.recipe);
    }
  }

  return selected;
}

function logNarrowRecipePriceRange(
  criteria: MealPlanCriteria,
  products: Product[],
  total: number,
  recipePool: Recipe[],
): void {
  if (!MEAL_PLAN_DEBUG) return;

  const { idealMin, idealMax } = getIdealBudgetRange(criteria.budget);
  const { minTotal, maxTotal } = estimateRecipePriceRange(
    criteria,
    products,
    recipePool,
  );

  if (maxTotal < idealMin) {
    logGenerationEvent({
      phase: "price-range",
      message: "Available recipe price range is too narrow for target budget",
      budget: criteria.budget,
      targetRange: { idealMin, idealMax },
      achievableRange: { minTotal, maxTotal },
      finalTotal: total,
    });
  }
}

export async function generateBudgetAwarePlan(
  criteria: MealPlanCriteria,
  products: Product[],
  recipePoolInput?: Recipe[],
): Promise<GeneratedMealPlanResult> {
  return runWithGenerationCache(criteria, products, async () => {
    const recipePool = filterRecipesForCriteria(
      recipePoolInput ?? getAllRecipes(),
      criteria,
    );
    assertEnoughRecipesForPlan(recipePool);

    const { idealMin, idealMax } = getIdealBudgetRange(criteria.budget);
    const initialTargetRange = getInitialBudgetTargetRange(criteria.budget);

    if (MEAL_PLAN_DEBUG) {
      logGenerationEvent({
        phase: "filter",
        dietFilters: getDietFiltersFromCriteria(criteria),
        availableRecipes: recipePool.length,
        breakfast: getRecipesByMealTypeFromPool("breakfast", recipePool).length,
        lunch: getRecipesByMealTypeFromPool("lunch", recipePool).length,
        dinner: getRecipesByMealTypeFromPool("dinner", recipePool).length,
      });
    }

    await yieldToMain();

    let recipes = await generateHighValueInitialPlan(criteria, products, recipePool);
    let plan = buildPlanFromRecipes(recipes, criteria, products);
    let total = getShoppingListTotal(plan.shoppingListItems);
    let budgetReductionExhausted = false;

    logGenerationEvent({
      phase: "initial",
      budget: criteria.budget,
      initialTargetRange,
      targetRange: { idealMin, idealMax },
      recipeTitles: recipes.map((recipe) => recipe.title),
      initialTotal: total,
    });

    if (total > criteria.budget) {
      const downResult = await adjustPlanDownToBudget(
        recipes,
        criteria,
        products,
        recipePool,
      );
      recipes = downResult.recipes;
      plan = downResult.plan;
      total = downResult.total;
      budgetReductionExhausted = downResult.noValidSwaps;
    }

    if (total <= criteria.budget && total >= idealMin) {
      logGenerationEvent({
        phase: "final",
        budget: criteria.budget,
        targetRange: { idealMin, idealMax },
        finalTotal: total,
        inTargetRange: true,
        noValidSwapsNeeded: true,
      });
      logNarrowRecipePriceRange(criteria, products, total, recipePool);
      return attachBudgetNotice(plan, total, criteria.budget, budgetReductionExhausted);
    }

    if (total < idealMin) {
      const upgradeResult = await upgradePlanTowardBudget(
        recipes,
        criteria,
        products,
        recipePool,
      );
      recipes = upgradeResult.recipes;
      plan = upgradeResult.plan;
      total = upgradeResult.total;
    }

    logGenerationEvent({
      phase: "final",
      budget: criteria.budget,
      targetRange: { idealMin, idealMax },
      finalTotal: total,
      inTargetRange: isInTargetBudgetRange(total, criteria.budget),
      underBudget: total <= criteria.budget,
      distanceFromBudget: distanceFromBudget(total, criteria.budget),
    });
    logNarrowRecipePriceRange(criteria, products, total, recipePool);

    return attachBudgetNotice(plan, total, criteria.budget, budgetReductionExhausted);
  });
}

function attachBudgetNotice(
  plan: GeneratedMealPlanResult,
  total: number,
  budget: number,
  budgetReductionExhausted: boolean,
): GeneratedMealPlanResult {
  if (total <= budget) {
    return plan;
  }

  return {
    ...plan,
    summary: {
      ...plan.summary,
      budgetNotice: budgetReductionExhausted
        ? IMPOSSIBLE_BUDGET_MESSAGE
        : OVER_BUDGET_MESSAGE,
    },
  };
}

export function recipeMealTypeToMealType(mealType: RecipeMealType): MealType {
  if (mealType === "breakfast") return "breakfast";
  if (mealType === "lunch" || mealType === "snack") return "lunch";
  return "dinner";
}

export function recipeToMeal(
  recipe: Recipe,
  day: DayOfWeek,
  products: Product[],
): Meal {
  const costPerPerson = getRecipeCostPerPerson(recipe, products);

  return {
    id: recipe.id,
    recipeId: recipe.id,
    name: recipe.title,
    description: recipe.instructions[0] ?? "",
    type: recipeMealTypeToMealType(recipe.mealType),
    day,
    cost: costPerPerson,
    prepTimeMinutes: recipe.estimatedTimeMinutes,
    calories: 450,
    tags: recipe.tags,
    ingredients: recipe.ingredients.map((ingredient) => ingredient.name),
    image: recipe.image,
    source: inferRecipeSource(recipe),
  };
}

export function buildPlanDaysFromRecipes(
  selectedRecipes: Recipe[],
  products: Product[],
): MealPlanDay[] {
  const days = Math.ceil(selectedRecipes.length / FULL_DAY_MEAL_TYPES.length);
  const labels = getDayLabels(days);

  return Array.from({ length: days }, (_, dayIndex) => {
    const day = DAYS_OF_WEEK[dayIndex]!;
    const dayRecipes = selectedRecipes.slice(
      dayIndex * FULL_DAY_MEAL_TYPES.length,
      (dayIndex + 1) * FULL_DAY_MEAL_TYPES.length,
    );

    return {
      day,
      label: labels[dayIndex] ?? day,
      meals: dayRecipes.map((recipe) => recipeToMeal(recipe, day, products)),
    };
  });
}

type AggregatedIngredient = {
  name: string;
  requiredAmount: number;
  requiredUnit: IngredientUnit;
  mealRefs: Set<string>;
};

function aggregateRecipeIngredients(
  selectedRecipes: Recipe[],
  people: number,
): AggregatedIngredient[] {
  const map = new Map<string, AggregatedIngredient>();

  for (const recipe of selectedRecipes) {
    const scale = people / recipe.servings;

    for (const ingredient of recipe.ingredients) {
      const key = `${ingredient.name}|${ingredient.unit}`;
      const scaledAmount = ingredient.amount * scale;
      const existing = map.get(key);

      if (existing) {
        existing.requiredAmount += scaledAmount;
        existing.mealRefs.add(recipe.title);
      } else {
        map.set(key, {
          name: ingredient.name,
          requiredAmount: scaledAmount,
          requiredUnit: ingredient.unit,
          mealRefs: new Set([recipe.title]),
        });
      }
    }
  }

  return Array.from(map.values());
}

function buildShoppingItemFromIngredient(
  aggregated: AggregatedIngredient,
  index: number,
  criteria: MealPlanCriteria,
  products: Product[],
): ShoppingItem {
  const mealRef = Array.from(aggregated.mealRefs).join(", ");
  const cache = getActiveGenerationCache();
  const matchedProduct = cache
    ? cache.findProductForIngredient(aggregated.name)
    : findBestProductForIngredient(aggregated.name, products);
  const id = `plan-ingredient-${index}-${aggregated.name.toLowerCase().replace(/\s+/g, "-")}-${aggregated.requiredUnit}`;

  const baseFields = {
    id,
    name: aggregated.name,
    mealRef,
    requiredAmount: aggregated.requiredAmount,
    requiredUnit: aggregated.requiredUnit,
  };

  if (matchedProduct) {
    const packCalc = calculatePacksNeeded(
      aggregated.requiredAmount,
      aggregated.requiredUnit,
      matchedProduct,
    );

    if (packCalc) {
      return {
        ...productToShoppingItem(matchedProduct),
        ...baseFields,
        quantity: packCalc.packsNeeded,
        packsNeeded: packCalc.packsNeeded,
        packSize: packCalc.packSize,
        packUnit: packCalc.packUnit,
      };
    }

    return {
      ...productToShoppingItem(matchedProduct),
      ...baseFields,
      quantity: criteria.people,
    };
  }

  return {
    ...baseFields,
    brand: "Estimat",
    category: "Generelt",
    unit: "stk",
    quantity: criteria.people,
    unitPrice: PLACEHOLDER_UNIT_PRICE,
    checked: false,
    store: criteria.store,
  };
}

export function buildShoppingListFromRecipes(
  selectedRecipes: Recipe[],
  criteria: MealPlanCriteria,
  products: Product[],
): ShoppingItem[] {
  const aggregated = aggregateRecipeIngredients(
    selectedRecipes,
    criteria.people,
  );

  return aggregated.map((ingredient, index) =>
    buildShoppingItemFromIngredient(ingredient, index, criteria, products),
  );
}

export function getSelectedRecipesFromPlan(
  plan: GeneratedMealPlanResult,
): Recipe[] {
  return plan.days.flatMap((day) =>
    day.meals
      .map((meal) => getRecipeById(getMealRecipeId(meal)))
      .filter((recipe): recipe is Recipe => recipe != null),
  );
}

export function buildPlanFromRecipes(
  selectedRecipes: Recipe[],
  criteria: MealPlanCriteria,
  products: Product[],
): GeneratedMealPlanResult {
  const days = buildPlanDaysFromRecipes(selectedRecipes, products);
  const shoppingListItems = buildShoppingListFromRecipes(
    selectedRecipes,
    criteria,
    products,
  );
  const mealCount = days.reduce((sum, day) => sum + day.meals.length, 0);

  return {
    criteria,
    days,
    shoppingListItems,
    summary: buildSummaryFromShoppingList(
      shoppingListItems,
      criteria,
      mealCount,
    ),
    generatedAt: new Date().toISOString(),
    source: "placeholder",
  };
}

export function validatePlanStructure(
  before: GeneratedMealPlanResult,
  after: GeneratedMealPlanResult,
): boolean {
  if (after.days.length !== before.days.length) return false;
  if (after.shoppingListItems.length === 0) return false;

  for (let dayIndex = 0; dayIndex < before.days.length; dayIndex++) {
    const beforeDay = before.days[dayIndex]!;
    const afterDay = after.days[dayIndex]!;

    if (afterDay.meals.length !== beforeDay.meals.length) return false;

    for (const meal of afterDay.meals) {
      if (!meal.id || !meal.name.trim()) return false;
      if (!getRecipeById(getMealRecipeId(meal))) return false;
    }
  }

  return true;
}

export function isSuspiciousPriceDrop(
  oldTotal: number,
  newTotal: number,
): boolean {
  return newTotal < oldTotal * 0.6;
}

export function optimizeRecipesIncrementally(
  selectedRecipes: Recipe[],
  criteria: MealPlanCriteria,
  products: Product[],
): Recipe[] {
  const recipePool = filterRecipesForCriteria(getAllRecipes(), criteria);
  let recipes = [...selectedRecipes];
  let improved = true;

  while (improved) {
    improved = false;

    for (let index = 0; index < recipes.length; index++) {
      const currentRecipe = recipes[index]!;
      const alternative = findCheaperRecipeAlternative(
        currentRecipe,
        recipePool,
        products,
        criteria.people,
      );

      if (!alternative) continue;

      const trialRecipes = [...recipes];
      trialRecipes[index] = alternative;

      const trialPlan = buildPlanFromRecipes(trialRecipes, criteria, products);
      const baselinePlan = buildPlanFromRecipes(recipes, criteria, products);
      const trialTotal = getShoppingListTotal(trialPlan.shoppingListItems);
      const baselineTotal = getShoppingListTotal(baselinePlan.shoppingListItems);

      if (
        validatePlanStructure(baselinePlan, trialPlan) &&
        trialTotal < baselineTotal &&
        !isSuspiciousPriceDrop(baselineTotal, trialTotal)
      ) {
        recipes = trialRecipes;
        improved = true;
      }
    }
  }

  return recipes;
}
