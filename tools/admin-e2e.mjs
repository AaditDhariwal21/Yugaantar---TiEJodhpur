/* End-to-end check of /adminpanel against a running client + API.

     CONFIRM_WIPE=yes BASE=http://localhost:5183 API=http://localhost:5181 \
       node tools/admin-e2e.mjs

   Drives the real UI: seeds, edits, reorders, moves between tiers, adds a
   session, then reloads the public page and asserts the site reflects it.

   DESTRUCTIVE. It empties every collection before it starts, so it is fenced
   twice: the API must be on localhost, and CONFIRM_WIPE must be set. Point it
   at a scratch database, never at the one behind the live site. */

import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const BASE = process.env.BASE || "http://localhost:5183";
const API = process.env.API || "http://localhost:5181";
const SHOTS = process.env.SHOTS || "design-reference/admin-shots";

const host = new URL(API).hostname;
if (host !== "localhost" && host !== "127.0.0.1") {
  console.error(`Refusing to run: API is ${API}, which is not local.`);
  console.error("This script deletes all content. Point it at a local API only.");
  process.exit(1);
}
if (process.env.CONFIRM_WIPE !== "yes") {
  console.error("Refusing to run: this deletes every delegate, committee member and session.");
  console.error(`Re-run with CONFIRM_WIPE=yes if ${API} is a scratch database.`);
  process.exit(1);
}

mkdirSync(SHOTS, { recursive: true });

let pass = 0;
let fail = 0;
const check = (label, cond, detail) => {
  if (cond) {
    pass++;
    console.log(`  ok   ${label}`);
  } else {
    fail++;
    console.log(`  FAIL ${label}${detail === undefined ? "" : ` -> ${JSON.stringify(detail)}`}`);
  }
};

const api = async (path, method = "GET", body) => {
  const res = await fetch(API + path, {
    method,
    headers: body ? { "Content-Type": "application/json" } : {},
    body: body ? JSON.stringify(body) : undefined,
  });
  return res.json();
};

// start from a known-empty database
await api("/api/admin/delegates", "GET");
for (const r of ["delegates", "committee", "agenda", "days"]) {
  const { items } = await api(`/api/admin/${r}`);
  for (const it of items) await api(`/api/admin/${r}/${it.id}`, "DELETE");
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 1000 } });

const consoleErrors = [];
page.on("console", (m) => {
  if (m.type() === "error") consoleErrors.push(m.text());
});
page.on("pageerror", (e) => consoleErrors.push(`pageerror: ${e.message}`));

/* ------------------------------------------------------------- seeding -- */
console.log("\n== first load, empty database ==");
await page.goto(`${BASE}/adminpanel`, { waitUntil: "networkidle" });

const seedBtn = page.getByRole("button", { name: /load current site content/i });
check("offers to seed an empty database", await seedBtn.isVisible());
check("no site navbar on the admin route", (await page.locator("nav a[href='/#about']").count()) === 0);
check("noindex meta present", (await page.locator('meta[name="robots"]').count()) === 1);
await page.screenshot({ path: `${SHOTS}/01-seed.png` });

await seedBtn.click();
await page.getByRole("heading", { name: "Delegates", exact: true }).waitFor();

const featuredList = page.locator("section").filter({ hasText: "Featured" }).first().locator("ul li");
await featuredList.first().waitFor();
check("delegates tab renders after seeding", (await page.locator("ul li").count()) > 10);
await page.screenshot({ path: `${SHOTS}/02-delegates.png`, fullPage: false });

/* ------------------------------------------------------------- editing -- */
console.log("\n== edit a delegate ==");
const firstRow = page.locator("ul li").first();
const firstName = (await firstRow.locator("[class*='rowName']").innerText()).trim();
await firstRow.getByRole("button", { name: /^Edit / }).click();

const nameInput = page.locator("input[placeholder='Asha Mehta']");
await nameInput.waitFor();
await nameInput.fill("Vikram Singh Rathore");
await page.locator("input[placeholder='Managing Partner']").fill("Founder & CEO");
await page.locator("input[placeholder='Marwar Capital']").fill("Thar Robotics");
await page.locator("input[type='url']").fill("https://www.linkedin.com/in/example");
await page.screenshot({ path: `${SHOTS}/03-edit-form.png` });
await page.getByRole("button", { name: "Save", exact: true }).click();

await page.waitForFunction(
  (old) => !document.body.innerText.includes(old),
  firstName,
  { timeout: 5000 }
);
check("edited name replaces the old one", true);

const afterEdit = await api("/api/admin/delegates");
const edited = afterEdit.items.find((d) => d.name === "Vikram Singh Rathore");
check("persisted to the database", Boolean(edited), afterEdit.items[0]);
check("position saved", edited?.position === "Founder & CEO", edited?.position);
check("company saved", edited?.company === "Thar Robotics", edited?.company);

/* ------------------------------------------------------------ reorder --- */
console.log("\n== reorder with the arrow buttons ==");
const before = (await api("/api/admin/delegates")).items
  .filter((d) => d.tier === "key")
  .sort((a, b) => a.order - b.order)
  .map((d) => d.name);

// move the second featured delegate up one
await page.locator("ul li").nth(1).getByRole("button", { name: /Move .* up/ }).click();
await page.waitForTimeout(600);

const after = (await api("/api/admin/delegates")).items
  .filter((d) => d.tier === "key")
  .sort((a, b) => a.order - b.order)
  .map((d) => d.name);

check("first two swapped", after[0] === before[1] && after[1] === before[0], { before: before.slice(0, 2), after: after.slice(0, 2) });
check("dense 0..n-1 ordering kept", after.length === before.length);

/* ------------------------------------------------------------- dragging - */
console.log("\n== reorder by dragging the handle ==");
{
  const rows = page.locator("ul li");
  const namesBefore = await rows.evaluateAll((els) =>
    els.slice(0, 4).map((e) => e.querySelector("[class*='rowName']")?.innerText.trim())
  );
  const keyCountAtDrag = (await api("/api/admin/delegates")).items.filter(
    (d) => d.tier === "key"
  ).length;

  const handle = rows.first().locator("[class*='_handle_']");
  const from = await handle.boundingBox();
  const target = await rows.nth(2).boundingBox();

  // framer's Reorder tracks pointermove; a single jump is ignored
  await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2);
  await page.mouse.down();
  for (let i = 1; i <= 10; i++) {
    await page.mouse.move(
      from.x + from.width / 2,
      from.y + from.height / 2 + ((target.y + target.height - from.y) * i) / 10
    );
    await page.waitForTimeout(30);
  }
  await page.mouse.up();
  await page.waitForTimeout(900);

  const keyRows = (await api("/api/admin/delegates")).items
    .filter((d) => d.tier === "key")
    .sort((a, b) => a.order - b.order);
  const keyOrder = keyRows.map((d) => d.name);

  check("dragged row left position 1", keyOrder[0] !== namesBefore[0], {
    was: namesBefore[0],
    now: keyOrder[0],
  });
  check("dragged row moved down the list", keyOrder.indexOf(namesBefore[0]) > 0, {
    moved: namesBefore[0],
    to: keyOrder.indexOf(namesBefore[0]),
  });
  check("every delegate still present", new Set(keyOrder).size === keyOrder.length && keyOrder.length === keyCountAtDrag, {
    expected: keyCountAtDrag,
    got: keyOrder.length,
  });
  check(
    "order renumbered 0..n-1",
    keyRows.every((d, i) => d.order === i),
    keyRows.map((d) => d.order)
  );
}

/* --------------------------------------------------------- tier move ---- */
console.log("\n== promote between tiers ==");
const keyCountBefore = (await api("/api/admin/delegates")).items.filter((d) => d.tier === "key").length;

// the first row of the second group (Everyone else)
const generalSection = page.locator("section").filter({ hasText: "Everyone else" }).first();
const promoteRow = generalSection.locator("ul li").first();
const promoteName = (await promoteRow.locator("[class*='rowName']").innerText()).trim();
await promoteRow.getByRole("button", { name: /Move .* to Featured/ }).click();
await page.waitForTimeout(700);

const promoted = (await api("/api/admin/delegates")).items.find((d) => d.name === promoteName);
check("tier flipped to key", promoted?.tier === "key", promoted);
check("landed at the top of featured", promoted?.order === 0, promoted?.order);
check(
  "featured count grew by one",
  (await api("/api/admin/delegates")).items.filter((d) => d.tier === "key").length === keyCountBefore + 1
);
await page.screenshot({ path: `${SHOTS}/04-tiers.png` });

/* --------------------------------------------------------- placeholders - */
console.log("\n== remove placeholders ==");
const purge = page.getByRole("button", { name: /Remove \d+ placeholders/ });
check("offers to clear the bracketed placeholder rows", await purge.isVisible());
await purge.click();
await page.waitForTimeout(900);
const left = (await api("/api/admin/delegates")).items;
check("only the real delegate survives", left.length === 1, left.map((d) => d.name));

/* -------------------------------------------------------------- agenda -- */
console.log("\n== agenda ==");
await page.getByRole("tab", { name: "Agenda" }).click();
await page.getByRole("heading", { name: "Agenda", exact: true }).waitFor();

const day1Rows = await page.locator("ul li").count();
check("day 1 sessions listed", day1Rows > 10, day1Rows);
check("day switcher shows both days", (await page.getByRole("tab", { name: /Day [12]/ }).count()) === 2);
await page.screenshot({ path: `${SHOTS}/05-agenda.png` });

// edit the day header
await page.getByRole("button", { name: /Edit day/ }).click();
const themeInput = page.locator("input[placeholder*='Local Roots']");
await themeInput.waitFor();
await themeInput.fill("Main stage · Testing the panel");
await page.getByRole("button", { name: /Save day/ }).click();
await page.waitForTimeout(700);
const days = await api("/api/admin/days");
check("day theme saved", days.items.find((d) => d.key === 1)?.theme === "Main stage · Testing the panel", days.items[0]);

// add a session with a track
await page.getByRole("button", { name: /Add session/ }).click();
await page.locator("input[placeholder='09:45 AM']").fill("07:30 PM");
await page.locator("input[placeholder='10:30 AM']").fill("Onward");
await page.locator("input[placeholder*='Welcome Note']").fill("Late Night Founders Table");
await page.getByRole("button", { name: /Add track/ }).click();
await page.locator("input[placeholder='Track title']").fill("Deep Tech Corner");
await page.screenshot({ path: `${SHOTS}/06-session-form.png` });
await page.getByRole("button", { name: "Save", exact: true }).click();
await page.waitForTimeout(900);

const sessions = await api("/api/admin/agenda");
const added = sessions.items.find((x) => x.title === "Late Night Founders Table");
check("session created", Boolean(added), sessions.items.length);
check("free-text end time kept", added?.end === "Onward", added?.end);
check("track attached", added?.tracks?.[0]?.title === "Deep Tech Corner", added?.tracks);
check("assigned to the visible day", added?.day === 1, added?.day);

/* ----------------------------------------------------------- committee -- */
console.log("\n== committee ==");
await page.getByRole("tab", { name: "Committee" }).click();
await page.getByRole("heading", { name: "Planning committee" }).waitFor();
check("single list, no tier buttons", (await page.getByRole("button", { name: /Move .* to /}).count()) === 0);
check("committee rows listed", (await page.locator("ul li").count()) === 5);
await page.screenshot({ path: `${SHOTS}/07-committee.png` });

/* -------------------------------------------------------- public site --- */
console.log("\n== the public site reflects the edits ==");
const site = await browser.newPage({ viewport: { width: 1440, height: 1200 } });
const siteErrors = [];
site.on("pageerror", (e) => siteErrors.push(e.message));
await site.goto(`${BASE}/`, { waitUntil: "networkidle" });

/* networkidle only means /api/content has answered — the swap from the
   bundled snapshot to live data is a React re-render a tick later. */
await site
  .waitForFunction(() => !document.body.innerText.includes("[Speaker Name"), null, { timeout: 10000 })
  .catch(() => {});

/* Case-insensitive: several agenda classes apply text-transform:uppercase, and
   innerText reports the RENDERED casing, not the source string. */
const body = (await site.locator("body").innerText()).toLowerCase();
const has = (t) => body.includes(t.toLowerCase());

check("edited delegate appears on the site", has("Vikram Singh Rathore"));
check("their company appears", has("Thar Robotics"));
check("placeholders are gone", !has("[Speaker Name"));
check("new session appears", has("Late Night Founders Table"));
check("edited day theme appears", has("Testing the panel"));
check("no page errors on the site", siteErrors.length === 0, siteErrors);

await site.locator("#delegates").scrollIntoViewIfNeeded();
await site.waitForTimeout(700);
await site.screenshot({ path: `${SHOTS}/08-site-delegates.png` });

await site.locator("#agendatable").scrollIntoViewIfNeeded();
await site.waitForTimeout(700);
await site.screenshot({ path: `${SHOTS}/09-site-agenda.png` });

/* ---------------------------------------------------------- responsive -- */
console.log("\n== narrow viewport ==");
const small = await browser.newPage({ viewport: { width: 390, height: 900 } });
await small.goto(`${BASE}/adminpanel`, { waitUntil: "networkidle" });
await small.getByRole("heading", { name: "Delegates", exact: true }).waitFor();
const overflow = await small.evaluate(
  () => document.documentElement.scrollWidth - document.documentElement.clientWidth
);
check("no horizontal overflow at 390px", overflow <= 1, overflow);
await small.screenshot({ path: `${SHOTS}/10-mobile.png`, fullPage: false });

/* -------------------------------------------------------------- errors -- */
const ignorable = /favicon|Download the React DevTools/i;
const real = consoleErrors.filter((e) => !ignorable.test(e));
check("no console errors in the panel", real.length === 0, real.slice(0, 4));

await browser.close();
console.log(`\n${pass} passed, ${fail} failed\n`);
process.exit(fail ? 1 : 0);
