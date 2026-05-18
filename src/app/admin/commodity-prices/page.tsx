import type { Metadata } from "next";
import { requireRole } from "@/lib/auth/helpers";
import { getDb } from "@/db";
import { commodities, commodityPrices } from "@/db/schema";

import { eq, desc } from "drizzle-orm";
import { CommodityPricesForm, LatestPrice } from "@/components/admin/CommodityPricesForm";

const db = getDb();

export const metadata: Metadata = { title: "Commodity Prices – Admin" };

export default async function AdminCommodityPricesPage() {
  await requireRole(["admin"]);
  
  // All active commodities
  const allCommodities = await db
    .select({
      id:       commodities.id,
      name:     commodities.name,
      slug:     commodities.slug,
      category: commodities.category,
    })
    .from(commodities)
    .where(eq(commodities.isActive, true))
    .orderBy(commodities.sortOrder, commodities.name);

  // Latest price row per commodity (most recent recordedAt)
  const latestPrices = await db
    .selectDistinctOn([commodityPrices.commodityId], {
      commodityId: commodityPrices.commodityId,
      pricePerKg:  commodityPrices.pricePerKg,
      priceChange: (commodityPrices as any).priceChange,
      market:      commodityPrices.market,
      state:       commodityPrices.state,
      currency:    commodityPrices.currency,
      recordedAt:  commodityPrices.recordedAt,
    })
    .from(commodityPrices)
    .orderBy(commodityPrices.commodityId, desc(commodityPrices.recordedAt));

  const priceMap: Record<string, LatestPrice> = Object.fromEntries(
        latestPrices.map((p) => [
            p.commodityId,
            {
                ...p,
                pricePerKg: p.pricePerKg ?? "0",
                currency: p.currency ?? "NGN",
            },
        ])
    );

  return (
    <div className="space-y-6 max-w-full">
      <div>
        <h1 className="font-display font-bold text-2xl text-neutral-900">
          Commodity Prices
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          Update market prices for the public ticker. The price change is
          calculated automatically from the previous entry for each commodity.
        </p>
      </div>

      <CommodityPricesForm
        commodities={allCommodities}
        latestPrices={priceMap}
      />
    </div>
  );
}
