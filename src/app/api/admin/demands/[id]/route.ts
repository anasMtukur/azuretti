import { db } from "@/db";
import { demandRequests } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  // Admin can update: status, adminNotes
  const { status, adminNotes } = await req.json();
  await db.update(demandRequests).set({
    ...(status ? { status } : {}),
    ...(adminNotes !== undefined ? { adminNotes } : {}),
    updatedAt: new Date(),
  }).where(eq(demandRequests.id, params.id));
  return NextResponse.json({ message: "Updated." });
}