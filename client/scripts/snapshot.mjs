/* Refresh src/data/snapshot.json from the live API.

     npm run snapshot                         # uses VITE_API_BASE, else localhost
     npm run snapshot -- https://api.example  # or pass the base URL

   The snapshot is what the site paints before /api/content answers. Keeping it
   close to the live database is what stops a visitor seeing last month's
   delegate list for a second on a cold start — so run this and commit the
   result before a deploy, once the content has settled. */

import { writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(here, "../src/data/snapshot.json");

const base = (process.argv[2] || process.env.VITE_API_BASE || "http://localhost:5181").replace(
  /\/+$/,
  ""
);

console.log(`Fetching ${base}/api/content …`);

let res;
try {
  res = await fetch(`${base}/api/content`);
} catch (err) {
  console.error(`Could not reach ${base} — ${err.message}`);
  console.error("Is the API running? Pass the base URL as an argument if it lives elsewhere.");
  process.exit(1);
}

if (!res.ok) {
  console.error(`${base}/api/content returned ${res.status}.`);
  process.exit(1);
}

const data = await res.json();

const ok =
  Array.isArray(data.delegates) &&
  Array.isArray(data.committee) &&
  Array.isArray(data.agenda) &&
  Array.isArray(data.agendaDays);

if (!ok) {
  console.error("That response did not look like /api/content. Nothing written.");
  process.exit(1);
}

/* Refuse to overwrite a useful snapshot with an empty one. Almost always this
   means the API is pointed at a fresh database, and silently blanking the
   fallback would make the site flash empty on every cold start. */
if (data.delegates.length === 0 && data.agenda.length === 0) {
  console.error("The API returned no delegates and no sessions. Nothing written.");
  console.error("Seed the database first, or check you are pointed at the right one.");
  process.exit(1);
}

/* Partners are carried only when the API actually sent them. Writing an empty
   array for an older API would bake "there are no partners" into the bundle,
   and the section would paint empty on every cold start instead of falling
   back to the copy in src/data/partners.js. */
const snapshot = {
  rev: data.rev ?? null,
  delegates: data.delegates,
  committee: data.committee,
  agenda: data.agenda,
  agendaDays: data.agendaDays,
  ...(Array.isArray(data.partners) ? { partners: data.partners } : {}),
  ...(Array.isArray(data.partnerTiers) ? { partnerTiers: data.partnerTiers } : {}),
};

writeFileSync(OUT, JSON.stringify(snapshot, null, 2) + "\n", "utf8");

console.log(
  `Wrote src/data/snapshot.json — ${snapshot.delegates.length} delegates, ` +
    `${snapshot.committee.length} committee, ${snapshot.agenda.length} sessions, ` +
    `${snapshot.agendaDays.length} days` +
    (snapshot.partners ? `, ${snapshot.partners.length} partners.` : ".")
);
if (!snapshot.partners) {
  console.log("That API did not return partners — the bundled fallback copy still covers them.");
}
console.log("Commit it so the deployed build ships the current content.");
