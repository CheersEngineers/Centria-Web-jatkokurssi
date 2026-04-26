// server.js
import "dotenv/config";
import app from "./src/app.js";

const PORT = process.env.IPORT || 3000;

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
