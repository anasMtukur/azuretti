CREATE TYPE "public"."admin_role" AS ENUM('system_admin', 'warehouse_manager', 'content_manager', 'finance_manager');--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "admin_role" "admin_role";