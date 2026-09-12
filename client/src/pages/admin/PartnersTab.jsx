import { useMemo, useRef, useState } from "react";
import { Reorder, useDragControls } from "framer-motion";
import { discardUploaded } from "../../lib/upload";
import PhotoField from "./PhotoField";
import { useAdminList } from "./useAdminList";
import { Btn, ConfirmBar, Field, Icons, Select, TextInput, initialOf } from "./ui";
import s from "./admin.module.css";

/* Partners, and the tiers they are grouped under.

   Two collections, like the agenda: the tiers are the groups the section
   renders under ("Silver Partner"), and each partner points at one. They are
   edited on one screen rather than two tabs because a tier with nothing in it
   is not useful on its own, and adding a sponsor usually means picking — or
   creating — the tier in the same sitting.

   A tier is identified by its id, not by a slug, so renaming one is free and
   the partners under it are untouched. Deleting a non-empty tier is refused by
   the server: its partners would still exist but would stop rendering, with
   nothing in the panel to lead you back to them.

   Logos are fitted, never cropped — see PhotoField's shape="logo". */

const emptyPartner = (tierId) => ({
  name: "",
  url: "",
  tier: tierId,
  exclusive: false,
  photoUrl: null,
  photoKey: null,
});

/* ------------------------------------------------------------------- form */

function PartnerForm({ initial, tiers, onCancel, onSave, saving }) {
  const [draft, setDraft] = useState(initial);
  const [errors, setErrors] = useState(null);
  const [failed, setFailed] = useState(null);
  const set = (k) => (v) => setDraft((d) => ({ ...d, [k]: v }));

  /* The logo uploads the moment it is chosen, before the form is submitted, so
     abandoning the form has to take the uploaded file with it. */
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
        shape="logo"
        value={draft.photoUrl}
        valueKey={draft.photoKey}
        name={draft.name}
        folder="partners"
        disabled={saving}
        onChange={(p) => setDraft((d) => ({ ...d, ...p }))}
      />

      <div className={s.formGrid}>
        <Field label="Partner name" error={errors?.name}>
          <TextInput
            value={draft.name}
            onChange={set("name")}
            placeholder="Marwar Capital"
            autoFocus
          />
        </Field>
        <Field label="Tier">
          <Select
            value={draft.tier}
            onChange={set("tier")}
            options={tiers.map((t) => ({ value: t.id, label: t.label }))}
          />
        </Field>
        <Field
          label="Website"
          error={errors?.url}
          hint="Leave blank and the tile is not a link"
          wide
        >
          <TextInput
            value={draft.url}
            onChange={set("url")}
            type="url"
            placeholder="https://example.com"
          />
        </Field>
        <Field label="Badge" hint={'Adds the "Exclusive" chip to the tile'}>
          <label className={s.checkRow}>
            <input
              type="checkbox"
              checked={Boolean(draft.exclusive)}
              onChange={(e) => setDraft((d) => ({ ...d, exclusive: e.target.checked }))}
            />
            <span>Exclusive partner</span>
          </label>
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

function PartnerRow({
  item,
  index,
  total,
  tiers,
  editing,
  saving,
  onEdit,
  onSave,
  onDelete,
  onNudge,
  onDragEnd,
}) {
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

        <div className={`${s.avatar} ${s.avatarWide}`}>
          {item.photoUrl ? (
            <img src={item.photoUrl} alt="" loading="lazy" />
          ) : (
            <span aria-hidden="true">{initialOf(item.name)}</span>
          )}
        </div>

        <div className={s.rowText}>
          <div className={s.rowName}>{item.name}</div>
          <div className={s.rowMeta}>
            {item.exclusive && <span className={s.pill}>exclusive</span>}
            {item.url ? (
              <span className={s.truncate}>{item.url}</span>
            ) : (
              <em className={s.dim}>No website</em>
            )}
            {!item.photoUrl && <em className={s.dim}>· No logo</em>}
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
          label={`Delete ${item.name}? This also removes their logo.`}
          onCancel={() => setConfirming(false)}
          onConfirm={() => {
            setConfirming(false);
            onDelete();
          }}
        />
      )}

      {editing && (
        <div className={s.rowForm}>
          <PartnerForm
            tiers={tiers}
            initial={{
              name: item.name || "",
              url: item.url || "",
              tier: item.tier,
              exclusive: Boolean(item.exclusive),
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

/* ------------------------------------------------------------- tier header */

function TierHead({ tier, count, saving, onSave, onDelete, onNudge, first, last, onAdd }) {
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [confirming, setConfirming] = useState(false);

  if (open) {
    return (
      <div className={s.dayCard}>
        <form
          className={s.form}
          onSubmit={async (e) => {
            e.preventDefault();
            if (!label.trim()) return;
            await onSave({ label: label.trim() });
            setOpen(false);
          }}
        >
          <div className={s.formGrid}>
            <Field label="Tier name" hint="The group heading on the site" wide>
              <TextInput
                value={label}
                onChange={setLabel}
                placeholder="Silver Partner"
                autoFocus
              />
            </Field>
          </div>
          <div className={s.formActions}>
            <Btn kind="ghost" onClick={() => setOpen(false)} disabled={saving}>
              Cancel
            </Btn>
            <button
              type="submit"
              className={`${s.btn} ${s.primary}`}
              disabled={saving || !label.trim()}
            >
              {saving ? "Saving…" : "Save tier"}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <>
      <header className={s.groupHead}>
        <h3>
          {tier.label}
          <span className={s.count}>{count}</span>
        </h3>
        <div className={s.rowActions}>
          <button
            type="button"
            className={s.iconBtn}
            onClick={() => onNudge(-1)}
            disabled={first}
            aria-label={`Move ${tier.label} up`}
            title="Move tier up"
          >
            <Icons.up size={15} />
          </button>
          <button
            type="button"
            className={s.iconBtn}
            onClick={() => onNudge(1)}
            disabled={last}
            aria-label={`Move ${tier.label} down`}
            title="Move tier down"
          >
            <Icons.down size={15} />
          </button>
          <button
            type="button"
            className={s.iconBtn}
            onClick={() => {
              setLabel(tier.label || "");
              setOpen(true);
            }}
            aria-label={`Rename ${tier.label}`}
            title="Rename tier"
          >
            <Icons.edit size={15} />
          </button>
          <button
            type="button"
            className={`${s.iconBtn} ${s.iconDanger}`}
            onClick={() => setConfirming(true)}
            aria-label={`Delete ${tier.label}`}
            title="Delete tier"
          >
            <Icons.trash size={15} />
          </button>
        </div>
        <Btn kind="ghost" icon={Icons.plus} onClick={onAdd}>
          Add partner
        </Btn>
      </header>

      {/* A tier holding partners cannot go — the server refuses it — so say so
          rather than offering a Delete button that is going to fail. */}
      {confirming &&
        (count > 0 ? (
          <div className={s.confirm} role="alertdialog">
            <span>
              “{tier.label}” still holds {count} partner{count === 1 ? "" : "s"}. Move them to
              another tier, or delete them, first.
            </span>
            <div className={s.confirmActions}>
              <Btn kind="ghost" onClick={() => setConfirming(false)}>
                Close
              </Btn>
            </div>
          </div>
        ) : (
          <ConfirmBar
            label={`Delete the “${tier.label}” tier?`}
            onCancel={() => setConfirming(false)}
            onConfirm={() => {
              setConfirming(false);
              onDelete();
            }}
          />
        ))}
    </>
  );
}

/* -------------------------------------------------------------------- tab */

export default function PartnersTab() {
  const partners = useAdminList("partners");
  const tiers = useAdminList("partner-tiers");

  const [editingId, setEditingId] = useState(null);
  const [addingTo, setAddingTo] = useState(null);
  const [addingTier, setAddingTier] = useState(false);
  const [newTier, setNewTier] = useState("");
  const rollback = useRef(null);

  const tierList = useMemo(
    () => [...tiers.items].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [tiers.items]
  );

  const byTier = useMemo(() => {
    const out = new Map(tierList.map((t) => [t.id, []]));
    for (const p of partners.items) {
      if (out.has(p.tier)) out.get(p.tier).push(p);
    }
    for (const list of out.values()) list.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    return out;
  }, [partners.items, tierList]);

  /* A partner whose tier was deleted straight out of the database would land
     here. The server refuses to create that state, but a stale panel or a
     hand-edited collection can, and silently hiding the row would be worse
     than showing it. */
  const orphans = useMemo(
    () => partners.items.filter((p) => !byTier.has(p.tier)),
    [partners.items, byTier]
  );

  const applyLocal = (tierId, next) => {
    const others = partners.items.filter((p) => p.tier !== tierId);
    partners.setItems([
      ...others,
      ...next.map((p, i) => ({ ...p, order: i, tier: tierId })),
    ]);
  };

  const commit = (tierId, next) => {
    applyLocal(tierId, next);
    partners.saveOrder(
      { tier: tierId, ids: next.map((p) => p.id) },
      rollback.current || partners.items
    );
    rollback.current = null;
  };

  function nudge(tierId, index, delta) {
    const list = [...(byTier.get(tierId) || [])];
    const target = index + delta;
    if (target < 0 || target >= list.length) return;
    [list[index], list[target]] = [list[target], list[index]];
    rollback.current = partners.items;
    commit(tierId, list);
  }

  /* Tier ranking is its own list, so it gets its own optimistic write. */
  function nudgeTier(index, delta) {
    const next = [...tierList];
    const target = index + delta;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    const before = tiers.items;
    tiers.setItems(next.map((t, i) => ({ ...t, order: i })));
    tiers.saveOrder({ ids: next.map((t) => t.id) }, before);
  }

  if (partners.loading || tiers.loading) return <p className={s.loading}>Loading partners…</p>;

  const err = partners.error || tiers.error;

  return (
    <div>
      <div className={s.tabHead}>
        <div>
          <h2 className={s.tabTitle}>Partners</h2>
          <p className={s.tabBlurb}>
            The tiers are the groups the section renders under, top to bottom; drag partners to
            reorder them inside a tier. The filter chips and their counts on the site are derived
            from these rows, so they stay correct on their own. Logos are fitted to the tile and
            never cropped.
          </p>
        </div>
        <Btn kind="ghost" icon={Icons.plus} onClick={() => setAddingTier(true)}>
          Add tier
        </Btn>
      </div>

      {err && (
        <p className={s.banner} role="alert">
          {err.message}
        </p>
      )}

      {addingTier && (
        <div className={s.addCard}>
          <form
            className={s.form}
            onSubmit={async (e) => {
              e.preventDefault();
              if (!newTier.trim()) return;
              try {
                await tiers.create({ label: newTier.trim() });
                setNewTier("");
                setAddingTier(false);
              } catch (error) {
                tiers.setError(error);
              }
            }}
          >
            <div className={s.formGrid}>
              <Field label="Tier name" hint="The group heading on the site" wide>
                <TextInput
                  value={newTier}
                  onChange={setNewTier}
                  placeholder="Gold Partner"
                  autoFocus
                />
              </Field>
            </div>
            <div className={s.formActions}>
              <Btn
                kind="ghost"
                onClick={() => {
                  setNewTier("");
                  setAddingTier(false);
                }}
                disabled={tiers.busy}
              >
                Cancel
              </Btn>
              <button
                type="submit"
                className={`${s.btn} ${s.primary}`}
                disabled={tiers.busy || !newTier.trim()}
              >
                {tiers.busy ? "Saving…" : "Add tier"}
              </button>
            </div>
          </form>
        </div>
      )}

      {tierList.length === 0 && !addingTier && (
        <p className={s.empty}>No tiers yet. Add one and the section starts rendering.</p>
      )}

      {tierList.map((tier, ti) => {
        const list = byTier.get(tier.id) || [];
        return (
          <section key={tier.id} className={s.group}>
            <TierHead
              tier={tier}
              count={list.length}
              saving={tiers.busy}
              first={ti === 0}
              last={ti === tierList.length - 1}
              onNudge={(d) => nudgeTier(ti, d)}
              onAdd={() => setAddingTo(tier.id)}
              onSave={(draft) => tiers.update(tier.id, draft)}
              onDelete={() => tiers.remove(tier.id).catch(tiers.setError)}
            />

            {addingTo === tier.id && (
              <div className={s.addCard}>
                <PartnerForm
                  tiers={tierList}
                  initial={emptyPartner(tier.id)}
                  saving={partners.busy}
                  onCancel={() => setAddingTo(null)}
                  onSave={async (draft) => {
                    await partners.create(draft);
                    setAddingTo(null);
                  }}
                />
              </div>
            )}

            {list.length === 0 ? (
              <p className={s.empty}>Nothing in this tier yet.</p>
            ) : (
              <Reorder.Group
                axis="y"
                as="ul"
                className={s.list}
                values={list}
                onReorder={(next) => {
                  if (!rollback.current) rollback.current = partners.items;
                  applyLocal(tier.id, next);
                }}
              >
                {list.map((item, i) => (
                  <PartnerRow
                    key={item.id}
                    item={item}
                    index={i}
                    total={list.length}
                    tiers={tierList}
                    saving={partners.busy}
                    editing={editingId === item.id}
                    onEdit={(v) => setEditingId(v === false ? null : item.id)}
                    onNudge={(delta) => nudge(tier.id, i, delta)}
                    onDelete={() => partners.remove(item.id).catch(partners.setError)}
                    onDragEnd={() => {
                      partners.saveOrder(
                        { tier: tier.id, ids: (byTier.get(tier.id) || []).map((p) => p.id) },
                        rollback.current
                      );
                      rollback.current = null;
                    }}
                    onSave={async (draft) => {
                      await partners.update(item.id, draft);
                      setEditingId(null);
                    }}
                  />
                ))}
              </Reorder.Group>
            )}
          </section>
        );
      })}

      {orphans.length > 0 && (
        <section className={s.group}>
          <header className={s.groupHead}>
            <h3>
              Not in any tier
              <span className={s.count}>{orphans.length}</span>
            </h3>
            <span className={s.groupNote}>
              These are not on the site. Edit each one and choose a tier.
            </span>
          </header>
          {/* Reorder.Item requires a Group even here; the no-op onReorder makes
              the handle inert, which is right — there is no order to save. */}
          <Reorder.Group axis="y" as="ul" className={s.list} values={orphans} onReorder={() => {}}>
            {orphans.map((item, i) => (
              <PartnerRow
                key={item.id}
                item={item}
                index={i}
                total={orphans.length}
                tiers={tierList}
                saving={partners.busy}
                editing={editingId === item.id}
                onEdit={(v) => setEditingId(v === false ? null : item.id)}
                onNudge={() => {}}
                onDelete={() => partners.remove(item.id).catch(partners.setError)}
                onDragEnd={() => {}}
                onSave={async (draft) => {
                  await partners.update(item.id, draft);
                  setEditingId(null);
                }}
              />
            ))}
          </Reorder.Group>
        </section>
      )}
    </div>
  );
}
