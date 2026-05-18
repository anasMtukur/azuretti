import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { commodities, warehouseReceipts, warehouseReceiptItems } from "@/db/schema";

import { eq, ilike, or, and, sql, inArray } from "drizzle-orm";
import { getSession } from "@/lib/auth/helpers";

const db = getDb();
/**
 * GET /api/commodities/search
 *
 * Query params:
 *   q          – free-text search (name, description)
 *   category   – filter by category enum
 *   ids        – comma-separated commodity IDs (for featured lookup)
 *   withStock  – "true" to include live warehouse stock totals
 */
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const q          = searchParams.get("q")?.trim() ?? "";
  const category   = searchParams.get("category") ?? "";
  const idsParam   = searchParams.get("ids") ?? "";
  const withStock  = searchParams.get("withStock") === "true";

  // Build WHERE conditions
  const conditions: ReturnType<typeof eq>[] = [
    eq(commodities.isActive, true),
  ];

  if (q) {
    conditions.push(
      or(
        ilike(commodities.name,        `%${q}%`),
        ilike(commodities.description, `%${q}%`)
      ) as any
    );
  }

  if (category && ["pulses", "grains", "seeds", "nuts", "other"].includes(category)) {
    conditions.push(eq(commodities.category, category as any));
  }

  if (idsParam) {
    const ids = idsParam.split(",").map((s) => s.trim()).filter(Boolean);
    if (ids.length > 0) conditions.push(inArray(commodities.id, ids));
  }

  const results = await db
    .select({
      id:               commodities.id,
      name:             commodities.name,
      slug:             commodities.slug,
      category:         commodities.category,
      description:      commodities.description,
      grades:           commodities.grades,
      packagingOptions: commodities.packagingOptions,
      minOrderQtyMt:    commodities.minOrderQtyMt,
      certifications:   commodities.certifications,
      sortOrder:        commodities.sortOrder,
    })
    .from(commodities)
    .where(and(...conditions))
    .orderBy(commodities.sortOrder, commodities.name)
    .limit(50);

  if (!withStock || results.length === 0) {
    return NextResponse.json({ commodities: results });
  }

  // ── Enrich with live stock data ────────────────────────────────────────
  const commodityIds = results.map((c) => c.id);

  const stockRows = await db
    .select({
      commodityId:       warehouseReceiptItems.commodityId,
      warehouseLocation: warehouseReceipts.warehouseLocation,
      totalMt:           sql<string>`SUM(${warehouseReceiptItems.quantityMt})`,
      remainingMt:       sql<string>`SUM(${warehouseReceiptItems.quantityMt} - ${warehouseReceiptItems.quantityDispatchedMt})`,
    })
    .from(warehouseReceiptItems)
    .innerJoin(warehouseReceipts, eq(warehouseReceiptItems.receiptId, warehouseReceipts.id))
    .where(
      and(
        eq(warehouseReceipts.status, "approved"),
        inArray(warehouseReceiptItems.commodityId, commodityIds)
      )
    )
    .groupBy(warehouseReceiptItems.commodityId, warehouseReceipts.warehouseLocation);

  // Map stock by commodityId → { location → { total, remaining } }
  type StockEntry = { location: string; totalMt: number; remainingMt: number };
  const stockMap = stockRows.reduce<Record<string, StockEntry[]>>((acc, row) => {
    if (!acc[row.commodityId]) acc[row.commodityId] = [];
    acc[row.commodityId].push({
      location:    row.warehouseLocation,
      totalMt:     parseFloat(row.totalMt     || "0"),
      remainingMt: parseFloat(row.remainingMt || "0"),
    });
    return acc;
  }, {});

  const enriched = results.map((c) => ({
    ...c,
    stock: stockMap[c.id] ?? [],
    totalStockMt:     (stockMap[c.id] ?? []).reduce((s, r) => s + r.remainingMt, 0),
    hasStock:         (stockMap[c.id] ?? []).some((r) => r.remainingMt > 0),
  }));

  return NextResponse.json({ commodities: enriched });
}