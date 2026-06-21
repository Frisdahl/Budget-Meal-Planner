import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { isAppError } from "../lib/errors.js";

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  void _next;
  if (error instanceof ZodError) {
    res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: error.issues[0]?.message ?? "Invalid request",
        status: 400,
      },
    });
    return;
  }

  if (isAppError(error)) {
    res.status(error.status).json({
      error: {
        code: error.code,
        message: error.message,
        status: error.status,
      },
    });
    return;
  }

  console.error("Unhandled error:", error);
  res.status(500).json({
    error: {
      code: "INTERNAL",
      message: "Der opstod en uventet fejl",
      status: 500,
    },
  });
}
