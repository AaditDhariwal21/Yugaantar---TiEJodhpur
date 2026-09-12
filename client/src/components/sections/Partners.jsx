import { useMemo, useState } from "react";
import {
  partners as fallbackPartners,
  partnerTiers as fallbackTiers,
  partnersMeta,
} from "../../data/partners";
import { useContent } from "../../lib/content";
import Icon from "../ui/Icon";
import HashLink from "../ui/HashLink";
import Reveal, { stagger } from "../ui/Reveal";
import s from "./Partners.module.css";

/* The roster and its tiers come from the database and are edited at
   /adminpanel; the headings around them are still copy and live in
   data/partners.js.

   Tiers are matched to partners by `key`, exactly as they were when both were
   hardcoded — the value is now a database id rather than a slug, which this
   section neither knows nor cares about. */

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
  const live = useContent();

  /* Which roster to show.

     Two different "nothing here" cases have to be told apart. null means this
     API build does not know about partners at all (see lib/content) — an older
     server, or the snapshot bundled before partners moved into the database.
     An empty array means it does know, and the answer is genuinely none.

     The tiers are what distinguish a database nobody has populated yet from
     one the admin has deliberately emptied: a configured partners section
     always has at least one tier, and the server refuses to delete a tier that
     still holds partners. So no tiers at all means "not set up", and the copy
     bundled in data/partners.js still covers the section — which matters right
     now, because the nav links straight at it. Once a single tier exists, the
     database is the only source and deletions are honoured. */
  const configured = Array.isArray(live.partnerTiers) && live.partnerTiers.length > 0;
  const partners = configured ? live.partners : fallbackPartners;
  const partnerTiers = configured ? live.partnerTiers : fallbackTiers;

  const counts = useMemo(() => {
    const c = { all: partners.length };
    partnerTiers.forEach((t) => {
      c[t.key] = partners.filter((p) => p.tier === t.key).length;
    });
    return c;
  }, [partners, partnerTiers]);

  // only render tiers that survive the filter and actually hold partners
  const shownTiers = partnerTiers
    .filter((t) => (filter === "all" || filter === t.key) && counts[t.key] > 0)
    .map((t) => ({ ...t, items: partners.filter((p) => p.tier === t.key) }));

  /* A roster the admin has emptied should collapse the section, not leave a
     heading with filter chips reading zero under it. */
  if (partners.length === 0) return null;

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
                <PartnerTile key={p.id || p.name} p={p} index={i} />
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
