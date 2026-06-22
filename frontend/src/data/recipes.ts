export type IngredientUnit =
  | "g"
  | "kg"
  | "ml"
  | "l"
  | "stk"
  | "spsk"
  | "tsk";

export type RecipeMealType = "breakfast" | "lunch" | "dinner" | "snack";

export type RecipeSource = "spoonacular" | "local";

export type RecipeIngredient = {
  name: string;
  amount: number;
  unit: IngredientUnit;
  category?: "protein" | "carb" | "vegetable" | "dairy" | "spice" | "other";
};

export type Recipe = {
  id: string;
  title: string;
  image?: string;
  source?: RecipeSource;
  servings: number;
  mealType: RecipeMealType;
  estimatedDifficulty?: "easy" | "medium";
  estimatedTimeMinutes: number;
  tags: string[];
  ingredients: RecipeIngredient[];
  instructions: string[];
  dietTags: string[];
  allergens: string[];
  containsMeat?: boolean;
  containsPork?: boolean;
  containsFish?: boolean;
  containsDairy?: boolean;
  containsGluten?: boolean;
  containsNuts?: boolean;
};

type RecipeInput = Omit<Recipe, "dietTags" | "allergens"> & {
  dietTags?: string[];
  allergens?: string[];
};

function ingredientNames(recipe: RecipeInput): string[] {
  return recipe.ingredients.map((ingredient) => ingredient.name.toLowerCase());
}

function hasIngredientMatch(names: string[], pattern: RegExp): boolean {
  return names.some((name) => pattern.test(name));
}

function inferRecipeDietFields(input: RecipeInput): Pick<
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
  const names = ingredientNames(input);
  const containsPork = hasIngredientMatch(names, /svinekød/);
  const containsMeat =
    containsPork ||
    hasIngredientMatch(names, /kylling|oksekød|hakket oksekød/);
  const containsFish = hasIngredientMatch(names, /tun|laks|makrel/);
  const containsDairy =
    input.ingredients.some((ingredient) => ingredient.category === "dairy") ||
    hasIngredientMatch(names, /mælk|yoghurt|skyr|ost|fløde|smør|hytteost/);
  const containsGluten = hasIngredientMatch(
    names,
    /mel|pasta|spaghetti|lasagne|brød|rugbrød|knækbrød|tortilla|nudler|müsli/,
  );
  const containsNuts = hasIngredientMatch(
    names,
    /nød|mandel|valnød|hasselnød|peanut|jordnød/,
  );
  const containsEggs = hasIngredientMatch(names, /æg/);

  const dietTags = new Set<string>(input.dietTags ?? []);
  if (!containsMeat && !containsFish) {
    dietTags.add("vegetar");
  }
  if (!containsMeat && !containsFish && !containsDairy && !containsEggs) {
    dietTags.add("vegansk");
  }
  if (!containsGluten) {
    dietTags.add("glutenfri");
  }
  if (!containsDairy) {
    dietTags.add("laktosefri");
  }

  const allergens: string[] = [];
  if (containsGluten) allergens.push("gluten");
  if (containsDairy) allergens.push("laktose");
  if (containsNuts) allergens.push("nødder");
  if (containsFish) allergens.push("fisk");
  if (containsPork) allergens.push("svinekød");
  if (containsMeat && !containsPork) allergens.push("kød");

  return {
    dietTags: Array.from(dietTags),
    allergens,
    containsMeat,
    containsPork,
    containsFish,
    containsDairy,
    containsGluten,
    containsNuts,
  };
}

function recipe(input: RecipeInput): Recipe {
  const inferred = inferRecipeDietFields(input);

  return {
    ...input,
    dietTags: input.dietTags ?? inferred.dietTags,
    allergens: input.allergens ?? inferred.allergens,
    containsMeat: input.containsMeat ?? inferred.containsMeat,
    containsPork: input.containsPork ?? inferred.containsPork,
    containsFish: input.containsFish ?? inferred.containsFish,
    containsDairy: input.containsDairy ?? inferred.containsDairy,
    containsGluten: input.containsGluten ?? inferred.containsGluten,
    containsNuts: input.containsNuts ?? inferred.containsNuts,
  };
}

const rawRecipes: RecipeInput[] = [
  // ── Breakfast (10) ──
  {
    id: "bf-havregrod-maelk",
    title: "Havregrød med mælk",
    servings: 2,
    mealType: "breakfast",
    estimatedDifficulty: "easy",
    estimatedTimeMinutes: 10,
    tags: ["budget", "morgenmad"],
    ingredients: [
      { name: "havregryn", amount: 120, unit: "g", category: "carb" },
      { name: "mælk", amount: 400, unit: "ml", category: "dairy" },
      { name: "honning", amount: 2, unit: "spsk", category: "other" },
    ],
    instructions: ["Kog havregryn med mælk og servér med honning."],
  },
  {
    id: "bf-skyr-havregryn",
    title: "Skyr med havregryn",
    servings: 1,
    mealType: "breakfast",
    estimatedDifficulty: "easy",
    estimatedTimeMinutes: 5,
    tags: ["budget", "protein", "morgenmad"],
    ingredients: [
      { name: "skyr", amount: 200, unit: "g", category: "dairy" },
      { name: "havregryn", amount: 50, unit: "g", category: "carb" },
      { name: "banan", amount: 1, unit: "stk", category: "other" },
    ],
    instructions: ["Bland skyr, havregryn og skivet banan."],
  },
  {
    id: "bf-rugbrod-aeg",
    title: "Rugbrød med æg",
    servings: 2,
    mealType: "breakfast",
    estimatedDifficulty: "easy",
    estimatedTimeMinutes: 12,
    tags: ["budget", "hurtig"],
    ingredients: [
      { name: "rugbrød", amount: 4, unit: "stk", category: "carb" },
      { name: "æg", amount: 4, unit: "stk", category: "protein" },
      { name: "smør", amount: 20, unit: "g", category: "dairy" },
    ],
    instructions: ["Kog æg og server på rugbrød med smør."],
  },
  {
    id: "bf-yoghurt-musli",
    title: "Yoghurt med müsli",
    servings: 1,
    mealType: "breakfast",
    estimatedDifficulty: "easy",
    estimatedTimeMinutes: 5,
    tags: ["budget", "vegetar"],
    ingredients: [
      { name: "yoghurt", amount: 200, unit: "g", category: "dairy" },
      { name: "müsli", amount: 50, unit: "g", category: "carb" },
      { name: "banan", amount: 1, unit: "stk", category: "other" },
    ],
    instructions: ["Kom yoghurt i skål, top med müsli og banan."],
  },
  {
    id: "bf-roraeg-rugbrod",
    title: "Røræg med rugbrød",
    servings: 2,
    mealType: "breakfast",
    estimatedDifficulty: "easy",
    estimatedTimeMinutes: 10,
    tags: ["budget", "hurtig"],
    ingredients: [
      { name: "æg", amount: 4, unit: "stk", category: "protein" },
      { name: "mælk", amount: 50, unit: "ml", category: "dairy" },
      { name: "rugbrød", amount: 4, unit: "stk", category: "carb" },
    ],
    instructions: ["Pisk og steg røræg, server med rugbrød."],
  },
  {
    id: "bf-bircher-musli",
    title: "Bircher müsli",
    servings: 2,
    mealType: "breakfast",
    estimatedDifficulty: "easy",
    estimatedTimeMinutes: 8,
    tags: ["budget", "sund"],
    ingredients: [
      { name: "havregryn", amount: 100, unit: "g", category: "carb" },
      { name: "yoghurt", amount: 200, unit: "g", category: "dairy" },
      { name: "mælk", amount: 100, unit: "ml", category: "dairy" },
      { name: "æble", amount: 1, unit: "stk", category: "other" },
    ],
    instructions: ["Bland havregryn, yoghurt og mælk, tilsæt revet æble."],
  },
  {
    id: "bf-toast-ost",
    title: "Toast med ost",
    servings: 2,
    mealType: "breakfast",
    estimatedDifficulty: "easy",
    estimatedTimeMinutes: 8,
    tags: ["budget", "hurtig"],
    ingredients: [
      { name: "brød", amount: 4, unit: "stk", category: "carb" },
      { name: "ost", amount: 80, unit: "g", category: "dairy" },
      { name: "smør", amount: 15, unit: "g", category: "dairy" },
    ],
    instructions: ["Rist brød, læg ost på og varm i ovn eller pande."],
  },
  {
    id: "bf-smoothie-banan",
    title: "Smoothie med banan",
    servings: 2,
    mealType: "breakfast",
    estimatedDifficulty: "easy",
    estimatedTimeMinutes: 5,
    tags: ["budget", "hurtig", "vegetar"],
    ingredients: [
      { name: "banan", amount: 2, unit: "stk", category: "other" },
      { name: "mælk", amount: 300, unit: "ml", category: "dairy" },
      { name: "yoghurt", amount: 150, unit: "g", category: "dairy" },
    ],
    instructions: ["Blend banan, mælk og yoghurt."],
  },
  {
    id: "bf-havregrød-skyr",
    title: "Havregrød med skyr",
    servings: 2,
    mealType: "breakfast",
    estimatedDifficulty: "easy",
    estimatedTimeMinutes: 10,
    tags: ["budget", "protein"],
    ingredients: [
      { name: "havregryn", amount: 120, unit: "g", category: "carb" },
      { name: "mælk", amount: 300, unit: "ml", category: "dairy" },
      { name: "skyr", amount: 150, unit: "g", category: "dairy" },
    ],
    instructions: ["Kog havregryn, top med skyr."],
  },
  {
    id: "bf-pandekager",
    title: "Pandekager",
    servings: 3,
    mealType: "breakfast",
    estimatedDifficulty: "medium",
    estimatedTimeMinutes: 20,
    tags: ["budget", "familie"],
    ingredients: [
      { name: "mel", amount: 200, unit: "g", category: "carb" },
      { name: "æg", amount: 2, unit: "stk", category: "protein" },
      { name: "mælk", amount: 300, unit: "ml", category: "dairy" },
      { name: "syltetøj", amount: 3, unit: "spsk", category: "other" },
    ],
    instructions: ["Pisk dej, steg pandekager og server med syltetøj."],
  },

  // ── Lunch (10) ──
  {
    id: "lu-rugbrod-aeg",
    title: "Rugbrød med æg",
    servings: 2,
    mealType: "lunch",
    estimatedDifficulty: "easy",
    estimatedTimeMinutes: 12,
    tags: ["budget", "frokost"],
    ingredients: [
      { name: "rugbrød", amount: 4, unit: "stk", category: "carb" },
      { name: "æg", amount: 4, unit: "stk", category: "protein" },
      { name: "mayonnaise", amount: 2, unit: "spsk", category: "other" },
    ],
    instructions: ["Kog æg, skær på rugbrød med mayonnaise."],
  },
  {
    id: "lu-pastasalat-kylling",
    title: "Pastasalat med kylling",
    servings: 3,
    mealType: "lunch",
    estimatedDifficulty: "easy",
    estimatedTimeMinutes: 20,
    tags: ["budget", "protein"],
    ingredients: [
      { name: "pasta", amount: 250, unit: "g", category: "carb" },
      { name: "kylling", amount: 300, unit: "g", category: "protein" },
      { name: "tomater", amount: 200, unit: "g", category: "vegetable" },
      { name: "mayonnaise", amount: 3, unit: "spsk", category: "other" },
    ],
    instructions: ["Kog pasta, bland med kylling, tomater og mayonnaise."],
  },
  {
    id: "lu-tun-sandwich",
    title: "Tun sandwich",
    servings: 2,
    mealType: "lunch",
    estimatedDifficulty: "easy",
    estimatedTimeMinutes: 10,
    tags: ["budget", "hurtig"],
    ingredients: [
      { name: "brød", amount: 4, unit: "stk", category: "carb" },
      { name: "tun", amount: 2, unit: "stk", category: "protein" },
      { name: "mayonnaise", amount: 2, unit: "spsk", category: "other" },
      { name: "salat", amount: 1, unit: "stk", category: "vegetable" },
    ],
    instructions: ["Bland tun med mayonnaise og læg på brød med salat."],
  },
  {
    id: "lu-wrap-kylling",
    title: "Wrap med kylling",
    servings: 2,
    mealType: "lunch",
    estimatedDifficulty: "easy",
    estimatedTimeMinutes: 15,
    tags: ["budget", "hurtig"],
    ingredients: [
      { name: "tortilla", amount: 4, unit: "stk", category: "carb" },
      { name: "kylling", amount: 300, unit: "g", category: "protein" },
      { name: "salat", amount: 1, unit: "stk", category: "vegetable" },
      { name: "tomater", amount: 150, unit: "g", category: "vegetable" },
    ],
    instructions: ["Steg kylling og fyld tortillaer med salat og tomater."],
  },
  {
    id: "lu-kartoffelmad",
    title: "Kartoffelmad",
    servings: 2,
    mealType: "lunch",
    estimatedDifficulty: "easy",
    estimatedTimeMinutes: 25,
    tags: ["budget", "dansk"],
    ingredients: [
      { name: "kartofler", amount: 500, unit: "g", category: "carb" },
      { name: "mayonnaise", amount: 3, unit: "spsk", category: "other" },
      { name: "rugbrød", amount: 4, unit: "stk", category: "carb" },
      { name: "løg", amount: 1, unit: "stk", category: "vegetable" },
    ],
    instructions: ["Kog kartofler, bland med mayo og løg, server på rugbrød."],
  },
  {
    id: "lu-rugbrod-tun",
    title: "Rugbrød med tun",
    servings: 2,
    mealType: "lunch",
    estimatedDifficulty: "easy",
    estimatedTimeMinutes: 8,
    tags: ["budget", "hurtig"],
    ingredients: [
      { name: "rugbrød", amount: 4, unit: "stk", category: "carb" },
      { name: "tun", amount: 2, unit: "stk", category: "protein" },
      { name: "mayonnaise", amount: 2, unit: "spsk", category: "other" },
    ],
    instructions: ["Bland tun med mayo og smør på rugbrød."],
  },
  {
    id: "lu-salat-kylling",
    title: "Salat med kylling",
    servings: 2,
    mealType: "lunch",
    estimatedDifficulty: "easy",
    estimatedTimeMinutes: 15,
    tags: ["budget", "sund"],
    ingredients: [
      { name: "salat", amount: 1, unit: "stk", category: "vegetable" },
      { name: "kylling", amount: 250, unit: "g", category: "protein" },
      { name: "tomater", amount: 150, unit: "g", category: "vegetable" },
      { name: "majs", amount: 100, unit: "g", category: "vegetable" },
    ],
    instructions: ["Steg kylling og vend i salat med tomater og majs."],
  },
  {
    id: "lu-tomatsuppe-brod",
    title: "Tomatsuppe med brød",
    servings: 3,
    mealType: "lunch",
    estimatedDifficulty: "easy",
    estimatedTimeMinutes: 20,
    tags: ["budget", "vegetar"],
    ingredients: [
      { name: "tomater", amount: 600, unit: "g", category: "vegetable" },
      { name: "løg", amount: 1, unit: "stk", category: "vegetable" },
      { name: "fløde", amount: 100, unit: "ml", category: "dairy" },
      { name: "brød", amount: 4, unit: "stk", category: "carb" },
    ],
    instructions: ["Kog suppe af tomater og løg, server med brød."],
  },
  {
    id: "lu-pastasalat-tun",
    title: "Pastasalat med tun",
    servings: 3,
    mealType: "lunch",
    estimatedDifficulty: "easy",
    estimatedTimeMinutes: 18,
    tags: ["budget"],
    ingredients: [
      { name: "pasta", amount: 250, unit: "g", category: "carb" },
      { name: "tun", amount: 2, unit: "stk", category: "protein" },
      { name: "majs", amount: 150, unit: "g", category: "vegetable" },
      { name: "mayonnaise", amount: 3, unit: "spsk", category: "other" },
    ],
    instructions: ["Kog pasta og bland med tun, majs og mayonnaise."],
  },
  {
    id: "lu-quesadilla-ost",
    title: "Quesadilla med ost",
    servings: 2,
    mealType: "lunch",
    estimatedDifficulty: "easy",
    estimatedTimeMinutes: 12,
    tags: ["budget", "vegetar"],
    ingredients: [
      { name: "tortilla", amount: 4, unit: "stk", category: "carb" },
      { name: "ost", amount: 120, unit: "g", category: "dairy" },
      { name: "tomater", amount: 100, unit: "g", category: "vegetable" },
    ],
    instructions: ["Læg ost og tomater i tortilla, varm på pande."],
  },

  // ── Dinner (20) ──
  {
    id: "di-pasta-kylling-broccoli",
    title: "Pasta med kylling og broccoli",
    servings: 4,
    mealType: "dinner",
    estimatedDifficulty: "easy",
    estimatedTimeMinutes: 30,
    tags: ["budget", "protein"],
    ingredients: [
      { name: "pasta", amount: 400, unit: "g", category: "carb" },
      { name: "kylling", amount: 500, unit: "g", category: "protein" },
      { name: "broccoli", amount: 300, unit: "g", category: "vegetable" },
      { name: "fløde", amount: 200, unit: "ml", category: "dairy" },
    ],
    instructions: ["Kog pasta, steg kylling og broccoli i fløde, vend sammen."],
  },
  {
    id: "di-chili-con-carne",
    title: "Chili con carne",
    servings: 4,
    mealType: "dinner",
    estimatedDifficulty: "medium",
    estimatedTimeMinutes: 40,
    tags: ["budget", "batch"],
    ingredients: [
      { name: "oksekød", amount: 400, unit: "g", category: "protein" },
      { name: "kidneybønner", amount: 400, unit: "g", category: "protein" },
      { name: "tomater", amount: 400, unit: "g", category: "vegetable" },
      { name: "ris", amount: 300, unit: "g", category: "carb" },
    ],
    instructions: ["Brun kød, tilsæt tomater og bønner, server med ris."],
  },
  {
    id: "di-ris-karrykylling",
    title: "Ris med karrykylling",
    servings: 4,
    mealType: "dinner",
    estimatedDifficulty: "easy",
    estimatedTimeMinutes: 30,
    tags: ["budget"],
    ingredients: [
      { name: "kylling", amount: 500, unit: "g", category: "protein" },
      { name: "ris", amount: 300, unit: "g", category: "carb" },
      { name: "karry", amount: 2, unit: "spsk", category: "spice" },
      { name: "kokosmælk", amount: 400, unit: "ml", category: "other" },
    ],
    instructions: ["Kog ris, steg kylling i karry og kokosmælk."],
  },
  {
    id: "di-kartoffel-porresuppe",
    title: "Kartoffel-porresuppe",
    servings: 4,
    mealType: "dinner",
    estimatedDifficulty: "easy",
    estimatedTimeMinutes: 35,
    tags: ["budget", "vegetar"],
    ingredients: [
      { name: "kartofler", amount: 600, unit: "g", category: "carb" },
      { name: "porrer", amount: 2, unit: "stk", category: "vegetable" },
      { name: "grøntsagsbouillon", amount: 1, unit: "l", category: "other" },
      { name: "fløde", amount: 100, unit: "ml", category: "dairy" },
    ],
    instructions: ["Kog kartofler og porrer, blend til suppe."],
  },
  {
    id: "di-aeggekage-rugbrod",
    title: "Æggekage med rugbrød",
    servings: 2,
    mealType: "dinner",
    estimatedDifficulty: "easy",
    estimatedTimeMinutes: 20,
    tags: ["budget", "hurtig"],
    ingredients: [
      { name: "æg", amount: 6, unit: "stk", category: "protein" },
      { name: "mælk", amount: 100, unit: "ml", category: "dairy" },
      { name: "rugbrød", amount: 4, unit: "stk", category: "carb" },
    ],
    instructions: ["Lav æggekage og server med rugbrød."],
  },
  {
    id: "di-wok-nudler",
    title: "Wok med nudler og grøntsager",
    servings: 4,
    mealType: "dinner",
    estimatedDifficulty: "easy",
    estimatedTimeMinutes: 25,
    tags: ["budget", "vegetar"],
    ingredients: [
      { name: "nudler", amount: 300, unit: "g", category: "carb" },
      { name: "wokgrøntsager", amount: 400, unit: "g", category: "vegetable" },
      { name: "sojasauce", amount: 3, unit: "spsk", category: "spice" },
      { name: "æg", amount: 2, unit: "stk", category: "protein" },
    ],
    instructions: ["Wok nudler med grøntsager, sojasauce og æg."],
  },
  {
    id: "di-lasagne",
    title: "Lasagne",
    servings: 6,
    mealType: "dinner",
    estimatedDifficulty: "medium",
    estimatedTimeMinutes: 50,
    tags: ["budget", "familie"],
    ingredients: [
      { name: "lasagneplader", amount: 250, unit: "g", category: "carb" },
      { name: "oksekød", amount: 500, unit: "g", category: "protein" },
      { name: "tomater", amount: 400, unit: "g", category: "vegetable" },
      { name: "ost", amount: 150, unit: "g", category: "dairy" },
    ],
    instructions: ["Lag lasagne med kødsauce, tomater og ost, bag i ovn."],
  },
  {
    id: "di-frikadeller-kartofler",
    title: "Frikadeller med kartofler",
    servings: 4,
    mealType: "dinner",
    estimatedDifficulty: "medium",
    estimatedTimeMinutes: 40,
    tags: ["budget", "dansk"],
    ingredients: [
      { name: "hakket svinekød", amount: 500, unit: "g", category: "protein" },
      { name: "æg", amount: 1, unit: "stk", category: "protein" },
      { name: "løg", amount: 1, unit: "stk", category: "vegetable" },
      { name: "kartofler", amount: 800, unit: "g", category: "carb" },
    ],
    instructions: ["Form frikadeller, steg og server med kogte kartofler."],
  },
  {
    id: "di-boller-i-karry",
    title: "Boller i karry",
    servings: 4,
    mealType: "dinner",
    estimatedDifficulty: "medium",
    estimatedTimeMinutes: 35,
    tags: ["budget", "dansk"],
    ingredients: [
      { name: "hakket svinekød", amount: 400, unit: "g", category: "protein" },
      { name: "ris", amount: 300, unit: "g", category: "carb" },
      { name: "karry", amount: 2, unit: "spsk", category: "spice" },
      { name: "fløde", amount: 200, unit: "ml", category: "dairy" },
    ],
    instructions: ["Steg boller, lav karrysauce med fløde, server med ris."],
  },
  {
    id: "di-tortilla-wraps-oksekod",
    title: "Tortilla wraps med oksekød",
    servings: 4,
    mealType: "dinner",
    estimatedDifficulty: "easy",
    estimatedTimeMinutes: 25,
    tags: ["budget", "familie"],
    ingredients: [
      { name: "oksekød", amount: 400, unit: "g", category: "protein" },
      { name: "tortilla", amount: 8, unit: "stk", category: "carb" },
      { name: "salat", amount: 1, unit: "stk", category: "vegetable" },
      { name: "ost", amount: 100, unit: "g", category: "dairy" },
    ],
    instructions: ["Steg oksekød og fyld tortillaer med salat og ost."],
  },
  {
    id: "di-tun-pasta",
    title: "Pasta med tun og majs",
    servings: 3,
    mealType: "dinner",
    estimatedDifficulty: "easy",
    estimatedTimeMinutes: 20,
    tags: ["budget", "hurtig"],
    ingredients: [
      { name: "pasta", amount: 300, unit: "g", category: "carb" },
      { name: "tun", amount: 2, unit: "stk", category: "protein" },
      { name: "majs", amount: 200, unit: "g", category: "vegetable" },
      { name: "fløde", amount: 100, unit: "ml", category: "dairy" },
    ],
    instructions: ["Kog pasta, vend med tun, majs og fløde."],
  },
  {
    id: "di-kyllingefars-pytt",
    title: "Kyllingefars-pytt i panna",
    servings: 4,
    mealType: "dinner",
    estimatedDifficulty: "easy",
    estimatedTimeMinutes: 30,
    tags: ["budget"],
    ingredients: [
      { name: "kylling", amount: 500, unit: "g", category: "protein" },
      { name: "kartofler", amount: 500, unit: "g", category: "carb" },
      { name: "løg", amount: 2, unit: "stk", category: "vegetable" },
      { name: "æg", amount: 4, unit: "stk", category: "protein" },
    ],
    instructions: ["Steg kartofler, løg og kylling, top med spejlæg."],
  },
  {
    id: "di-tomatsuppe-pasta",
    title: "Tomatsuppe med pasta",
    servings: 4,
    mealType: "dinner",
    estimatedDifficulty: "easy",
    estimatedTimeMinutes: 30,
    tags: ["budget", "vegetar"],
    ingredients: [
      { name: "tomater", amount: 800, unit: "g", category: "vegetable" },
      { name: "pasta", amount: 200, unit: "g", category: "carb" },
      { name: "løg", amount: 1, unit: "stk", category: "vegetable" },
      { name: "fløde", amount: 100, unit: "ml", category: "dairy" },
    ],
    instructions: ["Kog tomatsuppe og tilsæt kogt pasta."],
  },
  {
    id: "di-spaghetti-kodsovs",
    title: "Spaghetti med kødsovs",
    servings: 4,
    mealType: "dinner",
    estimatedDifficulty: "medium",
    estimatedTimeMinutes: 35,
    tags: ["budget", "familie"],
    ingredients: [
      { name: "spaghetti", amount: 400, unit: "g", category: "carb" },
      { name: "hakket oksekød", amount: 400, unit: "g", category: "protein" },
      { name: "tomater", amount: 400, unit: "g", category: "vegetable" },
      { name: "løg", amount: 1, unit: "stk", category: "vegetable" },
    ],
    instructions: ["Kog spaghetti, lav kødsovs af oksekød og tomater."],
  },
  {
    id: "di-kartoffel-gulerodssuppe",
    title: "Kartoffel-gulerodssuppe",
    servings: 4,
    mealType: "dinner",
    estimatedDifficulty: "easy",
    estimatedTimeMinutes: 30,
    tags: ["budget", "vegetar"],
    ingredients: [
      { name: "kartofler", amount: 400, unit: "g", category: "carb" },
      { name: "gulerødder", amount: 300, unit: "g", category: "vegetable" },
      { name: "grøntsagsbouillon", amount: 1, unit: "l", category: "other" },
      { name: "fløde", amount: 100, unit: "ml", category: "dairy" },
    ],
    instructions: ["Kog grøntsager i bouillon og blend til suppe."],
  },
  {
    id: "di-laks-kartofler",
    title: "Laks med kartofler",
    servings: 2,
    mealType: "dinner",
    estimatedDifficulty: "medium",
    estimatedTimeMinutes: 30,
    tags: ["protein", "sund"],
    ingredients: [
      { name: "laks", amount: 300, unit: "g", category: "protein" },
      { name: "kartofler", amount: 400, unit: "g", category: "carb" },
      { name: "citron", amount: 1, unit: "stk", category: "other" },
      { name: "smør", amount: 20, unit: "g", category: "dairy" },
    ],
    instructions: ["Bag laks og server med kogte kartofler og citron."],
  },
  {
    id: "di-grøntsagsgryde",
    title: "Grøntsagsgryde med bønner",
    servings: 4,
    mealType: "dinner",
    estimatedDifficulty: "easy",
    estimatedTimeMinutes: 30,
    tags: ["budget", "vegetar"],
    ingredients: [
      { name: "kidneybønner", amount: 400, unit: "g", category: "protein" },
      { name: "tomater", amount: 400, unit: "g", category: "vegetable" },
      { name: "kartofler", amount: 300, unit: "g", category: "carb" },
      { name: "løg", amount: 1, unit: "stk", category: "vegetable" },
    ],
    instructions: ["Simr bønner, tomater, kartofler og løg i gryde."],
  },
  {
    id: "di-kylling-suppe",
    title: "Kyllingesuppe med grøntsager",
    servings: 4,
    mealType: "dinner",
    estimatedDifficulty: "easy",
    estimatedTimeMinutes: 35,
    tags: ["budget"],
    ingredients: [
      { name: "kylling", amount: 400, unit: "g", category: "protein" },
      { name: "gulerødder", amount: 200, unit: "g", category: "vegetable" },
      { name: "kartofler", amount: 300, unit: "g", category: "carb" },
      { name: "grøntsagsbouillon", amount: 1, unit: "l", category: "other" },
    ],
    instructions: ["Kog kylling med grøntsager i bouillon."],
  },
  {
    id: "di-makrel-rugbrod",
    title: "Makrel i tomat med rugbrød",
    servings: 2,
    mealType: "dinner",
    estimatedDifficulty: "easy",
    estimatedTimeMinutes: 10,
    tags: ["budget", "hurtig"],
    ingredients: [
      { name: "makrel", amount: 2, unit: "stk", category: "protein" },
      { name: "rugbrød", amount: 4, unit: "stk", category: "carb" },
      { name: "løg", amount: 1, unit: "stk", category: "vegetable" },
    ],
    instructions: ["Server makrel på rugbrød med løg."],
  },
  {
    id: "di-hakkebof-kartofler",
    title: "Hakkebøffer med kartofler",
    servings: 4,
    mealType: "dinner",
    estimatedDifficulty: "medium",
    estimatedTimeMinutes: 35,
    tags: ["budget", "dansk"],
    ingredients: [
      { name: "hakket oksekød", amount: 500, unit: "g", category: "protein" },
      { name: "løg", amount: 1, unit: "stk", category: "vegetable" },
      { name: "kartofler", amount: 700, unit: "g", category: "carb" },
      { name: "smør", amount: 30, unit: "g", category: "dairy" },
    ],
    instructions: ["Form og steg hakkebøffer, server med kartofler."],
  },

  // ── Snack (8) ──
  {
    id: "sn-banan",
    title: "Banan",
    servings: 1,
    mealType: "snack",
    estimatedDifficulty: "easy",
    estimatedTimeMinutes: 2,
    tags: ["budget", "hurtig"],
    ingredients: [{ name: "banan", amount: 1, unit: "stk", category: "other" }],
    instructions: ["Spis banan som snack."],
  },
  {
    id: "sn-skyr",
    title: "Skyr",
    servings: 1,
    mealType: "snack",
    estimatedDifficulty: "easy",
    estimatedTimeMinutes: 2,
    tags: ["budget", "protein"],
    ingredients: [{ name: "skyr", amount: 150, unit: "g", category: "dairy" }],
    instructions: ["Spis skyr som snack."],
  },
  {
    id: "sn-knaekbrod-ost",
    title: "Knækbrød med ost",
    servings: 1,
    mealType: "snack",
    estimatedDifficulty: "easy",
    estimatedTimeMinutes: 5,
    tags: ["budget"],
    ingredients: [
      { name: "knækbrød", amount: 3, unit: "stk", category: "carb" },
      { name: "ost", amount: 50, unit: "g", category: "dairy" },
    ],
    instructions: ["Top knækbrød med ost."],
  },
  {
    id: "sn-guleroedder-dip",
    title: "Gulerødder med dip",
    servings: 2,
    mealType: "snack",
    estimatedDifficulty: "easy",
    estimatedTimeMinutes: 5,
    tags: ["budget", "sund"],
    ingredients: [
      { name: "gulerødder", amount: 200, unit: "g", category: "vegetable" },
      { name: "yoghurt", amount: 100, unit: "g", category: "dairy" },
    ],
    instructions: ["Skær gulerødder i stave og server med yoghurt-dip."],
  },
  {
    id: "sn-aebler",
    title: "Æbleskiver",
    servings: 1,
    mealType: "snack",
    estimatedDifficulty: "easy",
    estimatedTimeMinutes: 3,
    tags: ["budget", "sund"],
    ingredients: [{ name: "æble", amount: 1, unit: "stk", category: "other" }],
    instructions: ["Skær æble i skiver."],
  },
  {
    id: "sn-havregryn-bar",
    title: "Havregrynsbar",
    servings: 2,
    mealType: "snack",
    estimatedDifficulty: "easy",
    estimatedTimeMinutes: 8,
    tags: ["budget"],
    ingredients: [
      { name: "havregryn", amount: 80, unit: "g", category: "carb" },
      { name: "honning", amount: 2, unit: "spsk", category: "other" },
      { name: "smør", amount: 15, unit: "g", category: "dairy" },
    ],
    instructions: ["Bland havregryn, honning og smør, form barer."],
  },
  {
    id: "sn-popcorn",
    title: "Popcorn",
    servings: 2,
    mealType: "snack",
    estimatedDifficulty: "easy",
    estimatedTimeMinutes: 8,
    tags: ["budget"],
    ingredients: [
      { name: "majs", amount: 80, unit: "g", category: "carb" },
      { name: "smør", amount: 15, unit: "g", category: "dairy" },
    ],
    instructions: ["Pop majs og vend med smeltet smør."],
  },
  {
    id: "sn-cottage-cheese",
    title: "Hytteost med tomater",
    servings: 1,
    mealType: "snack",
    estimatedDifficulty: "easy",
    estimatedTimeMinutes: 5,
    tags: ["budget", "protein"],
    ingredients: [
      { name: "hytteost", amount: 150, unit: "g", category: "dairy" },
      { name: "tomater", amount: 100, unit: "g", category: "vegetable" },
    ],
    instructions: ["Server hytteost med skivede tomater."],
  },
];

const recipes: Recipe[] = rawRecipes.map(recipe);

const externalRecipes = new Map<string, Recipe>();

export function getLocalRecipes(): Recipe[] {
  return recipes;
}

export function registerExternalRecipes(nextRecipes: Recipe[]): void {
  for (const recipe of nextRecipes) {
    externalRecipes.set(recipe.id, recipe);
  }
}

export function clearExternalRecipes(): void {
  externalRecipes.clear();
}

export function getAllRecipes(): Recipe[] {
  const localIds = new Set(recipes.map((recipe) => recipe.id));
  const external = [...externalRecipes.values()].filter(
    (recipe) => !localIds.has(recipe.id),
  );
  return [...recipes, ...external];
}

export function getRecipeById(id: string): Recipe | undefined {
  return externalRecipes.get(id) ?? recipes.find((recipe) => recipe.id === id);
}

export function getRecipesByMealType(mealType: RecipeMealType): Recipe[] {
  return recipes.filter((recipe) => recipe.mealType === mealType);
}
