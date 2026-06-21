import { cn } from "@/lib/cn";
import { Check } from "lucide-react";
import type { InputHTMLAttributes } from "react";

type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label?: string;
  description?: string;
};

export function Checkbox({
  label,
  description,
  className,
  id,
  checked,
  disabled,
  ...props
}: CheckboxProps) {
  const checkboxId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <label
      htmlFor={checkboxId}
      className={cn(
        "group/checkbox flex cursor-pointer items-start gap-2 rounded-lg px-2 py-2 -mx-2",
        "transition-colors hover:bg-neutral-50/80",
        "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand-500/20 has-[:focus-visible]:ring-offset-1",
        disabled && "cursor-not-allowed opacity-50",
        className,
      )}
    >
      <input
        id={checkboxId}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        className="sr-only"
        {...props}
      />
      <span
        aria-hidden
        className={cn(
          "mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[5px] border-2 transition-all duration-200",
          checked
            ? "border-brand-600 bg-brand-600"
            : "border-neutral-300 bg-white group-hover/checkbox:border-brand-400",
          disabled && "border-neutral-200 bg-neutral-100",
        )}
      >
        <Check
          className={cn(
            "h-3 w-3 text-white transition-all duration-200",
            checked ? "scale-100 opacity-100" : "scale-75 opacity-0",
          )}
          strokeWidth={3}
        />
      </span>
      {(label || description) && (
        <span className="flex min-w-0 flex-col gap-0.5 pt-px">
          {label && (
            <span className="text-[15px] font-medium leading-snug text-neutral-800">
              {label}
            </span>
          )}
          {description && (
            <span className="text-caption">{description}</span>
          )}
        </span>
      )}
    </label>
  );
}
