import { committeeMeta } from "../../data/committee";
import { useContent } from "../../lib/content";
import { LinkedInIcon } from "../ui/Icon";
import Reveal, { stagger } from "../ui/Reveal";
import s from "./Committee.module.css";

/* Roster from the database (edited at /adminpanel); headings from
   data/committee.js. */

const initialOf = (n) => (n || "").replace(/[[\]]/g, "").trim().charAt(0).toUpperCase();

export default function Committee() {
  const { committee } = useContent();

  if (committee.length === 0) return null;

  return (
    /* both anchors resolve here — the navbar links to #planningcommittee while
       the reference's own section carries id="committee" */
    <section className={s.sec} id="planningcommittee">
      <span id="committee" />
      <div className={s.wrap}>
        <Reveal className={s.head} y={20} duration={0.55}>
          <span className={s.badge}>{committeeMeta.badge}</span>
          <h2>{committeeMeta.heading}</h2>
          <p className={s.sub}>{committeeMeta.sub}</p>
          <div className={s.yearchip}>{committeeMeta.year}</div>
        </Reveal>

        <div className={s.cgrid}>
          {committee.map((m, i) => (
            <Reveal
              key={m.id}
              className={s.cm}
              y={22}
              duration={0.55}
              delay={stagger(i)}
              amount={0.12}
            >
              {m.photo ? (
                <img className={s.av} src={m.photo} alt={m.name} loading="lazy" />
              ) : (
                <div className={`${s.av} ${s.avPh}`} aria-hidden="true">
                  {initialOf(m.name)}
                </div>
              )}
              <div className={s.nm}>{m.name}</div>
              <div className={s.role}>{m.position}</div>
              {/* optional — most committee entries are volunteers with no
                  separate organisation to name */}
              {m.company && <div className={s.org}>{m.company}</div>}
              {m.linkedin && (
                <a
                  className={s.li}
                  href={m.linkedin}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={`${m.name} on LinkedIn`}
                >
                  <LinkedInIcon size={16} />
                </a>
              )}
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
