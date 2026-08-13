import { getDb } from "@/db";
import { warehouseReceiptItems, demandAllocations, shipments, commodities } from "@/db/schema";
import { eq, sum, and } from "drizzle-orm";

const db = getDb();

export async function getCommodityStats(commodityId: string) {
  // Total stock in warehouse (approved receipts, not yet dispatched)
  const stockResult = await db
    .select({
      totalMt: sum(warehouseReceiptItems.quantityMt),
      dispatchedMt: sum(warehouseReceiptItems.quantityDispatchedMt),
    })
    .from(warehouseReceiptItems)
    .where(eq(warehouseReceiptItems.commodityId, commodityId));

  const totalMt      = Number(stockResult[0]?.totalMt ?? 0);
  const dispatchedMt = Number(stockResult[0]?.dispatchedMt ?? 0);
  const availableMt  = totalMt - dispatchedMt;

  // Total shipped (shipments with this commodity that are delivered)
  const shippedResult = await db
    .select({ total: sum(shipments.quantityMt) })
    .from(shipments)
    .where(and(eq(shipments.commodityId, commodityId), eq(shipments.status, "delivered")));

  const totalShippedMt = Number(shippedResult[0]?.total ?? 0);

  // Total sold (demand allocations that are dispatched/settled)
  const soldResult = await db
    .select({ total: sum(demandAllocations.allocatedMt) })
    .from(demandAllocations)
    .where(eq(demandAllocations.status, "dispatched"));

  const totalSoldMt = Number(soldResult[0]?.total ?? 0);

  return { availableMt, totalShippedMt, totalSoldMt };
}