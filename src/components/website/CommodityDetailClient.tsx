"use client";

import Link from "next/link";
import { ArrowLeft, Download, Package, Ship, ShoppingCart, MapPin, Award, Box } from "lucide-react";
import type { Commodity } from "@/db/schema";

interface Props {
  commodity: Commodity;
  stats: {
    availableMt: number;
    totalShippedMt: number;
    totalSoldMt: number;
  };
}

function fmt(n: number) {
  return n.toLocaleString("en", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

export function CommodityDetailClient({ commodity, stats }: Props) {
  const grades           = (commodity.grades as string[] | null) ?? [];
  const certifications   = (commodity.certifications as string[] | null) ?? [];
  const packagingOptions = (commodity.packagingOptions as string[] | null) ?? [];

  return (
    <main className="min-h-screen bg-white">
      {/* ── Top bar ─────────────────────────────────────────── */}
      <div className="border-b border-neutral-100 bg-white sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-3">
          <Link
            href="/commodities"
            className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            All commodities
          </Link>
          <span className="text-neutral-300">/</span>
          <span className="text-sm text-neutral-900 font-medium">{commodity.name}</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

          {/* ── Left column (main content) ───────────────────── */}
          <div className="lg:col-span-2 space-y-10">

            {/* Header */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-semibold uppercase tracking-widest text-primary px-2.5 py-1 bg-primary/8 rounded-full">
                  {commodity.category}
                </span>
              </div>
              <h1 className="font-display text-4xl font-bold text-neutral-900 mb-4 leading-tight">
                {commodity.name}
              </h1>
              {commodity.description && (
                <p className="text-neutral-600 text-lg leading-relaxed">
                  {commodity.description}
                </p>
              )}
            </div>

            {/* Origin */}
            {commodity.origin && (
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-neutral-100 flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="h-4 w-4 text-neutral-500" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-0.5">Origin</p>
                  <p className="text-neutral-900 font-medium">{commodity.origin}</p>
                </div>
              </div>
            )}

            {/* Grades */}
            {grades.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Award className="h-4 w-4 text-neutral-400" />
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-400">Available Grades</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {grades.map((grade) => (
                    <span
                      key={grade}
                      className="px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm font-medium text-neutral-700"
                    >
                      {grade}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Packaging */}
            {packagingOptions.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Box className="h-4 w-4 text-neutral-400" />
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-400">Packaging Options</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {packagingOptions.map((opt) => (
                    <span
                      key={opt}
                      className="px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm text-neutral-600"
                    >
                      {opt}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Certifications */}
            {certifications.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Award className="h-4 w-4 text-neutral-400" />
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-400">Certifications</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {certifications.map((cert) => (
                    <span
                      key={cert}
                      className="px-3 py-1.5 bg-primary/8 border border-primary/20 rounded-full text-xs font-semibold text-primary"
                    >
                      {cert}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Right column (sidebar) ───────────────────────── */}
          <div className="space-y-5">

            {/* Stats card */}
            <div className="border border-neutral-200 rounded-2xl overflow-hidden">
              <div className="bg-neutral-50 px-5 py-4 border-b border-neutral-200">
                <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Inventory & Trade</p>
              </div>
              <div className="divide-y divide-neutral-100">
                <StatRow
                  icon={<Package className="h-4 w-4 text-primary" />}
                  label="Available in warehouse"
                  value={`${fmt(stats.availableMt)} MT`}
                  highlight
                />
                <StatRow
                  icon={<Ship className="h-4 w-4 text-neutral-400" />}
                  label="Total shipped"
                  value={`${fmt(stats.totalShippedMt)} MT`}
                />
                <StatRow
                  icon={<ShoppingCart className="h-4 w-4 text-neutral-400" />}
                  label="Total sold to buyers"
                  value={`${fmt(stats.totalSoldMt)} MT`}
                />
              </div>
            </div>

            {/* Min order */}
            {commodity.minOrderQtyMt && (
              <div className="border border-neutral-200 rounded-2xl px-5 py-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1">
                  Minimum Order
                </p>
                <p className="text-2xl font-display font-bold text-neutral-900">
                  {fmt(Number(commodity.minOrderQtyMt))}
                  <span className="text-base font-normal text-neutral-400 ml-1">MT</span>
                </p>
              </div>
            )}

            {/* Fact sheet download */}
            {commodity.factSheetUrl ? (
              <a
                href={commodity.factSheetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2.5 w-full px-5 py-3.5 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors"
              >
                <Download className="h-4 w-4" />
                Download Fact Sheet
              </a>
            ) : (
              <div className="flex items-center justify-center gap-2.5 w-full px-5 py-3.5 bg-neutral-100 text-neutral-400 rounded-xl text-sm cursor-not-allowed">
                <Download className="h-4 w-4" />
                Fact sheet not available
              </div>
            )}

            {/* CTA */}
            <Link
              href={`/contact?commodity=${commodity.slug}`}
              className="flex items-center justify-center w-full px-5 py-3.5 border border-primary text-primary rounded-xl font-semibold text-sm hover:bg-primary/5 transition-colors"
            >
              Request a Quote
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

function StatRow({
  icon,
  label,
  value,
  highlight = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className={`flex items-center gap-3 px-5 py-4 ${highlight ? "bg-primary/5" : ""}`}>
      <div className="shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-neutral-500 leading-none mb-0.5">{label}</p>
        <p className={`text-sm font-semibold ${highlight ? "text-primary" : "text-neutral-800"}`}>{value}</p>
      </div>
    </div>
  );
}