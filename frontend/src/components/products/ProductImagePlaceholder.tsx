import { cn } from "@/lib/cn";
import { ProductIcon } from "@/components/ui/Icon";

const categoryGradients: Record<string, string> = {
  "Kød & fisk": "from-rose-100 to-rose-50",
  Mejeri: "from-sky-100 to-sky-50",
  Grønt: "from-emerald-100 to-emerald-50",
  Kolonial: "from-amber-100 to-amber-50",
  Brød: "from-orange-100 to-orange-50",
  Frost: "from-cyan-100 to-cyan-50",
  Drikkevarer: "from-blue-100 to-blue-50",
};

type ProductImagePlaceholderProps = {
  category: string;
  brand: string;
  name: string;
  className?: string;
};

export function ProductImagePlaceholder({
  category,
  brand,
  name,
  className,
}: ProductImagePlaceholderProps) {
  const gradient = categoryGradients[category] ?? "from-neutral-100 to-neutral-50";
  const initial = brand.charAt(0).toUpperCase();

  return (
    <div
      className={cn(
        "relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden",
        "bg-gradient-to-br",
        gradient,
        className,
      )}
      aria-hidden="true"
    >
      <div className="absolute inset-0 opacity-[0.07]">
        <svg viewBox="0 0 200 200" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" fill="currentColor" className="text-neutral-900" />
          </pattern>
          <rect width="200" height="200" fill="url(#grid)" />
        </svg>
      </div>

      <div className="relative flex flex-col items-center gap-2">
        <ProductIcon category={category} size="lg" />
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-xs font-bold text-neutral-600 shadow-sm">
          {initial}
        </span>
      </div>

      <span className="sr-only">Produktbillede: {name}</span>
    </div>
  );
}
