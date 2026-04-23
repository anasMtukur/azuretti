import { Navbar } from "@/components/website/Navbar";
import { Footer } from "@/components/website/Footer";

interface WebsiteLayoutProps {
  children: React.ReactNode;
}

/**
 * Website Layout
 * Wraps all public-facing pages with the Navbar and Footer.
 * Portal and admin routes use their own layouts.
 */
export default function WebsiteLayout({ children }: WebsiteLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
