import { cn } from "@/lib/cn";
import { useState } from "react";
import { NavLink } from "react-router-dom";
import { NAV_ITEMS } from "@/routes/paths";

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <>
      {NAV_ITEMS.map(({ label, path }) => (
        <li key={path}>
          <NavLink
            to={path}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                "block rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-brand-50 text-brand-700"
                  : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900",
              )
            }
          >
            {label}
          </NavLink>
        </li>
      ))}
    </>
  );
}

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-neutral-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex h-header max-w-[var(--container-app)] items-center justify-between gap-4 px-page-x md:px-page-x-md lg:px-page-x-lg">
        <NavLink
          to="/"
          className="flex items-center gap-2 text-base font-semibold text-neutral-900"
        >
          <span
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white"
            aria-hidden="true"
          >
            BM
          </span>
          <span className="hidden sm:inline">Budget Meal Planner</span>
        </NavLink>

        <nav className="hidden md:block" aria-label="Hovednavigation">
          <ul className="flex items-center gap-1">
            <NavLinks />
          </ul>
        </nav>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-md text-neutral-700 hover:bg-neutral-100 md:hidden"
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
          aria-label={menuOpen ? "Luk menu" : "Åbn menu"}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
            aria-hidden="true"
          >
            {menuOpen ? (
              <>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </>
            ) : (
              <>
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </>
            )}
          </svg>
        </button>
      </div>

      {menuOpen && (
        <nav
          id="mobile-nav"
          className="border-t border-neutral-200 bg-white md:hidden"
          aria-label="Mobilnavigation"
        >
          <ul className="flex flex-col gap-1 px-page-x py-3">
            <NavLinks onNavigate={() => setMenuOpen(false)} />
          </ul>
        </nav>
      )}
    </header>
  );
}
