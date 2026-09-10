import { motion } from "framer-motion";
import { hero } from "../../data/site";
import Icon from "../ui/Icon";
import Button from "../ui/Button";
import GridHeadline from "../ui/GridHeadline";
import { useCountUp, useInViewOnce } from "../../hooks/useCountUp";
import s from "./Hero.module.css";

const EASE = [0.22, 1, 0.36, 1];

function StatCell({ stat, index }) {
  const [ref, seen] = useInViewOnce({ threshold: 0.4 });
  const n = useCountUp(stat.value, { start: seen, duration: 1600 });

  return (
    <motion.div
      ref={ref}
      className={s.cell}
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.5, delay: index * 0.07, ease: EASE }}
    >
      <span className={s.ic}>
        <Icon name={stat.icon} size={20} />
      </span>
      <span>
        <span className={s.v}>
          {n.toLocaleString("en-US")}
          {stat.suffix}
        </span>
        <span className={s.k} style={{ display: "block" }}>
          {stat.label}
        </span>
      </span>
    </motion.div>
  );
}

export default function Hero() {
  return (
    <>
      <section className={s.hero} id="top">
        <div className={s.heroTop}>
          <motion.span
            className={s.badge}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: EASE }}
          >
            {hero.badge}
          </motion.span>
        </div>

        <GridHeadline
          className={s.gh}
          leadClassName={s.lead}
          phrases={hero.gridHeadline.phrases}
        />

        <div className={s.heroBot}>
          <motion.p
            className={s.sub}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08, ease: EASE }}
          >
            {hero.sub}
          </motion.p>

          <motion.div
            className={s.meta}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.16, ease: EASE }}
          >
            {hero.meta.map((m) => (
              <span className={s.metaItem} key={m.label}>
                <Icon name={m.icon} size={18} />
                {m.label} · {m.value}
              </span>
            ))}
          </motion.div>

          <motion.div
            className={s.ctas}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.24, ease: EASE }}
          >
            {hero.ctas.map((c) => (
              <Button key={c.label} href={c.href} variant={c.variant}>
                {c.label}
              </Button>
            ))}
          </motion.div>
        </div>
      </section>

      <div className={s.wrap}>
        <div className={s.pillWrap}>
          <div className={s.pill}>
            {hero.stats.map((stat, i) => (
              <StatCell key={stat.label} stat={stat} index={i} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
