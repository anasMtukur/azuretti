/**
 * ============================================================
 * AZURETTI THEME CONFIGURATION
 * ============================================================
 * This is the SINGLE SOURCE OF TRUTH for all design tokens.
 * Changing values here propagates across the entire application.
 *
 * Edit this file to rebrand or retheme the platform.
 * ============================================================
 */

export const theme = {
  /**
   * BRAND IDENTITY
   */
  brand: {
    name: "Azuretti",
    fullName: "Azuretti Service & Distribution",
    tagline: "Nigeria Export Trade House in France",
    description:
      "Your compliant gateway to Europe's 500 million consumers",
    email: "ETH@Azurettiservices.fr",
    phoneNigeria: "+234 903 622 6516",
    phoneFrance: "+33 6 25 65 02 65",
    website: "https://azurettiservices.fr",
  },

  /**
   * COLOR PALETTE
   * Primary: Deep Forest Green (authority, agriculture, trust)
   * Accent:  Warm Amber/Gold (Nigeria, energy, prosperity)
   * Neutral: Slate greys for structure
   */
  colors: {
    // Primary brand color - Azzuretti Blue
    primary: {
      50:  "#eef2ff",
      100: "#e0e7ff",
      200: "#c7d2fe",
      300: "#a5b4fc",
      400: "#818cf8",
      500: "#4f63e6",
      600: "#2f43c6",   // ← Main primary (closest to logo tone)
      700: "#2436a3",
      800: "#1d2c85",
      900: "#18256d",
      950: "#0f1745"
    },

    // Accent color - Warm Amber Gold
    accent: {
      50:  "#fefce8",
      100: "#fef9c3",
      200: "#fef08a",
      300: "#fde047",
      400: "#facc15",
      500: "#eab308",   // ← Main accent (gold)
      600: "#ca8a04",
      700: "#a16207",
      800: "#854d0e",
      900: "#713f12",
      950: "#422006"
    },

    // Neutral palette
    neutral: {
      50:  "#f8fafc",
      100: "#f1f5f9",
      200: "#e2e8f0",
      300: "#cbd5e1",
      400: "#94a3b8",
      500: "#64748b",
      600: "#475569",
      700: "#334155",
      800: "#1e293b",
      900: "#0f172a",   // ← Dark backgrounds (footer, dark sections)
      950: "#020617",
    },

    // Semantic colors
    success: "#16a34a",
    warning: "#d97706",
    error:   "#dc2626",
    info:    "#2563eb",

    // Surface colors
    background: "#ffffff",
    foreground:  "#0f172a",
    muted:       "#f8fafc",
    border:      "#e2e8f0",
    card:        "#ffffff",
    cardForeground: "#0f172a",
  },

  /**
   * TYPOGRAPHY
   * Display: Playfair Display - Editorial gravitas for headlines
   * Body:    DM Sans - Clean, modern, highly legible
   * Mono:    JetBrains Mono - Code / data tables
   */
  typography: {
    fonts: {
      display: "'Playfair Display', Georgia, serif",
      body:    "'DM Sans', system-ui, sans-serif",
      mono:    "'JetBrains Mono', 'Courier New', monospace",
    },
    // Google Fonts import URL - update if fonts change
    googleFontsUrl:
      "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,800;1,400;1,600&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=JetBrains+Mono:wght@400;500&display=swap",

    sizes: {
      xs:   "0.75rem",   // 12px
      sm:   "0.875rem",  // 14px
      base: "1rem",      // 16px
      lg:   "1.125rem",  // 18px
      xl:   "1.25rem",   // 20px
      "2xl":"1.5rem",    // 24px
      "3xl":"1.875rem",  // 30px
      "4xl":"2.25rem",   // 36px
      "5xl":"3rem",      // 48px
      "6xl":"3.75rem",   // 60px
      "7xl":"4.5rem",    // 72px
    },

    weights: {
      light:    300,
      regular:  400,
      medium:   500,
      semibold: 600,
      bold:     700,
      extrabold:800,
    },

    lineHeights: {
      tight:  1.2,
      snug:   1.375,
      normal: 1.5,
      relaxed:1.625,
      loose:  2,
    },
  },

  /**
   * SPACING & LAYOUT
   */
  spacing: {
    // Section vertical padding
    sectionPaddingY: "5rem",       // py-20
    sectionPaddingYSm: "3rem",     // py-12 on mobile

    // Container max widths
    containerMaxWidth: "1280px",   // max-w-screen-xl
    containerPaddingX: "1.5rem",   // px-6

    // Card / component internal spacing
    cardPadding: "1.5rem",         // p-6
    cardPaddingLg: "2rem",         // p-8
  },

  /**
   * BORDER RADIUS
   */
  radius: {
    none:  "0",
    sm:    "0.25rem",   // 4px
    base:  "0.5rem",    // 8px  ← default cards
    md:    "0.75rem",   // 12px
    lg:    "1rem",      // 16px ← hero cards
    xl:    "1.5rem",    // 24px
    "2xl": "2rem",      // 32px
    full:  "9999px",    // pills / badges
  },

  /**
   * SHADOWS
   */
  shadows: {
    sm:  "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    base:"0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
    md:  "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
    lg:  "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
    xl:  "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
    "2xl":"0 25px 50px -12px rgb(0 0 0 / 0.25)",
    // Green-tinted card hover shadow
    green: "0 10px 30px -5px rgb(28 125 74 / 0.2)",
    // Amber-tinted accent shadow
    amber: "0 10px 30px -5px rgb(245 158 11 / 0.3)",
  },

  /**
   * ANIMATION & TRANSITIONS
   */
  animation: {
    // Duration presets
    duration: {
      fast:   "150ms",
      base:   "200ms",
      slow:   "300ms",
      slower: "500ms",
      slowest:"700ms",
    },
    // Easing presets
    easing: {
      ease:      "ease",
      easeIn:    "cubic-bezier(0.4, 0, 1, 1)",
      easeOut:   "cubic-bezier(0, 0, 0.2, 1)",
      easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)",
      spring:    "cubic-bezier(0.175, 0.885, 0.32, 1.275)",
    },
  },

  /**
   * NAVIGATION
   * Controls the appearance of the top navigation bar
   */
  nav: {
    height:        "4.5rem",   // 72px
    heightScrolled:"3.5rem",   // 56px - shrinks on scroll
    backgroundColor: "transparent",
    scrolledBackground: "#ffffff",
    borderColor:   "#e2e8f0",
    logoHeight:    "2.25rem",
  },

  /**
   * HERO SECTION
   */
  hero: {
    overlayOpacity: 0.55,
    minHeight: "90vh",
    gradientFrom: "#a5b4fc",  // primary-950
    gradientTo:   "#4f63e6",  // primary-600
  },

  /**
   * COMPONENT VARIANTS
   * Extend these to add/modify button styles, badge styles, etc.
   */
  button: {
    variants: {
      primary: {
        background: "#4f63e6",
        color: "#ffffff",
        hoverBackground: "#4f63e6",
      },
      accent: {
        background: "#f59e0b",
        color: "#0f172a",
        hoverBackground: "#d97706",
      },
      outline: {
        background: "transparent",
        color: "#4f63e6",
        border: "2px solid #4f63e6",
        hoverBackground: "#4f63e6",
        hoverColor: "#ffffff",
      },
      ghost: {
        background: "transparent",
        color: "#4f63e6",
        hoverBackground: "#f0faf4",
      },
      dark: {
        background: "#0f172a",
        color: "#ffffff",
        hoverBackground: "#1e293b",
      },
    },
  },

  /**
   * SECTIONS & PAGE BACKGROUNDS
   * Alternating section backgrounds for visual rhythm
   */
  sections: {
    white:     "#ffffff",
    muted:     "#f8fafc",
    dark:      "#0f172a",     // footer, dark CTA sections
    darkGreen: "#092419",     // deep green sections
    green:     "#4f63e6",     // primary green sections
    amber:     "#fef3c7",     // light amber highlight sections
  },

  /**
   * COMMODITY CATEGORIES
   * Used for color-coding product cards
   */
  commodityColors: {
    pulses:  { bg: "#dcf5e5", text: "#4f63e6", dot: "#2a9d60" },
    grains:  { bg: "#fef3c7", text: "#92400e", dot: "#f59e0b" },
    seeds:   { bg: "#e0f2fe", text: "#075985", dot: "#0284c7" },
    nuts:    { bg: "#fce7f3", text: "#9d174d", dot: "#ec4899" },
    default: { bg: "#f1f5f9", text: "#334155", dot: "#64748b" },
  },

  /**
   * PORTAL THEMES
   * Different accent colors for exporter vs buyer portals
   */
  portals: {
    exporter: {
      accent:      "#4f63e6",
      accentLight: "#f0faf4",
      label:       "Exporter Portal",
    },
    buyer: {
      accent:      "#4f63e6",
      accentLight: "#eff6ff",
      label:       "Buyer Portal",
    },
    admin: {
      accent:      "#4f63e6",
      accentLight: "#f5f3ff",
      label:       "Admin Portal",
    },
  },

  /**
   * STATUS COLORS
   * Used in shipment tracker, order tables, etc.
   */
  status: {
    booked:     { bg: "#e0f2fe", text: "#075985", label: "Booked" },
    loaded:     { bg: "#fef3c7", text: "#92400e", label: "Loaded" },
    inTransit:  { bg: "#dbeafe", text: "#1e40af", label: "In Transit" },
    delivered:  { bg: "#dcf5e5", text: "#2436a3", label: "Delivered" },
    cancelled:  { bg: "#fee2e2", text: "#991b1b", label: "Cancelled" },
    pending:    { bg: "#f1f5f9", text: "#475569", label: "Pending" },
    approved:   { bg: "#d1fae5", text: "#065f46", label: "Approved" },
    rejected:   { bg: "#fee2e2", text: "#991b1b", label: "Rejected" },
    paid:       { bg: "#dcf5e5", text: "#2436a3", label: "Paid" },
    unpaid:     { bg: "#fee2e2", text: "#991b1b", label: "Not Paid" },
    partialPaid:{ bg: "#fef3c7", text: "#92400e", label: "Partial" },
  },

  /**
   * OFFICE LOCATIONS
   * Used in contact section & footer
   */
  locations: [
    {
      id:      "kano",
      country: "Nigeria",
      city:    "Kano",
      address: "Iro mai Taya, Ibrahim Taiwo Road, Kano State",
      phone:   "+234 903 622 6516",
      flag:    "🇳🇬",
    },
    {
      id:      "abuja",
      country: "Nigeria",
      city:    "Abuja",
      address: "No. 08 UN Street, off Danube, Maitama, Abuja",
      phone:   "+234 903 622 6516",
      flag:    "🇳🇬",
    },
    {
      id:      "france",
      country: "France",
      city:    "Villeneuve-sur-Lot",
      address: "79 Avenue de Bias, 47300 Villeneuve-sur-Lot",
      phone:   "+33 6 25 65 02 65",
      flag:    "🇫🇷",
    },
  ],
} as const;

/**
 * TYPE EXPORTS
 * Auto-derived from the theme object above.
 */
export type Theme = typeof theme;
export type ThemeColor = typeof theme.colors;
export type ButtonVariant = keyof typeof theme.button.variants;
export type StatusKey = keyof typeof theme.status;
export type PortalKey = keyof typeof theme.portals;
export type CommodityCategory = keyof typeof theme.commodityColors;

/**
 * CSS CUSTOM PROPERTIES GENERATOR
 * Call this to get all theme values as a flat CSS variable map.
 * Used in globals.css :root block.
 */
export function getThemeCSSVars(): Record<string, string> {
  const { colors, typography, spacing, radius, shadows, nav, hero } = theme;

  return {
    // Primary
    "--color-primary-50":  colors.primary[50],
    "--color-primary-100": colors.primary[100],
    "--color-primary-200": colors.primary[200],
    "--color-primary-300": colors.primary[300],
    "--color-primary-400": colors.primary[400],
    "--color-primary-500": colors.primary[500],
    "--color-primary-600": colors.primary[600],
    "--color-primary-700": colors.primary[700],
    "--color-primary-800": colors.primary[800],
    "--color-primary-900": colors.primary[900],
    "--color-primary-950": colors.primary[950],

    // Accent
    "--color-accent-50":  colors.accent[50],
    "--color-accent-100": colors.accent[100],
    "--color-accent-200": colors.accent[200],
    "--color-accent-300": colors.accent[300],
    "--color-accent-400": colors.accent[400],
    "--color-accent-500": colors.accent[500],
    "--color-accent-600": colors.accent[600],
    "--color-accent-700": colors.accent[700],
    "--color-accent-800": colors.accent[800],
    "--color-accent-900": colors.accent[900],

    // Neutral
    "--color-neutral-50":  colors.neutral[50],
    "--color-neutral-100": colors.neutral[100],
    "--color-neutral-200": colors.neutral[200],
    "--color-neutral-300": colors.neutral[300],
    "--color-neutral-400": colors.neutral[400],
    "--color-neutral-500": colors.neutral[500],
    "--color-neutral-600": colors.neutral[600],
    "--color-neutral-700": colors.neutral[700],
    "--color-neutral-800": colors.neutral[800],
    "--color-neutral-900": colors.neutral[900],
    "--color-neutral-950": colors.neutral[950],

    // Semantic
    "--color-success":    colors.success,
    "--color-warning":    colors.warning,
    "--color-error":      colors.error,
    "--color-info":       colors.info,
    "--color-background": colors.background,
    "--color-foreground": colors.foreground,
    "--color-muted":      colors.muted,
    "--color-border":     colors.border,
    "--color-card":       colors.card,

    // Typography
    "--font-display": typography.fonts.display,
    "--font-body":    typography.fonts.body,
    "--font-mono":    typography.fonts.mono,

    // Spacing
    "--section-padding-y":    spacing.sectionPaddingY,
    "--section-padding-y-sm": spacing.sectionPaddingYSm,
    "--container-max-width":  spacing.containerMaxWidth,
    "--container-padding-x":  spacing.containerPaddingX,

    // Radius
    "--radius-sm":   radius.sm,
    "--radius-base": radius.base,
    "--radius-md":   radius.md,
    "--radius-lg":   radius.lg,
    "--radius-xl":   radius.xl,
    "--radius-full":  radius.full,

    // Shadows
    "--shadow-sm":    shadows.sm,
    "--shadow-base":  shadows.base,
    "--shadow-md":    shadows.md,
    "--shadow-lg":    shadows.lg,
    "--shadow-xl":    shadows.xl,
    "--shadow-green": shadows.green,
    "--shadow-amber": shadows.amber,

    // Nav
    "--nav-height":         nav.height,
    "--nav-height-scrolled":nav.heightScrolled,

    // Hero
    "--hero-min-height": hero.minHeight,
  };
}

export default theme;
