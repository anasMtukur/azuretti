import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

declare global {
  // eslint-disable-next-line no-var
  var _pgClient: ReturnType<typeof postgres> | undefined;
}

const DB_SCHEMA = process.env.DB_SCHEMA ?? "public";

function getClient() {
  const url = process.env.DATABASE_URL;

  if (!url) {
    throw new Error("DATABASE_URL environment variable is not set.");
  }

  if (process.env.NODE_ENV === "development") {
    if (!globalThis._pgClient) {
      globalThis._pgClient = postgres(url, {
        max: 10,
        idle_timeout: 20,
        connect_timeout: 10,
        connection: {
          search_path: DB_SCHEMA,
        },
      });
    }

    return globalThis._pgClient;
  }

  return postgres(url, {
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
    connection: {
      search_path: DB_SCHEMA,
    },
  });
}

export function getDb() {
  return drizzle(getClient(), { schema });
}