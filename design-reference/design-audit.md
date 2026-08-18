# Design Audit — tieconamsterdam.org

**Captured:** 2026-08-18 · **Reference published:** Aug 17, 2026 (Framer build `80f113d`)
**Method:** Playwright/Chromium at 1440 / 834 / 390, full-page screenshots + computed-style extraction,
plus recovery of the **hand-authored CSS** for every custom component out of the served HTML.

> **Fidelity note.** The reference is a Framer site, but every section that matters is a *custom code
> component* whose CSS ships verbatim in the page — complete with the original developer's comments.
> That CSS is in `raw/css/*.php`-style split files here. This is a far stronger source than screenshot
> eyeballing: exact clamps, easings, and breakpoints, not approximations.

---

## 0. Corrections to the brief's assumptions

Five things in the master prompt were guesses. The live site disagrees — **build to the site.**

| # | Brief assumed | Reality |
|---|---|---|
| 1 | Three.js / WebGL ambient background | **No WebGL anywhere.** Hero background is a 4-stop CSS `radial-gradient` mesh. The only `<canvas>` uses are a 2D grid-text headline and a 2D dither chip. **Do not add Three.js.** |
| 2 | Nav is transparent over hero, becomes solid/blurred on scroll | **Nav never changes.** It is `position:sticky; top:0` and permanently `rgba(255,255,255,.82)` + `backdrop-filter:blur(14px)` + 1px bottom hairline. Verified by measuring at scrollY 0 and 1600 — identical. |
| 3 | Nav collapses at the tablet breakpoint (~768) | Collapses at **1100px**. The dev's comment explains why: seven links + logo + CTA stop fitting below ~1100. |
| 4 | Partner logos are grayscale→color on hover | **Explicitly not.** Dev comment: *"Logos always render in full colour — no greyscale, no dimming. Partner marks are brand assets."* Hover is `scale(1.04)` + card lift only. |
| 5 | "Who should attend" is a centred H2 above two marquee rows | It is a **horizontal bar**: fixed 232px label column (H2 + gradient rule + sub-line) on the left, the two lanes on the right. Stacks below 860px. |

Also worth knowing: the **final CTA band and the footer are a single component** sharing one
`linear-gradient(125deg,#2A0A12,#7C0C24 55%,#B11030)` background — not two separately-coloured bands.

---

## 1. Design tokens

### Colour

| Token | Value | Role |
|---|---|---|
| `--red` | `#E4002B` `rgb(228,0,43)` | TiE brand red — primary accent, 115 uses |
| `--crimson` | `#C20E4D` `rgb(194,14,77)` | Gradient partner to red (always `135deg`) |
| `--gold` | `#D8B46A` `rgb(216,180,106)` | Agenda-section accent only (track labels, links) — 142 uses, all in the dark agenda block |
| `--ink` | `#1A1620` `rgb(26,22,32)` | Primary text |
| `--muted` | `#6B6571` `rgb(107,101,113)` | Secondary text |
| `--line` | `#ECE7E5` `rgb(236,231,229)` | Hairline border — 151 uses, the single most common border |
| `--cream` | `#FAF7F6` `rgb(250,247,246)` | Alternating section background |
| `--hero-bg` | `#FFFBFA` `rgb(255,251,250)` | Hero gradient base |
| `--dark` | `#2A0C13` `rgb(42,12,19)` | Agenda section ground |
| `--dark-glow` | `#8E2032` `rgb(142,32,50)` | Agenda radial glows |
| white | `#FFFFFF` | Card ground — 197 uses |

**Tint ladder on red** (used constantly for soft fills):
`rgba(228,0,43,.05 / .06 / .07 / .08 / .12 / .14 / .2 / .22 / .3 / .33)`

**The signature gradient** — appears on every CTA, chip, avatar ring, and rule:
```css
linear-gradient(135deg, #E4002B, #C20E4D)
```
Gradient **text** (stat numbers) uses `120deg` + `background-clip:text; color:transparent`.

### Typography

Single family: **Inter Variable**, self-hosted as `TiEconInterVariable` from
`https://rsms.me/inter/font-files/InterVariable.woff2?v=4.0`, `font-weight:100 900`, `font-display:swap`.
Fallback stack: `Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`.

Everything is fluid via `clamp()`. Measured at 1440px:

| Role | Clamp | @1440 | Weight | Line-height | Tracking |
|---|---|---|---|---|---|
| Section H2 | `clamp(29px,3.8vw,46px)` | 46px | 800 | 1.12 | `-.025em` |
| Hero split H2 | `clamp(28px,3.6vw,44px)` | 44px | 800 | 1.14 | `-.025em` |
| Banner headline | `clamp(24px,3.2vw,40px)` | 40px | 800 | 1.15 | `-.02em` |
| Attend H2 | `clamp(22px,2.1vw,27px)` | 27px | 800 | 1.16 | `-.025em` |
| Section sub-line | `clamp(16px,1.4vw,18px)` | 18px | 400 | 1.6 | — |
| Hero sub | `clamp(16.5px,1.6vw,20px)` | 20px | 400 | 1.6 | — |
| Eyebrow badge | `12.5px` | 12.5px | 600 | — | `.03em` |
| Card title | `19px` | 19px | 700 | — | `-.01em` |
| Card body | `14.5px` | 14.5px | 400 | 1.6 | — |
| Price | `clamp(34px,4vw,42px)` | 42px | 800 | 1 | `-.02em` |
| Stat value | `clamp(30px,3.4vw,44px)` | 44px | 800 | — | `-.02em` |
| Speaker name (key / general) | `19.5px / 17px` | | 700 | — | `-.01em` |
| Group label | `12.5px` | | 700 | — | `.12em` uppercase |
| Track label | `10px` | | 700 | — | `.14em` uppercase |

### Spacing / geometry

- **Section padding:** `clamp(64px, 8vw, 112px)` — the dominant rhythm.
  Committee `clamp(56px,7vw,96px)` · Attend `clamp(44px,5.5vw,74px)` · Footer CTA `clamp(56px,7vw,92px)`
- **Container:** `max-width:1200px; padding:0 clamp(22px,5vw,56px)` → **1240px** for nav, **1320px** at ≥1600px
- **Radii:** `999px` pills (141×) · `24px` ticket · `22px` card/pill-strip · `20px` stat/speaker/committee
  · `18px` partner · `14px` icon-tile & button · `13px` chip · `12px` small tile · `50%` avatar
- **Borders:** `1px solid #ECE7E5` everywhere; accents `1px solid rgba(228,0,43,.22)`
- **Shadows:**
  ```
  card       0 10px 30px rgba(40,12,20,.06)
  ticket     0 4px 16px rgba(40,12,20,.05), 0 18px 44px rgba(40,12,20,.07)
  hover-lift 0 22px 52px rgba(40,12,20,.10)
  pill-strip 0 24px 60px rgba(40,12,20,.10)
  banner     0 36px 80px rgba(40,12,20,.20)
  imgcard    0 30px 70px rgba(40,12,20,.14)
  cta-red    0 12px 28px rgba(228,0,43,.20)
  agenda-row 0 8px 20px rgba(0,0,0,.22)
  ```

---

## 2. Motion spec

**Scroll-reveal** — one shape, retimed per section. Always `opacity 0→1` + `translateY(N)→0`,
`animation-fill-mode: both` (dev comment: so cards stay visible if the animation never fires).

| Section | Duration | Y | Easing |
|---|---|---|---|
| Committee | `.55s` | 22px | `cubic-bezier(.22,1,.36,1)` |
| Speakers (key) | `.6s` | 24px | `cubic-bezier(.22,1,.36,1)` |
| Partners | `.6s` | 22px | `cubic-bezier(.22,1,.36,1)` |
| Tickets | `.7s` | 30px | `cubic-bezier(.22,1,.36,1)` |
| Agenda | `.8s` | 20px | `cubic-bezier(.16,1,.3,1)` |

Cards are **staggered by inline `animation-delay`** in ms, per index.

**Marquees** — all `translateX(0) → translateX(-50%)` over a doubled track, `linear infinite`,
`animation-play-state:paused` on hover:

| Strip | Duration | Direction |
|---|---|---|
| Attend row 1 | `66.24s` | normal |
| Attend row 2 | `62.08s` | **reverse** |
| Global logos | `30s` | normal |

Durations are computed from content length, not hardcoded — row 1 is 7612px wide, row 2 6761px.
Edges use a **mask**, not a hard clip: `linear-gradient(90deg,transparent,#000 7%,#000 93%,transparent)`.

**Hover transitions**

```
pills          transform, border-color, color        .2s ease
cards          transform, box-shadow, border-color   .32s cubic-bezier(.22,1,.36,1)
underline bar  width                                 .38s cubic-bezier(.22,1,.36,1)
photo zoom     transform                             .55s cubic-bezier(.22,1,.36,1)
badge pop      opacity .3s ease, transform .3s cubic-bezier(.34,1.56,.64,1)   ← springy
logo           filter/opacity .3s, transform .45s cubic-bezier(.22,1,.36,1)
```

Lift amounts: pill `-2px` · card `-5px` · committee `-6px` · partner `-6px` · speaker `-8px` · button `-3px`.

**Ticket card, "Best Value"** — the most elaborate object on the page. Layers, bottom to top:
`glow` halo (blurred 9px gradient, `glowShift` 4s alternate) → card → `grain` (inline SVG
fractalNoise, opacity .4) → `spot` (460px radial following cursor via `--mx/--my`) →
`shim` (105deg white sweep, `shimmer` 5.5s) → `glass` (1px top highlight) → `flag` ribbon → content.
The card itself **tilts with the cursor**: `transform: rotateX(var(--rx)) rotateY(var(--ry))` under
`perspective:1100px`, snapping to `.08s linear` while hovered and easing back over `.4s`.

`prefers-reduced-motion: reduce` is honoured throughout — marquees stop and wrap into a static
cloud, entrance animations are cancelled.

---

## 3. Section inventory (DOM order, measured at 1440)

| # | Anchor | Component | Top | Height | Padding | Ground |
|---|---|---|---|---|---|---|
| 1 | — | `tnv-R3m6lp` navbar | sticky | 76px | — | `rgba(255,255,255,.82)` + blur(14) |
| 2 | `#top` | `tch-R3malp` hero | 77 | 800 | — | radial mesh on `#FFFBFA` |
| 3 | `#about` | `tch-R3malp` (same cmp) | 920 | 853 | 112 | white |
| 4 | `#experience` | `tch-Rqelp` | 1773 | 3241 | 112 | white / `#FAF7F6` alt |
| 5 | `#agenda` | `tch-Rqelp` themes | 4162 | 851 | 112 | white |
| 6 | `#attend` | `tcad-Rqilp` marquee | 5013 | 279 | 74 | `#FAF7F6` |
| 7 | `#speakers` | `tch-Rqmlp` | 5293 | 4922 | 112 | `#FAF7F6` |
| 8 | `#planningcommittee` `#committee` | `tch-Rqqlp` | 10214 | 700 | 96 | white |
| 9 | `#agendatable` | `tag-Rqulp` (inline) | 10915 | 1748 | — | `#2A0C13` + radial `#8E2032` |
| 10 | `#tickets` | `tch-R3n2lp` | 12662 | 1470 | 112 | white |
| 11 | `#sponsors` | `tch-Rr6lp` partners | 14133 | 1932 | 112 | white |
| 12 | `#partners` | `tch-Rralp` logo strip | 16064 | 543 | 112 | white |
| 13 | `#contact` | `tft-Rrelp` CTA + footer | 16607 | 824 | 92 / 72 | maroon→crimson gradient |

Total document height: **17431px** desktop · 20938 tablet · 24109 mobile.

### Notable structural details

- **Hero + About are one component.** The 4-stat strip is a white pill card with
  `margin-top:-66px`, overlapping the hero/about boundary, `border-radius:22px`,
  `box-shadow:0 24px 60px rgba(40,12,20,.10)`, grid `auto-fit minmax(150px,1fr)`.
  There is also a **countdown** row (`.cd`) with gradient-text numbers under it.
- **The H1 is drawn on a `<canvas>`**, not laid out as text — a full-bleed "grid band"
  `height:clamp(200px,30vh,330px)` masked at both edges, with a second masked line layer over it.
  Accessible text lives in the `<h1>` which is `font-size:0`.
- **Key speakers use flex, not grid.** Dev comment explains: an `auto-fit` grid stretches tracks, so
  two key speakers would balloon to ~520px each. `flex:0 1 262px; max-width:300px`, centred.
- **Speaker cards** are photo-forward, `aspect-ratio:4/5`, radius 14px (16px for key). Country tag
  top-left, LinkedIn button bottom-right revealed on hover (`opacity 0 → 1`, springy). Under
  `@media (hover:none)` both are made permanently visible — the touch fallback.
- **Group labels** ("Key Speakers" / "Speakers") are an eyebrow + a hairline running off to the right:
  `display:flex; gap:18px` with `i{flex:1;height:1px;background:#ECE7E5}`.
- **Committee avatars** are 98px circles with a double ring:
  `box-shadow: 0 0 0 3px #fff, 0 0 0 4px rgba(228,0,43,.2)` → solid red on hover.
- **Agenda** is the only dark section. Times are `13px/700` white, titles `16px/700 .5em uppercase`,
  subtitles `rgba(255,255,255,.78)`. Track labels are **gold** `#D8B46A` `10px/700 .14em`.
  Two breakout blocks: 12:00 (3 tracks) and 16:30 (4 tracks).
- **Partners** filter chips carry live counts (`All 8`, `Knowledge Partner Sponsor 2`,
  `Silver Partner 5`, `Exhibitor 1`); active chip is the red gradient. Tiers render as labelled
  groups with a count badge. Logo tiles are `aspect-ratio:3/2` (16/9 for the large tier).

---

## 4. Responsive behaviour

The reference is authored **desktop-first** (`max-width` queries) leaning on `auto-fit/minmax`.
Per the brief we author **mobile-first** with `min-width` queries — targeting an *identical rendered
result* at every width, not identical source order.

| Reference breakpoint | Our `min-width` equivalent | What changes |
|---|---|---|
| `max-width:560` | base → `≥561px` | Speakers/committee/partners go **2-up** on phones (not 1-up); smaller avatars, type, padding |
| `max-width:600` | `≥601px` | Ticket cards drop `min-height:480px`, stack |
| `max-width:860` | `≥861px` | Attend bar stacks (label above lanes, lanes full-bleed `100vw`); footer columns → 1 |
| `max-width:880` | `≥881px` | Hero/About split → 1 column, image moves to `order:-1` (above text) |
| `max-width:1100` | `≥1101px` | **Nav switches** burger ↔ full link row |
| `min-width:1600` | `≥1600px` | Container widens 1200 → 1320 (nav 1240 → 1360) |

Grid column rules as authored:

```
experience 6-card   auto-fit minmax(280px,1fr)   → 1 / 2 / 3
audience 4-card     auto-fit minmax(230px,1fr)   → 1 / 2 / 4
themes 6-card       auto-fit minmax(280px,1fr)   → 1 / 2 / 3
speakers            auto-fit minmax(180px,1fr)   → 2 / 4 / 6   (forced 2-up ≤560)
committee           auto-fit minmax(196px,1fr)   → 2 / 3 / 5   (forced 2-up ≤560)
tickets             auto-fit minmax(290px,1fr)   → 1 / 2 / 3
hero stat pill      auto-fit minmax(150px,1fr)   → 2 / 4 / 4
about stats         auto-fit minmax(160px,1fr)   → 1 / 2 / 4
```

Note the phone behaviour is **2-up, not 1-up**, for speakers/committee — the dev's comment says
*"2 per row so people don't scroll forever."* Matching that matters; a naive 1-column mobile stack
would be a visible deviation.

Touch handling: `@media (hover:none)` reveals hover-only affordances (speaker LinkedIn button, photo
overlay) permanently, and removes logo dimming. Tap targets: LinkedIn 40×40 (committee 34×34),
nav mobile links `13px` vertical padding on a 15px line ≈ 45px, chips ~36px.

---

## 5. Assets

- **Logo:** `framerusercontent.com/images/iNM1htmwzKWboIrgkoqRlINI3yc.png` (795×227), rendered 40px tall
- **Fonts:** Inter Variable from rsms.me
- Speaker/committee photos and partner logos are all `framerusercontent.com` — **replace with
  Yugaantar assets**; placeholders render initials on a red-tint gradient, which is the built-in
  fallback and what we will ship until real assets arrive.

## 6. Files

```
design-reference/
  design-audit.md          ← this file
  audit-home.json          computed styles, 3 viewports
  probe-home.json          deep probe: motion, census, sections
  screenshots/
    home-desktop-1440.png  home-tablet-834.png  home-mobile-390.png
    home-nav-scrolled.png
  raw/
    home.html  home.txt    served markup + extracted copy
    css/       navbar hero unknown-Rqelp attend-marquee speakers committee
               tickets partners logostrip footer framer-core
```
