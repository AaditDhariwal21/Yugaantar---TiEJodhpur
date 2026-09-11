/* Thin client for the Yugaantar API.

   VITE_API_BASE points at the Express server. Left unset it falls back to the
   local dev port, so `npm run dev` in both folders just works; on Vercel set
   it to the Render URL (no trailing slash). */

export const API_BASE = (import.meta.env.VITE_API_BASE || "http://localhost:5181").replace(
  /\/+$/,
  ""
);

/* The optional shared secret. Only ever sent to API_BASE, and only when the
   server has told us it wants one — see lib/adminGuard.js on the server. */
const KEY_STORAGE = "yug.adminKey";

export const getAdminKey = () => {
  try {
    return localStorage.getItem(KEY_STORAGE) || "";
  } catch {
    return "";
  }
};

export const setAdminKey = (key) => {
  try {
    if (key) localStorage.setItem(KEY_STORAGE, key);
    else localStorage.removeItem(KEY_STORAGE);
  } catch {
    /* private browsing — the key just won't persist across reloads */
  }
};

/* Thrown for any non-2xx. `errors` carries Mongoose's per-field messages when
   the server sent them, so forms can highlight the offending input; `needsKey`
   tells the panel to show the unlock prompt rather than a generic failure. */
export class ApiError extends Error {
  constructor(message, { status, errors, needsKey } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors || null;
    this.needsKey = Boolean(needsKey);
  }
}

export async function api(path, { method = "GET", body, admin = false, signal } = {}) {
  const headers = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (admin) {
    const key = getAdminKey();
    if (key) headers["x-admin-key"] = key;
  }

  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    });
  } catch (err) {
    if (err?.name === "AbortError") throw err;
    // fetch only rejects on network failure, which on Render usually means the
    // free instance is still waking up
    throw new ApiError("Could not reach the server. It may still be starting up.", { status: 0 });
  }

  let data = null;
  try {
    data = await res.json();
  } catch {
    /* empty or non-JSON body */
  }

  if (!res.ok) {
    throw new ApiError(data?.error || `Request failed (${res.status})`, {
      status: res.status,
      errors: data?.errors,
      needsKey: data?.needsKey,
    });
  }
  return data;
}

export const adminApi = (path, opts = {}) => api(path, { ...opts, admin: true });
