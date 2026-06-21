import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  className?: string;
};

function getPageNumbers(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | "ellipsis")[] = [1];

  if (current > 3) pages.push("ellipsis");

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (current < total - 2) pages.push("ellipsis");

  pages.push(total);
  return pages;
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalItems);
  const pages = getPageNumbers(currentPage, totalPages);

  return (
    <nav
      aria-label="Paginering"
      className={cn("flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between", className)}
    >
      <p className="text-body-sm text-neutral-500">
        Viser <span className="font-medium text-neutral-700">{start}–{end}</span> af{" "}
        <span className="font-medium text-neutral-700">{totalItems}</span> produkter
      </p>

      <div className="flex items-center gap-1">
        <PaginationButton
          label="Forrige side"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          ←
        </PaginationButton>

        <div className="hidden items-center gap-1 sm:flex">
          {pages.map((page, index) =>
            page === "ellipsis" ? (
              <span key={`ellipsis-${index}`} className="px-2 text-neutral-400">
                …
              </span>
            ) : (
              <PaginationButton
                key={page}
                label={`Side ${page}`}
                active={page === currentPage}
                onClick={() => onPageChange(page)}
              >
                {page}
              </PaginationButton>
            ),
          )}
        </div>

        <span className="px-2 text-sm text-neutral-500 sm:hidden">
          {currentPage} / {totalPages}
        </span>

        <PaginationButton
          label="Næste side"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          →
        </PaginationButton>
      </div>
    </nav>
  );
}

type PaginationButtonProps = {
  children: ReactNode;
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
};

function PaginationButton({
  children,
  label,
  active = false,
  disabled = false,
  onClick,
}: PaginationButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-current={active ? "page" : undefined}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "inline-flex h-9 min-w-9 items-center justify-center rounded-md px-3 text-sm font-medium transition-colors",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500",
        active
          ? "bg-brand-600 text-white"
          : "bg-white text-neutral-700 border border-neutral-200 hover:bg-neutral-50",
        disabled && "pointer-events-none opacity-40",
      )}
    >
      {children}
    </button>
  );
}
