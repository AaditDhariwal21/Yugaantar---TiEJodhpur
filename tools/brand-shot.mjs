/* Captures the navbar, the About panel and the footer after the brand swap,
   and checks the things that are easy to get wrong: the logo fitting its row,
   the stamp not being cropped, and no placeholder markers left on the page. */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const BASE = process.env.BASE || "http://localhost:5186";
const OUT = "design-reference/brand-shots";
mkdirSync(OUT, { recursive: true });

let fails = 0;
const T = (l, c, d) => { if (!c) fails++; console.log(`  ${c ? "ok  " : "FAIL"} ${l}${d === undefined ? "" : ` -> ${d}`}`); };

const browser = await chromium.launch();

for (const [w, h, tag] of [[1440, 900, "1440"], [1101, 900, "1101"], [881, 900, "881"], [390, 800, "390"]]) {
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  const badImg = [];
  page.on("response", (r) => {
    const p = new URL(r.url()).pathname;
    if (!r.ok() && /\.(png|jpe?g|webp|svg)$/i.test(p)) badImg.push(`${r.status()} ${p}`);
  });
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(600);

  console.log(`\n-- ${tag} --`);
  await page.locator("header").screenshot({ path: `${OUT}/nav-${tag}.png` });

  const nav = await page.evaluate(() => {
    const img = document.querySelector("header a[class*='_brand_'] img");
    const row = document.querySelector("header [class*='_in_']");
    const txt = document.querySelector("header [class*='_brandText_']");
    return {
      src: img ? img.currentSrc.split("/").pop() : null,
      box: img ? `${Math.round(img.clientWidth)}x${Math.round(img.clientHeight)}` : null,
      loaded: img ? img.naturalWidth > 0 : false,
      strayText: txt ? txt.textContent.trim() : null,
      overflow: row.scrollWidth - row.clientWidth,
    };
  });
  T(`logo loads (${nav.src} ${nav.box})`, nav.loaded);
  T("no 'Yugaantar' text beside the logo", nav.strayText === null, nav.strayText);
  T("nav row fits", nav.overflow <= 1, `${nav.overflow}px over`);

  // About stamp
  await page.locator("#about").scrollIntoViewIfNeeded();
  await page.waitForTimeout(900);
  await page.locator("#about").screenshot({ path: `${OUT}/about-${tag}.png` });
  const stamp = await page.evaluate(() => {
    const img = document.querySelector("#about [class*='_imgcard_'] img");
    if (!img) return null;
    const cs = getComputedStyle(img);
    const box = img.getBoundingClientRect();
    // is any of the artwork being cut off?
    const natural = img.naturalWidth / img.naturalHeight;
    const shown = box.width / box.height;
    return {
      src: img.currentSrc.split("/").pop(),
      loaded: img.naturalWidth > 0,
      fit: cs.objectFit,
      box: `${Math.round(box.width)}x${Math.round(box.height)}`,
      aspectDrift: Math.abs(natural - shown),
      parentChrome: getComputedStyle(img.parentElement).boxShadow,
    };
  });
  T(`stamp loads (${stamp?.src} ${stamp?.box})`, Boolean(stamp?.loaded));
  T("stamp not cropped (aspect preserved)", stamp && stamp.aspectDrift < 0.02, stamp && stamp.aspectDrift.toFixed(3));
  T("no rectangular frame behind the cut-out", stamp && stamp.parentChrome === "none", stamp && stamp.parentChrome);

  /* The agenda renders one day at a time, so a page-wide text scan only ever
     saw Day 1 — and every placeholder happened to be on Day 2. Switch days
     before scanning, or this check passes while the markers are still live. */
  const dayTabs = page.locator('#agendatable [role="tab"][aria-selected="false"]');
  if (await dayTabs.count()) {
    await page.locator("#agendatable").scrollIntoViewIfNeeded();
    await dayTabs.first().click();
    await page.waitForTimeout(600);
  }

  // page-wide checks
  const page_ = await page.evaluate(() => ({
    placeholders: (document.body.innerText.match(/\[PLACEHOLDER\]/gi) || []).length,
    tbc: (document.body.innerText.match(/\[Address line 1 TBC\]/gi) || []).length,
    sideways: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  }));
  T("no [PLACEHOLDER] anywhere on the page", page_.placeholders === 0, page_.placeholders);
  T("no [Address line 1 TBC]", page_.tbc === 0, page_.tbc);
  T("no sideways scroll", page_.sideways <= 1, `${page_.sideways}px`);
  if (badImg.length) T("all images load", false, badImg.join(", "));

  if (tag === "1440") {
    await page.locator("footer").scrollIntoViewIfNeeded();
    await page.waitForTimeout(700);
    await page.locator("footer").screenshot({ path: `${OUT}/footer.png` });
    const foot = await page.evaluate(() => document.querySelector("footer").innerText);
    T("footer shows the new email", /ed@jodhpur\.tie\.org/i.test(foot), foot.match(/\S+@\S+/)?.[0]);
    T("footer shows Hotel Radisson", /hotel radisson/i.test(foot));
  }

  await page.close();
}

await browser.close();
console.log(fails ? `\n${fails} failed\n` : "\nall good\n");
process.exit(fails ? 1 : 0);
