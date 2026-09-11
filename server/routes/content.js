import { Router } from "express";
import { requireDb } from "../db/mongo.js";
import { AgendaDay, AgendaSession, CommitteeMember, Delegate } from "../db/models.js";

const router = Router();

/* One public read for the whole site.

   Three sections need data, and three round-trips to a sleeping Render
   instance would be three cold starts. This is a single call the client makes
   once, caches, and re-validates in the background. */

const person = (d) => ({
  id: String(d._id),
  name: d.name,
  position: d.position || "",
  company: d.company || "",
  linkedin: d.linkedin || "",
  photo: d.photoUrl || null,
});

const delegate = (d) => ({ ...person(d), country: d.country || "", tier: d.tier });

const session = (s) => ({
  id: String(s._id),
  day: s.day,
  type: s.type,
  start: s.start || "",
  end: s.end || "",
  title: s.title,
  subtitle: s.subtitle || "",
  parallel: Boolean(s.parallel),
  tracks: (s.tracks || []).map((t) => ({
    label: t.label || "",
    title: t.title || "",
    subtitle: t.subtitle || "",
  })),
});

const day = (d) => ({
  key: d.key,
  label: d.label || `Day ${d.key}`,
  short: d.short || "",
  date: d.date || "",
  theme: d.theme || null,
});

/* Latest write across every collection. The client stores this alongside its
   cache so it can tell "nothing changed" from "not fetched yet". */
const revOf = (...groups) => {
  let max = 0;
  for (const docs of groups) {
    for (const d of docs) {
      const t = d.updatedAt ? new Date(d.updatedAt).getTime() : 0;
      if (t > max) max = t;
    }
  }
  return max ? new Date(max).toISOString() : null;
};

router.get("/content", requireDb, async (_req, res, next) => {
  try {
    const [delegates, committee, sessions, days] = await Promise.all([
      Delegate.find().sort({ order: 1, createdAt: 1 }).lean(),
      CommitteeMember.find().sort({ order: 1, createdAt: 1 }).lean(),
      AgendaSession.find().sort({ day: 1, order: 1, createdAt: 1 }).lean(),
      AgendaDay.find().sort({ order: 1, key: 1 }).lean(),
    ]);

    res.set("Cache-Control", "public, max-age=30, stale-while-revalidate=300");
    res.json({
      ok: true,
      rev: revOf(delegates, committee, sessions, days),
      delegates: delegates.map(delegate),
      committee: committee.map(person),
      agenda: sessions.map(session),
      agendaDays: days.map(day),
    });
  } catch (err) {
    next(err);
  }
});

export default router;
