"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ThemeProviderProps } from "next-themes/dist/types";

/**
 * ThemeProvider
 * Wraps next-themes to enable light/dark mode switching.
 * The active theme class is applied to <html> via the "class" attribute.
 * All color tokens in globals.css respond to .dark on the root element.
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
