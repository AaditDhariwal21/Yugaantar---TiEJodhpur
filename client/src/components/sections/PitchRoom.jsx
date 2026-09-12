import { pitchRoom } from "../../data/pitchroom";
import Icon from "../ui/Icon";
import Button from "../ui/Button";
import Reveal from "../ui/Reveal";
import s from "./PitchRoom.module.css";

/* The Marwar Pitch Room — the festival's flagship pitch competition.

   One split card on cream: the poster flush down the left, and beside it only
   the things the poster cannot say — who may apply, how, and by when. The
   artwork already carries the name, the tagline, the dates and the strapline,
   so none of that is set as text next to it.

   There is no red slab. The brand shows up as a hairline down the edge of the
   card, the eyebrow, the numbered steps and the one gradient button, which is
   enough to read as the same family as the rest of the page without turning a
   supporting section into the loudest thing on it. The Agenda's dark ground
   follows immediately after and now has the contrast to itself.

   Copy provenance is documented in data/pitchroom.js. */

export default function PitchRoom() {
  const {
    title,
    image,
    imageAlt,
    badge,
    heading,
    lead,
    eligibility,
    steps,
    deadline,
    cta,
    feeNote,
  } = pitchRoom;

  return (
    <section className={s.sec} id="pitchroom">
      <div className={s.wrap}>
        {/* Badge over heading — the same section head every other section on
            the page uses. */}
        <Reveal className={s.head} y={18} duration={0.55}>
          <span className={s.badge}>{badge}</span>
          <h2>{title}</h2>
        </Reveal>

        <Reveal className={s.card} y={24} duration={0.7} amount={0.1}>
          <div className={s.media}>
            <img src={image} alt={imageAlt} loading="lazy" />
          </div>

          <div className={s.content}>
            {/* h3, not h2: the section's own heading above the card is the h2,
                so this keeps the document outline in order. */}
            <h3 className={s.title}>{heading}</h3>
            <p className={s.lead}>{lead}</p>

            <div className={s.cols}>
              <div className={s.col}>
                <span className={s.eyebrow}>{eligibility.label}</span>
                <ul className={s.stages}>
                  {eligibility.stages.map((st) => (
                    <li key={st.name}>
                      <Icon name="check" size={15} strokeWidth={2.4} />
                      <span>
                        <b>{st.name}</b> — {st.detail}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className={s.col}>
                <span className={s.eyebrow}>{steps.label}</span>
                {/* The numbers are decorative: <ol> already conveys the order,
                    and a screen reader would otherwise say "1 1. Register…". */}
                <ol className={s.steps}>
                  {steps.items.map((step, i) => (
                    <li key={step}>
                      <span className={s.num} aria-hidden="true">
                        {i + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            <div className={s.act}>
              <Button href={cta.href} variant="grad" className={s.cta}>
                {cta.label}
                <Icon name="arrowUpRight" size={17} strokeWidth={2.1} />
              </Button>
              {deadline && (
                <p className={s.deadline}>
                  <span className={s.dot} aria-hidden="true" />
                  <span>
                    {deadline.label} <strong>{deadline.value}</strong>
                  </span>
                </p>
              )}
            </div>

            {feeNote && <p className={s.feeNote}>{feeNote}</p>}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
