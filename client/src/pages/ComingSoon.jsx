import { site, footer } from "../data/site";
import Button from "../components/ui/Button";
import s from "./ComingSoon.module.css";

/* Holding page for the routes still to be built (3.16: /partnership and
   /tickets/registration-form) and for unknown URLs. Without it the nav's
   Register button lands on a blank page in production. */
export default function ComingSoon({
  badge = "Coming soon",
  heading = "This page is on its way.",
  body,
}) {
  return (
    <section className={s.sec}>
      <div className={s.inner}>
        <span className={s.badge}>{badge}</span>
        <h1>{heading}</h1>
        <p>
          {body ||
            `We're putting the finishing touches to this part of the ${site.eventName} site. In the meantime, get in touch and we'll come straight back to you.`}
        </p>
        <div className={s.actions}>
          <Button href={`mailto:${footer.email}`} variant="grad">
            Email us
          </Button>
          <Button href="/" variant="soft">
            Back to home
          </Button>
        </div>
      </div>
    </section>
  );
}
