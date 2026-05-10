
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { newsEvents } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth/helpers";

const updateSchema = z.object({
  title:       z.string().min(2).optional(),
  type:        z.enum(["news","event","trade_mission"]).optional(),
  excerpt:     z.string().optional().nullable(),
  content:     z.string().optional().nullable(),
  imageUrl:    z.string().url().optional().nullable(),
  eventDate:   z.string().datetime().optional().nullable(),
  location:    z.string().optional().nullable(),
  isPublished: z.boolean().optional(),
});

// GET one
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (session?.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const [item] = await db.select().from(newsEvents).where(eq(newsEvents.id, params.id)).limit(1);
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(item);
}

// PATCH
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (session?.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parsed = updateSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const d = parsed.data;

  // Fetch current to detect publish transition
  const [current] = await db.select({ isPublished: newsEvents.isPublished })
    .from(newsEvents).where(eq(newsEvents.id, params.id)).limit(1);
  if (!current) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const publishedAt =
    d.isPublished === true && !current.isPublished ? new Date() : undefined;

  await db.update(newsEvents).set({
    ...(d.title       !== undefined && { title:       d.title }),
    ...(d.type        !== undefined && { type:        d.type }),
    ...(d.excerpt     !== undefined && { excerpt:     d.excerpt }),
    ...(d.content     !== undefined && { content:     d.content }),
    ...(d.imageUrl    !== undefined && { imageUrl:    d.imageUrl }),
    ...(d.eventDate   !== undefined && { eventDate:   d.eventDate ? new Date(d.eventDate) : null }),
    ...(d.location    !== undefined && { location:    d.location }),
    ...(d.isPublished !== undefined && { isPublished: d.isPublished }),
    ...(publishedAt !== undefined  && { publishedAt }),
    updatedAt: new Date(),
  }).where(eq(newsEvents.id, params.id));

  return NextResponse.json({ message: "Updated." });
}

// DELETE
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (session?.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  await db.delete(newsEvents).where(eq(newsEvents.id, params.id));
  return NextResponse.json({ message: "Deleted." });
}
