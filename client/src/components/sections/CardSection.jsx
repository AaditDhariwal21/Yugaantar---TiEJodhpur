import Icon from "../ui/Icon";
import Reveal, { stagger } from "../ui/Reveal";
import s from "./CardSection.module.css";

/* The head block (badge / h2 / sub) is identical across every section on the
   page, so it lives here and is reused rather than retyped. */
export function SectionHead({ badge, heading, sub, children }) {
  return (
    <Reveal className={s.head} y={20} duration={0.6}>
      {badge && <span className={s.badge}>{badge}</span>}
      {heading && <h2>{heading}</h2>}
      {sub && <p className={s.sub}>{sub}</p>}
      {children}
    </Reveal>
  );
}

export function Card({ icon, title, body, index = 0 }) {
  return (
    <Reveal className={s.card} y={22} duration={0.55} delay={stagger(index)}>
      {icon && (
        <div className={s.ic}>
          <Icon name={icon} size={24} />
        </div>
      )}
      <div className={s.t}>{title}</div>
      <p className={s.d}>{body}</p>
    </Reveal>
  );
}

/* cols: 3 → .g3 (experience, themes) · 4 → .g4 (audience) */
export default function CardSection({ id, alt, badge, heading, sub, cards, cols = 3 }) {
  return (
    <section className={`${s.sec} ${alt ? s.alt : ""}`} id={id}>
      <div className={s.wrap}>
        <SectionHead badge={badge} heading={heading} sub={sub} />
        <div className={`${s.grid} ${cols === 4 ? s.g4 : s.g3}`}>
          {cards.map((c, i) => (
            <Card key={c.title} icon={c.icon} title={c.title} body={c.body} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

export { s as cardStyles };
