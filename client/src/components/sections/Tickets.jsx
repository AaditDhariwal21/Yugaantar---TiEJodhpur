import { tickets, ticketsMeta } from "../../data/tickets";
import Icon from "../ui/Icon";
import Button from "../ui/Button";
import Reveal from "../ui/Reveal";
import s from "./Tickets.module.css";

/* Seconds of travel per card. Multiplied by the card count so adding or
   removing a pass keeps the reading pace the same rather than speeding the
   whole belt up. */
const SECONDS_PER_CARD = 6;

function PassCard({ t, dup }) {
  return (
    <article className={`${s.card} ${dup ? s.dup : ""}`} aria-hidden={dup || undefined}>
      <div className={s.eyebrow}>{t.eyebrow}</div>
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

      <div className={s.listLabel}>Includes</div>
      <ul className={s.list}>
        {t.includes.map((line) => (
          <li key={line}>
            <span className={s.tick}>
              <Icon name="check" size={9} strokeWidth={3} />
            </span>
            <span>{line}</span>
          </li>
        ))}
      </ul>

      {t.excludes && (
        <p className={s.excludes}>
          <b>Excludes:</b> {t.excludes}
        </p>
      )}

      {t.note && <p className={s.note}>{t.note}</p>}
    </article>
  );
}

export default function Tickets() {
  // rendered twice so translateX(-50%) lands the copy exactly on the original
  const belt = [...tickets, ...tickets];
  const duration = tickets.length * SECONDS_PER_CARD;

  return (
    <section className={s.sec} id="tickets">
      <div className={s.wrap}>
        <Reveal className={s.head} y={20} duration={0.6}>
          <span className={s.badge}>{ticketsMeta.badge}</span>
          <h2>{ticketsMeta.heading}</h2>
          <p className={s.sub}>{ticketsMeta.sub}</p>
        </Reveal>
      </div>

      <div className={s.belt}>
        <div className={s.track} style={{ animationDuration: `${duration}s` }}>
          {belt.map((t, i) => (
            <PassCard key={`${t.id}-${i}`} t={t} dup={i >= tickets.length} />
          ))}
        </div>
      </div>

      <div className={s.wrap}>
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
