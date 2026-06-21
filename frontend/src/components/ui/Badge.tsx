import { cn } from "@/lib/cn";
import type { HTMLAttributes } from "react";

type BadgeVariant =
  | "default"
  | "brand"
  | "accent"
  | "success"
  | "warning"
  | "neutral"
  | "budget"
  | "protein"
  | "vegetarian"
  | "gluten"
  | "lactose"
  | "breakfast"
  | "lunch"
  | "dinner"
  | "diet";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
};

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-neutral-100 text-neutral-700 ring-1 ring-neutral-200/60",
  brand: "bg-brand-50 text-brand-700 ring-1 ring-brand-100",
  accent: "bg-amber-50 text-amber-800 ring-1 ring-amber-100",
  success: "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-100",
  warning: "bg-orange-50 text-orange-800 ring-1 ring-orange-100",
  neutral: "bg-slate-100 text-slate-600 ring-1 ring-slate-200/70",
  budget: "bg-teal-50 text-teal-800 ring-1 ring-teal-100",
  protein: "bg-rose-50 text-rose-800 ring-1 ring-rose-100",
  vegetarian: "bg-green-50 text-green-800 ring-1 ring-green-100",
  gluten: "bg-violet-50 text-violet-800 ring-1 ring-violet-100",
  lactose: "bg-cyan-50 text-cyan-800 ring-1 ring-cyan-100",
  breakfast: "bg-amber-50 text-amber-800 ring-1 ring-amber-100",
  lunch: "bg-sky-50 text-sky-800 ring-1 ring-sky-100",
  dinner: "bg-indigo-50 text-indigo-800 ring-1 ring-indigo-100",
  diet: "bg-fuchsia-50 text-fuchsia-800 ring-1 ring-fuchsia-100",
};

export function Badge({
  variant = "default",
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium leading-4",
        variantClasses[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export type { BadgeVariant };
