import rateLimit from "express-rate-limit";

export const apiRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      code: "SALLING_RATE_LIMIT",
      message: "For mange forespørgsler — prøv igen om lidt",
      status: 429,
    },
  },
});
