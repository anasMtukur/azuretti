import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/db";
import {
  demandRequests, demandAllocations, warehouseReceiptItems,
} from "@/db/schema";

import { eq, sql } from "drizzle-orm";
import { getSession } from "@/lib/auth/helpers";

const db = getDb();

const allocationSchema = z.object({
  allocations: z.array(z.object({
    receiptItemId:  z.string().uuid(),
    exporterUserId: z.string().uuid(),
    allocatedMt:    z.number().positive(),
    pricePerMt:     z.number().positive().optional(),
    currency:       z.string().default("EUR"),
    notes:          z.string().optional(),
  })).min(1),
});

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (session?.user.role !== "admin")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const parsed = allocationSchema.safeParse(await req.json());
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });

  const [demand] = await db.select()
    .from(demandRequests).where(eq(demandRequests.id, params.id)).limit(1);
  if (!demand)
    return NextResponse.json({ error: "Demand not found" }, { status: 404 });
  if (!["accepted", "under_review"].includes(demand.status))
    return NextResponse.json({ error: "Demand must be accepted before allocation" }, { status: 400 });

  await db.transaction(async (tx) => {
    // Delete any prior allocations (allow re-allocation)
    await tx.delete(demandAllocations).where(eq(demandAllocations.demandId, params.id));

    for (const alloc of parsed.data.allocations) {
      const allocationAmount = alloc.pricePerMt
        ? String((alloc.allocatedMt * alloc.pricePerMt).toFixed(2))
        : null;

      await tx.insert(demandAllocations).values({
        demandId:          params.id,
        receiptItemId:     alloc.receiptItemId,
        exporterUserId:    alloc.exporterUserId,
        allocatedMt:       String(alloc.allocatedMt),
        pricePerMt:        alloc.pricePerMt ? String(alloc.pricePerMt) : null,
        currency:          alloc.currency,
        allocationAmount,
        notes:             alloc.notes ?? null,
        status:            "pending",
      });

      // Increment quantityDispatchedMt on the receipt item (reserve stock)
      await tx.update(warehouseReceiptItems).set({
        quantityDispatchedMt: sql`quantity_dispatched_mt + ${alloc.allocatedMt}`,
        updatedAt: new Date(),
      }).where(eq(warehouseReceiptItems.id, alloc.receiptItemId));
    }

    await tx.update(demandRequests).set({
      status: "allocated", updatedAt: new Date(),
    }).where(eq(demandRequests.id, params.id));
  });

  return NextResponse.json({ message: "Stock allocated successfully." });
}
