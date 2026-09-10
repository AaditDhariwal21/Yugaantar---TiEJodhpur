# Yugaantar 2026 — build progress

Reference: <https://tieconamsterdam.org/> · Audit: [`design-reference/design-audit.md`](design-reference/design-audit.md)

## Phase Zero — live-site analysis

- [x] Playwright/Chromium capture at 1440 / 834 / 390, full-page screenshots
- [x] Computed-style extraction: colour, type scale, spacing, radii, shadows, easings
- [x] Scroll-behaviour audit: reveals, counters, marquees, sticky nav, hover states
- [x] DOM section order recorded (13 anchored blocks)
- [x] **Recovered the reference's hand-authored CSS** from the served HTML —
      exact clamps, keyframes and breakpoints rather than eyeballed values
- [x] `design-reference/design-audit.md` written

## Landing page (`/`)

| # | Section | Anchor | Status |
|---|---------|--------|--------|
| 3.1 | Navbar | — | ✅ sticky, translucent+blur, burger < 1100px |
| 3.2 | Hero | `#top` | ✅ canvas grid headline, meta row, 2 CTAs, count-up stat pill |
| 3.3 | About | `#about` | ✅ split + 4-stat gradient-text grid |
| 3.4 | Experience | `#experience` | ✅ 9-card grid on cream + full-width image banner |
| 3.5 | Who's in the Room | — | ✅ 8-card grid on cream |
| 3.6 | On the Agenda (themes) | `#agenda` | ✅ 6-card grid |
| 3.7 | Who should attend | `#attend` | ✅ label column + 2 counter-scrolling lanes, dither field & chips |
| 3.8 | Delegates | `#delegates` | ✅ featured (flex) + general (grid) tiers, hover LinkedIn, group labels · `#speakers` kept as a legacy anchor |
| 3.9 | Planning Committee | `#planningcommittee` | ✅ avatar grid, year chip |
| 3.10 | Agenda | `#agendatable` | ✅ dark section, Day 1/Day 2 switcher, type filters, timeline, expandable breakouts, working .ics download |
| 3.11 | Passes | `#tickets` | ✅ 12-pass auto-scrolling belt, pauses on hover, display-only cards + one deep-linked CTA |
| 3.12 | Partners | `#sponsors` | ✅ counted filter chips, tier groups, logo tiles |
| 3.13 | Global Community | `#partners` | ✅ 30s logo marquee |
| 3.14 | Final CTA band | `#contact` | ✅ |
| 3.15 | Footer | `#contact` | ✅ 3 columns + bottom bar |

## Infrastructure

- [x] Vite + React (JS), React Router, CSS Modules, Framer Motion
- [x] Design tokens in `client/src/styles/tokens.css` — no loose hex in components
- [x] All copy in `client/src/data/*` — swapping real content is a data-only edit
- [x] Express API: `POST /api/register`, `POST /api/partnership` (validated, stubbed to console)

## Content status

**Confirmed and applied**

- Event: **Yugaantar 2026**, the flagship entrepreneurship festival of **TiE Jodhpur**
- Dates: **22–23 October 2026** (Thu–Fri), full programme on both days
- Venue: **Hotel Radisson, Jodhpur**
- Hero headline cycles **"Local Roots" ⇄ "Global Routes"**
- Gala Dinner: evening of **22 October**

**Derived from the above — please sanity-check**

- Ticket tiers were rebuilt around the two-day shape: Festival Pass /
  Festival Pass + Gala Dinner (Best Value) / Gala Dinner. **Names are inferred
  and all prices are still placeholder.**
- Agenda now carries a Day 1 / Day 2 switcher; the three stat tiles are counted
  from `agenda.js` at render time, so they cannot drift out of date.
- "One day" copy became "two days" throughout (hero sub, About body and stat
  tile, Experience heading and banner, Tickets sub, Agenda sub).
- "Conference" became "festival" in the badge, page title, meta description and
  footer tagline, matching the wording you gave for the badge.

**Round 2 (final copy supplied)**

- Hero sub-line, and the date row now reads **Startup Festival · 22–23 October 2026**
- **The Experience** expanded 6 → **9 cards**, all copy final (added Masterclasses,
  Global Market Access, Showcase & Expo; new `graduation` and `bulb` icons)
- Red banner: "Two days that connect the people, capital and ideas shaping
  Jodhpur's startup economy."
- **Who's in the Room** expanded 4 → **8 cards**, all copy final

**Round 3**

- Hero tagline now reads in full across the cycle: a quiet connector word
  ("From" / "to") sits above the pixel band and swaps in step with the
  dissolve, so it spells *From Local Roots to Global Routes*. The `aria-label`
  carries the whole tagline in one string.
- **Speakers → Delegates** — nav, footer, heading, group labels and copy.
  Sub-line now says the line-up is indicative and subject to change. Anchor
  moved to `#delegates`, with `#speakers` retained so old links still land.
- **Passes section rebuilt.** All **12** published passes now show, read from
  the TiE events ticket API on 10 Sep 2026 — real names, early-bird and
  regular prices, inclusions, exclusions and seat caps. Cards are display-only
  (no per-card buy button); one CTA under the belt deep-links to the pass
  selector. The old 3-card tilt/glow treatment and the separate charter
  callout are gone — Charter Members is now one of the twelve.

**Still placeholder** — delegates, committee, Day 2 sessions, partner
logos, community stats, chapter address, supporting photography, logo asset,
About body, Themes cards, audience sub-line.

## Not started

- [ ] **3.16 `/partnership`** — needs its own Phase Zero pass against the live page
- [ ] **3.16 `/tickets/registration-form`** — same

## Verification

Interaction suite (`node tools/interact.mjs`) — 11/11 passing, zero console errors:
agenda filters · breakout expand · partner filters · nav anchors · ticket tilt ·
marquee motion · count-up · mobile nav collapse/open/close · 44px tap targets.

Height parity vs the reference (`node tools/measure.mjs`):

| width | build | reference | delta |
|-------|-------|-----------|-------|
| 1440 | 17 532 | 17 414 | +0.7% |
| 834 | 21 675 | 20 861 | +3.9% |
| 390 | 25 733 | 24 109 | +6.7% |

Residual delta is placeholder-copy length (bracketed strings run longer than the
reference's real copy) and a 5-person committee vs the reference's 3.

## Open decisions for you

1. ~~**Dropped-token parity.**~~ **Decided 2026-08-18: render the intended
   styling.** The reference's Framer build emits invalid CSS
   (`rgb(228, 0, 43)12`) for a set of tinted fills, borders and the committee
   avatar ring, so those paint bare on the live site. We restore them using the
   alpha values stranded in the reference's own source. `class="reference-parity"`
   on `<html>` reverts to the reference's rendering for diffing.
2. **Registration destination.** `/api/register` validates and logs only.
   Confirm DB / email / Google Sheet before it is wired.
3. **Real content.** Everything bracketed `[LIKE THIS]` is awaiting your data —
   dates, venue, speakers, committee, agenda, pricing, partner logos, stats.
