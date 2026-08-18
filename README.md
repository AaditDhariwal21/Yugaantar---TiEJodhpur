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

The client runs standalone; the API is only needed once the registration form
(route 3.16) is wired up.

## Stack

| Concern | Choice |
|---|---|
| Framework | React 19 + Vite (JavaScript, function components + hooks) |
| Routing | React Router |
| Styling | CSS Modules over CSS custom properties (`src/styles/tokens.css`) |
| Motion | Framer Motion for scroll reveals and stagger; CSS keyframes for the marquees and card effects (matching how the reference does it) |
| Backend | Express — validation + stub logging for form intake |

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
  pages/          Home (Partnership + RegistrationForm still to come)
server/
  index.js
  routes/register.js
design-reference/
  design-audit.md, audit-*.json, probe-*.json
  screenshots/    reference captures
  build-shots/    our captures, for side-by-side
  raw/            served HTML + the reference's recovered component CSS
tools/            Playwright scripts: audit, probe, measure, interact, clipsec
```

## Editing content

Every string, speaker, session, price and partner lives under
`client/src/data/`. Swapping in real Yugaantar data is a **data-only edit** —
no component changes:

| File | Drives |
|---|---|
| `site.js` | brand, nav, hero, about, final CTA, footer |
| `experience.js` | experience cards, audience, themes, attend marquee pills |
| `speakers.js` | speaker roster (`tier: "key"` promotes to the featured row) |
| `committee.js` | committee roster |
| `agenda.js` | timeline blocks; add `tracks: []` to make a row expandable |
| `tickets.js` | pricing tiers; `featured: true` renders the gradient card |
| `partners.js` | partners by tier (filter counts derive automatically) + logo strip |

Anything written `[LIKE THIS]` is a placeholder awaiting real content. Photos
and logos accept `null` and fall back to an initial, which is what the
reference does too.

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
