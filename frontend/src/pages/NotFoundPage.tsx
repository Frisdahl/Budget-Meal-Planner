import { Link } from "react-router-dom";
import { PageContainer } from "@/components/layout/PageContainer";
import { ROUTES } from "@/routes/paths";
import { cn } from "@/lib/cn";

export function NotFoundPage() {
  return (
    <PageContainer
      title="404"
      description="Siden du leder efter findes ikke."
      actions={
        <Link
          to={ROUTES.home}
          className={cn(
            "inline-flex h-10 items-center justify-center rounded-md border border-neutral-300",
            "bg-white px-4 text-sm font-medium text-neutral-800 transition-colors",
            "hover:bg-neutral-50 active:bg-neutral-100",
          )}
        >
          Tilbage til dashboard
        </Link>
      }
    />
  );
}
