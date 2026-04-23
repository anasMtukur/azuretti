import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  BarChart3,
  Globe2,
  ShieldCheck,
  Zap,
  DollarSign,
  Users,
  Wheat,
  TrendingUp,
  FileCheck,
  Truck,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Nigerian Exporters – Azuretti",
  description:
    "Turn your commodities into Euro revenue. Export to Europe with full compliance support from Azuretti's Nigerian Export Trade House in France.",
};

const benefits = [
  {
    icon: BarChart3,
    title: "Market intelligence & price trends",
    desc: "Access up-to-date intelligence on EU market demand, pricing benchmarks and seasonal trends for your commodities.",
  },
  {
    icon: Globe2,
    title: "Direct EU buyer access",
    desc: "Connect with verified European importers, distributors and food manufacturers via our Trade House in France — no cold-calling required.",
  },
  {
    icon: ShieldCheck,
    title: "Technical compliance support",
    desc: "Our team guides you through EU food safety standards, documentation requirements and packaging regulations step by step.",
  },
  {
    icon: Zap,
    title: "Zero-bureaucracy onboarding",
    desc: "Faster onboarding and simplified trade processing. We handle the complexity so you can focus on supplying quality product.",
  },
  {
    icon: DollarSign,
    title: "Euro-based sales",
    desc: "Sell in Euro to hedge FX risk, protect margins and build a predictable revenue stream from European buyers.",
  },
  {
    icon: Truck,
    title: "Logistics & warehousing",
    desc: "4,000 MT storage in Nigeria and 3,500 MT in France. We coordinate freight, customs clearance and last-mile delivery.",
  },
];

const steps = [
  {
    number: "01",
    title: "Register your profile",
    desc: "Create your exporter account and complete your company profile — name, registration number, export licence, and the commodities you supply.",
  },
  {
    number: "02",
    title: "Submit your products",
    desc: "Upload your product specifications, available grades, quantities and preferred shipment windows. Our team reviews within 3 business days.",
  },
  {
    number: "03",
    title: "Compliance & quality check",
    desc: "We arrange lab testing with Bureau Veritas or SGS. Products that meet EU standards are approved for the Trade House programme.",
  },
  {
    number: "04",
    title: "Match with buyers",
    desc: "Your verified products are presented to our network of European buyers. We handle negotiations, contracts and documentation.",
  },
  {
    number: "05",
    title: "Ship & get paid",
    desc: "Once a contract is agreed, we coordinate shipping from Nigeria to France. Payment is made in Euro on arrival and acceptance.",
  },
];

const partnerTypes = [
  {
    icon: Users,
    role: "Exporters",
    desc: "Nigerian companies with export licences can ship through the Trade House and benefit from Azuretti's buyer network and compliance control at each stage.",
    cta: "Register as Exporter",
    href: "/auth/register?role=exporter",
  },
  {
    icon: Wheat,
    role: "Farmers & Suppliers",
    desc: "Farmers and suppliers who are interested in export can register as suppliers. Azuretti aggregates, standardises and exports your commodities so you earn in Euro.",
    cta: "Sign Up as Supplier",
    href: "/auth/register?role=farmer",
  },
  {
    icon: TrendingUp,
    role: "Investors",
    desc: "Individuals or corporate entities can join commodity-backed export projects starting from the value of a 20 ft container, through partnerships with asset management companies.",
    cta: "Explore Investment",
    href: "/auth/register?role=investor",
  },
];

const commoditiesHandled = [
  "Hibiscus Flower", "Sesame Seeds", "Raw Cashew Nut", "Cocoa Beans",
  "Gum Arabic", "Dried Split Ginger", "Sorghum", "Sheanuts",
  "Cassava Chips", "Millet", "Sunflower Seeds", "Cassia Tora",
];

export default function ExporterPage() {
  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative min-h-[80vh] flex items-center overflow-hidden bg-gradient-hero pt-20">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: "32px 32px",
          }}
          aria-hidden="true"
        />
        {/* Amber glow */}
        <div
          className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full opacity-10 translate-x-1/3 translate-y-1/3"
          style={{ background: "radial-gradient(circle, #f59e0b, transparent 70%)" }}
          aria-hidden="true"
        />

        <div className="container-theme relative z-10 py-16">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-white/80 text-sm font-medium mb-6">
              <span className="w-2 h-2 rounded-full bg-accent-400 animate-pulse-slow" />
              For Nigerian Exporters
            </div>
            <h1 className="font-display font-bold text-white mb-5">
              Turn your commodities into{" "}
              <span className="text-accent-400">Euro revenue</span>
            </h1>
            <p className="text-lg text-primary-100 leading-relaxed mb-10 max-w-2xl">
              Export to Europe with full compliance support from Azuretti's Nigerian
              Export Trade House in France. We handle the complexity — you focus on
              supplying quality product.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/auth/register?role=exporter" className="btn-accent text-base px-7 py-3.5">
                Register as Exporter
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="#how-it-works"
                className="flex items-center gap-2 px-7 py-3.5 rounded font-semibold text-base text-white/80 border-2 border-white/20 hover:border-white/50 hover:text-white transition-all duration-200"
              >
                See how it works
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 inset-x-0 h-20 bg-gradient-to-t from-white" aria-hidden="true" />
      </section>

      {/* ── What We Bring ──────────────────────────────────────────────── */}
      <section className="section-padding bg-white">
        <div className="container-theme">
          <div className="max-w-xl mb-14">
            <span className="section-label mb-4">What We Bring to Nigerian Exporters</span>
            <h2 className="font-display font-bold text-neutral-900">
              Everything you need to export successfully to the EU
            </h2>
            <p className="text-neutral-600 mt-3 leading-relaxed">
              Azuretti removes the barriers that stop Nigerian exporters from
              accessing European markets — regulatory, logistical and financial.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {benefits.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="group p-6 rounded-xl border border-border bg-white hover:shadow-green hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className="w-11 h-11 rounded-lg bg-primary-50 flex items-center justify-center mb-4 group-hover:bg-primary-100 transition-colors duration-200">
                  <Icon className="h-5 w-5 text-primary-600" />
                </div>
                <h3 className="font-display font-semibold text-lg text-neutral-900 mb-2">{title}</h3>
                <p className="text-sm text-neutral-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Who Can Partner ────────────────────────────────────────────── */}
      <section id="farmers" className="section-padding bg-neutral-50">
        <div className="container-theme">
          <div className="text-center max-w-xl mx-auto mb-14">
            <span className="section-label mb-4 justify-center">Who Can Partner With Us</span>
            <h2 className="font-display font-bold text-neutral-900">
              There's a pathway for everyone in the supply chain
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {partnerTypes.map(({ icon: Icon, role, desc, cta, href }) => (
              <div
                key={role}
                className="flex flex-col p-8 rounded-2xl bg-white border border-border hover:shadow-lg transition-all duration-200"
              >
                <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center mb-5">
                  <Icon className="h-6 w-6 text-primary-600" />
                </div>
                <h3 className="font-display font-bold text-xl text-neutral-900 mb-3">{role}</h3>
                <p className="text-sm text-neutral-500 leading-relaxed flex-1 mb-6">{desc}</p>
                <Link
                  href={href}
                  className="btn-primary text-sm justify-center"
                >
                  {cta}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ───────────────────────────────────────────────── */}
      <section id="how-it-works" className="section-padding bg-white">
        <div className="container-theme">
          <div className="max-w-xl mb-14">
            <span className="section-label mb-4">How It Works</span>
            <h2 className="font-display font-bold text-neutral-900">
              From registration to your first EU shipment
            </h2>
            <p className="text-neutral-600 mt-3 leading-relaxed">
              Our team guides you through every step until your first
              EU-compliant shipment leaves Nigeria.
            </p>
          </div>

          <div className="relative">
            {/* Connector line (desktop) */}
            <div
              className="hidden lg:block absolute top-9 left-9 right-9 h-0.5 bg-primary-100"
              aria-hidden="true"
            />

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
              {steps.map(({ number, title, desc }) => (
                <div key={number} className="relative flex flex-col gap-4">
                  {/* Step number bubble */}
                  <div className="w-[4.5rem] h-[4.5rem] rounded-full bg-primary-600 flex items-center justify-center shrink-0 shadow-green z-10">
                    <span className="font-display font-bold text-white text-lg">{number}</span>
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-base text-neutral-900 mb-1.5">
                      {title}
                    </h3>
                    <p className="text-sm text-neutral-500 leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Commodities We Handle ──────────────────────────────────────── */}
      <section className="section-padding bg-primary-950 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: "28px 28px",
          }}
          aria-hidden="true"
        />
        <div className="container-theme relative z-10">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <span className="section-label mb-5 text-accent-400">
                <span className="block w-6 h-0.5 bg-accent-400" />
                Commodities We Handle
              </span>
              <h2 className="font-display font-bold text-white mb-4">
                We work with Nigeria's most valuable export commodities
              </h2>
              <p className="text-primary-200 leading-relaxed mb-8">
                If you produce any of the commodities below — or something not on
                this list — contact us. Our sourcing team works with 200+ Nigerian
                farms and suppliers and can help you assess export readiness.
              </p>
              <div className="flex gap-3">
                <Link href="/commodities" className="btn-accent text-sm px-5 py-2.5">
                  View all commodities
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/contact" className="btn-outline text-sm px-5 py-2.5 border-white/30 text-white hover:bg-white/10 hover:text-white">
                  Ask about yours
                </Link>
              </div>
            </div>

            {/* Commodity chips */}
            <div className="flex flex-wrap gap-2.5">
              {commoditiesHandled.map((c) => (
                <span
                  key={c}
                  className="px-4 py-2 rounded-full bg-white/10 border border-white/15 text-sm text-primary-100 font-medium"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Compliance assurance ───────────────────────────────────────── */}
      <section className="section-padding bg-white">
        <div className="container-theme">
          <div className="rounded-2xl bg-primary-50 border border-primary-100 p-8 lg:p-12">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-center">
              <div>
                <span className="section-label mb-5">Compliance Assurance</span>
                <h2 className="font-display font-bold text-2xl text-neutral-900 mb-4">
                  We manage the compliance burden — so you don't have to
                </h2>
                <p className="text-neutral-600 leading-relaxed">
                  EU food safety requirements are strict and constantly evolving.
                  Azuretti's compliance team keeps your products on the right side
                  of every regulation — from pesticide residue limits to labelling
                  and packaging rules.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {[
                  "Certificates of Analysis from accredited labs",
                  "Phytosanitary certificates arranged on your behalf",
                  "EU-compliant packaging and labelling review",
                  "Certificates of Origin and commercial invoices",
                  "Commodity-specific EU regulatory declarations",
                  "Ongoing monitoring of EU regulatory changes",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary-600 shrink-0" />
                    <span className="text-sm text-neutral-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Final CTA ──────────────────────────────────────────────────── */}
      <section className="section-padding bg-accent-500">
        <div className="container-theme text-center">
          <h2 className="font-display font-bold text-3xl text-neutral-900 mb-4">
            Ready to export to Europe?
          </h2>
          <p className="text-neutral-800 max-w-xl mx-auto mb-8 leading-relaxed">
            Create your exporter profile, submit your products, and our team will
            guide you step-by-step until your first EU-compliant shipment leaves Nigeria.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/auth/register?role=exporter" className="flex items-center gap-2 px-8 py-4 rounded bg-neutral-900 text-white font-semibold text-base hover:bg-neutral-800 transition-colors duration-150 shadow-lg">
              Register as Exporter
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/contact" className="flex items-center gap-2 px-8 py-4 rounded bg-white text-neutral-900 font-semibold text-base hover:bg-neutral-50 transition-colors duration-150">
              Talk to our team
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
