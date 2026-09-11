/* Measures the caption's contrast against the banner photograph.

   The old banner was a flat red fill, so white text was always legible. A
   photograph is not flat — it has a pale hazy sky on the left exactly where
   the caption sits — so this samples what is actually behind each line of
   text and reports the WCAG contrast ratio.

   Thresholds: 4.5:1 for the small eyebrow, 3:1 for the large headline. */
import { chromium } from "playwright";

const BASE = process.env.BASE || "http://localhost:5185";
const browser = await chromium.launch();

for (const w of [1440, 834, 390]) {
  const page = await browser.newPage({ viewport: { width: w, height: 900 } });
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  const banner = page.locator("[class*='_moment_']").first();
  await banner.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1000);

  // rectangles of the text, in banner-local coordinates
  const rects = await page.evaluate(() => {
    const m = document.querySelector("[class*='_moment_']");
    const b = m.getBoundingClientRect();
    const grab = (sel) => {
      const el = m.querySelector(sel);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return {
        x: Math.round(r.left - b.left),
        y: Math.round(r.top - b.top),
        w: Math.round(r.width),
        h: Math.round(r.height),
      };
    };
    return { eyebrow: grab("[class*='_meye_']"), head: grab("[class*='_mh_']") };
  });

  // hide the text so we photograph only what sits behind it
  await page.evaluate(() => {
    const m = document.querySelector("[class*='_moment_']");
    m.querySelector("[class*='_mtxt_']").style.visibility = "hidden";
  });
  await page.waitForTimeout(200);
  const shot = await banner.screenshot();

  const stats = await page.evaluate(
    async ({ b64, rects }) => {
      const img = new Image();
      img.src = "data:image/png;base64," + b64;
      await img.decode();
      const c = document.createElement("canvas");
      c.width = img.naturalWidth;
      c.height = img.naturalHeight;
      const ctx = c.getContext("2d", { willReadFrequently: true });
      ctx.drawImage(img, 0, 0);

      const dpr = img.naturalWidth / document.querySelector("[class*='_moment_']").clientWidth;
      const lin = (v) => {
        const x = v / 255;
        return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
      };

      const measure = (r) => {
        if (!r) return null;
        const d = ctx.getImageData(
          Math.round(r.x * dpr), Math.round(r.y * dpr),
          Math.max(1, Math.round(r.w * dpr)), Math.max(1, Math.round(r.h * dpr))
        ).data;
        let worst = 21;
        let sum = 0;
        let n = 0;
        for (let i = 0; i < d.length; i += 4) {
          const L = 0.2126 * lin(d[i]) + 0.7152 * lin(d[i + 1]) + 0.0722 * lin(d[i + 2]);
          const ratio = 1.05 / (L + 0.05); // against white text
          if (ratio < worst) worst = ratio;
          sum += ratio;
          n++;
        }
        return { worst: +worst.toFixed(2), mean: +(sum / n).toFixed(2) };
      };
      return { eyebrow: measure(rects.eyebrow), head: measure(rects.head) };
    },
    { b64: shot.toString("base64"), rects }
  );

  const verdict = (v, min) => (v.worst >= min ? "ok  " : "LOW ");
  console.log(`\n-- ${w}px --`);
  console.log(`  ${verdict(stats.eyebrow, 4.5)} eyebrow   worst ${stats.eyebrow.worst}:1  mean ${stats.eyebrow.mean}:1   (needs 4.5:1)`);
  console.log(`  ${verdict(stats.head, 3)} headline  worst ${stats.head.worst}:1  mean ${stats.head.mean}:1   (needs 3:1)`);
  await page.close();
}

await browser.close();
