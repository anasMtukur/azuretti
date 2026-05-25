import type { Metadata } from "next";
import Link from "next/link";
import { getDb } from "@/db";
import { newsEvents } from "@/db/schema";

import { eq, desc, and } from "drizzle-orm";
import { Calendar, MapPin, ArrowRight, Newspaper } from "lucide-react";
import { HeroSubSection } from "@/components/website/sections/HeroSubSection";

const db = getDb();

export const metadata: Metadata = {
  title:       "News & Events | Azuretti Service & Distribution",
  description: "Latest news, trade events and missions from Azuretti Trade House.",
};

// ── Types ──────────────────────────────────────────────────────────────────

interface Props {
  searchParams: { type?: string };
}

const TYPE_FILTER_TABS = [
  { key: "all",          label: "All" },
  { key: "news",         label: "News" },
  { key: "event",        label: "Events" },
  { key: "trade_mission",label: "Trade Missions" },
];

const TYPE_BADGE: Record<string, { label: string; bg: string; text: string }> = {
  news:          { label: "News",          bg: "#dbeafe", text: "#1e40af" },
  event:         { label: "Event",         bg: "#dcfce7", text: "#166534" },
  trade_mission: { label: "Trade Mission", bg: "#fef3c7", text: "#92400e" },
};

function formatDate(d: Date | string): string {
  return new Date(d).toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric",
  });
}

// ── Page ───────────────────────────────────────────────────────────────────

export default async function NewsPage({ searchParams }: Props) {
  const typeFilter = searchParams.type;
  const validType  = typeFilter && ["news","event","trade_mission"].includes(typeFilter)
    ? typeFilter
    : null;

  const conditions: any[] = [eq(newsEvents.isPublished, true)];
  if (validType) conditions.push(eq(newsEvents.type, validType));

  const items = await db
    .select({
      id:          newsEvents.id,
      title:       newsEvents.title,
      slug:        newsEvents.slug,
      type:        newsEvents.type,
      excerpt:     newsEvents.excerpt,
      imageUrl:    newsEvents.imageUrl,
      eventDate:   newsEvents.eventDate,
      location:    newsEvents.location,
      publishedAt: newsEvents.publishedAt,
    })
    .from(newsEvents)
    .where(and(...conditions))
    .orderBy(desc(newsEvents.publishedAt))
    .limit(50);

  const featured    = items[0];
  const remaining   = items.slice(1);

  return (
    <main className="min-h-screen bg-white">
      <HeroSubSection
        type="news"
        tagText="Stay informed"
        title="News & Events"
        description="The latest updates from the Azuretti Trade House — export news, trade missions and industry events from Nigeria and Europe."
      />

      {/* ── Filter tabs ─────────────────────────────────── */}
      <div className="border-b border-border bg-white sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 flex gap-1 overflow-x-auto">
          {TYPE_FILTER_TABS.map(({ key, label }) => (
            <Link
              key={key}
              href={key === "all" ? "/news" : `/news?type=${key}`}
              className={`px-4 py-3.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                (key === "all" && !validType) || key === validType
                  ? "border-primary-600 text-primary-700"
                  : "border-transparent text-neutral-500 hover:text-neutral-800 hover:border-neutral-300"
              }`}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12 space-y-12">

        {items.length === 0 ? (
          <div className="text-center py-20">
            <Newspaper className="h-12 w-12 text-neutral-200 mx-auto mb-4" />
            <p className="text-neutral-500 font-medium">No articles found</p>
            <p className="text-neutral-400 text-sm mt-1">
              {validType ? "Try a different filter." : "Check back soon."}
            </p>
          </div>
        ) : (
          <>
            {/* ── Featured article ──────────────────────── */}
            {featured && !validType && (
              <Link
                href={`/news/${featured.slug}`}
                className="group block rounded-2xl overflow-hidden border border-border hover:shadow-xl transition-all duration-300"
              >
                {/* Cover image */}
                {featured.imageUrl && (
                  <div className="h-64 sm:h-80 overflow-hidden bg-neutral-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={featured.imageUrl}
                      alt={featured.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                )}
                <div className="p-7">
                  <div className="flex items-center gap-3 mb-3">
                    {featured.type && (
                      <span
                        className="px-2.5 py-0.5 rounded-full text-xs font-bold"
                        style={{
                          background: TYPE_BADGE[featured.type]?.bg,
                          color:      TYPE_BADGE[featured.type]?.text,
                        }}
                      >
                        {TYPE_BADGE[featured.type]?.label}
                      </span>
                    )}
                    <span className="text-xs text-neutral-400">
                      {featured.publishedAt ? formatDate(featured.publishedAt) : ""}
                    </span>
                  </div>
                  <h2 className="font-display font-bold text-2xl sm:text-3xl text-neutral-900 mb-3 group-hover:text-primary-700 transition-colors">
                    {featured.title}
                  </h2>
                  {featured.excerpt && (
                    <p className="text-neutral-600 leading-relaxed mb-4">{featured.excerpt}</p>
                  )}
                  <div className="flex items-center gap-4 flex-wrap text-sm text-neutral-400">
                    {featured.eventDate && (
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4" />
                        {formatDate(featured.eventDate)}
                      </span>
                    )}
                    {featured.location && (
                      <span className="flex items-center gap-1.5">
                        <MapPin className="h-4 w-4" />
                        {featured.location}
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-primary-600 font-medium ml-auto">
                      Read more <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </div>
              </Link>
            )}

            {/* ── Article grid ────────────────────────────── */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {(validType ? items : remaining).map((item) => {
                const badge = TYPE_BADGE[item.type ?? "news"];
                return (
                  <Link
                    key={item.id}
                    href={`/news/${item.slug}`}
                    className="group flex flex-col rounded-2xl border border-border overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
                  >
                    {/* Cover image */}
                    {item.imageUrl ? (
                      <div className="h-44 overflow-hidden bg-neutral-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    ) : (
                      <div className="h-44 bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center">
                        <Newspaper className="h-10 w-10 text-primary-200" />
                      </div>
                    )}

                    <div className="flex flex-col flex-1 p-5">
                      {/* Type + date */}
                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        {badge && (
                          <span
                            className="px-2 py-0.5 rounded-full text-[11px] font-bold"
                            style={{ background: badge.bg, color: badge.text }}
                          >
                            {badge.label}
                          </span>
                        )}
                        <span className="text-xs text-neutral-400">
                          {item.publishedAt ? formatDate(item.publishedAt) : ""}
                        </span>
                      </div>

                      <h3 className="font-display font-bold text-lg text-neutral-900 mb-2 leading-snug group-hover:text-primary-700 transition-colors line-clamp-2">
                        {item.title}
                      </h3>

                      {item.excerpt && (
                        <p className="text-sm text-neutral-500 leading-relaxed mb-4 line-clamp-2">
                          {item.excerpt}
                        </p>
                      )}

                      <div className="mt-auto space-y-1.5">
                        {item.eventDate && (
                          <p className="text-xs text-neutral-400 flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5" />
                            {formatDate(item.eventDate)}
                          </p>
                        )}
                        {item.location && (
                          <p className="text-xs text-neutral-400 flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5" />
                            {item.location}
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </div>
    </main>
  );
}