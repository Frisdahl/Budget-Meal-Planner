export type ErrorCode =
  | "VALIDATION_ERROR"
  | "UNSUPPORTED_STORE"
  | "SALLING_AUTH_ERROR"
  | "SALLING_RATE_LIMIT"
  | "SALLING_UNAVAILABLE"
  | "SALLING_TIMEOUT"
  | "SPOONACULAR_NOT_CONFIGURED"
  | "SPOONACULAR_AUTH_ERROR"
  | "SPOONACULAR_QUOTA_EXCEEDED"
  | "SPOONACULAR_UNAVAILABLE"
  | "INTERNAL";

export class AppError extends Error {
  readonly code: ErrorCode;
  readonly status: number;

  constructor(code: ErrorCode, message: string, status: number) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.status = status;
  }
}

export class SallingApiError extends AppError {
  readonly sallingStatus: number;

  constructor(sallingStatus: number, message: string) {
    const { code, status } = mapSallingStatus(sallingStatus);
    super(code, message, status);
    this.name = "SallingApiError";
    this.sallingStatus = sallingStatus;
  }
}

function mapSallingStatus(status: number): { code: ErrorCode; status: number } {
  if (status === 401 || status === 403) {
    return { code: "SALLING_AUTH_ERROR", status: 502 };
  }
  if (status === 429) {
    return { code: "SALLING_RATE_LIMIT", status: 429 };
  }
  if (status === 408 || status === 504) {
    return { code: "SALLING_TIMEOUT", status: 504 };
  }
  if (status >= 500) {
    return { code: "SALLING_UNAVAILABLE", status: 502 };
  }
  return { code: "SALLING_UNAVAILABLE", status: 502 };
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}
