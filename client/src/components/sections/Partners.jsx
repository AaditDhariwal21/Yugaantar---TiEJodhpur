import { useMemo, useState } from "react";
import { partners, partnerTiers, partnersMeta } from "../../data/partners";
import Icon from "../ui/Icon";
import HashLink from "../ui/HashLink";
import Reveal, { stagger } from "../ui/Reveal";
import s from "./Partners.module.css";

const initialOf = (n) => (n || "").replace(/[[\]]/g, "").trim().charAt(0).toUpperCase();

function PartnerTile({ p, index }) {
  const Tag = p.url ? "a" : "div";
  const linkProps = p.url
    ? { href: p.url, target: "_blank", rel: "noreferrer noopener" }
    : {};

  return (
    <Reveal
      as={Tag === "a" ? "a" : "div"}
      className={s.sp}
      y={22}
      duration={0.6}
      delay={stagger(index)}
      amount={0.12}
      {...linkProps}
    >
      {p.exclusive && <span className={s.excl}>Exclusive</span>}
      <div className={s.lgbox}>
        {p.logo ? (
          <img src={p.logo} alt={p.name} loading="lazy" />
        ) : (
          <span className={s.init} aria-hidden="true">
            {initialOf(p.name)}
          </span>
        )}
      </div>
      <div className={s.pname}>{p.name}</div>
      <div className={s.bar} />
    </Reveal>
  );
}

export default function Partners() {
  const [filter, setFilter] = useState("all");

  const counts = useMemo(() => {
    const c = { all: partners.length };
    partnerTiers.forEach((t) => {
      c[t.key] = partners.filter((p) => p.tier === t.key).length;
    });
    return c;
  }, []);

  // only render tiers that survive the filter and actually hold partners
  const shownTiers = partnerTiers
    .filter((t) => (filter === "all" || filter === t.key) && counts[t.key] > 0)
    .map((t) => ({ ...t, items: partners.filter((p) => p.tier === t.key) }));

  return (
    <section className={s.sec} id="sponsors">
      <div className={s.wrap}>
        <Reveal className={s.head} y={20} duration={0.6}>
          <span className={s.badge}>{partnersMeta.badge}</span>
          <h2>{partnersMeta.heading}</h2>
          <p className={s.sub}>{partnersMeta.sub}</p>
        </Reveal>

        <div className={s.chips}>
          <button
            type="button"
            className={s.chip}
            data-on={filter === "all"}
            onClick={() => setFilter("all")}
          >
            All<span className={s.n}>{counts.all}</span>
          </button>
          {partnerTiers.map((t) => (
            <button
              key={t.key}
              type="button"
              className={s.chip}
              data-on={filter === t.key}
              onClick={() => setFilter(t.key)}
            >
              {t.label}
              <span className={s.n}>{counts[t.key]}</span>
            </button>
          ))}
        </div>

        {shownTiers.map((t) => (
          <div className={s.tier} key={t.key}>
            <div className={s.tierHead}>
              <span className={s.tname}>{t.label}</span>
              <i />
            </div>
            <div className={s.grid}>
              {t.items.map((p, i) => (
                <PartnerTile key={p.name} p={p} index={i} />
              ))}
            </div>
          </div>
        ))}

        <Reveal className={s.foot} y={20} duration={0.6}>
          <p className={s.footLine}>{partnersMeta.ctaLine}</p>
          <HashLink to={partnersMeta.cta.href} className={s.footCta}>
            {partnersMeta.cta.label}
            <Icon name="arrow" size={17} strokeWidth={2.1} />
          </HashLink>
        </Reveal>
      </div>
    </section>
  );
}
