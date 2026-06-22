import type {
  IngredientUnit,
  Recipe,
  RecipeIngredient,
  RecipeMealType,
} from "@/data/recipes";
import { apiGet } from "@/services/apiClient";
import type { MealPlanCriteria } from "@/types/mealPlan";
import type {
  SpoonacularComplexSearchResponse,
  SpoonacularRecipeResult,
  SpoonacularSearchParams,
} from "./spoonacularTypes";

const INGREDIENT_NAME_MAP: Array<[RegExp, string]> = [
  [/\bchicken breast(s)?\b/i, "kylling"],
  [/\bchicken\b/i, "kylling"],
  [/\bground beef\b/i, "oksekød"],
  [/\bbeef\b/i, "oksekød"],
  [/\bpork\b/i, "svinekød"],
  [/\bsalmon\b/i, "laks"],
  [/\btuna\b/i, "tun"],
  [/\bfish\b/i, "fisk"],
  [/\bpasta\b/i, "pasta"],
  [/\bspaghetti\b/i, "pasta"],
  [/\brice\b/i, "ris"],
  [/\bbroccoli\b/i, "broccoli"],
  [/\bmilk\b/i, "mælk"],
  [/\begg(s)?\b/i, "æg"],
  [/\bonion(s)?\b/i, "løg"],
  [/\bgarlic\b/i, "hvidløg"],
  [/\bpotato(es)?\b/i, "kartofler"],
  [/\bbread\b/i, "brød"],
  [/\bcheese\b/i, "ost"],
  [/\btomato(es)?\b/i, "tomater"],
  [/\bcarrot(s)?\b/i, "gulerødder"],
  [/\bpepper(s)?\b/i, "peberfrugt"],
  [/\bbell pepper(s)?\b/i, "peberfrugt"],
  [/\bbutter\b/i, "smør"],
  [/\bcream\b/i, "fløde"],
  [/\byogurt\b/i, "yoghurt"],
  [/\byoghurt\b/i, "yoghurt"],
  [/\blemon(s)?\b/i, "citron"],
  [/\blime(s)?\b/i, "lime"],
  [/\bspinach\b/i, "spinat"],
  [/\bavocado(s)?\b/i, "avocado"],
  [/\bbacon\b/i, "bacon"],
  [/\bshrimp\b/i, "rejer"],
  [/\bprawn(s)?\b/i, "rejer"],
  [/\bolive oil\b/i, "olivenolie"],
  [/\bvegetable oil\b/i, "rapsolie"],
  [/\bflour\b/i, "mel"],
  [/\bsugar\b/i, "sukker"],
  [/\bsalt\b/i, "salt"],
  [/\bpepper\b/i, "peber"],
  [/\bbanana(s)?\b/i, "banan"],
  [/\bapple(s)?\b/i, "æble"],
  [/\bstrawberr(y|ies)\b/i, "jordbær"],
  [/\bblueberr(y|ies)\b/i, "blåbær"],
  [/\boats?\b/i, "havregryn"],
  [/\brolled oats\b/i, "havregryn"],
  [/\blettuce\b/i, "salat"],
  [/\bcucumber(s)?\b/i, "agurk"],
  [/\bchickpea(s)?\b/i, "kikærter"],
  [/\blentil(s)?\b/i, "linser"],
  [/\bbean(s)?\b/i, "bønner"],
  [/\btofu\b/i, "tofu"],
  [/\bmushroom(s)?\b/i, "champignon"],
  [/\bsausage(s)?\b/i, "pølse"],
  [/\bham\b/i, "skinke"],
  [/\bturkey\b/i, "kalkun"],
  [/\blamb\b/i, "lammekød"],
  [/\bnoodle(s)?\b/i, "nudler"],
  [/\btortilla(s)?\b/i, "tortilla"],
  [/\bsour cream\b/i, "creme fraiche"],
  [/\bpeanut(s)?\b/i, "peanut"],
  [/\bwalnut(s)?\b/i, "valnød"],
  [/\balmond(s)?\b/i, "mandel"],
  [/\bhazelnut(s)?\b/i, "hasselnød"],
  [/\bcoconut milk\b/i, "kokosmælk"],
  [/\bsweet potato(es)?\b/i, "søde kartofler"],
  [/\bzucchini\b/i, "squash"],
  [/\bcourgette(s)?\b/i, "squash"],
  [/\bcorn\b/i, "majs"],
  [/\bpeas\b/i, "ærter"],
  [/\bcelery\b/i, "selleri"],
  [/\bbasil\b/i, "basilikum"],
  [/\bparsley\b/i, "persille"],
  [/\bcilantro\b/i, "koriander"],
  [/\bginger\b/i, "ingefær"],
  [/\bhoney\b/i, "honning"],
  [/\bsoy sauce\b/i, "sojasauce"],
  [/\bvinegar\b/i, "eddike"],
  [/\bbroth\b/i, "bouillon"],
  [/\bstock\b/i, "bouillon"],
];

export function normalizeIngredientName(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return trimmed;

  for (const [pattern, danishName] of INGREDIENT_NAME_MAP) {
    if (pattern.test(trimmed)) {
      return danishName;
    }
  }

  return trimmed.toLowerCase();
}

function mapSpoonacularUnit(unit: string): IngredientUnit {
  const normalized = unit.trim().toLowerCase();

  if (normalized === "g" || normalized.startsWith("gram")) return "g";
  if (normalized === "kg" || normalized.startsWith("kilogram")) return "kg";
  if (normalized === "ml" || normalized.startsWith("milliliter")) return "ml";
  if (normalized === "l" || normalized.startsWith("liter")) return "l";
  if (normalized.includes("tablespoon") || normalized === "tbsp") return "spsk";
  if (normalized.includes("teaspoon") || normalized === "tsp") return "tsk";

  return "stk";
}

function inferIngredientCategory(
  name: string,
): RecipeIngredient["category"] {
  const lower = name.toLowerCase();

  if (/kylling|oksekød|svinekød|laks|tun|fisk|rejer|bacon|skinke|pølse|kalkun|lammekød|tofu/.test(lower)) {
    return "protein";
  }
  if (/pasta|ris|brød|mel|havregryn|nudler|tortilla|kartofler|majs/.test(lower)) {
    return "carb";
  }
  if (/mælk|ost|yoghurt|fløde|smør|creme fraiche|skyr/.test(lower)) {
    return "dairy";
  }
  if (/broccoli|tomater|gulerødder|løg|hvidløg|spinat|salat|agurk|peberfrugt|squash|champignon|selleri|ærter/.test(lower)) {
    return "vegetable";
  }
  if (/salt|peber|basilikum|persille|koriander|ingefær|honning|sojasauce|eddike|bouillon/.test(lower)) {
    return "spice";
  }

  return "other";
}

function mapSpoonacularIngredients(
  recipe: SpoonacularRecipeResult,
): RecipeIngredient[] {
  const ingredients = recipe.extendedIngredients ?? [];

  return ingredients.map((ingredient) => {
    const sourceName =
      ingredient.nameClean || ingredient.originalName || ingredient.name;
    const normalizedName = normalizeIngredientName(sourceName);

    return {
      name: normalizedName,
      amount: Number.isFinite(ingredient.amount) ? ingredient.amount : 1,
      unit: mapSpoonacularUnit(ingredient.unit || "stk"),
      category: inferIngredientCategory(normalizedName),
    };
  });
}

function mapSpoonacularInstructions(recipe: SpoonacularRecipeResult): string[] {
  const steps =
    recipe.analyzedInstructions?.flatMap((section) => section.steps) ?? [];

  if (steps.length > 0) {
    return steps
      .sort((a, b) => a.number - b.number)
      .map((step) => step.step.trim())
      .filter(Boolean);
  }

  return [];
}

function inferMealType(dishTypes: string[] = []): RecipeMealType {
  const normalized = dishTypes.map((type) => type.toLowerCase());

  if (normalized.some((type) => type.includes("breakfast") || type === "morning meal")) {
    return "breakfast";
  }
  if (normalized.some((type) => type.includes("lunch") || type === "brunch")) {
    return "lunch";
  }
  if (
    normalized.some(
      (type) =>
        type.includes("dinner") ||
        type.includes("main course") ||
        type === "main dish",
    )
  ) {
    return "dinner";
  }

  return "lunch";
}

function inferDietFields(
  recipe: SpoonacularRecipeResult,
  ingredients: RecipeIngredient[],
): Pick<
  Recipe,
  | "dietTags"
  | "allergens"
  | "containsMeat"
  | "containsPork"
  | "containsFish"
  | "containsDairy"
  | "containsGluten"
  | "containsNuts"
> {
  const names = ingredients.map((ingredient) => ingredient.name.toLowerCase());

  const containsPork = names.some((name) => /svinekød|bacon|pølse/.test(name));
  const containsFish = names.some((name) => /laks|tun|fisk|rejer/.test(name));
  const containsMeat =
    !recipe.vegetarian &&
    (containsPork ||
      containsFish ||
      names.some((name) =>
        /kylling|oksekød|skinke|kalkun|lammekød|bacon|pølse/.test(name),
      ));
  const containsDairy =
    recipe.dairyFree !== true &&
    (ingredients.some((ingredient) => ingredient.category === "dairy") ||
      names.some((name) => /mælk|ost|yoghurt|fløde|smør|skyr|creme fraiche/.test(name)));
  const containsGluten =
    recipe.glutenFree !== true &&
    names.some((name) =>
      /mel|pasta|brød|havregryn|nudler|tortilla|bouillon/.test(name),
    );
  const containsNuts = names.some((name) =>
    /mandel|valnød|hasselnød|peanut|jordnød|nød/.test(name),
  );

  const dietTags = [...(recipe.diets ?? [])];
  if (recipe.vegetarian && !dietTags.includes("vegetar")) {
    dietTags.push("vegetar");
  }
  if (recipe.vegan && !dietTags.includes("vegansk")) {
    dietTags.push("vegansk");
  }
  if (recipe.glutenFree && !dietTags.includes("glutenfri")) {
    dietTags.push("glutenfri");
  }
  if (recipe.dairyFree && !dietTags.includes("laktosefri")) {
    dietTags.push("laktosefri");
  }

  const allergens: string[] = [];
  if (containsGluten) allergens.push("gluten");
  if (containsDairy) allergens.push("laktose");
  if (containsNuts) allergens.push("nødder");
  if (names.some((name) => /æg/.test(name))) allergens.push("æg");
  if (containsFish) allergens.push("fisk");

  return {
    dietTags,
    allergens,
    containsMeat,
    containsPork,
    containsFish,
    containsDairy,
    containsGluten,
    containsNuts,
  };
}

function buildTags(recipe: SpoonacularRecipeResult): string[] {
  const tags = new Set<string>();

  for (const dishType of recipe.dishTypes ?? []) {
    tags.add(dishType);
  }
  for (const cuisine of recipe.cuisines ?? []) {
    tags.add(cuisine);
  }
  if (recipe.cheap) tags.add("billig");
  if (recipe.veryHealthy) tags.add("sund");
  if (recipe.vegetarian) tags.add("vegetar");
  if (recipe.vegan) tags.add("vegansk");

  return [...tags].slice(0, 6);
}

export function mapSpoonacularRecipeToRecipe(
  recipe: SpoonacularRecipeResult,
  forcedMealType?: RecipeMealType,
): Recipe {
  const ingredients = mapSpoonacularIngredients(recipe);
  const dietFields = inferDietFields(recipe, ingredients);

  return {
    id: `spoonacular-${recipe.id}`,
    title: recipe.title,
    image: recipe.image?.trim() ? recipe.image : undefined,
    source: "spoonacular" as const,
    servings: Math.max(1, recipe.servings || 1),
    mealType: forcedMealType ?? inferMealType(recipe.dishTypes),
    estimatedTimeMinutes: Math.max(1, recipe.readyInMinutes || 30),
    tags: buildTags(recipe),
    ingredients,
    instructions: mapSpoonacularInstructions(recipe),
    ...dietFields,
  };
}

export const SPOONACULAR_RESULTS_PER_TYPE = 30;

function buildDietSearchParams(
  criteria: MealPlanCriteria,
  overrides: Partial<SpoonacularSearchParams> = {},
): SpoonacularSearchParams {
  return {
    vegetarian: criteria.vegetarian || undefined,
    glutenFree: criteria.glutenFree || undefined,
    lactoseFree: criteria.lactoseFree || undefined,
    nutFree: criteria.nutFree || undefined,
    number: SPOONACULAR_RESULTS_PER_TYPE,
    ...overrides,
  };
}

function paramsToQueryRecord(
  params: SpoonacularSearchParams,
): Record<string, string> {
  const query: Record<string, string> = {
    number: String(params.number ?? SPOONACULAR_RESULTS_PER_TYPE),
    offset: String(params.offset ?? 0),
  };

  if (params.type) query.type = params.type;
  if (params.vegetarian) query.vegetarian = "true";
  if (params.glutenFree) query.glutenFree = "true";
  if (params.lactoseFree) query.lactoseFree = "true";
  if (params.nutFree) query.nutFree = "true";
  if (params.includeIngredients) {
    query.includeIngredients = params.includeIngredients;
  }

  return query;
}

async function searchSpoonacularByType(
  criteria: MealPlanCriteria,
  mealType: RecipeMealType,
  spoonacularType: string,
  offset = 0,
): Promise<Recipe[]> {
  const params = buildDietSearchParams(criteria, {
    type: spoonacularType,
    offset,
  });
  const response = await apiGet<SpoonacularComplexSearchResponse>(
    "/api/recipes/search",
    { params: paramsToQueryRecord(params) },
  );

  return response.results.map((result) =>
    mapSpoonacularRecipeToRecipe(result, mealType),
  );
}

export type SpoonacularFetchByTypeResult = {
  breakfast: Recipe[];
  lunch: Recipe[];
  dinner: Recipe[];
};

/** Fetches Spoonacular recipes once per generation — one request per meal type. */
export async function fetchSpoonacularRecipesByMealType(
  criteria: MealPlanCriteria,
): Promise<SpoonacularFetchByTypeResult> {
  const [breakfast, lunch, dinner] = await Promise.all([
    searchSpoonacularByType(criteria, "breakfast", "breakfast"),
    searchSpoonacularByType(criteria, "lunch", "main course", 0),
    searchSpoonacularByType(criteria, "dinner", "main course", 30),
  ]);

  return { breakfast, lunch, dinner };
}
