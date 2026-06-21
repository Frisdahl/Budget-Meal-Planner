import { cn } from "@/lib/cn";
import { formatPercent } from "@/lib/format";

type ProgressBarProps = {
  value: number;
  max: number;
  label?: string;
  showPercent?: boolean;
  variant?: "brand" | "accent" | "neutral";
  size?: "md" | "lg";
  className?: string;
};

const barVariants = {
  brand: "bg-gradient-to-r from-brand-500 to-brand-600",
  accent: "bg-gradient-to-r from-accent-400 to-accent-500",
  neutral: "bg-neutral-400",
} as const;

const trackSizes = {
  md: "h-2.5",
  lg: "h-4",
} as const;

export function ProgressBar({
  value,
  max,
  label,
  showPercent = true,
  variant = "brand",
  size = "md",
  className,
}: ProgressBarProps) {
  const percent = formatPercent(value, max);

  return (
    <div className={cn("flex flex-col gap-2.5", className)}>
      {(label || showPercent) && (
        <div className="flex items-center justify-between gap-3 text-sm">
          {label && (
            <span className="font-medium text-neutral-700">{label}</span>
          )}
          {showPercent && (
            <span className="tabular-nums text-neutral-500">{percent}%</span>
          )}
        </div>
      )}
      <div
        className={cn(
          "w-full overflow-hidden rounded-full bg-neutral-100",
          trackSizes[size],
        )}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label}
      >
        <div
          className={cn(
            "h-full rounded-full transition-[width] duration-500 ease-out",
            barVariants[variant],
          )}
          style={{ width: `${Math.min(percent, 100)}%` }}
        />
      </div>
    </div>
  );
}
