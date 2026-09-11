/* Screenshots the passes carousel at several widths, and checks the
   behaviour that is easy to get wrong: auto-advance, pause on hover, click a
   neighbour to centre it, arrows, and the tallest pass fitting its card.

     BASE=http://localhost:5178 node tools/tickets-shot.mjs */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const BASE = process.env.BASE || "http://localhost:5178";
const OUT = "design-reference/tickets-shots";
mkdirSync(OUT, { recursive: true });

let fails = 0;
const T = (l, c, d) => { if (!c) fails++; console.log(`  ${c ? "ok  " : "FAIL"} ${l}${d === undefined ? "" : ` -> ${d}`}`); };

const browser = await chromium.launch();

async function open(w, h) {
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  const errs = [];
  page.on("pageerror", (e) => errs.push(e.message));
  /* no API running in this check - the content provider's failed fetch is expected */
  page.on("console", (m) => { if (m.type() === "error" && !/ERR_CONNECTION_REFUSED|Failed to load resource/.test(m.text())) errs.push(m.text()); });
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await page.locator("#tickets").scrollIntoViewIfNeeded();
  await page.waitForTimeout(1200);
  return { page, errs };
}

const activeName = (page) =>
  page.locator("#tickets [class*='_card_'][data-active] [class*='_name_']").innerText();

/* ---------------------------------------------------------------- desktop */
console.log("\n== 1440 ==");
{
  const { page, errs } = await open(1440, 1000);
  const stage = page.locator("#tickets [class*='_stage_']");
  await stage.screenshot({ path: `${OUT}/01-desktop.png` });

  const slots = await page.locator("#tickets [class*='_card_']").evaluateAll((els) =>
    els.map((e) => e.dataset.slot)
  );
  T("exactly one card centred", slots.filter((x) => x === "0").length === 1, slots.join(","));
  T("both neighbours present", slots.includes("1") && slots.includes("-1"));
  T("both outer cards present", slots.includes("2") && slots.includes("-2"));

  // only the centred card lists inclusions
  const lists = await page.locator("#tickets [class*='_list_']").count();
  T("only the centred card lists inclusions", lists === 1, lists);
  const counts = await page.locator("#tickets [class*='_incCount_']").count();
  T("flanking cards show an inclusions count", counts >= 2, counts);

  // the centred card must actually fit its box
  const overflow = await page.evaluate(() => {
    const c = document.querySelector("#tickets [class*='_card_'][data-active]");
    return c.scrollHeight - c.clientHeight;
  });
  T("centred card content fits (no clipping)", overflow <= 1, `${overflow}px over`);

  const first = await activeName(page);
  await page.waitForTimeout(6200);
  const second = await activeName(page);
  T("belt advances on its own", first !== second, `${first} -> ${second}`);

  // hover holds it
  await stage.hover();
  const held = await activeName(page);
  await page.waitForTimeout(6200);
  T("hovering pauses it", (await activeName(page)) === held, held);
  await page.mouse.move(5, 5);

  // clicking a neighbour centres it
  const target = await page.locator("#tickets [class*='_card_'][data-slot='1'] [class*='_name_']").innerText();
  await page.locator("#tickets [class*='_card_'][data-slot='1'] button").click();
  await page.waitForTimeout(900);
  T("clicking a neighbour centres it", (await activeName(page)) === target, target);

  // arrows
  const before = await activeName(page);
  await page.locator("#tickets [class*='_arrowPrev_']").click();
  await page.waitForTimeout(900);
  T("previous arrow steps back", (await activeName(page)) !== before);

  await page.screenshot({ path: `${OUT}/02-desktop-page.png` });
  T("no console errors", errs.length === 0, errs.slice(0, 2).join(" | "));
  await page.close();
}

/* --------------------------------------------------- tallest pass fits ---- */
console.log("\n== tallest pass (11 inclusions) ==");
{
  const { page } = await open(1440, 1000);
  // New Associate Member Pass has the longest inclusions list
  const dots = page.locator("#tickets [class*='_dot_']");
  const n = await dots.count();
  let worst = 0;
  for (let i = 0; i < n; i++) {
    await dots.nth(i).click();
    await page.waitForTimeout(750);
    const over = await page.evaluate(() => {
      const c = document.querySelector("#tickets [class*='_card_'][data-active]");
      return c.scrollHeight - c.clientHeight;
    });
    if (over > worst) worst = over;
  }
  T("no pass overflows its card", worst <= 1, `worst ${worst}px`);
  await page.locator("#tickets [class*='_stage_']").screenshot({ path: `${OUT}/03-tallest.png` });
  await page.close();
}

/* ----------------------------------------------------------------- tablet */
console.log("\n== 834 ==");
{
  const { page, errs } = await open(834, 1000);
  await page.locator("#tickets [class*='_stage_']").screenshot({ path: `${OUT}/04-tablet.png` });
  const vis = await page.locator("#tickets [class*='_card_']").evaluateAll((els) =>
    els.filter((e) => Number(getComputedStyle(e).opacity) > 0.05).length
  );
  T("outer cards dropped at tablet width", vis === 3, `${vis} visible`);
  T("no console errors", errs.length === 0, errs.slice(0, 2).join(" | "));
  await page.close();
}

/* ----------------------------------------------------------------- mobile */
console.log("\n== 390 ==");
{
  const { page, errs } = await open(390, 900);
  await page.locator("#tickets [class*='_stage_']").screenshot({ path: `${OUT}/05-mobile.png` });
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth
  );
  T("no horizontal page overflow", overflow <= 1, `${overflow}px`);
  const over = await page.evaluate(() => {
    const c = document.querySelector("#tickets [class*='_card_'][data-active]");
    return c.scrollHeight - c.clientHeight;
  });
  T("centred card fits at 390", over <= 1, `${over}px over`);
  T("no console errors", errs.length === 0, errs.slice(0, 2).join(" | "));
  await page.close();
}

/* -------------------------------------------------------- reduced motion - */
console.log("\n== prefers-reduced-motion ==");
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: "reduce" });
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await page.locator("#tickets").scrollIntoViewIfNeeded();
  await page.waitForTimeout(1000);
  const a = await activeName(page);
  await page.waitForTimeout(6500);
  T("does not auto-advance", (await activeName(page)) === a, a);
  await page.locator("#tickets [class*='_arrowNext_']").click();
  await page.waitForTimeout(500);
  T("arrows still work", (await activeName(page)) !== a);
  await page.close();
}


/* ------------------------------------------------------- width sweep ----
   The card is a fixed box holding wrapping text, so "it fits" is only true at
   the widths actually measured. A narrower card wraps onto more lines and so
   needs MORE height, not less - checking only the extremes let a clipped
   bullet through at tablet width once already. */
console.log("\n== every pass at every width ==");
{
  const widths = [1600, 1440, 1280, 1100, 950, 900, 834, 760, 680, 600, 560, 480, 414, 390, 360];
  const bad = [];
  for (const w of widths) {
    const page = await browser.newPage({ viewport: { width: w, height: 900 } });
    await page.goto(BASE + "/", { waitUntil: "domcontentloaded" });
    await page.locator("#tickets").scrollIntoViewIfNeeded();
    await page.waitForTimeout(450);
    const dots = page.locator("#tickets [class*='_dot_']");
    const n = await dots.count();
    let worst = 0;
    let worstName = "";
    for (let i = 0; i < n; i++) {
      await dots.nth(i).click({ force: true });
      await page.waitForTimeout(230);
      const r = await page.evaluate(() => {
        const c = document.querySelector("#tickets [class*='_card_'][data-active]");
        return {
          over: c.scrollHeight - c.clientHeight,
          name: c.querySelector("[class*='_name_']").textContent.trim(),
        };
      });
      if (r.over > worst) { worst = r.over; worstName = r.name; }
    }
    const sideways = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    if (worst > 1 || sideways > 1) {
      bad.push(w + "px: " + worst + "px clipped (" + worstName + ")" + (sideways > 1 ? ", " + sideways + "px sideways" : ""));
    }
    await page.close();
  }
  T("no pass clipped and no sideways scroll, at any width", bad.length === 0, bad.join(" | "));
}

await browser.close();
console.log(fails ? `\n${fails} failed\n` : "\nall good\n");
process.exit(fails ? 1 : 0);
