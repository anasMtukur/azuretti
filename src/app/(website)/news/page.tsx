import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Calendar,
  MapPin,
  Newspaper,
  Plane,
  Users,
  ChevronRight,
} from "lucide-react";
import { ExpressInterestForm } from "@/components/website/ExpressInterestForm";

export const metadata: Metadata = {
  title: "News & Trade Missions – Azuretti",
  description:
    "Stay up to date with Azuretti trade missions to France, warehouse visits, buyer–seller meetings and Nigerian export regulatory updates.",
};

// ── Static data — replace with DB fetch in production ─────────────────────
const featuredMission = {
  id:       "trade-mission-france-2025",
  type:     "trade_mission",
  title:    "One-Week Trade Mission to France",
  date:     "May 2025",
  location: "Villeneuve-sur-Lot, France",
  excerpt:
    "Azuretti organises a one-week trade mission to France, inviting selected Nigerian exporters to visit the Nigerian Export Trade House, meet European buyers and attend compliance workshops.",
  highlights: [
    "Guided visit to the Nigerian Export Trade House in Villeneuve-sur-Lot",
    "Face-to-face meetings with European importers and distributors",
    "Compliance and EU market access workshops",
    "Lab visit and product testing demonstration",
    "Networking dinner with French-Nigerian trade community",
  ],
  status: "upcoming" as const,
  image:  null,
};

const newsItems = [
  {
    id:       "nepc-partnership-2025",
    type:     "news",
    title:    "Azuretti deepens partnership with Nigerian Export Promotion Council",
    date:     "March 2025",
    location: "Abuja, Nigeria",
    excerpt:
      "Azuretti and the NEPC have formalised their collaboration to support more Nigerian exporters in meeting EU food safety and compliance requirements for agricultural commodities.",
    tag:      "Partnership",
  },
  {
    id:       "kano-warehouse-visit-2025",
    type:     "event",
    title:    "Kano warehouse open day — exporters invited",
    date:     "February 2025",
    location: "Kano, Nigeria",
    excerpt:
      "Azuretti hosted an open day at its Kano warehouse facility, welcoming exporters, farmers and commodity traders to see the storage, grading and documentation process firsthand.",
    tag:      "Event",
  },
  {
    id:       "eu-mrl-update-2024",
    type:     "regulatory",
    title:    "Key EU MRL update for sesame seeds — what exporters need to know",
    date:     "December 2024",
    location: "Brussels / Lagos",
    excerpt:
      "The European Commission has revised maximum residue limits for certain pesticides in sesame seeds. Azuretti outlines the impact on Nigerian exporters and the steps required.",
    tag:      "Regulation",
  },
  {
    id:       "training-kano-jan-2025",
    type:     "event",
    title:    "Export compliance training — Kano session recap",
    date:     "January 2025",
    location: "Kano, Nigeria",
    excerpt:
      "Over 25 exporters and farmers attended the first Azuretti physical training session in Kano. Participants covered EU food safety regulations, phytosanitary documentation and practical export processes.",
    tag:      "Training",
  },
  {
    id:       "hibiscus-season-2024",
    type:     "market",
    title:    "Nigerian hibiscus season 2024/25 — supply outlook and EU demand",
    date:     "November 2024",
    location: "Kano / France",
    excerpt:
      "Azuretti analyses the 2024/25 hibiscus flower harvest season in northern Nigeria, EU import trends and price expectations for the coming year.",
    tag:      "Market Update",
  },
  {
    id:       "france-buyer-meeting-2024",
    type:     "event",
    title:    "Buyer–seller meeting at the France Trade House — October 2024",
    date:     "October 2024",
    location: "Villeneuve-sur-Lot, France",
    excerpt:
      "Azuretti hosted a buyer–seller day at the France Trade House, bringing together four Nigerian exporters and eight European buyers for direct product presentations and contract discussions.",
    tag:      "Event",
  },
];

const tagColors: Record<string, string> = {
  Partnership:   "bg-blue-50 text-blue-700",
  Event:         "bg-primary-50 text-primary-700",
  Regulation:    "bg-red-50 text-red-700",
  Training:      "bg-purple-50 text-purple-700",
  "Market Update":"bg-accent-50 text-accent-700",
};

const missionBenefits = [
  { icon: Plane,    label: "Visit the Nigerian Export Trade House in France" },
  { icon: Users,    label: "Meet European buyers and distributors in person" },
  { icon: Calendar, label: "Attend compliance and EU market access workshops" },
];

export default function NewsPage() {
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
        <div className="container-theme relative z-10">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-white/80 text-sm font-medium mb-6">
              <Newspaper className="h-3.5 w-3.5 text-accent-400" />
              News & Trade Missions
            </div>
            <h1 className="font-display font-bold text-white mb-5">
              Trade missions, events &<br />market updates
            </h1>
            <p className="text-lg text-primary-200 leading-relaxed">
              Stay up to date with Azuretti's trade missions to France, warehouse visits,
              buyer–seller meetings and key regulatory updates affecting Nigerian exports to the EU.
            </p>
          </div>
        </div>
      </section>

      {/* ── Featured Trade Mission ─────────────────────────────────────── */}
      <section className="section-padding bg-white">
        <div className="container-theme">
          <div className="max-w-xl mb-10">
            <span className="section-label mb-4">Featured Event</span>
            <h2 className="font-display font-bold text-neutral-900">
              Trade Mission to France
            </h2>
          </div>

          <div className="rounded-2xl overflow-hidden border border-border bg-neutral-50 lg:grid lg:grid-cols-2">
            {/* Left — content */}
            <div className="p-8 lg:p-12 flex flex-col">
              <div className="flex flex-wrap gap-2 mb-5">
                <span className="badge bg-primary-100 text-primary-700">Trade Mission</span>
                <span className="badge bg-accent-100 text-accent-700">
                  {featuredMission.status === "upcoming" ? "Upcoming" : "Past"}
                </span>
              </div>

              <h3 className="font-display font-bold text-2xl text-neutral-900 mb-3">
                {featuredMission.title}
              </h3>

              <div className="flex flex-wrap gap-4 mb-5">
                <div className="flex items-center gap-1.5 text-sm text-neutral-500">
                  <Calendar className="h-4 w-4 text-primary-500" />
                  {featuredMission.date}
                </div>
                <div className="flex items-center gap-1.5 text-sm text-neutral-500">
                  <MapPin className="h-4 w-4 text-primary-500" />
                  {featuredMission.location}
                </div>
              </div>

              <p className="text-neutral-600 leading-relaxed mb-6 flex-1">
                {featuredMission.excerpt}
              </p>

              {/* Highlights */}
              <ul className="space-y-2 mb-8">
                {featuredMission.highlights.map((h) => (
                  <li key={h} className="flex items-start gap-2.5">
                    <ChevronRight className="h-4 w-4 text-accent-500 shrink-0 mt-0.5" />
                    <span className="text-sm text-neutral-700">{h}</span>
                  </li>
                ))}
              </ul>

              <a href="#express-interest" className="btn-primary text-sm self-start">
                Express Interest
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>

            {/* Right — benefits panel */}
            <div className="bg-primary-600 p-8 lg:p-12 flex flex-col justify-center gap-6">
              <h4 className="font-display font-semibold text-xl text-white">
                What you'll gain from the mission
              </h4>
              {missionBenefits.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <p className="text-sm text-primary-100 leading-snug">{label}</p>
                </div>
              ))}
              <div className="mt-4 pt-6 border-t border-primary-500">
                <p className="text-xs text-primary-200 leading-relaxed">
                  Space is limited. Selected exporters are invited based on export readiness,
                  compliance history and commodity portfolio relevance.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── News Grid ──────────────────────────────────────────────────── */}
      <section className="section-padding bg-neutral-50">
        <div className="container-theme">
          <div className="max-w-xl mb-12">
            <span className="section-label mb-4">Latest News & Events</span>
            <h2 className="font-display font-bold text-neutral-900">
              Events, updates and market insights
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {newsItems.map(({ id, title, date, location, excerpt, tag }) => (
              <article
                key={id}
                className="flex flex-col p-6 rounded-xl bg-white border border-border hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group"
              >
                {/* Tag */}
                <div className="flex items-center justify-between mb-4">
                  <span className={`badge ${tagColors[tag] ?? "bg-neutral-100 text-neutral-600"}`}>
                    {tag}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-neutral-400">
                    <Calendar className="h-3 w-3" />
                    {date}
                  </div>
                </div>

                {/* Title */}
                <h3 className="font-display font-semibold text-lg text-neutral-900 mb-2 group-hover:text-primary-700 transition-colors leading-snug">
                  {title}
                </h3>

                {/* Location */}
                <div className="flex items-center gap-1.5 text-xs text-neutral-400 mb-3">
                  <MapPin className="h-3 w-3" />
                  {location}
                </div>

                {/* Excerpt */}
                <p className="text-sm text-neutral-500 leading-relaxed flex-1 mb-5">{excerpt}</p>

                {/* Read more */}
                <div className="flex items-center gap-1 text-xs font-semibold text-primary-600 group-hover:text-primary-800 transition-colors">
                  Read more
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform duration-150" />
                </div>
              </article>
            ))}
          </div>

          {/* Load more placeholder */}
          <div className="mt-10 text-center">
            <button className="btn-outline text-sm px-8 py-2.5">
              Load more updates
            </button>
          </div>
        </div>
      </section>

      {/* ── Press release / gallery placeholder ───────────────────────── */}
      <section className="section-padding bg-white">
        <div className="container-theme">
          <div className="rounded-2xl bg-neutral-900 text-white p-8 lg:p-12 grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <span className="section-label mb-5 text-accent-400">
                <span className="block w-6 h-0.5 bg-accent-400" />
                Press & Media
              </span>
              <h2 className="font-display font-bold text-2xl text-white mb-4">
                Press releases & media enquiries
              </h2>
              <p className="text-neutral-400 leading-relaxed mb-6">
                Journalists, trade publications and media organisations interested in
                covering Nigerian-EU commodity trade are welcome to contact our communications team.
              </p>
              <Link href="/contact" className="btn-accent text-sm px-5 py-2.5">
                Media enquiries
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-square rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-neutral-600 text-xs"
                >
                  Photo {i + 1}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Express Interest Form ─────────────────────────────────────── */}
      <section id="express-interest" className="section-padding bg-neutral-50">
        <div className="container-theme">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-start max-w-4xl mx-auto">
            <div>
              <span className="section-label mb-5">Stay Connected</span>
              <h2 className="font-display font-bold text-2xl text-neutral-900 mb-4">
                Express interest in upcoming events
              </h2>
              <p className="text-neutral-600 leading-relaxed mb-6">
                Register your interest to be notified about upcoming trade missions,
                training sessions, buyer–seller meetings and warehouse open days.
              </p>
              <div className="space-y-3">
                {[
                  "Trade missions to France (annual)",
                  "Physical training sessions in Kano and Abuja",
                  "Warehouse open days in Nigeria",
                  "Buyer–seller matchmaking events",
                  "Regulatory update briefings (virtual)",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2.5 text-sm text-neutral-600">
                    <span className="w-2 h-2 rounded-full bg-accent-500 shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-border shadow-lg p-8">
              <h3 className="font-display font-semibold text-xl text-neutral-900 mb-6">
                Register your interest
              </h3>
              <ExpressInterestForm />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
