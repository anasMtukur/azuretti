/**
 * src/app/api/admin/shipments/route.ts
 *
 * POST — Create a shipment record linked to a fulfilled demand.
 * GET  — List all shipments (admin).
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { shipments, demandRequests, payments } from "@/db/schema";
import { eq, count, desc } from "drizzle-orm";
import { getSession } from "@/lib/auth/helpers";
import { generateShipmentRef } from "@/lib/payments";

const createSchema = z.object({
  demandId:         z.string().uuid(),
  paymentId:        z.string().uuid().optional(),
  exporterId:       z.string().uuid().optional(),
  buyerId:          z.string().uuid().optional(),
  commodityId:      z.string().uuid().optional(),
  quantityMt:       z.number().positive(),
  originPort:       z.string().optional(),
  destinationPort:  z.string().optional(),
  departureDate:    z.string().datetime().optional(),
  estimatedArrival: z.string().datetime().optional(),
  notes:            z.string().optional(),
});

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (session?.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parsed = createSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0].message },
      { status: 400 }
    );
  }

  const d = parsed.data;

  // Verify demand is fulfilled (payment confirmed)
  const [demand] = await db
    .select({ status: demandRequests.status })
    .from(demandRequests)
    .where(eq(demandRequests.id, d.demandId))
    .limit(1);

  if (!demand) {
    return NextResponse.json({ error: "Demand not found" }, { status: 404 });
  }
  if (demand.status !== "fulfilled") {
    return NextResponse.json(
      { error: "Payment must be confirmed before creating a shipment" },
      { status: 400 }
    );
  }

  const [{ total }] = await db.select({ total: count() }).from(shipments);
  const shipmentRef = generateShipmentRef(total + 1);

  const [shipment] = await db
    .insert(shipments)
    .values({
      shipmentRef,
      demandId:        d.demandId,
      paymentId:       d.paymentId       ?? null,
      exporterId:      d.exporterId      ?? null,
      buyerId:         d.buyerId         ?? null,
      commodityId:     d.commodityId     ?? null,
      quantityMt:      String(d.quantityMt),
      originPort:      d.originPort      ?? null,
      destinationPort: d.destinationPort ?? null,
      status:          "booked",
      departureDate:   d.departureDate    ? new Date(d.departureDate)    : null,
      estimatedArrival:d.estimatedArrival ? new Date(d.estimatedArrival) : null,
      notes:           d.notes           ?? null,
    })
    .returning();

  return NextResponse.json(
    { id: shipment.id, shipmentRef: shipment.shipmentRef },
    { status: 201 }
  );
}

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (session?.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const rows = await db
    .select()
    .from(shipments)
    .orderBy(desc(shipments.createdAt));

  return NextResponse.json({ shipments: rows });
}
