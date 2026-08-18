import { audience } from "../../data/experience";
import CardSection from "./CardSection";

/* 3.5 — Who's in the Room. Cream ground, 4-up grid. */
export default function Audience() {
  return (
    <CardSection
      alt
      badge={audience.badge}
      heading={audience.heading}
      sub={audience.sub}
      cards={audience.cards}
      cols={4}
    />
  );
}
