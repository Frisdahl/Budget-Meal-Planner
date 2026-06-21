import { cn } from "@/lib/cn";

type LoadingSpinnerProps = {
  className?: string;
  light?: boolean;
};

export function LoadingSpinner({ className, light = false }: LoadingSpinnerProps) {
  return (
    <span
      className={cn(
        "inline-block h-4 w-4 animate-spin rounded-full border-2",
        light
          ? "border-white/30 border-t-white"
          : "border-neutral-300 border-t-brand-600",
        className,
      )}
      aria-hidden
    />
  );
}
