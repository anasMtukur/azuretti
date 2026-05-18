import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { newsEvents } from "@/db/schema";

import { eq, and } from "drizzle-orm";

const db = getDb();

export async function GET(_req: NextRequest, { params }: { params: { slug: string } }) {
  const [item] = await db
    .select()
    .from(newsEvents)
    .where(and(eq(newsEvents.slug, params.slug), eq(newsEvents.isPublished, true)))
    .limit(1);

  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(item);
}