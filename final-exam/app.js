import express from "express";
import pg from "pg";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 3000;

const pool = new pg.Pool({
  connectionString:
    process.env.DATABASE_URL ||
    "postgresql://postgres:postgres@db:5432/person_registry",
});

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// GET all persons
app.get("/api/persons", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM persons ORDER BY id ASC",
    );
    res.json(result.rows);
  } catch (error) {
    console.error("GET /api/persons failed:", error.message);
    res.status(500).json({ ok: false, error: "Failed to fetch persons" });
  }
});

// GET one person by id
app.get("/api/persons/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({ ok: false, error: "Invalid id" });
    }

    const result = await pool.query(
      "SELECT * FROM persons WHERE id = $1",
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ ok: false, error: "Person not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(`GET /api/persons/${req.params.id} failed:`, error.message);
    res.status(500).json({ ok: false, error: "Failed to fetch person" });
  }
});

// CREATE person
app.post("/api/persons", async (req, res) => {
  try {
    const { first_name, last_name, email, phone, birth_date } = req.body;

    if (!first_name || !last_name || !email) {
      return res.status(400).json({
        ok: false,
        error: "first_name, last_name and email are required",
      });
    }

    const result = await pool.query(
      `INSERT INTO persons (first_name, last_name, email, phone, birth_date)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [first_name, last_name, email, phone || null, birth_date || null],
    );

    res.status(201).json({ ok: true, person: result.rows[0] });
  } catch (error) {
    console.error("POST /api/persons failed:", error.message);

    if (error.code === "23505") {
      return res.status(409).json({ ok: false, error: "Email already exists" });
    }

    res.status(500).json({ ok: false, error: "Failed to create person" });
  }
});

// UPDATE person
app.put("/api/persons/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { first_name, last_name, email, phone, birth_date } = req.body;

    if (!Number.isInteger(id)) {
      return res.status(400).json({ ok: false, error: "Invalid id" });
    }

    if (!first_name || !last_name || !email) {
      return res.status(400).json({
        ok: false,
        error: "first_name, last_name and email are required",
      });
    }

    const result = await pool.query(
      `UPDATE persons
       SET first_name = $1,
           last_name = $2,
           email = $3,
           phone = $4,
           birth_date = $5
       WHERE id = $6
       RETURNING *`,
      [first_name, last_name, email, phone || null, birth_date || null, id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ ok: false, error: "Person not found" });
    }

    res.json({ ok: true, person: result.rows[0] });
  } catch (error) {
    console.error(`PUT /api/persons/${req.params.id} failed:`, error.message);

    if (error.code === "23505") {
      return res.status(409).json({ ok: false, error: "Email already exists" });
    }

    res.status(500).json({ ok: false, error: "Failed to update person" });
  }
});

// DELETE person
app.delete("/api/persons/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({ ok: false, error: "Invalid id" });
    }

    const result = await pool.query(
      "DELETE FROM persons WHERE id = $1 RETURNING *",
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ ok: false, error: "Person not found" });
    }

    res.json({ ok: true, deleted: result.rows[0] });
  } catch (error) {
    console.error(`DELETE /api/persons/${req.params.id} failed:`, error.message);
    res.status(500).json({ ok: false, error: "Failed to delete person" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});