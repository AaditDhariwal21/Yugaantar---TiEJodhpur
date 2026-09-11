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
        /* Short enough that an unreachable Atlas surfaces as an error rather
           than a 30s hang, long enough to survive a cold first connection —
           the SRV lookup plus TLS handshake on a sleeping free-tier instance
           can take well over 8s, and timing that out reports "database
           unavailable" for what is really just a slow start. */
        serverSelectionTimeoutMS: 20000,
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
