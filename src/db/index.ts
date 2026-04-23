import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

/**
 * Database connection
 * ============================================================
 * Uses the DATABASE_URL environment variable.
 * search_path is set to "azuretti" so all queries resolve
 * against that schema instead of the default "public".
 * ============================================================
 */

declare global {
  // eslint-disable-next-line no-var
  var _pgClient: ReturnType<typeof postgres> | undefined;
}

const DB_SCHEMA = process.env.DB_SCHEMA ?? "public";

function createClient() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL environment variable is not set. " +
        "Copy .env.example to .env.local and fill in your values."
    );
  }

  return postgres(url, {
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
    // Sets search_path for every connection in the pool so all
    // unqualified table/type references resolve to our schema.
    connection: {
      search_path: DB_SCHEMA,
    },
  });
}

// Singleton pattern for Next.js development hot-reloading
const client =
  process.env.NODE_ENV === "development"
    ? (globalThis._pgClient ?? (globalThis._pgClient = createClient()))
    : createClient();

export const db = drizzle(client, { schema });

export type Database = typeof db;