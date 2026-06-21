import type { ApiErrorBody } from "@/types/api/product";

export class ApiError extends Error {
  readonly code: string;
  readonly status: number;

  constructor(code: string, message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

export function parseApiErrorResponse(body: unknown, fallbackStatus: number): ApiError {
  const parsed = body as ApiErrorBody | undefined;
  if (parsed?.error) {
    return new ApiError(
      parsed.error.code,
      parsed.error.message,
      parsed.error.status,
    );
  }
  return new ApiError(
    "INTERNAL",
    "Der opstod en uventet fejl",
    fallbackStatus,
  );
}

const ERROR_MESSAGES: Record<string, string> = {
  SALLING_AUTH_ERROR: "Produktservice midlertidigt utilgængelig. Prøv igen senere.",
  SALLING_RATE_LIMIT: "For mange forespørgsler — vent et øjeblik og prøv igen.",
  SALLING_UNAVAILABLE: "Kunne ikke hente produkter lige nu.",
  SALLING_TIMEOUT: "Forespørgslen tog for lang tid. Prøv igen.",
  UNSUPPORTED_STORE: "Den valgte butik understøttes ikke endnu.",
  VALIDATION_ERROR: "Ugyldig forespørgsel.",
  INTERNAL: "Der opstod en uventet fejl.",
};

export function getErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    return ERROR_MESSAGES[error.code] ?? error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return ERROR_MESSAGES.INTERNAL;
}
