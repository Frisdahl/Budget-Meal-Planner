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
        "rounded-lg border border-neutral-200 bg-white p-5 shadow-sm",
        className,
      )}
      {...props}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
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
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
