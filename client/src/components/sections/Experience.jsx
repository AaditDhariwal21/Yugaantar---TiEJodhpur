import { experience } from "../../data/experience";
import CardSection, { cardStyles as s } from "./CardSection";
import Reveal from "../ui/Reveal";

/* 3.4 — Experience: the 6-card grid on cream, then a white section holding the
   full-bleed image banner with its overlaid caption. Two <section>s, matching
   the reference's own split. */
export default function Experience() {
  const { banner } = experience;
  return (
    <>
      <CardSection
        id="experience"
        alt
        badge={experience.badge}
        heading={experience.heading}
        sub={experience.sub}
        cards={experience.cards}
        cols={3}
      />

      <section className={s.sec}>
        <div className={s.wrap}>
          <Reveal className={s.moment} y={26} duration={0.7}>
            {banner.image && <img src={banner.image} alt="" />}
            <div className={s.ov} />
            <div className={s.mtxt}>
              <div className={s.meye}>{banner.eyebrow}</div>
              <div className={s.mh}>{banner.heading}</div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
