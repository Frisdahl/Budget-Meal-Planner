import { Router } from "express";
import { z } from "zod";
import { SUPPORTED_STORES, isSupportedStore } from "../config/stores.js";
import { AppError } from "../lib/errors.js";
import { getProductFeed } from "../services/productFeedService.js";

export const productsRouter = Router();

const feedQuerySchema = z.object({
  store: z.string().min(1, "store query parameter is required"),
});

productsRouter.get("/feed", async (req, res, next) => {
  try {
    const { store } = feedQuerySchema.parse(req.query);

    if (!isSupportedStore(store)) {
      throw new AppError(
        "UNSUPPORTED_STORE",
        `Unsupported store. Use one of: ${SUPPORTED_STORES.join(", ")}`,
        400,
      );
    }

    const result = await getProductFeed(store);
    res.json(result);
  } catch (error) {
    next(error);
  }
});
