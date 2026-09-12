import mongoose from "mongoose";

const { Schema, model, models } = mongoose;

/* Shared options.

   - `order` is a dense 0..n-1 rank maintained by the reorder endpoint. It is
     what "shown earlier vs later on the site" means, and it is the only thing
     the public sort depends on.
   - toJSON strips __v and renames _id to id so the client never sees Mongo
     internals; the admin panel keys its lists off `id`. */
const base = {
  timestamps: true,
  toJSON: {
    virtuals: true,
    versionKey: false,
    transform(_doc, ret) {
      ret.id = String(ret._id);
      delete ret._id;
      return ret;
    },
  },
};

/* A stored photo. `key` is the R2 object key, kept so deleting the person can
   also delete the file — without it the bucket accumulates orphans forever. */
const photoFields = {
  photoUrl: { type: String, default: null, trim: true },
  photoKey: { type: String, default: null, trim: true },
};

/* ---------------------------------------------------------------- delegates */
const delegateSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    position: { type: String, default: "", trim: true, maxlength: 160 },
    company: { type: String, default: "", trim: true, maxlength: 160 },
    linkedin: { type: String, default: "", trim: true, maxlength: 500 },
    /* Rendered as the chip in the card's top-left. Optional. */
    country: { type: String, default: "", trim: true, maxlength: 60 },
    /* tier "key" is the large featured row, "general" the denser grid below.
       Moving a delegate between the two admin lists flips this. */
    tier: { type: String, enum: ["key", "general"], default: "general", index: true },
    order: { type: Number, default: 0, index: true },
    ...photoFields,
  },
  base
);
delegateSchema.index({ tier: 1, order: 1 });

/* ---------------------------------------------------------------- committee */
const committeeSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    position: { type: String, default: "", trim: true, maxlength: 160 },
    company: { type: String, default: "", trim: true, maxlength: 160 },
    linkedin: { type: String, default: "", trim: true, maxlength: 500 },
    order: { type: Number, default: 0, index: true },
    ...photoFields,
  },
  base
);

/* ------------------------------------------------------------ agenda days */
const agendaDaySchema = new Schema(
  {
    /* Stable numeric key the sessions point at. Changing it would orphan
       sessions, so the admin edits everything else and leaves this alone. */
    key: { type: Number, required: true, unique: true },
    label: { type: String, default: "", trim: true, maxlength: 40 },
    short: { type: String, default: "", trim: true, maxlength: 40 },
    date: { type: String, default: "", trim: true, maxlength: 120 },
    /* Main-stage theme line under the date. Empty string renders nothing. */
    theme: { type: String, default: "", trim: true, maxlength: 200 },
    order: { type: Number, default: 0 },
  },
  base
);

/* --------------------------------------------------------- agenda sessions */
const trackSchema = new Schema(
  {
    label: { type: String, default: "", trim: true, maxlength: 60 },
    title: { type: String, default: "", trim: true, maxlength: 240 },
    subtitle: { type: String, default: "", trim: true, maxlength: 600 },
  },
  { _id: false }
);

const agendaSessionSchema = new Schema(
  {
    day: { type: Number, required: true, index: true },
    type: { type: String, enum: ["plenary", "breakout", "break"], default: "plenary" },
    /* Free text, not a Date. The real schedule contains values like "Onward"
       that no time picker can express, and the site renders these verbatim. */
    start: { type: String, default: "", trim: true, maxlength: 40 },
    end: { type: String, default: "", trim: true, maxlength: 40 },
    title: { type: String, required: true, trim: true, maxlength: 240 },
    subtitle: { type: String, default: "", trim: true, maxlength: 800 },
    /* Marks a session that runs alongside the main stage rather than after it. */
    parallel: { type: Boolean, default: false },
    /* Non-empty tracks make the row expandable on the site. */
    tracks: { type: [trackSchema], default: [] },
    order: { type: Number, default: 0, index: true },
  },
  base
);
agendaSessionSchema.index({ day: 1, order: 1 });

/* ------------------------------------------------------------ partner tiers

   The groups the partners section renders under ("Silver Partner", and so on).
   A separate collection rather than an enum because sponsor tiers are sold
   fresh for every edition and renaming one must not touch the partners in it.

   Deliberately keyed by _id and not by a slug, unlike agenda days: a tier is
   identified by the document itself, so renaming the label is free and there
   is no slug to collide or go stale. */
const partnerTierSchema = new Schema(
  {
    label: { type: String, required: true, trim: true, maxlength: 80 },
    order: { type: Number, default: 0, index: true },
  },
  base
);

/* ----------------------------------------------------------------- partners

   photoUrl/photoKey rather than logoUrl/logoKey so this rides the same generic
   CRUD photo cleanup as the people collections — the field names are what that
   code keys off. The public serializer renames it to `logo` on the way out. */
const partnerSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 140 },
    /* The partner's own site. Empty renders a plain tile instead of a link. */
    url: { type: String, default: "", trim: true, maxlength: 500 },
    tier: { type: Schema.Types.ObjectId, ref: "PartnerTier", required: true, index: true },
    /* Adds the "Exclusive" chip to the tile. */
    exclusive: { type: Boolean, default: false },
    order: { type: Number, default: 0, index: true },
    ...photoFields,
  },
  base
);
partnerSchema.index({ tier: 1, order: 1 });

export const Delegate = models.Delegate || model("Delegate", delegateSchema);
export const CommitteeMember =
  models.CommitteeMember || model("CommitteeMember", committeeSchema, "committee");
export const AgendaDay = models.AgendaDay || model("AgendaDay", agendaDaySchema, "agenda_days");
export const AgendaSession =
  models.AgendaSession || model("AgendaSession", agendaSessionSchema, "agenda_sessions");
export const PartnerTier =
  models.PartnerTier || model("PartnerTier", partnerTierSchema, "partner_tiers");
export const Partner = models.Partner || model("Partner", partnerSchema, "partners");
