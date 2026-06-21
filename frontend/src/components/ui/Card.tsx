import { cn } from "@/lib/cn";
import type { HTMLAttributes } from "react";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  padding?: "none" | "sm" | "md" | "lg";
  interactive?: boolean;
};

const paddingClasses = {
  none: "",
  sm: "p-4",
  md: "p-4 sm:p-5",
  lg: "p-5 sm:p-6",
} as const;

export function Card({
  padding = "md",
  interactive = false,
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-neutral-200 bg-white",
        "shadow-[var(--shadow-card)]",
        interactive && "card-interactive",
        paddingClasses[padding],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

type CardHeaderProps = HTMLAttributes<HTMLDivElement>;

export function CardHeader({ className, children, ...props }: CardHeaderProps) {
  return (
    <div className={cn("mb-4 flex flex-col gap-1.5", className)} {...props}>
      {children}
    </div>
  );
}

type CardTitleProps = HTMLAttributes<HTMLHeadingElement>;

export function CardTitle({ className, children, ...props }: CardTitleProps) {
  return (
    <h3 className={cn("text-card-title", className)} {...props}>
      {children}
    </h3>
  );
}

type CardDescriptionProps = HTMLAttributes<HTMLParagraphElement>;

export function CardDescription({
  className,
  children,
  ...props
}: CardDescriptionProps) {
  return (
    <p className={cn("text-caption text-neutral-500", className)} {...props}>
      {children}
    </p>
  );
}
