import { cn } from "@/lib/cn";
import type { HTMLAttributes, ReactNode } from "react";
import { Text } from "./Typography";

type StatCardProps = HTMLAttributes<HTMLDivElement> & {
  label: string;
  value: string;
  hint?: string;
  icon?: ReactNode;
  trend?: { value: string; positive?: boolean };
};

export function StatCard({
  label,
  value,
  hint,
  icon,
  trend,
  className,
  ...props
}: StatCardProps) {
  return (
    <div
      className={cn(
        "flex min-h-[7.5rem] flex-col justify-between rounded-2xl border border-neutral-200 bg-white p-4 shadow-[var(--shadow-card)] sm:p-5",
        "card-interactive",
        className,
      )}
      {...props}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-2">
          <Text variant="label" as="span" className="text-neutral-500">
            {label}
          </Text>
          <p className="text-2xl font-semibold tracking-tight text-neutral-900">
            {value}
          </p>
          {hint && (
            <Text variant="caption" as="span">
              {hint}
            </Text>
          )}
          {trend && (
            <span
              className={cn(
                "text-caption font-medium",
                trend.positive ? "text-brand-600" : "text-neutral-500",
              )}
            >
              {trend.value}
            </span>
          )}
        </div>
        {icon && (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 ring-1 ring-brand-100">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
