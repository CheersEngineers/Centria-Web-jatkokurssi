// src/routes/resources.routes.js
import express from "express";
import pool from "../db/pool.js";
import { resourceValidators } from "../validators/resource.validators.js";
import { validationResult } from "express-validator";
import timestamp from "../utils/timestamp.js";
import { logEvent } from "../services/log.service.js";

const router = express.Router();

// POST /api/resources -> create (minimal) + duplicate check
router.post("/", resourceValidators, async (req, res) => {
  // Validate input
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      ok: false,
      errors: errors.array().map((e) => ({ field: e.path, msg: e.msg })),
    });
  }

  // Temp ID for the actor
  const actorUserId = null;

  // Read values from request body (simple approach for teaching)
  const {
    action = "",
    resourceName = "",
    resourceDescription = "",
    resourceAvailable = false,
    resourcePrice = 0,
    resourcePriceUnit = "",
  } = req.body;

  // Log (optional)
  console.log("The client's POST request ", `[${timestamp()}]`);
  console.log("------------------------------");
  console.log("Action ➡️ ", action);
  console.log("Name ➡️ ", resourceName);
  console.log("Description ➡️ ", resourceDescription);
  console.log("Availability ➡️ ", resourceAvailable);
  console.log("Price ➡️ ", resourcePrice);
  console.log("Price unit ➡️ ", resourcePriceUnit);
  console.log("------------------------------");

  if (action !== "create") {
    return res
      .status(400)
      .json({ ok: false, error: "Only create is implemented right now" });
  }

  try {
    // -----------------------------------------
    // Insert
    // -----------------------------------------
    const insertSql = `
      INSERT INTO resources (name, description, available, price, price_unit)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, name, description, available, price, price_unit, created_at
    `;

    const params = [
      resourceName,
      resourceDescription,
      Boolean(resourceAvailable),
      Number(resourcePrice),
      resourcePriceUnit,
    ];
    const { rows } = await pool.query(insertSql, params);

    // Add log event
    const resourceId = rows[0].id;
    await logEvent({
      actorUserId,
      message: `XXXX ${resourceId} XXXX`,
      entityType: "resource",
      entityId: resourceId,
    });

    return res.status(201).json({ ok: true, data: rows[0] });
  } catch (err) {
    // PostgreSQL unique violation error code is 23505
    if (err && err.code === "23505") {
      // Add log event
      console.error(err);
      await logEvent({
        actorUserId,
        message: `YYYY ${resourceName} YYYY`,
        entityType: "resource",
        entityId: null,
      });

      return res.status(409).json({
        ok: false,
        error: "Duplicate resourceName",
        details: "A resource with the same name already exists.",
      });
    }

    console.error("DB insert failed:", err);
    return res.status(500).json({ ok: false, error: "Database error" });
  }
});

export default router;