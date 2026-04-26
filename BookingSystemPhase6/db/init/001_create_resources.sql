-- db/init/001_create_resources.sql
CREATE TABLE IF NOT EXISTS resources (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  available BOOLEAN NOT NULL DEFAULT false,
  price NUMERIC(12,2) NOT NULL DEFAULT 0,
  price_unit TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enforce unique names (case-insensitive)
CREATE UNIQUE INDEX IF NOT EXISTS resources_name_unique_ci
ON resources (LOWER(name));