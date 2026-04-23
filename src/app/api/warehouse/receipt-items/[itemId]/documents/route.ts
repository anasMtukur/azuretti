import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { receiptItemDocuments, warehouseReceiptItems, warehouseReceipts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth/helpers";
 
const createSchema = z.object({
  docType:       z.enum([
    "test_result","certificate_of_analysis","phytosanitary",
    "certificate_of_origin","moisture_report","other",
  ]),
  customLabel:   z.string().optional(),
  fileUrl:       z.string().url(),
  fileName:      z.string().min(1),
  fileSizeBytes: z.number().int().positive().optional(),
});
 
// GET — list docs for this item (admin always, buyer only if visibleToBuyer)
export async function GET(
  _req: NextRequest,
  { params }: { params: { itemId: string } }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
 
  const docsQuery = db
    .select()
    .from(receiptItemDocuments)
    .where(eq(receiptItemDocuments.receiptItemId, params.itemId))
    .orderBy(receiptItemDocuments.createdAt);
 
  const docs = await docsQuery;
 
  // Buyers only see documents marked visibleToBuyer
  const filtered = session.user.role === "admin"
    ? docs
    : docs.filter(d => d.visibleToBuyer);
 
  return NextResponse.json({ documents: filtered });
}
 
// POST — upload a new document (admin only)
export async function POST(
  req: NextRequest,
  { params }: { params: { itemId: string } }
) {
  const session = await getSession();
  if (session?.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
 
  const parsed = createSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }
 
  const d = parsed.data;
 
  if (d.docType === "other" && !d.customLabel) {
    return NextResponse.json(
      { error: "customLabel is required when docType is 'other'" },
      { status: 400 }
    );
  }
 
  const [doc] = await db.insert(receiptItemDocuments).values({
    receiptItemId:  params.itemId,
    uploadedBy:     session.user.id,
    docType:        d.docType,
    customLabel:    d.customLabel ?? null,
    fileUrl:        d.fileUrl,
    fileName:       d.fileName,
    fileSizeBytes:  d.fileSizeBytes ?? null,
    visibleToBuyer: false,  // hidden by default; admin toggles it on
  }).returning();
 
  return NextResponse.json({ id: doc.id }, { status: 201 });
}