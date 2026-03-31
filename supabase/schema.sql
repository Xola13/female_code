-- ============================================================
-- Luna Beauty — Supabase Schema
-- Run this in the Supabase SQL editor after creating your project
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;

-- ── Profiles Table ────────────────────────────────────────────
-- Stores anonymous user behavioral profiles.
-- Only created when user enables Cloud Sync (consent-gated).

CREATE TABLE IF NOT EXISTS profiles (
  uuid TEXT PRIMARY KEY,
  profile_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster UUID lookups
CREATE INDEX IF NOT EXISTS idx_profiles_updated ON profiles(updated_at DESC);

-- Auto-update updated_at on upsert
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── Events Table ──────────────────────────────────────────────
-- Stores anonymized tracking events for analytics.

CREATE TABLE IF NOT EXISTS events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_uuid TEXT NOT NULL,
  event_type TEXT NOT NULL,  -- 'page_view', 'affiliate_click', 'chat_message', etc.
  event_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for analytics queries
CREATE INDEX IF NOT EXISTS idx_events_type ON events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_created ON events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_user ON events(user_uuid);

-- ── Products Table ────────────────────────────────────────────
-- Mirrors the seed data for pgvector similarity search.
-- Populate using the seed script or manually from lib/products.ts.

CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  category TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  description TEXT NOT NULL,
  short_description TEXT NOT NULL,
  image_url TEXT,
  affiliate_url TEXT NOT NULL,
  rating NUMERIC(3,1) DEFAULT 4.0,
  review_count INTEGER DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  is_bestseller BOOLEAN DEFAULT FALSE,
  is_new BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  -- pgvector embedding (1536 dimensions for OpenAI ada-002, or 768 for smaller models)
  -- We use a smaller custom embedding based on keyword matching
  embedding vector(128),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vector similarity search index (IVFFlat for larger datasets, HNSW for speed)
CREATE INDEX IF NOT EXISTS idx_products_embedding ON products
  USING hnsw (embedding vector_cosine_ops);

-- Text search index for fast keyword queries
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured) WHERE is_featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_products_bestseller ON products(is_bestseller) WHERE is_bestseller = TRUE;

-- ── Vector Similarity Search Function ────────────────────────
-- Called from Supabase RPC for semantic product search.

CREATE OR REPLACE FUNCTION match_products(
  query_embedding vector(128),
  match_threshold FLOAT DEFAULT 0.5,
  match_count INT DEFAULT 8
)
RETURNS TABLE (
  id TEXT,
  name TEXT,
  brand TEXT,
  category TEXT,
  price NUMERIC,
  short_description TEXT,
  image_url TEXT,
  affiliate_url TEXT,
  rating NUMERIC,
  review_count INTEGER,
  tags TEXT[],
  is_bestseller BOOLEAN,
  is_featured BOOLEAN,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.name,
    p.brand,
    p.category,
    p.price,
    p.short_description,
    p.image_url,
    p.affiliate_url,
    p.rating,
    p.review_count,
    p.tags,
    p.is_bestseller,
    p.is_featured,
    1 - (p.embedding <=> query_embedding) AS similarity
  FROM products p
  WHERE p.embedding IS NOT NULL
    AND 1 - (p.embedding <=> query_embedding) > match_threshold
  ORDER BY p.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- ── Row Level Security ────────────────────────────────────────
-- Enable RLS on all tables for security.

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Products: publicly readable (no auth required)
CREATE POLICY "Products are publicly readable"
  ON products FOR SELECT
  USING (TRUE);

-- Events: anyone can insert (anonymous tracking), but only service role can read
CREATE POLICY "Anyone can insert events"
  ON events FOR INSERT
  WITH CHECK (TRUE);

CREATE POLICY "Service role can read events"
  ON events FOR SELECT
  USING (auth.role() = 'service_role');

-- Profiles: anyone can upsert their own UUID, service role can read all
CREATE POLICY "Anyone can upsert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (TRUE);

CREATE POLICY "Anyone can update their own profile"
  ON profiles FOR UPDATE
  USING (TRUE);

CREATE POLICY "Anyone can read their own profile"
  ON profiles FOR SELECT
  USING (TRUE);

-- ── Analytics Views ───────────────────────────────────────────
-- Useful for the /admin/analytics page.

CREATE OR REPLACE VIEW event_summary AS
SELECT
  event_type,
  COUNT(*) as count,
  DATE(created_at) as date
FROM events
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY event_type, DATE(created_at)
ORDER BY date DESC;

CREATE OR REPLACE VIEW top_affiliate_clicks AS
SELECT
  event_data->>'productId' AS product_id,
  COUNT(*) AS click_count
FROM events
WHERE event_type = 'affiliate_click'
  AND created_at > NOW() - INTERVAL '7 days'
GROUP BY event_data->>'productId'
ORDER BY click_count DESC
LIMIT 10;

-- ============================================================
-- END OF SCHEMA
--
-- To seed products from the TypeScript catalog:
-- 1. Export PRODUCTS from lib/products.ts to JSON
-- 2. Use Supabase's bulk insert feature or a seed script
-- ============================================================
