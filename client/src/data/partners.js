/* ============================================================================
   Sections 3.12 / 3.13 — Partners (tiered + filterable) and the Global
   Community logo marquee.

   Partner shape: { name, logo, url, tier, exclusive? }
     tier must match a `key` in partnerTiers; the filter chips derive their
     counts from the list, so adding a partner updates the chips automatically.
     logo: null → renders the partner's initial, matching the reference fallback.
   ========================================================================== */

export const partnersMeta = {
  badge: "Our Partners",
  heading: "The organisations behind Yugaantar 2026",
  sub: "[PLACEHOLDER] Brands backing the founders, investors, and leaders building India's next great companies.",
  ctaLine: "Interested in putting your brand in the room?",
  cta: { label: "Explore partnership options", href: "/partnership" },
};

/* Order here is the render order of the tier groups. */
export const partnerTiers = [
  { key: "knowledge", label: "Knowledge Partner Sponsor" },
  { key: "silver", label: "Silver Partner" },
  { key: "exhibitor", label: "Exhibitor" },
];

// TODO(content): replace with real Yugaantar partners + logo assets.
export const partners = [
  { name: "[Knowledge Partner 01]", logo: null, url: null, tier: "knowledge" },
  { name: "[Knowledge Partner 02]", logo: null, url: null, tier: "knowledge" },
  { name: "[Silver Partner 01]", logo: null, url: null, tier: "silver" },
  { name: "[Silver Partner 02]", logo: null, url: null, tier: "silver" },
  { name: "[Silver Partner 03]", logo: null, url: null, tier: "silver" },
  { name: "[Silver Partner 04]", logo: null, url: null, tier: "silver" },
  { name: "[Silver Partner 05]", logo: null, url: null, tier: "silver" },
  { name: "[Exhibitor 01]", logo: null, url: null, tier: "exhibitor", exclusive: true },
];

export const globalCommunity = {
  badge: "Our Global Community",
  heading: "Organisations that power TiE Global",
  sub: "",
  // TODO(content): real TiE chapter / partner logo assets.
  logos: [
    { name: "TiE Global", logo: null },
    { name: "TiE Jodhpur", logo: null },
    { name: "TiE Rajasthan", logo: null },
    { name: "TiE Delhi-NCR", logo: null },
    { name: "TiE Mumbai", logo: null },
    { name: "TiE Bangalore", logo: null },
    { name: "TiE Hyderabad", logo: null },
    { name: "TiE Pune", logo: null },
    { name: "TiE Chennai", logo: null },
    { name: "TiE Ahmedabad", logo: null },
  ],
};
