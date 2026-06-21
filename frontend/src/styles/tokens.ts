/**
 * Design tokens — single source of truth for the design system.
 * Consumed by Tailwind via @theme in index.css.
 */

/* ── Color palette ─────────────────────────────────────────────── */

/* Brand — emerald: fresh, affordable, food-adjacent */
export const colors = {
  brand: {
    50: "#ecfdf5",
    100: "#d1fae5",
    200: "#a7f3d0",
    300: "#6ee7b7",
    400: "#34d399",
    500: "#10b981",
    600: "#059669",
    700: "#047857",
    800: "#065f46",
    900: "#064e3b",
    950: "#022c22",
  },
  /* Neutral — slate: clean, readable UI chrome */
  neutral: {
    50: "#f8fafc",
    100: "#f1f5f9",
    200: "#e2e8f0",
    300: "#cbd5e1",
    400: "#94a3b8",
    500: "#64748b",
    600: "#475569",
    700: "#334155",
    800: "#1e293b",
    900: "#0f172a",
    950: "#020617",
  },
  /* Accent — amber: CTAs, highlights, budget alerts */
  accent: {
    50: "#fffbeb",
    100: "#fef3c7",
    200: "#fde68a",
    300: "#fcd34d",
    400: "#fbbf24",
    500: "#f59e0b",
    600: "#d97706",
    700: "#b45309",
    800: "#92400e",
    900: "#78350f",
  },
  /* Semantic */
  success: "#059669",
  warning: "#d97706",
  error: "#dc2626",
  info: "#2563eb",
} as const;

/* ── Typography scale ──────────────────────────────────────────── */

export const typography = {
  fontFamily: {
    sans: '"Inter", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
    mono: 'ui-monospace, "Cascadia Code", "Segoe UI Mono", monospace',
  },
  fontSize: {
    xs: ["0.75rem", { lineHeight: "1rem" }],
    sm: ["0.875rem", { lineHeight: "1.25rem" }],
    base: ["1rem", { lineHeight: "1.5rem" }],
    lg: ["1.125rem", { lineHeight: "1.75rem" }],
    xl: ["1.25rem", { lineHeight: "1.75rem" }],
    "2xl": ["1.5rem", { lineHeight: "2rem" }],
    "3xl": ["1.875rem", { lineHeight: "2.25rem" }],
    "4xl": ["2.25rem", { lineHeight: "2.5rem" }],
    display: ["3rem", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
  },
  fontWeight: {
    normal: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
  },
} as const;

/* ── Spacing rules ─────────────────────────────────────────────── */

export const spacing = {
  /* Page layout */
  pageX: "1rem",       /* mobile horizontal padding */
  pageXMd: "1.5rem",   /* tablet+ */
  pageXLg: "2rem",     /* desktop */
  sectionY: "2rem",    /* vertical gap between sections */
  sectionYLg: "3rem",  /* desktop section gap */
  stackSm: "0.5rem",   /* tight element stacks */
  stackMd: "1rem",
  stackLg: "1.5rem",
  stackXl: "2rem",
  /* Component internals */
  cardPadding: "1.25rem",
  inputPaddingX: "0.75rem",
  inputPaddingY: "0.5rem",
} as const;

/* ── Radii & shadows ───────────────────────────────────────────── */

export const radii = {
  sm: "0.375rem",
  md: "0.5rem",
  lg: "0.75rem",
  xl: "1rem",
  full: "9999px",
} as const;

export const shadows = {
  sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
  md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
  lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
} as const;

/* ── Breakpoints (reference — Tailwind defaults) ─────────────── */

export const breakpoints = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
} as const;

/* Max content width for readable layouts */
export const layout = {
  maxWidth: "72rem", /* 1152px */
  headerHeight: "4rem",
} as const;
