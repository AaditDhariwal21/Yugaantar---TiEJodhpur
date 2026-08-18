import { Fragment } from "react";
import { attend } from "../../data/experience";
import { DitherField, DitherChip } from "../ui/Dither";
import s from "./Attend.module.css";

/* 3.7 — Who should attend.

   Each lane renders its pills twice and animates translateX(0 → -50%), so the
   second copy is exactly where the first started when the cycle restarts and
   the loop is seamless. Duration is derived from the number of pills rather
   than hardcoded, matching the reference (66.24s / 62.08s for its two lanes,
   which works out at ~3.7s per pill). */

const SECONDS_PER_PILL = 3.68;

function Lane({ items, reverse }) {
  const duration = (items.length * SECONDS_PER_PILL).toFixed(2);
  const copies = [...items, ...items];

  return (
    <div className={s.lane}>
      <div
        className={`${s.track} ${reverse ? s.rev : ""}`}
        style={{ animationDuration: `${duration}s` }}
      >
        {copies.map((p, i) => (
          <Fragment key={`${p.label}-${i}`}>
            <span
              className={`${s.pill} ${p.hot ? s.hot : ""} ${i >= items.length ? s.dup : ""}`}
              aria-hidden={i >= items.length ? "true" : undefined}
            >
              {p.hot && <span className={s.dot} />}
              {p.label}
            </span>
            {/* a chip every few pills, the way the reference punctuates its lanes */}
            {i % 3 === 2 && <span className={s.chip}><DitherChip seed={i} /></span>}
          </Fragment>
        ))}
      </div>
    </div>
  );
}

export default function Attend() {
  return (
    <section className={s.sec} id="attend">
      <DitherField className={s.field} />
      <div className={s.wrap}>
        <div className={s.bar}>
          <div className={s.lab}>
            <h2>{attend.heading}</h2>
            <div className={s.rule} />
            <p className={s.labSub}>{attend.sub}</p>
          </div>

          <div className={s.lanes}>
            <Lane items={attend.laneA} />
            <Lane items={attend.laneB} reverse />
          </div>
        </div>
      </div>
    </section>
  );
}
