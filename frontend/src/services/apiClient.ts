import { parseApiErrorResponse } from "@/lib/errors";

type ApiGetOptions = {
  params?: Record<string, string>;
};

export async function apiGet<T>(path: string, options: ApiGetOptions = {}): Promise<T> {
  const url = new URL(path, window.location.origin);

  if (options.params) {
    for (const [key, value] of Object.entries(options.params)) {
      url.searchParams.set(key, value);
    }
  }

  const response = await fetch(url.toString(), {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => undefined);
    throw parseApiErrorResponse(body, response.status);
  }

  return (await response.json()) as T;
}
