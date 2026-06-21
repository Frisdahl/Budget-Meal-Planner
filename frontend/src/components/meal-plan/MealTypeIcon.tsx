import { cn } from "@/lib/cn";
import { Moon, Sun, UtensilsCrossed, type LucideIcon } from "lucide-react";
import type { Meal } from "@/types";

type MealTypeIconProps = {
  type: Meal["type"];
  size?: "sm" | "md";
  className?: string;
};

const ICONS: Record<Meal["type"], LucideIcon> = {
  breakfast: Sun,
  lunch: UtensilsCrossed,
  dinner: Moon,
};

const STYLE: Record<
  Meal["type"],
  { wrap: string; icon: string }
> = {
  breakfast: {
    wrap: "bg-amber-50 ring-1 ring-amber-100/80",
    icon: "text-amber-600",
  },
  lunch: {
    wrap: "bg-sky-50 ring-1 ring-sky-100/80",
    icon: "text-sky-600",
  },
  dinner: {
    wrap: "bg-indigo-50 ring-1 ring-indigo-100/80",
    icon: "text-indigo-600",
  },
};

const SIZE = {
  sm: { wrap: "h-9 w-9", icon: "h-4 w-4" },
  md: { wrap: "h-10 w-10", icon: "h-5 w-5" },
} as const;

export function MealTypeIcon({
  type,
  size = "sm",
  className,
}: MealTypeIconProps) {
  const Icon = ICONS[type];
  const styles = STYLE[type];
  const dimensions = SIZE[size];

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-xl",
        dimensions.wrap,
        styles.wrap,
        className,
      )}
      aria-hidden
    >
      <Icon className={cn(dimensions.icon, styles.icon)} strokeWidth={2} />
    </div>
  );
}
