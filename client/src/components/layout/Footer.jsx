import { site, footer, finalCta } from "../../data/site";
import Icon from "../ui/Icon";
import Button from "../ui/Button";
import HashLink from "../ui/HashLink";
import Reveal from "../ui/Reveal";
import s from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={s.foot} id="contact">
      <div className={s.wrap}>
        {/* 3.14 — final CTA band */}
        <Reveal className={s.fcta} y={22} duration={0.6}>
          <h2>{finalCta.heading}</h2>
          <p>{finalCta.body}</p>
          <div className={s.ctaBtn}>
            <Button href={finalCta.cta.href} variant="light">
              {finalCta.cta.label}
            </Button>
          </div>
        </Reveal>

        {/* 3.15 — footer columns */}
        <div className={s.cols}>
          <div>
            <div className={s.fbrand}>
              {site.logo ? (
                <img src={site.logo} alt={site.logoAlt} />
              ) : (
                <span className={s.mark} aria-hidden="true">
                  TiE
                </span>
              )}
              {site.eventName}
            </div>
            <p className={s.ftag}>{footer.tagline}</p>
          </div>

          <div>
            <div className={s.ftitle}>{footer.exploreTitle}</div>
            <nav className={s.flist} aria-label="Footer">
              {footer.explore.map((l) => (
                <HashLink key={l.label} to={l.href}>
                  {l.label}
                </HashLink>
              ))}
            </nav>
          </div>

          <div>
            <div className={s.ftitle}>{footer.contactTitle}</div>
            <div className={s.flist}>
              <a href={`mailto:${footer.email}`}>
                <span className={s.ci}>
                  <Icon name="mail" size={17} />
                </span>
                {footer.email}
              </a>
              <div className={s.crow}>
                <span className={s.ci}>
                  <Icon name="pin" size={17} />
                </span>
                <span>
                  {footer.address.map((line) => (
                    <span key={line} style={{ display: "block" }}>
                      {line}
                    </span>
                  ))}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className={s.bottom}>
          <span>{footer.copyright}</span>
          <span>
            <a href={`https://${site.url}`}>{site.url}</a> &nbsp;·&nbsp; {footer.hashtags}
          </span>
        </div>
      </div>
    </footer>
  );
}
