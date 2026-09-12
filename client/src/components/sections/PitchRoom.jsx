import { pitchRoom } from "../../data/pitchroom";
import Icon from "../ui/Icon";
import Button from "../ui/Button";
import Reveal, { stagger } from "../ui/Reveal";
import s from "./PitchRoom.module.css";

/* The Marwar Pitch Room — the festival's flagship pitch competition.

   Sits on cream between the white Committee section and the dark Agenda, so
   the alternation still reads. It earns the page's one gradient panel: this is
   the single section on the site whose job is to get an application submitted,
   and the red block is what separates "here is what it is" above it from
   "apply" inside it. The Agenda's dark ground follows immediately after, which
   is why this is a panel on cream rather than a full dark section — two dark
   bands back to back would merge into one.

   The order is the order a founder needs it in: what it is, whether they
   qualify, what to do, then the button. The fee disclaimer sits inside the
   panel, immediately above the button, because it is the one thing here that
   someone can lose money by not reading.

   Copy provenance is documented in data/pitchroom.js. */

export default function PitchRoom() {
  const {
    badge,
    heading,
    headingParts,
    sub,
    highlights,
    eligibility,
    steps,
    kicker,
    meta,
    feeNote,
    deadline,
    cta,
    ctaNote,
  } = pitchRoom;

  return (
    <section className={s.sec} id="pitchroom">
      <div className={s.wrap}>
        <Reveal className={s.head} y={20} duration={0.6}>
          <span className={s.badge}>{badge}</span>
          {/* The beats are separate spans so they can stack on narrow screens
              the way the poster sets them, but the h2 still reads as one
              sentence to a screen reader. */}
          <h2 aria-label={heading}>
            {(headingParts || [heading]).map((part, i) => (
              <span key={part} className={s.part} data-accent={i === 2 ? "true" : undefined}>
                {part}
              </span>
            ))}
          </h2>
          <p className={s.sub}>{sub}</p>
        </Reveal>

        <div className={s.stages}>
          {highlights.map((h, i) => (
            <Reveal
              key={h.title}
              className={s.stage}
              y={22}
              duration={0.6}
              delay={stagger(i)}
              amount={0.12}
            >
              <span className={s.ic}>
                <Icon name={h.icon} size={21} />
              </span>
              <span className={s.label}>{h.label}</span>
              <h3>{h.title}</h3>
              <p>{h.body}</p>
            </Reveal>
          ))}
        </div>

        {/* ---- eligibility ------------------------------------------------ */}
        <Reveal className={s.block} y={22} duration={0.6} amount={0.12}>
          <div className={s.blockHead}>
            <span className={s.eyebrow}>{eligibility.label}</span>
            <h3>{eligibility.heading}</h3>
          </div>
          <div className={s.eligGrid}>
            {eligibility.stages.map((st) => (
              <div className={s.elig} key={st.name}>
                <span className={s.stageName}>{st.name}</span>
                <p className={s.question}>{st.question}</p>
                <ul className={s.focus}>
                  {st.focus.map((f) => (
                    <li key={f}>
                      <Icon name="check" size={15} strokeWidth={2.4} />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Reveal>

        {/* ---- how to apply ----------------------------------------------- */}
        <Reveal className={s.block} y={22} duration={0.6} amount={0.12}>
          <div className={s.blockHead}>
            <span className={s.eyebrow}>{steps.label}</span>
          </div>
          {/* The number is decorative: <ol> already conveys the order, and a
              screen reader would otherwise announce "1 1. Register…". */}
          <ol className={s.stepList}>
            {steps.items.map((step, i) => (
              <li className={s.step} key={step}>
                <span className={s.num} aria-hidden="true">
                  {i + 1}
                </span>
                <h4>{step}</h4>
              </li>
            ))}
          </ol>
        </Reveal>

        {/* ---- apply ------------------------------------------------------ */}
        <Reveal className={s.panel} y={26} duration={0.7} amount={0.12}>
          <p className={s.kicker}>{kicker}</p>

          <dl className={s.meta}>
            {meta.map((m) => (
              <div className={s.metaItem} key={m.label}>
                <dt>
                  <Icon name={m.icon} size={16} />
                  {m.label}
                </dt>
                <dd>{m.value}</dd>
              </div>
            ))}
          </dl>

          {feeNote && <p className={s.feeNote}>{feeNote}</p>}

          <div className={s.act}>
            <div className={s.actRow}>
              {deadline && (
                <p className={s.deadline}>
                  <span className={s.dot} aria-hidden="true" />
                  {/* One text node, not two flex items: as its own item the
                      date was pushed to the far end of the chip, leaving a gap
                      across the middle of it on a phone. */}
                  <span>
                    {deadline.label} <strong>{deadline.value}</strong>
                  </span>
                </p>
              )}
              {/* "light" is the existing white-on-gradient variant the footer
                  band uses — the same problem, so the same button. */}
              <Button href={cta.href} variant="light" className={s.cta}>
                {cta.label}
                <Icon name="arrowUpRight" size={17} strokeWidth={2.1} />
              </Button>
            </div>
            {ctaNote && <p className={s.note}>{ctaNote}</p>}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
