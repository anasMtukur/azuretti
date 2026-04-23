/**
 * scripts/setup-db.ts
 * ============================================================
 * Safe database setup in three ordered steps:
 *
 *   1. Create schema + all enum types  (idempotent)
 *   2. drizzle-kit generate            (writes SQL migration files)
 *   3. drizzle-kit migrate             (applies them in order)
 *
 * Usage:
 *   npm run db:setup             (generate + migrate — recommended)
 *   npm run db:setup -- --push   (use drizzle-kit push instead)
 * ============================================================
 */

import { resolve } from "path";
import { config } from "dotenv";
import postgres from "postgres";
import { execSync } from "child_process";

config({ path: resolve(process.cwd(), ".env.local") });

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("❌  DATABASE_URL is not set in .env.local");
  process.exit(1);
}

const DB_SCHEMA = process.env.DB_SCHEMA ?? "public";
const usePush   = process.argv.includes("--push");

// All enums with their values — edit here if the schema changes
const enums: Array<{ name: string; values: string[] }> = [
  { name: "user_role",          values: ["admin", "exporter", "buyer", "investor", "farmer"] },
  { name: "shipment_status",    values: ["booked", "loaded", "in_transit", "delivered", "cancelled"] },
  { name: "payment_status",     values: ["unpaid", "partial", "paid"] },
  { name: "offer_status",       values: ["pending", "approved", "rejected", "fulfilled"] },
  { name: "demand_status",      values: ["pending", "under_review", "matched", "fulfilled", "cancelled"] },
  { name: "commodity_category", values: ["pulses", "grains", "seeds", "nuts", "other"] },
  { name: "training_type",      values: ["virtual", "physical"] },
  { name: "partnership_type",   values: ["exporter", "investor", "farmer", "institutional"] },
  { name: "receipt_status",     values: ["pending_inspection", "inspected", "approved", "rejected", "dispatched", "partial_dispatch"] },
  { name: "weight_unit",        values: ["kg", "lbs", "mt", "sacks"] },
  { name: "warehouse_location", values: ["kano", "abuja", "france", "other"] },
  { name: "demand_request_status", values: [
      "draft","submitted","under_review","quoted",
      "accepted","rejected","allocated","fulfilled","cancelled"
  ]},
  { name: "quote_qty_lock",           values: ["locked","min_qty","open"] },
  { name: "demand_allocation_status", values: ["pending","confirmed","dispatched"] },
  { name: "payment_method", values: [
      "wire_transfer","swift","lc","documentary_collection","cash_advance","other"
  ]},
  { name: "settlement_status", values: ["pending","processing","settled"] },
  { name: "shipment_doc_type", values: [
      "commercial_invoice","bill_of_lading","certificate_of_origin",
      "phytosanitary_certificate","weight_certificate","packing_list",
      "lab_analysis","insurance_certificate","customs_declaration","other"
  ]},
  { name: "receipt_item_doc_type", values: [
      "test_result","certificate_of_analysis","phytosanitary",
      "certificate_of_origin","moisture_report","other"
  ]},
];

async function main() {
  // ── Step 1: Schema + Enums ──────────────────────────────────
  console.log(`🔧  Step 1 — Setting up schema "${DB_SCHEMA}" and enum types...`);

  const client = postgres(url!, { max: 1, onnotice: () => {} });

  /* try {
    // 1a. Create the schema
    await client.unsafe(`CREATE SCHEMA IF NOT EXISTS "${DB_SCHEMA}"`);
    console.log(`     ✓ Schema "${DB_SCHEMA}" ready.`);

    // 1b. Create each enum — skip silently if it already exists (42710)
    for (const { name, values } of enums) {
      const literals = values.map((v) => `'${v}'`).join(", ");
      try {
        await client.unsafe(
          `CREATE TYPE "${DB_SCHEMA}"."${name}" AS ENUM (${literals})`
        );
        console.log(`     ✓ Created type ${name}`);
      } catch (err: any) {
        if (err.code === "42710") {
          console.log(`     – Type ${name} already exists, skipping.`);
        } else {
          throw err;
        }
      }
    }

    console.log("✅  Schema and enums ready.\n");
  } finally {
    await client.end();
  }  */

  // ── Step 2 & 3: Schema sync ─────────────────────────────────
  if (usePush) {
    console.log("🔧  Step 2 — Pushing schema (drizzle-kit push)...");
    execSync("npx drizzle-kit push", { stdio: "inherit" });
  } else {
    console.log("🔧  Step 2 — Generating migration files...");
    //execSync("npx drizzle-kit generate", { stdio: "inherit" });

    console.log("\n🔧  Step 3 — Applying migrations...");
    execSync("npx drizzle-kit migrate", { stdio: "inherit" });
  }

  try {
    console.log("\n🔧 Step 4 — Seeding database...");
    execSync("npm run db:seed", { stdio: "inherit" });
  } catch (err: any) {
    console.error("\n❌  Seeding failed:", err.message ?? err);
  }

  console.log("\n✅  Database setup complete.");
}

main().catch((err) => {
  console.error("\n❌  Setup failed:", err.message ?? err);
  process.exit(1);
});