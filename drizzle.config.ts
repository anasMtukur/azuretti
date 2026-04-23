import type { Config } from "drizzle-kit";
import { config } from "dotenv";

config({ path: ".env.local" });

const DB_SCHEMA = process.env.DB_SCHEMA ?? "azuretti";

export default {
  schema:    "./src/db/schema.ts",
  out:       "./src/db/migrations",
  dialect:   "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  migrations: {
    table: '__drizzle_migrations',
    schema: process.env.DB_SCHEMA!, 
  },
  schemaFilter: [DB_SCHEMA],
  verbose: true,
  strict:  true,
} satisfies Config;
