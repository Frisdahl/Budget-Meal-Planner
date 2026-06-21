import { cn } from "@/lib/cn";
import type { ButtonHTMLAttributes } from "react";

type TogglePillProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  active: boolean;
};

export function TogglePill({
  active,
  className,
  children,
  type = "button",
  ...props
}: TogglePillProps) {
  return (
    <button
      type={type}
      aria-pressed={active}
      className={cn(
        "rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500",
        active
          ? "bg-brand-600 text-white"
          : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
