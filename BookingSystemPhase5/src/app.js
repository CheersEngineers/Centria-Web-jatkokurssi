// src/app.js
import express from "express";
import resourcesRouter from "./routes/resources.routes.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// --- Middleware ---
app.use(express.json()); // Parse application/json

// Serve everything in ./public as static assets
const publicDir = path.join(__dirname, "..", "public");
app.use(express.static(publicDir));

// --- Views (HTML pages) ---
app.get("/", (req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

app.get("/resources", (req, res) => {
  res.sendFile(path.join(publicDir, "resources.html"));
});

// --- API routes ---
app.use("/api/resources", resourcesRouter);

// --- Fallback 404 for unknown API routes ---
app.use("/api", (req, res) => {
  res.status(404).json({ error: "Not found" });
});

export default app;