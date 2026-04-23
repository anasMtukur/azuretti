import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Monitor,
  MapPin,
  Calendar,
  Clock,
  Award,
  Users,
  BookOpen,
  CheckCircle2,
  Banknote,
} from "lucide-react";
import { TrainingRegistrationForm } from "@/components/website/TrainingRegistrationForm";

export const metadata: Metadata = {
  title: "Training & Capacity Building – Azuretti",
  description:
    "Azuretti provides virtual and physical training for exporters, farmers and partners on EU export regulations, documentation and compliance best practices.",
};

const curriculum = [
  {
    module: "01",
    title: "EU Export Regulations Overview",
    topics: [
      "Key EU food safety directives and regulations",
      "Maximum Residue Levels (MRLs) and testing",
      "Prohibited substances and banned pesticides",
      "EU import notification and border inspection requirements",
    ],
  },
  {
    module: "02",
    title: "Product Handling & Storage",
    topics: [
      "Post-harvest handling best practices for EU export",
      "Moisture control and mycotoxin prevention",
      "Temperature and humidity management in storage",
      "Grading, sorting and quality standardisation",
    ],
  },
  {
    module: "03",
    title: "Documentation & Compliance",
    topics: [
      "Certificate of Origin — how to obtain and verify",
      "Phytosanitary certification process",
      "Commercial invoice and packing list preparation",
      "Lab test coordination with accredited laboratories",
    ],
  },
  {
    module: "04",
    title: "Practical Export Process",
    topics: [
      "Working with the Azuretti Trade House programme",
      "Supply offer submission and buyer matching",
      "Shipping, freight and Incoterms explained",
      "Euro invoicing and payment processes",
    ],
  },
];

const benefits = [
  "Up-to-date content on EU regulations and documentation requirements",
  "Practical case studies drawn from real Azuretti export projects",
  "Direct access to Azuretti's compliance and trade experts",
  "Certificate of Attendance issued on completion",
  "Post-training support and access to Azuretti's exporter network",
  "Physical sessions include facility visits to an Azuretti warehouse",
];

const upcomingSessions = [
  {
    type:     "physical",
    location: "Kano",
    venue:    "Iro mai Taya, Ibrahim Taiwo Road, Kano State",
    month:    "July 2026",
    price:    "₦150,000",
    spots:    "Limited — 30 seats",
    flag:     "🇳🇬",
  },
  {
    type:     "physical",
    location: "Abuja",
    venue:    "No. 08 UN Street, off Danube, Maitama, Abuja",
    month:    "September 2026",
    price:    "₦150,000",
    spots:    "Limited — 30 seats",
    flag:     "🇳🇬",
  },
  {
    type:     "virtual",
    location: "Online (Zoom)",
    venue:    "Link sent upon registration",
    month:    "Rolling intake",
    price:    "₦50,000",
    spots:    "Open enrolment",
    flag:     "🌐",
  },
];

export default function TrainingPage() {
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
          className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full opacity-10 translate-x-1/4 translate-y-1/3"
          style={{ background: "radial-gradient(circle, #f59e0b, transparent 70%)" }}
          aria-hidden="true"
        />

        <div className="container-theme relative z-10">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-white/80 text-sm font-medium mb-6">
              <BookOpen className="h-3.5 w-3.5 text-accent-400" />
              Training & Capacity Building
            </div>
            <h1 className="font-display font-bold text-white mb-5">
              Export to Europe with knowledge and confidence
            </h1>
            <p className="text-lg text-primary-200 leading-relaxed mb-10">
              Azuretti provides virtual and in-person training for Nigerian exporters,
              farmers and trade partners — covering EU regulations, documentation and
              the practical realities of commodity export.
            </p>
            <div className="flex flex-wrap gap-3">
              <a href="#sessions" className="btn-accent text-base px-7 py-3.5">
                View upcoming sessions
                <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="#register"
                className="flex items-center gap-2 px-7 py-3.5 rounded font-semibold text-base text-white/80 border-2 border-white/20 hover:border-white/50 hover:text-white transition-all duration-200"
              >
                Register interest
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Programme overview ─────────────────────────────────────────── */}
      <section className="section-padding bg-white">
        <div className="container-theme">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-start">
            {/* Left */}
            <div>
              <span className="section-label mb-5">Training Offer</span>
              <h2 className="font-display font-bold text-neutral-900 mb-5">
                Practical export training from practitioners
              </h2>
              <p className="text-neutral-600 leading-relaxed mb-4">
                Our training programme is designed and delivered by Azuretti's own
                trade and compliance team — the same people who manage live EU export
                shipments every day. This isn't theory. It's practical knowledge that
                directly applies to the challenges you face as an exporter.
              </p>
              <p className="text-neutral-600 leading-relaxed mb-8">
                Participants receive a Certificate of Attendance on completion and gain
                access to Azuretti's exporter network.
              </p>

              {/* Format cards */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="p-5 rounded-xl border border-border bg-neutral-50">
                  <div className="flex items-center gap-2.5 mb-3">
                    <Monitor className="h-5 w-5 text-primary-600" />
                    <p className="font-semibold text-neutral-900">Virtual Class</p>
                  </div>
                  <p className="text-2xl font-display font-bold text-primary-600 mb-1">₦50,000</p>
                  <p className="text-xs text-neutral-500 mb-3">Per participant</p>
                  <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                    <Clock className="h-3.5 w-3.5" />
                    2 weeks · Online (Zoom)
                  </div>
                </div>
                <div className="p-5 rounded-xl border-2 border-primary-600 bg-primary-50">
                  <div className="flex items-center gap-2.5 mb-3">
                    <Users className="h-5 w-5 text-primary-600" />
                    <p className="font-semibold text-neutral-900">Physical Class</p>
                  </div>
                  <p className="text-2xl font-display font-bold text-primary-600 mb-1">₦150,000</p>
                  <p className="text-xs text-neutral-500 mb-3">Per participant</p>
                  <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                    <Clock className="h-3.5 w-3.5" />
                    2 weeks · Kano or Abuja
                  </div>
                </div>
              </div>
            </div>

            {/* Right — why train with us */}
            <div>
              <h3 className="font-display font-semibold text-xl text-neutral-900 mb-6">
                Why train with Azuretti?
              </h3>
              <div className="space-y-3 mb-8">
                {benefits.map((b) => (
                  <div key={b} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary-600 shrink-0 mt-0.5" />
                    <span className="text-sm text-neutral-700 leading-relaxed">{b}</span>
                  </div>
                ))}
              </div>

              {/* Certificate badge */}
              <div className="flex items-center gap-4 p-5 rounded-xl bg-accent-50 border border-accent-200">
                <div className="w-12 h-12 rounded-xl bg-accent-100 flex items-center justify-center shrink-0">
                  <Award className="h-6 w-6 text-accent-700" />
                </div>
                <div>
                  <p className="font-semibold text-neutral-900 text-sm">Certificate of Attendance</p>
                  <p className="text-xs text-neutral-600 mt-0.5">
                    Issued to all participants who complete the full programme. 
                    Recognised in the Azuretti exporter onboarding process.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Curriculum ────────────────────────────────────────────────── */}
      <section className="section-padding bg-neutral-50">
        <div className="container-theme">
          <div className="text-center max-w-xl mx-auto mb-14">
            <span className="section-label mb-4 justify-center">Programme Curriculum</span>
            <h2 className="font-display font-bold text-neutral-900">
              4 modules covering the full export journey
            </h2>
            <p className="text-neutral-600 mt-3 leading-relaxed">
              Each module combines regulatory knowledge with real-world case
              studies from Azuretti's own export operations.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {curriculum.map(({ module, title, topics }) => (
              <div key={module} className="p-7 rounded-xl bg-white border border-border">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center shrink-0">
                    <span className="font-display font-bold text-white text-sm">{module}</span>
                  </div>
                  <h3 className="font-display font-semibold text-lg text-neutral-900">{title}</h3>
                </div>
                <ul className="space-y-2.5">
                  {topics.map((topic) => (
                    <li key={topic} className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent-500 mt-1.5 shrink-0" />
                      <span className="text-sm text-neutral-600 leading-snug">{topic}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Upcoming Sessions ──────────────────────────────────────────── */}
      <section id="sessions" className="section-padding bg-white">
        <div className="container-theme">
          <div className="max-w-xl mb-12">
            <span className="section-label mb-4">Locations & Dates</span>
            <h2 className="font-display font-bold text-neutral-900">
              Upcoming training sessions
            </h2>
            <p className="text-neutral-600 mt-3 leading-relaxed">
              Physical sessions run for 2 weeks at our offices in Kano and Abuja.
              The virtual programme runs on a rolling intake — register and begin when you're ready.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {upcomingSessions.map(({ type, location, venue, month, price, spots, flag }) => (
              <div
                key={`${type}-${location}`}
                className={`p-7 rounded-2xl flex flex-col gap-5 ${
                  type === "physical"
                    ? "bg-primary-600 text-white"
                    : "bg-neutral-900 text-white"
                }`}
              >
                {/* Header */}
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">{flag}</span>
                  <div>
                    <p className="font-display font-bold text-lg leading-tight">{location}</p>
                    <p className="text-xs opacity-70 capitalize">{type} class</p>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-2.5 flex-1">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 opacity-60 shrink-0 mt-0.5" />
                    <span className="text-xs opacity-80 leading-snug">{venue}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 opacity-60 shrink-0" />
                    <span className="text-xs opacity-80">{month}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 opacity-60 shrink-0" />
                    <span className="text-xs opacity-80">{spots}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Banknote className="h-4 w-4 opacity-60 shrink-0" />
                    <span className="text-sm font-bold">{price}</span>
                  </div>
                </div>

                {/* CTA */}
                <a href="#register" className="flex items-center justify-center gap-2 px-4 py-2.5 rounded bg-white/15 border border-white/20 text-sm font-semibold hover:bg-white/25 transition-colors duration-150">
                  Register for this session
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Registration Form ─────────────────────────────────────────── */}
      <section id="register" className="section-padding bg-neutral-50">
        <div className="container-theme">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-start">
            <div>
              <span className="section-label mb-5">Register Your Interest</span>
              <h2 className="font-display font-bold text-neutral-900 mb-4">
                Secure your place on the next session
              </h2>
              <p className="text-neutral-600 leading-relaxed mb-6">
                Fill in the form to register your interest. Our team will confirm
                availability and send payment details for your chosen session.
              </p>
              <div className="p-5 rounded-xl bg-primary-50 border border-primary-100">
                <p className="text-sm font-semibold text-primary-900 mb-1">
                  Need group training?
                </p>
                <p className="text-xs text-primary-700 leading-relaxed">
                  We offer custom in-house training for companies sending 5 or more
                  participants. Contact us for group pricing and scheduling.
                </p>
                <Link href="/contact" className="text-xs font-semibold text-primary-600 hover:text-primary-800 transition-colors mt-2 inline-block">
                  Enquire about group training →
                </Link>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-border shadow-lg p-8">
              <TrainingRegistrationForm />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
