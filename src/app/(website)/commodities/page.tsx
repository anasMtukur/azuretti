import type { Metadata } from "next";
import Link from "next/link";
import { getDb } from "@/db";
import { commodities } from "@/db/schema";

import { ArrowRight } from "lucide-react";
import { theme } from "@/config/theme";
import { HeroSubSection } from "@/components/website/sections/HeroSubSection";

const db = getDb();

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Exportable Commodities",
  description:
    "Browse Azuretti's portfolio of EU-ready Nigerian agricultural commodities — all vetted, tested and certified.",
};

const categories = [
  { key: "all",    label: "All Commodities" },
  { key: "pulses", label: "Pulses" },
  { key: "grains", label: "Grains" },
  { key: "seeds",  label: "Seeds" },
  { key: "nuts",   label: "Nuts" },
];

const validCategories = ["pulses", "grains", "seeds", "nuts"] as const;
type ValidCategory = typeof validCategories[number];
type CommodityColor = keyof typeof theme.commodityColors;

interface CommoditiesPageProps {
  searchParams: { category?: string };
}

export default async function Page({ searchParams }: CommoditiesPageProps) {
    
  const allCommodities = await db
    .select()
    .from(commodities)
    .orderBy(commodities.sortOrder);
  // Validate and normalise the category param
  const raw = searchParams.category?.toLowerCase() ?? "";
  const activeCategory: ValidCategory | "all" = (validCategories as readonly string[]).includes(raw)
    ? (raw as ValidCategory)
    : "all";

  // Filter the commodity list
  const filtered =
    activeCategory === "all"
      ? allCommodities
      : allCommodities.filter((c) => c.category === activeCategory);

  // Hero subtitle reflects the active filter
  const activeLabel = categories.find((c) => c.key === activeCategory)?.label ?? "All Commodities";

  return (
    <>
      <HeroSubSection
        type="commodities"
        tagText="Exportable Commodities"
        title={<>EU-ready Nigerian <span className="text-accent-400">commodities</span></>}
        description="Every product in our portfolio is fully vetted, quality-tested by accredited laboratories and documented for the European market."
      />

      {/* ── Grid + Filter ────────────────────────────────────────── */}
      <section className="section-padding bg-white">
        <div className="container-theme">

          {/* Filter chips — each is a Link that sets/clears ?category= */}
          <div className="flex flex-wrap gap-2 mb-10" role="tablist" aria-label="Filter by category">
            {categories.map(({ key, label }) => {
              const isActive = key === activeCategory;
              const href = key === "all" ? "/commodities" : `/commodities?category=${key}`;
              return (
                <Link
                  key={key}
                  href={href}
                  scroll={false}
                  role="tab"
                  aria-selected={isActive}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all duration-150 ${
                    isActive
                      ? "bg-primary-600 text-white border-primary-600 shadow-green"
                      : "bg-white text-neutral-600 border-border hover:border-primary-300 hover:text-primary-700"
                  }`}
                >
                  {label}
                  {/* Show count per category */}
                  <span className={`ml-1.5 text-xs ${isActive ? "text-primary-200" : "text-neutral-400"}`}>
                    {key === "all"
                      ? allCommodities.length
                      : allCommodities.filter((c) => c.category === key).length}
                  </span>
                </Link>
              );
            })}
          </div>

          {/* Result count */}
          <p className="text-sm text-neutral-400 mb-6">
            Showing <span className="font-semibold text-neutral-700">{filtered.length}</span>{" "}
            {filtered.length === 1 ? "commodity" : "commodities"}
            {activeCategory !== "all" && (
              <> in <span className="font-semibold text-primary-600">{activeLabel}</span></>
            )}
          </p>

          {/* Commodity grid */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map(({ name, category, slug, description }) => {
              const colors =
                theme.commodityColors[category as CommodityColor] ??
                theme.commodityColors.default;
              return (
                <Link
                  key={slug}
                  href={`/commodities/${slug}`}
                  className="group flex flex-col p-6 rounded-xl border border-border bg-white hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
                >
                  {/* Category badge */}
                  <div className="flex items-center gap-2 mb-4">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ background: colors.dot }}
                    />
                    <span
                      className="text-xs font-semibold uppercase tracking-wider"
                      style={{ color: colors.text }}
                    >
                      {category}
                    </span>
                  </div>

                  {/* Name */}
                  <h2 className="font-display font-bold text-xl text-neutral-900 group-hover:text-primary-700 transition-colors mb-2">
                    {name}
                  </h2>

                  {/* Description */}
                  <p className="text-sm text-neutral-500 leading-relaxed flex-1 mb-5">{description}</p>

                  {/* CTA row */}
                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <span className="text-xs text-neutral-400">Origin: Nigeria</span>
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-primary-600 group-hover:text-primary-800 transition-colors">
                      View details
                      <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform duration-150" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Empty state (shouldn't normally appear but good to have) */}
          {filtered.length === 0 && (
            <div className="text-center py-16">
              <p className="text-neutral-400 text-sm mb-4">No commodities found in this category.</p>
              <Link href="/commodities" className="btn-outline text-sm px-5 py-2">
                View all commodities
              </Link>
            </div>
          )}

          {/* Bottom CTA */}
          <div className="mt-12 rounded-2xl bg-primary-50 border border-primary-100 p-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-display font-semibold text-lg text-primary-900">
                Looking for a commodity not listed?
              </h3>
              <p className="text-sm text-primary-700 mt-1">
                Our sourcing team works with 200+ Nigerian suppliers. Contact us with your requirements.
              </p>
            </div>
            <Link href="/contact" className="btn-primary text-sm px-5 py-2.5 shrink-0">
              Propose commodity
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
