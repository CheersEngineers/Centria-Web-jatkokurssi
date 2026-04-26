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

// Validator debug
/*app.use((req, _res, next) => {
  console.log('--- Incoming request --------------------------------');
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  console.log('Headers:', req.headers);
  console.log('Parsed body:', req.body);
  console.log('------------------------------------------------------');
  next();
});*/

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

// ----------------------------
// API routes
// ----------------------------
app.use("/api/resources", resourcesRouter);

// ----------------------------
// API 404 (unknown API routes)
// ----------------------------
app.use("/api", (req, res) => {
  return res.status(404).json({
    ok: false,
    error: "Not found",
    path: req.originalUrl,
  });
});

// ----------------------------
// Frontend 404 (unknown pages)
// ----------------------------
app.use((req, res) => {
  // If you have a dedicated 404.html, prefer that.
  // Otherwise return a simple message.
  return res.status(404).send("404 - Page not found");
});

// ----------------------------
// Central error handler
// ----------------------------
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);

  // If a response already started, delegate to Express default handler
  if (res.headersSent) return next(err);

  return res.status(500).json({
    ok: false,
    error: "Internal server error",
  });
});

export default app;