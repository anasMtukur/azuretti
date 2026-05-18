import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/db";
import { warehouseReceipts, warehouseReceiptItems, users, commodities } from "@/db/schema";

import { eq, desc, count, and, or } from "drizzle-orm";
import { getSession } from "@/lib/auth/helpers";
import { generateReceiptRef, toMetricTonnes } from "@/lib/warehouse";

const db = getDb();
// ── Validation schema ──────────────────────────────────────────────────────
const itemSchema = z.object({
  commodityId:     z.string().uuid(),
  rawQuantity:     z.number().positive(),
  rawUnit:         z.enum(["kg", "lbs", "mt", "sacks"]),
  sacksCount:      z.number().int().positive().optional(),
  avgSackWeightKg: z.number().positive().optional(),
  grade:           z.string().optional(),
  moistureContent: z.number().min(0).max(100).optional(),
  impurityLevel:   z.number().min(0).max(100).optional(),
  inspectionNotes: z.string().optional(),
});

const createSchema = z.object({
  ownerId:           z.string().uuid(),
  warehouseLocation: z.enum(["kano", "abuja", "france", "other"]),
  warehouseName:     z.string().optional(),
  arrivedAt:         z.preprocess((val) => {
                        if (typeof val === "string") {
                        return new Date(val).toISOString();
                        }
                        return val;
                     }, z.string().datetime()),
  notes:             z.string().optional(),
  items:             z.array(itemSchema).min(1, "At least one item is required"),
});

// ── GET /api/warehouse/receipts ────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const page     = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const pageSize = 20;
  const offset   = (page - 1) * pageSize;

  let whereClause;

  if (session.user.role === "admin") {
    // Admin sees everything; can filter by owner or location
    const ownerId  = searchParams.get("ownerId");
    const location = searchParams.get("location");
    const status = searchParams.get("status");
    const conditions = [];
    if (ownerId)  conditions.push(eq(warehouseReceipts.ownerId, ownerId));
    if (location) conditions.push(eq(warehouseReceipts.warehouseLocation, location as any));
    if (status) conditions.push(eq(warehouseReceipts.status, status as any));
    whereClause = conditions.length > 0 ? and(...conditions) : undefined;
  } else {
    // Exporters/farmers only see their own receipts
    whereClause = eq(warehouseReceipts.ownerId, session.user.id);
  }

  //console.log("whereClause", whereClause);

  const [receipts, [{ total }]] = await Promise.all([
    db
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
        ownerName:  users.name,
        ownerEmail: users.email,
      })
      .from(warehouseReceipts)
      .leftJoin(users, eq(warehouseReceipts.ownerId, users.id))
      .where(whereClause)
      .orderBy(desc(warehouseReceipts.arrivedAt))
      .limit(pageSize)
      .offset(offset),

    db
      .select({ total: count() })
      .from(warehouseReceipts)
      .where(whereClause),
  ]);

  return NextResponse.json({ receipts, total, page, pageSize });
}

// ── POST /api/warehouse/receipts ───────────────────────────────────────────
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden — admin only" }, { status: 403 });
  }
  const parsed = createSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0].message },
      { status: 400 }
    );
  }

  const { ownerId, warehouseLocation, warehouseName, arrivedAt, notes, items } = parsed.data;

  // Generate receipt ref — get current count for sequence
  const [{ total }] = await db.select({ total: count() }).from(warehouseReceipts);
  const receiptRef  = generateReceiptRef(warehouseLocation, total + 1);

  // Create receipt + items in a transaction
  const result = await db.transaction(async (tx) => {
    const [receipt] = await tx
      .insert(warehouseReceipts)
      .values({
        receiptRef,
        ownerId,
        agentId:           session.user.id,
        warehouseLocation,
        warehouseName:     warehouseName ?? null,
        status:            "pending_inspection",
        arrivedAt:         arrivedAt ? new Date(arrivedAt) : new Date(),
        notes:             notes ?? null,
      })
      .returning();

    const itemInserts = items.map((item) => {
      const quantityMt = toMetricTonnes(
        item.rawQuantity,
        item.rawUnit,
        item.sacksCount,
        item.avgSackWeightKg
      );
      return {
        receiptId:       receipt.id,
        commodityId:     item.commodityId,
        rawQuantity:     String(item.rawQuantity),
        rawUnit:         item.rawUnit,
        sacksCount:      item.sacksCount ?? null,
        avgSackWeightKg: item.avgSackWeightKg ? String(item.avgSackWeightKg) : null,
        quantityMt:      String(quantityMt.toFixed(6)),
        grade:           item.grade ?? null,
        moistureContent: item.moistureContent ? String(item.moistureContent) : null,
        impurityLevel:   item.impurityLevel   ? String(item.impurityLevel)   : null,
        inspectionNotes: item.inspectionNotes ?? null,
      };
    });

    await tx.insert(warehouseReceiptItems).values(itemInserts);

    return receipt;
  });

  return NextResponse.json({ id: result.id, receiptRef: result.receiptRef }, { status: 201 });
}