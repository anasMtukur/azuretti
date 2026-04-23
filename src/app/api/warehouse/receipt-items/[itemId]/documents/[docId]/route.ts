import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { receiptItemDocuments } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth/helpers";
 
const patchSchema = z.object({
  visibleToBuyer: z.boolean(),
});
 
// PATCH — toggle buyer visibility (admin only)
export async function PATCH(
  req: NextRequest,
  { params }: { params: { itemId: string; docId: string } }
) {
  const session = await getSession();
  if (session?.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
 
  const parsed = patchSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }
 
  await db
    .update(receiptItemDocuments)
    .set({ visibleToBuyer: parsed.data.visibleToBuyer })
    .where(eq(receiptItemDocuments.id, params.docId));
 
  return NextResponse.json({ message: "Updated." });
}
 
// DELETE — remove a document (admin only)
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { itemId: string; docId: string } }
) {
  const session = await getSession();
  if (session?.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
 
  await db
    .delete(receiptItemDocuments)
    .where(eq(receiptItemDocuments.id, params.docId));
 
  return NextResponse.json({ message: "Deleted." });
}
