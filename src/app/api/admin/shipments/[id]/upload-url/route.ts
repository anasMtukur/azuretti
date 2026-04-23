/**
 * src/app/api/admin/shipments/[id]/upload-url/route.ts
 *
 * POST — Returns a short-lived presigned PUT URL so the browser
 *        can upload a PDF directly to MinIO without routing the
 *        file through the Next.js server.
 *
 * Flow:
 *   Browser → POST /api/admin/shipments/[id]/upload-url
 *          ← { uploadUrl, key, publicUrl }
 *   Browser → PUT uploadUrl  (file sent directly to MinIO)
 *   Browser → POST /api/admin/shipments/[id]/documents
 *               { docType, fileUrl: publicUrl, fileName, fileSizeBytes }
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth/helpers";
import { getPresignedUploadUrl, buildPublicUrl, BUCKETS } from "@/lib/storage";

const schema = z.object({
  fileName:    z.string().min(1),
  contentType: z.string().default("application/pdf"),
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
    return NextResponse.json(
      { error: parsed.error.errors[0].message },
      { status: 400 }
    );
  }

  const { fileName, contentType } = parsed.data;

  // Sanitise filename and build a unique storage key
  const safe = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const key  = `shipments/${params.id}/${Date.now()}-${safe}`;

  // Generate a 5-minute presigned PUT URL
  const uploadUrl = await getPresignedUploadUrl(
    "shipmentDocs",
    key,
    contentType,
    300
  );

  // The URL we will store in the DB after upload succeeds
  // (direct public URL — MinIO bucket policy controls access)
  const publicUrl = buildPublicUrl(BUCKETS.shipmentDocs, key);

  return NextResponse.json({ uploadUrl, key, publicUrl });
}
