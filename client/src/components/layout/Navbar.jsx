import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import { site, nav } from "../../data/site";
import HashLink from "../ui/HashLink";
import s from "./Navbar.module.css";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  // close the panel on route change and on resize past the desktop breakpoint
  useEffect(() => setOpen(false), [location.pathname]);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1101px)");
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

          <nav className={s.links} aria-label="Primary">
            {nav.links.map((l) => (
              <HashLink key={l.label} to={l.href}>
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
              {nav.links.map((l) => (
                <HashLink key={l.label} to={l.href} onNavigate={() => setOpen(false)}>
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
