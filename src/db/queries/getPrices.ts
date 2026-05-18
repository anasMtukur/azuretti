import "server-only";
import { getDb } from "@/db";
import { commodities, commodityPrices } from "@/db/schema";

import { eq, desc } from "drizzle-orm";

const db = getDb();

export async function getPrices() {
  const rows = await db
    .selectDistinctOn([commodityPrices.commodityId], {
      commodity: commodities.name,
      market: commodityPrices.market,
      pricePerKg: commodityPrices.pricePerKg,
      priceChange: (commodityPrices as any).priceChange,
      currency: commodityPrices.currency,
    })
    .from(commodityPrices)
    .innerJoin(
      commodities,
      eq(commodityPrices.commodityId, commodities.id)
    )
    .where(eq(commodities.isActive, true))
    .orderBy(
      commodityPrices.commodityId,
      desc(commodityPrices.recordedAt)
    );
  return rows.map((r) => {
    const isIntl = r.market === "Int'l";

    return {
      commodity: r.commodity,
      market: r.market,
      price: isIntl
        ? `${r.currency ?? "$"}${Number(r.pricePerKg).toLocaleString()}/MT`
        : `₦${Number(r.pricePerKg).toLocaleString()}/kg`,
      change: r.priceChange ? `${r.priceChange > 0 ? "+" : ""}${r.priceChange}%` : undefined,
    };
  });
}