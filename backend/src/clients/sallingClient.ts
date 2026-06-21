import { getEnv } from "../config/env.js";
import { SallingApiError } from "../lib/errors.js";
import type { SallingRecommendationFeedResponse, SallingRecommendationProduct } from "../types/salling/recommendationProduct.js";

/** Ensures requests always target the /v1 API root. */
function buildSallingUrl(path: string): string {
  const base = getEnv().SALLING_API_BASE_URL.replace(/\/+$/, "");
  const apiRoot = base.endsWith("/v1") ? base : `${base}/v1`;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${apiRoot}${normalizedPath}`;
}

export async function fetchRecommendationFeed(
  feedSlug: string,
): Promise<SallingRecommendationFeedResponse> {
  const env = getEnv();
  const url = buildSallingUrl(`/recommendations/most-bought/${feedSlug}/feed`);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), env.REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${env.SALLING_API_TOKEN}`,
        Accept: "application/json",
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw new SallingApiError(
        response.status,
        body || `Salling API returned ${response.status}`,
      );
    }

    return (await response.json()) as SallingRecommendationFeedResponse;
  } catch (error) {
    if (error instanceof SallingApiError) throw error;

    if (error instanceof Error && error.name === "AbortError") {
      throw new SallingApiError(504, "Salling API request timed out");
    }

    throw new SallingApiError(
      502,
      error instanceof Error ? error.message : "Failed to reach Salling API",
    );
  } finally {
    clearTimeout(timeout);
  }
}

export function extractFeedProducts(
  response: SallingRecommendationFeedResponse,
): SallingRecommendationProduct[] {
  if (Array.isArray(response)) return response;

  if ("products" in response && response.products) {
    return response.products;
  }

  if ("data" in response && response.data) {
    return response.data;
  }

  return [];
}
