import { cn } from "@/lib/cn";
import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
  error?: string;
};

export function Input({
  label,
  hint,
  error,
  className,
  id,
  ...props
}: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label htmlFor={inputId} className="text-label">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          "h-11 w-full rounded-xl border border-neutral-200 bg-white px-3.5 text-[15px]",
          "placeholder:text-neutral-400",
          "transition-colors duration-200",
          "focus:border-brand-500 focus:outline-none focus:ring-[3px] focus:ring-brand-500/15",
          "disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:opacity-60",
          error && "border-error focus:border-error focus:ring-error/15",
          className,
        )}
        {...props}
      />
      {hint && !error && (
        <p className="text-caption">{hint}</p>
      )}
      {error && (
        <p className="text-caption text-error">{error}</p>
      )}
    </div>
  );
}

type SearchInputProps = Omit<InputProps, "type">;

export function SearchInput({ className, ...props }: SearchInputProps) {
  return (
    <div className="relative">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
      <Input
        type="search"
        className={cn("pl-10", className)}
        {...props}
      />
    </div>
  );
}
