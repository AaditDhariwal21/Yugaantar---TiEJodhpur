import express from "express";
import cors from "cors";
import registerRoutes from "./routes/register.js";

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
  })
);
app.use(express.json({ limit: "32kb" }));

app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.use("/api", registerRoutes);

// JSON 404 so the client never has to parse an HTML error page
app.use((_req, res) => res.status(404).json({ ok: false, error: "Not found" }));

app.use((err, _req, res, _next) => {
  console.error("[error]", err);
  res.status(500).json({ ok: false, error: "Something went wrong." });
});

app.listen(PORT, () => console.log(`Yugaantar API listening on http://localhost:${PORT}`));
