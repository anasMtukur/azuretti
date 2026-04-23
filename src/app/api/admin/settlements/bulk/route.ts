/**
 * src/app/api/admin/settlements/bulk/route.ts
 *
 * PATCH — Bulk-update settlementStatus for all dispatched
 *         allocations belonging to a given exporter.
 *
 * Body: { exporterUserId, settlementStatus, settlementRef?, settlementNotes? }
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { demandAllocations } from "@/db/schema";
import { and, eq, sql } from "drizzle-orm";
import { getSession } from "@/lib/auth/helpers";

const schema = z.object({
  exporterUserId:   z.string().uuid(),
  settlementStatus: z.enum(["pending", "processing", "settled"]),
  settlementRef:    z.string().optional(),
  settlementNotes:  z.string().optional(),
});

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (session?.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0].message },
      { status: 400 }
    );
  }

  const { exporterUserId, settlementStatus, settlementRef, settlementNotes } = parsed.data;

  await db
    .update(demandAllocations)
    .set({
      settlementStatus,
      settledAt:       settlementStatus === "settled" ? new Date() : null,
      settlementRef:   settlementRef    ?? null,
      settlementNotes: settlementNotes  ?? null,
      updatedAt:       new Date(),
    })
    .where(
      and(
        eq(demandAllocations.exporterUserId, exporterUserId),
        // Only update dispatched allocations
        sql`${demandAllocations.status} = 'dispatched'`
      )
    );

  return NextResponse.json({ message: "Settlement status updated." });
}
