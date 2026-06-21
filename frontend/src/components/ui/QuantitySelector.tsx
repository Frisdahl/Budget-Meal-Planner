import { cn } from "@/lib/cn";

type QuantitySelectorProps = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  label?: string;
  className?: string;
};

export function QuantitySelector({
  value,
  onChange,
  min = 1,
  max = 99,
  disabled = false,
  label = "Antal",
  className,
}: QuantitySelectorProps) {
  function decrement() {
    onChange(Math.max(min, value - 1));
  }

  function increment() {
    onChange(Math.min(max, value + 1));
  }

  function handleInputChange(raw: string) {
    const parsed = Number.parseInt(raw, 10);
    if (Number.isNaN(parsed)) return;
    onChange(Math.min(max, Math.max(min, parsed)));
  }

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <span className="sr-only">{label}</span>
      <div
        className={cn(
          "inline-flex h-9 items-center rounded-md border border-neutral-300 bg-white",
          disabled && "opacity-50",
        )}
      >
        <button
          type="button"
          aria-label="Reducer antal"
          disabled={disabled || value <= min}
          onClick={decrement}
          className="flex h-full w-9 items-center justify-center text-neutral-600 hover:bg-neutral-50 disabled:pointer-events-none disabled:opacity-40"
        >
          −
        </button>
        <input
          type="number"
          aria-label={label}
          min={min}
          max={max}
          value={value}
          disabled={disabled}
          onChange={(e) => handleInputChange(e.target.value)}
          className="h-full w-10 border-x border-neutral-300 text-center text-sm font-medium text-neutral-900 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
        <button
          type="button"
          aria-label="Forøg antal"
          disabled={disabled || value >= max}
          onClick={increment}
          className="flex h-full w-9 items-center justify-center text-neutral-600 hover:bg-neutral-50 disabled:pointer-events-none disabled:opacity-40"
        >
          +
        </button>
      </div>
    </div>
  );
}
