import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { commodities } from "@/db/schema";
import { getSession } from "@/lib/auth/helpers";

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
  isActive:         z.boolean().default(true),
  sortOrder:        z.number().int().default(0),
});

async function requireAdmin() {
  const session = await getSession();
  return session?.user?.role === "admin";
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin()))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });

  const [created] = await db.insert(commodities).values({
    ...parsed.data,
    minOrderQtyMt: parsed.data.minOrderQtyMt ?? null,
  }).returning({ id: commodities.id });

  return NextResponse.json({ id: created.id }, { status: 201 });
}