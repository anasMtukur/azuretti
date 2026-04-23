import Link from "next/link";
import { CheckCircle2, ArrowRight } from "lucide-react";

const items = [
  "Inspections by Bureau Veritas / SGS under ISO standards",
  "Certificates of Analysis, Origin & Phytosanitary",
  "EU-compliant packaging and labelling",
  "End-to-end traceability from farm to European shelf",
  "Regular quality checks at Nigerian and French warehouses",
  "Commodity-specific EU-required declarations",
];

export function ComplianceHighlight() {
  return (
    <section
      className="section-padding relative overflow-hidden bg-primary-950"
      aria-label="Compliance"
    >
      {/* Decorative */}
      <div
        className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full -translate-y-1/3 translate-x-1/3 opacity-10"
        style={{ background: "radial-gradient(circle, #2a9d60, transparent 70%)" }}
        aria-hidden="true"
      />

      <div className="container-theme relative z-10">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
          {/* Left */}
          <div>
            <span className="section-label mb-5 text-accent-400">
              <span className="block w-6 h-0.5 bg-accent-400" />
              Compliance & Certification
            </span>
            <h2 className="font-display font-bold text-white mb-4">
              Every shipment is traceable,<br />
              verified and documented
            </h2>
            <p className="text-primary-200 leading-relaxed mb-8">
              Azuretti ensures that every product passing through the Nigerian
              Export Trade House aligns fully with EU regulations on food safety,
              labelling and packaging. Nothing leaves without being certified.
            </p>
            <div className="flex gap-3">
              <Link href="/compliance" className="btn-accent text-sm px-5 py-2.5">
                Our Compliance Approach
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Right — checklist */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {items.map((item) => (
              <div
                key={item}
                className="flex items-start gap-3 p-4 rounded-lg bg-white/5 border border-white/10"
              >
                <CheckCircle2 className="h-5 w-5 text-accent-400 shrink-0 mt-0.5" />
                <span className="text-sm text-primary-100 leading-snug">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Microcopy banner */}
        <div className="mt-12 p-4 rounded-lg bg-white/5 border border-white/10 text-center">
          <p className="text-xs text-primary-300">
            Only vetted exporters and traceable supply chains are accepted into the Trade House program.
            Documentation and certifications are available for download for each commodity and shipment.
          </p>
        </div>
      </div>
    </section>
  );
}
