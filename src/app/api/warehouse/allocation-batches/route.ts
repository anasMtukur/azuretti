import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  warehouseReceiptItems,
  warehouseReceipts,
  users,
  commodities,
} from "@/db/schema";
import { eq, and, gt, sql } from "drizzle-orm";
import { getSession } from "@/lib/auth/helpers";

/**
 * GET /api/warehouse/allocation-batches
 *
 * Returns all warehouse receipt item batches that are eligible
 * for allocation to a buyer demand. A batch is eligible when:
 *   1. Its parent receipt has status = "approved"
 *   2. Its commodityId matches the requested ?commodityId=
 *   3. It has remaining stock (quantityMt - quantityDispatchedMt > 0)
 *
 * Admin only — this endpoint is called by StockAllocator.
 *
 * Query params:
 *   commodityId  (required) — UUID of the commodity being allocated
 *
 * Response shape per batch:
 *   id                  — receipt item ID (used as receiptItemId in allocation)
 *   receiptRef          — human-readable receipt reference
 *   receiptId           — parent receipt ID
 *   commodityName
 *   warehouseLocation
 *   grade
 *   quantityMt          — original approved quantity
 *   quantityDispatchedMt— already allocated/dispatched
 *   remainingMt         — quantityMt - quantityDispatchedMt
 *   ownerName
 *   ownerEmail
 *   exporterUserId      — the owner's user ID (stored in demandAllocations)
 */
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const commodityId = searchParams.get("commodityId");

  if (!commodityId) {
    return NextResponse.json(
      { error: "commodityId query parameter is required" },
      { status: 400 }
    );
  }

  const rows = await db
    .select({
      // Receipt item fields
      id:                   warehouseReceiptItems.id,
      receiptId:            warehouseReceiptItems.receiptId,
      commodityId:          warehouseReceiptItems.commodityId,
      commodityName:        commodities.name,
      quantityMt:           warehouseReceiptItems.quantityMt,
      quantityDispatchedMt: warehouseReceiptItems.quantityDispatchedMt,
      grade:                warehouseReceiptItems.grade,
      moistureContent:      warehouseReceiptItems.moistureContent,
      impurityLevel:        warehouseReceiptItems.impurityLevel,

      // Parent receipt fields
      receiptRef:           warehouseReceipts.receiptRef,
      warehouseLocation:    warehouseReceipts.warehouseLocation,
      warehouseName:        warehouseReceipts.warehouseName,

      // Owner (exporter/farmer)
      exporterUserId:       warehouseReceipts.ownerId,
      ownerName:            users.name,
      ownerEmail:           users.email,
    })
    .from(warehouseReceiptItems)
    .innerJoin(
      warehouseReceipts,
      eq(warehouseReceiptItems.receiptId, warehouseReceipts.id)
    )
    .leftJoin(
      commodities,
      eq(warehouseReceiptItems.commodityId, commodities.id)
    )
    .leftJoin(
      users,
      eq(warehouseReceipts.ownerId, users.id)
    )
    .where(
      and(
        // Must be an approved receipt
        eq(warehouseReceipts.status, "approved"),
        // Must match the requested commodity
        eq(warehouseReceiptItems.commodityId, commodityId),
        // Must have remaining stock (remaining = quantityMt - quantityDispatchedMt > 0)
        gt(
          sql`${warehouseReceiptItems.quantityMt} - ${warehouseReceiptItems.quantityDispatchedMt}`,
          sql`0`
        )
      )
    )
    .orderBy(warehouseReceipts.arrivedAt, warehouseReceiptItems.grade);

  // Compute remainingMt as a plain number for the client
  const batches = rows.map((row) => ({
    ...row,
    quantityMt:           parseFloat(String(row.quantityMt)),
    quantityDispatchedMt: parseFloat(String(row.quantityDispatchedMt)),
    remainingMt:
      parseFloat(String(row.quantityMt)) -
      parseFloat(String(row.quantityDispatchedMt)),
  }));

  return NextResponse.json({ batches });
}
