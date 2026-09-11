import mongoose from "mongoose";

/* Single shared connection.

   The server must still boot without MONGODB_URI so that /api/register and
   /api/health keep working on a machine that has no database configured.
   Routes that genuinely need Mongo call requireDb() and return a clear 503
   rather than hanging on a connection that will never open. */

let connecting = null;

export const isConfigured = () => Boolean(process.env.MONGODB_URI);

export async function connectDb() {
  if (!isConfigured()) return null;
  if (mongoose.connection.readyState === 1) return mongoose.connection;

  if (!connecting) {
    mongoose.set("strictQuery", true);
    connecting = mongoose
      .connect(process.env.MONGODB_URI, {
        // Fail fast instead of buffering commands for 30s when Atlas is
        // unreachable — the admin panel would rather show an error than spin.
        serverSelectionTimeoutMS: 8000,
      })
      .then((m) => {
        console.log("[mongo] connected");
        return m.connection;
      })
      .catch((err) => {
        connecting = null;
        throw err;
      });
  }
  return connecting;
}

/* Express middleware: 503 with an actionable message when the DB is absent. */
export async function requireDb(_req, res, next) {
  if (!isConfigured()) {
    return res.status(503).json({
      ok: false,
      error: "Database not configured. Set MONGODB_URI in the server environment.",
    });
  }
  try {
    await connectDb();
    next();
  } catch (err) {
    console.error("[mongo] connection failed", err.message);
    res.status(503).json({ ok: false, error: "Database unavailable." });
  }
}
