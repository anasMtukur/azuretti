import type { Config } from "tailwindcss";

/**
 * Tailwind CSS Configuration
 * ============================================================
 * Colors and design tokens are sourced from src/config/theme.ts.
 * Tailwind utilities are generated from those tokens so that
 * class names like `bg-primary-600` and `text-accent-500` always
 * reflect the single-source theme file.
 * ============================================================
 */

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      // ── Colors ────────────────────────────────────────────────
      colors: {
        primary: {
          50:  "var(--color-primary-50)",
          100: "var(--color-primary-100)",
          200: "var(--color-primary-200)",
          300: "var(--color-primary-300)",
          400: "var(--color-primary-400)",
          500: "var(--color-primary-500)",
          600: "var(--color-primary-600)",
          700: "var(--color-primary-700)",
          800: "var(--color-primary-800)",
          900: "var(--color-primary-900)",
          950: "var(--color-primary-950)",
          DEFAULT: "var(--color-primary-600)",
        },
        accent: {
          50:  "var(--color-accent-50)",
          100: "var(--color-accent-100)",
          200: "var(--color-accent-200)",
          300: "var(--color-accent-300)",
          400: "var(--color-accent-400)",
          500: "var(--color-accent-500)",
          600: "var(--color-accent-600)",
          700: "var(--color-accent-700)",
          800: "var(--color-accent-800)",
          900: "var(--color-accent-900)",
          DEFAULT: "var(--color-accent-500)",
        },
        neutral: {
          50:  "var(--color-neutral-50)",
          100: "var(--color-neutral-100)",
          200: "var(--color-neutral-200)",
          300: "var(--color-neutral-300)",
          400: "var(--color-neutral-400)",
          500: "var(--color-neutral-500)",
          600: "var(--color-neutral-600)",
          700: "var(--color-neutral-700)",
          800: "var(--color-neutral-800)",
          900: "var(--color-neutral-900)",
          950: "var(--color-neutral-950)",
        },
        success:    "var(--color-success)",
        warning:    "var(--color-warning)",
        error:      "var(--color-error)",
        info:       "var(--color-info)",
        border:     "var(--color-border)",
        card:       "var(--color-card)",
        muted:      "var(--color-muted)",
        background: "var(--color-background)",
        foreground: "var(--color-foreground)",
      },

      // ── Typography ────────────────────────────────────────────
      fontFamily: {
        display: ["var(--font-display)"],
        body:    ["var(--font-body)"],
        mono:    ["var(--font-mono)"],
        sans:    ["var(--font-body)"],
        serif:   ["var(--font-display)"],
      },

      // ── Border Radius ─────────────────────────────────────────
      borderRadius: {
        sm:   "var(--radius-sm)",
        DEFAULT:"var(--radius-base)",
        md:   "var(--radius-md)",
        lg:   "var(--radius-lg)",
        xl:   "var(--radius-xl)",
        full: "var(--radius-full)",
      },

      // ── Box Shadows ───────────────────────────────────────────
      boxShadow: {
        sm:    "var(--shadow-sm)",
        DEFAULT:"var(--shadow-base)",
        md:    "var(--shadow-md)",
        lg:    "var(--shadow-lg)",
        xl:    "var(--shadow-xl)",
        green: "var(--shadow-green)",
        amber: "var(--shadow-amber)",
      },

      // ── Spacing ───────────────────────────────────────────────
      maxWidth: {
        container: "var(--container-max-width)",
      },
      minHeight: {
        hero: "var(--hero-min-height)",
      },

      // ── Animation / Keyframes ─────────────────────────────────
      keyframes: {
        "fade-up": {
          "0%":   { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-in-left": {
          "0%":   { opacity: "0", transform: "translateX(-32px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "slide-in-right": {
          "0%":   { opacity: "0", transform: "translateX(32px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "scale-in": {
          "0%":   { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        ticker: {
          "0%":   { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        pulse: {
          "0%, 100%": { opacity: "1" },
          "50%":      { opacity: "0.5" },
        },
        "spin-slow": {
          from: { transform: "rotate(0deg)" },
          to:   { transform: "rotate(360deg)" },
        },
      },
      animation: {
        "fade-up":         "fade-up 0.5s cubic-bezier(0,0,0.2,1) forwards",
        "fade-in":         "fade-in 0.4s ease forwards",
        "slide-in-left":   "slide-in-left 0.5s cubic-bezier(0,0,0.2,1) forwards",
        "slide-in-right":  "slide-in-right 0.5s cubic-bezier(0,0,0.2,1) forwards",
        "scale-in":        "scale-in 0.3s cubic-bezier(0,0,0.2,1) forwards",
        ticker:            "ticker 30s linear infinite",
        shimmer:           "shimmer 2s linear infinite",
        "pulse-slow":      "pulse 3s ease-in-out infinite",
        "spin-slow":       "spin-slow 8s linear infinite",
      },

      // ── Background Images ──────────────────────────────────────
      backgroundImage: {
        "gradient-hero":
          "linear-gradient(135deg, var(--color-primary-950) 0%, var(--color-primary-700) 50%, var(--color-primary-900) 100%)",
        "gradient-accent":
          "linear-gradient(135deg, var(--color-accent-500) 0%, var(--color-accent-600) 100%)",
        "gradient-card":
          "linear-gradient(145deg, #ffffff 0%, var(--color-neutral-50) 100%)",
        "noise":
          "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E\")",
      },

      // ── Grid Template Columns ─────────────────────────────────
      gridTemplateColumns: {
        "auto-fill-280": "repeat(auto-fill, minmax(280px, 1fr))",
        "auto-fill-320": "repeat(auto-fill, minmax(320px, 1fr))",
        "auto-fill-360": "repeat(auto-fill, minmax(360px, 1fr))",
      },

      // ── Transition Duration ───────────────────────────────────
      transitionDuration: {
        "0":   "0ms",
        "150": "150ms",
        "200": "200ms",
        "300": "300ms",
        "500": "500ms",
        "700": "700ms",
      },

      // ── Z-Index ───────────────────────────────────────────────
      zIndex: {
        nav:     "100",
        modal:   "200",
        tooltip: "300",
        toast:   "400",
      },
    },
  },
  plugins: [],
};

export default config;