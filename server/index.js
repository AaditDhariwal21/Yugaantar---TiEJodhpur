import express from "express";
import cors from "cors";
import registerRoutes from "./routes/register.js";

const app = express();
const PORT = process.env.PORT || 5181;

app.use(cors({ origin: process.env.CORS_ORIGIN || "http://localhost:5173" }));
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
