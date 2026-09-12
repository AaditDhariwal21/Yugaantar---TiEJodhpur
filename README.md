# Yugaantar 2026 — TiE Jodhpur

The official site for **Yugaantar 2026**, the flagship annual entrepreneurship
conference of **TiE Jodhpur**.

Built as a structural and visual clone of <https://tieconamsterdam.org/> — the
same section order, layout, motion and spacing rhythm, with all copy, branding
and data replaced. See [`design-reference/design-audit.md`](design-reference/design-audit.md)
for the measured token system and [`PROGRESS.md`](PROGRESS.md) for build status.

## Running it

```bash
# client — http://localhost:5173
cd client && npm install && npm run dev

# api — http://localhost:5181
cd server && npm install && npm run dev
```

The client runs standalone: with no API reachable it paints from
`src/data/snapshot.json` and simply never swaps in live content. Start the API
too if you want the admin panel, or content that reflects the database.

To point the client at an API somewhere else, set `VITE_API_BASE`
(see `client/.env.example`).

## Stack

| Concern | Choice |
|---|---|
| Framework | React 19 + Vite (JavaScript, function components + hooks) |
| Routing | React Router |
| Styling | CSS Modules over CSS custom properties (`src/styles/tokens.css`) |
| Motion | Framer Motion for scroll reveals and stagger; CSS keyframes for the marquees and card effects (matching how the reference does it) |
| Backend | Express — form intake, content API, admin CRUD |
| Database | MongoDB Atlas via Mongoose |
| Photo storage | Cloudflare R2 (S3 API), presigned direct-from-browser uploads |

No WebGL/Three.js: the reference has none. Its hero background is a CSS
radial-gradient mesh, and its only `<canvas>` uses are 2D — the pixel-grid
headline and the dither texture behind "Who should attend". Both are
reproduced with 2D canvas.

## Layout

```
client/
  src/
    components/
      layout/     Navbar, Footer (footer also carries the final CTA band)
      sections/   one component per landing-page section
      ui/         Button, Icon, Reveal, HashLink, GridHeadline, Dither
    data/         ALL copy and content lives here
    hooks/        useCountUp, useInViewOnce
    styles/       tokens.css, globals.css
    lib/          api client, content provider, browser-side image crop
    pages/        Home, and admin/ — the /adminpanel editor
  scripts/        snapshot.mjs
server/
  index.js
  db/         mongo connection, Mongoose models, generated seed content
  lib/        R2 presigning, optional admin-key gate
  routes/     register.js, content.js (public read), admin.js (CRUD)
  scripts/    seed.js
design-reference/
  design-audit.md, audit-*.json, probe-*.json
  screenshots/    reference captures
  build-shots/    our captures, for side-by-side
  raw/            served HTML + the reference's recovered component CSS
tools/            Playwright scripts: audit, probe, measure, interact, clipsec
```

## Editing content

Content is split in two. **Delegates, the planning committee, the agenda and
the partners** live in MongoDB and are edited at `/adminpanel`. **Everything
else** is still static copy under `client/src/data/`:

| File | Drives |
|---|---|
| `site.js` | brand, nav, hero, about, final CTA, footer |
| `experience.js` | experience cards, audience, themes, attend marquee pills |
| `speakers.js` | delegates section *headings* (the roster itself is in the DB) |
| `committee.js` | committee section *headings* (the roster is in the DB) |
| `agenda.js` | agenda headings, filter labels, venue, `.ics` block (sessions are in the DB) |
| `tickets.js` | pricing tiers; `featured: true` renders the gradient card |
| `partners.js` | partners section *headings*, the Global Community logo strip, and the roster used as a fallback until the database has tiers |
| `pitchroom.js` | the Marwar Pitch Room section — see the provenance note at the top of the file |
| `snapshot.json` | generated — the offline fallback, see below |

Anything written `[LIKE THIS]` is a placeholder awaiting real content. Photos
and logos accept `null` and fall back to an initial, which is what the
reference does too.

## The admin panel

`/adminpanel` — no login by default. Three jobs: the people lists, the
programme, and the partners.

- **Delegates** — add, edit, delete. Photo, name, position, company, LinkedIn
  and country. Drag (or use the arrow buttons) to set the order they appear in;
  the star button promotes someone into the **Featured** tier, which is the
  large-card row above the main grid.
- **Committee** — the same, as one list.
- **Agenda** — per day: the date and main-stage theme, then the sessions.
  Times are free text, so `Onward` works. Adding one or more breakout tracks to
  a session makes its row expandable on the site. The plenary/breakout counters
  on the site are derived from these rows and cannot drift.
- **Partners** — the tiers (`Silver Partner`, and so on) and the partners in
  them, on one screen. Tiers are ordered top to bottom and can be renamed
  freely: a partner points at the tier document, not at its name. A tier that
  still holds partners cannot be deleted — empty it first — because its
  partners would still exist but would stop rendering. Logos are **fitted** to
  the tile, never cropped, so a wide wordmark survives. The filter chips and
  their counts on the site derive from these rows.

  Until at least one tier exists, the section falls back to the roster in
  `client/src/data/partners.js`, so it does not go blank between deploying this
  and seeding. Once a tier exists the database is the only source, and
  deleting every partner empties the section as you would expect.

### Setting it up

1. **MongoDB Atlas** — create a free cluster, allow `0.0.0.0/0` in Network
   Access (Render's free tier has no static outbound IP), and put the
   connection string in `MONGODB_URI`, database name included.
2. **Cloudflare R2** — create a bucket, enable its public URL, and make an
   Object Read & Write API token. **Set the bucket's CORS policy** or uploads
   will fail silently in the browser.
3. Open `/adminpanel`. If the database is empty it offers to load the content
   that is currently hardcoded, so you start from today's site rather than a
   blank list. Locally you can do the same with `npm run seed` in `server/`.
   Both paths also create the partner tiers and partners; on an already-seeded
   database the seed skips every collection it finds populated, so running it
   again is safe and will fill in only the partners.

Every variable, and the exact R2 CORS JSON, is in `server/.env.example`.

### About the lack of a login

`/api/admin/*` is wide open, and that includes the endpoint that signs uploads
to your R2 bucket. Before the site goes public, set `ADMIN_KEY` on the server
to any long random string — the API starts requiring it, and the panel prompts
for it once. No frontend redeploy is needed. `robots.txt` and a `noindex` tag
already keep the page out of search results, but that is obscurity, not
security.

### How the site reads it

The API is one call, `GET /api/content`. Because Render's free tier sleeps
after 15 minutes and takes 30–50s to wake, the site never waits on it: it
paints immediately from `localStorage`, or from the bundled
`client/src/data/snapshot.json`, then swaps in live data when it arrives. Live
data always wins once it lands, including when it is empty.

Keep that fallback current before a deploy:

```bash
cd client && npm run snapshot -- https://your-api.onrender.com
```

Then commit the regenerated `snapshot.json`. Skipping this is not fatal — it
just means a first-time visitor may see older content for a moment on a cold
start.

## One deliberate difference from the reference

The reference's Framer build emits malformed colour values — `rgb(228, 0, 43)12`
where the designer wrote `#E4002B12` (red at 7% opacity). Browsers cannot parse
that, so they discard the whole declaration. The result on
tieconamsterdam.org today: section eyebrows have no pill behind them, card icon
tiles have no tint, committee avatars have no ring, and the ticket date chip and
membership panel have no fill or border. The red *text* still shows, because
those lines were written correctly.

**We render the styling their CSS was written to produce.** The alpha values are
the ones stranded in the reference's own source, so this is restoration rather
than reinterpretation, and it touches nothing but the missing backgrounds,
borders and rings — no layout, spacing or type changes.

To reproduce the reference bug-for-bug (for a strict side-by-side diff), add the
class to the root element in `client/index.html`:

```html
<html lang="en" class="reference-parity">
```

The affected tokens are listed and commented in `client/src/styles/tokens.css`.

## Verification tools

```bash
node tools/audit.mjs      # re-run Phase Zero against the reference
node tools/measure.mjs    # section-height parity, build vs reference  (W=390|834|1440)
node tools/interact.mjs   # interaction + accessibility smoke suite
node tools/clipsec.mjs    # capture one section  (IDS=tickets W=390)
```

`tools/measure.mjs` and `tools/interact.mjs` expect the dev server on
`http://localhost:5180` (`npm run dev -- --port 5180`).

```bash
# admin panel end-to-end: seeds, edits, reorders, then checks the public site
CONFIRM_WIPE=yes BASE=http://localhost:5183 API=http://localhost:5181   node tools/admin-e2e.mjs
```

`admin-e2e.mjs` **empties every collection** before it runs, so it refuses any
API that is not on localhost and needs `CONFIRM_WIPE=yes`. Point it at a
scratch database.
