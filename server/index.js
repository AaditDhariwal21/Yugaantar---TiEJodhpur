import "dotenv/config";
import express from "express";
import cors from "cors";
import registerRoutes from "./routes/register.js";
import contentRoutes from "./routes/content.js";
import adminRoutes from "./routes/admin.js";
import { connectDb, isConfigured } from "./db/mongo.js";

const app = express();
const PORT = process.env.PORT || 5181;

/* CORS_ORIGIN is a comma-separated allowlist so production, preview and local
   can share one deployment. Requests with no Origin header (curl, health
   checks, server-to-server) are allowed through. */
const allowed = (process.env.CORS_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, cb) {
      if (!origin || allowed.includes(origin)) return cb(null, true);
      cb(new Error(`Origin ${origin} not allowed by CORS`));
    },
    // the admin panel sends its shared secret here when ADMIN_KEY is set
    allowedHeaders: ["Content-Type", "x-admin-key"],
  })
);
/* Agenda sessions carry long subtitles and up to a handful of tracks, and the
   seed payload is larger still - 32kb was sized for the contact forms alone. */
app.use(express.json({ limit: "512kb" }));

app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.use("/api", registerRoutes);
app.use("/api", contentRoutes);
app.use("/api/admin", adminRoutes);

// JSON 404 so the client never has to parse an HTML error page
app.use((_req, res) => res.status(404).json({ ok: false, error: "Not found" }));

app.use((err, _req, res, _next) => {
  console.error("[error]", err);
  res.status(500).json({ ok: false, error: "Something went wrong." });
});

/* Opening the connection at boot rather than on first request means the cold
   start on Render absorbs the Atlas handshake, instead of the first visitor
   paying for it on top of the container spin-up. A failure here is logged and
   tolerated: requireDb retries per request, so a brief Atlas blip does not
   leave the process permanently broken. */
if (isConfigured()) {
  connectDb().catch((err) => console.error("[mongo] initial connect failed:", err.message));
} else {
  console.warn("[mongo] MONGODB_URI not set - /api/content and /api/admin will return 503");
}

app.listen(PORT, () => console.log(`Yugaantar API listening on http://localhost:${PORT}`));
