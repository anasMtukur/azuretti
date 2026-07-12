"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Menu, X, ChevronDown, LogIn, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";
import { theme } from "@/config/theme";
import { PriceTicker } from "./sections/PriceTicker";

const navLinks = [
  { label: "Home",        href: "/" },
  { label: "About",       href: "/about" },
  {
    label: "Commodities",
    href:  "/commodities",
    children: [
      { label: "All Commodities", href: "/commodities" },
      { label: "Pulses",          href: "/commodities?category=pulses" },
      { label: "Grains",          href: "/commodities?category=grains" },
      { label: "Seeds",           href: "/commodities?category=seeds" },
      { label: "Nuts",            href: "/commodities?category=nuts" },
    ],
  },
  {
    label: "Exporters & Buyers",
    href:  "/exporter",
    children: [
      { label: "Nigerian Exporters",  href: "/exporter" },
      { label: "European Buyers",     href: "/buyer" },
    ],
  },
  { label: "Compliance",  href: "/compliance" },
  { label: "Training",    href: "/training" },
  { label: "News",        href: "/news" },
  { label: "Contact",     href: "/contact" },
];

export function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => setMobileOpen(false), [pathname]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const portalHref = session?.user?.role === "exporter"
    ? "/portal/exporter/dashboard"
    : session?.user?.role === "buyer"
    ? "/portal/buyer/dashboard"
    : "/portal/dashboard";

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-nav flex flex-col pointer-events-none">
        {/* 1. Price Ticker - Always at top, always has background */}
        <div className="w-full pointer-events-auto bg-slate-900">
          <PriceTicker />
        </div>

        {/* 2. Main Navigation Bar */}
        <nav
          className={cn(
            "w-full transition-all duration-300 pointer-events-auto",
            scrolled
              ? "bg-white shadow-md border-b border-neutral-100"
              : "bg-transparent"
          )}
          style={{ 
            height: scrolled ? theme.nav.heightScrolled : theme.nav.height 
          }}
        >
          <div className="container-theme h-full flex items-center justify-between">
            {/* Logo */}
            <div className="hidden items-center gap-2.5 group lg:flex w-36">
              <Link href="/" >
                <img src="/images/logo.jpg" alt="Azuretti Services" />
              </Link>
            </div>
            <div className="flex items-center gap-2.5 group lg:hidden w-9">
              <Link href="/">
                <img src="/images/icon.jpg" alt="Azuretti Services" />
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div ref={dropdownRef} className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) =>
                link.children ? (
                  <div key={link.label} className="relative">
                    <button
                      onClick={() => setOpenDropdown(openDropdown === link.label ? null : link.label)}
                      className={cn(
                        "flex items-center gap-1 px-3 py-2 rounded text-sm font-medium transition-all",
                        isActive(link.href)
                          ? scrolled ? "text-primary-600" : "text-accent-300"
                          : scrolled ? "text-neutral-700 hover:text-primary-600" : "text-white/90 hover:text-white"
                      )}
                    >
                      {link.label}
                      <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", openDropdown === link.label && "rotate-180")} />
                    </button>
                    {openDropdown === link.label && (
                      <div className="absolute top-full left-0 mt-1.5 w-52 bg-white rounded-lg shadow-xl border border-neutral-100 overflow-hidden animate-scale-in">
                        {link.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={cn(
                              "block px-4 py-2.5 text-sm transition-colors",
                              isActive(child.href) ? "bg-primary-50 text-primary-700 font-medium" : "text-neutral-700 hover:bg-neutral-50 hover:text-primary-600"
                            )}
                            onClick={() => setOpenDropdown(null)}
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    key={link.label}
                    href={link.href}
                    className={cn(
                      "px-3 py-2 rounded text-sm font-medium transition-all",
                      isActive(link.href)
                        ? scrolled ? "text-primary-600" : "text-accent-300"
                        : scrolled ? "text-neutral-700 hover:text-primary-600" : "text-white/90 hover:text-white"
                    )}
                  >
                    {link.label}
                  </Link>
                )
              )}
            </div>

            {/* Auth Actions */}
            <div className="hidden lg:flex items-center gap-2">
              {session ? (
                <Link href={portalHref} className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded text-sm font-semibold transition-all",
                  scrolled ? "bg-primary-600 text-white hover:bg-primary-700" : "bg-white/15 text-white border border-white/30 hover:bg-white/25"
                )}>
                  <LayoutDashboard className="h-4 w-4" /> Dashboard
                </Link>
              ) : (
                <>
                  <Link href="/auth/login" className={cn(
                    "px-4 py-2 rounded text-sm font-medium transition-colors",
                    scrolled ? "text-neutral-700 hover:text-primary-600" : "text-white/90 hover:text-white"
                  )}>
                    Sign In
                  </Link>
                  <Link href="/auth/register" className="flex items-center gap-1.5 px-4 py-2 rounded bg-accent-500 text-neutral-900 text-sm font-semibold hover:bg-accent-600 transition-colors shadow-sm">
                    <LogIn className="h-4 w-4" /> Get Started
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className={cn(
                "lg:hidden p-2 rounded transition-colors",
                scrolled ? "text-neutral-700 hover:bg-neutral-100" : "text-white hover:bg-white/10"
              )}
            >
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile menu drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-neutral-900/50 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />

          {/* Panel */}
          <div className="absolute top-0 right-0 h-full w-80 max-w-full bg-white shadow-2xl animate-slide-in-right overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">A</span>
                  </div>
                  <span className="font-display font-bold text-primary-700">Azuretti</span>
                </div>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-1.5 rounded hover:bg-neutral-100 transition-colors"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5 text-neutral-600" />
                </button>
              </div>

              {/* Links */}
              <nav className="flex flex-col gap-1">
                {navLinks.map((link) => (
                  <div key={link.label}>
                    <Link
                      href={link.href}
                      className={cn(
                        "block px-3 py-2.5 rounded text-sm font-medium transition-colors",
                        isActive(link.href)
                          ? "bg-primary-50 text-primary-700"
                          : "text-neutral-700 hover:bg-neutral-50 hover:text-primary-600"
                      )}
                    >
                      {link.label}
                    </Link>
                    {link.children && (
                      <div className="ml-4 mt-0.5 flex flex-col gap-0.5">
                        {link.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className="block px-3 py-2 rounded text-sm text-neutral-500 hover:text-primary-600 hover:bg-neutral-50 transition-colors"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </nav>

              {/* Auth CTA */}
              <div className="mt-8 flex flex-col gap-2.5">
                {session ? (
                  <Link href={portalHref} className="btn-primary w-full justify-center text-sm">
                    <LayoutDashboard className="h-4 w-4" />
                    Go to Dashboard
                  </Link>
                ) : (
                  <>
                    <Link href="/auth/register" className="btn-accent w-full justify-center text-sm">
                      Register – Get Started
                    </Link>
                    <Link href="/auth/login" className="btn-outline w-full justify-center text-sm">
                      Sign In
                    </Link>
                  </>
                )}
              </div>

              {/* Contact info */}
              <div className="mt-8 pt-6 border-t border-border">
                <p className="text-xs text-neutral-400 mb-2">Reach us</p>
                <a
                  href={`tel:${theme.brand.phoneNigeria}`}
                  className="block text-sm text-neutral-600 hover:text-primary-600 transition-colors"
                >
                  🇳🇬 {theme.brand.phoneNigeria}
                </a>
                <a
                  href={`tel:${theme.brand.phoneFrance}`}
                  className="block text-sm text-neutral-600 hover:text-primary-600 transition-colors mt-1"
                >
                  🇫🇷 {theme.brand.phoneFrance}
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}