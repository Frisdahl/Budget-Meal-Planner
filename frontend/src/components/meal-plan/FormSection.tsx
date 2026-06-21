import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

type FormSectionProps = {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
};

export function FormSection({
  title,
  description,
  children,
  className,
}: FormSectionProps) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-[var(--shadow-card)] sm:p-5",
        className,
      )}
    >
      <div className="mb-4 flex flex-col gap-1">
        <h3 className="text-card-title">{title}</h3>
        {description && (
          <p className="text-caption text-neutral-500">{description}</p>
        )}
      </div>
      {children}
    </section>
  );
}
