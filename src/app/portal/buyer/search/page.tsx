import type { Metadata } from "next";
import { requireRole } from "@/lib/auth/helpers";
import { getDb } from "@/db";
import { commodities, warehouseReceipts, warehouseReceiptItems } from "@/db/schema";

import { eq, and, ilike, inArray, or, sql } from "drizzle-orm";
import { FeaturedCommodityCard } from "@/components/buyer/FeaturedCommodityCard";
import { CommoditySearchBar } from "@/components/buyer/CommoditySearchBar";
import { Search, SlidersHorizontal } from "lucide-react";
import Link from "next/link";

const db = getDb();

export const metadata: Metadata = { title: "Search Commodities – Buyer Portal" };

const CATEGORIES = [
  { key: "all",    label: "All Commodities" },
  { key: "pulses", label: "Pulses" },
  { key: "grains", label: "Grains" },
  { key: "seeds",  label: "Seeds" },
  { key: "nuts",   label: "Nuts" },
];

const STOCK_FILTERS = [
  { key: "all",       label: "All" },
  { key: "in_stock",  label: "In Stock" },
  { key: "any",       label: "Any availability" },
];

interface Props {
  searchParams: { q?: string; category?: string; stock?: string };
}

export default async function BuyerSearchPage({ searchParams }: Props) {
  await requireRole(["buyer", "admin"]);

  const q        = searchParams.q?.trim()       ?? "";
  const category = searchParams.category        ?? "all";
  const stockFilter = searchParams.stock        ?? "all";

  // Build DB conditions
  const conditions: any[] = [eq(commodities.isActive, true)];

  if (q) {
    conditions.push(
      or(ilike(commodities.name, `%${q}%`), ilike(commodities.description, `%${q}%`))
    );
  }
  if (category !== "all") {
    conditions.push(eq(commodities.category, category as any));
  }

  const results = await db
    .select({
      id: commodities.id, name: commodities.name, slug: commodities.slug,
      category: commodities.category, description: commodities.description,
      minOrderQtyMt: commodities.minOrderQtyMt, grades: commodities.grades,
      certifications: commodities.certifications, sortOrder: commodities.sortOrder,
    })
    .from(commodities)
    .where(and(...conditions))
    .orderBy(commodities.sortOrder, commodities.name);

  // Enrich with stock data
  const stockMap: Record<string, { location: string; remainingMt: number }[]> = {};
  if (results.length > 0) {
    const ids = results.map((c) => c.id);
    const stockRows = await db
      .select({
        commodityId:       warehouseReceiptItems.commodityId,
        warehouseLocation: warehouseReceipts.warehouseLocation,
        remainingMt: sql`SUM(${warehouseReceiptItems.quantityMt} - ${warehouseReceiptItems.quantityDispatchedMt})`.mapWith(Number),
      })
      .from(warehouseReceiptItems)
      .innerJoin(warehouseReceipts, eq(warehouseReceiptItems.receiptId, warehouseReceipts.id))
      .where(and(eq(warehouseReceipts.status, "approved"), inArray(warehouseReceiptItems.commodityId, ids)))
      .groupBy(warehouseReceiptItems.commodityId, warehouseReceipts.warehouseLocation);

    for (const r of stockRows) {
      if (!stockMap[r.commodityId]) stockMap[r.commodityId] = [];
      stockMap[r.commodityId].push({ location: r.warehouseLocation, remainingMt: r.remainingMt ?? 0 });
    }
  }

  let enriched = results.map((c) => ({
    ...c,
    stock:        stockMap[c.id] ?? [],
    totalStockMt: (stockMap[c.id] ?? []).reduce((s, r) => s + r.remainingMt, 0),
    hasStock:     (stockMap[c.id] ?? []).some((r) => r.remainingMt > 0),
  }));

  // Apply stock filter client-side post-join
  if (stockFilter === "in_stock") {
    enriched = enriched.filter((c) => c.hasStock);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display font-bold text-2xl text-neutral-900">
          {q ? `Results for "${q}"` : category !== "all" ? `${CATEGORIES.find(c => c.key === category)?.label}` : "All Commodities"}
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          {enriched.length} {enriched.length === 1 ? "commodity" : "commodities"} found
          {q ? ` matching "${q}"` : ""}
        </p>
      </div>

      {/* Search bar */}
      <CommoditySearchBar />

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Category */}
        <div className="flex flex-wrap gap-1.5 items-center">
          <SlidersHorizontal className="h-4 w-4 text-neutral-400 shrink-0" />
          {CATEGORIES.map(({ key, label }) => (
            <Link
              key={key}
              href={`/portal/buyer/search?${q ? `q=${encodeURIComponent(q)}&` : ""}category=${key}${stockFilter !== "all" ? `&stock=${stockFilter}` : ""}`}
              className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                category === key
                  ? "bg-primary-600 text-white border-primary-600"
                  : "bg-white text-neutral-600 border-border hover:border-primary-300"
              }`}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Stock filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-neutral-400 font-medium">Availability:</span>
          {STOCK_FILTERS.map(({ key, label }) => (
            <Link
              key={key}
              href={`/portal/buyer/search?${q ? `q=${encodeURIComponent(q)}&` : ""}${category !== "all" ? `category=${category}&` : ""}stock=${key}`}
              className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                stockFilter === key
                  ? "bg-neutral-900 text-white border-neutral-900"
                  : "bg-white text-neutral-600 border-border hover:border-neutral-300"
              }`}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>

      {/* Results grid */}
      {enriched.length === 0 ? (
        <div className="card p-16 text-center">
          <Search className="h-12 w-12 text-neutral-200 mx-auto mb-4" />
          <p className="font-semibold text-neutral-600 mb-2">No results found</p>
          <p className="text-sm text-neutral-400 mb-5">
            {q
              ? `No commodities match "${q}". Try a broader search or browse all categories.`
              : "No commodities in this category yet."}
          </p>
          <Link href="/portal/buyer/search" className="btn-outline text-sm px-5 py-2">
            Clear filters
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {enriched.map((c) => (
            <FeaturedCommodityCard key={c.id} commodity={c} />
          ))}
        </div>
      )}
    </div>
  );
}