import { Router } from "express";
import mongoose from "mongoose";
import { isConfigured, requireDb } from "../db/mongo.js";
import {
  AgendaDay,
  AgendaSession,
  CommitteeMember,
  Delegate,
  Partner,
  PartnerTier,
} from "../db/models.js";
import { adminGuard, adminKeyRequired } from "../lib/adminGuard.js";
import { deleteObject, isR2Configured, signUpload } from "../lib/r2.js";
import { seedData } from "../db/seedData.js";
import { seedPartners } from "../db/seedPartners.js";

const router = Router();

/* ---------------------------------------------------------------- status --

   Deliberately OUTSIDE the guard and free of secrets. The panel calls this
   first so that a misconfigured deploy shows a setup checklist ("no database",
   "no bucket", "key required") instead of an opaque 401 or 503. */
router.get("/status", (_req, res) => {
  res.json({
    ok: true,
    db: isConfigured(),
    r2: isR2Configured(),
    keyRequired: adminKeyRequired(),
  });
});

router.use(adminGuard);

/* ------------------------------------------------------------------ media --

   Mounted ahead of requireDb because signing an upload touches no collection.
   Behind it, a deploy with R2 configured but Mongo not yet set up would report
   "database not configured" when you try to upload a photo, which sends you
   looking in the wrong place. */

router.post("/media/sign", async (req, res, next) => {
  if (!isR2Configured()) {
    return res.status(503).json({
      ok: false,
      error: "Image storage not configured. Set the R2_* environment variables.",
    });
  }
  try {
    const { folder, contentType, contentLength } = req.body || {};
    res.json({ ok: true, ...(await signUpload({ folder, contentType, contentLength })) });
  } catch (err) {
    if (!sendError(res, err)) next(err);
  }
});

/* POST rather than DELETE: R2 keys contain slashes and would otherwise have to
   be double-encoded into a path segment. */
router.post("/media/delete", async (req, res, next) => {
  try {
    res.json({ ok: true, deleted: await deleteObject(req.body?.key) });
  } catch (err) {
    next(err);
  }
});

router.use(requireDb);

/* ----------------------------------------------------------------- helpers */

const badId = (id) => !mongoose.isValidObjectId(id);

/* Mongoose ValidationError -> per-field messages the form can render inline.
   Returns true when it handled the error, false when the caller should pass
   it to the Express error handler instead. */
function sendError(res, err) {
  if (err?.name === "ValidationError") {
    const errors = {};
    for (const [field, e] of Object.entries(err.errors)) errors[field] = e.message;
    res.status(422).json({ ok: false, errors });
    return true;
  }
  if (err?.code === 11000) {
    res.status(409).json({ ok: false, error: "That value already exists." });
    return true;
  }
  if (err?.status) {
    res.status(err.status).json({ ok: false, error: err.message });
    return true;
  }
  return false;
}

/* New rows land at the bottom of their list, which is what "add a delegate"
   should do - never silently jump the queue above people already ranked. */
async function nextOrder(Model, scope) {
  const last = await Model.findOne(scope).sort({ order: -1 }).select("order").lean();
  return last ? (last.order ?? 0) + 1 : 0;
}

/* Renumber a list to a dense 0..n-1 from the id order the panel sends.
   `patch` lets the delegates reorder also write `tier`, so dragging a card
   from the General list into Featured is one atomic write, not two. */
async function applyOrder(Model, ids, patch = {}) {
  const ops = ids
    .filter((id) => !badId(id))
    .map((id, i) => ({
      updateOne: { filter: { _id: id }, update: { $set: { order: i, ...patch } } },
    }));
  if (ops.length) await Model.bulkWrite(ops);
  return ops.length;
}

/* Mounts GET / POST / PATCH / DELETE for one collection.
   `scopeOf` groups ordering: delegates rank within a tier, sessions within a
   day, committee members within the single list. */
function crud(basePath, Model, { sort, scopeOf = () => ({}), hasPhoto = false } = {}) {
  router.get(basePath, async (_req, res, next) => {
    try {
      const items = await Model.find().sort(sort);
      res.json({ ok: true, items: items.map((d) => d.toJSON()) });
    } catch (err) {
      next(err);
    }
  });

  router.post(basePath, async (req, res, next) => {
    try {
      const body = { ...req.body };
      delete body.id;
      delete body._id;
      body.order = await nextOrder(Model, scopeOf(body));
      const doc = await Model.create(body);
      res.status(201).json({ ok: true, item: doc.toJSON() });
    } catch (err) {
      if (!sendError(res, err)) next(err);
    }
  });

  router.patch(`${basePath}/:id`, async (req, res, next) => {
    const { id } = req.params;
    if (badId(id)) return res.status(404).json({ ok: false, error: "Not found" });
    try {
      const body = { ...req.body };
      delete body.id;
      delete body._id;

      /* Replacing a photo orphans the old object unless we clean it up here -
         the client only ever sends the new key. */
      if (hasPhoto && "photoKey" in body) {
        const prev = await Model.findById(id).select("photoKey").lean();
        if (prev?.photoKey && prev.photoKey !== body.photoKey) await deleteObject(prev.photoKey);
      }

      const doc = await Model.findByIdAndUpdate(id, body, { returnDocument: "after", runValidators: true });
      if (!doc) return res.status(404).json({ ok: false, error: "Not found" });
      res.json({ ok: true, item: doc.toJSON() });
    } catch (err) {
      if (!sendError(res, err)) next(err);
    }
  });

  router.delete(`${basePath}/:id`, async (req, res, next) => {
    const { id } = req.params;
    if (badId(id)) return res.status(404).json({ ok: false, error: "Not found" });
    try {
      const doc = await Model.findByIdAndDelete(id);
      if (!doc) return res.status(404).json({ ok: false, error: "Not found" });
      if (hasPhoto && doc.photoKey) await deleteObject(doc.photoKey);
      res.json({ ok: true, id });
    } catch (err) {
      next(err);
    }
  });
}

/* ---------------------------------------------------------------- reorder --

   Registered BEFORE crud() so that POST /delegates/reorder is not swallowed by
   the PATCH/DELETE ":id" patterns, and so a literal "reorder" is never treated
   as an object id. */

/* Both tiers arrive together so a cross-list drag can set rank and tier in one
   shot. Sending only the moved list would leave the other list's ranks stale. */
router.post("/delegates/reorder", async (req, res, next) => {
  try {
    const { key = [], general = [] } = req.body || {};
    if (!Array.isArray(key) || !Array.isArray(general)) {
      return res.status(422).json({ ok: false, error: "Expected { key: [], general: [] }." });
    }
    const n =
      (await applyOrder(Delegate, key, { tier: "key" })) +
      (await applyOrder(Delegate, general, { tier: "general" }));
    res.json({ ok: true, updated: n });
  } catch (err) {
    next(err);
  }
});

router.post("/committee/reorder", async (req, res, next) => {
  try {
    const ids = req.body?.ids;
    if (!Array.isArray(ids)) {
      return res.status(422).json({ ok: false, error: "Expected { ids: [] }." });
    }
    res.json({ ok: true, updated: await applyOrder(CommitteeMember, ids) });
  } catch (err) {
    next(err);
  }
});

router.post("/agenda/reorder", async (req, res, next) => {
  try {
    const { day, ids } = req.body || {};
    if (!Array.isArray(ids)) {
      return res.status(422).json({ ok: false, error: "Expected { ids: [] }." });
    }
    // `day` is written too, so dragging a session onto the other day moves it
    const patch = day === undefined ? {} : { day: Number(day) };
    res.json({ ok: true, updated: await applyOrder(AgendaSession, ids, patch) });
  } catch (err) {
    next(err);
  }
});

/* Ranks partners inside one tier. `tier` is written too, so moving a partner
   into another tier is the same single call as reordering within one. */
router.post("/partners/reorder", async (req, res, next) => {
  try {
    const { tier, ids } = req.body || {};
    if (!Array.isArray(ids)) {
      return res.status(422).json({ ok: false, error: "Expected { ids: [] }." });
    }
    if (tier !== undefined && badId(tier)) {
      return res.status(422).json({ ok: false, error: "Unknown tier." });
    }
    const patch = tier === undefined ? {} : { tier };
    res.json({ ok: true, updated: await applyOrder(Partner, ids, patch) });
  } catch (err) {
    next(err);
  }
});

router.post("/partner-tiers/reorder", async (req, res, next) => {
  try {
    const ids = req.body?.ids;
    if (!Array.isArray(ids)) {
      return res.status(422).json({ ok: false, error: "Expected { ids: [] }." });
    }
    res.json({ ok: true, updated: await applyOrder(PartnerTier, ids) });
  } catch (err) {
    next(err);
  }
});

/* Deleting a tier would orphan its partners: their `tier` would point at a
   document that no longer exists, and the section — which renders tier by
   tier — would simply stop showing them, with no way to find them again from
   the panel. So this refuses, and says how many are in the way. */
router.delete("/partner-tiers/:id", async (req, res, next) => {
  const { id } = req.params;
  if (badId(id)) return res.status(404).json({ ok: false, error: "Not found" });
  try {
    const inUse = await Partner.countDocuments({ tier: id });
    if (inUse > 0) {
      return res.status(409).json({
        ok: false,
        error: `This tier still holds ${inUse} partner${inUse === 1 ? "" : "s"}. Move or delete them first.`,
      });
    }
    const doc = await PartnerTier.findByIdAndDelete(id);
    if (!doc) return res.status(404).json({ ok: false, error: "Not found" });
    res.json({ ok: true, id });
  } catch (err) {
    next(err);
  }
});

/* Bulk-removes the bracketed placeholder rows the seed ships with, so a real
   roster does not have to be cleared one card at a time. */
router.post("/delegates/purge-placeholders", async (_req, res, next) => {
  try {
    const { deletedCount } = await Delegate.deleteMany({ name: /^\s*\[.*\]\s*$/ });
    res.json({ ok: true, deleted: deletedCount });
  } catch (err) {
    next(err);
  }
});

/* ------------------------------------------------------------------- crud */

crud("/delegates", Delegate, {
  sort: { tier: 1, order: 1 },
  scopeOf: (b) => ({ tier: b.tier === "key" ? "key" : "general" }),
  hasPhoto: true,
});
crud("/committee", CommitteeMember, { sort: { order: 1 }, hasPhoto: true });
crud("/agenda", AgendaSession, {
  sort: { day: 1, order: 1 },
  scopeOf: (b) => ({ day: Number(b.day) || 1 }),
});
crud("/days", AgendaDay, { sort: { order: 1, key: 1 } });
crud("/partners", Partner, {
  sort: { order: 1 },
  scopeOf: (b) => ({ tier: b.tier }),
  hasPhoto: true,
});
/* The DELETE above is registered first and therefore wins; crud's own delete
   is unreachable for this collection, which is the point. */
crud("/partner-tiers", PartnerTier, { sort: { order: 1 } });

/* ------------------------------------------------------------------- seed */

/* Loads the content that currently lives in client/src/data/*.js.

   This is an endpoint and not only a CLI script because Render's free tier has
   no shell - without it there is no way to populate a fresh database from the
   deployed app. Refuses to touch a non-empty collection unless `replace` is
   explicitly true. */
router.post("/seed", async (req, res, next) => {
  try {
    const replace = req.body?.replace === true;
    const targets = [
      [Delegate, seedData.delegates],
      [CommitteeMember, seedData.committee],
      [AgendaDay, seedData.days],
      [AgendaSession, seedData.agenda],
    ];

    const counts = {};
    for (const [Model, rows] of targets) {
      const existing = await Model.estimatedDocumentCount();
      if (existing > 0 && !replace) {
        counts[Model.modelName] = { skipped: existing };
        continue;
      }
      if (existing > 0) await Model.deleteMany({});
      const inserted = await Model.insertMany(rows, { ordered: false });
      counts[Model.modelName] = { inserted: inserted.length };
    }

    // partners need their tiers inserted first; see db/seedPartners.js
    counts.Partners = await seedPartners(replace);

    res.json({ ok: true, counts });
  } catch (err) {
    next(err);
  }
});

export default router;
