import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { newsEvents } from "@/db/schema";
import { eq, and, ne, desc } from "drizzle-orm";
import { Calendar, MapPin, ArrowLeft, ArrowRight, Newspaper } from "lucide-react";

interface Props { params: { slug: string } }

// ── Metadata ──────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const [item] = await db
    .select({ title: newsEvents.title, excerpt: newsEvents.excerpt, imageUrl: newsEvents.imageUrl })
    .from(newsEvents)
    .where(and(eq(newsEvents.slug, params.slug), eq(newsEvents.isPublished, true)))
    .limit(1);

  if (!item) return { title: "Not Found" };

  return {
    title:       `${item.title} | Azuretti News`,
    description: item.excerpt ?? undefined,
    openGraph:   item.imageUrl ? { images: [item.imageUrl] } : undefined,
  };
}

// ── Helpers ────────────────────────────────────────────────────────────────

function formatDate(d: Date | string): string {
  return new Date(d).toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric",
  });
}

/**
 * Minimal Markdown → HTML renderer (no external dependency).
 * Handles headings, bold, italic, links, code blocks, blockquotes,
 * unordered + ordered lists, and paragraph breaks.
 * Swap for a proper Markdown library (e.g. `marked`, `remark`)
 * if richer rendering is needed.
 */
function renderMarkdown(md: string): string {
  return md
    // Code blocks
    .replace(/```[\s\S]*?```/g, (m) => {
      const code = m.replace(/^```\w*\n?/, "").replace(/```$/, "").trim();
      return `<pre class="bg-neutral-900 text-neutral-100 rounded-xl p-4 overflow-x-auto text-sm my-4"><code>${escHtml(code)}</code></pre>`;
    })
    // Inline code
    .replace(/`([^`]+)`/g, '<code class="bg-neutral-100 text-primary-700 px-1.5 py-0.5 rounded text-sm font-mono">$1</code>')
    // Headings
    .replace(/^### (.+)$/gm, '<h3 class="font-display font-bold text-xl text-neutral-900 mt-8 mb-3">$1</h3>')
    .replace(/^## (.+)$/gm,  '<h2 class="font-display font-bold text-2xl text-neutral-900 mt-10 mb-4">$1</h2>')
    .replace(/^# (.+)$/gm,   '<h1 class="font-display font-bold text-3xl text-neutral-900 mt-12 mb-5">$1</h1>')
    // Blockquote
    .replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-primary-300 pl-4 italic text-neutral-600 my-4">$1</blockquote>')
    // Bold + italic
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g,     '<strong class="font-semibold text-neutral-900">$1</strong>')
    .replace(/\*(.+?)\*/g,         '<em>$1</em>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary-600 hover:text-primary-800 underline" target="_blank" rel="noopener noreferrer">$1</a>')
    // Unordered lists
    .replace(/(^[*-] .+$\n?)+/gm, (block) => {
      const items = block.trim().split("\n").map(l =>
        `<li class="ml-4 list-disc">${l.replace(/^[*-] /, "")}</li>`
      ).join("\n");
      return `<ul class="space-y-1 my-4 text-neutral-700">${items}</ul>`;
    })
    // Ordered lists
    .replace(/(^\d+\. .+$\n?)+/gm, (block) => {
      const items = block.trim().split("\n").map(l =>
        `<li class="ml-4 list-decimal">${l.replace(/^\d+\. /, "")}</li>`
      ).join("\n");
      return `<ol class="space-y-1 my-4 text-neutral-700">${items}</ol>`;
    })
    // Horizontal rule
    .replace(/^---$/gm, '<hr class="border-border my-8" />')
    // Paragraphs — wrap double-newline-separated blocks
    .replace(/\n{2,}/g, "</p><p class=\"leading-relaxed text-neutral-700 mb-4\">")
    // Wrap whole thing
    .replace(/^/, '<p class="leading-relaxed text-neutral-700 mb-4">')
    .replace(/$/, '</p>');
}

function escHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const TYPE_BADGE: Record<string, { label: string; bg: string; text: string }> = {
  news:          { label: "News",          bg: "#dbeafe", text: "#1e40af" },
  event:         { label: "Event",         bg: "#dcfce7", text: "#166534" },
  trade_mission: { label: "Trade Mission", bg: "#fef3c7", text: "#92400e" },
};

// ── Page ───────────────────────────────────────────────────────────────────

export default async function NewsArticlePage({ params }: Props) {
  const [item] = await db
    .select()
    .from(newsEvents)
    .where(and(eq(newsEvents.slug, params.slug), eq(newsEvents.isPublished, true)))
    .limit(1);

  if (!item) notFound();

  // Related articles — same type, excluding current
  const related = await db
    .select({
      id:          newsEvents.id,
      title:       newsEvents.title,
      slug:        newsEvents.slug,
      type:        newsEvents.type,
      excerpt:     newsEvents.excerpt,
      imageUrl:    newsEvents.imageUrl,
      publishedAt: newsEvents.publishedAt,
    })
    .from(newsEvents)
    .where(
      and(
        eq(newsEvents.isPublished, true),
        eq(newsEvents.type, item.type as string),
        ne(newsEvents.id, item.id),
      )
    )
    .orderBy(desc(newsEvents.publishedAt))
    .limit(3);

  const badge = TYPE_BADGE[item.type ?? "news"];

  return (
    <main className="min-h-screen bg-white">
      {/* ── Cover image ─────────────────────────────────── */}
      {item.imageUrl && (
        <div className="h-72 sm:h-96 overflow-hidden bg-neutral-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.imageUrl}
            alt={item.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* ── Article body ─────────────────────────────────── */}
      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Back */}
        <Link
          href="/news"
          className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-700 transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to News & Events
        </Link>

        {/* Meta */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          {badge && (
            <span
              className="px-2.5 py-1 rounded-full text-xs font-bold"
              style={{ background: badge.bg, color: badge.text }}
            >
              {badge.label}
            </span>
          )}
          {item.publishedAt && (
            <span className="text-sm text-neutral-400">{formatDate(item.publishedAt)}</span>
          )}
        </div>

        {/* Title */}
        <h1 className="font-display font-bold text-3xl sm:text-4xl text-neutral-900 mb-5 leading-tight">
          {item.title}
        </h1>

        {/* Event info bar */}
        {(item.eventDate || item.location) && (
          <div className="flex flex-wrap gap-4 p-4 rounded-xl bg-neutral-50 border border-border mb-8 text-sm text-neutral-600">
            {item.eventDate && (
              <span className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary-500" />
                {formatDate(item.eventDate)}
              </span>
            )}
            {item.location && (
              <span className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary-500" />
                {item.location}
              </span>
            )}
          </div>
        )}

        {/* Excerpt */}
        {item.excerpt && (
          <p className="text-lg text-neutral-600 leading-relaxed border-l-4 border-primary-300 pl-5 mb-8 italic">
            {item.excerpt}
          </p>
        )}

        {/* Full content */}
        {item.content ? (
          <div
            className="prose-like"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(item.content) }}
          />
        ) : (
          <p className="text-neutral-400 italic">No content available.</p>
        )}

        {/* CTA */}
        <div className="mt-12 p-6 rounded-2xl bg-gradient-to-br from-primary-950 to-primary-800 text-white">
          <p className="font-display font-bold text-xl mb-2">
            Interested in trading with Azuretti?
          </p>
          <p className="text-primary-200 text-sm mb-4">
            Join the Azuretti Trade House as an exporter or European buyer.
          </p>
          <div className="flex gap-3 flex-wrap">
            <Link
              href="/exporter"
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-sm font-medium hover:bg-white/20 transition-colors"
            >
              I'm an Exporter <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/buyer"
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-accent-500 text-neutral-900 text-sm font-medium hover:bg-accent-400 transition-colors"
            >
              I'm a Buyer <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* ── Related articles ──────────────────────────────── */}
      {related.length > 0 && (
        <div className="border-t border-border bg-neutral-50 py-12">
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="font-display font-bold text-2xl text-neutral-900 mb-6">
              Related Articles
            </h2>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              {related.map((r) => {
                const rb = TYPE_BADGE[r.type ?? "news"];
                return (
                  <Link
                    key={r.id}
                    href={`/news/${r.slug}`}
                    className="group flex flex-col rounded-xl border border-border bg-white overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                  >
                    {r.imageUrl ? (
                      <div className="h-36 overflow-hidden bg-neutral-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={r.imageUrl}
                          alt={r.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    ) : (
                      <div className="h-36 bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center">
                        <Newspaper className="h-8 w-8 text-primary-200" />
                      </div>
                    )}
                    <div className="p-4 flex-1 flex flex-col">
                      {rb && (
                        <span
                          className="px-2 py-0.5 rounded-full text-[11px] font-bold self-start mb-2"
                          style={{ background: rb.bg, color: rb.text }}
                        >
                          {rb.label}
                        </span>
                      )}
                      <p className="text-sm font-semibold text-neutral-900 group-hover:text-primary-700 transition-colors line-clamp-2 leading-snug">
                        {r.title}
                      </p>
                      <p className="text-xs text-neutral-400 mt-auto pt-2">
                        {r.publishedAt ? formatDate(r.publishedAt) : ""}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
