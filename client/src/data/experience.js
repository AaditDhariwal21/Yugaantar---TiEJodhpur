/* ============================================================================
   Sections 3.4–3.7: Experience, Who's in the Room, On the Agenda themes,
   Who should attend marquee.
   ========================================================================== */

import bannerUrl from "../assets/mehrangarh-fort-jodhpur-rajasthan-hero.jpg";

export const experience = {
  badge: "The Experience",
  heading: "Two days designed for momentum, not just talks.",
  sub: "Every format is built to help you learn, raise, hire, and partner.",
  /* Nine cards, rendered 1 / 2 / 3 up — so the grid stays square at every
     breakpoint. Order matches the supplied layout. */
  cards: [
    {
      icon: "mic",
      title: "Keynotes & Fireside Chats",
      body: "Conversations with marquee founders and investors on what's working now in building and funding companies.",
    },
    {
      icon: "rocket",
      title: "Startup Pitch & Demo Day",
      body: "Watch the most promising startups pitch live to a room of active investors.",
    },
    {
      icon: "handshake",
      title: "Investor Connect",
      body: "Curated introductions between founders and TiE Angels and institutional investors.",
    },
    {
      icon: "table",
      title: "Roundtables & Workshops",
      body: "Small-room, practitioner-led sessions on scaling across borders.",
    },
    {
      icon: "users",
      title: "Networking That Counts",
      body: "Meet founders, investors, and operators from across India and the wider TiE network.",
    },
    {
      icon: "compass",
      title: "Mentorship Sessions",
      body: "One-on-one and small-group time with seasoned founders and mentors from the TiE network.",
    },
    {
      icon: "graduation",
      title: "Masterclasses",
      body: "Small-group sessions on Go-to-Market Strategy, Valuation, AI and Fundraising.",
    },
    {
      icon: "globe",
      title: "Global Market Access",
      body: "Insights and connections to help startups expand from local roots to global routes.",
    },
    {
      icon: "bulb",
      title: "Showcase & Expo",
      body: "Explore innovative solutions, meet ecosystem partners and discover new opportunities.",
    },
  ],
  banner: {
    image: bannerUrl, // Mehrangarh Fort and Jaswant Thada at dusk
    eyebrow: "Jodhpur · 2026",
    heading:
      "Two days that connect the people, capital and ideas shaping Jodhpur's startup economy.",
  },
};

export const audience = {
  badge: "Who's in the Room",
  heading: "A room built around the people who build, fund, and scale.",
  sub: "Yugaantar convenes the full ecosystem — not just one corner of it.",
  /* Eight segments, rendered 1 / 2 / 4 up — two clean rows on desktop. */
  cards: [
    {
      icon: "rocket",
      title: "Founders & Startups",
      body: "Early-stage and scaling companies building the next wave of innovation.",
    },
    {
      icon: "star",
      title: "Unicorns & Scale-ups",
      body: "High-growth companies and unicorn leaders sharing hard-won lessons on scaling and global ambition.",
    },
    {
      icon: "trend",
      title: "Investors & VCs",
      body: "Angels, venture funds, family offices and institutional investors looking for the next big opportunity.",
    },
    {
      icon: "building",
      title: "Corporate & Enterprise Leaders",
      body: "Decision-makers seeking innovation, partnerships, talent and new growth opportunities.",
    },
    {
      icon: "handshake",
      title: "Industry Leaders & Partners",
      body: "Sector leaders opening doors to pilots, customers, partnerships and market access.",
    },
    {
      icon: "compass",
      title: "Mentors & Experts",
      body: "Seasoned entrepreneurs, operators and domain specialists offering experience and perspective.",
    },
    {
      icon: "shield",
      title: "Ecosystem & Policy",
      body: "Government, academia, accelerators, advisors and institutions shaping the innovation ecosystem.",
    },
    {
      icon: "globe",
      title: "Global & Strategic Leaders",
      body: "International investors, businesses and ecosystem leaders enabling cross-border connections and global expansion.",
    },
  ],
};

export const themes = {
  badge: "On the Agenda",
  heading: "Themes that matter to founders and investors right now.",
  sub: "A programme shaped around the conversations defining the next decade of tech.",
  cards: [
    {
      icon: "map",
      title: "Scaling Across India",
      body: "Playbooks for taking a company from one Indian market to the next.",
    },
    {
      icon: "coins",
      title: "Capital & Dealmaking",
      body: "How founders raise — and how investors decide — in today's climate.",
    },
    {
      icon: "chip",
      title: "AI & the Next Wave",
      body: "Where AI is creating real businesses, not just demos.",
    },
    {
      icon: "globe",
      title: "Going Global from India",
      body: "How Indian founders expand into international markets.",
    },
    {
      icon: "shield",
      title: "Building Enduring Companies",
      body: "Lessons from operators who've gone the distance.",
    },
    {
      icon: "spark",
      title: "Women & First-Time Founders",
      body: "Programmes and pathways for the next generation of builders.",
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
