import { globalCommunity } from "../../data/partners";
import Reveal from "../ui/Reveal";
import s from "./GlobalCommunity.module.css";

/* 3.13 — the doubled track animates translateX(0 → -50%), so the second copy
   lands exactly where the first began and the loop has no visible reset. */
export default function GlobalCommunity() {
  const copies = [...globalCommunity.logos, ...globalCommunity.logos];

  return (
    <section className={s.sec} id="partners">
      <div className={s.wrap}>
        <Reveal className={s.head} y={20} duration={0.6}>
          <span className={s.badge}>{globalCommunity.badge}</span>
          <h2>{globalCommunity.heading}</h2>
        </Reveal>

        <Reveal className={s.mqgroup} y={22} duration={0.6}>
          <div className={s.mq}>
            <div className={s.track}>
              {copies.map((l, i) => {
                const dup = i >= globalCommunity.logos.length;
                return l.logo ? (
                  <span
                    className={`${s.lg} ${dup ? s.dup : ""}`}
                    key={`${l.name}-${i}`}
                    aria-hidden={dup ? "true" : undefined}
                  >
                    <img src={l.logo} alt={l.name} loading="lazy" />
                  </span>
                ) : (
                  <span
                    className={`${s.lgph} ${dup ? s.dup : ""}`}
                    key={`${l.name}-${i}`}
                    aria-hidden={dup ? "true" : undefined}
                  >
                    {l.name}
                  </span>
                );
              })}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
