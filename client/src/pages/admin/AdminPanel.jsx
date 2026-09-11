import { useCallback, useEffect, useState } from "react";
import { adminApi, api, API_BASE, getAdminKey, setAdminKey } from "../../lib/api";
import { primeContentCache } from "../../lib/content";
import PeopleTab, { COMMITTEE, DELEGATES } from "./PeopleTab";
import AgendaTab from "./AgendaTab";
import { Btn, Icons, TextInput } from "./ui";
import s from "./admin.module.css";

/* /adminpanel — content editor for the delegates, committee and agenda.

   Deliberately unauthenticated by default; see lib/adminGuard.js on the
   server for the one environment variable that turns a shared secret on. */

const TABS = [
  { id: "delegates", label: "Delegates" },
  { id: "committee", label: "Committee" },
  { id: "agenda", label: "Agenda" },
];

function Unlock({ onUnlocked }) {
  const [key, setKey] = useState("");
  const [error, setError] = useState(null);
  const [checking, setChecking] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setChecking(true);
    setError(null);
    setAdminKey(key.trim());
    try {
      // any guarded route will do; delegates is the cheapest
      await adminApi("/api/admin/delegates");
      onUnlocked();
    } catch (err) {
      setAdminKey("");
      setError(err.needsKey ? "That key was not accepted." : err.message);
    } finally {
      setChecking(false);
    }
  }

  return (
    <form className={s.unlock} onSubmit={submit}>
      <h2>Admin key</h2>
      <p>This panel is protected by a shared key. Ask whoever set up the server for it.</p>
      <TextInput
        value={key}
        onChange={setKey}
        type="password"
        placeholder="Paste the key"
        autoFocus
        aria-label="Admin key"
      />
      {error && <p className={s.formError}>{error}</p>}
      <button type="submit" className={`${s.btn} ${s.primary}`} disabled={checking || !key.trim()}>
        {checking ? "Checking…" : "Unlock"}
      </button>
    </form>
  );
}

function Setup({ status }) {
  return (
    <div className={s.setup}>
      <h2>Finish the setup</h2>
      <p>
        The panel is talking to <code>{API_BASE}</code>, but the server is still missing something.
      </p>
      <ul>
        <li className={status.db ? s.done : s.todo}>
          {status.db ? <Icons.check size={16} /> : <Icons.close size={16} />}
          <span>
            <strong>Database</strong> —{" "}
            {status.db
              ? "connected."
              : "set MONGODB_URI to your MongoDB Atlas connection string, including the database name."}
          </span>
        </li>
        <li className={status.r2 ? s.done : s.todo}>
          {status.r2 ? <Icons.check size={16} /> : <Icons.close size={16} />}
          <span>
            <strong>Photo storage</strong> —{" "}
            {status.r2
              ? "connected."
              : "set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET and R2_PUBLIC_BASE. Everything else works without this; only photo uploads will fail."}
          </span>
        </li>
      </ul>
      <p className={s.setupFoot}>
        The full instructions are in <code>server/.env.example</code>. Restart the server after
        changing them.
      </p>
    </div>
  );
}

function Seed({ onDone }) {
  const [running, setRunning] = useState(false);
  const [error, setError] = useState(null);

  async function run() {
    setRunning(true);
    setError(null);
    try {
      await adminApi("/api/admin/seed", { method: "POST" });
      onDone();
    } catch (err) {
      setError(err.message);
      setRunning(false);
    }
  }

  return (
    <div className={s.seed}>
      <h2>The database is empty</h2>
      <p>
        Load the delegates, committee and agenda that are currently hardcoded on the site, so you
        have something to edit rather than starting from a blank list. Nothing on the live site
        changes.
      </p>
      {error && <p className={s.formError}>{error}</p>}
      <button type="button" className={`${s.btn} ${s.primary}`} onClick={run} disabled={running}>
        {running ? "Loading…" : "Load current site content"}
      </button>
    </div>
  );
}

/* Keeps the panel out of search results. It matters more than usual here:
   with no ADMIN_KEY set the URL is the only thing standing between a crawler's
   index and an open editor. robots.txt says the same thing; this covers links
   that reach the page without a crawl of the root. */
function useNoIndex() {
  useEffect(() => {
    const tag = document.createElement("meta");
    tag.name = "robots";
    tag.content = "noindex, nofollow";
    document.head.appendChild(tag);
    const title = document.title;
    document.title = "Admin · Yugaantar 2026";
    return () => {
      tag.remove();
      document.title = title;
    };
  }, []);
}

export default function AdminPanel() {
  useNoIndex();
  const [tab, setTab] = useState("delegates");
  const [status, setStatus] = useState(null);
  const [locked, setLocked] = useState(false);
  const [needsSeed, setNeedsSeed] = useState(false);
  const [fatal, setFatal] = useState(null);
  /* Bumped after seeding to force the tabs to remount and refetch. */
  const [epoch, setEpoch] = useState(0);

  const probe = useCallback(async () => {
    setFatal(null);
    try {
      const st = await api("/api/admin/status");
      setStatus(st);

      if (!st.db) return;
      if (st.keyRequired && !getAdminKey()) {
        setLocked(true);
        return;
      }
      const res = await adminApi("/api/admin/delegates");
      setLocked(false);
      /* Only nudge towards seeding when the whole database is untouched —
         someone who has deliberately deleted every delegate should not be
         invited to put 41 placeholders back. */
      if (res.items.length === 0) {
        const agenda = await adminApi("/api/admin/agenda");
        setNeedsSeed(agenda.items.length === 0);
      } else {
        setNeedsSeed(false);
      }
    } catch (err) {
      if (err.needsKey) setLocked(true);
      else setFatal(err);
    }
  }, []);

  useEffect(() => {
    probe();
  }, [probe, epoch]);

  /* Keeps another open tab of the public site from showing stale content for
     the 30s the API response is cached. */
  const refreshPublicCache = useCallback(() => {
    api("/api/content")
      .then(primeContentCache)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!status?.db || locked) return undefined;
    const t = setTimeout(refreshPublicCache, 1200);
    return () => clearTimeout(t);
  }, [status, locked, epoch, tab, refreshPublicCache]);

  return (
    <div className={s.shell}>
      <header className={s.top}>
        <div className={s.brand}>
          <span className={s.mark}>Yugaantar</span>
          <span className={s.sep} aria-hidden="true" />
          <span className={s.sub}>Content admin</span>
        </div>
        <a className={s.viewSite} href="/" target="_blank" rel="noreferrer">
          View site ↗
        </a>
      </header>

      <main className={s.main}>
        {fatal && (
          <div className={s.banner} role="alert">
            <strong>{fatal.message}</strong>
            <br />
            Trying to reach <code>{API_BASE}</code>. If the server runs elsewhere, set{" "}
            <code>VITE_API_BASE</code> in the client environment.
            <div style={{ marginTop: 10 }}>
              <Btn kind="ghost" onClick={probe}>
                Try again
              </Btn>
            </div>
          </div>
        )}

        {!fatal && status && !status.db && <Setup status={status} />}

        {!fatal && status?.db && locked && (
          <Unlock
            onUnlocked={() => {
              setLocked(false);
              setEpoch((n) => n + 1);
            }}
          />
        )}

        {!fatal && status?.db && !locked && needsSeed && (
          <Seed
            onDone={() => {
              setNeedsSeed(false);
              setEpoch((n) => n + 1);
            }}
          />
        )}

        {!fatal && status?.db && !locked && !needsSeed && (
          <>
            {!status.r2 && (
              <p className={s.notice}>
                Photo storage is not configured, so uploads will fail. Everything else works — see{" "}
                <code>server/.env.example</code>.
              </p>
            )}

            <nav className={s.tabs} role="tablist" aria-label="Sections">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={tab === t.id}
                  data-on={tab === t.id}
                  className={s.tab}
                  onClick={() => setTab(t.id)}
                >
                  {t.label}
                </button>
              ))}
            </nav>

            <div className={s.panel}>
              {tab === "delegates" && <PeopleTab key={`d${epoch}`} cfg={DELEGATES} />}
              {tab === "committee" && <PeopleTab key={`c${epoch}`} cfg={COMMITTEE} />}
              {tab === "agenda" && <AgendaTab key={`a${epoch}`} />}
            </div>
          </>
        )}

        {!fatal && !status && <p className={s.loading}>Connecting…</p>}
      </main>

      <footer className={s.foot}>
        Changes are live as soon as they save. Visitors already on the page keep what they loaded
        until they refresh.
      </footer>
    </div>
  );
}
