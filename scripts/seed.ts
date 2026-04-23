/**
 * scripts/seed.ts
 * ============================================================
 * Seeds the database with:
 *   1. Admin user  (upserted — never duplicated)
 *   2. All commodities  (upserted by slug — safe to re-run)
 *
 * The admin password is read from ADMIN_PASSWORD in .env.local.
 * If not set, the script exits with an error in production.
 * In development a strong default is used and printed to console.
 *
 * Usage:
 *   npm run db:seed
 *
 * Included automatically in:
 *   npm run db:setup   (runs setup-db then seed)
 * ============================================================
 */

import { resolve } from "path";
import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import * as schema from "../src/db/schema";
import { ADMIN_SEED, COMMODITY_SEED } from "../src/db/seed-data";

config({ path: resolve(process.cwd(), ".env.local") });

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("❌  DATABASE_URL is not set in .env.local");
  process.exit(1);
}

const DB_SCHEMA     = process.env.DB_SCHEMA     ?? "azuretti";
const NODE_ENV      = process.env.NODE_ENV       ?? "development";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

// In production the password must be explicitly set
if (!ADMIN_PASSWORD && NODE_ENV === "production") {
  console.error("❌  ADMIN_PASSWORD must be set in production. Aborting seed.");
  process.exit(1);
}

const DEV_FALLBACK_PASSWORD = "Azuretti@Admin2025!";

async function main() {
  const password = ADMIN_PASSWORD ?? DEV_FALLBACK_PASSWORD;

  if (!ADMIN_PASSWORD) {
    console.warn("⚠️   ADMIN_PASSWORD not set — using development default.");
    console.warn(`     Password: ${DEV_FALLBACK_PASSWORD}`);
    console.warn("     Set ADMIN_PASSWORD in .env.local before going to production!\n");
  }

  const client = postgres(url!, {
    max: 1,
    connection: { search_path: DB_SCHEMA },
  });

  const db = drizzle(client, { schema });

  try {
    // ── 1. Admin user ───────────────────────────────────────
    console.log("👤  Seeding admin user...");

    const hashedPassword = await bcrypt.hash(password, 12);

    const existing = await db
      .select({ id: schema.users.id })
      .from(schema.users)
      .where(eq(schema.users.email, ADMIN_SEED.email))
      .limit(1);

    if (existing.length > 0) {
      // Update password and ensure role is admin
      await db
        .update(schema.users)
        .set({
          password:  hashedPassword,
          role:      "admin",
          isActive:  true,
          updatedAt: new Date(),
        })
        .where(eq(schema.users.email, ADMIN_SEED.email));
      console.log(`     ✓ Admin user updated  (${ADMIN_SEED.email})`);
    } else {
      await db.insert(schema.users).values({
        name:     ADMIN_SEED.name,
        email:    ADMIN_SEED.email,
        password: hashedPassword,
        role:     "admin",
        isActive: true,
      });
      console.log(`     ✓ Admin user created  (${ADMIN_SEED.email})`);
    }

    // ── 2. Commodities ──────────────────────────────────────
    console.log("\n🌾  Seeding commodities...");

    for (const commodity of COMMODITY_SEED) {
      const exists = await db
        .select({ id: schema.commodities.id })
        .from(schema.commodities)
        .where(eq(schema.commodities.slug, commodity.slug))
        .limit(1);

      if (exists.length > 0) {
        await db
          .update(schema.commodities)
          .set({
            name:             commodity.name,
            category:         commodity.category,
            description:      commodity.description,
            grades:           commodity.grades,
            packagingOptions: commodity.packagingOptions,
            minOrderQtyMt:    commodity.minOrderQtyMt,
            certifications:   commodity.certifications,
            sortOrder:        commodity.sortOrder,
            updatedAt:        new Date(),
          })
          .where(eq(schema.commodities.slug, commodity.slug));
        console.log(`     ↺  Updated  ${commodity.name}`);
      } else {
        await db.insert(schema.commodities).values({
          name:             commodity.name,
          slug:             commodity.slug,
          category:         commodity.category,
          description:      commodity.description,
          origin:           "Nigeria",
          grades:           commodity.grades,
          packagingOptions: commodity.packagingOptions,
          minOrderQtyMt:    commodity.minOrderQtyMt,
          certifications:   commodity.certifications,
          isActive:         true,
          sortOrder:        commodity.sortOrder,
        });
        console.log(`     ✓  Inserted ${commodity.name}`);
      }
    }

    console.log(`\n✅  Seed complete — ${COMMODITY_SEED.length} commodities, 1 admin user.`);
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error("\n❌  Seed failed:", err.message ?? err);
  process.exit(1);
});