/* ============================================================================
   Section 3.11 — Passes.

   The full catalogue as published on the TiE events platform
   (events.tie.org → Yugaantar → Buy Tickets), read from its ticket API on
   10 September 2026. Cards are display-only: buying happens on that platform,
   so there is one CTA under the whole carousel rather than a button per card.

   Shape:
     id        stable key
     eyebrow   short category label above the name
     name      pass name as published
     free      true for complimentary passes (renders a chip, no price)
     price     { current, currentNote, next, nextNote }
     access    one-line access summary
     includes  [] bullet list
     excludes  "" single line, omitted when nothing is excluded
     note      eligibility / availability caveat

   TODO(content): early-bird windows closed on 10 September 2026 for most
   passes. Once the platform flips to regular pricing, move `next` into
   `current` and drop the `next` line.
   ========================================================================== */

import { registrationUrl } from "./site";

/* Deep link straight to the pass selector rather than the event landing page. */
export const ticketsUrl = `${registrationUrl}#/buyTickets/selectTickets?lang=en`;

export const ticketsMeta = {
  badge: "Passes",
  heading: "Choose the pass that fits you",
  sub: "Every pass covers both days, 22–23 October at Hotel Radisson. Founders, students, industry teams and TiE members each have their own.",
  ctaLine: "Found the one that fits?",
  cta: { label: "Book your pass", href: ticketsUrl },
  fineprint:
    "All prices in INR, exclusive of applicable taxes and platform fees. Early-bird pricing and seat caps are as published on the TiE events platform, which remains the source of truth — pricing and availability there override anything shown here.",
};

/* The bundle most full-access passes carry, spelled out per pass so the client
   can edit any single one without untangling a shared constant. */
export const tickets = [
  {
    id: "delegate",
    eyebrow: "Most popular",
    name: "Yugaantar Delegate Pass",
    price: {
      current: "₹5,599",
      currentNote: "Early bird · per person, both days",
      next: "₹5,999",
      nextNote: "From 11 September",
    },
    access: "Full event access · 22–23 October · 2 days",
    includes: [
      "Complete Yugaantar experience",
      "Full conference access",
      "Innovation & Showcase Zone (stalls)",
      "Networking opportunities",
      "Founder Connect",
      "Industry–Startup Connect",
      "Meals",
    ],
    excludes: "TiE membership",
    note: "Early bird limited to the first 75 registrations",
  },
  {
    id: "startup",
    eyebrow: "For founders",
    name: "Yugaantar Start-Up Pass",
    price: {
      current: "₹4,999",
      currentNote: "Early bird · per person, both days",
      next: "₹5,599",
      nextNote: "From 11 September",
    },
    access: "Full event access · 22–23 October · 2 days",
    includes: [
      "Complete Yugaantar experience",
      "Full conference access",
      "Innovation & Showcase Zone (stalls)",
      "Networking opportunities",
      "Founder Connect",
      "Industry–Startup Connect",
      "Investor Connect (subject to eligibility and investor availability)",
      "Meals",
    ],
    excludes: "TiE membership",
    note: "Early bird limited to the first 75 registrations",
  },
  {
    id: "industry-2pax",
    eyebrow: "Team of two",
    name: "Yugaantar Industry Pass — 2 Pax",
    price: {
      current: "₹8,999",
      currentNote: "Early bird · for 2 people, both days",
      next: "₹9,999",
      nextNote: "From 11 September",
    },
    access: "Complete event access for 2 people · 22–23 October",
    includes: [
      "Complete Yugaantar experience for 2 people",
      "Full conference access",
      "Innovation & Showcase Zone (stalls)",
      "Networking opportunities",
      "Founder Connect",
      "Industry–Startup Connect",
      "Meals",
    ],
    excludes: "TiE membership",
    note: "Early bird limited to the first 25 registrations",
  },
  {
    id: "new-associate",
    eyebrow: "Pass + membership",
    name: "Yugaantar New Associate Member Pass",
    price: {
      current: "₹8,999",
      currentNote: "Early bird · per person, both days",
      next: "₹11,999",
      nextNote: "From 11 September",
    },
    access: "Full event access · 22–23 October · 2 days",
    includes: [
      "Complete Yugaantar experience",
      "Full conference access",
      "Innovation & Showcase Zone (stalls)",
      "Networking opportunities",
      "Founder Connect",
      "Industry–Startup Connect",
      "Investor Connect & networking opportunities",
      "Meals",
      "1-Year TiE Associate Membership",
      "Access to TiE Jodhpur programmes",
      "Access to other chapter events and programmes, subject to their guidelines",
    ],
    note: "Early bird limited",
  },
  {
    id: "student-membership",
    eyebrow: "Students",
    name: "Yugaantar Student Pass + TiE Jodhpur Membership",
    price: {
      current: "₹3,299",
      currentNote: "Early bird · per student, both days",
      next: "₹3,999",
      nextNote: "From 11 September",
    },
    access: "Full event access · 22–23 October · 2 days",
    includes: [
      "Complete Yugaantar experience",
      "Full conference access",
      "Innovation & Showcase Zone (stalls)",
      "Networking opportunities",
      "Founder Connect",
      "Industry–Startup Connect",
      "1-Year TiE Student (NxtGen) Membership",
      "Access to the local TiE ecosystem for a year",
    ],
    excludes: "Meals",
    note: "Students only, subject to verification · early bird limited to the first 35",
  },
  {
    id: "student",
    eyebrow: "Students",
    name: "Yugaantar Student Pass",
    price: {
      current: "₹999",
      currentNote: "Early bird · per student",
      next: "₹1,499",
      nextNote: "From 11 September",
    },
    access: "Expo & student pass · 22–23 October",
    includes: [
      "Student sessions",
      "Expo & Innovation Zone",
      "Networking opportunities",
    ],
    excludes: "Other conference sessions · TiE membership · meals",
    note: "Students only, subject to verification",
  },
  {
    id: "innovation-zone",
    eyebrow: "Expo only",
    name: "Yugaantar Innovation Zone",
    price: {
      current: "₹399",
      currentNote: "Early bird · per person",
      next: "₹499 → ₹699",
      nextNote: "₹499 to 10 Oct, then ₹699",
    },
    access: "Startup stalls showcase · 22–23 October",
    includes: ["Innovation & Showcase Zone (stalls)", "Networking opportunities"],
    excludes: "Conference access · TiE membership · meals · Founder Connect",
    note: null,
  },
  {
    id: "charter",
    eyebrow: "TiE members",
    name: "Charter Members",
    free: true,
    freeLabel: "Complimentary",
    access: "Complete event access · 22–23 October",
    includes: [
      "Complete Yugaantar experience",
      "Full conference access",
      "Innovation & Showcase Zone (stalls)",
      "Networking opportunities",
      "Founder Connect",
      "Industry–Startup Connect",
      "Investor Connect",
      "Meals",
    ],
    note: "Registration still required",
  },
  {
    id: "associate-jodhpur",
    eyebrow: "TiE members",
    name: "Associate Member — TiE Jodhpur",
    free: true,
    freeLabel: "Complimentary",
    access: "Complete event access · 22–23 October",
    includes: [
      "Complete Yugaantar experience",
      "Full conference access",
      "Innovation & Showcase Zone (stalls)",
      "Networking opportunities",
      "Founder Connect",
      "Industry–Startup Connect",
      "Investor Connect",
      "Meals",
    ],
    note: "Registration still required",
  },
  {
    id: "associate-other",
    eyebrow: "TiE members",
    name: "Associate Member — Other Chapters",
    price: {
      current: "₹3,999",
      currentNote: "Early bird · per person",
      next: "₹4,999",
      nextNote: "From 11 September",
    },
    access: "Complete event access · 22–23 October",
    includes: [
      "Complete Yugaantar experience",
      "Full conference access",
      "Innovation & Showcase Zone (stalls)",
      "Networking opportunities",
      "Founder Connect",
      "Industry–Startup Connect",
      "Investor Connect",
      "Meals",
    ],
    note: "Early bird limited to the first 50 tickets",
  },
  {
    id: "executive-director",
    eyebrow: "TiE network",
    name: "TiE Executive Director",
    price: {
      current: "₹4,299",
      currentNote: "Early bird · per person, both days",
      next: "₹4,999",
      nextNote: "From 11 September",
    },
    access: "Complete event access · 22–23 October",
    includes: [
      "Complete Yugaantar experience",
      "Full conference access",
      "Innovation & Showcase Zone (stalls)",
      "Networking opportunities",
      "Founder Connect",
      "Industry–Startup Connect",
      "Investor Connect",
      "Meals",
    ],
    note: "Early bird limited to the first 50 tickets",
  },
  {
    id: "spouse",
    eyebrow: "Accompanying guest",
    name: "Charter Member Spouse",
    price: {
      current: "₹5,999",
      currentNote: "Early bird · per guest",
      next: "₹6,999",
      nextNote: "From 11 September",
    },
    access: "Complete event access · 22–23 October",
    includes: [
      "Complete Yugaantar experience",
      "Full conference access",
      "Innovation & Showcase Zone (stalls)",
      "Networking opportunities",
      "Founder Connect",
      "Industry–Startup Connect",
      "Investor Connect",
      "Meals",
    ],
    note: "Must be accompanied by a Charter Member · early bird limited to the first 50",
  },
];
