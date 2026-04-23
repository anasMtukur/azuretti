import Link from "next/link";
import { ArrowRight, Factory, ShoppingCart, TrendingUp, Wheat } from "lucide-react";

const portals = [
  {
    key:         "exporter",
    icon:        Factory,
    title:       "Nigerian Exporters",
    description: "Register as an exporter, submit your products, and access EU buyers through the Trade House — all with full compliance support.",
    cta:         "Register as Exporter",
    href:        "/auth/register?role=exporter",
    learnHref:   "/exporter",
    bg:          "bg-primary-600",
    iconBg:      "bg-white/15",
    iconColor:   "text-white",
    textColor:   "text-white",
    mutedColor:  "text-primary-100",
    ctaClass:    "bg-white text-primary-700 hover:bg-primary-50",
    learnClass:  "text-primary-100 hover:text-white",
  },
  {
    key:         "buyer",
    icon:        ShoppingCart,
    title:       "European Buyers",
    description: "Open a buyer account to access verified stock, documentation, and long-term supply programs from Nigeria — all from within Europe.",
    cta:         "Open Buyer Account",
    href:        "/auth/register?role=buyer",
    learnHref:   "/buyer",
    bg:          "bg-neutral-900",
    iconBg:      "bg-accent-500/15",
    iconColor:   "text-accent-400",
    textColor:   "text-white",
    mutedColor:  "text-neutral-400",
    ctaClass:    "bg-accent-500 text-neutral-900 hover:bg-accent-600",
    learnClass:  "text-neutral-400 hover:text-white",
  },
  {
    key:         "investor",
    icon:        TrendingUp,
    title:       "Investors",
    description: "Join commodity-backed export projects starting from the value of a 20 ft container, in collaboration with licensed asset management companies.",
    cta:         "Explore Investments",
    href:        "/about#partnership",
    learnHref:   "/about",
    bg:          "bg-accent-50",
    iconBg:      "bg-accent-100",
    iconColor:   "text-accent-700",
    textColor:   "text-neutral-900",
    mutedColor:  "text-neutral-600",
    ctaClass:    "bg-accent-500 text-neutral-900 hover:bg-accent-600",
    learnClass:  "text-neutral-500 hover:text-neutral-700",
  },
  {
    key:         "farmer",
    icon:        Wheat,
    title:       "Farmers & Suppliers",
    description: "Farmers who want to access the European market can sign up. Azuretti handles aggregation, standardisation and export — you earn in Euro.",
    cta:         "Sign Up as Supplier",
    href:        "/auth/register?role=farmer",
    learnHref:   "/exporter#farmers",
    bg:          "bg-primary-50",
    iconBg:      "bg-primary-100",
    iconColor:   "text-primary-700",
    textColor:   "text-neutral-900",
    mutedColor:  "text-neutral-600",
    ctaClass:    "bg-primary-600 text-white hover:bg-primary-700",
    learnClass:  "text-neutral-500 hover:text-neutral-700",
  },
];

export function PortalsCTA() {
  return (
    <section className="section-padding bg-neutral-50" aria-label="Portals">
      <div className="container-theme">
        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-14">
          <span className="section-label mb-4 justify-center">Partnership Models</span>
          <h2 className="font-display font-bold text-neutral-900">
            Who can work with Azuretti?
          </h2>
          <p className="text-neutral-600 mt-3 leading-relaxed">
            Whether you're an exporter, buyer, investor or farmer — there is a pathway for you
            in the Nigerian Export Trade House.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {portals.map(
            ({
              key, icon: Icon, title, description,
              cta, href, learnHref,
              bg, iconBg, iconColor, textColor, mutedColor, ctaClass, learnClass,
            }) => (
              <div
                key={key}
                className={`${bg} rounded-xl p-6 flex flex-col gap-5`}
              >
                <div className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center`}>
                  <Icon className={`h-6 w-6 ${iconColor}`} />
                </div>

                <div className="flex-1">
                  <h3 className={`font-display font-bold text-xl mb-2 ${textColor}`}>
                    {title}
                  </h3>
                  <p className={`text-sm leading-relaxed ${mutedColor}`}>
                    {description}
                  </p>
                </div>

                <div className="flex flex-col gap-2.5">
                  <Link
                    href={href}
                    className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded font-semibold text-sm transition-all duration-150 ${ctaClass}`}
                  >
                    {cta}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href={learnHref}
                    className={`text-xs font-medium text-center transition-colors duration-150 ${learnClass}`}
                  >
                    Learn more →
                  </Link>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </section>
  );
}
