/* Optional shared-secret gate on /api/admin.

   The panel was specified as no-auth, so with ADMIN_KEY unset every admin
   route is open and the client never prompts. Setting ADMIN_KEY in the server
   environment turns the gate on with no redeploy of the frontend: the API
   starts demanding an x-admin-key header and the panel asks for it once and
   keeps it in localStorage.

   Worth turning on before the site is public. Without it, the URL is the only
   secret, and /api/admin/media/sign will hand a write URL for your R2 bucket
   to anyone who finds it. */

export const adminKeyRequired = () => Boolean(process.env.ADMIN_KEY);

export function adminGuard(req, res, next) {
  if (!adminKeyRequired()) return next();

  const supplied = req.get("x-admin-key") || "";
  if (supplied && supplied === process.env.ADMIN_KEY) return next();

  return res.status(401).json({ ok: false, error: "Invalid or missing admin key.", needsKey: true });
}
