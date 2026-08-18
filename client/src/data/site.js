/* ============================================================================
   Site-wide copy: brand, nav, hero, about, final CTA, footer.

   CONFIRMED facts (safe to keep): event name, organiser.
   Everything marked [PLACEHOLDER] / TODO awaits real Yugaantar data — the
   strings are deliberately the same *length and shape* as the reference so the
   layout can be QA'd against it before real copy lands.
   ========================================================================== */

export const site = {
  eventName: "Yugaantar 2026",
  organiser: "TiE Jodhpur",
  // TODO(content): real logo asset. Until then the wordmark renders as text.
  logo: null,
  logoAlt: "Yugaantar 2026 — TiE Jodhpur",
  url: "yugaantar.tiejodhpur.org", // TODO(content): confirm final domain
  title: "Yugaantar 2026 | Flagship Entrepreneurship Festival",
  description:
    "Join 300+ founders, investors, and corporate leaders at Yugaantar 2026 — the flagship entrepreneurship festival of TiE Jodhpur, 22–23 October 2026 at Hotel Radisson, Jodhpur.",
};

export const nav = {
  links: [
    { label: "About", href: "/#about" },
    { label: "Experience", href: "/#experience" },
    { label: "Agenda", href: "/#agendatable" },
    { label: "Speakers", href: "/#speakers" },
    { label: "Committee", href: "/#planningcommittee" },
    { label: "Tickets", href: "/#tickets" },
    { label: "Partnership", href: "/partnership" },
  ],
  cta: { label: "Register", href: "/tickets/registration-form" },
};

export const hero = {
  badge: "Yugaantar 2026 · The flagship entrepreneurship festival of TiE Jodhpur",
  /* The H1 is drawn on a canvas as blocky grid-type; the phrases cycle with a
     per-cell dissolve. They share one type size so the headline never resizes
     mid-cycle, and each splits on its space to stack on narrow screens. */
  gridHeadline: {
    phrases: ["Local Roots", "Global Routes"],
  },
  sub: "Two days in Jodhpur with the founders and investors shaping what comes next.",
  meta: [
    // TODO(content): confirm how the two days split — see `festival` below.
    { icon: "calendar", label: "Festival", value: "22–23 October 2026" },
    { icon: "sparkle", label: "Gala Dinner", value: "22 October 2026" },
    { icon: "pin", label: "Venue", value: "Hotel Radisson, Jodhpur" },
  ],
  ctas: [
    { label: "Register Your Interest", href: "/tickets/registration-form", variant: "grad" },
    { label: "Explore the Programme", href: "#experience", variant: "soft" },
  ],
  // TODO(content): real TiE Global / TiE Jodhpur figures.
  stats: [
    { value: 500000, suffix: "+", label: "Community", icon: "users" },
    { value: 12000, suffix: "+", label: "Corporate leaders", icon: "briefcase" },
    { value: 50000, suffix: "+", label: "Entrepreneurs & Mentors", icon: "spark" },
    { value: 15000, suffix: "+", label: "Investors", icon: "trend" },
  ],
  // Set to a date string to switch the countdown on, e.g. "2026-10-22T09:00:00+05:30".
  countdownTo: null,
};

export const about = {
  badge: "Welcome to Yugaantar",
  heading: "The meeting point for the people building India's next great companies.",
  body: "[PLACEHOLDER] Yugaantar brings together founders, investors, and corporate leaders for two days of high-signal conversations, investor connections, and partnerships across India. It's part of TiE — a global community founded in 1992 that has helped create over $1 trillion in enterprise value.",
  image: null, // TODO(content): hero-adjacent supporting photograph
  imageAlt: "Yugaantar 2026 in Jodhpur",
  stats: [
    { value: "300+", label: "Founders, investors & leaders" },
    { value: "2 Days", label: "Of high-signal programming" },
    { value: "India", label: "Where founders & capital meet" },
    { value: "Since 1992", label: "Backed by the global TiE network" },
  ],
};

export const finalCta = {
  heading: "Be part of Yugaantar.",
  body: "Register your interest to receive programme updates and early-access tickets.",
  cta: { label: "Register Your Interest", href: "/tickets/registration-form" },
};

export const footer = {
  tagline:
    "The flagship entrepreneurship festival of TiE Jodhpur — connecting founders, investors.",
  exploreTitle: "Explore",
  explore: [
    { label: "About", href: "/#about" },
    { label: "The Experience", href: "/#experience" },
    { label: "Speakers", href: "/#speakers" },
    { label: "Planning Committee", href: "/#planningcommittee" },
    { label: "Tickets", href: "/#tickets" },
    { label: "Partner With Us", href: "/partnership" },
  ],
  contactTitle: "Contact",
  // TODO(content): real chapter email + registered address.
  email: "president@jodhpur.tie.org",
  address: ["[Address line 1 TBC]", "Jodhpur, Rajasthan, India"],
  copyright: "© 2026 TiE Jodhpur. All rights reserved.",
  // Network-wide TiE hashtags — not chapter-specific, kept as-is.
  hashtags: "#TiEdTogether · #GoodfortheWorld",
};
