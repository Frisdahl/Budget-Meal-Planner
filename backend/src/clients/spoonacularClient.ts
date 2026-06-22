import { getEnv } from "../config/env.js";
import { AppError } from "../lib/errors.js";
import type { SpoonacularComplexSearchResponse } from "../types/spoonacular/complexSearch.js";

export type SpoonacularSearchParams = {
  number?: number;
  offset?: number;
  type?: string;
  diet?: string;
  intolerances?: string;
  includeIngredients?: string;
};

function mapSpoonacularHttpStatus(status: number): {
  code: "SPOONACULAR_AUTH_ERROR" | "SPOONACULAR_QUOTA_EXCEEDED" | "SPOONACULAR_UNAVAILABLE";
  message: string;
  status: number;
} {
  if (status === 401 || status === 403) {
    return {
      code: "SPOONACULAR_AUTH_ERROR",
      message: "Spoonacular API key missing or invalid",
      status: 401,
    };
  }

  if (status === 402) {
    return {
      code: "SPOONACULAR_QUOTA_EXCEEDED",
      message: "Spoonacular quota exceeded",
      status: 402,
    };
  }

  if (status === 408 || status === 504) {
    return {
      code: "SPOONACULAR_UNAVAILABLE",
      message: "Spoonacular API request timed out",
      status: 502,
    };
  }

  return {
    code: "SPOONACULAR_UNAVAILABLE",
    message: `Spoonacular API returned ${status}`,
    status: 502,
  };
}

export class SpoonacularApiError extends AppError {
  readonly spoonacularStatus: number;

  constructor(spoonacularStatus: number, detail?: string) {
    const mapped = mapSpoonacularHttpStatus(spoonacularStatus);
    super(mapped.code, detail ?? mapped.message, mapped.status);
    this.name = "SpoonacularApiError";
    this.spoonacularStatus = spoonacularStatus;
  }
}

export async function fetchComplexSearch(
  params: SpoonacularSearchParams,
): Promise<SpoonacularComplexSearchResponse> {
  const env = getEnv();
  const apiKey = env.SPOONACULAR_API_KEY;

  if (!apiKey) {
    throw new AppError(
      "SPOONACULAR_AUTH_ERROR",
      "Spoonacular API key missing or invalid",
      401,
    );
  }

  const url = new URL("https://api.spoonacular.com/recipes/complexSearch");
  url.searchParams.set("apiKey", apiKey);
  url.searchParams.set("number", String(Math.min(params.number ?? 12, 30)));
  url.searchParams.set("addRecipeInformation", "true");
  url.searchParams.set("fillIngredients", "true");
  url.searchParams.set("instructionsRequired", "true");

  if (params.type) {
    url.searchParams.set("type", params.type);
  }
  if (params.offset != null && params.offset > 0) {
    url.searchParams.set("offset", String(params.offset));
  }
  if (params.diet) {
    url.searchParams.set("diet", params.diet);
  }
  if (params.intolerances) {
    url.searchParams.set("intolerances", params.intolerances);
  }
  if (params.includeIngredients) {
    url.searchParams.set("includeIngredients", params.includeIngredients);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), env.REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url.toString(), {
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new SpoonacularApiError(response.status);
    }

    return (await response.json()) as SpoonacularComplexSearchResponse;
  } catch (error) {
    if (error instanceof SpoonacularApiError || error instanceof AppError) {
      throw error;
    }

    if (error instanceof Error && error.name === "AbortError") {
      throw new SpoonacularApiError(504);
    }

    throw new SpoonacularApiError(
      502,
      error instanceof Error ? error.message : "Failed to reach Spoonacular API",
    );
  } finally {
    clearTimeout(timeout);
  }
}
