import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
  FileText,
  Handshake,
  CreditCard,
  UserCheck,
  MapPin,
  Package,
  Factory,
  ShoppingCart,
  Truck,
  Globe2,
  CheckCircle2,
} from "lucide-react";

export const metadata: Metadata = {
  title: "European Buyers – Azuretti",
  description:
    "Source verified Nigerian commodities from within Europe. Traceable, compliant and contract-backed supply through the Azuretti Trade House in France.",
};

const offerings = [
  {
    icon: FileText,
    title: "Full traceability & documentation",
    desc: "Every product ships with certificates of analysis, certificates of origin, phytosanitary documents and packing lists — downloadable from your buyer dashboard.",
  },
  {
    icon: ShieldCheck,
    title: "EU-compliant packaging & labelling",
    desc: "All products meet EU food safety, labelling and packaging requirements before leaving the Trade House in France.",
  },
  {
    icon: Handshake,
    title: "Long-term supply contracts",
    desc: "Move beyond spot purchases. We structure monthly or seasonal supply programmes tailored to your production calendar.",
  },
  {
    icon: CreditCard,
    title: "Competitive pricing & trade finance",
    desc: "Access competitive commodity prices with trade finance options available via our partner banks including Nexim Bank and Ebury.",
  },
  {
    icon: UserCheck,
    title: "Vetted & verified exporters only",
    desc: "Every Nigerian exporter in our programme is screened, compliance-checked and approved before their products enter the Trade House.",
  },
  {
    icon: MapPin,
    title: "EU-based single counterparty",
    desc: "You deal with one EU-based entity — Azuretti France. No need to travel to Nigeria or manage multiple Nigerian suppliers.",
  },
];

const whyTradeHouse = [
  "Access authentic Nigerian products without travelling to Nigeria",
  "Reduce operational and regulatory risk through a single EU-based counterparty",
  "Flexible Incoterms and logistics solutions across Europe",
  "Stock pre-positioned in France for faster delivery across the continent",
  "All products tested by Bureau Veritas / SGS before shipment",
  "Continuity of supply through structured multi-exporter programmes",
];

const buyerTypes = [
  { icon: ShoppingCart, type: "Importers",         desc: "Import directly from the Trade House in France under your preferred Incoterms." },
  { icon: Truck,        type: "Distributors",      desc: "Access consistent, branded supply programmes for resale across European markets." },
  { icon: Package,      type: "Wholesalers",       desc: "Buy in bulk with flexible quantity and packaging configurations." },
  { icon: Factory,      type: "Food manufacturers & processors", desc: "Secure long-term, specification-grade ingredients for your production lines." },
];

const processSteps = [
  {
    number: "01",
    title: "Open your buyer account",
    desc: "Register online and complete your buyer profile. A brief verification step ensures only serious buyers access our catalogue.",
  },
  {
    number: "02",
    title: "Browse available stock",
    desc: "View available products in the France warehouse — with grades, quantities, indicative prices and downloadable documentation.",
  },
  {
    number: "03",
    title: "Place a demand or request a quote",
    desc: "Submit your quantity, specification, timeline and preferred Incoterm. Our trade team responds within 48 hours.",
  },
  {
    number: "04",
    title: "Contract & logistics",
    desc: "We issue a supply contract and coordinate delivery from Villeneuve-sur-Lot to your location anywhere in Europe.",
  },
];

export default function BuyerPage() {
  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative min-h-[80vh] flex items-center overflow-hidden bg-neutral-900 pt-24">
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: "32px 32px",
          }}
          aria-hidden="true"
        />
        {/* Accent glow — different from exporter page */}
        <div
          className="absolute top-0 right-0 w-[700px] h-[700px] rounded-full opacity-10 -translate-y-1/3 translate-x-1/4"
          style={{ background: "radial-gradient(circle, #2563eb, transparent 70%)" }}
          aria-hidden="true"
        />

        <div className="container-theme relative z-10 py-16">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-white/80 text-sm font-medium mb-6">
              <Globe2 className="h-3.5 w-3.5 text-blue-400" />
              For European Buyers
            </div>
            <h1 className="font-display font-bold text-white mb-5">
              Source verified Nigerian commodities{" "}
              <span className="text-accent-400">from within Europe</span>
            </h1>
            <p className="text-lg text-neutral-300 leading-relaxed mb-10 max-w-2xl">
              Traceable, compliant and contract-backed supply through Azuretti's
              Trade House in France. One EU-based counterparty. Zero trips to Nigeria.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/auth/register?role=buyer" className="btn-accent text-base px-7 py-3.5">
                Open Buyer Account
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/commodities"
                className="flex items-center gap-2 px-7 py-3.5 rounded font-semibold text-base text-white/80 border-2 border-white/20 hover:border-white/50 hover:text-white transition-all duration-200"
              >
                Browse commodities
              </Link>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 inset-x-0 h-20 bg-gradient-to-t from-white" aria-hidden="true" />
      </section>

      {/* ── What We Offer Buyers ───────────────────────────────────────── */}
      <section className="section-padding bg-white">
        <div className="container-theme">
          <div className="max-w-xl mb-14">
            <span className="section-label mb-4">What We Offer European Buyers</span>
            <h2 className="font-display font-bold text-neutral-900">
              Reliable, traceable supply — managed from France
            </h2>
            <p className="text-neutral-600 mt-3 leading-relaxed">
              Azuretti removes the complexity of sourcing directly from Nigeria while
              preserving the authenticity and value of African commodities.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {offerings.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="group p-6 rounded-xl border border-border bg-white hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className="w-11 h-11 rounded-lg bg-blue-50 flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
                  <Icon className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="font-display font-semibold text-lg text-neutral-900 mb-2">{title}</h3>
                <p className="text-sm text-neutral-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why Buy via the Trade House ────────────────────────────────── */}
      <section className="section-padding bg-neutral-50">
        <div className="container-theme">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <span className="section-label mb-5">Why Buy via the Trade House</span>
              <h2 className="font-display font-bold text-neutral-900 mb-4">
                One trusted EU hub for authentic Nigerian supply
              </h2>
              <p className="text-neutral-600 leading-relaxed mb-8">
                Our France warehouse gives European buyers direct access to pre-positioned,
                EU-approved Nigerian commodities — without the operational, regulatory and
                counterparty risks of direct sourcing.
              </p>
              <Link href="/auth/register?role=buyer" className="btn-primary text-sm px-6 py-3">
                Open your buyer account
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="space-y-3">
              {whyTradeHouse.map((item) => (
                <div key={item} className="flex items-start gap-3 p-4 rounded-lg bg-white border border-border">
                  <CheckCircle2 className="h-5 w-5 text-primary-600 shrink-0 mt-0.5" />
                  <span className="text-sm text-neutral-700 leading-relaxed">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Who Can Buy From Us ────────────────────────────────────────── */}
      <section className="section-padding bg-white">
        <div className="container-theme">
          <div className="text-center max-w-xl mx-auto mb-14">
            <span className="section-label mb-4 justify-center">Who Can Buy From Us</span>
            <h2 className="font-display font-bold text-neutral-900">
              We serve the full European supply chain
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {buyerTypes.map(({ icon: Icon, type, desc }) => (
              <div
                key={type}
                className="p-6 rounded-xl border border-border bg-white text-center hover:border-primary-200 hover:shadow-green transition-all duration-200"
              >
                <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center mx-auto mb-4">
                  <Icon className="h-6 w-6 text-primary-600" />
                </div>
                <h3 className="font-display font-semibold text-base text-neutral-900 mb-2">{type}</h3>
                <p className="text-xs text-neutral-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How the process works ─────────────────────────────────────── */}
      <section className="section-padding bg-neutral-900 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: "28px 28px",
          }}
          aria-hidden="true"
        />
        <div className="container-theme relative z-10">
          <div className="text-center max-w-xl mx-auto mb-14">
            <span className="section-label mb-4 justify-center text-accent-400">
              <span className="block w-6 h-0.5 bg-accent-400" />
              Getting Started
            </span>
            <h2 className="font-display font-bold text-white">
              Open your buyer account in 4 steps
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {processSteps.map(({ number, title, desc }) => (
              <div key={number} className="p-6 rounded-xl bg-white/5 border border-white/10">
                <div className="font-display font-bold text-4xl text-accent-500 mb-4 leading-none">
                  {number}
                </div>
                <h3 className="font-display font-semibold text-lg text-white mb-2">{title}</h3>
                <p className="text-sm text-neutral-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Warehouse info ────────────────────────────────────────────── */}
      <section className="section-padding bg-white">
        <div className="container-theme">
          <div className="rounded-2xl bg-primary-600 text-white overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              {/* Text */}
              <div className="p-10 lg:p-14">
                <span className="section-label mb-5 text-primary-200">
                  <span className="block w-6 h-0.5 bg-accent-400" />
                  France Warehouse
                </span>
                <h2 className="font-display font-bold text-3xl text-white mb-4">
                  Stock pre-positioned in France for fast European delivery
                </h2>
                <p className="text-primary-100 leading-relaxed mb-6">
                  Our 3,500 MT warehouse in Villeneuve-sur-Lot is strategically located
                  close to major logistics corridors, enabling just-in-time deliveries
                  across Europe under your preferred Incoterms.
                </p>
                <div className="flex items-start gap-3 mb-8">
                  <MapPin className="h-5 w-5 text-accent-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-white text-sm">🇫🇷 Villeneuve-sur-Lot, France</p>
                    <p className="text-xs text-primary-200 mt-0.5">79 Avenue de Bias, 47300</p>
                  </div>
                </div>
                <Link href="/auth/register?role=buyer" className="btn-accent text-sm px-6 py-3">
                  Sign up to view available stock
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              {/* Stats panel */}
              <div className="bg-primary-700 p-10 lg:p-14 flex flex-col justify-center gap-8">
                {[
                  { value: "3,500 MT", label: "Warehouse capacity in France" },
                  { value: "4,000 MT", label: "Partner storage in Nigeria" },
                  { value: "99%",      label: "Quality acceptance rate by EU labs" },
                  { value: "48 hrs",   label: "Quote response time" },
                ].map(({ value, label }) => (
                  <div key={label} className="border-b border-primary-600 pb-6 last:border-0 last:pb-0">
                    <p className="font-display font-bold text-3xl text-accent-400 mb-1">{value}</p>
                    <p className="text-sm text-primary-200">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Final CTA ──────────────────────────────────────────────────── */}
      <section className="section-padding bg-accent-50 border-t border-accent-100">
        <div className="container-theme text-center">
          <h2 className="font-display font-bold text-3xl text-neutral-900 mb-4">
            Sign up to view available stock & upcoming shipments
          </h2>
          <p className="text-neutral-600 max-w-xl mx-auto mb-8 leading-relaxed">
            Create your buyer account to access available stock in our France warehouse,
            request tailored supply programmes, and download documentation for each product.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/auth/register?role=buyer" className="btn-primary px-8 py-4 text-base">
              Open Buyer Account
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/contact" className="btn-outline px-8 py-4 text-base">
              Speak to our trade team
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
