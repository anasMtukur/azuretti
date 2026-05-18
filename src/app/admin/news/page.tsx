import type { Metadata } from "next";
import Link from "next/link";
import { requireRole } from "@/lib/auth/helpers";
import { getDb } from "@/db";
import { newsEvents } from "@/db/schema";

import { desc } from "drizzle-orm";
import { formatDate } from "@/lib/utils";
import { NewsPublishToggle } from "@/components/admin/NewsPublishToggle";
import { NewsDeleteButton }  from "@/components/admin/NewsDeleteButton";
import { Plus, Newspaper, Calendar, Globe } from "lucide-react";

const db = getDb();

export const metadata: Metadata = { title: "News & Events – Admin" };

const TYPE_META: Record<string, { label: string; bg: string; text: string }> = {
  news:          { label: "News",         bg: "#dbeafe", text: "#1e40af" },
  event:         { label: "Event",        bg: "#dcfce7", text: "#166534" },
  trade_mission: { label: "Trade Mission",bg: "#fef3c7", text: "#92400e" },
};

export default async function AdminNewsPage() {
  await requireRole(["admin"]);
  const items = await db
    .select()
    .from(newsEvents)
    .orderBy(desc(newsEvents.createdAt));

  const published = items.filter(i => i.isPublished).length;
  const drafts    = items.length - published;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-neutral-900">News & Events</h1>
          <p className="text-sm text-neutral-500 mt-0.5">
            {published} published · {drafts} draft{drafts !== 1 ? "s" : ""}
          </p>
        </div>
        <Link href="/admin/news/new" className="btn-primary text-sm px-4 py-2">
          <Plus className="h-4 w-4" />
          New Article
        </Link>
      </div>

      {/* Stats chips */}
      <div className="flex gap-3">
        {[
          { label: "All",           count: items.length,   href: "/admin/news" },
          { label: "News",          count: items.filter(i => i.type === "news").length,          href: "/admin/news?type=news" },
          { label: "Events",        count: items.filter(i => i.type === "event").length,         href: "/admin/news?type=event" },
          { label: "Trade Missions",count: items.filter(i => i.type === "trade_mission").length, href: "/admin/news?type=trade_mission" },
        ].map(({ label, count, href }) => (
          <Link
            key={label}
            href={href}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border bg-white text-xs font-medium text-neutral-600 hover:border-neutral-300 transition-colors"
          >
            {label}
            <span className="px-1.5 py-0.5 rounded-full bg-neutral-100 text-neutral-500 text-[10px] font-bold">
              {count}
            </span>
          </Link>
        ))}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-neutral-50">
                {["Title", "Type", "Event Date", "Published", "Created", "Status", ""].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-white">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center">
                    <Newspaper className="h-10 w-10 text-neutral-200 mx-auto mb-3" />
                    <p className="text-sm text-neutral-400">No articles yet.</p>
                    <Link href="/admin/news/new" className="text-xs text-primary-600 hover:text-primary-800 font-medium mt-2 inline-block">
                      Create your first article →
                    </Link>
                  </td>
                </tr>
              ) : items.map((item) => {
                const tm = TYPE_META[item.type ?? "news"] ?? TYPE_META.news;
                return (
                  <tr key={item.id} className="hover:bg-neutral-50 transition-colors">
                    {/* Title */}
                    <td className="px-4 py-3 max-w-xs">
                      <Link
                        href={`/admin/news/${item.id}`}
                        className="font-semibold text-neutral-900 hover:text-primary-700 transition-colors line-clamp-2"
                      >
                        {item.title}
                      </Link>
                      {item.excerpt && (
                        <p className="text-xs text-neutral-400 mt-0.5 line-clamp-1">{item.excerpt}</p>
                      )}
                    </td>

                    {/* Type badge */}
                    <td className="px-4 py-3">
                      <span
                        className="px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap"
                        style={{ background: tm.bg, color: tm.text }}
                      >
                        {tm.label}
                      </span>
                    </td>

                    {/* Event date */}
                    <td className="px-4 py-3 text-xs text-neutral-500 whitespace-nowrap">
                      {item.eventDate ? (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {formatDate(item.eventDate)}
                        </span>
                      ) : "—"}
                    </td>

                    {/* Published date */}
                    <td className="px-4 py-3 text-xs text-neutral-400 whitespace-nowrap">
                      {item.publishedAt ? formatDate(item.publishedAt) : "—"}
                    </td>

                    {/* Created date */}
                    <td className="px-4 py-3 text-xs text-neutral-400 whitespace-nowrap">
                      {formatDate(item.createdAt)}
                    </td>

                    {/* Publish toggle */}
                    <td className="px-4 py-3">
                      <NewsPublishToggle id={item.id} isPublished={item.isPublished} />
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/admin/news/${item.id}`}
                          className="text-xs font-medium text-primary-600 hover:text-primary-800 transition-colors whitespace-nowrap"
                        >
                          Edit
                        </Link>
                        {item.isPublished && (
                          <Link
                            href={`/news/${item.slug}`}
                            target="_blank"
                            className="text-xs text-neutral-400 hover:text-neutral-600 transition-colors"
                            title="View on website"
                          >
                            <Globe className="h-3.5 w-3.5" />
                          </Link>
                        )}
                        <NewsDeleteButton id={item.id} title={item.title} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}