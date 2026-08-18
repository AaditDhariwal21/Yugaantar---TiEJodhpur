/* ============================================================================
   Sections 3.4–3.7: Experience, Who's in the Room, On the Agenda themes,
   Who should attend marquee.
   ========================================================================== */

export const experience = {
  badge: "The Experience",
  heading: "Two days designed for momentum, not just talks.",
  sub: "Every format is built to help you learn, raise, hire, and partner.",
  cards: [
    {
      icon: "mic",
      title: "Keynotes & Fireside Chats",
      body: "[PLACEHOLDER] Marquee founders and investors on what's working now in building and funding companies.",
    },
    {
      icon: "rocket",
      title: "Startup Pitch & Demo Day",
      body: "[PLACEHOLDER] Watch the most promising startups pitch live to a room of active investors.",
    },
    {
      icon: "handshake",
      title: "Investor Connect",
      body: "[PLACEHOLDER] Curated introductions between founders and TiE Angels and institutional investors.",
    },
    {
      icon: "table",
      title: "Roundtables & Workshops",
      body: "[PLACEHOLDER] Small-room, practitioner-led sessions on scaling across borders.",
    },
    {
      icon: "users",
      title: "Networking That Counts",
      body: "[PLACEHOLDER] Meet founders, investors, and operators from across India and the wider TiE network.",
    },
    {
      icon: "compass",
      title: "Mentorship Sessions",
      body: "[PLACEHOLDER] One-on-one and small-group time with seasoned founders and mentors from the TiE network.",
    },
  ],
  banner: {
    image: null, // TODO(content): full-width venue / city photograph
    eyebrow: "Jodhpur · 2026",
    heading:
      "[PLACEHOLDER] Two days that connect the people, capital, and ideas shaping India's startup economy.",
  },
};

export const audience = {
  badge: "Who's in the Room",
  heading: "A room built around the people who build, fund, and scale.",
  sub: "[PLACEHOLDER] Yugaantar convenes the full ecosystem — not just one corner of it.",
  cards: [
    {
      icon: "rocket",
      title: "Founders & Startups",
      body: "[PLACEHOLDER] Early-stage and scaling teams looking for capital, mentors, and customers.",
    },
    {
      icon: "trend",
      title: "Investors & VCs",
      body: "[PLACEHOLDER] Angels, funds, and TiE Angels actively deploying across India.",
    },
    {
      icon: "building",
      title: "Corporate & Enterprise Leaders",
      body: "[PLACEHOLDER] Decision-makers scouting innovation, partnerships, and talent.",
    },
    {
      icon: "globe",
      title: "Ecosystem & Policy",
      body: "[PLACEHOLDER] Accelerators, advisors, academia, and public-sector innovation leaders.",
    },
  ],
};

export const themes = {
  badge: "On the Agenda",
  heading: "Themes that matter to founders and investors right now.",
  sub: "[PLACEHOLDER] A programme shaped around the conversations defining the next decade of tech.",
  cards: [
    {
      icon: "map",
      title: "Scaling Across India",
      body: "[PLACEHOLDER] Playbooks for taking a company from one Indian market to the next.",
    },
    {
      icon: "coins",
      title: "Capital & Dealmaking",
      body: "[PLACEHOLDER] How founders raise — and how investors decide — in today's climate.",
    },
    {
      icon: "chip",
      title: "AI & the Next Wave",
      body: "[PLACEHOLDER] Where AI is creating real businesses, not just demos.",
    },
    {
      icon: "globe",
      title: "Going Global from India",
      body: "[PLACEHOLDER] How Indian founders expand into international markets.",
    },
    {
      icon: "shield",
      title: "Building Enduring Companies",
      body: "[PLACEHOLDER] Lessons from operators who've gone the distance.",
    },
    {
      icon: "spark",
      title: "Women & First-Time Founders",
      body: "[PLACEHOLDER] Programmes and pathways for the next generation of builders.",
    },
  ],
};

/* The two marquee lanes. Illustrative role tags, not an exhaustive list.
   `hot: true` renders the red-tinted pill variant. */
export const attend = {
  heading: "Who should attend",
  sub: "Founders, funders, operators — and the people who back them.",
  laneA: [
    { label: "Founder & CEO", hot: true },
    { label: "Chief Technology Officer" },
    { label: "Head of Growth" },
    { label: "Co-Founder & CTO", hot: true },
    { label: "Chief Information Officer" },
    { label: "Head of Corporate Development" },
    { label: "Head of Partnerships" },
    { label: "General Partner", hot: true },
    { label: "Chief Operating Officer" },
    { label: "Venture Principal" },
    { label: "Portfolio Director" },
    { label: "Chief Innovation Officer" },
    { label: "Chief Revenue Officer" },
    { label: "Incubator Lead" },
    { label: "Head of Product" },
    { label: "Policy Advisor" },
    { label: "Head of Ventures" },
    { label: "Student Entrepreneur" },
  ],
  laneB: [
    { label: "Angel Investor", hot: true },
    { label: "VC Partner" },
    { label: "Chief Financial Officer" },
    { label: "Managing Partner", hot: true },
    { label: "Investment Manager" },
    { label: "Chief Executive Officer" },
    { label: "Chief Product Officer" },
    { label: "Startup Advisor" },
    { label: "Head of Strategy" },
    { label: "Chief Marketing Officer" },
    { label: "Head of Engineering" },
    { label: "Accelerator Director" },
    { label: "Head of M&A" },
    { label: "Programme Manager" },
    { label: "Head of Sales" },
    { label: "First-time Founder", hot: true },
    { label: "Head of Talent" },
  ],
};
