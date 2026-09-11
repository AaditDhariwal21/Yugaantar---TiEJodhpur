/* Populate MongoDB from db/seedData.js.

     npm run seed            fill only the collections that are empty
     npm run seed -- --force wipe and reload every collection

   The same logic is exposed as POST /api/admin/seed, which is what you will
   actually use on Render (its free tier has no shell). This script is for
   local databases and for re-baselining from a terminal. */

import "dotenv/config";
import mongoose from "mongoose";
import { connectDb, isConfigured } from "../db/mongo.js";
import { AgendaDay, AgendaSession, CommitteeMember, Delegate } from "../db/models.js";
import { seedData } from "../db/seedData.js";

const force = process.argv.includes("--force");

if (!isConfigured()) {
  console.error("MONGODB_URI is not set. Copy .env.example to .env and fill it in.");
  process.exit(1);
}

await connectDb();

const targets = [
  ["delegates", Delegate, seedData.delegates],
  ["committee", CommitteeMember, seedData.committee],
  ["agenda days", AgendaDay, seedData.days],
  ["agenda sessions", AgendaSession, seedData.agenda],
];

for (const [label, Model, rows] of targets) {
  const existing = await Model.estimatedDocumentCount();

  if (existing > 0 && !force) {
    console.log(`- ${label}: ${existing} already there, skipped (use --force to replace)`);
    continue;
  }
  if (existing > 0) await Model.deleteMany({});
  const inserted = await Model.insertMany(rows, { ordered: false });
  console.log(`- ${label}: inserted ${inserted.length}${existing ? ` (replaced ${existing})` : ""}`);
}

await mongoose.disconnect();
console.log("Done.");
