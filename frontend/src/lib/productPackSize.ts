import type { IngredientUnit } from "@/data/recipes";
import type { Product } from "@/types";

export type NormalizedAmount = {
  amount: number;
  unit: "g" | "ml" | "stk";
};

export type ProductPackSize = {
  amount: number;
  unit: "g" | "kg" | "ml" | "l" | "stk";
};

export type PackCalculation = {
  packsNeeded: number;
  packSize: number;
  packUnit: string;
};

const COUNT_UNITS = new Set(["stk", "pk", "pakke"]);

export function parseProductPackSize(productUnit: string): ProductPackSize | null {
  const trimmed = productUnit.trim().toLowerCase();

  if (COUNT_UNITS.has(trimmed)) {
    return { amount: 1, unit: "stk" };
  }

  const match = trimmed.match(/^([\d.,]+)\s*(g|kg|ml|l|cl|stk|pk)$/);
  if (!match) return null;

  const amount = Number.parseFloat(match[1]!.replace(",", "."));
  if (Number.isNaN(amount) || amount <= 0) return null;

  const rawUnit = match[2]!;
  if (rawUnit === "pk") return { amount, unit: "stk" };
  if (rawUnit === "cl") return { amount: amount * 10, unit: "ml" };

  return { amount, unit: rawUnit as ProductPackSize["unit"] };
}

export function normalizeIngredientAmount(
  amount: number,
  unit: IngredientUnit,
): NormalizedAmount | null {
  switch (unit) {
    case "g":
      return { amount, unit: "g" };
    case "kg":
      return { amount: amount * 1000, unit: "g" };
    case "ml":
      return { amount, unit: "ml" };
    case "l":
      return { amount: amount * 1000, unit: "ml" };
    case "stk":
      return { amount, unit: "stk" };
    default:
      return null;
  }
}

function normalizePackSize(pack: ProductPackSize): NormalizedAmount | null {
  switch (pack.unit) {
    case "g":
    case "kg":
      return {
        amount: pack.unit === "kg" ? pack.amount * 1000 : pack.amount,
        unit: "g",
      };
    case "ml":
    case "l":
      return {
        amount: pack.unit === "l" ? pack.amount * 1000 : pack.amount,
        unit: "ml",
      };
    case "stk":
      return { amount: pack.amount, unit: "stk" };
    default:
      return null;
  }
}

export function calculatePacksNeeded(
  requiredAmount: number,
  requiredUnit: IngredientUnit,
  product: Product,
): PackCalculation | null {
  const required = normalizeIngredientAmount(requiredAmount, requiredUnit);
  const pack = parseProductPackSize(product.unit);
  if (!required || !pack) return null;

  const normalizedPack = normalizePackSize(pack);
  if (!normalizedPack || required.unit !== normalizedPack.unit) return null;
  if (normalizedPack.amount <= 0) return null;

  return {
    packsNeeded: Math.max(1, Math.ceil(required.amount / normalizedPack.amount)),
    packSize: pack.amount,
    packUnit: pack.unit,
  };
}

export function formatRequiredAmount(
  amount: number,
  unit: IngredientUnit,
): string {
  const rounded = amount >= 10 ? Math.round(amount) : Math.round(amount * 10) / 10;
  return `${rounded}${unit}`;
}
