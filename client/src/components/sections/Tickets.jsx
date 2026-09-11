import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { tickets, ticketsMeta } from "../../data/tickets";
import Icon from "../ui/Icon";
import Button from "../ui/Button";
import Reveal from "../ui/Reveal";
import s from "./Tickets.module.css";

/* ============================================================================
   Section 3.11 — Passes.

   A depth carousel rather than the old constant-scroll belt. Twelve passes,
   several carrying eleven bullet points, all rendered at full detail was a
   wall of text sliding past faster than any of it could be read.

   Two things fix that together:

     1. Depth. One pass is centred and full size, its neighbours step down in
        scale and opacity. The eye is told where to look.
     2. Detail follows focus. Only the centred card lists its inclusions; the
        flanking cards fall back to name, price and a count. At any moment
        there is one card to read, not twelve.

   Motion is stepped, not continuous — the belt settles on each pass for a few
   seconds. Text scaling through a smooth translate is unreadable, and the
   point of the section is that people can actually read the prices.
   ========================================================================== */

const DWELL_MS = 5000;
const SWIPE_PX = 44;
/* Inclusions shown on the centred card before the rest are summarised. Keeps
   the tallest pass (eleven bullets) from setting the height for all twelve.
   Fewer on a phone, where the list is one column instead of two — and read in
   JS rather than hidden in CSS so the "+N more" count stays truthful. */
const BULLETS_WIDE = 6;
const BULLETS_NARROW = 4;
const NARROW = "(max-width: 560px)";

/* Shortest signed distance around the loop, so the belt wraps both ways
   instead of unwinding all the way back through the middle. */
function offsetFrom(index, active, count) {
  let d = index - active;
  if (d > count / 2) d -= count;
  if (d < -count / 2) d += count;
  return d;
}

/* CSS does the positioning off this attribute, so the geometry lives in one
   place and breakpoints can reshape the whole belt without touching JS. */
const slotOf = (d) => {
  const m = Math.abs(d);
  if (m === 0) return "0";
  if (m <= 2) return `${d > 0 ? "" : "-"}${m}`;
  return d > 0 ? "far" : "-far";
};

function useMaxBullets() {
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    if (typeof matchMedia !== "function") return undefined;
    const mq = matchMedia(NARROW);
    const sync = () => setNarrow(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return narrow ? BULLETS_NARROW : BULLETS_WIDE;
}

function PassCard({ t, slot, active, onSelect, maxBullets }) {
  const shown = active ? t.includes.slice(0, maxBullets) : [];
  const rest = t.includes.length - shown.length;

  return (
    <article
      className={s.card}
      data-slot={slot}
      data-active={active || undefined}
      /* Off-belt cards are decorative duplicates of what is already reachable
         by stepping the carousel, so they stay out of the reading order. */
      aria-hidden={slot === "far" || slot === "-far" || undefined}
    >
      {/* The whole card is the hit target for the ones either side — clicking
          a neighbour is the fastest way to bring it to the middle. */}
      <button
        type="button"
        className={s.cardHit}
        tabIndex={active ? -1 : 0}
        aria-label={`Show ${t.name}`}
        onClick={onSelect}
        disabled={active}
      />

      <div className={s.cardTop}>
        {t.eyebrow && <div className={s.eyebrow}>{t.eyebrow}</div>}
        <h3 className={s.name}>{t.name}</h3>

        <div className={s.priceRow}>
          {t.free ? (
            <span className={s.freeChip}>{t.freeLabel || "Complimentary"}</span>
          ) : (
            <>
              <div className={s.price}>{t.price.current}</div>
              <div className={s.priceNote}>{t.price.currentNote}</div>
              {t.price.next && (
                <div className={s.next}>
                  <b>{t.price.next}</b> · {t.price.nextNote}
                </div>
              )}
            </>
          )}
        </div>

        <div className={s.access}>{t.access}</div>
      </div>

      {/* Detail only on the centred card. The neighbours get the count, which
          is the one thing worth comparing at a glance. */}
      {active ? (
        <div className={s.detail}>
          <div className={s.listLabel}>Includes</div>
          <ul className={s.list} data-cols={shown.length > 3 ? "2" : "1"}>
            {shown.map((line) => (
              <li key={line}>
                <span className={s.tick}>
                  <Icon name="check" size={9} strokeWidth={3} />
                </span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
          {rest > 0 && <p className={s.more}>+{rest} more inclusions</p>}
          {t.excludes && (
            <p className={s.excludes}>
              <b>Excludes:</b> {t.excludes}
            </p>
          )}
          {t.note && <p className={s.note}>{t.note}</p>}
        </div>
      ) : (
        <div className={s.summary}>
          <span className={s.incCount}>
            {t.includes.length} inclusion{t.includes.length === 1 ? "" : "s"}
          </span>
        </div>
      )}
    </article>
  );
}

export default function Tickets() {
  const count = tickets.length;
  const [active, setActive] = useState(0);
  const [held, setHeld] = useState(false); // hover, focus or pointer down
  const [onScreen, setOnScreen] = useState(false);
  const reduced = useReducedMotion();
  const maxBullets = useMaxBullets();
  const beltRef = useRef(null);
  const dragX = useRef(null);

  const step = useCallback(
    (dir) => setActive((a) => (a + dir + count) % count),
    [count]
  );

  /* Only runs while the section is actually on screen: a carousel ticking away
     in a part of the page nobody is looking at is wasted work, and on a long
     landing page it is off screen most of the time. */
  useEffect(() => {
    const el = beltRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setOnScreen(true);
      return undefined;
    }
    const io = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting), {
      threshold: 0.25,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    /* Respect prefers-reduced-motion by not advancing at all — the arrows and
       dots still work, so nothing becomes unreachable. */
    if (reduced || held || !onScreen) return undefined;
    const id = setInterval(() => step(1), DWELL_MS);
    return () => clearInterval(id);
  }, [reduced, held, onScreen, step]);

  function onKeyDown(e) {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      step(1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      step(-1);
    }
  }

  function onPointerDown(e) {
    dragX.current = e.clientX;
    setHeld(true);
  }
  function onPointerUp(e) {
    const from = dragX.current;
    dragX.current = null;
    setHeld(false);
    if (from === null) return;
    const dx = e.clientX - from;
    if (Math.abs(dx) > SWIPE_PX) step(dx < 0 ? 1 : -1);
  }

  const activePass = tickets[active];

  return (
    <section className={s.sec} id="tickets">
      <div className={s.wrap}>
        <Reveal className={s.head} y={20} duration={0.6}>
          <span className={s.badge}>{ticketsMeta.badge}</span>
          <h2>{ticketsMeta.heading}</h2>
          <p className={s.sub}>{ticketsMeta.sub}</p>
        </Reveal>
      </div>

      <div
        className={s.stage}
        ref={beltRef}
        role="group"
        aria-roledescription="carousel"
        aria-label="Passes"
        tabIndex={0}
        onKeyDown={onKeyDown}
        onMouseEnter={() => setHeld(true)}
        onMouseLeave={() => setHeld(false)}
        onFocus={() => setHeld(true)}
        onBlur={() => setHeld(false)}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={() => {
          dragX.current = null;
          setHeld(false);
        }}
      >
        <div className={s.belt}>
          {tickets.map((t, i) => {
            const d = offsetFrom(i, active, count);
            return (
              <PassCard
                key={t.id}
                t={t}
                slot={slotOf(d)}
                active={d === 0}
                maxBullets={maxBullets}
                onSelect={() => setActive(i)}
              />
            );
          })}
        </div>

        <button
          type="button"
          className={`${s.arrow} ${s.arrowPrev}`}
          onClick={() => step(-1)}
          aria-label="Previous pass"
        >
          <Icon name="chevron" size={18} strokeWidth={2.2} />
        </button>
        <button
          type="button"
          className={`${s.arrow} ${s.arrowNext}`}
          onClick={() => step(1)}
          aria-label="Next pass"
        >
          <Icon name="chevron" size={18} strokeWidth={2.2} />
        </button>
      </div>

      {/* Announced politely so a screen reader following along is told which
          pass is centred, without the belt stealing focus every few seconds. */}
      <p className={s.srOnly} aria-live="polite">
        {activePass.name}, pass {active + 1} of {count}
      </p>

      <div className={s.wrap}>
        <div className={s.dots} role="tablist" aria-label="Choose a pass">
          {tickets.map((t, i) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={i === active}
              aria-label={t.name}
              data-on={i === active}
              className={s.dot}
              onClick={() => setActive(i)}
            />
          ))}
        </div>

        <Reveal className={s.foot} y={20} duration={0.6}>
          <p className={s.footLine}>{ticketsMeta.ctaLine}</p>
          <div className={s.footCta}>
            <Button href={ticketsMeta.cta.href} variant="grad">
              {ticketsMeta.cta.label}
              <Icon name="arrow" size={17} strokeWidth={2.1} />
            </Button>
          </div>
        </Reveal>
        <p className={s.fineprint}>{ticketsMeta.fineprint}</p>
      </div>
    </section>
  );
}
