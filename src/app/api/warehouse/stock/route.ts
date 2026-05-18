import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { warehouseReceipts, warehouseReceiptItems, commodities, users } from "@/db/schema";

import { eq, and, sql, sum } from "drizzle-orm";
import { getSession } from "@/lib/auth/helpers";

const db = getDb();
/**
 * GET /api/warehouse/stock
 * Returns aggregated stock summary:
 *   - For exporters/farmers: their own stock grouped by commodity
 *   - For admins: all stock, optionally filtered by ownerId
 *
 * Each row: commodity, total approved MT, dispatched MT, remaining MT
 */
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);

  const ownerId = session.user.role === "admin"
    ? (searchParams.get("ownerId") ?? undefined)
    : session.user.id;

  // Only count items from APPROVED receipts
  const whereConditions = [eq(warehouseReceipts.status, "approved")];
  if (ownerId) whereConditions.push(eq(warehouseReceipts.ownerId, ownerId));

  const stock = await db
    .select({
      commodityId:          warehouseReceiptItems.commodityId,
      commodityName:        commodities.name,
      commoditySlug:        commodities.slug,
      commodityCategory:    commodities.category,
      warehouseLocation:    warehouseReceipts.warehouseLocation,
      totalQuantityMt:      sql<string>`SUM(${warehouseReceiptItems.quantityMt})`,
      totalDispatchedMt:    sql<string>`SUM(${warehouseReceiptItems.quantityDispatchedMt})`,
      // remaining = total - dispatched
      remainingMt:          sql<string>`SUM(${warehouseReceiptItems.quantityMt} - ${warehouseReceiptItems.quantityDispatchedMt})`,
      receiptCount:         sql<string>`COUNT(DISTINCT ${warehouseReceiptItems.receiptId})`,
    })
    .from(warehouseReceiptItems)
    .innerJoin(warehouseReceipts, eq(warehouseReceiptItems.receiptId, warehouseReceipts.id))
    .leftJoin(commodities, eq(warehouseReceiptItems.commodityId, commodities.id))
    .where(and(...whereConditions))
    .groupBy(
      warehouseReceiptItems.commodityId,
      commodities.name,
      commodities.slug,
      commodities.category,
      warehouseReceipts.warehouseLocation,
    )
    .orderBy(commodities.name);

  return NextResponse.json({ stock });
}