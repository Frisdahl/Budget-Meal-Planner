import { cn } from "@/lib/cn";
import type { ReactNode } from "react";
import { Text } from "./Typography";

type EmptyStateProps = {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
};

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed",
        "border-neutral-300 bg-neutral-50 px-6 py-12 text-center",
        className,
      )}
    >
      {icon && (
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 text-neutral-400">
          {icon}
        </div>
      )}
      <div className="flex flex-col gap-1">
        <p className="text-base font-semibold text-neutral-900">{title}</p>
        {description && (
          <Text variant="body-sm" className="max-w-sm text-neutral-500">
            {description}
          </Text>
        )}
      </div>
      {action}
    </div>
  );
}
