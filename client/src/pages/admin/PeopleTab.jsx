import { useMemo, useRef, useState } from "react";
import { Reorder, useDragControls } from "framer-motion";
import { adminApi } from "../../lib/api";
import { discardUploaded } from "../../lib/upload";
import PhotoField from "./PhotoField";
import { useAdminList } from "./useAdminList";
import { Btn, ConfirmBar, Field, Icons, TextInput, initialOf } from "./ui";
import s from "./admin.module.css";

/* Delegates and the planning committee.

   One component drives both because they are the same job: a ranked list of
   people with a photo. Delegates differ only in being split across two tiers
   — the featured row and the grid below it — which is what "shown earlier"
   means for that section.

   Order within a list is drag-and-drop, with arrow buttons alongside because
   dragging is neither keyboard-accessible nor pleasant on a phone. */

export const DELEGATES = {
  resource: "delegates",
  folder: "delegates",
  title: "Delegates",
  singular: "delegate",
  blurb:
    "Drag to reorder. The order here is the order on the site, top-left first. Move someone into Featured to give them a large card above the main grid.",
  groups: [
    { id: "key", label: "Featured", note: "Large cards, shown first" },
    { id: "general", label: "Everyone else", note: "The grid underneath" },
  ],
  groupOf: (d) => (d.tier === "key" ? "key" : "general"),
  groupPatch: (id) => ({ tier: id }),
  reorderBody: (lists) => ({
    key: lists.key.map((i) => i.id),
    general: lists.general.map((i) => i.id),
  }),
  extraField: { name: "country", label: "Country", hint: "Shown as the chip on the card" },
};

export const COMMITTEE = {
  resource: "committee",
  folder: "committee",
  title: "Planning committee",
  singular: "member",
  blurb: "Drag to reorder. The order here is the order on the site.",
  groups: [{ id: "all", label: "Committee", note: null }],
  groupOf: () => "all",
  groupPatch: () => ({}),
  reorderBody: (lists) => ({ ids: lists.all.map((i) => i.id) }),
  extraField: null,
};

const emptyPerson = (cfg, groupId) => ({
  name: "",
  position: "",
  company: "",
  linkedin: "",
  ...(cfg.extraField ? { [cfg.extraField.name]: "" } : {}),
  ...cfg.groupPatch(groupId),
  photoUrl: null,
  photoKey: null,
});

/* ------------------------------------------------------------------- form */

function PersonForm({ cfg, initial, onCancel, onSave, saving }) {
  const [draft, setDraft] = useState(initial);
  const [errors, setErrors] = useState(null);
  const [failed, setFailed] = useState(null);

  const set = (k) => (v) => setDraft((d) => ({ ...d, [k]: v }));

  /* Photos upload the moment they are chosen, before the form is submitted.
     Abandoning the form therefore has to take the uploaded file with it, or
     the bucket fills with images no record points at. */
  function cancel() {
    if (draft.photoKey && draft.photoKey !== initial.photoKey) discardUploaded(draft.photoKey);
    onCancel();
  }

  async function submit(e) {
    e.preventDefault();
    setErrors(null);
    setFailed(null);
    if (!draft.name?.trim()) {
      setErrors({ name: "A name is required." });
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
      <PhotoField
        value={draft.photoUrl}
        valueKey={draft.photoKey}
        name={draft.name}
        folder={cfg.folder}
        disabled={saving}
        onChange={(p) => setDraft((d) => ({ ...d, ...p }))}
      />

      <div className={s.formGrid}>
        <Field label="Name" error={errors?.name}>
          <TextInput value={draft.name} onChange={set("name")} placeholder="Asha Mehta" autoFocus />
        </Field>
        <Field label="Position" error={errors?.position}>
          <TextInput value={draft.position} onChange={set("position")} placeholder="Managing Partner" />
        </Field>
        <Field label="Company" error={errors?.company}>
          <TextInput value={draft.company} onChange={set("company")} placeholder="Marwar Capital" />
        </Field>
        {cfg.extraField && (
          <Field label={cfg.extraField.label} hint={cfg.extraField.hint}>
            <TextInput
              value={draft[cfg.extraField.name]}
              onChange={set(cfg.extraField.name)}
              placeholder="India"
            />
          </Field>
        )}
        <Field label="LinkedIn URL" error={errors?.linkedin} hint="Leave blank to hide the icon" wide>
          <TextInput
            value={draft.linkedin}
            onChange={set("linkedin")}
            type="url"
            placeholder="https://www.linkedin.com/in/…"
          />
        </Field>
      </div>

      {failed && <p className={s.formError}>{failed}</p>}

      <div className={s.formActions}>
        <Btn kind="ghost" onClick={cancel} disabled={saving}>
          Cancel
        </Btn>
        <button type="submit" className={`${s.btn} ${s.primary}`} disabled={saving}>
          {saving ? "Saving…" : "Save"}
        </button>
      </div>
    </form>
  );
}

/* -------------------------------------------------------------------- row */

function PersonRow({ cfg, item, index, total, editing, onEdit, onSave, onDelete, onMove, onNudge, saving, otherGroup, onDragEnd }) {
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
          aria-label={`Reorder ${item.name}`}
          title="Drag to reorder"
        >
          <Icons.drag size={18} />
        </button>

        <div className={s.avatar}>
          {item.photoUrl ? (
            <img src={item.photoUrl} alt="" loading="lazy" />
          ) : (
            <span aria-hidden="true">{initialOf(item.name)}</span>
          )}
        </div>

        <div className={s.rowText}>
          <div className={s.rowName}>{item.name}</div>
          <div className={s.rowMeta}>
            {[item.position, item.company].filter(Boolean).join(" · ") || (
              <em className={s.dim}>No position set</em>
            )}
          </div>
        </div>

        <div className={s.rank} aria-hidden="true">
          {index + 1}
        </div>

        <div className={s.rowActions}>
          <button
            type="button"
            className={s.iconBtn}
            onClick={() => onNudge(-1)}
            disabled={index === 0}
            aria-label={`Move ${item.name} up`}
            title="Move up"
          >
            <Icons.up size={15} />
          </button>
          <button
            type="button"
            className={s.iconBtn}
            onClick={() => onNudge(1)}
            disabled={index === total - 1}
            aria-label={`Move ${item.name} down`}
            title="Move down"
          >
            <Icons.down size={15} />
          </button>
          {otherGroup && (
            <button
              type="button"
              className={s.iconBtn}
              onClick={onMove}
              aria-label={`Move ${item.name} to ${otherGroup.label}`}
              title={`Move to ${otherGroup.label}`}
            >
              <Icons.star size={15} />
            </button>
          )}
          <button
            type="button"
            className={s.iconBtn}
            onClick={onEdit}
            aria-label={`Edit ${item.name}`}
            title="Edit"
          >
            <Icons.edit size={15} />
          </button>
          <button
            type="button"
            className={`${s.iconBtn} ${s.iconDanger}`}
            onClick={() => setConfirming(true)}
            aria-label={`Delete ${item.name}`}
            title="Delete"
          >
            <Icons.trash size={15} />
          </button>
        </div>
      </div>

      {confirming && (
        <ConfirmBar
          label={`Delete ${item.name}? This also removes their photo.`}
          onCancel={() => setConfirming(false)}
          onConfirm={() => {
            setConfirming(false);
            onDelete();
          }}
        />
      )}

      {editing && (
        <div className={s.rowForm}>
          <PersonForm
            cfg={cfg}
            initial={{
              name: item.name || "",
              position: item.position || "",
              company: item.company || "",
              linkedin: item.linkedin || "",
              ...(cfg.extraField ? { [cfg.extraField.name]: item[cfg.extraField.name] || "" } : {}),
              photoUrl: item.photoUrl || null,
              photoKey: item.photoKey || null,
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

/* -------------------------------------------------------------------- tab */

export default function PeopleTab({ cfg }) {
  const { items, setItems, loading, error, setError, busy, reload, create, update, remove, saveOrder } =
    useAdminList(cfg.resource);

  const [editingId, setEditingId] = useState(null);
  const [addingTo, setAddingTo] = useState(null);
  const [purging, setPurging] = useState(false);
  const rollback = useRef(null);

  const lists = useMemo(() => {
    const out = Object.fromEntries(cfg.groups.map((g) => [g.id, []]));
    for (const it of items) {
      const g = cfg.groupOf(it);
      (out[g] || out[cfg.groups[0].id]).push(it);
    }
    for (const g of cfg.groups) out[g.id].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    return out;
  }, [items, cfg]);

  /* Flattens the grouped lists back into the single array the hook holds,
     renumbering order and stamping group membership as it goes. */
  const flatten = (next) =>
    cfg.groups.flatMap((g) =>
      next[g.id].map((it, i) => ({ ...it, order: i, ...cfg.groupPatch(g.id) }))
    );

  const applyLocal = (next) => setItems(flatten(next));

  const commit = (next) => {
    applyLocal(next);
    saveOrder(cfg.reorderBody(next), rollback.current || items);
    rollback.current = null;
  };

  function onReorder(groupId, nextGroup) {
    if (!rollback.current) rollback.current = items;
    applyLocal({ ...lists, [groupId]: nextGroup });
  }

  function onDrop(groupId) {
    const body = cfg.reorderBody(lists);
    saveOrder(body, rollback.current);
    rollback.current = null;
    void groupId;
  }

  function nudge(groupId, index, delta) {
    const next = [...lists[groupId]];
    const target = index + delta;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    rollback.current = items;
    commit({ ...lists, [groupId]: next });
  }

  /* Cross-tier move. Framer's Reorder cannot drag between two groups, and a
     button is clearer anyway: the person goes to the top of the other list,
     which is where you want them if you are promoting someone. */
  function moveGroup(fromId, item) {
    const toId = cfg.groups.find((g) => g.id !== fromId)?.id;
    if (!toId) return;
    rollback.current = items;
    commit({
      ...lists,
      [fromId]: lists[fromId].filter((i) => i.id !== item.id),
      [toId]: [item, ...lists[toId]],
    });
  }

  async function purgePlaceholders() {
    setPurging(true);
    try {
      await adminApi("/api/admin/delegates/purge-placeholders", { method: "POST" });
      await reload();
    } catch (err) {
      setError(err);
    } finally {
      setPurging(false);
    }
  }

  const placeholderCount = items.filter((i) => /^\s*\[.*\]\s*$/.test(i.name || "")).length;

  if (loading) return <p className={s.loading}>Loading {cfg.title.toLowerCase()}…</p>;

  return (
    <div>
      <div className={s.tabHead}>
        <div>
          <h2 className={s.tabTitle}>{cfg.title}</h2>
          <p className={s.tabBlurb}>{cfg.blurb}</p>
        </div>
        {cfg.resource === "delegates" && placeholderCount > 0 && (
          <Btn kind="ghost" onClick={purgePlaceholders} disabled={purging}>
            {purging ? "Removing…" : `Remove ${placeholderCount} placeholders`}
          </Btn>
        )}
      </div>

      {error && (
        <p className={s.banner} role="alert">
          {error.message}
        </p>
      )}

      {cfg.groups.map((group) => (
        <section key={group.id} className={s.group}>
          <header className={s.groupHead}>
            <h3>
              {group.label}
              <span className={s.count}>{lists[group.id].length}</span>
            </h3>
            {group.note && <span className={s.groupNote}>{group.note}</span>}
            <Btn kind="ghost" icon={Icons.plus} onClick={() => setAddingTo(group.id)}>
              Add {cfg.singular}
            </Btn>
          </header>

          {addingTo === group.id && (
            <div className={s.addCard}>
              <PersonForm
                cfg={cfg}
                initial={emptyPerson(cfg, group.id)}
                saving={busy}
                onCancel={() => setAddingTo(null)}
                onSave={async (draft) => {
                  await create(draft);
                  setAddingTo(null);
                }}
              />
            </div>
          )}

          {lists[group.id].length === 0 ? (
            <p className={s.empty}>Nothing here yet.</p>
          ) : (
            <Reorder.Group
              axis="y"
              as="ul"
              className={s.list}
              values={lists[group.id]}
              onReorder={(next) => onReorder(group.id, next)}
            >
              {lists[group.id].map((item, i) => (
                <PersonRow
                  key={item.id}
                  cfg={cfg}
                  item={item}
                  index={i}
                  total={lists[group.id].length}
                  saving={busy}
                  editing={editingId === item.id}
                  otherGroup={cfg.groups.length > 1 ? cfg.groups.find((g) => g.id !== group.id) : null}
                  onEdit={(v) => setEditingId(v === false ? null : item.id)}
                  onNudge={(delta) => nudge(group.id, i, delta)}
                  onMove={() => moveGroup(group.id, item)}
                  onDelete={() => remove(item.id).catch(setError)}
                  onDragEnd={() => onDrop(group.id)}
                  onSave={async (draft) => {
                    await update(item.id, draft);
                    setEditingId(null);
                  }}
                />
              ))}
            </Reorder.Group>
          )}
        </section>
      ))}
    </div>
  );
}
