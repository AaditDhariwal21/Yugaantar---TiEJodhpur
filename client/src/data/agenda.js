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
  sub: "Two days, deliberately paced — from the opening address to the closing night. Main-stage conversations, parallel private sessions, pitch rooms and master classes, and the breaks where most of the deals actually start.",
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

/* 22 Oct 2026 is a Thursday, 23 Oct a Friday.
   `theme` is the main-stage theme for that day, shown under the date. */
export const agendaDays = [
  {
    key: 1,
    label: "Day 1",
    short: "22 Oct",
    date: "Thursday, 22 October 2026",
    theme: "Main stage · Local Roots (Build Local)",
  },
  {
    key: 2,
    label: "Day 2",
    short: "23 Oct",
    date: "Friday, 23 October 2026",
    // TODO(content): confirm the day-two main-stage theme.
    theme: null,
  },
];

export const agendaFilters = [
  { key: "all", label: "Full Day" },
  { key: "plenary", label: "Plenary" },
  { key: "breakout", label: "Breakouts" },
  { key: "break", label: "Breaks & Networking" },
];

export const agenda = [
  // ---------------------------------------------------------------- DAY 1
  // Main stage theme: Local Roots (Build Local). Confirmed schedule.
  // `parallel: true` marks sessions that run alongside the main stage rather
  // than in sequence with it; they are ordered here by start time.
  {
    day: 1,
    type: "break",
    start: "08:30 AM",
    end: "09:45 AM",
    title: "Morning Registrations & Welcome Coffee",
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
    end: "10:45 AM",
    title: "Yugaantar: Minds That Shape Marwar",
    subtitle:
      "Three institutions. One region. A shared future. What does Marwar need to become a knowledge, innovation and human-capital powerhouse?",
  },
  {
    day: 1,
    type: "breakout",
    parallel: true,
    start: "10:30 AM",
    end: "11:30 AM",
    title: "Yugaantar: The Inner Circle",
    subtitle:
      "Private conversations. Powerful connections. What does your business need next?",
  },
  {
    day: 1,
    type: "plenary",
    start: "10:45 AM",
    end: "11:30 AM",
    title: "The Fun of Being in a Startup",
    subtitle:
      "What does it really take to build something from nothing — and enjoy the chaos along the way?",
  },
  {
    day: 1,
    type: "plenary",
    start: "11:30 AM",
    end: "12:00 PM",
    title: "AI: Build or Be Built",
    subtitle:
      "If AI gives every entrepreneur access to extraordinary intelligence, what will Marwar choose to build with it?",
  },
  {
    day: 1,
    type: "breakout",
    parallel: true,
    start: "11:30 AM",
    end: "12:30 PM",
    title: "Yugaantar: The Inner Circle",
    subtitle:
      "Private conversations. Powerful connections. What does your business need next?",
  },
  {
    day: 1,
    type: "plenary",
    start: "12:00 PM",
    end: "01:00 PM",
    title: "TiE U Semi Finals",
    subtitle: "TiE University semi-finals.",
  },
  { day: 1, type: "break", start: "01:00 PM", end: "02:00 PM", title: "Lunch", subtitle: "" },
  {
    day: 1,
    type: "plenary",
    start: "02:00 PM",
    end: "02:45 PM",
    title: "Fireside Chat: The Businesses That Built Marwar",
    subtitle:
      "From tradition to transformation. What can the next generation do differently without losing what made these businesses successful?",
  },
  {
    day: 1,
    type: "plenary",
    start: "02:45 PM",
    end: "03:30 PM",
    title: "Yugaantar Round Tables",
    subtitle:
      "One table. One question. One idea for Marwar. One mentor, one investor — purpose-driven networking.",
  },
  {
    day: 1,
    type: "break",
    start: "03:30 PM",
    end: "04:00 PM",
    title: "Networking & Tea Break",
    subtitle: "",
  },
  {
    day: 1,
    type: "plenary",
    start: "04:00 PM",
    end: "05:00 PM",
    title: "The Marwar Pitch Room — Semi Finals",
    subtitle: "",
  },
  {
    day: 1,
    type: "plenary",
    start: "05:00 PM",
    end: "06:30 PM",
    title: "Master Class: Cracking the GTM Code",
    subtitle: "The GTM code and the sales funnel.",
  },
  { day: 1, type: "break", start: "06:30 PM", end: "07:15 PM", title: "Break", subtitle: "" },
  {
    day: 1,
    type: "plenary",
    start: "07:15 PM",
    end: "08:00 PM",
    title: "The Connection Hut",
    subtitle:
      "Gamified speed dating with investors, customers, industry partners, founders and emerging sectors.",
  },
  {
    day: 1,
    type: "break",
    start: "08:00 PM",
    end: "Onward",
    title: "Cultural Night / Open Networking / Dinner",
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
    title: "Going Global from Jodhpur",
    subtitle: "How founders outside the metros reach international markets.",
  },
  {
    day: 2,
    type: "plenary",
    start: "11:00 AM",
    end: "11:45 AM",
    title: "Building Enduring Companies",
    subtitle: "Lessons from operators who have gone the distance.",
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
        title: "Preserving the Elixir: Re-Engineering Water Security",
        subtitle:
          "Building water resilience, from corporate operations to social impact.",
      },
      {
        label: "Track 02",
        title: "Crafts to Commerce: Scaling Rajasthan's Makers",
        subtitle:
          "Turning heritage industries into modern, exportable businesses.",
      },
      {
        label: "Track 03",
        title: "Tourism, Hospitality & the Experience Economy",
        subtitle: "Building ventures around Rajasthan's biggest sector.",
      },
    ],
  },
  { day: 2, type: "break", start: "12:45 PM", end: "02:00 PM", title: "Lunch", subtitle: "" },
  {
    day: 2,
    type: "plenary",
    start: "02:00 PM",
    end: "03:00 PM",
    title: "Startup Pitch & Demo Day",
    subtitle: "The most promising startups pitch live to active investors.",
  },
  {
    day: 2,
    type: "plenary",
    start: "03:00 PM",
    end: "03:45 PM",
    title: "Investor Connect",
    subtitle:
      "Curated introductions between founders and TiE Angels and institutional investors.",
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
        title: "Mentorship Clinic: One-on-One with TiE Charter Members",
        subtitle: "Small-group time with seasoned founders and mentors.",
      },
      {
        label: "Track 02",
        title: "Family Business to Founder-Led Growth",
        subtitle: "Professionalising the next generation of Marwari enterprise.",
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
