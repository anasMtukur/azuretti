import { Users, ShieldCheck, Truck, Globe2, FileCheck, TrendingUp } from "lucide-react";

const props = [
  {
    icon: Users,
    title: "Exporter Onboarding & Support",
    description:
      "Step-by-step guidance to help Nigerian exporters become fully EU-compliant, from registration to first shipment.",
  },
  {
    icon: ShieldCheck,
    title: "Quality Control & Certification",
    description:
      "All products are inspected and tested by accredited labs (SGS, Bureau Veritas) under ISO standards.",
  },
  {
    icon: Truck,
    title: "Logistics & Warehousing",
    description:
      "4,000 MT capacity in Nigeria and 3,500 MT in France — enabling just-in-time delivery across Europe.",
  },
  {
    icon: Globe2,
    title: "EU Market Access & Buyer Matchmaking",
    description:
      "Direct connections to verified European importers, distributors and food manufacturers via our Trade House.",
  },
  {
    icon: FileCheck,
    title: "Documentation & Traceability",
    description:
      "Full paper trail — certificates of origin, phytosanitary certs, packing lists, and commodity declarations.",
  },
  {
    icon: TrendingUp,
    title: "Euro Revenue & FX Hedging",
    description:
      "Sell in Euro, reduce currency risk, and benefit from structured trade finance options via partner banks.",
  },
];

export function ValuePropsSection() {
  return (
    <section className="section-padding bg-muted" aria-label="What we offer">
      <div className="container-theme">
        {/* Header */}
        <div className="max-w-xl mb-14">
          <span className="section-label mb-4">Our Core Role</span>
          <h2 className="font-display font-bold text-neutral-900 mb-4">
            Everything you need to trade between Nigeria and Europe
          </h2>
          <p className="text-neutral-600 leading-relaxed">
            Azuretti acts as your single point of contact for every stage of
            the export value chain.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {props.map(({ icon: Icon, title, description }, i) => (
            <div
              key={title}
              className="card p-6 group cursor-default"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="w-11 h-11 rounded-lg bg-primary-50 flex items-center justify-center mb-4 group-hover:bg-primary-100 transition-colors duration-200">
                <Icon className="h-5 w-5 text-primary-600" />
              </div>
              <h3 className="font-display font-semibold text-lg text-neutral-900 mb-2">
                {title}
              </h3>
              <p className="text-sm text-neutral-600 leading-relaxed">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
