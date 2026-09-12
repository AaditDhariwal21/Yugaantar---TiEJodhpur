import Hero from "../components/sections/Hero";
import About from "../components/sections/About";
import Experience from "../components/sections/Experience";
import Audience from "../components/sections/Audience";
import Themes from "../components/sections/Themes";
import Attend from "../components/sections/Attend";
import Speakers from "../components/sections/Speakers";
import Committee from "../components/sections/Committee";
import PitchRoom from "../components/sections/PitchRoom";
import Agenda from "../components/sections/Agenda";
import Tickets from "../components/sections/Tickets";
import Partners from "../components/sections/Partners";
import GlobalCommunity from "../components/sections/GlobalCommunity";

export default function Home() {
  return (
    <>
      <Hero />
      <About />
      <Experience />
      <Audience />
      <Themes />
      <Attend />
      <Speakers />
      <Committee />
      {/* Sits immediately ahead of the timetable: it is programme content, and
          the headline event reads best right before the full schedule. */}
      <PitchRoom />
      <Agenda />
      <Tickets />
      <Partners />
      <GlobalCommunity />
    </>
  );
}
