/**
 * src/app/api/admin/settlements/[allocationId]/route.ts
 *
 * PATCH — Admin marks a single demandAllocation as settled
 *         (i.e. the exporter/farmer has been paid their portion).
 *
 * Body: { settlementStatus, settlementRef?, settlementNotes? }
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/db";
import { demandAllocations } from "@/db/schema";

import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth/helpers";

const db = getDb();

const schema = z.object({
  settlementStatus: z.enum(["pending", "processing", "settled"]),
  settlementRef:    z.string().optional(),
  settlementNotes:  z.string().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { allocationId: string } }
) {
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

  const { settlementStatus, settlementRef, settlementNotes } = parsed.data;

  await db
    .update(demandAllocations)
    .set({
      settlementStatus,
      settledAt:       settlementStatus === "settled" ? new Date() : null,
      settlementRef:   settlementRef    ?? null,
      settlementNotes: settlementNotes  ?? null,
      updatedAt:       new Date(),
    })
    .where(eq(demandAllocations.id, params.allocationId));

  return NextResponse.json({ message: "Settlement status updated." });
}
