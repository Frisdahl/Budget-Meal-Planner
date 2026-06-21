import { cn } from "@/lib/cn";
import { formatPercent } from "@/lib/format";

type ProgressBarProps = {
  value: number;
  max: number;
  label?: string;
  showPercent?: boolean;
  variant?: "brand" | "accent" | "neutral";
  className?: string;
};

const barVariants = {
  brand: "bg-brand-500",
  accent: "bg-accent-500",
  neutral: "bg-neutral-400",
} as const;

export function ProgressBar({
  value,
  max,
  label,
  showPercent = true,
  variant = "brand",
  className,
}: ProgressBarProps) {
  const percent = formatPercent(value, max);

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {(label || showPercent) && (
        <div className="flex items-center justify-between text-sm">
          {label && <span className="font-medium text-neutral-700">{label}</span>}
          {showPercent && (
            <span className="text-neutral-500">{percent}%</span>
          )}
        </div>
      )}
      <div
        className="h-2 w-full overflow-hidden rounded-full bg-neutral-100"
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label}
      >
        <div
          className={cn("h-full rounded-full transition-all", barVariants[variant])}
          style={{ width: `${Math.min(percent, 100)}%` }}
        />
      </div>
    </div>
  );
}
