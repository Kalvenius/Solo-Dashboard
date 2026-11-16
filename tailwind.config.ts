import type { Config } from "tailwindcss";

// Bütün rənglər CSS dəyişənlərindən gəlir (src/app/globals.css) — işıqlı/qaranlıq rejim avtomatik dəyişir.
const c = (name: string) => `rgb(var(--c-${name}) / <alpha-value>)`;
const a = (name: string) => `var(--c-${name})`;

export default {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: c("brand-50"),
          100: c("brand-100"),
          200: c("brand-200"),
          400: c("brand-400"),
          500: c("brand-500"),
          600: c("brand-600"),
          700: c("brand-700"),
          800: c("brand-800"),
        },
        "on-brand": c("on-brand"),
        ink: { DEFAULT: c("ink"), muted: c("ink-muted"), subtle: c("ink-subtle"), faint: c("ink-faint") },
        line: c("line"),
        surface: {
          DEFAULT: c("surface"),
          sunken: c("surface-sunken"),
          hover: c("surface-hover"),
          column: c("surface-column"),
          raised: c("surface-raised"),
          overlay: c("surface-overlay"),
        },
        input: { DEFAULT: c("input"), hover: c("input-hover") },
        neutral: { DEFAULT: c("neutral"), strong: c("neutral-strong") },
        danger: { DEFAULT: c("danger"), bold: c("danger-bold"), subtle: c("danger-subtle"), border: c("danger-border") },
        success: { DEFAULT: c("success"), bold: c("success-bold"), subtle: c("success-subtle") },
        warning: { DEFAULT: c("warning"), subtle: c("warning-subtle") },
        discovery: { DEFAULT: c("discovery"), subtle: c("discovery-subtle") },
        info: { DEFAULT: c("info"), subtle: c("info-subtle") },
        tint: { 1: a("tint-1"), 2: a("tint-2"), 3: a("tint-3") },
        backdrop: a("backdrop"),
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
      },
      boxShadow: {
        card: "var(--shadow-card)",
        overlay: "var(--shadow-overlay)",
      },
    },
  },
  plugins: [],
} satisfies Config;
