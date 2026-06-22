import { Router } from "express";
import { z } from "zod";
import { searchSpoonacularRecipes } from "../services/spoonacularService.js";

export const recipesRouter = Router();

const boolFromQuery = z
  .union([z.literal("true"), z.literal("false")])
  .optional()
  .transform((value) => value === "true");

const searchQuerySchema = z.object({
  type: z.string().optional(),
  offset: z.coerce.number().int().min(0).default(0),
  vegetarian: boolFromQuery,
  glutenFree: boolFromQuery,
  lactoseFree: boolFromQuery,
  nutFree: boolFromQuery,
  number: z.coerce.number().int().min(1).max(30).default(12),
  includeIngredients: z.string().optional(),
});

recipesRouter.get("/search", async (req, res, next) => {
  try {
    const query = searchQuerySchema.parse(req.query);
    const result = await searchSpoonacularRecipes(query);
    const withImages = result.results.filter((recipe) =>
      Boolean(recipe.image?.trim()),
    ).length;
    console.log(
      `[Spoonacular] type=${query.type ?? "any"} offset=${query.offset} returned recipes: ${result.results.length}, with images: ${withImages}`,
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
});
