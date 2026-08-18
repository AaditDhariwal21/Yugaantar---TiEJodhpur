import { themes } from "../../data/experience";
import CardSection from "./CardSection";

/* 3.6 — On the Agenda (themes). White ground, 6 cards 3-up.
   Owns the #agenda anchor; the timeline lives at #agendatable. */
export default function Themes() {
  return (
    <CardSection
      id="agenda"
      badge={themes.badge}
      heading={themes.heading}
      sub={themes.sub}
      cards={themes.cards}
      cols={3}
    />
  );
}
