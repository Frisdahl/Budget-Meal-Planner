import { cn } from "@/lib/cn";
import { Moon, Sun, UtensilsCrossed, Utensils, type LucideIcon } from "lucide-react";
import type { HTMLAttributes } from "react";

type MealTypeIcon = "breakfast" | "lunch" | "dinner" | "default";

const mealIcons: Record<MealTypeIcon, LucideIcon> = {
  breakfast: Sun,
  lunch: UtensilsCrossed,
  dinner: Moon,
  default: Utensils,
};

const mealStyles: Record<MealTypeIcon, string> = {
  breakfast: "bg-amber-50 text-amber-600 ring-1 ring-amber-100/80",
  lunch: "bg-sky-50 text-sky-600 ring-1 ring-sky-100/80",
  dinner: "bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100/80",
  default: "bg-brand-50 text-brand-600 ring-1 ring-brand-100/80",
};

type MealIconProps = HTMLAttributes<HTMLDivElement> & {
  type?: MealTypeIcon;
  size?: "sm" | "md" | "lg";
};

const sizeClasses = {
  sm: "h-8 w-8 [&_svg]:h-4 [&_svg]:w-4",
  md: "h-10 w-10 [&_svg]:h-5 [&_svg]:w-5",
  lg: "h-12 w-12 [&_svg]:h-6 [&_svg]:w-6",
} as const;

export function MealIcon({
  type = "default",
  size = "md",
  className,
  ...props
}: MealIconProps) {
  const Icon = mealIcons[type];

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-xl",
        mealStyles[type],
        sizeClasses[size],
        className,
      )}
      aria-hidden="true"
      {...props}
    >
      <Icon strokeWidth={2} />
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
        "flex shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-base",
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
