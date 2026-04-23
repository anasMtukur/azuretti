import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth/helpers";
import { getPresignedUploadUrl, buildPublicUrl, BUCKETS } from "@/lib/storage";

const schema = z.object({
  fileName:    z.string().min(1),
  contentType: z.enum(["image/jpeg", "image/png", "application/pdf"]),
});

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (session?.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const { fileName, contentType } = parsed.data;
  const safe = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const key  = `proofs/payments/${Date.now()}-${safe}`;

  const result = await getPresignedUploadUrl("public", key, contentType, 300);

  return NextResponse.json({
    uploadUrl:   result,
    key:         key,
    contentType: contentType,
    publicUrl:   buildPublicUrl(BUCKETS.public, key),
  });
}





// ──────────────────────────────────────────────────────────────
// Schema addition for payments table
// Add this column to the payments table in src/db/schema.ts:
//
//   proofOfPaymentUrl: text("proof_of_payment_url"),
//
// And for demandAllocations (settlement proof):
//
//   settlementProofUrl: text("settlement_proof_url"),
// ──────────────────────────────────────────────────────────────