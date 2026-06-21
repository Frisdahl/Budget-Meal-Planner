import { cn } from "@/lib/cn";
import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "outline";
type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-gradient-to-b from-brand-500 to-brand-600 text-white shadow-sm hover:from-brand-600 hover:to-brand-700 hover:shadow-md active:from-brand-700 active:to-brand-800 hover:-translate-y-0.5 active:translate-y-0",
  secondary:
    "bg-neutral-100 text-neutral-800 hover:bg-neutral-200 active:bg-neutral-300",
  ghost:
    "bg-transparent text-neutral-700 hover:bg-neutral-100 active:bg-neutral-200",
  outline:
    "border border-neutral-200 bg-white text-neutral-800 shadow-sm hover:border-neutral-300 hover:bg-neutral-50 active:bg-neutral-100 hover:-translate-y-0.5 active:translate-y-0",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-9 px-3.5 text-sm rounded-lg",
  md: "h-11 px-4 text-sm rounded-xl",
  lg: "h-11 px-6 text-[15px] rounded-xl",
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 font-medium",
        "transition-all duration-200",
        "disabled:pointer-events-none disabled:opacity-45 disabled:shadow-none disabled:translate-y-0",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    />
  );
}
