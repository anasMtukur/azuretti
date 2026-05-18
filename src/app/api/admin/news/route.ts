import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/db";
import { newsEvents } from "@/db/schema";

import { eq, desc, ilike, or, and } from "drizzle-orm";
import { getSession } from "@/lib/auth/helpers";

const db = getDb();

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const createSchema = z.object({
  title:       z.string().min(2, "Title is required"),
  type:        z.enum(["news", "event", "trade_mission"]),
  excerpt:     z.string().optional(),
  content:     z.string().optional(),
  imageUrl:    z.string().url().optional().nullable(),
  eventDate:   z.string().datetime().optional().nullable(),
  location:    z.string().optional().nullable(),
  isPublished: z.boolean().default(false),
  // Slug is auto-generated from title unless explicitly provided
  slug:        z.string().optional(),
});

// GET — list all (admin sees draft + published; public API filters isPublished)
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (session?.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const q    = searchParams.get("q")?.trim() ?? "";
  const type = searchParams.get("type") ?? "";

  const conditions: any[] = [];
  if (q) {
    conditions.push(
      or(ilike(newsEvents.title, `%${q}%`), ilike(newsEvents.excerpt, `%${q}%`))
    );
  }
  if (type && ["news","event","trade_mission"].includes(type)) {
    conditions.push(eq(newsEvents.type, type));
  }

  const rows = await db
    .select()
    .from(newsEvents)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(newsEvents.createdAt));

  return NextResponse.json({ items: rows });
}

// POST — create
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (session?.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parsed = createSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const d = parsed.data;
  const baseSlug = d.slug ? slugify(d.slug) : slugify(d.title);

  // Ensure slug uniqueness by appending a timestamp suffix if needed
  const [existing] = await db
    .select({ id: newsEvents.id })
    .from(newsEvents)
    .where(eq(newsEvents.slug, baseSlug))
    .limit(1);

  const slug = existing ? `${baseSlug}-${Date.now()}` : baseSlug;

  const [item] = await db.insert(newsEvents).values({
    title:       d.title,
    slug,
    type:        d.type,
    excerpt:     d.excerpt     ?? null,
    content:     d.content     ?? null,
    imageUrl:    d.imageUrl    ?? null,
    eventDate:   d.eventDate   ? new Date(d.eventDate) : null,
    location:    d.location    ?? null,
    isPublished: d.isPublished,
    publishedAt: d.isPublished ? new Date() : null,
  }).returning();

  return NextResponse.json({ id: item.id, slug: item.slug }, { status: 201 });
}