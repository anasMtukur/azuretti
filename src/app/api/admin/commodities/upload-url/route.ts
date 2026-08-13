import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/helpers";
import { BUCKETS, buildPublicUrl, getPresignedUploadUrl } from "@/lib/storage";

export async function POST(req: Request) {
  await requireRole(["admin"]);
  const { fileName, contentType } = await req.json();

  const key = `fact-sheets/${Date.now()}-${fileName}`;
  const result = await getPresignedUploadUrl("public", key, contentType, 300);

  return NextResponse.json({
      uploadUrl:   result,
      key:         key,
      contentType: contentType,
      fileUrl:   buildPublicUrl(BUCKETS.public, key),
    });
}