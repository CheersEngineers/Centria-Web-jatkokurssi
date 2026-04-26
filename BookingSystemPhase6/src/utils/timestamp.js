// src/utils/timestamp.js

// Returns a readable ISO-like timestamp for logs
export default function timestamp() {
  const now = new Date();
  return now.toISOString().replace("T", " ").replace("Z", "");
}