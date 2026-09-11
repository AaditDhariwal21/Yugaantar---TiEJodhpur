import { speakersMeta } from "../../data/speakers";
import { useContent } from "../../lib/content";
import { LinkedInIcon } from "../ui/Icon";
import Reveal, { stagger } from "../ui/Reveal";
import s from "./Speakers.module.css";

/* The roster comes from the database and is edited at /adminpanel; the
   headings around it are still copy, and live in data/speakers.js. */

/* Strips the placeholder brackets so "[Speaker Name 01]" still yields a
   sensible initial in the photo fallback. */
const initialOf = (name) => (name || "").replace(/[[\]]/g, "").trim().charAt(0).toUpperCase();

function SpeakerCard({ p, index }) {
  return (
    <Reveal className={s.sp} y={24} duration={0.6} delay={stagger(index)} amount={0.1}>
      <div className={s.ph}>
        {p.country && <span className={s.tag}>{p.country}</span>}
        {p.photo ? (
          <img src={p.photo} alt={p.name} loading="lazy" />
        ) : (
          <div className={s.init} aria-hidden="true">
            {initialOf(p.name)}
          </div>
        )}
        <div className={s.ovl} />
        {p.linkedin && (
          <a
            className={s.li}
            href={p.linkedin}
            target="_blank"
            rel="noreferrer noopener"
            aria-label={`${p.name} on LinkedIn`}
          >
            <LinkedInIcon />
          </a>
        )}
      </div>
      <div className={s.content}>
        <div className={s.nm}>{p.name}</div>
        <div className={s.bar} />
        {p.position && <div className={s.rl}>{p.position}</div>}
        {p.company && <div className={s.co}>{p.company}</div>}
      </div>
    </Reveal>
  );
}

export default function Speakers() {
  const { delegates } = useContent();

  const key = delegates.filter((p) => p.tier === "key");
  const general = delegates.filter((p) => p.tier !== "key");
  const split = key.length > 0 && general.length > 0;

  // an empty roster should collapse the section, not leave a bare heading
  if (delegates.length === 0) return null;

  return (
    /* #delegates is the live anchor; #speakers is kept so any link already
       shared against the old id still lands here */
    <section className={s.sec} id="delegates">
      <span id="speakers" />
      <div className={s.wrap}>
        <Reveal className={s.head} y={20} duration={0.6}>
          <span className={s.badge}>{speakersMeta.badge}</span>
          <h2>{speakersMeta.heading}</h2>
          <p className={s.sub}>{speakersMeta.sub}</p>
        </Reveal>

        {key.length > 0 && (
          <>
            {/* the group labels only appear when the roster is actually split */}
            {split && (
              <div className={s.glabel}>
                <span>{speakersMeta.keyLabel}</span>
                <i />
              </div>
            )}
            <div className={`${s.sgrid} ${s.key} ${split ? s.tight : ""}`}>
              {key.map((p, i) => (
                <SpeakerCard key={p.id} p={p} index={i} />
              ))}
            </div>
          </>
        )}

        {general.length > 0 && (
          <>
            {split && (
              <div className={s.glabel}>
                <span>{speakersMeta.generalLabel}</span>
                <i />
              </div>
            )}
            <div className={`${s.sgrid} ${split ? s.tight : ""}`}>
              {general.map((p, i) => (
                <SpeakerCard key={p.id} p={p} index={i} />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
