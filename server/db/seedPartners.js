import { Partner, PartnerTier } from "./models.js";
import { seedData } from "./seedData.js";

/* Partners cannot go through the same loop as the other collections.

   Every partner points at its tier by _id, and those ids only exist once the
   tiers have been inserted — so the two are written in order, and treated as
   one unit: if the tiers are left alone, the partners are too. Seeding the
   partners against tiers from an earlier run would leave every `tier` pointing
   at a document that had just been deleted.

   Shared by POST /api/admin/seed and `npm run seed` so the two cannot drift. */
export async function seedPartners(replace) {
  const existingTiers = await PartnerTier.estimatedDocumentCount();
  const existingPartners = await Partner.estimatedDocumentCount();

  if ((existingTiers > 0 || existingPartners > 0) && !replace) {
    return { skipped: existingTiers + existingPartners };
  }

  // partners first: they reference the tiers, so they go before the tiers do
  if (existingPartners > 0) await Partner.deleteMany({});
  if (existingTiers > 0) await PartnerTier.deleteMany({});

  const seedTiers = seedData.partnerTiers || [];
  const tiers = seedTiers.length
    ? await PartnerTier.insertMany(
        seedTiers.map((t, i) => ({ label: t.label, order: i })),
        { ordered: true }
      )
    : [];

  /* The seed's own `key` strings exist only to join these two lists here; the
     database never sees them. */
  const idOf = new Map(
    seedTiers.map((t, i) => [t.key, tiers[i]?._id]).filter(([, id]) => id)
  );

  const rows = (seedData.partners || [])
    .filter((p) => idOf.has(p.tier))
    .map((p, i) => ({
      name: p.name,
      url: p.url || "",
      tier: idOf.get(p.tier),
      exclusive: Boolean(p.exclusive),
      photoUrl: null,
      photoKey: null,
      order: i,
    }));

  const partners = rows.length ? await Partner.insertMany(rows, { ordered: false }) : [];

  return {
    tiers: tiers.length,
    partners: partners.length,
    replaced: existingTiers + existingPartners,
  };
}
