import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getDb } from "@/db";
import { commodities } from "@/db/schema";

import { theme } from "@/config/theme";

const db = getDb();

const categoryLabels: Record<string, string> = {
  pulses: "Pulses",
  grains: "Grains",
  seeds:  "Seeds",
  nuts:   "Nuts",
};

type Category = keyof typeof theme.commodityColors;

export async function CommoditiesPreview() {

  const previewCommodities = await db
    .select()
    .from(commodities)
    .orderBy(commodities.sortOrder)
    .limit(12);

  return (
    <section className="section-padding bg-white" aria-label="Exportable commodities">
      <div className="container-theme">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-12">
          <div className="max-w-xl">
            <span className="section-label mb-4">Exportable Commodities</span>
            <h2 className="font-display font-bold text-neutral-900">
              EU-ready Nigerian products
            </h2>
            <p className="text-neutral-600 mt-3 leading-relaxed">
              Every commodity in our portfolio is fully vetted, tested, and
              documented for the European market.
            </p>
          </div>
          <Link
            href="/commodities"
            className="btn-outline shrink-0 text-sm px-5 py-2.5"
          >
            View all commodities
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {previewCommodities.map(({ name, category, slug }) => {
            const colors = theme.commodityColors[category as Category] ??
              theme.commodityColors.default;
            return (
              <Link
                key={slug}
                href={`/commodities/${slug}`}
                className="group relative flex flex-col gap-3 p-4 rounded-lg border border-border bg-white hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
              >
                {/* Category dot + label */}
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ background: colors.dot }}
                  />
                  <span
                    className="text-[11px] font-semibold uppercase tracking-wider"
                    style={{ color: colors.text }}
                  >
                    {categoryLabels[category]}
                  </span>
                </div>

                {/* Name */}
                <p className="text-sm font-semibold text-neutral-800 group-hover:text-primary-700 transition-colors leading-snug">
                  {name}
                </p>

                {/* Arrow on hover */}
                <ArrowRight className="h-3.5 w-3.5 text-neutral-300 group-hover:text-primary-500 group-hover:translate-x-0.5 transition-all duration-150 self-end mt-auto" />
              </Link>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-10 p-6 rounded-xl bg-primary-50 border border-primary-100 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold text-primary-900 text-sm">
              Need a specific commodity not listed?
            </p>
            <p className="text-xs text-primary-700 mt-0.5">
              Contact us — our sourcing team works with 200+ Nigerian farms and suppliers.
            </p>
          </div>
          <Link href="/contact" className="btn-primary text-sm px-5 py-2.5 shrink-0">
            Get in touch
          </Link>
        </div>
      </div>
    </section>
  );
}
