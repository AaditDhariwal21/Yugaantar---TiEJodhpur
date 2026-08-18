/* ============================================================================
   Section 3.10 — The Agenda.

   Yugaantar runs a full programme on BOTH days, with the Gala Dinner on the
   evening of day one. The timeline is filtered by day first, then by session
   type.

   Block shape:
     { day, type, start, end, title, subtitle, tracks? }
       day:    1 | 2                            — which day tab it belongs to
       type:   "plenary" | "breakout" | "break" — drives the type filter chips
       tracks: [{ label, title, subtitle }]     — makes the row expandable

   The three stat tiles are COUNTED FROM THIS ARRAY at render time, so editing
   the schedule keeps them honest — you never have to remember to bump them.

   TODO(content): session titles, times and tracks are all placeholder.
   ========================================================================== */

export const agendaMeta = {
  badge: "Innovation & Beyond",
  headingLines: ["The", "Agenda"],
  sub: "[PLACEHOLDER] Two days, deliberately paced — from the opening address to the closing awards. Plenary conversations, parallel breakout tracks, and the breaks where most of the deals actually start.",
  // labels only; the numbers are derived from `agenda` below
  statLabels: {
    plenary: "Plenary sessions",
    breakout: "Breakout tracks",
    days: "Days",
  },
  addToCalendar: "Add to calendar",
  venue: "Hotel Radisson · Jodhpur",
  /* Drives the .ics the "Add to calendar" button generates. `endExclusive` is
     the morning after the last day — the iCalendar spec treats all-day DTEND
     as exclusive, so 24 Oct here means the event ends on the 23rd. */
  calendar: {
    start: "20261022",
    endExclusive: "20261024",
    summary: "Yugaantar 2026 — TiE Jodhpur",
    location: "Hotel Radisson, Jodhpur, Rajasthan, India",
    description:
      "The flagship entrepreneurship festival of TiE Jodhpur. Two days of keynotes, breakout tracks, pitch sessions and investor connections.",
  },
};

/* 22 Oct 2026 is a Thursday, 23 Oct a Friday. */
export const agendaDays = [
  { key: 1, label: "Day 1", short: "22 Oct", date: "Thursday, 22 October 2026" },
  { key: 2, label: "Day 2", short: "23 Oct", date: "Friday, 23 October 2026" },
];

export const agendaFilters = [
  { key: "all", label: "Full Day" },
  { key: "plenary", label: "Plenary" },
  { key: "breakout", label: "Breakouts" },
  { key: "break", label: "Breaks & Networking" },
];

export const agenda = [
  // ---------------------------------------------------------------- DAY 1
  {
    day: 1,
    type: "break",
    start: "09:00 AM",
    end: "09:45 AM",
    title: "Registrations & Welcome Coffee",
    subtitle: "",
  },
  {
    day: 1,
    type: "plenary",
    start: "09:45 AM",
    end: "10:00 AM",
    title: "Welcome Note & Opening Address",
    subtitle: "",
  },
  {
    day: 1,
    type: "plenary",
    start: "10:00 AM",
    end: "10:40 AM",
    title: "[PLACEHOLDER] India's Next Trillion",
    subtitle:
      "[PLACEHOLDER] Expanding horizons: unlocking India's domestic market at scale.",
  },
  {
    day: 1,
    type: "plenary",
    start: "10:40 AM",
    end: "11:20 AM",
    title: "[PLACEHOLDER] From Payments to Platforms",
    subtitle: "[PLACEHOLDER] The future of financial innovation and commerce.",
  },
  {
    day: 1,
    type: "plenary",
    start: "11:20 AM",
    end: "12:00 PM",
    title: "[PLACEHOLDER] AI as Propeller of EBITDA",
    subtitle: "[PLACEHOLDER] Beyond the buzz: can AI really move the EBITDA needle?",
  },
  {
    day: 1,
    type: "breakout",
    start: "12:00 PM",
    end: "01:00 PM",
    title: "Breakout Sessions",
    subtitle: "",
    tracks: [
      {
        label: "Track 01",
        title: "[PLACEHOLDER] Beyond Harvest: Agri-Tech & Food Supply Chains",
        subtitle:
          "[PLACEHOLDER] From farm to market: building resilient agri-supply chains under climate and regulatory pressure.",
      },
      {
        label: "Track 02",
        title: "[PLACEHOLDER] Profit vs. Access in Next-Gen Healthcare",
        subtitle:
          "[PLACEHOLDER] Healthcare economics: balancing innovation, pricing and market access.",
      },
      {
        label: "Track 03",
        title: "[PLACEHOLDER] Unlocking Diversity in Capital Access",
        subtitle:
          "[PLACEHOLDER] Bridging the funding gap for women founders: DFIs, VCs and corporate venture arms.",
      },
    ],
  },
  { day: 1, type: "break", start: "01:00 PM", end: "02:30 PM", title: "Lunch", subtitle: "" },
  {
    day: 1,
    type: "plenary",
    start: "02:30 PM",
    end: "03:15 PM",
    title: "[PLACEHOLDER] Building for Billions",
    subtitle: "[PLACEHOLDER] The GTM strategies behind breakthrough companies.",
  },
  {
    day: 1,
    type: "plenary",
    start: "03:15 PM",
    end: "04:00 PM",
    title: "[PLACEHOLDER] Where the Big Money Is Betting",
    subtitle: "[PLACEHOLDER] The investor's eye: discovering tomorrow's market leaders.",
  },
  {
    day: 1,
    type: "break",
    start: "04:00 PM",
    end: "04:30 PM",
    title: "Networking & Tea Break",
    subtitle: "",
  },
  {
    day: 1,
    type: "breakout",
    start: "04:30 PM",
    end: "05:30 PM",
    title: "Breakout Sessions",
    subtitle: "",
    tracks: [
      {
        label: "Track 01",
        title: "[PLACEHOLDER] Launching the Marwar Accelerator",
        subtitle:
          "[PLACEHOLDER] A regional accelerator for innovative entrepreneurs, with its first cohort companies.",
      },
      {
        label: "Track 02",
        title: "[PLACEHOLDER] Beyond the Ledger: The AI Accounting Revolution",
        subtitle: "[PLACEHOLDER] Transforming the future of accounting with AI.",
      },
      {
        label: "Track 03",
        title: "[PLACEHOLDER] Beyond Earth: Defence & Space-Tech",
        subtitle:
          "[PLACEHOLDER] Strategic assets for economic growth and global competitiveness.",
      },
    ],
  },
  {
    day: 1,
    type: "break",
    start: "07:00 PM",
    end: "10:00 PM",
    title: "Gala Dinner",
    subtitle: "",
  },

  // ---------------------------------------------------------------- DAY 2
  {
    day: 2,
    type: "break",
    start: "09:30 AM",
    end: "10:00 AM",
    title: "Registrations & Morning Coffee",
    subtitle: "",
  },
  {
    day: 2,
    type: "plenary",
    start: "10:00 AM",
    end: "10:15 AM",
    title: "Day Two Opening",
    subtitle: "",
  },
  {
    day: 2,
    type: "plenary",
    start: "10:15 AM",
    end: "11:00 AM",
    title: "[PLACEHOLDER] Going Global from Jodhpur",
    subtitle: "[PLACEHOLDER] How founders outside the metros reach international markets.",
  },
  {
    day: 2,
    type: "plenary",
    start: "11:00 AM",
    end: "11:45 AM",
    title: "[PLACEHOLDER] Building Enduring Companies",
    subtitle: "[PLACEHOLDER] Lessons from operators who have gone the distance.",
  },
  {
    day: 2,
    type: "breakout",
    start: "11:45 AM",
    end: "12:45 PM",
    title: "Breakout Sessions",
    subtitle: "",
    tracks: [
      {
        label: "Track 01",
        title: "[PLACEHOLDER] Preserving the Elixir: Re-Engineering Water Security",
        subtitle:
          "[PLACEHOLDER] Building water resilience, from corporate operations to social impact.",
      },
      {
        label: "Track 02",
        title: "[PLACEHOLDER] Crafts to Commerce: Scaling Rajasthan's Makers",
        subtitle:
          "[PLACEHOLDER] Turning heritage industries into modern, exportable businesses.",
      },
      {
        label: "Track 03",
        title: "[PLACEHOLDER] Tourism, Hospitality & the Experience Economy",
        subtitle: "[PLACEHOLDER] Building ventures around Rajasthan's biggest sector.",
      },
    ],
  },
  { day: 2, type: "break", start: "12:45 PM", end: "02:00 PM", title: "Lunch", subtitle: "" },
  {
    day: 2,
    type: "plenary",
    start: "02:00 PM",
    end: "03:00 PM",
    title: "[PLACEHOLDER] Startup Pitch & Demo Day",
    subtitle: "[PLACEHOLDER] The most promising startups pitch live to active investors.",
  },
  {
    day: 2,
    type: "plenary",
    start: "03:00 PM",
    end: "03:45 PM",
    title: "[PLACEHOLDER] Investor Connect",
    subtitle:
      "[PLACEHOLDER] Curated introductions between founders and TiE Angels and institutional investors.",
  },
  {
    day: 2,
    type: "break",
    start: "03:45 PM",
    end: "04:15 PM",
    title: "Networking & Tea Break",
    subtitle: "",
  },
  {
    day: 2,
    type: "breakout",
    start: "04:15 PM",
    end: "05:15 PM",
    title: "Breakout Sessions",
    subtitle: "",
    tracks: [
      {
        label: "Track 01",
        title: "[PLACEHOLDER] Mentorship Clinic: One-on-One with TiE Charter Members",
        subtitle: "[PLACEHOLDER] Small-group time with seasoned founders and mentors.",
      },
      {
        label: "Track 02",
        title: "[PLACEHOLDER] Family Business to Founder-Led Growth",
        subtitle: "[PLACEHOLDER] Professionalising the next generation of Marwari enterprise.",
      },
    ],
  },
  {
    day: 2,
    type: "plenary",
    start: "05:15 PM",
    end: "05:45 PM",
    title: "Closing Address & Awards",
    subtitle: "",
  },
  {
    day: 2,
    type: "break",
    start: "05:45 PM",
    end: "07:30 PM",
    title: "Networking Drinks & Closing Evening",
    subtitle: "",
  },
];
