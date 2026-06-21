import { cn } from "@/lib/cn";
import type { ElementType, HTMLAttributes } from "react";

type HeadingLevel = 1 | 2 | 3 | 4;

const headingTags: Record<HeadingLevel, ElementType> = {
  1: "h1",
  2: "h2",
  3: "h3",
  4: "h4",
};

type HeadingProps = HTMLAttributes<HTMLHeadingElement> & {
  as?: HeadingLevel;
  size?: "display" | "xl" | "lg" | "md" | "sm";
};

const sizeClasses = {
  display: "text-display",
  xl: "text-3xl font-semibold tracking-tight",
  lg: "text-2xl font-semibold tracking-tight",
  md: "text-xl font-semibold",
  sm: "text-lg font-semibold",
} as const;

export function Heading({
  as = 1,
  size,
  className,
  children,
  ...props
}: HeadingProps) {
  const Tag = headingTags[as];
  const resolvedSize =
    size ??
    ({ 1: "xl", 2: "lg", 3: "md", 4: "sm" } as const)[as];

  return (
    <Tag className={cn(sizeClasses[resolvedSize], className)} {...props}>
      {children}
    </Tag>
  );
}

type TextProps = HTMLAttributes<HTMLParagraphElement> & {
  variant?: "body" | "body-lg" | "body-sm" | "caption" | "label";
  as?: "p" | "span" | "div";
};

const variantClasses = {
  body: "text-base text-neutral-700",
  "body-lg": "text-body-lg text-neutral-700",
  "body-sm": "text-body-sm text-neutral-600",
  caption: "text-caption",
  label: "text-label",
} as const;

const textTags: Record<NonNullable<TextProps["as"]>, ElementType> = {
  p: "p",
  span: "span",
  div: "div",
};

export function Text({
  variant = "body",
  as = "p",
  className,
  children,
  ...props
}: TextProps) {
  const Tag = textTags[as];

  return (
    <Tag className={cn(variantClasses[variant], className)} {...props}>
      {children}
    </Tag>
  );
}
