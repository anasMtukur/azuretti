/**
 * Azuretti – Drizzle ORM Schema
 * ============================================================
 * All database tables are defined here.
 * Run `npm run db:push` to sync schema to Postgres.
 * ============================================================
 */

import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  decimal,
  uuid,
  pgEnum,
  jsonb,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ── Enums ──────────────────────────────────────────────────────────────────

export const userRoleEnum = pgEnum("user_role", [
  "admin",
  "exporter",
  "buyer",
  "investor",
  "farmer",
]);

export const adminRoleEnum = pgEnum("admin_role", [
  "system_admin",
  "warehouse_manager",
  "content_manager",
  "finance_manager",
]);

export const shipmentStatusEnum = pgEnum("shipment_status", [
  "booked",
  "loaded",
  "in_transit",
  "delivered",
  "cancelled",
]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "unpaid",
  "partial",
  "paid",
]);

export const offerStatusEnum = pgEnum("offer_status", [
  "pending",
  "approved",
  "rejected",
  "fulfilled",
]);

export const demandStatusEnum = pgEnum("demand_status", [
  "pending",
  "under_review",
  "matched",
  "fulfilled",
  "cancelled",
]);

export const commodityCategoryEnum = pgEnum("commodity_category", [
  "pulses",
  "grains",
  "seeds",
  "nuts",
  "other",
]);

export const trainingTypeEnum = pgEnum("training_type", [
  "virtual",
  "physical",
]);

export const partnershipTypeEnum = pgEnum("partnership_type", [
  "exporter",
  "investor",
  "farmer",
  "institutional",
]);

// ── Warehousing enums ──────────────────────────────────────────────────────

export const receiptStatusEnum = pgEnum("receipt_status", [
  "pending_inspection", // logged, awaiting agent inspection
  "inspected",          // graded and measured, awaiting approval
  "approved",           // approved and in stock
  "rejected",           // rejected — quality failure
  "dispatched",         // moved out (linked to shipment)
  "partial_dispatch",   // partially moved out
]);

export const weightUnitEnum = pgEnum("weight_unit", [
  "kg",
  "lbs",
  "mt",       // metric tonnes
  "sacks",    // number of sacks (agent enters sack count + avg weight)
]);

export const warehouseLocationEnum = pgEnum("warehouse_location", [
  "kano",
  "abuja",
  "france",
  "other",
]);

export const paymentMethodEnum = pgEnum("payment_method", [
  "wire_transfer",
  "swift",
  "lc",                     // Letter of Credit
  "documentary_collection",
  "cash_advance",
  "other",
]);

export const settlementStatusEnum = pgEnum("settlement_status", [
  "pending",
  "processing",
  "settled",
]);

export const shipmentDocTypeEnum = pgEnum("shipment_doc_type", [
  "commercial_invoice",
  "bill_of_lading",
  "certificate_of_origin",
  "phytosanitary_certificate",
  "weight_certificate",
  "packing_list",
  "lab_analysis",
  "insurance_certificate",
  "customs_declaration",
  "other",
]);

export const demandRequestStatusEnum = pgEnum("demand_request_status", [
  "draft",
  "submitted",
  "under_review",
  "quoted",         // admin has issued a quote; buyer reviewing
  "accepted",       // buyer accepted quote / demand confirmed
  "rejected",       // buyer rejected quote
  "allocated",      // admin has allocated stock batches
  "fulfilled",      // shipment processed
  "cancelled",
]);

export const quoteQtyLockEnum = pgEnum("quote_qty_lock", [
  "locked", 
  "min_qty", 
  "open", 
]);

export const demandAllocationStatusEnum = pgEnum("demand_allocation_status", [
  "pending",
  "confirmed",
  "dispatched",
]);

export const receiptItemDocTypeEnum = pgEnum("receipt_item_doc_type", [
  "test_result",          // Lab quality / purity test
  "certificate_of_analysis",
  "phytosanitary",        // Plant health certificate
  "certificate_of_origin",
  "moisture_report",
  "other",
]);


// ── NextAuth required tables ───────────────────────────────────────────────

export const users = pgTable(
  "users",
  {
    id:            uuid("id").primaryKey().defaultRandom(),
    name:          text("name"),
    email:         text("email").notNull(),
    emailVerified: timestamp("email_verified", { mode: "date" }),
    image:         text("image"),
    password:      text("password"),                    // hashed via bcrypt
    role:          userRoleEnum("role").default("buyer").notNull(),
    adminRole:     adminRoleEnum("admin_role"),         // null for non-admin users
    isActive:      boolean("is_active").default(true).notNull(),
    createdAt:     timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt:     timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => ({
    emailIdx: uniqueIndex("users_email_idx").on(t.email),
  })
);

export const accounts = pgTable(
  "accounts",
  {
    id:                text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId:            uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    type:              text("type").notNull(),
    provider:          text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token:     text("refresh_token"),
    access_token:      text("access_token"),
    expires_at:        integer("expires_at"),
    token_type:        text("token_type"),
    scope:             text("scope"),
    id_token:          text("id_token"),
    session_state:     text("session_state"),
  },
  (t) => ({
    providerIdx: uniqueIndex("accounts_provider_idx").on(t.provider, t.providerAccountId),
    userIdx:     index("accounts_user_idx").on(t.userId),
  })
);

export const sessions = pgTable(
  "sessions",
  {
    id:           text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    sessionToken: text("session_token").notNull().unique(),
    userId:       uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    expires:      timestamp("expires", { mode: "date" }).notNull(),
  },
  (t) => ({
    userIdx: index("sessions_user_idx").on(t.userId),
  })
);

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token:      text("token").notNull(),
    expires:    timestamp("expires", { mode: "date" }).notNull(),
  },
  (t) => ({
    compositePk: uniqueIndex("verification_tokens_pk").on(t.identifier, t.token),
  })
);

// ── Exporter / Buyer Profiles ──────────────────────────────────────────────

export const exporterProfiles = pgTable("exporter_profiles", {
  id:                    uuid("id").primaryKey().defaultRandom(),
  userId:                uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
  companyName:           text("company_name").notNull(),
  registrationNo:        text("registration_no"),
  country:               text("country").default("Nigeria").notNull(),
  state:                 text("state"),
  address:               text("address"),
  phone:                 text("phone"),
  exportLicense:         text("export_license"),
  partnershipType:       partnershipTypeEnum("partnership_type").default("exporter").notNull(),
  isVerified:            boolean("is_verified").default(false).notNull(),
  verifiedAt:            timestamp("verified_at", { mode: "date" }),
  interestedCommodities: jsonb("interested_commodities").$type<string[]>().default([]),
  onboardingComplete:    boolean("onboarding_complete").default(false).notNull(),
  metadata:              jsonb("metadata"),
  createdAt:             timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt:             timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

export const buyerProfiles = pgTable("buyer_profiles", {
  id:                    uuid("id").primaryKey().defaultRandom(),
  userId:                uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
  companyName:           text("company_name").notNull(),
  registrationNo:        text("registration_no"),
  country:               text("country").notNull(),
  city:                  text("city"),
  address:               text("address"),
  phone:                 text("phone"),
  vatNumber:             text("vat_number"),
  businessType:          text("business_type"),             // importer, distributor, etc.
  isVerified:            boolean("is_verified").default(false).notNull(),
  verifiedAt:            timestamp("verified_at", { mode: "date" }),
  interestedCommodities: jsonb("interested_commodities").$type<string[]>().default([]),
  onboardingComplete:    boolean("onboarding_complete").default(false).notNull(),
  metadata:              jsonb("metadata"),
  createdAt:             timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt:             timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

// ── Commodities ────────────────────────────────────────────────────────────

export const commodities = pgTable("commodities", {
  id:               uuid("id").primaryKey().defaultRandom(),
  name:             text("name").notNull(),
  slug:             text("slug").notNull().unique(),
  category:         commodityCategoryEnum("category").notNull(),
  description:      text("description"),
  origin:           text("origin").default("Nigeria"),
  grades:           jsonb("grades"),               // array of grade/spec strings
  packagingOptions: jsonb("packaging_options"),
  minOrderQtyMt:    decimal("min_order_qty_mt", { precision: 10, scale: 2 }),
  certifications:   jsonb("certifications"),       // array of cert names
  factSheetUrl:     text("fact_sheet_url"),   // MinIO presigned or public URL
  imageUrl:         text("image_url"),
  isActive:         boolean("is_active").default(true).notNull(),
  sortOrder:        integer("sort_order").default(0),
  createdAt:        timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt:        timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

// ── Warehouse Receipts ─────────────────────────────────────────────────────
// One receipt = one drop-off event by an exporter/farmer.
// An agent logs it; items capture individual commodity lines within that drop-off.

export const warehouseReceipts = pgTable(
  "warehouse_receipts",
  {
    id:             uuid("id").primaryKey().defaultRandom(),
    receiptRef:     text("receipt_ref").notNull().unique(), // e.g. WR-KN-2025-0001
    ownerId:        uuid("owner_id").notNull().references(() => users.id),  // exporter or farmer
    agentId:        uuid("agent_id").references(() => users.id),            // admin/agent who logged it
    warehouseLocation: warehouseLocationEnum("warehouse_location").notNull(),
    warehouseName:  text("warehouse_name"),                // optional specific bay/zone
    status:         receiptStatusEnum("status").default("pending_inspection").notNull(),
    arrivedAt:      timestamp("arrived_at", { mode: "date" }).defaultNow().notNull(),
    inspectedAt:    timestamp("inspected_at", { mode: "date" }),
    approvedAt:     timestamp("approved_at", { mode: "date" }),
    notes:          text("notes"),                         // agent notes / rejection reason
    createdAt:      timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt:      timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => ({
    ownerIdx:  index("wr_owner_idx").on(t.ownerId),
    statusIdx: index("wr_status_idx").on(t.status),
    locIdx:    index("wr_location_idx").on(t.warehouseLocation),
  })
);

// ── Warehouse Receipt Items ────────────────────────────────────────────────
// Each line within a receipt = one commodity / grade batch.
// Agent records raw measurement (sacks / kg / lbs) + converted MT.

export const warehouseReceiptItems = pgTable(
  "warehouse_receipt_items",
  {
    id:              uuid("id").primaryKey().defaultRandom(),
    receiptId:       uuid("receipt_id").notNull().references(() => warehouseReceipts.id, { onDelete: "cascade" }),
    commodityId:     uuid("commodity_id").notNull().references(() => commodities.id),

    // Raw measurement as logged by agent
    rawQuantity:     decimal("raw_quantity",  { precision: 12, scale: 3 }).notNull(),
    rawUnit:         weightUnitEnum("raw_unit").notNull(),
    // For sacks: agent records count and average weight per sack
    sacksCount:      integer("sacks_count"),
    avgSackWeightKg: decimal("avg_sack_weight_kg", { precision: 8, scale: 3 }),

    // Normalised quantity in metric tonnes (computed on save)
    quantityMt:      decimal("quantity_mt",   { precision: 12, scale: 6 }).notNull(),

    // Inspection / grading
    grade:           text("grade"),            // e.g. "Grade A", "FAQ", "Below standard"
    moistureContent: decimal("moisture_content", { precision: 5, scale: 2 }), // percentage
    impurityLevel:   decimal("impurity_level",   { precision: 5, scale: 2 }), // percentage
    inspectionNotes: text("inspection_notes"),

    // Stock tracking
    quantityDispatchedMt: decimal("quantity_dispatched_mt", { precision: 12, scale: 6 }).default("0").notNull(),
    // remaining = quantityMt - quantityDispatchedMt (computed in queries)

    createdAt:       timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt:       timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => ({
    receiptIdx:   index("wri_receipt_idx").on(t.receiptId),
    commodityIdx: index("wri_commodity_idx").on(t.commodityId),
  })
);

// ── Inventory (stock at warehouses) ───────────────────────────────────────

export const inventory = pgTable("inventory", {
  id:            uuid("id").primaryKey().defaultRandom(),
  commodityId:   uuid("commodity_id").notNull().references(() => commodities.id),
  location:      text("location").notNull(),       // "nigeria" | "france"
  warehouse:     text("warehouse"),
  quantityMt:    decimal("quantity_mt", { precision: 10, scale: 2 }).notNull(),
  grade:         text("grade"),
  indicativePrice: decimal("indicative_price", { precision: 10, scale: 2 }),
  currency:      text("currency").default("EUR"),
  updatedAt:     timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

// ── Shipments ─────────────────────────────────────────────────────────────

export const shipments = pgTable("shipments",
  {
    id:               uuid("id").primaryKey().defaultRandom(),
    shipmentRef:      text("shipment_ref").notNull().unique(), // e.g. AZ-2025-0001
    exporterId:       uuid("exporter_id").references(() => exporterProfiles.id),
    buyerId:          uuid("buyer_id").references(() => buyerProfiles.id),
    commodityId:      uuid("commodity_id").references(() => commodities.id),
    quantityMt:       decimal("quantity_mt", { precision: 10, scale: 2 }).notNull(),
    originPort:       text("origin_port"),
    destinationPort:  text("destination_port"),
    status:           shipmentStatusEnum("status").default("booked").notNull(),
    departureDate:    timestamp("departure_date", { mode: "date" }),
    estimatedArrival: timestamp("estimated_arrival", { mode: "date" }),
    actualArrival:    timestamp("actual_arrival", { mode: "date" }),
    amountUsd:        decimal("amount_usd", { precision: 14, scale: 2 }),
    paymentStatus:    paymentStatusEnum("payment_status").default("unpaid").notNull(),
    currentLocation:  text("current_location"),
    demandId:         uuid("demand_id").references(() => demandRequests.id),
    paymentId:        uuid("payment_id").references(() => payments.id),
    notes:            text("notes"),
    documents:        jsonb("documents"),           // array of doc URLs
    createdAt:        timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt:        timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => ({
    exporterIdx: index("shipments_exporter_idx").on(t.exporterId),
    buyerIdx:    index("shipments_buyer_idx").on(t.buyerId),
    statusIdx:   index("shipments_status_idx").on(t.status),
  })
);

// ── Supply Offers (Exporter Portal) ───────────────────────────────────────

export const supplyOffers = pgTable("supply_offers", {
  id:               uuid("id").primaryKey().defaultRandom(),
  exporterId:       uuid("exporter_id").notNull().references(() => exporterProfiles.id),
  commodityId:      uuid("commodity_id").notNull().references(() => commodities.id),
  quantityMt:       decimal("quantity_mt", { precision: 10, scale: 2 }).notNull(),
  windowFrom:       timestamp("window_from", { mode: "date" }),
  windowTo:         timestamp("window_to", { mode: "date" }),
  portOfLoading:    text("port_of_loading"),
  comments:         text("comments"),
  status:           offerStatusEnum("status").default("pending").notNull(),
  createdAt:        timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt:        timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

// ── Buyer Demands (Buyer Portal) ───────────────────────────────────────────

export const buyerDemands = pgTable("buyer_demands", {
  id:               uuid("id").primaryKey().defaultRandom(),
  buyerId:          uuid("buyer_id").notNull().references(() => buyerProfiles.id),
  commodityId:      uuid("commodity_id").notNull().references(() => commodities.id),
  quantityMt:       decimal("quantity_mt", { precision: 10, scale: 2 }).notNull(),
  specification:    text("specification"),
  timelineFrom:     timestamp("timeline_from", { mode: "date" }),
  timelineTo:       timestamp("timeline_to", { mode: "date" }),
  qtyPerMonthMt:    decimal("qty_per_month_mt", { precision: 10, scale: 2 }),
  preferredIncoterm:text("preferred_incoterm"),
  deliveryLocation: text("delivery_location"),
  status:           demandStatusEnum("status").default("pending").notNull(),
  createdAt:        timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt:        timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

export const shipmentDocuments = pgTable(
  "shipment_documents",
  {
    id:            uuid("id").primaryKey().defaultRandom(),
    shipmentId:    uuid("shipment_id").notNull()
      .references((): any => shipments.id, { onDelete: "cascade" }),
    uploadedBy:    uuid("uploaded_by").notNull()
      .references((): any => users.id),

    docType:       shipmentDocTypeEnum("doc_type").notNull(),
    customLabel:   text("custom_label"),   // label when docType = "other"
    fileUrl:       text("file_url").notNull(),
    fileName:      text("file_name").notNull(),
    fileSizeBytes: integer("file_size_bytes"),
    versionNote:   text("version_note"),   // e.g. "Corrected BL issued 2025-09-14"

    createdAt:     timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => ({
    shipmentIdx: index("sd_shipment_idx").on(t.shipmentId),
    docTypeIdx:  index("sd_doctype_idx").on(t.docType),
  })
);

// ── Commodity Price Tickers ────────────────────────────────────────────────

export const commodityPrices = pgTable("commodity_prices", {
  id:          uuid("id").primaryKey().defaultRandom(),
  commodityId: uuid("commodity_id").notNull().references(() => commodities.id),
  market:      text("market").notNull(),           // "Kano", "Lagos", "International"
  state:       text("state"),
  pricePerKg:  decimal("price_per_kg", { precision: 10, scale: 4 }),
  priceChange: text("price_change"),
  currency:    text("currency").default("NGN"),
  source:      text("source"),
  recordedAt:  timestamp("recorded_at", { mode: "date" }).defaultNow().notNull(),
});

// ── Training Registrations ─────────────────────────────────────────────────

export const trainingRegistrations = pgTable("training_registrations", {
  id:           uuid("id").primaryKey().defaultRandom(),
  userId:       uuid("user_id").references(() => users.id),
  name:         text("name").notNull(),
  email:        text("email").notNull(),
  phone:        text("phone"),
  company:      text("company"),
  type:         trainingTypeEnum("type").notNull(),
  location:     text("location"),                  // "Abuja", "Kano"
  sessionDate:  text("session_date"),              // e.g. "September 2026"
  isPaid:       boolean("is_paid").default(false).notNull(),
  amountNgn:    decimal("amount_ngn", { precision: 10, scale: 2 }),
  createdAt:    timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

// ── Contact Form Submissions ───────────────────────────────────────────────

export const contactSubmissions = pgTable("contact_submissions", {
  id:        uuid("id").primaryKey().defaultRandom(),
  name:      text("name").notNull(),
  company:   text("company"),
  country:   text("country"),
  email:     text("email").notNull(),
  phone:     text("phone"),
  role:      text("role"),                         // exporter/buyer/investor/other
  message:   text("message").notNull(),
  isRead:    boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

// ── News / Events ──────────────────────────────────────────────────────────

export const newsEvents = pgTable("news_events", {
  id:          uuid("id").primaryKey().defaultRandom(),
  title:       text("title").notNull(),
  slug:        text("slug").notNull().unique(),
  type:        text("type").default("news"),       // "news" | "event" | "trade_mission"
  excerpt:     text("excerpt"),
  content:     text("content"),
  imageUrl:    text("image_url"),
  eventDate:   timestamp("event_date", { mode: "date" }),
  location:    text("location"),
  isPublished: boolean("is_published").default(false).notNull(),
  publishedAt: timestamp("published_at", { mode: "date" }),
  createdAt:   timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt:   timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

/*
─────────────────────────────────────────────────────────────
BUYER DEMAND REQUESTS
─────────────────────────────────────────────────────────────
*/
export const demandRequests = pgTable(
  "demand_requests",
  {
    id:        uuid("id").primaryKey().defaultRandom(),
    demandRef: text("demand_ref").notNull().unique(),

    buyerId:     uuid("buyer_id").notNull().references(() => buyerProfiles.id),
    commodityId: uuid("commodity_id").notNull().references(() => commodities.id),

    // Quantity & shipping
    quantityMt:          decimal("quantity_mt", { precision: 12, scale: 3 }).notNull(),
    packagingType:       text("packaging_type"),
    containerSize:       text("container_size"),
    preferredIncoterm:   text("preferred_incoterm"),
    deliveryPort:        text("delivery_port"),
    deliveryCountry:     text("delivery_country"),
    preferredGrade:      text("preferred_grade"),
    targetPricePerMt:    decimal("target_price_per_mt", { precision: 12, scale: 2 }),
    targetPriceCurrency: text("target_price_currency").default("EUR"),
    timelineFrom:        timestamp("timeline_from", { mode: "date" }),
    timelineTo:          timestamp("timeline_to", { mode: "date" }),
    specialRequirements: text("special_requirements"),

    // Status
    status:     demandRequestStatusEnum("status").default("submitted").notNull(),
    isRfq:      boolean("is_rfq").default(false).notNull(),
    adminNotes: text("admin_notes"),

    quoteId: uuid("quote_id"),

    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => ({
    buyerIdx:     index("dr_buyer_idx").on(t.buyerId),
    statusIdx:    index("dr_status_idx").on(t.status),
    commodityIdx: index("dr_commodity_idx").on(t.commodityId),
  })
);

export const demandQuotes = pgTable(
  "demand_quotes",
  {
    id:       uuid("id").primaryKey().defaultRandom(),
    quoteRef: text("quote_ref").notNull().unique(),

    demandId: uuid("demand_id")
      .notNull()
      .references(() => demandRequests.id),

    issuedBy: uuid("issued_by")
      .notNull()
      .references(() => users.id),

    // Pricing
    pricePerMt:  decimal("price_per_mt", { precision: 12, scale: 2 }).notNull(),
    currency:    text("currency").default("EUR").notNull(),
    totalAmount: decimal("total_amount", { precision: 16, scale: 2 }).notNull(),

    // Quantity rules
    quotedQtyMt: decimal("quoted_qty_mt", { precision: 12, scale: 3 }).notNull(),
    qtyLock:     quoteQtyLockEnum("qty_lock").default("locked").notNull(),

    // Validity
    validUntil: timestamp("valid_until", { mode: "date" }).notNull(),

    // Terms
    incoterm:      text("incoterm"),
    portOfLoading: text("port_of_loading"),
    paymentTerms:  text("payment_terms"),
    notes:         text("notes"),

    // Buyer response
    buyerResponse:    text("buyer_response"), // accepted | rejected
    buyerRespondedAt: timestamp("buyer_responded_at", { mode: "date" }),
    buyerQtyMt:       decimal("buyer_qty_mt", { precision: 12, scale: 3 }),

    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => ({
    demandIdx: index("dq_demand_idx").on(t.demandId),
  })
);

export const demandAllocations = pgTable(
  "demand_allocations",
  {
    id:                   uuid("id").primaryKey().defaultRandom(),
    demandId:             uuid("demand_id").notNull().references(() => demandRequests.id),
    receiptItemId:        uuid("receipt_item_id").notNull().references(() => warehouseReceiptItems.id),
    // Who owns this batch (for exporter-facing sales view)
    exporterUserId:       uuid("exporter_user_id").notNull().references(() => users.id),

    // How much of this batch is allocated to this demand
    allocatedMt:          decimal("allocated_mt", { precision: 12, scale: 6 }).notNull(),
    // Price breakdown for this exporter's portion
    pricePerMt:           decimal("price_per_mt", { precision: 12, scale: 2 }),
    currency:             text("currency").default("EUR"),
    // Total for this allocation = allocatedMt * pricePerMt
    allocationAmount:     decimal("allocation_amount", { precision: 14, scale: 2 }),

    status:               demandAllocationStatusEnum("status").default("pending").notNull(),
    dispatchedAt:         timestamp("dispatched_at", { mode: "date" }),
    notes:                text("notes"),

    settlementStatus:     settlementStatusEnum("settlement_stat").default("pending"),
    settlementProofUrl:   text("settlement_proof_url"),
    settledAt:            timestamp("settled_at", { mode: "date" }),
    settlementRef:        text("settlement_ref"),
    settlementNotes:      text("settlement_notes"),

    createdAt:            timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt:            timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => ({
    demandIdx:      index("da_demand_idx").on(t.demandId),
    receiptItemIdx: index("da_receipt_item_idx").on(t.receiptItemId),
    exporterIdx:    index("da_exporter_idx").on(t.exporterUserId),
  })
);

// ── 2. payments ────────────────────────────────────────────────────────────
// One payment record per demand. Admin creates this to confirm the buyer paid.

export const payments = pgTable("payments", {
  id:               uuid("id").primaryKey().defaultRandom(),
  paymentRef:       text("payment_ref").notNull().unique(), // PAY-2025-0001

  demandId:         uuid("demand_id").notNull()
    .references((): any => demandRequests.id),
  confirmedBy:      uuid("confirmed_by").notNull()
    .references((): any => users.id),

  // Amount
  amountPaid:       decimal("amount_paid",   { precision: 16, scale: 2 }).notNull(),
  currency:         text("currency").default("EUR").notNull(),
  // Cross-currency snapshot (optional — for NGN invoicing)
  exchangeRate:     decimal("exchange_rate", { precision: 10, scale: 6 }),
  exchangeRateTo:   text("exchange_rate_to"),

  // Transaction evidence
  paymentMethod:     paymentMethodEnum("payment_method").notNull(),
  transactionRef:    text("transaction_ref").notNull(),
  payerBank:         text("payer_bank"),
  payerAccountName:  text("payer_account_name"),
  payerIban:         text("payer_iban"),
  receiverBank:      text("receiver_bank"),
  receiverAccount:   text("receiver_account"),
  valueDate:         timestamp("value_date",  { mode: "date" }),
  proofOfPaymentUrl: text("proof_of_payment_url"),
  notes:             text("notes"),

  createdAt:        timestamp("created_at",  { mode: "date" }).defaultNow().notNull(),
  updatedAt:        timestamp("updated_at",  { mode: "date" }).defaultNow().notNull(),
});

export const shipmentStatusEvents = pgTable(
  "shipment_status_events",
  {
    id:         uuid("id").primaryKey().defaultRandom(),
    shipmentId: uuid("shipment_id").notNull()
                  .references(() => shipments.id, { onDelete: "cascade" }),
    loggedBy:   uuid("logged_by").notNull().references(() => users.id),
    status:     shipmentStatusEnum("status").notNull(),
    note:       text("note"),
    eventDate:  timestamp("event_date", { mode: "date" }).notNull(),
    createdAt:  timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => ({
    shipmentIdx: index("sse_shipment_idx").on(t.shipmentId),
  })
);

export const receiptItemDocuments = pgTable(
  "receipt_item_documents",
  {
    id:            uuid("id").primaryKey().defaultRandom(),
    receiptItemId: uuid("receipt_item_id").notNull()
                     .references(() => warehouseReceiptItems.id, { onDelete: "cascade" }),
    uploadedBy:    uuid("uploaded_by").notNull().references(() => users.id),
    docType:       receiptItemDocTypeEnum("doc_type").notNull(),
    customLabel:   text("custom_label"),
    fileUrl:       text("file_url").notNull(),
    fileName:      text("file_name").notNull(),
    fileSizeBytes: integer("file_size_bytes"),
    visibleToBuyer:boolean("visible_to_buyer").default(false).notNull(),
    createdAt:     timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => ({
    itemIdx: index("rid_item_idx").on(t.receiptItemId),
  })
);

// ── Relations ──────────────────────────────────────────────────────────────

export const usersRelations = relations(users, ({ one, many }) => ({
  accounts:        many(accounts),
  sessions:        many(sessions),
  exporterProfile: one(exporterProfiles, { fields: [users.id], references: [exporterProfiles.userId] }),
  buyerProfile:    one(buyerProfiles,    { fields: [users.id], references: [buyerProfiles.userId] }),
}));

export const exporterProfilesRelations = relations(exporterProfiles, ({ one, many }) => ({
  user:         one(users,       { fields: [exporterProfiles.userId],   references: [users.id] }),
  shipments:    many(shipments),
  supplyOffers: many(supplyOffers),
}));

export const buyerProfilesRelations = relations(buyerProfiles, ({ one, many }) => ({
  user:         one(users,      { fields: [buyerProfiles.userId],  references: [users.id] }),
  shipments:    many(shipments),
  buyerDemands: many(buyerDemands),
}));

export const commoditiesRelations = relations(commodities, ({ many }) => ({
  inventory:      many(inventory),
  shipments:      many(shipments),
  supplyOffers:   many(supplyOffers),
  buyerDemands:   many(buyerDemands),
  prices:         many(commodityPrices),
}));

export const shipmentsRelations = relations(shipments, ({ one }) => ({
  exporter:  one(exporterProfiles, { fields: [shipments.exporterId], references: [exporterProfiles.id] }),
  buyer:     one(buyerProfiles,    { fields: [shipments.buyerId],    references: [buyerProfiles.id] }),
  commodity: one(commodities,      { fields: [shipments.commodityId], references: [commodities.id] }),
}));

export const demandRequestsRelations = relations(demandRequests, ({ one, many }) => ({
  buyer: one(buyerProfiles, {
    fields: [demandRequests.buyerId],
    references: [buyerProfiles.id],
  }),

  commodity: one(commodities, {
    fields: [demandRequests.commodityId],
    references: [commodities.id],
  }),

  quotes: many(demandQuotes),
}));

export const demandQuotesRelations = relations(demandQuotes, ({ one }) => ({
  demand: one(demandRequests, {
    fields: [demandQuotes.demandId],
    references: [demandRequests.id],
  }),

  issuedByUser: one(users, {
    fields: [demandQuotes.issuedBy],
    references: [users.id],
  }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  demand:      one(demandRequests as any, {
    fields:     [payments.demandId],
    references: [(demandRequests as any).id],
  }),
  confirmedBy: one(users as any, {
    fields:     [payments.confirmedBy],
    references: [(users as any).id],
  }),
}));

export const shipmentDocumentsRelations = relations(shipmentDocuments, ({ one }) => ({
  shipment:   one(shipments as any, {
    fields:     [shipmentDocuments.shipmentId],
    references: [(shipments as any).id],
  }),
  uploadedBy: one(users as any, {
    fields:     [shipmentDocuments.uploadedBy],
    references: [(users as any).id],
  }),
}));

// ── Type exports ───────────────────────────────────────────────────────────
export type User                  = typeof users.$inferSelect;
export type NewUser               = typeof users.$inferInsert;
export type ExporterProfile       = typeof exporterProfiles.$inferSelect;
export type BuyerProfile          = typeof buyerProfiles.$inferSelect;
export type Commodity             = typeof commodities.$inferSelect;
export type Shipment              = typeof shipments.$inferSelect;
export type SupplyOffer           = typeof supplyOffers.$inferSelect;
export type BuyerDemand           = typeof buyerDemands.$inferSelect;
export type CommodityPrice        = typeof commodityPrices.$inferSelect;
export type TrainingRegistration  = typeof trainingRegistrations.$inferSelect;
export type ContactSubmission     = typeof contactSubmissions.$inferSelect;
export type NewsEvent             = typeof newsEvents.$inferSelect;
export type DemandRequests        = typeof demandRequests.$inferSelect;
export type DemandQuotes          = typeof demandQuotes.$inferSelect;
export type DemandAllocations     = typeof demandAllocations.$inferSelect;
export type Payment               = typeof payments.$inferSelect;
export type ShipmentDocument      = typeof shipmentDocuments.$inferSelect;
export type ReceiptItemDocument   = typeof receiptItemDocuments.$inferSelect;
export type ShipmentStatusEvent   = typeof shipmentStatusEvents.$inferSelect;