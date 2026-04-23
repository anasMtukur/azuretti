import type { Metadata, Viewport } from "next";
import { theme } from "@/config/theme";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { ToastProvider } from "@/components/providers/ToastProvider";
import "./globals.css";
import { ConfirmProvider } from "@/components/providers/ConfirmProvider";

export const metadata: Metadata = {
  metadataBase: new URL(theme.brand.website),
  title: {
    default: `${theme.brand.name} – ${theme.brand.tagline}`,
    template: `%s | ${theme.brand.name}`,
  },
  description: theme.brand.description,
  keywords: [
    "Nigerian export",
    "trade house France",
    "African commodities",
    "EU market access",
    "Nigerian exporters",
    "European buyers",
    "commodity trade",
    "hibiscus flower",
    "sesame seeds",
    "cocoa beans",
    "cashew nuts",
    "agricultural export Nigeria",
  ],
  authors: [{ name: theme.brand.fullName }],
  creator: theme.brand.fullName,
  openGraph: {
    type: "website",
    locale: "en_US",
    url: theme.brand.website,
    siteName: theme.brand.name,
    title: `${theme.brand.name} – ${theme.brand.tagline}`,
    description: theme.brand.description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${theme.brand.name} – ${theme.brand.tagline}`,
    description: theme.brand.description,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: theme.colors.primary[600] },
    { media: "(prefers-color-scheme: dark)",  color: theme.colors.primary[900] },
  ],
  width: "device-width",
  initialScale: 1,
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-body antialiased">
        <SessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange={false}
          >
            <ToastProvider>
              <ConfirmProvider>
                {children}
              </ConfirmProvider>
            </ToastProvider>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
