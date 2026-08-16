import Link from "next/link";
import { Mail, Phone, MapPin, ExternalLink } from "lucide-react";
import { theme } from "@/config/theme";
import { Logo } from "./Logo";

const footerLinks = {
  "Platform": [
    { label: "Nigerian Exporters",  href: "/exporter" },
    { label: "European Buyers",     href: "/buyer" },
    { label: "Exporter Portal",     href: "/auth/register?role=exporter" },
    { label: "Buyer Portal",        href: "/auth/register?role=buyer" },
  ],
  "Commodities": [
    { label: "Pulses",              href: "/commodities/pulses" },
    { label: "Grains",              href: "/commodities/grains" },
    { label: "Seeds & Nuts",        href: "/commodities/seeds-and-nuts" },
    { label: "All Products",        href: "/commodities" },
  ],
  "Company": [
    { label: "About Azuretti",      href: "/about" },
    { label: "Compliance",          href: "/compliance" },
    { label: "Training",            href: "/training" },
    { label: "News & Events",       href: "/news" },
    { label: "Contact",             href: "/contact" },
  ],
  "Legal": [
    { label: "Terms & Conditions",      href: "/terms" },
    { label: "Privacy & Data Protection", href: "/privacy" },
    { label: "FAQ",                 href: "/faq" },
  ],
};

const partners = [
  "Nigerian Export Promotion Council",
  "Federal Ministry of Trade",
  "First Bank Nigeria",
  "Nexim Bank",
  "Ebury",
];

export function Footer() {
  return (
    <footer className="bg-neutral-900 text-neutral-300">
      {/* Partners strip
      <div className="border-b border-neutral-800">
        <div className="container-theme py-6">
          <p className="text-xs uppercase tracking-widest text-neutral-500 mb-4 font-medium">
            Partnering with leading institutions
          </p>
          <div className="flex flex-wrap gap-x-8 gap-y-2">
            {partners.map((p) => (
              <span key={p} className="text-sm text-neutral-400 font-medium">
                {p}
              </span>
            ))}
          </div>
        </div>
      </div> */}

      {/* Main footer */}
      <div className="container-theme py-16">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          {/* Brand column */}
          <div className="lg:col-span-4">
            <Logo />

            <p className="text-sm leading-relaxed text-neutral-400 mb-6 mt-6 max-w-xs">
              Nigeria Export Trade House in France — your compliant gateway to
              Europe's 500 million consumers.
            </p>

            {/* Locations */}
            <div className="space-y-4">
              {theme.locations.map((loc) => (
                <div key={loc.id} className="flex gap-3">
                  <MapPin className="h-4 w-4 text-accent-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-neutral-300 mb-0.5">
                      {loc.flag} {loc.city}, {loc.country}
                    </p>
                    <p className="text-xs text-neutral-500 leading-relaxed">
                      {loc.address}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Links columns */}
          <div className="lg:col-span-8 grid grid-cols-2 gap-8 md:grid-cols-4">
            {Object.entries(footerLinks).map(([group, links]) => (
              <div key={group}>
                <h4 className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-4">
                  {group}
                </h4>
                <ul className="space-y-2.5">
                  {links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-neutral-500 hover:text-white transition-colors duration-150"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contact bar */}
      <div className="border-t border-neutral-800">
        <div className="container-theme py-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <a
              href={`tel:${theme.brand.phoneNigeria}`}
              className="flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors"
            >
              <Phone className="h-3.5 w-3.5 text-accent-500" />
              {theme.brand.phoneNigeria}
            </a>
            <a
              href={`tel:${theme.brand.phoneFrance}`}
              className="flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors"
            >
              <Phone className="h-3.5 w-3.5 text-accent-500" />
              {theme.brand.phoneFrance}
            </a>
            <a
              href={`mailto:${theme.brand.email}`}
              className="flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors"
            >
              <Mail className="h-3.5 w-3.5 text-accent-500" />
              {theme.brand.email}
            </a>
          </div>

        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-neutral-800/60 bg-neutral-950">
        <div className="container-theme py-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-neutral-600">
            © {new Date().getFullYear()} {theme.brand.fullName}. All rights reserved.
          </p>
          <p className="text-xs text-neutral-600">
            Registered in France · Nigerian Export Trade House
          </p>
        </div>
      </div>
    </footer>
  );
}
