/* Inline stroke icons. 1.7px strokes on a 24px box, matching the reference's
   feather-weight set. `currentColor` throughout so parents control colour. */

const P = {
  calendar: (
    <>
      <rect x="3" y="4.5" width="18" height="16" rx="3" />
      <path d="M3 9.5h18M8 2.5v4M16 2.5v4" />
    </>
  ),
  sparkle: <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3z" />,
  pin: (
    <>
      <path d="M20 10.5c0 5.4-8 11.5-8 11.5s-8-6.1-8-11.5a8 8 0 1116 0z" />
      <circle cx="12" cy="10.2" r="2.8" />
    </>
  ),
  users: (
    <>
      <path d="M16 20v-1.8a4 4 0 00-4-4H6a4 4 0 00-4 4V20" />
      <circle cx="9" cy="7.5" r="3.5" />
      <path d="M22 20v-1.8a4 4 0 00-3-3.8M16.5 4.2a4 4 0 010 7.5" />
    </>
  ),
  briefcase: (
    <>
      <rect x="2.5" y="7.5" width="19" height="13" rx="2.5" />
      <path d="M8.5 7.5V5.8a2 2 0 012-2h3a2 2 0 012 2v1.7M2.5 13h19" />
    </>
  ),
  spark: <path d="M13 2.5L4.5 13.5H11l-1 8 8.5-11H12l1-8z" />,
  trend: (
    <>
      <path d="M3 16.5l5.5-5.5 3.5 3.5L21 5.5" />
      <path d="M15.5 5.5H21v5.5" />
    </>
  ),
  mic: (
    <>
      <rect x="9" y="2.5" width="6" height="11.5" rx="3" />
      <path d="M5 11.5a7 7 0 0014 0M12 18.5v3" />
    </>
  ),
  rocket: (
    <>
      <path d="M12 2.5s4.5 2 4.5 8c0 3-1.5 5.5-1.5 5.5h-6S7.5 13.5 7.5 10.5c0-6 4.5-8 4.5-8z" />
      <path d="M9 16s-2.5 1-2.5 4c0 0 2-.5 3-1.5M15 16s2.5 1 2.5 4c0 0-2-.5-3-1.5" />
      <circle cx="12" cy="9.5" r="1.6" />
    </>
  ),
  handshake: (
    <>
      <path d="M11 7.5L8.5 10a2 2 0 002.8 2.8l1.2-1.2 3.2 3.2a1.8 1.8 0 002.6-2.6" />
      <path d="M2.5 8.5l4-4 4 3h3l4-3 4 4M2.5 8.5v6l3 3M21.5 8.5v6l-3 3" />
    </>
  ),
  table: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="3.2" />
      <path d="M12 3v5.8M12 15.2V21M3 12h5.8M15.2 12H21" />
    </>
  ),
  compass: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M15.8 8.2l-2 5.6-5.6 2 2-5.6 5.6-2z" />
    </>
  ),
  building: (
    <>
      <rect x="3.5" y="3" width="10" height="18" rx="1.6" />
      <path d="M13.5 9h6a1.5 1.5 0 011.5 1.5V21M6.8 7h3.4M6.8 11h3.4M6.8 15h3.4M16.5 13h1.5M16.5 17h1.5" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a15 15 0 010 18 15 15 0 010-18z" />
    </>
  ),
  map: (
    <>
      <path d="M2.5 6.5l6-3 7 3 6-3v14l-6 3-7-3-6 3v-14z" />
      <path d="M8.5 3.5v14M15.5 6.5v14" />
    </>
  ),
  coins: (
    <>
      <ellipse cx="9" cy="6.5" rx="6.5" ry="3" />
      <path d="M2.5 6.5v5c0 1.7 2.9 3 6.5 3s6.5-1.3 6.5-3v-5" />
      <path d="M8.5 14.4v3.1c0 1.7 2.9 3 6.5 3s6.5-1.3 6.5-3v-5c0-1.4-2-2.6-4.8-2.9" />
    </>
  ),
  chip: (
    <>
      <rect x="6.5" y="6.5" width="11" height="11" rx="2.5" />
      <path d="M10 2.5v4M14 2.5v4M10 17.5v4M14 17.5v4M2.5 10h4M2.5 14h4M17.5 10h4M17.5 14h4" />
    </>
  ),
  shield: (
    <>
      <path d="M12 2.5l8 3v6c0 5-3.4 8.9-8 10-4.6-1.1-8-5-8-10v-6l8-3z" />
      <path d="M8.8 12l2.2 2.2 4.2-4.4" />
    </>
  ),
  check: <path d="M4.5 12.5l5 5 10-11" />,
  arrow: <path d="M4.5 12h15M13 5.5l6.5 6.5-6.5 6.5" />,
  arrowUpRight: <path d="M7 17L17 7M8.5 7H17v8.5" />,
  chevron: <path d="M5.5 8.5L12 15l6.5-6.5" />,
  plus: <path d="M12 5v14M5 12h14" />,
  star: (
    <path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1L3.2 9.5l6.1-.9L12 3z" />
  ),
  mail: (
    <>
      <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
      <path d="M3 7l9 6 9-6" />
    </>
  ),
  ticket: (
    <>
      <path d="M3 8.5V6.5a1.5 1.5 0 011.5-1.5h15A1.5 1.5 0 0121 6.5v2a3.5 3.5 0 000 7v2a1.5 1.5 0 01-1.5 1.5h-15A1.5 1.5 0 013 17.5v-2a3.5 3.5 0 000-7z" />
      <path d="M13 5v3M13 11v2M13 16v3" />
    </>
  ),
  graduation: (
    <>
      <path d="M12 3.5L22 8.5l-10 5-10-5 10-5z" />
      <path d="M6 11v5.2c0 .6.3 1.1.8 1.4 1.4.8 3.2 1.4 5.2 1.4s3.8-.6 5.2-1.4c.5-.3.8-.8.8-1.4V11" />
      <path d="M20.5 9.8v5.4" />
    </>
  ),
  bulb: (
    <>
      <path d="M12 2.8a6.2 6.2 0 00-3.6 11.25c.5.36.8.94.8 1.55v.4h5.6v-.4c0-.61.3-1.19.8-1.55A6.2 6.2 0 0012 2.8z" />
      <path d="M9.6 18.6h4.8M10.6 21.2h2.8" />
    </>
  ),
};

/* LinkedIn is a filled brand mark, so it bypasses the stroke set. */
export function LinkedInIcon({ size = 17 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M4.98 3.5a2.5 2.5 0 11-.02 5 2.5 2.5 0 01.02-5zM3 9h4v12H3zM10 9h3.8v1.7h.05c.53-.95 1.83-1.95 3.77-1.95 4.03 0 4.78 2.5 4.78 5.75V21h-4v-5.6c0-1.34-.03-3.07-1.9-3.07-1.9 0-2.2 1.46-2.2 2.97V21h-3.9z" />
    </svg>
  );
}

export default function Icon({ name, size = 20, strokeWidth = 1.7, ...rest }) {
  const path = P[name];
  if (!path) return null;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {path}
    </svg>
  );
}
