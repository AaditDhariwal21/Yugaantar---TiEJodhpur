/* ============================================================================
   The Marwar Pitch Room — the flagship pitch competition inside Yugaantar.

   Everything here comes from TiE's own event listing (`pitchRoomUrl`): the
   "Why attend?" copy, the eligibility stages, the two application steps and
   the fee disclaimer are transcribed from it, lightly trimmed for the page.
   The poster artwork supplies the tagline and the kicker. `deadline` is the
   date the listing's registration offer stops selling, which is step one of
   applying — see the note on it below.

   Anything still unconfirmed is marked TODO(content). Do not add a prize
   figure here: TiE says "prize money" and names no amount.
   ========================================================================== */

/* Step one. Registering and paying happens on TiE's events platform. */
export const pitchRoomUrl =
  "https://events.tie.org/Yugaantar-TheMarwarPitchRoomPitchBoldIThinkBigIBuildTheExtraordinary";

/* Step two is the application form itself, which TiE emails out after
   registration. It also publishes the link openly —
   https://tiejodhpurangels.ssdspvhub.com/demoday/events-portfolio/2040 — but
   the section deliberately does NOT link it: it is a third domain (TiE Jodhpur
   Angels' deal-flow portal), and the fee and the deadline already sit in the
   panel below, so the steps only need to say what the two steps are. */

export const pitchRoom = {
  badge: "The Marwar Pitch Room",
  /* The poster sets this as three beats separated by rules. `heading` is the
     plain version used as the accessible label; the section renders
     `headingParts` so the beats can break and colour the way the artwork
     does. */
  heading: "Pitch bold. Think big. Build the extraordinary.",
  headingParts: ["Pitch bold.", "Think big.", "Build the extraordinary."],
  sub: "Pitch your venture live on the main stage of Jodhpur's largest entrepreneurship conference — competing for prize money in front of a curated panel of investors, entrepreneurs and ecosystem leaders.",

  highlights: [
    {
      icon: "mic",
      label: "The main stage",
      title: "Pitch live at Yugaantar",
      body: "Shortlisted startups pitch on the main stage, in front of the whole festival and a curated panel of investors, entrepreneurs and ecosystem leaders.",
    },
    {
      icon: "trend",
      label: "Prize money",
      title: "Three startups take it",
      body: "The top three are chosen on the merit of the pitch, business potential, clarity of vision and overall evaluation.",
    },
    {
      icon: "handshake",
      label: "Everyone who pitches",
      title: "More than the trophy",
      body: "Visibility, feedback, and access to a curated ecosystem of entrepreneurs, mentors and investors — whether or not you place.",
    },
  ],

  eligibility: {
    label: "Who can apply",
    heading: "Open to startups at either stage.",
    stages: [
      {
        name: "Pre-revenue",
        question: "Have an idea, a prototype or an MVP?",
        focus: [
          "Problem validation, ideation and early learning",
          "Product validation, customer traction and business model",
        ],
      },
      {
        name: "Revenue",
        question: "Have early revenue or a paying customer base?",
        focus: ["Growth, scaling, unit economics and investment readiness"],
      },
    ],
  },

  /* Just the two beats, in order. The amount, the deadline and the button all
     live in the panel underneath, so repeating them on the steps only made
     them longer than the thing they describe. */
  steps: {
    label: "How to apply",
    items: ["Register and pay the application fee", "Complete the application form"],
  },

  /* The line across the bottom of the poster. */
  kicker: "The stage is set. The spotlight is yours.",

  meta: [
    { icon: "calendar", label: "Semi-finals & finals", value: "22–23 October 2026" },
    { icon: "pin", label: "Venue", value: "Hotel Radisson, Jodhpur" },
    { icon: "ticket", label: "Application fee", value: "₹1,000 + GST" },
    { icon: "trend", label: "Prize money", value: "Top three startups" },
  ],

  /* TiE's own disclaimer, condensed but not softened. It is the one thing on
     this page an applicant can lose money by misreading, so it stays next to
     the button rather than in the small print at the foot of the section. */
  feeNote:
    "The fee covers registration and processing of your application. Every application is reviewed, and only those shortlisted by the jury are invited to the next round — the fee secures your application, not your selection.",

  /* The registration offer on TiE's listing stops selling at the start of
     21 Sep 2026, and registering is step one of applying. Set this to null to
     hide the line — do that once the date passes rather than leaving a stale
     one up. */
  deadline: { label: "Applications close", value: "21 September 2026" },

  cta: { label: "Apply to pitch", href: pitchRoomUrl },
  ctaNote: "Registration and the application form are handled on TiE's own platforms.",
};
