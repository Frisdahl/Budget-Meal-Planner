import { cn } from "@/lib/cn";
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
  ...props
}: CheckboxProps) {
  const checkboxId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <label
      htmlFor={checkboxId}
      className={cn(
        "flex cursor-pointer items-start gap-3 rounded-md p-2 -mx-2",
        "hover:bg-neutral-50 transition-colors",
        props.disabled && "cursor-not-allowed opacity-60",
        className,
      )}
    >
      <input
        id={checkboxId}
        type="checkbox"
        className="mt-0.5 h-4 w-4 shrink-0 rounded border-neutral-300 text-brand-600 focus:ring-brand-500"
        {...props}
      />
      {(label || description) && (
        <span className="flex flex-col gap-0.5">
          {label && (
            <span className="text-sm font-medium text-neutral-800">{label}</span>
          )}
          {description && (
            <span className="text-caption">{description}</span>
          )}
        </span>
      )}
    </label>
  );
}
