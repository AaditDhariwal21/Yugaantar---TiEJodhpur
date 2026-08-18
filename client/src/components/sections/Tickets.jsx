import { useRef } from "react";
import { tickets, ticketsMeta, charter } from "../../data/tickets";
import Icon from "../ui/Icon";
import HashLink from "../ui/HashLink";
import Reveal, { stagger } from "../ui/Reveal";
import s from "./Tickets.module.css";

/* The card tilts toward the cursor and a soft spotlight tracks it. Both are
   driven through CSS custom properties set on the wrapper so the paint stays
   on the compositor and React never re-renders on mousemove. */
function useTilt() {
  const ref = useRef(null);

  const onMove = (e) => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    el.style.setProperty("--ry", `${(px - 0.5) * 7}deg`);
    el.style.setProperty("--rx", `${(0.5 - py) * 7}deg`);
    el.style.setProperty("--mx", `${px * 100}%`);
    el.style.setProperty("--my", `${py * 100}%`);
    el.style.setProperty("--hover", "1");
  };

  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
    el.style.setProperty("--hover", "0");
  };

  return { ref, onMouseMove: onMove, onMouseLeave: onLeave };
}

function TicketCard({ t, index }) {
  const tilt = useTilt();

  return (
    <Reveal
      className={`${s.tkw} ${t.featured ? s.featw : ""}`}
      y={30}
      duration={0.7}
      delay={stagger(index, 0.09)}
      amount={0.1}
    >
      <span className={s.glow} aria-hidden="true" />

      <div
        className={`${s.tk} ${t.featured ? s.feat : ""}`}
        ref={tilt.ref}
        onMouseMove={tilt.onMouseMove}
        onMouseLeave={tilt.onMouseLeave}
      >
        <span className={s.grain} aria-hidden="true" />
        <span className={s.spot} aria-hidden="true" />
        <span className={s.shim} aria-hidden="true" />
        <span className={s.glass} aria-hidden="true" />
        {t.flag && <span className={s.flag}>{t.flag}</span>}

        <div className={s.content}>
          <div className={s.lab}>{t.label}</div>
          {t.date && (
            <span className={s.datechip}>
              <Icon name="calendar" size={15} />
              {t.date}
            </span>
          )}
          <div className={s.tt}>{t.title}</div>
          <p className={s.ds}>{t.body}</p>

          {t.included && (
            <div className={s.inc}>
              <span className={s.ck}>
                <Icon name="check" size={12} strokeWidth={2.6} />
              </span>
              <span>
                <b>Included:</b> {t.included}
              </span>
            </div>
          )}

          {t.perk && (
            <div className={s.perk}>
              <span className={s.pi}>
                <Icon name="star" size={17} />
              </span>
              <span>
                <span className={s.pk}>{t.perk.kicker}</span>
                <span className={s.pv} style={{ display: "block" }}>
                  {t.perk.value}
                </span>
                <span className={s.pw}>
                  <s>{t.perk.was}</s>
                  <em>{t.perk.now}</em>
                </span>
              </span>
            </div>
          )}

          <div className={s.dv} />
          <div className={s.plab}>{t.priceLabel}</div>
          <div className={s.price}>{t.price}</div>
          <div className={s.pnote}>{t.note}</div>

          <div className={s.ctaWrap}>
            <HashLink to={t.cta.href} className={s.btn}>
              {t.cta.label}
              <Icon name="arrow" size={17} strokeWidth={2.1} />
            </HashLink>
          </div>
        </div>
      </div>
    </Reveal>
  );
}

export default function Tickets() {
  return (
    <section className={s.sec} id="tickets">
      <div className={s.wrap}>
        <Reveal className={s.head} y={20} duration={0.6}>
          <span className={s.badge}>{ticketsMeta.badge}</span>
          <h2>{ticketsMeta.heading}</h2>
          <p className={s.sub}>{ticketsMeta.sub}</p>
          {ticketsMeta.phase && (
            <div className={s.phase}>
              <span className={s.pdot} />
              {ticketsMeta.phase.label}
            </div>
          )}
        </Reveal>

        <div className={s.tgrid}>
          {tickets.map((t, i) => (
            <TicketCard key={t.id} t={t} index={i} />
          ))}
        </div>

        <Reveal className={s.charter} y={22} duration={0.6}>
          <span className={s.cic}>
            <Icon name="shield" size={20} />
          </span>
          <div>
            <div className={s.ct}>{charter.title}</div>
            <p className={s.cb}>{charter.body}</p>
            <HashLink to={charter.cta.href} className={s.clink}>
              {charter.cta.label}
              <Icon name="arrow" size={16} strokeWidth={2.1} />
            </HashLink>
          </div>
        </Reveal>

        <p className={s.fineprint}>{ticketsMeta.fineprint}</p>
      </div>
    </section>
  );
}
