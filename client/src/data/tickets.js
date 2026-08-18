/* ============================================================================
   Section 3.11 — Tickets.

   Structured for the two-day festival (22–23 October) with the Gala Dinner on
   the evening of the 22nd:

     1. Festival Pass         both days, daytime programme
     2. Festival Pass + Gala  both days plus the Gala Dinner   ← Best Value
     3. Gala Dinner           standalone evening, no festival access

   TODO(content): tier names are inferred from the two-day structure and every
   price is a placeholder — confirm both before this goes live.
   ========================================================================== */

export const ticketsMeta = {
  badge: "Register Now",
  heading: "Secure your place at Yugaantar",
  sub: "Two days where India's founders, investors, and leaders meet. Choose the pass that fits you.",
  phase: null, // e.g. { label: "Early bird — closes 30 June" }
  fineprint:
    "[PLACEHOLDER] All prices in INR. The Gala Dinner on 22 October is a separate ticketed evening — it is not included in the Festival Pass, and on its own it does not include festival access. Seats are limited and allocated on a first-come basis.",
};

export const tickets = [
  {
    id: "festival",
    label: "Both Days",
    date: "22–23 October",
    title: "Festival Pass",
    body: "[PLACEHOLDER] Both days of the festival — keynotes, breakout tracks, pitch sessions, and networking, with lunch included on each day.",
    included:
      "All sessions across both days, networking, and lunch. The Gala Dinner is not included.",
    perk: {
      kicker: "Includes",
      value: "1-Year TiE Jodhpur Associate Membership",
      was: "₹5,000",
      now: "Included",
    },
    priceLabel: "Ticket Price",
    price: "₹4,999",
    note: "Per attendee · daytime programme, both days",
    cta: { label: "Register Now", href: "/tickets/registration-form" },
    featured: false,
  },
  {
    id: "festival-gala",
    label: "Best Value",
    date: "22–23 October",
    title: "Festival Pass + Gala Dinner",
    body: "[PLACEHOLDER] Both days of the festival, plus a seat at the Gala Dinner on the evening of 22 October.",
    included: "Everything in the Festival Pass, plus the Gala Dinner on 22 October.",
    perk: {
      kicker: "Includes",
      value: "1-Year TiE Jodhpur Associate Membership",
      was: "₹5,000",
      now: "Included",
    },
    priceLabel: "Festival + Gala",
    price: "₹7,999",
    note: "Per attendee · both days plus the gala evening",
    cta: { label: "Register Now", href: "/tickets/registration-form" },
    featured: true,
    flag: "Best Value",
  },
  {
    id: "gala",
    label: "Premium Evening",
    date: "22 October",
    title: "Gala Dinner",
    body: "[PLACEHOLDER] The most exclusive evening of Yugaantar. A limited-capacity dinner at Hotel Radisson — a room of founders, investors, and senior leaders, with conversation you won't get on a festival floor.",
    included:
      "Seated dinner, drinks, and curated networking. A standalone evening — festival access is not included.",
    perk: null,
    priceLabel: "Gala Dinner",
    price: "₹19,999",
    note: "Per guest · strictly limited seats",
    cta: { label: "Register Now", href: "/tickets/registration-form" },
    featured: false,
  },
];

export const charter = {
  title: "For Charter Members",
  body: "If you're a TiE Charter Member, your pass is complimentary. Register using the link below.",
  cta: { label: "Register as a charter member", href: "/tickets/registration-form?type=charter" },
};
