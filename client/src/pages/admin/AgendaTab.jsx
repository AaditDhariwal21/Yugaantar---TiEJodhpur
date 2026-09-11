import { useMemo, useRef, useState } from "react";
import { Reorder, useDragControls } from "framer-motion";
import { useAdminList } from "./useAdminList";
import { Btn, ConfirmBar, Field, Icons, Select, TextArea, TextInput } from "./ui";
import s from "./admin.module.css";

/* The two-day programme.

   Times are free text, not a time picker, because the real schedule contains
   values a picker cannot express — the last block of day one ends at
   "Onward". The site prints these verbatim.

   A session with one or more tracks renders on the site as an expandable row;
   with none, it is a plain entry. That is the only thing `tracks` controls. */

const TYPES = [
  { value: "plenary", label: "Plenary — main stage" },
  { value: "breakout", label: "Breakout — parallel tracks" },
  { value: "break", label: "Break / networking" },
];

const emptySession = (day) => ({
  day,
  type: "plenary",
  start: "",
  end: "",
  title: "",
  subtitle: "",
  parallel: false,
  tracks: [],
});

/* --------------------------------------------------------------- tracks -- */

function TracksEditor({ tracks, onChange }) {
  const set = (i, k, v) => onChange(tracks.map((t, j) => (j === i ? { ...t, [k]: v } : t)));

  return (
    <div className={s.tracks}>
      <div className={s.tracksHead}>
        <span className={s.fieldLabel}>Breakout tracks</span>
        <span className={s.fieldHint}>
          {tracks.length === 0
            ? "None — this renders as a normal row."
            : `${tracks.length} track${tracks.length === 1 ? "" : "s"}; the row becomes expandable.`}
        </span>
      </div>

      {tracks.map((t, i) => (
        <div className={s.track} key={i}>
          <div className={s.trackTop}>
            <TextInput
              value={t.label}
              onChange={(v) => set(i, "label", v)}
              placeholder={`Track 0${i + 1}`}
              aria-label="Track label"
            />
            <button
              type="button"
              className={`${s.iconBtn} ${s.iconDanger}`}
              onClick={() => onChange(tracks.filter((_, j) => j !== i))}
              aria-label="Remove track"
              title="Remove track"
            >
              <Icons.trash size={15} />
            </button>
          </div>
          <TextInput
            value={t.title}
            onChange={(v) => set(i, "title", v)}
            placeholder="Track title"
            aria-label="Track title"
          />
          <TextArea
            value={t.subtitle}
            onChange={(v) => set(i, "subtitle", v)}
            rows={2}
            placeholder="One line of detail (optional)"
            aria-label="Track description"
          />
        </div>
      ))}

      <Btn
        kind="ghost"
        icon={Icons.plus}
        onClick={() => onChange([...tracks, { label: `Track 0${tracks.length + 1}`, title: "", subtitle: "" }])}
      >
        Add track
      </Btn>
    </div>
  );
}

/* ---------------------------------------------------------------- form -- */

function SessionForm({ initial, onCancel, onSave, saving }) {
  const [draft, setDraft] = useState(initial);
  const [errors, setErrors] = useState(null);
  const [failed, setFailed] = useState(null);
  const set = (k) => (v) => setDraft((d) => ({ ...d, [k]: v }));

  async function submit(e) {
    e.preventDefault();
    setErrors(null);
    setFailed(null);
    if (!draft.title?.trim()) {
      setErrors({ title: "A title is required." });
      return;
    }
    try {
      await onSave(draft);
    } catch (err) {
      setErrors(err.errors || null);
      if (!err.errors) setFailed(err.message);
    }
  }

  return (
    <form className={s.form} onSubmit={submit}>
      <div className={s.formGrid}>
        <Field label="Starts" hint="Free text — e.g. 09:45 AM">
          <TextInput value={draft.start} onChange={set("start")} placeholder="09:45 AM" autoFocus />
        </Field>
        <Field label="Ends" hint={'Can be "Onward"'}>
          <TextInput value={draft.end} onChange={set("end")} placeholder="10:30 AM" />
        </Field>
        <Field label="Type">
          <Select value={draft.type} onChange={set("type")} options={TYPES} />
        </Field>
        <Field label="Scheduling">
          <label className={s.checkRow}>
            <input
              type="checkbox"
              checked={Boolean(draft.parallel)}
              onChange={(e) => setDraft((d) => ({ ...d, parallel: e.target.checked }))}
            />
            <span>Runs alongside the main stage</span>
          </label>
        </Field>
        <Field label="Title" error={errors?.title} wide>
          <TextInput value={draft.title} onChange={set("title")} placeholder="Welcome Note & Opening Address" />
        </Field>
        <Field label="Description" hint="Optional. Leave blank and the row renders centred." wide>
          <TextArea value={draft.subtitle} onChange={set("subtitle")} rows={3} />
        </Field>
      </div>

      <TracksEditor tracks={draft.tracks || []} onChange={(t) => setDraft((d) => ({ ...d, tracks: t }))} />

      {failed && <p className={s.formError}>{failed}</p>}

      <div className={s.formActions}>
        <Btn kind="ghost" onClick={onCancel} disabled={saving}>
          Cancel
        </Btn>
        <button type="submit" className={`${s.btn} ${s.primary}`} disabled={saving}>
          {saving ? "Saving…" : "Save"}
        </button>
      </div>
    </form>
  );
}

/* ----------------------------------------------------------------- row -- */

function SessionRow({ item, index, total, editing, onEdit, onSave, onDelete, onNudge, onDragEnd, saving }) {
  const controls = useDragControls();
  const [confirming, setConfirming] = useState(false);

  return (
    <Reorder.Item
      value={item}
      as="li"
      className={s.row}
      dragListener={false}
      dragControls={controls}
      onDragEnd={onDragEnd}
    >
      <div className={s.rowMain}>
        <button
          type="button"
          className={s.handle}
          onPointerDown={(e) => controls.start(e)}
          aria-label={`Reorder ${item.title}`}
          title="Drag to reorder"
        >
          <Icons.drag size={18} />
        </button>

        <div className={s.time}>
          <span>{item.start || "—"}</span>
          <span className={s.dim}>{item.end}</span>
        </div>

        <div className={s.rowText}>
          <div className={s.rowName}>{item.title}</div>
          <div className={s.rowMeta}>
            <span className={`${s.pill} ${s[item.type]}`}>{item.type}</span>
            {item.parallel && <span className={s.pill}>parallel</span>}
            {item.tracks?.length > 0 && (
              <span className={s.pill}>
                {item.tracks.length} track{item.tracks.length === 1 ? "" : "s"}
              </span>
            )}
            {item.subtitle && <span className={s.truncate}>{item.subtitle}</span>}
          </div>
        </div>

        <div className={s.rowActions}>
          <button
            type="button"
            className={s.iconBtn}
            onClick={() => onNudge(-1)}
            disabled={index === 0}
            aria-label="Move earlier"
            title="Move up"
          >
            <Icons.up size={15} />
          </button>
          <button
            type="button"
            className={s.iconBtn}
            onClick={() => onNudge(1)}
            disabled={index === total - 1}
            aria-label="Move later"
            title="Move down"
          >
            <Icons.down size={15} />
          </button>
          <button
            type="button"
            className={s.iconBtn}
            onClick={onEdit}
            aria-label={`Edit ${item.title}`}
            title="Edit"
          >
            <Icons.edit size={15} />
          </button>
          <button
            type="button"
            className={`${s.iconBtn} ${s.iconDanger}`}
            onClick={() => setConfirming(true)}
            aria-label={`Delete ${item.title}`}
            title="Delete"
          >
            <Icons.trash size={15} />
          </button>
        </div>
      </div>

      {confirming && (
        <ConfirmBar
          label={`Delete "${item.title}"?`}
          onCancel={() => setConfirming(false)}
          onConfirm={() => {
            setConfirming(false);
            onDelete();
          }}
        />
      )}

      {editing && (
        <div className={s.rowForm}>
          <SessionForm
            initial={{
              day: item.day,
              type: item.type,
              start: item.start || "",
              end: item.end || "",
              title: item.title || "",
              subtitle: item.subtitle || "",
              parallel: Boolean(item.parallel),
              tracks: (item.tracks || []).map((t) => ({ ...t })),
            }}
            saving={saving}
            onCancel={() => onEdit(false)}
            onSave={onSave}
          />
        </div>
      )}
    </Reorder.Item>
  );
}

/* ------------------------------------------------------------ day header */

function DayHeader({ day, onSave, saving }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(null);
  const set = (k) => (v) => setDraft((d) => ({ ...d, [k]: v }));

  function begin() {
    setDraft({
      label: day.label || "",
      short: day.short || "",
      date: day.date || "",
      theme: day.theme || "",
    });
    setOpen(true);
  }

  if (!open) {
    return (
      <div className={s.dayCard}>
        <div>
          <div className={s.dayDate}>{day.date || <em className={s.dim}>No date set</em>}</div>
          <div className={s.dayTheme}>
            {day.theme || <em className={s.dim}>No main-stage theme</em>}
          </div>
        </div>
        <Btn kind="ghost" icon={Icons.edit} onClick={begin}>
          Edit day
        </Btn>
      </div>
    );
  }

  return (
    <div className={s.dayCard}>
      <form
        className={s.form}
        onSubmit={async (e) => {
          e.preventDefault();
          await onSave(draft);
          setOpen(false);
        }}
      >
        <div className={s.formGrid}>
          <Field label="Tab label" hint="The switcher button">
            <TextInput value={draft.label} onChange={set("label")} placeholder="Day 1" />
          </Field>
          <Field label="Short label" hint="Under the tab label">
            <TextInput value={draft.short} onChange={set("short")} placeholder="22 Oct" />
          </Field>
          <Field label="Full date" wide>
            <TextInput value={draft.date} onChange={set("date")} placeholder="Thursday, 22 October 2026" />
          </Field>
          <Field label="Main-stage theme" hint="Leave blank to hide the line" wide>
            <TextInput
              value={draft.theme}
              onChange={set("theme")}
              placeholder="Main stage · Local Roots (Build Local)"
            />
          </Field>
        </div>
        <div className={s.formActions}>
          <Btn kind="ghost" onClick={() => setOpen(false)} disabled={saving}>
            Cancel
          </Btn>
          <button type="submit" className={`${s.btn} ${s.primary}`} disabled={saving}>
            {saving ? "Saving…" : "Save day"}
          </button>
        </div>
      </form>
    </div>
  );
}

/* ----------------------------------------------------------------- tab -- */

export default function AgendaTab() {
  const sessions = useAdminList("agenda");
  const days = useAdminList("days");

  const [activeDay, setActiveDay] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [adding, setAdding] = useState(false);
  const rollback = useRef(null);

  const dayList = useMemo(
    () => [...days.items].sort((a, b) => (a.order ?? a.key) - (b.order ?? b.key)),
    [days.items]
  );

  const currentKey = activeDay ?? dayList[0]?.key ?? 1;
  const currentDay = dayList.find((d) => d.key === currentKey);

  const rows = useMemo(
    () =>
      sessions.items
        .filter((x) => x.day === currentKey)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [sessions.items, currentKey]
  );

  /* Only this day's rows are renumbered; the other day keeps its own ranking
     untouched, which is why the reorder body carries a day. */
  const applyLocal = (next) => {
    const others = sessions.items.filter((x) => x.day !== currentKey);
    sessions.setItems([...others, ...next.map((it, i) => ({ ...it, order: i, day: currentKey }))]);
  };

  const commit = (next) => {
    applyLocal(next);
    sessions.saveOrder({ day: currentKey, ids: next.map((i) => i.id) }, rollback.current || sessions.items);
    rollback.current = null;
  };

  function nudge(index, delta) {
    const next = [...rows];
    const target = index + delta;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    rollback.current = sessions.items;
    commit(next);
  }

  if (sessions.loading || days.loading) return <p className={s.loading}>Loading the agenda…</p>;

  const err = sessions.error || days.error;

  return (
    <div>
      <div className={s.tabHead}>
        <div>
          <h2 className={s.tabTitle}>Agenda</h2>
          <p className={s.tabBlurb}>
            Drag to reorder within a day. Times are free text and print exactly as typed. The
            plenary and breakout counters on the site are derived from these rows, so they stay
            correct on their own.
          </p>
        </div>
      </div>

      {err && (
        <p className={s.banner} role="alert">
          {err.message}
        </p>
      )}

      <div className={s.dayTabs} role="tablist" aria-label="Choose a day">
        {dayList.map((d) => (
          <button
            key={d.key}
            type="button"
            role="tab"
            aria-selected={d.key === currentKey}
            data-on={d.key === currentKey}
            className={s.dayTab}
            onClick={() => {
              setActiveDay(d.key);
              setEditingId(null);
              setAdding(false);
            }}
          >
            <span>{d.label || `Day ${d.key}`}</span>
            <span className={s.dim}>{d.short}</span>
            <span className={s.count}>{sessions.items.filter((x) => x.day === d.key).length}</span>
          </button>
        ))}
      </div>

      {currentDay && (
        <DayHeader
          day={currentDay}
          saving={days.busy}
          onSave={(draft) => days.update(currentDay.id, draft)}
        />
      )}

      <div className={s.groupHead}>
        <h3>
          Sessions
          <span className={s.count}>{rows.length}</span>
        </h3>
        <Btn kind="ghost" icon={Icons.plus} onClick={() => setAdding(true)}>
          Add session
        </Btn>
      </div>

      {adding && (
        <div className={s.addCard}>
          <SessionForm
            initial={emptySession(currentKey)}
            saving={sessions.busy}
            onCancel={() => setAdding(false)}
            onSave={async (draft) => {
              await sessions.create({ ...draft, day: currentKey });
              setAdding(false);
            }}
          />
        </div>
      )}

      {rows.length === 0 ? (
        <p className={s.empty}>No sessions on this day yet.</p>
      ) : (
        <Reorder.Group
          axis="y"
          as="ul"
          className={s.list}
          values={rows}
          onReorder={(next) => {
            if (!rollback.current) rollback.current = sessions.items;
            applyLocal(next);
          }}
        >
          {rows.map((item, i) => (
            <SessionRow
              key={item.id}
              item={item}
              index={i}
              total={rows.length}
              saving={sessions.busy}
              editing={editingId === item.id}
              onEdit={(v) => setEditingId(v === false ? null : item.id)}
              onNudge={(delta) => nudge(i, delta)}
              onDelete={() => sessions.remove(item.id).catch(sessions.setError)}
              onDragEnd={() => {
                sessions.saveOrder({ day: currentKey, ids: rows.map((r) => r.id) }, rollback.current);
                rollback.current = null;
              }}
              onSave={async (draft) => {
                await sessions.update(item.id, draft);
                setEditingId(null);
              }}
            />
          ))}
        </Reorder.Group>
      )}
    </div>
  );
}
