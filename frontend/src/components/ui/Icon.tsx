import { cn } from "@/lib/cn";
import type { HTMLAttributes } from "react";

type MealTypeIcon = "breakfast" | "lunch" | "dinner" | "default";

const iconConfig: Record<MealTypeIcon, { emoji: string; bg: string }> = {
  breakfast: { emoji: "🌅", bg: "bg-accent-50" },
  lunch: { emoji: "☀️", bg: "bg-brand-50" },
  dinner: { emoji: "🌙", bg: "bg-neutral-100" },
  default: { emoji: "🍽️", bg: "bg-brand-50" },
};

type MealIconProps = HTMLAttributes<HTMLDivElement> & {
  type?: MealTypeIcon;
  size?: "sm" | "md" | "lg";
};

const sizeClasses = {
  sm: "h-8 w-8 text-base",
  md: "h-10 w-10 text-lg",
  lg: "h-12 w-12 text-xl",
} as const;

export function MealIcon({
  type = "default",
  size = "md",
  className,
  ...props
}: MealIconProps) {
  const { emoji, bg } = iconConfig[type];

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-lg",
        bg,
        sizeClasses[size],
        className,
      )}
      aria-hidden="true"
      {...props}
    >
      {emoji}
    </div>
  );
}

type ProductIconProps = HTMLAttributes<HTMLDivElement> & {
  category: string;
  size?: "sm" | "md" | "lg";
};

const categoryEmojis: Record<string, string> = {
  "Kød & fisk": "🥩",
  Mejeri: "🧀",
  Grønt: "🥬",
  Kolonial: "🫙",
  Brød: "🍞",
  Frost: "🧊",
  Drikkevarer: "🥤",
};

export function ProductIcon({
  category,
  size = "md",
  className,
  ...props
}: ProductIconProps) {
  const emoji = categoryEmojis[category] ?? "🛒";

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-lg bg-neutral-100",
        sizeClasses[size],
        className,
      )}
      aria-hidden="true"
      {...props}
    >
      {emoji}
    </div>
  );
}
