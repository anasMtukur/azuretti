import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { warehouseReceipts, warehouseReceiptItems, users, commodities } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getSession } from "@/lib/auth/helpers";

// ── GET /api/warehouse/receipts/[id] ──────────────────────────────────────
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [receipt] = await db
    .select({
      id:                warehouseReceipts.id,
      receiptRef:        warehouseReceipts.receiptRef,
      status:            warehouseReceipts.status,
      warehouseLocation: warehouseReceipts.warehouseLocation,
      warehouseName:     warehouseReceipts.warehouseName,
      arrivedAt:         warehouseReceipts.arrivedAt,
      inspectedAt:       warehouseReceipts.inspectedAt,
      approvedAt:        warehouseReceipts.approvedAt,
      notes:             warehouseReceipts.notes,
      createdAt:         warehouseReceipts.createdAt,
      ownerName:         users.name,
      ownerEmail:        users.email,
      ownerId:           warehouseReceipts.ownerId,
      agentId:           warehouseReceipts.agentId,
    })
    .from(warehouseReceipts)
    .leftJoin(users, eq(warehouseReceipts.ownerId, users.id))
    .where(eq(warehouseReceipts.id, params.id))
    .limit(1);

  if (!receipt) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Exporters can only see their own receipts
  if (session.user.role !== "admin" && receipt.ownerId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const items = await db
    .select({
      id:              warehouseReceiptItems.id,
      commodityId:     warehouseReceiptItems.commodityId,
      commodityName:   commodities.name,
      commoditySlug:   commodities.slug,
      rawQuantity:     warehouseReceiptItems.rawQuantity,
      rawUnit:         warehouseReceiptItems.rawUnit,
      sacksCount:      warehouseReceiptItems.sacksCount,
      avgSackWeightKg: warehouseReceiptItems.avgSackWeightKg,
      quantityMt:      warehouseReceiptItems.quantityMt,
      quantityDispatchedMt: warehouseReceiptItems.quantityDispatchedMt,
      grade:           warehouseReceiptItems.grade,
      moistureContent: warehouseReceiptItems.moistureContent,
      impurityLevel:   warehouseReceiptItems.impurityLevel,
      inspectionNotes: warehouseReceiptItems.inspectionNotes,
      createdAt:       warehouseReceiptItems.createdAt,
    })
    .from(warehouseReceiptItems)
    .leftJoin(commodities, eq(warehouseReceiptItems.commodityId, commodities.id))
    .where(eq(warehouseReceiptItems.receiptId, params.id));

  return NextResponse.json({ ...receipt, items });
}

// ── PATCH /api/warehouse/receipts/[id] ────────────────────────────────────
// Used by agents/admins to update status and inspection details

const patchSchema = z.object({
  status:          z.enum(["pending_inspection", "inspected", "approved", "rejected", "dispatched", "partial_dispatch"]).optional(),
  notes:           z.string().optional(),
  warehouseName:   z.string().optional(),
  // Item inspection updates keyed by item ID
  itemUpdates:     z.array(z.object({
    id:              z.string().uuid(),
    grade:           z.string().optional(),
    moistureContent: z.number().min(0).max(100).optional(),
    impurityLevel:   z.number().min(0).max(100).optional(),
    inspectionNotes: z.string().optional(),
  })).optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parsed = patchSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const { status, notes, warehouseName, itemUpdates } = parsed.data;

  await db.transaction(async (tx) => {
    // Build receipt update payload
    const receiptUpdate: Record<string, unknown> = { updatedAt: new Date() };
    if (status !== undefined) {
      receiptUpdate.status = status;
      if (status === "inspected") receiptUpdate.inspectedAt = new Date();
      if (status === "approved")  receiptUpdate.approvedAt  = new Date();
    }
    if (notes         !== undefined) receiptUpdate.notes         = notes;
    if (warehouseName !== undefined) receiptUpdate.warehouseName = warehouseName;

    await tx
      .update(warehouseReceipts)
      .set(receiptUpdate)
      .where(eq(warehouseReceipts.id, params.id));

    // Update individual item inspection data
    if (itemUpdates?.length) {
      for (const item of itemUpdates) {
        const itemUpdate: Record<string, unknown> = { updatedAt: new Date() };
        if (item.grade           !== undefined) itemUpdate.grade           = item.grade;
        if (item.moistureContent !== undefined) itemUpdate.moistureContent = String(item.moistureContent);
        if (item.impurityLevel   !== undefined) itemUpdate.impurityLevel   = String(item.impurityLevel);
        if (item.inspectionNotes !== undefined) itemUpdate.inspectionNotes = item.inspectionNotes;

        await tx
          .update(warehouseReceiptItems)
          .set(itemUpdate)
          .where(
            and(
              eq(warehouseReceiptItems.id, item.id),
              eq(warehouseReceiptItems.receiptId, params.id)
            )
          );
      }
    }
  });

  return NextResponse.json({ message: "Updated." });
}