import type { Metadata } from "next";
import { requireRole } from "@/lib/auth/helpers";
import { getDb } from "@/db";
import {
  buyerProfiles, commodities, warehouseReceipts,
  warehouseReceiptItems, buyerDemands,
} from "@/db/schema";

import { eq, and, inArray, sql, count } from "drizzle-orm";
import { CommoditySearchBar } from "@/components/buyer/CommoditySearchBar";
import { FeaturedCommodityCard } from "@/components/buyer/FeaturedCommodityCard";
import { OnboardingBanner }      from "@/components/onboarding/OnboardingBanner";
import { Package, Ship, FileText, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

const db = getDb();

export const metadata: Metadata = { title: "Dashboard – Buyer Portal" };

export default async function BuyerDashboardPage() {
  const user = await requireRole(["buyer", "admin"]);

  const [profile] = await db
    .select()
    .from(buyerProfiles)
    .where(eq(buyerProfiles.userId, user.id))
    .limit(1);

  const interestedIds: string[] = profile?.interestedCommodities ?? [];

  const [{ demandCount }] = await db
    .select({ demandCount: count() })
    .from(buyerDemands)
    .where(
      profile
        ? and(
            eq(buyerDemands.buyerId, profile.id),
            eq(buyerDemands.status, "pending")
          )
        : sql`1=0`
    );

  // Featured = buyer's interests; fall back to first 3 in catalogue
  const commodityRows = await db
    .select({
      id: commodities.id, name: commodities.name, slug: commodities.slug,
      category: commodities.category, description: commodities.description,
      minOrderQtyMt: commodities.minOrderQtyMt, grades: commodities.grades,
      certifications: commodities.certifications, sortOrder: commodities.sortOrder,
    })
    .from(commodities)
    .where(
      interestedIds.length > 0
        ? and(eq(commodities.isActive, true), inArray(commodities.id, interestedIds))
        : eq(commodities.isActive, true)
    )
    .orderBy(commodities.sortOrder)
    .limit(3);

  // Enrich with live stock
  const stockMap: Record<string, { location: string; remainingMt: number }[]> = {};
  if (commodityRows.length > 0) {
    const ids = commodityRows.map((c) => c.id);
    
    const stockRows = await db
      .select({
        commodityId: warehouseReceiptItems.commodityId,
        warehouseLocation: warehouseReceipts.warehouseLocation,
        remainingMt: sql`
          SUM(${warehouseReceiptItems.quantityMt} - ${warehouseReceiptItems.quantityDispatchedMt})
        `.mapWith((val) => Number(val ?? 0)),
      })
      .from(warehouseReceiptItems)
      .innerJoin(
        warehouseReceipts,
        eq(warehouseReceiptItems.receiptId, warehouseReceipts.id)
      )
      .where(
        and(
          eq(warehouseReceipts.status, "approved"),
          inArray(warehouseReceiptItems.commodityId, ids)
        )
      )
      .groupBy(
        warehouseReceiptItems.commodityId,
        warehouseReceipts.warehouseLocation
      );

    for (const r of stockRows) {
      if (!stockMap[r.commodityId]) stockMap[r.commodityId] = [];
      stockMap[r.commodityId].push({ location: r.warehouseLocation, remainingMt: r.remainingMt ?? 0 });
    }
  }

  const featuredCommodities = commodityRows.map((c) => ({
    ...c,
    stock:        stockMap[c.id] ?? [],
    totalStockMt: (stockMap[c.id] ?? []).reduce((s, r) => s + r.remainingMt, 0),
    hasStock:     (stockMap[c.id] ?? []).some((r) => r.remainingMt > 0),
  }));

  const firstName = user.name?.split(" ")[0] ?? "Buyer";

  return (
    <div className="min-h-full">
      {!profile?.onboardingComplete && <OnboardingBanner role="buyer" />}

      {/* ── Hero search ──────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-950 via-primary-800 to-primary-700 p-8 lg:p-12 mb-8">
        <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`, backgroundSize: "28px 28px" }} aria-hidden="true" />
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full opacity-15" style={{ background: "radial-gradient(circle, #f59e0b, transparent 70%)" }} aria-hidden="true" />

        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-4 w-4 text-accent-400" />
            <span className="text-xs font-semibold uppercase tracking-widest text-accent-400">ETH — Europe Trade House</span>
          </div>
          <h1 className="font-display font-bold text-white text-2xl lg:text-3xl mb-2">
            Welcome back, {firstName}.
          </h1>
          <p className="text-primary-200 text-sm mb-7 leading-relaxed max-w-xl">
            Search our verified Nigerian commodity catalogue. Every product is EU-compliant,
            lab-tested and traceable — with live stock from our France warehouse.
          </p>

          <CommoditySearchBar />

          <div className="flex flex-wrap gap-2 mt-4">
            {["pulses", "grains", "seeds", "nuts"].map((cat) => (
              <Link
                key={cat}
                href={`/portal/buyer/search?category=${cat}`}
                className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white/80 text-xs font-medium capitalize hover:bg-white/20 hover:text-white transition-all"
              >
                {cat}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── Stats ──────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Active Demands",  value: demandCount, icon: Package,  color: "text-primary-600", bg: "bg-primary-50", href: "/portal/buyer/demands"  },
          { label: "Incoming Ships",  value: 0,           icon: Ship,     color: "text-blue-600",    bg: "bg-blue-50",    href: "/portal/buyer/shipments" },
          { label: "Documents Ready", value: 0,           icon: FileText, color: "text-purple-600",  bg: "bg-purple-50",  href: "/portal/buyer/documents" },
        ].map(({ label, value, icon: Icon, color, bg, href }) => (
          <Link key={label} href={href} className="card p-4 hover:shadow-md transition-shadow">
            <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center mb-2.5`}>
              <Icon className={`h-4 w-4 ${color}`} />
            </div>
            <p className="font-display font-bold text-xl text-neutral-900">{value}</p>
            <p className="text-xs text-neutral-500 mt-0.5">{label}</p>
          </Link>
        ))}
      </div>

      {/* ── Featured commodities ──────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-display font-bold text-xl text-neutral-900">
              {interestedIds.length > 0 ? "Your Commodity Interests" : "Featured Commodities"}
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              {interestedIds.length > 0
                ? "Live stock and details for your selected commodities."
                : "Top commodities available through the Azuretti Trade House."}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {interestedIds.length > 0 && (
              <Link href="/auth/onboarding" className="text-xs text-neutral-400 hover:text-neutral-600 transition-colors">
                Edit preferences
              </Link>
            )}
            <Link href="/portal/buyer/search" className="flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-800 transition-colors">
              Browse all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {featuredCommodities.length === 0 ? (
          <div className="card p-12 text-center">
            <Package className="h-10 w-10 text-neutral-200 mx-auto mb-3" />
            <p className="text-sm text-neutral-500 font-medium">No commodities in catalogue yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featuredCommodities.map((c) => (
              <FeaturedCommodityCard key={c.id} commodity={c} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}