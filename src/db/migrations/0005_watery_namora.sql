ALTER TABLE "commodities" ADD COLUMN "is_deleted" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "commodities" ADD COLUMN "deleted_at" timestamp;