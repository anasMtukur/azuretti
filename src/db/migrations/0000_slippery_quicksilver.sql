CREATE TYPE "public"."commodity_category" AS ENUM('pulses', 'grains', 'seeds', 'nuts', 'other');--> statement-breakpoint
CREATE TYPE "public"."demand_allocation_status" AS ENUM('pending', 'confirmed', 'dispatched');--> statement-breakpoint
CREATE TYPE "public"."demand_request_status" AS ENUM('draft', 'submitted', 'under_review', 'quoted', 'accepted', 'rejected', 'allocated', 'fulfilled', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."demand_status" AS ENUM('pending', 'under_review', 'matched', 'fulfilled', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."offer_status" AS ENUM('pending', 'approved', 'rejected', 'fulfilled');--> statement-breakpoint
CREATE TYPE "public"."partnership_type" AS ENUM('exporter', 'investor', 'farmer', 'institutional');--> statement-breakpoint
CREATE TYPE "public"."payment_method" AS ENUM('wire_transfer', 'swift', 'lc', 'documentary_collection', 'cash_advance', 'other');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('unpaid', 'partial', 'paid');--> statement-breakpoint
CREATE TYPE "public"."quote_qty_lock" AS ENUM('locked', 'min_qty', 'open');--> statement-breakpoint
CREATE TYPE "public"."receipt_item_doc_type" AS ENUM('test_result', 'certificate_of_analysis', 'phytosanitary', 'certificate_of_origin', 'moisture_report', 'other');--> statement-breakpoint
CREATE TYPE "public"."receipt_status" AS ENUM('pending_inspection', 'inspected', 'approved', 'rejected', 'dispatched', 'partial_dispatch');--> statement-breakpoint
CREATE TYPE "public"."settlement_status" AS ENUM('pending', 'processing', 'settled');--> statement-breakpoint
CREATE TYPE "public"."shipment_doc_type" AS ENUM('commercial_invoice', 'bill_of_lading', 'certificate_of_origin', 'phytosanitary_certificate', 'weight_certificate', 'packing_list', 'lab_analysis', 'insurance_certificate', 'customs_declaration', 'other');--> statement-breakpoint
CREATE TYPE "public"."shipment_status" AS ENUM('booked', 'loaded', 'in_transit', 'delivered', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."training_type" AS ENUM('virtual', 'physical');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('admin', 'exporter', 'buyer', 'investor', 'farmer');--> statement-breakpoint
CREATE TYPE "public"."warehouse_location" AS ENUM('kano', 'abuja', 'france', 'other');--> statement-breakpoint
CREATE TYPE "public"."weight_unit" AS ENUM('kg', 'lbs', 'mt', 'sacks');--> statement-breakpoint
CREATE TABLE "accounts" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"type" text NOT NULL,
	"provider" text NOT NULL,
	"provider_account_id" text NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" text,
	"scope" text,
	"id_token" text,
	"session_state" text
);
--> statement-breakpoint
CREATE TABLE "buyer_demands" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"buyer_id" uuid NOT NULL,
	"commodity_id" uuid NOT NULL,
	"quantity_mt" numeric(10, 2) NOT NULL,
	"specification" text,
	"timeline_from" timestamp,
	"timeline_to" timestamp,
	"qty_per_month_mt" numeric(10, 2),
	"preferred_incoterm" text,
	"delivery_location" text,
	"status" "demand_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "buyer_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"company_name" text NOT NULL,
	"registration_no" text,
	"country" text NOT NULL,
	"city" text,
	"address" text,
	"phone" text,
	"vat_number" text,
	"business_type" text,
	"is_verified" boolean DEFAULT false NOT NULL,
	"verified_at" timestamp,
	"interested_commodities" jsonb DEFAULT '[]'::jsonb,
	"onboarding_complete" boolean DEFAULT false NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "buyer_profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "commodities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"category" "commodity_category" NOT NULL,
	"description" text,
	"origin" text DEFAULT 'Nigeria',
	"grades" jsonb,
	"packaging_options" jsonb,
	"min_order_qty_mt" numeric(10, 2),
	"certifications" jsonb,
	"image_url" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "commodities_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "commodity_prices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"commodity_id" uuid NOT NULL,
	"market" text NOT NULL,
	"state" text,
	"price_per_kg" numeric(10, 4),
	"currency" text DEFAULT 'NGN',
	"source" text,
	"recorded_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contact_submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"company" text,
	"country" text,
	"email" text NOT NULL,
	"phone" text,
	"role" text,
	"message" text NOT NULL,
	"is_read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "demand_allocations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"demand_id" uuid NOT NULL,
	"receipt_item_id" uuid NOT NULL,
	"exporter_user_id" uuid NOT NULL,
	"allocated_mt" numeric(12, 6) NOT NULL,
	"price_per_mt" numeric(12, 2),
	"currency" text DEFAULT 'EUR',
	"allocation_amount" numeric(14, 2),
	"status" "demand_allocation_status" DEFAULT 'pending' NOT NULL,
	"dispatched_at" timestamp,
	"notes" text,
	"settlement_stat" "settlement_status" DEFAULT 'pending',
	"settlement_proof_url" text,
	"settled_at" timestamp,
	"settlement_ref" text,
	"settlement_notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "demand_quotes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"quote_ref" text NOT NULL,
	"demand_id" uuid NOT NULL,
	"issued_by" uuid NOT NULL,
	"price_per_mt" numeric(12, 2) NOT NULL,
	"currency" text DEFAULT 'EUR' NOT NULL,
	"total_amount" numeric(16, 2) NOT NULL,
	"quoted_qty_mt" numeric(12, 3) NOT NULL,
	"qty_lock" "quote_qty_lock" DEFAULT 'locked' NOT NULL,
	"valid_until" timestamp NOT NULL,
	"incoterm" text,
	"port_of_loading" text,
	"payment_terms" text,
	"notes" text,
	"buyer_response" text,
	"buyer_responded_at" timestamp,
	"buyer_qty_mt" numeric(12, 3),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "demand_quotes_quote_ref_unique" UNIQUE("quote_ref")
);
--> statement-breakpoint
CREATE TABLE "demand_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"demand_ref" text NOT NULL,
	"buyer_id" uuid NOT NULL,
	"commodity_id" uuid NOT NULL,
	"quantity_mt" numeric(12, 3) NOT NULL,
	"packaging_type" text,
	"container_size" text,
	"preferred_incoterm" text,
	"delivery_port" text,
	"delivery_country" text,
	"preferred_grade" text,
	"target_price_per_mt" numeric(12, 2),
	"target_price_currency" text DEFAULT 'EUR',
	"timeline_from" timestamp,
	"timeline_to" timestamp,
	"special_requirements" text,
	"status" "demand_request_status" DEFAULT 'submitted' NOT NULL,
	"is_rfq" boolean DEFAULT false NOT NULL,
	"admin_notes" text,
	"quote_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "demand_requests_demand_ref_unique" UNIQUE("demand_ref")
);
--> statement-breakpoint
CREATE TABLE "exporter_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"company_name" text NOT NULL,
	"registration_no" text,
	"country" text DEFAULT 'Nigeria' NOT NULL,
	"state" text,
	"address" text,
	"phone" text,
	"export_license" text,
	"partnership_type" "partnership_type" DEFAULT 'exporter' NOT NULL,
	"is_verified" boolean DEFAULT false NOT NULL,
	"verified_at" timestamp,
	"interested_commodities" jsonb DEFAULT '[]'::jsonb,
	"onboarding_complete" boolean DEFAULT false NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "exporter_profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "inventory" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"commodity_id" uuid NOT NULL,
	"location" text NOT NULL,
	"warehouse" text,
	"quantity_mt" numeric(10, 2) NOT NULL,
	"grade" text,
	"indicative_price" numeric(10, 2),
	"currency" text DEFAULT 'EUR',
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "news_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"type" text DEFAULT 'news',
	"excerpt" text,
	"content" text,
	"image_url" text,
	"event_date" timestamp,
	"location" text,
	"is_published" boolean DEFAULT false NOT NULL,
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "news_events_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"payment_ref" text NOT NULL,
	"demand_id" uuid NOT NULL,
	"confirmed_by" uuid NOT NULL,
	"amount_paid" numeric(16, 2) NOT NULL,
	"currency" text DEFAULT 'EUR' NOT NULL,
	"exchange_rate" numeric(10, 6),
	"exchange_rate_to" text,
	"payment_method" "payment_method" NOT NULL,
	"transaction_ref" text NOT NULL,
	"payer_bank" text,
	"payer_account_name" text,
	"payer_iban" text,
	"receiver_bank" text,
	"receiver_account" text,
	"value_date" timestamp,
	"proof_of_payment_url" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "payments_payment_ref_unique" UNIQUE("payment_ref")
);
--> statement-breakpoint
CREATE TABLE "receipt_item_documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"receipt_item_id" uuid NOT NULL,
	"uploaded_by" uuid NOT NULL,
	"doc_type" "receipt_item_doc_type" NOT NULL,
	"custom_label" text,
	"file_url" text NOT NULL,
	"file_name" text NOT NULL,
	"file_size_bytes" integer,
	"visible_to_buyer" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"session_token" text NOT NULL,
	"user_id" uuid NOT NULL,
	"expires" timestamp NOT NULL,
	CONSTRAINT "sessions_session_token_unique" UNIQUE("session_token")
);
--> statement-breakpoint
CREATE TABLE "shipment_documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"shipment_id" uuid NOT NULL,
	"uploaded_by" uuid NOT NULL,
	"doc_type" "shipment_doc_type" NOT NULL,
	"custom_label" text,
	"file_url" text NOT NULL,
	"file_name" text NOT NULL,
	"file_size_bytes" integer,
	"version_note" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shipment_status_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"shipment_id" uuid NOT NULL,
	"logged_by" uuid NOT NULL,
	"status" "shipment_status" NOT NULL,
	"note" text,
	"event_date" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shipments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"shipment_ref" text NOT NULL,
	"exporter_id" uuid,
	"buyer_id" uuid,
	"commodity_id" uuid,
	"quantity_mt" numeric(10, 2) NOT NULL,
	"origin_port" text,
	"destination_port" text,
	"status" "shipment_status" DEFAULT 'booked' NOT NULL,
	"departure_date" timestamp,
	"estimated_arrival" timestamp,
	"actual_arrival" timestamp,
	"amount_usd" numeric(14, 2),
	"payment_status" "payment_status" DEFAULT 'unpaid' NOT NULL,
	"current_location" text,
	"demand_id" uuid,
	"payment_id" uuid,
	"notes" text,
	"documents" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "shipments_shipment_ref_unique" UNIQUE("shipment_ref")
);
--> statement-breakpoint
CREATE TABLE "supply_offers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"exporter_id" uuid NOT NULL,
	"commodity_id" uuid NOT NULL,
	"quantity_mt" numeric(10, 2) NOT NULL,
	"window_from" timestamp,
	"window_to" timestamp,
	"port_of_loading" text,
	"comments" text,
	"status" "offer_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "training_registrations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"company" text,
	"type" "training_type" NOT NULL,
	"location" text,
	"session_date" text,
	"is_paid" boolean DEFAULT false NOT NULL,
	"amount_ngn" numeric(10, 2),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text,
	"email" text NOT NULL,
	"email_verified" timestamp,
	"image" text,
	"password" text,
	"role" "user_role" DEFAULT 'buyer' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "verification_tokens" (
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "warehouse_receipt_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"receipt_id" uuid NOT NULL,
	"commodity_id" uuid NOT NULL,
	"raw_quantity" numeric(12, 3) NOT NULL,
	"raw_unit" "weight_unit" NOT NULL,
	"sacks_count" integer,
	"avg_sack_weight_kg" numeric(8, 3),
	"quantity_mt" numeric(12, 6) NOT NULL,
	"grade" text,
	"moisture_content" numeric(5, 2),
	"impurity_level" numeric(5, 2),
	"inspection_notes" text,
	"quantity_dispatched_mt" numeric(12, 6) DEFAULT '0' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "warehouse_receipts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"receipt_ref" text NOT NULL,
	"owner_id" uuid NOT NULL,
	"agent_id" uuid,
	"warehouse_location" "warehouse_location" NOT NULL,
	"warehouse_name" text,
	"status" "receipt_status" DEFAULT 'pending_inspection' NOT NULL,
	"arrived_at" timestamp DEFAULT now() NOT NULL,
	"inspected_at" timestamp,
	"approved_at" timestamp,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "warehouse_receipts_receipt_ref_unique" UNIQUE("receipt_ref")
);
--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "buyer_demands" ADD CONSTRAINT "buyer_demands_buyer_id_buyer_profiles_id_fk" FOREIGN KEY ("buyer_id") REFERENCES "public"."buyer_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "buyer_demands" ADD CONSTRAINT "buyer_demands_commodity_id_commodities_id_fk" FOREIGN KEY ("commodity_id") REFERENCES "public"."commodities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "buyer_profiles" ADD CONSTRAINT "buyer_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "commodity_prices" ADD CONSTRAINT "commodity_prices_commodity_id_commodities_id_fk" FOREIGN KEY ("commodity_id") REFERENCES "public"."commodities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "demand_allocations" ADD CONSTRAINT "demand_allocations_demand_id_demand_requests_id_fk" FOREIGN KEY ("demand_id") REFERENCES "public"."demand_requests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "demand_allocations" ADD CONSTRAINT "demand_allocations_receipt_item_id_warehouse_receipt_items_id_fk" FOREIGN KEY ("receipt_item_id") REFERENCES "public"."warehouse_receipt_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "demand_allocations" ADD CONSTRAINT "demand_allocations_exporter_user_id_users_id_fk" FOREIGN KEY ("exporter_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "demand_quotes" ADD CONSTRAINT "demand_quotes_demand_id_demand_requests_id_fk" FOREIGN KEY ("demand_id") REFERENCES "public"."demand_requests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "demand_quotes" ADD CONSTRAINT "demand_quotes_issued_by_users_id_fk" FOREIGN KEY ("issued_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "demand_requests" ADD CONSTRAINT "demand_requests_buyer_id_buyer_profiles_id_fk" FOREIGN KEY ("buyer_id") REFERENCES "public"."buyer_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "demand_requests" ADD CONSTRAINT "demand_requests_commodity_id_commodities_id_fk" FOREIGN KEY ("commodity_id") REFERENCES "public"."commodities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exporter_profiles" ADD CONSTRAINT "exporter_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory" ADD CONSTRAINT "inventory_commodity_id_commodities_id_fk" FOREIGN KEY ("commodity_id") REFERENCES "public"."commodities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_demand_id_demand_requests_id_fk" FOREIGN KEY ("demand_id") REFERENCES "public"."demand_requests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_confirmed_by_users_id_fk" FOREIGN KEY ("confirmed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "receipt_item_documents" ADD CONSTRAINT "receipt_item_documents_receipt_item_id_warehouse_receipt_items_id_fk" FOREIGN KEY ("receipt_item_id") REFERENCES "public"."warehouse_receipt_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "receipt_item_documents" ADD CONSTRAINT "receipt_item_documents_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shipment_documents" ADD CONSTRAINT "shipment_documents_shipment_id_shipments_id_fk" FOREIGN KEY ("shipment_id") REFERENCES "public"."shipments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shipment_documents" ADD CONSTRAINT "shipment_documents_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shipment_status_events" ADD CONSTRAINT "shipment_status_events_shipment_id_shipments_id_fk" FOREIGN KEY ("shipment_id") REFERENCES "public"."shipments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shipment_status_events" ADD CONSTRAINT "shipment_status_events_logged_by_users_id_fk" FOREIGN KEY ("logged_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shipments" ADD CONSTRAINT "shipments_exporter_id_exporter_profiles_id_fk" FOREIGN KEY ("exporter_id") REFERENCES "public"."exporter_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shipments" ADD CONSTRAINT "shipments_buyer_id_buyer_profiles_id_fk" FOREIGN KEY ("buyer_id") REFERENCES "public"."buyer_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shipments" ADD CONSTRAINT "shipments_commodity_id_commodities_id_fk" FOREIGN KEY ("commodity_id") REFERENCES "public"."commodities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shipments" ADD CONSTRAINT "shipments_demand_id_demand_requests_id_fk" FOREIGN KEY ("demand_id") REFERENCES "public"."demand_requests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shipments" ADD CONSTRAINT "shipments_payment_id_payments_id_fk" FOREIGN KEY ("payment_id") REFERENCES "public"."payments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supply_offers" ADD CONSTRAINT "supply_offers_exporter_id_exporter_profiles_id_fk" FOREIGN KEY ("exporter_id") REFERENCES "public"."exporter_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supply_offers" ADD CONSTRAINT "supply_offers_commodity_id_commodities_id_fk" FOREIGN KEY ("commodity_id") REFERENCES "public"."commodities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "training_registrations" ADD CONSTRAINT "training_registrations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "warehouse_receipt_items" ADD CONSTRAINT "warehouse_receipt_items_receipt_id_warehouse_receipts_id_fk" FOREIGN KEY ("receipt_id") REFERENCES "public"."warehouse_receipts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "warehouse_receipt_items" ADD CONSTRAINT "warehouse_receipt_items_commodity_id_commodities_id_fk" FOREIGN KEY ("commodity_id") REFERENCES "public"."commodities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "warehouse_receipts" ADD CONSTRAINT "warehouse_receipts_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "warehouse_receipts" ADD CONSTRAINT "warehouse_receipts_agent_id_users_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "accounts_provider_idx" ON "accounts" USING btree ("provider","provider_account_id");--> statement-breakpoint
CREATE INDEX "accounts_user_idx" ON "accounts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "da_demand_idx" ON "demand_allocations" USING btree ("demand_id");--> statement-breakpoint
CREATE INDEX "da_receipt_item_idx" ON "demand_allocations" USING btree ("receipt_item_id");--> statement-breakpoint
CREATE INDEX "da_exporter_idx" ON "demand_allocations" USING btree ("exporter_user_id");--> statement-breakpoint
CREATE INDEX "dq_demand_idx" ON "demand_quotes" USING btree ("demand_id");--> statement-breakpoint
CREATE INDEX "dr_buyer_idx" ON "demand_requests" USING btree ("buyer_id");--> statement-breakpoint
CREATE INDEX "dr_status_idx" ON "demand_requests" USING btree ("status");--> statement-breakpoint
CREATE INDEX "dr_commodity_idx" ON "demand_requests" USING btree ("commodity_id");--> statement-breakpoint
CREATE INDEX "rid_item_idx" ON "receipt_item_documents" USING btree ("receipt_item_id");--> statement-breakpoint
CREATE INDEX "sessions_user_idx" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "sd_shipment_idx" ON "shipment_documents" USING btree ("shipment_id");--> statement-breakpoint
CREATE INDEX "sd_doctype_idx" ON "shipment_documents" USING btree ("doc_type");--> statement-breakpoint
CREATE INDEX "sse_shipment_idx" ON "shipment_status_events" USING btree ("shipment_id");--> statement-breakpoint
CREATE INDEX "shipments_exporter_idx" ON "shipments" USING btree ("exporter_id");--> statement-breakpoint
CREATE INDEX "shipments_buyer_idx" ON "shipments" USING btree ("buyer_id");--> statement-breakpoint
CREATE INDEX "shipments_status_idx" ON "shipments" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "verification_tokens_pk" ON "verification_tokens" USING btree ("identifier","token");--> statement-breakpoint
CREATE INDEX "wri_receipt_idx" ON "warehouse_receipt_items" USING btree ("receipt_id");--> statement-breakpoint
CREATE INDEX "wri_commodity_idx" ON "warehouse_receipt_items" USING btree ("commodity_id");--> statement-breakpoint
CREATE INDEX "wr_owner_idx" ON "warehouse_receipts" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "wr_status_idx" ON "warehouse_receipts" USING btree ("status");--> statement-breakpoint
CREATE INDEX "wr_location_idx" ON "warehouse_receipts" USING btree ("warehouse_location");