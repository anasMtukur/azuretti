import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { newsEvents } from "@/db/schema";

import { eq, desc, and } from "drizzle-orm";

const db = getDb();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type  = searchParams.get("type") ?? "";
  const limit = parseInt(searchParams.get("limit") ?? "20");

  const conditions: any[] = [eq(newsEvents.isPublished, true)];
  if (type && ["news","event","trade_mission"].includes(type)) {
    conditions.push(eq(newsEvents.type, type));
  }

  const rows = await db
    .select({
      id:          newsEvents.id,
      title:       newsEvents.title,
      slug:        newsEvents.slug,
      type:        newsEvents.type,
      excerpt:     newsEvents.excerpt,
      imageUrl:    newsEvents.imageUrl,
      eventDate:   newsEvents.eventDate,
      location:    newsEvents.location,
      publishedAt: newsEvents.publishedAt,
    })
    .from(newsEvents)
    .where(and(...conditions))
    .orderBy(desc(newsEvents.publishedAt))
    .limit(limit);

  return NextResponse.json({ items: rows });
}