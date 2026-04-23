import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
  FlaskConical,
  FileCheck,
  Leaf,
  ClipboardList,
  AlertCircle,
  CheckCircle2,
  Download,
  Scale,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Compliance & Certification – Azuretti",
  description:
    "How Azuretti ensures every product passing through the Nigerian Export Trade House meets EU food safety, labelling and packaging regulations.",
};

const certDocuments = [
  { icon: FileCheck,    name: "Certificate of Analysis",          desc: "Lab test results for pesticide residue, mycotoxin, moisture and nutritional content." },
  { icon: FileCheck,    name: "Certificate of Origin",            desc: "Official documentation confirming the Nigerian origin of the commodity." },
  { icon: Leaf,         name: "Phytosanitary Certificate",        desc: "Issued by Nigerian plant health authorities confirming the product is free of pests." },
  { icon: ClipboardList,name: "Packing List & Commercial Invoice", desc: "Full packing specification and commercial documentation for customs clearance." },
  { icon: FileCheck,    name: "EU-Required Commodity Declarations",desc: "Product-specific declarations required under EU food import regulations." },
  { icon: AlertCircle,  name: "NAFDAC & NEPC Documentation",      desc: "Nigerian regulatory approvals and export promotion council documentation where required." },
];

const testingPartners = [
  {
    name: "Bureau Veritas",
    abbr: "BV",
    desc: "Global leader in testing, inspection and certification. Azuretti uses Bureau Veritas for independent quality verification of all commodity shipments.",
    accreditation: "ISO/IEC 17025 accredited",
  },
  {
    name: "SGS",
    abbr: "SGS",
    desc: "World's leading inspection, verification, testing and certification company. SGS conducts commodity analysis under internationally recognised standards.",
    accreditation: "ISO/IEC 17025 accredited",
  },
];

const euRegulations = [
  {
    regulation: "EU Regulation 178/2002",
    topic: "General Food Law",
    summary: "Establishes the general principles and requirements of food law, including full traceability across the supply chain.",
  },
  {
    regulation: "EU Regulation 852/2004",
    topic: "Food Hygiene",
    summary: "Lays down general rules for food business operators on the hygiene of foodstuffs.",
  },
  {
    regulation: "EU Regulation 396/2005",
    topic: "Maximum Residue Levels",
    summary: "Sets maximum residue levels (MRLs) for pesticides in or on food and feed. All products are tested against current EU MRL thresholds.",
  },
  {
    regulation: "EU Regulation 1169/2011",
    topic: "Food Information to Consumers",
    summary: "Governs food labelling requirements. All products leaving the Trade House are labelled in compliance with this regulation.",
  },
  {
    regulation: "Commission Regulation 401/2006",
    topic: "Mycotoxin Sampling Methods",
    summary: "Prescribes sampling and analysis methods for mycotoxins in foodstuffs — particularly relevant for grains, nuts and spices.",
  },
];

const processStages = [
  {
    stage: "Pre-shipment (Nigeria)",
    icon: FlaskConical,
    items: [
      "Product sampling at Nigerian warehouse or farm gate",
      "Lab analysis by accredited third-party laboratory",
      "Verification against EU MRL and food safety standards",
      "Documentation pack preparation",
      "NEPC and NAFDAC clearances obtained",
    ],
  },
  {
    stage: "In Transit",
    icon: ShieldCheck,
    items: [
      "Temperature and humidity monitoring for perishable goods",
      "Container sealing and seal number documentation",
      "Bill of lading and freight documentation management",
      "Customs export declaration (Nigerian side)",
    ],
  },
  {
    stage: "Arrival in France",
    icon: CheckCircle2,
    items: [
      "EU customs import declaration",
      "Physical inspection and weight verification",
      "Random re-testing at French warehouse if required",
      "Documentation upload to buyer dashboard",
      "Inventory update and buyer notification",
    ],
  },
];

export default function CompliancePage() {
  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative pt-40 pb-20 bg-gradient-hero overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: "32px 32px",
          }}
          aria-hidden="true"
        />
        <div
          className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full opacity-10 -translate-x-1/3 -translate-y-1/3"
          style={{ background: "radial-gradient(circle, #4fba81, transparent 70%)" }}
          aria-hidden="true"
        />
        <div className="container-theme relative z-10">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-white/80 text-sm font-medium mb-6">
              <ShieldCheck className="h-3.5 w-3.5 text-accent-400" />
              Compliance & Certification
            </div>
            <h1 className="font-display font-bold text-white mb-5">
              Every shipment is traceable,<br />verified and documented
            </h1>
            <p className="text-lg text-primary-200 leading-relaxed">
              Azuretti ensures that every product passing through the Nigerian Export
              Trade House is aligned with European Union regulations on food safety,
              labelling and packaging — without exception.
            </p>
          </div>
        </div>
      </section>

      {/* ── Compliance Approach ────────────────────────────────────────── */}
      <section className="section-padding bg-white">
        <div className="container-theme">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-start">
            <div>
              <span className="section-label mb-5">Our Compliance Approach</span>
              <h2 className="font-display font-bold text-neutral-900 mb-5">
                Built on transparency and independent verification
              </h2>
              <p className="text-neutral-600 leading-relaxed mb-4">
                Azuretti does not self-certify. All analyses and inspections are
                carried out by certified third-party partners — principally Bureau
                Veritas and SGS — under internationally recognised ISO standards.
              </p>
              <p className="text-neutral-600 leading-relaxed mb-8">
                This independent verification model means both exporters and buyers
                can rely on the accuracy of quality data, reducing risk on both sides
                of the transaction.
              </p>

              <div className="space-y-3">
                {[
                  "Independent lab testing — never self-certified",
                  "ISO/IEC 17025 accredited laboratory partners",
                  "Regular quality audits at both Nigerian and French warehouses",
                  "All documentation available for buyer download",
                  "Continuous monitoring of EU regulatory updates",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary-600 shrink-0" />
                    <span className="text-sm text-neutral-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Testing partners */}
            <div className="space-y-5">
              <h3 className="font-display font-semibold text-lg text-neutral-900">
                Our testing & inspection partners
              </h3>
              {testingPartners.map(({ name, abbr, desc, accreditation }) => (
                <div key={name} className="p-6 rounded-xl border border-border bg-neutral-50">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-lg bg-white border border-border flex items-center justify-center shrink-0">
                      <span className="font-display font-bold text-sm text-neutral-600">{abbr}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-neutral-900">{name}</p>
                      <p className="text-xs text-primary-600 font-medium">{accreditation}</p>
                    </div>
                  </div>
                  <p className="text-sm text-neutral-600 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Compliance Process ─────────────────────────────────────────── */}
      <section className="section-padding bg-neutral-50">
        <div className="container-theme">
          <div className="text-center max-w-xl mx-auto mb-14">
            <span className="section-label mb-4 justify-center">Quality Control Process</span>
            <h2 className="font-display font-bold text-neutral-900">
              Compliance checks at every stage of the journey
            </h2>
            <p className="text-neutral-600 mt-3 leading-relaxed">
              From the Nigerian farm gate to the European buyer's door, every
              stage of the supply chain is monitored and documented.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {processStages.map(({ stage, icon: Icon, items }) => (
              <div key={stage} className="p-7 rounded-xl bg-white border border-border">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center">
                    <Icon className="h-5 w-5 text-primary-600" />
                  </div>
                  <h3 className="font-display font-semibold text-base text-neutral-900">{stage}</h3>
                </div>
                <ul className="space-y-2.5">
                  {items.map((item) => (
                    <li key={item} className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent-500 mt-1.5 shrink-0" />
                      <span className="text-sm text-neutral-600 leading-snug">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Documents Provided ─────────────────────────────────────────── */}
      <section className="section-padding bg-white">
        <div className="container-theme">
          <div className="max-w-xl mb-12">
            <span className="section-label mb-4">Documentation Provided</span>
            <h2 className="font-display font-bold text-neutral-900">
              A complete paper trail for every shipment
            </h2>
            <p className="text-neutral-600 mt-3 leading-relaxed">
              All documentation is available for download from the buyer and exporter
              dashboards. Nothing ships without a complete document pack.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {certDocuments.map(({ icon: Icon, name, desc }) => (
              <div key={name} className="flex gap-4 p-5 rounded-xl border border-border bg-neutral-50 group">
                <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center shrink-0 group-hover:bg-primary-100 transition-colors">
                  <Icon className="h-5 w-5 text-primary-600" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm text-neutral-900 mb-1">{name}</p>
                  <p className="text-xs text-neutral-500 leading-relaxed">{desc}</p>
                </div>
                <Download className="h-4 w-4 text-neutral-300 shrink-0 self-start mt-0.5 group-hover:text-primary-500 transition-colors" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── EU Regulations ─────────────────────────────────────────────── */}
      <section className="section-padding bg-primary-950 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: "28px 28px",
          }}
          aria-hidden="true"
        />
        <div className="container-theme relative z-10">
          <div className="max-w-xl mb-12">
            <span className="section-label mb-5 text-accent-400">
              <span className="block w-6 h-0.5 bg-accent-400" />
              EU Regulatory Framework
            </span>
            <h2 className="font-display font-bold text-white">
              Key EU regulations we work within
            </h2>
            <p className="text-primary-200 mt-3 leading-relaxed">
              Our compliance programme is built around the core EU regulations governing
              food safety, hygiene and import. All products are verified against these frameworks.
            </p>
          </div>

          <div className="space-y-3">
            {euRegulations.map(({ regulation, topic, summary }) => (
              <div
                key={regulation}
                className="grid grid-cols-1 gap-2 p-5 rounded-xl bg-white/5 border border-white/10 sm:grid-cols-[140px_1fr]"
              >
                <div>
                  <p className="text-xs font-bold text-accent-400 mb-0.5">{regulation}</p>
                  <p className="text-xs text-primary-400 font-medium">{topic}</p>
                </div>
                <p className="text-sm text-primary-200 leading-relaxed">{summary}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Ethical & sustainable trade ────────────────────────────────── */}
      <section className="section-padding bg-white">
        <div className="container-theme">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
            <div className="p-8 lg:p-10 rounded-2xl bg-primary-50 border border-primary-100">
              <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center mb-5">
                <Leaf className="h-6 w-6 text-primary-700" />
              </div>
              <h3 className="font-display font-bold text-2xl text-neutral-900 mb-4">
                Ethical & Sustainable Trade
              </h3>
              <p className="text-neutral-600 leading-relaxed mb-4">
                Compliance is not just about regulation. Azuretti is committed to fair
                value distribution along the chain — from the Nigerian farmer who grows
                the product to the European end buyer.
              </p>
              <p className="text-neutral-600 leading-relaxed">
                We focus on building long-term, repeatable contracts rather than one-off
                spot trades. This creates stability for exporters, predictability for buyers
                and sustainable livelihoods for farming communities.
              </p>
            </div>

            <div>
              <span className="section-label mb-5">Our commitments</span>
              <h2 className="font-display font-bold text-2xl text-neutral-900 mb-6">
                Compliance that benefits the entire value chain
              </h2>
              <div className="space-y-4">
                {[
                  { icon: Scale,        text: "Fair value for farmers, exporters and buyers at every transaction" },
                  { icon: ShieldCheck,  text: "Zero tolerance for falsified documentation or uncertified products" },
                  { icon: FileCheck,    text: "Transparent pricing with no hidden fees or commissions" },
                  { icon: Leaf,         text: "Support for sustainable farming practices and environmental compliance" },
                  { icon: CheckCircle2, text: "Long-term contracts that reward quality and consistency" },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center shrink-0 mt-0.5">
                      <Icon className="h-4 w-4 text-primary-600" />
                    </div>
                    <p className="text-sm text-neutral-700 leading-relaxed pt-1.5">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Microcopy banner ───────────────────────────────────────────── */}
      <section className="py-10 bg-primary-600">
        <div className="container-theme">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-primary-100 max-w-xl leading-relaxed">
              All shipments are subject to quality checks and documentation review before
              departure from Nigeria and upon arrival in France. Azuretti acts as your single
              point of contact for export compliance between Nigeria and the EU.
            </p>
            <Link href="/contact" className="btn-accent shrink-0 text-sm px-5 py-2.5">
              Speak to our compliance team
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
