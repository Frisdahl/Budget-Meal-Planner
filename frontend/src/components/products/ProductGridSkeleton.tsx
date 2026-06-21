export function ProductGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-stack-lg sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm"
        >
          <div className="aspect-[4/3] animate-pulse bg-neutral-100" />
          <div className="flex flex-col gap-3 p-4">
            <div className="h-3 w-16 animate-pulse rounded bg-neutral-100" />
            <div className="h-4 w-3/4 animate-pulse rounded bg-neutral-100" />
            <div className="h-3 w-full animate-pulse rounded bg-neutral-100" />
            <div className="mt-2 h-6 w-20 animate-pulse rounded-full bg-neutral-100" />
            <div className="mt-4 h-9 w-full animate-pulse rounded-md bg-neutral-100" />
          </div>
        </div>
      ))}
    </div>
  );
}
