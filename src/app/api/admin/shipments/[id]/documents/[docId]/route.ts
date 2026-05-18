import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/helpers";
import { eq } from "drizzle-orm";
import { deleteFile, parseStoredUrl } from "@/lib/storage";
import { getDb } from "@/db";
import { shipmentDocuments } from "@/db/schema";

const db = getDb();

export async function DELETE(
  req: NextRequest,
  { params }: { params: { docId: string } } // this is docId
) {
  // ── Auth ─────────────────────────────────────────────
  const session = await getSession();
  if (session?.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden — admin only" }, { status: 403 });
  }

  // ── Fetch document ───────────────────────────────────
  const [doc] = await db
    .select({
      id: shipmentDocuments.id,
      fileUrl: shipmentDocuments.fileUrl,
    })
    .from(shipmentDocuments)
    .where(eq(shipmentDocuments.id, params.docId))
    .limit(1);

  if (!doc) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  // ── Parse URL → bucket + key ─────────────────────────
  const parsed = parseStoredUrl(doc.fileUrl);

  if (!parsed) {
    return NextResponse.json(
      { error: "Invalid stored file URL" },
      { status: 400 }
    );
  }

  const { bucket, key } = parsed;

  // ── Delete from MinIO ────────────────────────────────
  try {
    await deleteFile(bucket, key);
  } catch (err) {
    console.error("MinIO delete failed:", err);
    return NextResponse.json(
      { error: "Failed to delete file from storage" },
      { status: 500 }
    );
  }

  // ── Delete from DB ───────────────────────────────────
  await db
    .delete(shipmentDocuments)
    .where(eq(shipmentDocuments.id, params.docId));

  return NextResponse.json({ success: true });
}