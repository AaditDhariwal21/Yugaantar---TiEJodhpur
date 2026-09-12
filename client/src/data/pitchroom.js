/* ============================================================================
   The Marwar Pitch Room — the flagship pitch competition inside Yugaantar.

   Copy comes from TiE's own event listing (`pitchRoomUrl`): the "Why attend?"
   blurb, the eligibility stages, the two application steps and the fee
   disclaimer, lightly trimmed.

   WHAT IS DELIBERATELY NOT HERE. The poster does the talking for everything
   printed on it, so none of it is repeated as text beside it:

     - the event name and the "Pitch Bold | Think Big | Build The
       Extraordinary" tagline
     - the dates, 22-23 October 2026, and Jodhpur
     - "The stage is set. The spotlight is yours."
     - "a premier platform for entrepreneurs to pitch, compete and unlock
       opportunities with Mentors, Investors and Industry Leaders"

   What is left is only what the artwork cannot say: who may apply, how to
   apply, what it costs, and by when. Adding any of the above back would put
   the same sentence on screen twice.

   Do not add a prize figure: TiE says "prize money" and names no amount.
   ========================================================================== */

import posterUrl from "../assets/marwarpitchroom.jpg";

/* Step one. Registering and paying happens on TiE's events platform. */
export const pitchRoomUrl =
  "https://events.tie.org/Yugaantar-TheMarwarPitchRoomPitchBoldIThinkBigIBuildTheExtraordinary";

/* Step two is the application form, which TiE emails out after registration.
   It also publishes the link openly —
   https://tiejodhpurangels.ssdspvhub.com/demoday/events-portfolio/2040 — but
   the section does not link it: it is a third domain (TiE Jodhpur Angels'
   deal-flow portal), and the steps only need to say what the steps are. */

export const pitchRoom = {
  image: posterUrl,
  imageAlt:
    "The Marwar Pitch Room at Yugaantar — pitch bold, think big, build the extraordinary. 22–23 October 2026, Jodhpur.",

  /* The section heading. The poster carries the name too, but as the only <h2>
     between the Committee and the Agenda it is what tells a reader scanning
     the page — or a search engine reading the outline — what this section is,
     and it matches the "Pitch Room" entry in the nav. */
  title: "Marwar Pitch Room",

  /* Both from TiE's "Why attend?" copy, and neither appears on the poster. */
  badge: "Live pitching at Yugaantar",
  heading: "Pitch on the main stage of Jodhpur's largest entrepreneurship conference.",
  lead: "Shortlisted startups pitch live in front of a curated panel of investors, entrepreneurs and ecosystem leaders. The top three take prize money, judged on the merit of the pitch, business potential and clarity of vision.",

  eligibility: {
    label: "Who can apply",
    stages: [
      { name: "Pre-revenue", detail: "An idea, a prototype or an MVP" },
      { name: "Revenue", detail: "Early revenue or a paying customer base" },
    ],
  },

  steps: {
    label: "How to apply",
    items: ["Register and pay the application fee", "Complete the application form"],
  },

  /* The registration offer on TiE's listing stops selling at the start of
     21 Sep 2026, and registering is step one of applying. Set this to null to
     hide the line — do that once the date passes rather than leaving a stale
     one up. */
  deadline: { label: "Applications close", value: "21 September 2026" },

  cta: { label: "Apply to pitch", href: pitchRoomUrl },

  /* TiE's own disclaimer, condensed but not softened — it is the one thing
     here someone can lose money by skimming past, so it carries the fee amount
     rather than leaving it to a separate stat. */
  feeNote:
    "The ₹1,000 + GST application fee covers registration and processing. Every application is reviewed, and only those shortlisted by the jury are invited to the next round — the fee secures your application, not your selection.",
};
