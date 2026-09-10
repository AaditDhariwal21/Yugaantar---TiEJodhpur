import { Fragment, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { agenda, agendaDays, agendaFilters, agendaMeta } from "../../data/agenda";
import Icon from "../ui/Icon";
import s from "./Agenda.module.css";

const ORNAMENT = "+ · ✦ · +";

/* Builds the .ics client-side so "Add to calendar" needs no server round-trip.
   Long lines are folded at 75 octets and commas/semicolons escaped, per RFC
   5545 — Outlook in particular rejects the file otherwise. */
function downloadIcs(cal) {
  const esc = (v) => String(v).replace(/([,;\\])/g, "\\$1").replace(/\n/g, "\\n");
  const fold = (line) => line.match(/.{1,74}/g).join("\r\n ");
  const stamp = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//TiE Jodhpur//Yugaantar 2026//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    "UID:yugaantar-2026@tiejodhpur",
    `DTSTAMP:${stamp}`,
    `DTSTART;VALUE=DATE:${cal.start}`,
    `DTEND;VALUE=DATE:${cal.endExclusive}`,
    fold(`SUMMARY:${esc(cal.summary)}`),
    fold(`LOCATION:${esc(cal.location)}`),
    fold(`DESCRIPTION:${esc(cal.description)}`),
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  const blob = new Blob([lines.join("\r\n")], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "yugaantar-2026.ics";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function AgendaRow({ block, index }) {
  const [open, setOpen] = useState(false);
  const hasTracks = Array.isArray(block.tracks) && block.tracks.length > 0;
  const centred = !block.subtitle && !hasTracks;

  const heading = (
    <>
      <div className={s.title}>{block.title}</div>
      {block.subtitle && <p className={s.subtitle}>{block.subtitle}</p>}
      {block.parallel && (
        <div className={s.meta}>Parallel session · runs alongside the main stage</div>
      )}
    </>
  );

  return (
    <div
      className={`${s.row} ${centred ? s.centred : ""}`}
      style={{ animationDelay: `${Math.min(index, 10) * 45}ms` }}
    >
      <div className={s.time}>
        <div>{block.start}</div>
        <div className={s.timeEnd}>{block.end}</div>
      </div>
      <span className={s.marker} aria-hidden="true" />

      <div className={s.body}>
        {hasTracks ? (
          <>
            <button
              type="button"
              className={s.expander}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
            >
              <div className={s.title} style={{ textAlign: "center" }}>
                <span className={s.expTitle}>
                  {block.title}
                  <Icon name="chevron" size={15} className={s.caret} strokeWidth={2.2} />
                </span>
              </div>
              <div className={s.meta}>
                {block.tracks.length} parallel tracks · tap to open
              </div>
            </button>

            <AnimatePresence initial={false}>
              {open && (
                <motion.div
                  className={s.tracks}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className={s.tracksInner}>
                    {block.tracks.map((t) => (
                      <div className={s.track} key={t.label}>
                        <div className={s.trackLabel}>{t.label}</div>
                        <div className={s.trackTitle}>{t.title}</div>
                        {t.subtitle && <p className={s.trackSub}>{t.subtitle}</p>}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        ) : (
          heading
        )}
      </div>
    </div>
  );
}

export default function Agenda() {
  const [day, setDay] = useState(agendaDays[0].key);
  const [filter, setFilter] = useState("all");

  const visible = useMemo(
    () =>
      agenda
        .filter((b) => b.day === day)
        .filter((b) => filter === "all" || b.type === filter),
    [day, filter]
  );

  /* Counted from the schedule rather than hardcoded, so editing agenda.js can
     never leave the stat tiles claiming the wrong numbers. */
  const stats = useMemo(() => {
    const plenary = agenda.filter((b) => b.type === "plenary").length;
    // a breakout row either fans out into tracks, or is itself one session
    const tracks = agenda.reduce(
      (n, b) => n + (b.tracks ? b.tracks.length : b.type === "breakout" ? 1 : 0),
      0
    );
    return [
      { value: String(plenary), label: agendaMeta.statLabels.plenary },
      { value: String(tracks), label: agendaMeta.statLabels.breakout },
      { value: String(agendaDays.length), label: agendaMeta.statLabels.days },
    ];
  }, []);

  const activeDay = agendaDays.find((d) => d.key === day) || agendaDays[0];

  return (
    <section className={s.sec} id="agendatable">
      <div className={s.glows} aria-hidden="true" />
      <div className={s.wrap}>
        <div className={s.split}>
          {/* ---- left rail ---- */}
          <div>
            <div className={s.badge}>{agendaMeta.badge}</div>
            <h2 className={s.h2}>
              {agendaMeta.headingLines.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </h2>
            <div className={s.orn} aria-hidden="true">
              {ORNAMENT}
            </div>
            <p className={s.railSub}>{agendaMeta.sub}</p>

            <div className={s.stats}>
              {stats.map((st) => (
                <div key={st.label}>
                  <div className={s.statV}>{st.value}</div>
                  <div className={s.statL}>{st.label}</div>
                </div>
              ))}
            </div>

            <button
              type="button"
              className={s.cal}
              onClick={() => downloadIcs(agendaMeta.calendar)}
            >
              <Icon name="calendar" size={17} />
              {agendaMeta.addToCalendar}
            </button>
          </div>

          {/* ---- right rail ---- */}
          <div>
            {/* day switcher — a segmented control, distinct from the type chips
                below it so the two filters never read as one row */}
            <div className={s.days} role="tablist" aria-label="Choose a day">
              {agendaDays.map((d) => (
                <button
                  key={d.key}
                  type="button"
                  role="tab"
                  aria-selected={day === d.key}
                  data-on={day === d.key}
                  className={s.dayBtn}
                  onClick={() => setDay(d.key)}
                >
                  <span className={s.dayLabel}>{d.label}</span>
                  <span className={s.dayShort}>{d.short}</span>
                </button>
              ))}
            </div>

            <div className={s.dateRow}>
              <div className={s.date}>{activeDay.date}</div>
              <div className={s.venue}>{agendaMeta.venue}</div>
            </div>
            {activeDay.theme && <div className={s.dayTheme}>{activeDay.theme}</div>}

            <div className={s.filters} role="tablist" aria-label="Filter by session type">
              {agendaFilters.map((f) => (
                <button
                  key={f.key}
                  type="button"
                  role="tab"
                  aria-selected={filter === f.key}
                  data-on={filter === f.key}
                  className={s.chip}
                  onClick={() => setFilter(f.key)}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className={s.rows}>
              {visible.map((block, i) => (
                <Fragment key={`${day}-${block.start}-${block.title}`}>
                  <AgendaRow block={block} index={i} />
                  {i < visible.length - 1 && (
                    <div className={s.divider} aria-hidden="true">
                      <i />
                      <span>{ORNAMENT}</span>
                      <i />
                    </div>
                  )}
                </Fragment>
              ))}
              {visible.length === 0 && (
                <p className={s.empty}>Nothing scheduled in this track yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
