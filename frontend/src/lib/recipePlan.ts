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
import { findBestProductForIngredient, getEffectivePrice } from "@/lib/products";
import {
  calculatePacksNeeded,
} from "@/lib/productPackSize";
import { productToShoppingItem } from "@/lib/shoppingList";
import type { GeneratedMealPlanResult, MealPlanCriteria, MealPlanDay, MealPlanSummary } from "@/types/mealPlan";
import type { DayOfWeek, Meal, MealType, Product, ShoppingItem } from "@/types";

export const PLACEHOLDER_UNIT_PRICE = 12.5;

export const OVER_BUDGET_MESSAGE =
  "Madplanen er over budget. Prøv færre dage, færre personer eller billigere opskrifter.";

const FULL_DAY_MEAL_TYPES: RecipeMealType[] = ["breakfast", "lunch", "dinner"];

const IDEAL_BUDGET_MIN_RATIO = 0.85;
const INITIAL_BUDGET_LOW_RATIO = 1.05;
const INITIAL_BUDGET_HIGH_RATIO = 1.2;
const MAX_BUDGET_ADJUST_ITERATIONS = 20;

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

function isDevLogEnabled(): boolean {
  return import.meta.env.DEV;
}

function logGenerationEvent(payload: Record<string, unknown>): void {
  if (!isDevLogEnabled()) return;
  console.log("[MealPlan generation]", payload);
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
  const matchedProduct = findBestProductForIngredient(ingredientName, products);

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

function listCheaperRecipeSwaps(
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
        estimateRecipeTotalCost(candidate, products, people) < currentCost
      );
    })
    .sort(
      (a, b) =>
        estimateRecipeTotalCost(b, products, people) -
        estimateRecipeTotalCost(a, products, people),
    );
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

export function generateHighValueInitialPlan(
  criteria: MealPlanCriteria,
  products: Product[],
  recipePool: Recipe[],
): Recipe[] {
  const { targetMid } = getInitialBudgetTargetRange(criteria.budget);
  const usedIds = new Set<string>();
  const selected: Recipe[] = [];
  const totalSlots = criteria.days * FULL_DAY_MEAL_TYPES.length;

  for (let dayIndex = 0; dayIndex < criteria.days; dayIndex++) {
    for (const mealType of FULL_DAY_MEAL_TYPES) {
      const candidates = getRecipesByMealTypeFromPool(mealType, recipePool)
        .map((recipe) => ({
          recipe,
          cost: estimateRecipeTotalCost(recipe, products, criteria.people),
        }))
        .sort((a, b) => b.cost - a.cost);

      if (candidates.length === 0) {
        throw new Error(`No recipes for meal type: ${mealType}`);
      }

      const excludeCheapestCount = Math.max(
        0,
        Math.floor(candidates.length * 0.25),
      );
      let pool =
        excludeCheapestCount > 0
          ? candidates.slice(0, candidates.length - excludeCheapestCount)
          : candidates;

      const unusedPool = pool.filter((entry) => !usedIds.has(entry.recipe.id));
      if (unusedPool.length > 0) {
        pool = unusedPool;
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

          if (entryDistance !== bestDistance) {
            return entryDistance < bestDistance ? entry : best;
          }

          return entry.cost > best.cost ? entry : best;
        },
        null,
      );

      const recipe = picked?.recipe ?? candidates[0]!.recipe;
      selected.push(recipe);
      usedIds.add(recipe.id);
    }
  }

  return selected;
}

type BudgetAdjustResult = {
  recipes: Recipe[];
  plan: GeneratedMealPlanResult;
  total: number;
  noValidSwaps: boolean;
};

export function adjustPlanDownToBudget(
  recipes: Recipe[],
  criteria: MealPlanCriteria,
  products: Product[],
  recipePool: Recipe[],
): BudgetAdjustResult {
  let currentRecipes = [...recipes];
  let plan = buildPlanFromRecipes(currentRecipes, criteria, products);
  let total = getShoppingListTotal(plan.shoppingListItems);
  const { budget } = criteria;
  let noValidSwaps = false;

  for (let iteration = 0; iteration < MAX_BUDGET_ADJUST_ITERATIONS; iteration++) {
    if (total <= budget) break;

    let bestSwap:
      | {
          slotIndex: number;
          swap: Recipe;
          trialRecipes: Recipe[];
          trialPlan: GeneratedMealPlanResult;
          trialTotal: number;
        }
      | undefined;

    for (let slotIndex = 0; slotIndex < currentRecipes.length; slotIndex++) {
      const currentRecipe = currentRecipes[slotIndex]!;

      for (const cheaperSwap of listCheaperRecipeSwaps(
        currentRecipe,
        products,
        criteria.people,
        recipePool,
      )) {
        const trialRecipes = [...currentRecipes];
        trialRecipes[slotIndex] = cheaperSwap;
        const trialPlan = buildPlanFromRecipes(trialRecipes, criteria, products);

        if (trialPlan.shoppingListItems.length === 0) continue;
        if (!validatePlanStructure(plan, trialPlan)) continue;

        const trialTotal = getShoppingListTotal(trialPlan.shoppingListItems);
        if (trialTotal >= total) continue;

        const swapScore =
          trialTotal > budget
            ? 1000 - (total - trialTotal)
            : 2000 - distanceFromBudget(trialTotal, budget);

        const currentBestScore = bestSwap
          ? bestSwap.trialTotal > budget
            ? 1000 - (total - bestSwap.trialTotal)
            : 2000 - distanceFromBudget(bestSwap.trialTotal, budget)
          : -Infinity;

        if (swapScore > currentBestScore) {
          bestSwap = {
            slotIndex,
            swap: cheaperSwap,
            trialRecipes,
            trialPlan,
            trialTotal,
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

    logGenerationEvent({
      phase: "down-swap",
      iteration: iteration + 1,
      slotIndex: bestSwap.slotIndex,
      from: currentRecipes[bestSwap.slotIndex]!.title,
      to: bestSwap.swap.title,
      oldTotal: total,
      newTotal: bestSwap.trialTotal,
    });

    currentRecipes = bestSwap.trialRecipes;
    plan = bestSwap.trialPlan;
    total = bestSwap.trialTotal;
  }

  return { recipes: currentRecipes, plan, total, noValidSwaps };
}

export function upgradePlanTowardBudget(
  recipes: Recipe[],
  criteria: MealPlanCriteria,
  products: Product[],
  recipePool: Recipe[],
): BudgetAdjustResult {
  let currentRecipes = [...recipes];
  let plan = buildPlanFromRecipes(currentRecipes, criteria, products);
  let total = getShoppingListTotal(plan.shoppingListItems);
  const { budget } = criteria;
  const { idealMin } = getIdealBudgetRange(budget);
  let noValidSwaps = false;

  for (let iteration = 0; iteration < MAX_BUDGET_ADJUST_ITERATIONS; iteration++) {
    if (isInTargetBudgetRange(total, budget)) break;

    let bestSwap:
      | {
          slotIndex: number;
          swap: Recipe;
          trialRecipes: Recipe[];
          trialPlan: GeneratedMealPlanResult;
          trialTotal: number;
        }
      | undefined;

    for (let slotIndex = 0; slotIndex < currentRecipes.length; slotIndex++) {
      const currentRecipe = currentRecipes[slotIndex]!;

      for (const expensiveSwap of listMoreExpensiveRecipeSwaps(
        currentRecipe,
        products,
        criteria.people,
        recipePool,
      )) {
        const trialRecipes = [...currentRecipes];
        trialRecipes[slotIndex] = expensiveSwap;
        const trialPlan = buildPlanFromRecipes(trialRecipes, criteria, products);

        if (trialPlan.shoppingListItems.length === 0) continue;
        if (!validatePlanStructure(plan, trialPlan)) continue;

        const trialTotal = getShoppingListTotal(trialPlan.shoppingListItems);
        if (trialTotal > budget) continue;
        if (trialTotal <= total) continue;
        if (
          distanceFromBudget(trialTotal, budget) >=
          distanceFromBudget(total, budget)
        ) {
          continue;
        }

        const swapScore = 2000 - distanceFromBudget(trialTotal, budget);
        const currentBestScore = bestSwap
          ? 2000 - distanceFromBudget(bestSwap.trialTotal, budget)
          : -Infinity;

        if (swapScore > currentBestScore) {
          bestSwap = {
            slotIndex,
            swap: expensiveSwap,
            trialRecipes,
            trialPlan,
            trialTotal,
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

    logGenerationEvent({
      phase: "upgrade-swap",
      iteration: iteration + 1,
      slotIndex: bestSwap.slotIndex,
      from: currentRecipes[bestSwap.slotIndex]!.title,
      to: bestSwap.swap.title,
      oldTotal: total,
      newTotal: bestSwap.trialTotal,
    });

    currentRecipes = bestSwap.trialRecipes;
    plan = bestSwap.trialPlan;
    total = bestSwap.trialTotal;

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
  if (!isDevLogEnabled()) return;

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

export function generateBudgetAwarePlan(
  criteria: MealPlanCriteria,
  products: Product[],
): GeneratedMealPlanResult {
  const recipePool = filterRecipesForCriteria(getAllRecipes(), criteria);
  assertEnoughRecipesForPlan(recipePool);

  const { idealMin, idealMax } = getIdealBudgetRange(criteria.budget);
  const initialTargetRange = getInitialBudgetTargetRange(criteria.budget);

  if (isDevLogEnabled()) {
    logGenerationEvent({
      phase: "filter",
      dietFilters: getDietFiltersFromCriteria(criteria),
      availableRecipes: recipePool.length,
      breakfast: getRecipesByMealTypeFromPool("breakfast", recipePool).length,
      lunch: getRecipesByMealTypeFromPool("lunch", recipePool).length,
      dinner: getRecipesByMealTypeFromPool("dinner", recipePool).length,
    });
  }

  let recipes = generateHighValueInitialPlan(criteria, products, recipePool);
  let plan = buildPlanFromRecipes(recipes, criteria, products);
  let total = getShoppingListTotal(plan.shoppingListItems);

  logGenerationEvent({
    phase: "initial",
    budget: criteria.budget,
    initialTargetRange,
    targetRange: { idealMin, idealMax },
    recipeTitles: recipes.map((recipe) => recipe.title),
    initialTotal: total,
  });

  if (total > criteria.budget) {
    const downResult = adjustPlanDownToBudget(
      recipes,
      criteria,
      products,
      recipePool,
    );
    recipes = downResult.recipes;
    plan = downResult.plan;
    total = downResult.total;
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
    return plan;
  }

  if (total < idealMin) {
    const upgradeResult = upgradePlanTowardBudget(
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

  return plan;
}

function recipeMealTypeToMealType(mealType: RecipeMealType): MealType {
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
    name: recipe.title,
    description: recipe.instructions[0] ?? "",
    type: recipeMealTypeToMealType(recipe.mealType),
    day,
    cost: costPerPerson,
    prepTimeMinutes: recipe.estimatedTimeMinutes,
    calories: 450,
    tags: recipe.tags,
    ingredients: recipe.ingredients.map((ingredient) => ingredient.name),
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
  const matchedProduct = findBestProductForIngredient(aggregated.name, products);
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
      .map((meal) => getRecipeById(meal.id))
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
      if (!getRecipeById(meal.id)) return false;
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
