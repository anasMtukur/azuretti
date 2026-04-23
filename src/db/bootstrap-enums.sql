-- ============================================================
-- Azuretti – Enum definitions
-- This file is read by scripts/setup-db.ts which handles
-- CREATE SCHEMA, search_path, and duplicate-type safety.
-- Do NOT run this file directly with psql.
-- ============================================================

CREATE TYPE user_role AS ENUM (
  'admin', 'exporter', 'buyer', 'investor', 'farmer'
);

CREATE TYPE shipment_status AS ENUM (
  'booked', 'loaded', 'in_transit', 'delivered', 'cancelled'
);

CREATE TYPE payment_status AS ENUM (
  'unpaid', 'partial', 'paid'
);

CREATE TYPE offer_status AS ENUM (
  'pending', 'approved', 'rejected', 'fulfilled'
);

CREATE TYPE demand_status AS ENUM (
  'pending', 'under_review', 'matched', 'fulfilled', 'cancelled'
);

CREATE TYPE commodity_category AS ENUM (
  'pulses', 'grains', 'seeds', 'nuts', 'other'
);

CREATE TYPE training_type AS ENUM (
  'virtual', 'physical'
);

CREATE TYPE partnership_type AS ENUM (
  'exporter', 'investor', 'farmer', 'institutional'
);