import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getDb } from "@/db";
import { commodities } from "@/db/schema";
import { CommoditiesCurtainGrid } from "./CommoditiesCurtainGrid";
import { and, eq } from "drizzle-orm";

const db = getDb();

export type PreviewCommodity = {
  name: string;
  category: string;
  slug: string;
};

export async function CommoditiesPreview() {
  const previewCommodities = await db
    .select()
    .from(commodities)
    .where(and(eq(commodities.isActive, true), eq(commodities.isDeleted, false)))
    .orderBy(commodities.sortOrder);

  // Group items by category keys
  const groupedData = previewCommodities.reduce<Record<string, PreviewCommodity[]>>(
    (acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    },
    { pulses: [], grains: [], seeds: [], nuts: [] }
  );

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

        {/* The Accordion Curtain System */}
        <CommoditiesCurtainGrid groupedData={groupedData} />

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