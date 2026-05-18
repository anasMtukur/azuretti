/**
 * src/app/api/admin/shipments/[id]/status/route.ts
 *
 * POST — Log a new status event for a shipment and update the
 *         current status on the shipments row.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/db";
import { shipments, shipmentStatusEvents } from "@/db/schema";

import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth/helpers";

const db = getDb();

const schema = z.object({
  status:    z.enum(["booked", "loaded", "in_transit", "delivered", "cancelled"]),
  note:      z.string().optional(),
  eventDate: z.string().min(1, "Event date is required"),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (session?.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const { status, note, eventDate } = parsed.data;

  const [shipment] = await db
    .select({ id: shipments.id })
    .from(shipments)
    .where(eq(shipments.id, params.id))
    .limit(1);

  if (!shipment) {
    return NextResponse.json({ error: "Shipment not found" }, { status: 404 });
  }

  await db.transaction(async (tx) => {
    // Log the event
    await tx.insert(shipmentStatusEvents).values({
      shipmentId: params.id,
      loggedBy:   session.user.id,
      status,
      note:       note ?? null,
      eventDate:  new Date(eventDate),
    });

    // Update the current status on the shipment
    await tx.update(shipments)
      .set({ status, updatedAt: new Date() })
      .where(eq(shipments.id, params.id));
  });

  return NextResponse.json({ message: "Status updated." });
}

// GET — list all status events for a shipment
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const events = await db
    .select()
    .from(shipmentStatusEvents)
    .where(eq(shipmentStatusEvents.shipmentId, params.id))
    .orderBy(shipmentStatusEvents.eventDate);

  return NextResponse.json({ events });
}