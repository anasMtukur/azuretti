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
  { params }: { params: { itemId: string } }
) {
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
  const key  = `receipt-items/${params.itemId}/${Date.now()}-${safe}`;
 
  const result = await getPresignedUploadUrl("warehouseDocs", key, contentType, 300);
 
  return NextResponse.json({
    uploadUrl:   result,
    key:         key,
    contentType: contentType,
    publicUrl:   buildPublicUrl(BUCKETS.warehouseDocs, key),
  });
}