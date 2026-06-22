export type SpoonacularExtendedIngredient = {
  id?: number;
  name: string;
  nameClean?: string;
  original: string;
  originalName: string;
  amount: number;
  unit: string;
  aisle?: string;
  meta?: string[];
};

export type SpoonacularInstructionStep = {
  number: number;
  step: string;
};

export type SpoonacularAnalyzedInstruction = {
  name?: string;
  steps: SpoonacularInstructionStep[];
};

export type SpoonacularRecipeResult = {
  id: number;
  title: string;
  image: string;
  imageType?: string;
  servings: number;
  readyInMinutes: number;
  dishTypes?: string[];
  diets?: string[];
  cuisines?: string[];
  extendedIngredients?: SpoonacularExtendedIngredient[];
  analyzedInstructions?: SpoonacularAnalyzedInstruction[];
  vegetarian?: boolean;
  vegan?: boolean;
  glutenFree?: boolean;
  dairyFree?: boolean;
  veryHealthy?: boolean;
  cheap?: boolean;
  sustainable?: boolean;
  lowFodmap?: boolean;
};

export type SpoonacularComplexSearchResponse = {
  results: SpoonacularRecipeResult[];
  offset: number;
  number: number;
  totalResults: number;
};
