import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { commodities } from "@/db/schema";

import { getSession, requireRole } from "@/lib/auth/helpers";

const db = getDb();

const schema = z.object({
  name:             z.string().min(2),
  slug:             z.string().min(2).regex(/^[a-z0-9-]+$/),
  category:         z.enum(["pulses", "grains", "seeds", "nuts", "other"]),
  description:      z.string().optional(),
  origin:           z.string().optional(),
  grades:           z.array(z.string()).optional(),
  packagingOptions: z.array(z.string()).optional(),
  certifications:   z.array(z.string()).optional(),
  minOrderQtyMt:    z.string().optional(),
  isActive:         z.boolean(),
  sortOrder:        z.number().int(),
  factSheetUrl:     z.string().optional().default(""),
});

async function requireAdmin() {
  const session = await getSession();
  return session?.user?.role === "admin";
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!(await requireAdmin()))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });

  console.log('ParsedData', parsed.data);
  await db.update(commodities)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(commodities.id, params.id));

  return NextResponse.json({ message: "Updated." });
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  await requireRole(["admin"]);

  await db
    .update(commodities)
    .set({ isDeleted: true, deletedAt: new Date(), updatedAt: new Date() })
    .where(eq(commodities.id, params.id));

  return Response.json({ success: true });
}
