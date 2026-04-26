// src/routes/resources.routes.js
import express from "express";
import pool from "../db/pool.js";
import { resourceValidators } from "../validators/resource.validators.js";
import { validationResult } from "express-validator";
import { logEvent } from "../services/log.service.js";

const router = express.Router();

/* =====================================================
   CREATE
   POST /api/resources
===================================================== */
router.post("/", resourceValidators, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      ok: false,
      errors: errors.array().map((e) => ({ field: e.path, msg: e.msg })),
    });
  }

  const actorUserId = null;

  const {
    resourceName,
    resourceDescription,
    resourceAvailable,
    resourcePrice,
    resourcePriceUnit,
  } = req.body;

  try {
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

    await logEvent({
      actorUserId,
      message: `Resource created (ID ${rows[0].id})`,
      entityType: "resource",
      entityId: rows[0].id,
    });

    return res.status(201).json({ ok: true, data: rows[0] });
  } catch (err) {
    if (err && err.code === "23505") {
      await logEvent({
        actorUserId,
        message: `Duplicate resource blocked (${resourceName})`,
        entityType: "resource",
        entityId: null,
      });

      return res.status(409).json({
        ok: false,
        error: "Duplicate resource name",
      });
    }

    console.error("DB insert failed:", err);
    return res.status(500).json({ ok: false, error: "Database error" });
  }
});

/* =====================================================
   READ ALL
   GET /api/resources
===================================================== */
router.get("/", async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM resources ORDER BY created_at DESC"
    );

    return res.status(200).json({ ok: true, data: rows });
  } catch (err) {
    console.error("READ ALL failed:", err);
    return res.status(500).json({ ok: false, error: "Database error" });
  }
});

/* =====================================================
   READ ONE
   GET /api/resources/:id
===================================================== */
router.get("/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (isNaN(id)) {
    return res.status(400).json({ ok: false, error: "Invalid ID" });
  }

  try {
    const { rows } = await pool.query(
      "SELECT * FROM resources WHERE id = $1",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ ok: false, error: "Resource not found" });
    }

    return res.status(200).json({ ok: true, data: rows[0] });
  } catch (err) {
    console.error("READ ONE failed:", err);
    return res.status(500).json({ ok: false, error: "Database error" });
  }
});

/* =====================================================
   UPDATE
   PUT /api/resources/:id
===================================================== */
router.put("/:id", resourceValidators, async (req, res) => {
  const id = Number(req.params.id);

  if (isNaN(id)) {
    return res.status(400).json({ ok: false, error: "Invalid ID" });
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      ok: false,
      errors: errors.array().map((e) => ({ field: e.path, msg: e.msg })),
    });
  }

  const actorUserId = null;

  const {
    resourceName,
    resourceDescription,
    resourceAvailable,
    resourcePrice,
    resourcePriceUnit,
  } = req.body;

  try {
    const sql = `
      UPDATE resources
      SET name = $1,
          description = $2,
          available = $3,
          price = $4,
          price_unit = $5
      WHERE id = $6
      RETURNING *
    `;

    const params = [
      resourceName,
      resourceDescription,
      Boolean(resourceAvailable),
      Number(resourcePrice),
      resourcePriceUnit,
      id,
    ];

    const { rows } = await pool.query(sql, params);

    if (rows.length === 0) {
      return res.status(404).json({ ok: false, error: "Resource not found" });
    }

    await logEvent({
      actorUserId,
      message: `Resource updated (ID ${id})`,
      entityType: "resource",
      entityId: id,
    });

    return res.status(200).json({ ok: true, data: rows[0] });
  } catch (err) {
    if (err?.code === "23505") {
      return res.status(409).json({
        ok: false,
        error: "Duplicate resource name",
      });
    }

    console.error("UPDATE failed:", err);
    return res.status(500).json({ ok: false, error: "Database error" });
  }
});

/* =====================================================
   DELETE
   DELETE /api/resources/:id
===================================================== */
router.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (isNaN(id)) {
    return res.status(400).json({ ok: false, error: "Invalid ID" });
  }

  const actorUserId = null;

  try {
    const { rowCount } = await pool.query(
      "DELETE FROM resources WHERE id = $1",
      [id]
    );

    if (rowCount === 0) {
      return res.status(404).json({ ok: false, error: "Resource not found" });
    }

    await logEvent({
      actorUserId,
      message: `Resource deleted (ID ${id})`,
      entityType: "resource",
      entityId: id,
    });

    return res.status(204).send();
  } catch (err) {
    console.error("DELETE failed:", err);
    return res.status(500).json({ ok: false, error: "Database error" });
  }
});


export default router;