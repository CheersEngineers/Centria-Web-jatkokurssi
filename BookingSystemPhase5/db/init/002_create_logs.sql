-- db/init/002_create_logs.sql
CREATE TABLE IF NOT EXISTS booking_log (
  id          BIGSERIAL PRIMARY KEY,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Who did it (nullable: e.g., guest action or unknown)
  actor_user_id BIGINT NULL,

  -- What happened
  message     TEXT NOT NULL,

  -- Optional: what entity was affected
  entity_type VARCHAR(30) NULL,   -- e.g. 'reservation', 'resource'
  entity_id   BIGINT NULL
);

-- Helpful indexes (optional but simple)
CREATE INDEX IF NOT EXISTS idx_booking_log_created_at ON booking_log (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_booking_log_actor      ON booking_log (actor_user_id);
CREATE INDEX IF NOT EXISTS idx_booking_log_entity     ON booking_log (entity_type, entity_id);
