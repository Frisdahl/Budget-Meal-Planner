import cors from "cors";
import express from "express";
import { errorHandler } from "./middleware/errorHandler.js";
import { apiRateLimiter } from "./middleware/rateLimiter.js";
import { healthRouter } from "./routes/health.js";
import { productsRouter } from "./routes/products.js";
import { recipesRouter } from "./routes/recipes.js";

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use("/api", apiRateLimiter);

  app.use("/api/health", healthRouter);
  app.use("/api/products", productsRouter);
  app.use("/api/recipes", recipesRouter);

  app.use(errorHandler);

  return app;
}
