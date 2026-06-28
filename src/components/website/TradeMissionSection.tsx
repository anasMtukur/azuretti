import React from 'react';
import { 
  MapPin, 
  Calendar, 
  Clock, 
  Wallet, 
  CheckCircle2, 
  Building2, 
  FileCheck, 
  Phone, 
  ArrowRight, 
  Globe 
} from 'lucide-react';

export default function TradeMissionSection() {
  const whyParticipate = [
    "Understand European market entry requirements.",
    "Learn EU food safety, quality, and regulatory compliance standards.",
    "Gain practical knowledge of export logistics and supply chain management.",
    "Meet European importers, distributors, and commodity buyers.",
    "Build strategic business partnerships and explore new market opportunities.",
    "Strengthen international export capacity."
  ];

  const missionActivities = [
    "The Nigeria Export Trade House in France.",
    "French trade and regulatory institutions.",
    "Major ports and logistics facilities.",
    "Commodity storage and warehousing centres.",
    "Agro-processing and food manufacturing companies.",
    "European importers, distributors, and commodity buyers.",
    "Business support and trade promotion organizations."
  ];

  const requirements = [
    "Certificate of Incorporation / Business Registration",
    "Export License (where applicable)",
    "Copy of International Passport (Data Page)",
    "Recent Passport Photograph",
    "Relevant export certifications or permits (if available)"
  ];

  return (
    <section id="trade-mission" className="section-padding bg-white">
      <div className="container-theme">
        
        {/* Section Header */}
        <div className="max-w-2xl mb-12">
          <span className="section-label mb-4">Upcoming Training</span>
          <h2 className="font-display font-bold text-neutral-900 text-3xl md:text-4xl">
            Export Capacity Building & Trade Mission to France
          </h2>
          <p className="text-neutral-600 mt-3 leading-relaxed">
            Azuretti's Export Capacity Building & Trade Mission to France equips Nigerian exporters 
            with the knowledge, market access, and business connections needed to successfully 
            export to France and the European Union through practical training and firsthand experience.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">

          {/* CARD 1: Event Logistics & Image (Dark Theme) */}
          <div className="p-7 rounded-2xl bg-neutral-900 text-white flex flex-col justify-between gap-6">
            <div>
              <div className="flex items-center justify-between gap-2.5 mb-5">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">🇫🇷</span>
                  <div>
                    <p className="font-display font-bold text-lg leading-tight">France Mission</p>
                    <p className="text-xs opacity-70">October 2026 Intake</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[11px] font-medium border border-emerald-500/20">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Open
                </span>
              </div>

              {/* "Picture Add" Placeholder */}
              <div className="relative w-full h-44 rounded-xl overflow-hidden mb-6 bg-neutral-800 border border-white/10 group">
                <img 
                  src="/images/training.jpg" 
                  alt="Trade Mission to France" 
                  className="w-full h-full object-cover object-center opacity-80 group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent opacity-90"></div>
                <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
                  <span className="text-xs font-medium text-white/90">Destination: France</span>
                  <span className="text-[10px] bg-white/20 backdrop-blur-md px-2 py-0.5 rounded text-white">4 Days</span>
                </div>
              </div>

              {/* Quick Specs */}
              <div className="space-y-3 pt-1">
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 opacity-60 shrink-0 mt-0.5" />
                  <span className="text-xs opacity-80">Location: <strong className="text-white font-semibold">France</strong></span>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="h-4 w-4 opacity-60 shrink-0 mt-0.5" />
                  <span className="text-xs opacity-80">Duration: <strong className="text-white font-semibold">4 Days</strong></span>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="h-4 w-4 opacity-60 shrink-0 mt-0.5" />
                  <span className="text-xs opacity-80">Date: <strong className="text-white font-semibold">October 2026</strong></span>
                </div>
                <div className="flex items-start gap-3">
                  <Wallet className="h-4 w-4 opacity-60 shrink-0 mt-0.5" />
                  <span className="text-xs opacity-80 leading-relaxed">
                    Participation: <strong className="text-white font-semibold">Self-sponsored</strong> (travel, visa, accommodation & expenses)
                  </span>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="pt-4 border-t border-white/10">
              <a 
                href="https://wa.me/2349036626516" 
                target="_blank" 
                rel="noreferrer"
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary-600 text-white text-sm font-semibold hover:bg-primary-500 transition-colors duration-150 shadow-sm"
              >
                Apply via WhatsApp
                <ArrowRight className="h-4 w-4" />
              </a>
              <p className="text-[11px] text-center opacity-50 mt-2.5">+234 903 662 6516</p>
            </div>
          </div>

          {/* CARD 2: Why Participate? (Light / Outline Theme) */}
          <div className="p-7 rounded-2xl bg-neutral-50 border border-neutral-200/80 text-neutral-900 flex flex-col gap-6">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-primary-600/10 text-primary-600">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg leading-tight">Why Participate?</h3>
                <p className="text-xs text-neutral-500">Key takeaways & strategic value</p>
              </div>
            </div>

            <ul className="space-y-3.5 flex-1">
              {whyParticipate.map((point, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-neutral-700 leading-relaxed">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary-600 shrink-0 mt-1.5"></span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>

            <div className="p-3.5 rounded-xl bg-white border border-neutral-200/60 text-[11px] text-neutral-600 leading-normal">
              💡 Gain direct access to European institutions and businesses.
            </div>
          </div>

          {/* CARD 3: Trade Mission Activities (Primary Theme) */}
          <div className="p-7 rounded-2xl bg-primary-600 text-white flex flex-col gap-6">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-white/10 text-white">
                <Globe className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg leading-tight">Mission Activities</h3>
                <p className="text-xs opacity-75">Scheduled site visits & itinerary</p>
              </div>
            </div>

            <p className="text-xs opacity-85 font-medium -mb-1">Participants will visit:</p>

            <ul className="space-y-3 flex-1">
              {missionActivities.map((activity, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs opacity-90 leading-relaxed">
                  <Building2 className="h-3.5 w-3.5 opacity-70 shrink-0 mt-0.5" />
                  <span>{activity}</span>
                </li>
              ))}
            </ul>

            <div className="pt-4 border-t border-white/15 flex items-center justify-between text-xs opacity-80">
              <span>Immersion format</span>
              <span className="font-mono bg-black/20 px-2 py-0.5 rounded text-[11px]">Field-based</span>
            </div>
          </div>

          {/* CARD 4: Application Requirements (Spans full bottom width) */}
          <div className="p-7 rounded-2xl bg-white border border-neutral-200/80 lg:col-span-3 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="space-y-3 md:max-w-xl">
              <div className="flex items-center gap-2 text-neutral-900 font-display font-bold text-base">
                <FileCheck className="h-5 w-5 text-primary-600" />
                Application Requirements
              </div>
              <p className="text-xs text-neutral-500">
                Applicants are required to prepare and submit the following documentation:
              </p>
              
              <div className="flex flex-wrap gap-2 pt-1">
                {requirements.map((req, i) => (
                  <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-100 text-neutral-700 text-xs font-medium border border-neutral-200/60">
                    <span className="h-1 w-1 rounded-full bg-neutral-400"></span>
                    {req}
                  </span>
                ))}
              </div>
            </div>

            {/* Final Contact Callout */}
            <div className="flex flex-col sm:flex-row md:flex-col justify-center gap-3 shrink-0 md:border-l md:border-neutral-100 md:pl-8">
              <div className="text-left md:text-right">
                <p className="text-xs font-semibold text-neutral-900">Enquiries & Registration</p>
                <p className="text-xs text-neutral-500">Applications are currently open</p>
              </div>
              <a 
                href="tel:+2349036626516" 
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-neutral-900 text-white text-xs font-semibold hover:bg-neutral-800 transition-colors"
              >
                <Phone className="h-3.5 w-3.5 text-emerald-400" />
                Call +234 903 662 6516
              </a>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}