/**
 * src/app/api/admin/shipments/[id]/documents/route.ts
 *
 * GET  — List all documents attached to a shipment.
 * POST — Upload a new document to a shipment.
 *
 * File storage strategy:
 *   The file is received as multipart/form-data.
 *   In production, upload to Supabase Storage / S3 and store the
 *   public/presigned URL in shipmentDocuments.fileUrl.
 *
 *   For this implementation we store the file URL as received from
 *   the client (the client uploads to storage first and passes back
 *   the URL), which keeps this route simple and avoids streaming
 *   large payloads through the Next.js server.
 *
 *   Client flow:
 *     1. Client calls your storage provider directly to upload the PDF
 *        and receives a public URL back.
 *     2. Client POSTs { docType, fileUrl, fileName, fileSizeBytes, ... }
 *        to this endpoint to register the document in the DB.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { shipmentDocuments, shipments } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth/helpers";

const uploadSchema = z.object({
  docType:       z.enum([
    "commercial_invoice", "bill_of_lading", "certificate_of_origin",
    "phytosanitary_certificate", "weight_certificate", "packing_list",
    "lab_analysis", "insurance_certificate", "customs_declaration", "other",
  ]),
  customLabel:   z.string().optional(),
  fileUrl:       z.string().url("Invalid file URL"),
  fileName:      z.string().min(1),
  fileSizeBytes: z.number().int().positive().optional(),
  versionNote:   z.string().optional(),
});

// GET /api/admin/shipments/[id]/documents
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Buyers can also fetch documents for their own shipments (checked below)
  const docs = await db
    .select()
    .from(shipmentDocuments)
    .where(eq(shipmentDocuments.shipmentId, params.id))
    .orderBy(shipmentDocuments.docType, shipmentDocuments.createdAt);

  return NextResponse.json({ documents: docs });
}

// POST /api/admin/shipments/[id]/documents
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (session?.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden — admin only" }, { status: 403 });
  }

  // Verify shipment exists
  const [shipment] = await db
    .select({ id: shipments.id })
    .from(shipments)
    .where(eq(shipments.id, params.id))
    .limit(1);

  if (!shipment) {
    return NextResponse.json({ error: "Shipment not found" }, { status: 404 });
  }

  const parsed = uploadSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0].message },
      { status: 400 }
    );
  }

  const d = parsed.data;

  if (d.docType === "other" && !d.customLabel) {
    return NextResponse.json(
      { error: "customLabel is required when docType is 'other'" },
      { status: 400 }
    );
  }

  const [doc] = await db
    .insert(shipmentDocuments)
    .values({
      shipmentId:    params.id,
      uploadedBy:    session.user.id,
      docType:       d.docType,
      customLabel:   d.customLabel   ?? null,
      fileUrl:       d.fileUrl,
      fileName:      d.fileName,
      fileSizeBytes: d.fileSizeBytes ?? null,
      versionNote:   d.versionNote   ?? null,
    })
    .returning();

  return NextResponse.json({ id: doc.id }, { status: 201 });
}

// DELETE /api/admin/shipments/[id]/documents/[docId]
// (handle in a separate [docId]/route.ts — pattern shown here for reference)
