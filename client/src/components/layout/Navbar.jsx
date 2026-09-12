import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import { site, nav } from "../../data/site";
import HashLink from "../ui/HashLink";
import s from "./Navbar.module.css";

/* How far the highlight pill is allowed to bleed past the link's own box, each
   side. The desktop row's tightest gap is 18px, so 10 leaves the pill clear of
   its neighbours' text at every width. */
const PILL_PAD = 10;

/* Which nav entry the reader is currently inside.

   Not an IntersectionObserver: the sections are taller than the viewport and
   several are on screen at once, so "is it visible" is the wrong question. The
   right one is "which section has most recently passed under the nav", which a
   single probe line just below the sticky bar answers directly.

   The winner is the candidate with the greatest top above the probe, not the
   last one in the list that matches. nav.links is kept in document order (see
   data/site.js) so those two are the same thing today, but relying on list
   position would make a mis-ordered menu silently mis-highlight instead of
   just making the pill jump. */
function useActiveNavIndex(pathname) {
  const [active, setActive] = useState(-1);

  useEffect(() => {
    /* Every nav entry is a home-page anchor, so nothing is current anywhere
       else and this resolves to -1. The lookup is kept rather than hard-coding
       that, so a future route entry lights up without a special case. */
    if (pathname !== "/") {
      setActive(nav.links.findIndex((l) => l.href === pathname));
      return;
    }

    const targets = nav.links
      .map((l, i) => ({ i, id: l.href.includes("#") ? l.href.split("#")[1] : null }))
      .filter((t) => t.id);

    const navH =
      parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue("--nav-h")
      ) || 76;
    const probe = navH + 28;

    let raf = 0;
    const measure = () => {
      raf = 0;
      let best = -1;
      let bestTop = -Infinity;
      for (const t of targets) {
        // sections that depend on API content are absent until it lands
        const el = document.getElementById(t.id);
        if (!el) continue;
        const top = el.getBoundingClientRect().top;
        if (top <= probe && top > bestTop) {
          bestTop = top;
          best = t.i;
        }
      }
      setActive(best);
    };

    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    // the roster, committee and agenda arrive after first paint and move
    // everything below them, so re-probe when the page's height changes
    const ro = new ResizeObserver(schedule);
    ro.observe(document.body);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      ro.disconnect();
    };
  }, [pathname]);

  return active;
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const active = useActiveNavIndex(location.pathname);

  const linksRef = useRef(null);
  const [pill, setPill] = useState({ x: 0, w: 0, on: false });

  /* The pill is one element that slides and resizes between links, rather than
     a background switched on per link, so the change of section reads as a
     single marker following the reader down the page.

     When nothing is active it only fades — its position is left where it was,
     so scrolling back up into the hero does not send it racing to x=0 on the
     way out. */
  const measurePill = useCallback(() => {
    const root = linksRef.current;
    if (!root) return;
    const el = active >= 0 ? root.querySelectorAll("a")[active] : null;
    if (!el) {
      setPill((p) => ({ ...p, on: false }));
      return;
    }
    setPill({
      x: el.offsetLeft - PILL_PAD,
      w: el.offsetWidth + PILL_PAD * 2,
      on: true,
    });
  }, [active]);

  useLayoutEffect(() => {
    measurePill();
  }, [measurePill]);

  useEffect(() => {
    window.addEventListener("resize", measurePill);
    // Inter is fetched from a CDN; the row reflows when it finally lands
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(measurePill);
    }
    return () => window.removeEventListener("resize", measurePill);
  }, [measurePill]);

  // close the panel on route change and on resize past the desktop breakpoint
  useEffect(() => setOpen(false), [location.pathname]);
  useEffect(() => {
    // must track the breakpoint in Navbar.module.css
    const mq = window.matchMedia("(min-width: 1180px)");
    const onChange = (e) => e.matches && setOpen(false);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return (
    <header className={s.nav}>
      <div className={s.wrap}>
        <div className={s.in}>
          {/* The logo carries the wordmark, so there is no separate text
              beside it. The fallback still spells the name out, for the case
              where the asset is missing. */}
          <HashLink to="/" className={s.brand} aria-label={site.logoAlt}>
            {site.logo ? (
              <img src={site.logo} alt={site.logoAlt} />
            ) : (
              <>
                <span className={s.mark} aria-hidden="true">
                  TiE
                </span>
                <span className={s.brandText}>Yugaantar</span>
              </>
            )}
          </HashLink>

          <nav className={s.links} aria-label="Primary" ref={linksRef}>
            <span
              className={s.marker}
              aria-hidden="true"
              data-on={pill.on ? "true" : "false"}
              style={{ transform: `translateX(${pill.x}px)`, width: `${pill.w}px` }}
            />
            {nav.links.map((l, i) => (
              <HashLink
                key={l.label}
                to={l.href}
                data-active={i === active ? "true" : undefined}
                aria-current={i === active ? "true" : undefined}
              >
                {l.label}
              </HashLink>
            ))}
          </nav>

          <HashLink to={nav.cta.href} className={`${s.cta} ${s.desktopCta}`}>
            {nav.cta.label}
          </HashLink>

          <button
            type="button"
            className={s.burger}
            data-open={open}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            className={s.mobile}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <nav aria-label="Mobile">
              {nav.links.map((l, i) => (
                <HashLink
                  key={l.label}
                  to={l.href}
                  onNavigate={() => setOpen(false)}
                  data-active={i === active ? "true" : undefined}
                  aria-current={i === active ? "true" : undefined}
                >
                  {l.label}
                </HashLink>
              ))}
              <HashLink
                to={nav.cta.href}
                className={`${s.cta} ${s.mobileCta}`}
                onNavigate={() => setOpen(false)}
              >
                {nav.cta.label}
              </HashLink>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
