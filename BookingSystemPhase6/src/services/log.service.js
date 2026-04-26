import pool from "../db/pool.js";

/**
 * Writes a human-readable event into booking_log table.
 *
 * @param {Object} params
 * @param {number|null} params.actorUserId - User id or null if unknown
 * @param {string} params.message - e.g. "Reservation 123 created"
 * @param {string|null} [params.entityType] - e.g. "reservation" | "resource"
 * @param {number|null} [params.entityId] - e.g. 123
 */
export async function logEvent({ actorUserId = null, message, entityType = null, entityId = null }) {
  if (!message || typeof message !== "string") {
    throw new Error("logEvent: message must be a non-empty string");
  }

  const sql = `
    INSERT INTO booking_log (actor_user_id, message, entity_type, entity_id)
    VALUES ($1, $2, $3, $4)
  `;

  try {
    await pool.query(sql, [actorUserId, message, entityType, entityId]);
  } catch (err) {
    // Don't break the main request if logging fails.
    // In production you might send this to a real logger.
    console.error("logEvent failed:", err.message);
  }
}