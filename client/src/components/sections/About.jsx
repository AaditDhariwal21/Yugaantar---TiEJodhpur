import { about } from "../../data/site";
import Icon from "../ui/Icon";
import Reveal, { stagger } from "../ui/Reveal";
import s from "./About.module.css";

export default function About() {
  return (
    <section className={s.sec} id="about">
      <div className={s.wrap}>
        <div className={s.split}>
          <Reveal className={s.copy} y={22} duration={0.6}>
            <span className={s.badge}>{about.badge}</span>
            <h2>{about.heading}</h2>
            <p className={s.body}>{about.body}</p>
          </Reveal>

          {/* `art` drops the card chrome: the stamp is a cut-out graphic with
              its own scalloped edge, so a bordered rectangle behind it would
              show through the notches. The placeholder still wants the card. */}
          <Reveal
            className={`${s.imgcard} ${about.image ? s.art : ""}`}
            y={22}
            duration={0.6}
            delay={0.08}
          >
            {about.image ? (
              <img src={about.image} alt={about.imageAlt} />
            ) : (
              <div className={s.imgph}>
                <Icon name="star" size={34} />
                <span>Image to be supplied</span>
              </div>
            )}
          </Reveal>
        </div>

        <div className={s.stats}>
          {about.stats.map((st, i) => (
            <Reveal
              key={st.label}
              className={s.stat}
              y={20}
              duration={0.55}
              delay={stagger(i)}
            >
              <div className={s.v}>{st.value}</div>
              <div className={s.l}>{st.label}</div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
