import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Target, Eye, Heart, Warehouse } from "lucide-react";
import { theme } from "@/config/theme";
import { HeroSubSection } from "@/components/website/sections/HeroSubSection";
import { PremiumShadowBox } from "@/components/website/PremiumShadowBox";
import { InfrastructureSectionImage } from "@/components/website/sections/InfrastructureSectionImage";

export const metadata: Metadata = {
  title: "About Azuretti",
  description:
    "Learn about Azuretti Service & Distribution — the Nigerian Export Trade House in France bridging West Africa and Europe.",
};

const values = [
  {
    icon:   Heart,
    title:  "Integrity",
    desc:   "Every shipment is traceable, verified and properly documented. No shortcuts.",
  },
  {
    icon:   Target,
    title:  "Reliability",
    desc:   "Consistent quality, on-time delivery and long-term supply programs our partners can count on.",
  },
  {
    icon:   Eye,
    title:  "Partnership",
    desc:   "A collaborative approach with farmers, exporters, buyers and institutions for shared, sustainable growth.",
  },
];

const partnerships = [
  {
    type:  "Exporter Partnership",
    desc:  "Onboarding, technical support and long-term supply contracts via the Trade House.",
    cta:   "Sign Up",
    href:  "/auth/register?role=exporter",
    style: "bg-primary-100 border border-primary-400 text-slate-50",
    ctaStyle: "bg-white text-primary-700 hover:bg-primary-50",
  },
  /* {
    type:  "Investor Partnership",
    desc:  "Commodity-backed export projects, typically starting from the value of a 20 ft container, in collaboration with licensed asset management companies.",
    cta:   "Sign Up",
    href:  "/auth/register?role=investor",
    style: "bg-accent-50 border border-accent-200",
    ctaStyle: "bg-accent-500 text-neutral-900 hover:bg-accent-600",
  }, */
  {
    type:  "Farmer / Supplier",
    desc:  "We handle the export process, ensuring seamless access to Europe.",
    cta:   "Sign Up",
    href:  "/auth/register?role=farmer",
    style: "bg-primary-50 border border-primary-200",
    ctaStyle: "bg-primary-600 text-white hover:bg-primary-700",
  },
  {
    type:  "Institutional Partnership",
    desc:  "Collaboration with stakeholders to secure the export value chain.",
    cta:   "Get in Touch",
    href:  "/contact",
    style: "bg-neutral-50 border border-border",
    ctaStyle: "bg-neutral-900 text-white hover:bg-neutral-800",
  },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <HeroSubSection
        type="about"
        tagText="About Azuretti"
        title={<>Bridging Nigeria and Europe through <span className="text-accent-400">compliant trade</span></>}
        description=""
      />

      {/* Who We Are */}
      <section className="section-padding bg-white">
        <div className="container-theme">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <span className="section-label mb-5">Who We Are</span>
              <h2 className="font-display font-bold text-neutral-900 mb-5">
                A trusted hub between Nigeria and Europe
              </h2>
              <p className="text-neutral-600 font-semibold leading-relaxed mb-4">
                Azuretti Services and Distribution (ASD) is a France- and Nigeria-registered agribusiness and 
                international trade company specializing in the sourcing, export, import, and distribution of agricultural 
                commodities between Nigeria and Europe.
              </p>
              <p className="text-neutral-600 leading-relaxed mb-4">
                With over 7 years of experience, we work closely with government and regulatory institutions in Nigeria and 
                France to promote structured, compliant, and sustainable agricultural trade. We operate the Nigeria Export 
                Trade House in France, facilitate market access for Nigerian exporters, connect them with European buyers through 
                our digital trading platform, simplify cross-border trade, expand access to international markets, and distribute 
                premium African products across Europe under our DJeni® brand.                
              </p>
              
              {/* <div className="flex gap-3">
                <Link href="/contact" className="btn-primary text-sm px-5 py-2.5">
                  Get in touch
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/commodities" className="btn-outline text-sm px-5 py-2.5">
                  View commodities
                </Link>
              </div> */}
            </div>
            
            <div>
              <PremiumShadowBox src="/images/slide-6.jpg" alt="About Azuretti Services" aspectRatio="video" showGlow={false} />
            </div>
          </div>

          {/* Stats column */}
          <div className="grid grid-cols-4 gap-4 mt-8">
            {[
              { value: "15+",      label: "Years of agricultural export experience" },
              { value: "150+ MT",  label: "Metric tonnes shipped to Europe" },
              { value: "99%",      label: "Quality acceptance rate by EU labs" },
              { value: "7,500 MT", label: "Combined Nigeria + France warehouse capacity" },
            ].map(({ value, label }) => (
              <div key={label} className="p-5 rounded-xl bg-primary-50 border border-primary-100">
                <p className="font-display font-bold text-3xl text-primary-700 mb-1">{value}</p>
                <p className="text-xs text-primary-600 leading-snug">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="section-padding bg-neutral-50">
        <div className="container-theme">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {/* Vision */}
            <div className="p-8 rounded-2xl bg-primary-600 text-white">
              <div className="w-10 h-10 rounded-lg bg-white/15 flex items-center justify-center mb-5">
                <Eye className="h-5 w-5 text-white" />
              </div>
              <h3 className="font-display font-bold text-2xl mb-3">Our Vision</h3>
              <p className="text-primary-100 leading-relaxed">
                To become the leading compliant gateway for African agricultural
                commodities into Europe, creating sustainable value for farmers,
                exporters, investors and buyers.
              </p>
            </div>

            {/* Mission */}
            <div className="p-8 rounded-2xl bg-neutral-900 text-white">
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center mb-5">
                <Target className="h-5 w-5 text-accent-400" />
              </div>
              <h3 className="font-display font-bold text-2xl mb-3">Our Mission</h3>
              <ul className="space-y-3">
                {[
                  "Support Nigerian exporters to meet and maintain EU standards.",
                  "Provide European buyers with reliable, traceable and competitively priced commodities.",
                  "Build long-term partnerships with regulators, financial institutions and logistics providers.",
                ].map((m) => (
                  <li key={m} className="flex items-start gap-2.5 text-sm text-neutral-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent-400 mt-1.5 shrink-0" />
                    {m}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="section-padding bg-white">
        <div className="container-theme">
          <div className="text-center max-w-full mx-auto mb-12">
            <span className="section-label mb-4 justify-center">Core Values</span>
            <h2 className="font-display font-bold text-neutral-900">
              What drives everything we do
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {values.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="text-center px-8 pt-4 pb-2 rounded-xl border border-border hover:border-primary-200 hover:shadow-green transition-all duration-200">
                <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center mx-auto mb-4">
                  <Icon className="h-6 w-6 text-primary-600" />
                </div>
                <h3 className="font-display font-bold text-xl text-neutral-900 mb-2">{title}</h3>
                <p className="text-sm text-neutral-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <InfrastructureSectionImage />

      {/* Partnership Models */}
      <section id="partnership" className="section-padding bg-white">
        <div className="container-theme">
          <div className="text-center max-w-full mx-auto mb-12">
            <span className="section-label mb-4 justify-center">Partnership Models</span>
            <h2 className="font-display font-bold text-neutral-900">
              Find your pathway with ETH
            </h2>
            <p className="text-neutral-600 mt-3 text-sm leading-relaxed">
              We offer four distinct partnership models, each designed for a specific role in
              the export value chain.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-4">
            {partnerships.map(({ type, desc, cta, href, style, ctaStyle }) => (
              <div key={type} className={`rounded-xl p-7 ${style}`}>
                <h3 className="font-display font-bold text-xl text-neutral-900 mb-3">{type}</h3>
                <p className="text-sm text-neutral-600 leading-relaxed mb-6">{desc}</p>
                <Link
                  href={href}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded font-semibold text-sm transition-all duration-150 ${ctaStyle}`}
                >
                  {cta}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
