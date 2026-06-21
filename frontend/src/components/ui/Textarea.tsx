import { cn } from "@/lib/cn";
import type { TextareaHTMLAttributes } from "react";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  hint?: string;
  error?: string;
};

export function Textarea({
  label,
  hint,
  error,
  className,
  id,
  ...props
}: TextareaProps) {
  const textareaId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={textareaId} className="text-label">
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        className={cn(
          "min-h-[88px] w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-3 text-[15px]",
          "placeholder:text-neutral-400 resize-y",
          "transition-colors duration-200",
          "focus:border-brand-500 focus:outline-none focus:ring-[3px] focus:ring-brand-500/15",
          "disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:opacity-60",
          error && "border-error focus:border-error focus:ring-error/15",
          className,
        )}
        {...props}
      />
      {hint && !error && <p className="text-caption">{hint}</p>}
      {error && <p className="text-caption text-error">{error}</p>}
    </div>
  );
}
