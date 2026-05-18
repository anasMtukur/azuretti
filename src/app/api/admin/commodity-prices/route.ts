/**
 * src/app/api/admin/commodity-prices/route.ts
 *
 * POST — Save a batch of commodity price entries.
 *        For each entry, looks up the most recent prior price for the
 *        same (commodityId, market, currency) triple, computes the
 *        signed difference and stores it as a formatted string.
 *
 * GET  — Return the latest price per commodity (one row per commodity,
 *        the most recent recordedAt wins). Used by the price ticker.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/db";
import { commodityPrices, commodities } from "@/db/schema";

import { eq, desc, and } from "drizzle-orm";
import { getSession } from "@/lib/auth/helpers";

const db = getDb();
// ── Validation ─────────────────────────────────────────────────────────────

const entrySchema = z.object({
  commodityId: z.string().uuid(),
  pricePerKg:  z.number().positive("Price must be positive"),
  market:      z.string().min(1, "Market is required"),
  state:       z.string().optional(),
  currency:    z.enum(["NGN", "EUR", "USD"]).default("NGN"),
  source:      z.string().optional(),
});

const batchSchema = z.object({
  entries:    z.array(entrySchema).min(1),
  recordedAt: z.string().datetime().optional(), // defaults to now
});

// ── Helpers ────────────────────────────────────────────────────────────────

/**
 * Format a signed price difference as a string.
 * Examples: 300 → "+300", -45.5 → "-45.50", 0 → "0"
 */
function formatChange(diff: number): string {
  if (diff === 0) return "0";
  const abs = Math.abs(diff);
  // Show up to 2 decimal places, strip trailing zeros
  const formatted = abs % 1 === 0 ? String(abs) : abs.toFixed(2).replace(/\.?0+$/, "");
  return diff > 0 ? `+${formatted}` : `-${formatted}`;
}

// ── POST ───────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (session?.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parsed = batchSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0].message },
      { status: 400 }
    );
  }

  const { entries, recordedAt } = parsed.data;
  const timestamp = recordedAt ? new Date(recordedAt) : new Date();
  const saved: { commodityId: string; pricePerKg: number; priceChange: string | null }[] = [];

  await db.transaction(async (tx) => {
    for (const entry of entries) {
      // Look up the most recent prior price for this commodity + market + currency
      const [prior] = await tx
        .select({ pricePerKg: commodityPrices.pricePerKg })
        .from(commodityPrices)
        .where(
          and(
            eq(commodityPrices.commodityId, entry.commodityId),
            eq(commodityPrices.market,      entry.market),
            eq(commodityPrices.currency,    entry.currency),
          )
        )
        .orderBy(desc(commodityPrices.recordedAt))
        .limit(1);

      const priorPrice = prior ? parseFloat(String(prior.pricePerKg)) : null;
      const newPrice   = entry.pricePerKg;

      const priceChange = priorPrice !== null
        ? formatChange(newPrice - priorPrice)
        : null; // first entry — no prior to compare

      await tx.insert(commodityPrices).values({
        commodityId: entry.commodityId,
        pricePerKg:  String(entry.pricePerKg),
        market:      entry.market,
        state:       entry.state     ?? null,
        currency:    entry.currency,
        source:      entry.source    ?? null,
        priceChange,
        recordedAt:  timestamp,
      });

      saved.push({ commodityId: entry.commodityId, pricePerKg: newPrice, priceChange });
    }
  });

  return NextResponse.json({ saved, count: saved.length }, { status: 201 });
}

// ── GET ────────────────────────────────────────────────────────────────────

export async function GET() {
  // Return the single most recent price row per commodity
  // Using a lateral-style subquery via Drizzle's raw SQL for the
  // "latest per group" pattern.
  const rows = await db
    .selectDistinctOn([commodityPrices.commodityId], {
      commodityId:  commodityPrices.commodityId,
      commodityName:commodities.name,
      commoditySlug:commodities.slug,
      category:     commodities.category,
      pricePerKg:   commodityPrices.pricePerKg,
      priceChange:  (commodityPrices as any).priceChange,
      market:       commodityPrices.market,
      state:        commodityPrices.state,
      currency:     commodityPrices.currency,
      recordedAt:   commodityPrices.recordedAt,
    })
    .from(commodityPrices)
    .leftJoin(commodities, eq(commodityPrices.commodityId, commodities.id))
    .orderBy(commodityPrices.commodityId, desc(commodityPrices.recordedAt));

  return NextResponse.json({ prices: rows });
}
