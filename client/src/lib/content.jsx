import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import snapshot from "../data/snapshot.json";
import { api, isApiConfigured } from "./api";

/* Site content: delegates, committee, the agenda and the partners, all
   editable from /adminpanel and served by GET /api/content.

   Why not just fetch and show a spinner: the API runs on Render's free tier,
   which sleeps after 15 minutes idle and takes 30-50s to wake. A visitor who
   arrives first would watch three empty sections for the better part of a
   minute. So the page paints immediately from the last known content and
   swaps in live data when it arrives:

     1. localStorage cache, if this browser has seen the site before
     2. otherwise snapshot.json, bundled at build time
     3. then /api/content in the background, which replaces both

   Live data always wins once it lands, even when it is empty — deleting every
   delegate must empty the section, not silently fall back to the snapshot.

   Refresh the bundled baseline before a deploy with `npm run snapshot`. */

const CACHE_KEY = "yug.content.v1";
/* Beyond this the cache is still shown (better than nothing) but is treated as
   cold. It exists so a browser that visited months ago is not trusted forever
   if the API is unreachable. */
const CACHE_MAX_AGE = 1000 * 60 * 60 * 24 * 14;

const ContentContext = createContext(null);

const shapeOk = (v) =>
  v &&
  Array.isArray(v.delegates) &&
  Array.isArray(v.committee) &&
  Array.isArray(v.agenda) &&
  Array.isArray(v.agendaDays);

function readCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { at, data } = JSON.parse(raw);
    if (!shapeOk(data)) return null;
    return { data, stale: Date.now() - at > CACHE_MAX_AGE };
  } catch {
    return null;
  }
}

function writeCache(data) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), data }));
  } catch {
    /* quota or private browsing — the snapshot still covers the next visit */
  }
}

/* `partners` and `partnerTiers` are deliberately NOT part of shapeOk, and are
   null rather than [] when absent.

   The client deploys to Vercel and the API to Render, separately, so there is
   always a window where one is newer than the other. An older API — or the
   snapshot bundled before partners moved into the database — simply omits
   these keys. Requiring them would make that whole payload fail shapeOk and
   strand the site on its snapshot; defaulting them to [] would empty the
   partners section instead. null means "this API did not say", and the section
   falls back to the copy in data/partners.js. An empty ARRAY is a real answer:
   the admin deleted everything, and the section empties. */
const pick = (d) => ({
  rev: d.rev ?? null,
  delegates: d.delegates,
  committee: d.committee,
  agenda: d.agenda,
  agendaDays: d.agendaDays,
  partners: Array.isArray(d.partners) ? d.partners : null,
  partnerTiers: Array.isArray(d.partnerTiers) ? d.partnerTiers : null,
});

export function ContentProvider({ children }) {
  /* Lazy initialiser: cache and snapshot are both synchronous, so the very
     first paint already has real content and there is never a blank frame. */
  const [state, setState] = useState(() => {
    const cached = readCache();
    return {
      data: cached?.data || pick(snapshot),
      source: cached ? "cache" : "snapshot",
      error: null,
    };
  });

  const alive = useRef(true);

  useEffect(() => {
    /* No API in this build: serve the snapshot and make no request. Without
       this guard a production deploy that forgot VITE_API_BASE would fetch
       http://localhost:5181 from every visitor's browser - a request that
       cannot succeed and that Chrome now raises a permission prompt for. */
    if (!isApiConfigured()) {
      if (import.meta.env.DEV) console.warn("[content] VITE_API_BASE unset - using the bundled snapshot");
      return undefined;
    }

    alive.current = true;
    const ctrl = new AbortController();

    api("/api/content", { signal: ctrl.signal })
      .then((res) => {
        if (!alive.current) return;
        const next = pick(res);
        if (!shapeOk(next)) return;
        setState({ data: next, source: "live", error: null });
        writeCache(next);
      })
      .catch((err) => {
        if (!alive.current || err?.name === "AbortError") return;
        /* Keep whatever is already on screen. A cold or unconfigured API is a
           non-event for a visitor — they still see the site. */
        setState((prev) => ({ ...prev, error: err }));
        if (import.meta.env.DEV) console.warn("[content] falling back:", err.message);
      });

    return () => {
      alive.current = false;
      ctrl.abort();
    };
  }, []);

  const value = useMemo(
    () => ({
      ...state.data,
      source: state.source,
      isLive: state.source === "live",
      error: state.error,
    }),
    [state]
  );

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

export function useContent() {
  const ctx = useContext(ContentContext);
  if (!ctx) throw new Error("useContent must be used inside <ContentProvider>");
  return ctx;
}

/* Lets the admin panel push a fresh copy into the cache after saving, so
   opening the site in another tab shows the edit without waiting out the
   30-second CDN cache on /api/content. */
export function primeContentCache(data) {
  if (shapeOk(data)) writeCache(pick(data));
}
