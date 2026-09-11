/* Turns the supplied TiE Jodhpur JPEG into a navbar-ready PNG.

   The source is a JPEG, so it has no alpha and carries a solid white
   background. The navbar is rgba(255,255,255,.82) over a pink-tinted hero, so
   dropping the JPEG in as-is paints a visible white rectangle behind the mark.

   This flood-fills the white background to transparent starting from the image
   border, which stops at the red TiE box and leaves the white letters INSIDE
   that box untouched — a plain "make every white pixel transparent" pass would
   punch holes through the logotype itself.

   Then it trims to the ink and downscales to a sensible delivery width.

     node tools/make-logo.mjs <src> <out.png|out.webp> [width] [--no-tagline]

   Give the output a .webp extension for lossy WebP with alpha. Worth it for
   anything with photographic or halftone detail: the event stamp is 1.2MB as
   a PNG and a fraction of that as WebP, with no visible difference at the
   size it is actually displayed.

   --no-tagline drops the strapline under the wordmark. At navbar size it is
   about five pixels tall, which is unreadable — it reads as a grey smudge and
   makes the whole mark look soft. Removing it lets the wordmark itself use the
   full height instead.

   Uses Chromium's canvas rather than an image library so this needs no
   dependency beyond the Playwright already in tools/. */

import { chromium } from "playwright";
import { readFileSync, writeFileSync } from "node:fs";

const argv = process.argv.slice(2);
const noTagline = argv.includes("--no-tagline");
const [src, out, widthArg] = argv.filter((a) => !a.startsWith("--"));
if (!src || !out) {
  console.error("usage: node tools/make-logo.mjs <src> <out.png> [width]");
  process.exit(1);
}
const TARGET_W = Number(widthArg) || 480;

const b64 = readFileSync(src).toString("base64");
const mime = src.endsWith(".png") ? "image/png" : "image/jpeg";

const browser = await chromium.launch();
const page = await browser.newPage();

const result = await page.evaluate(
  async ({ dataUrl, targetW, noTagline, webp }) => {
    const img = new Image();
    img.src = dataUrl;
    await img.decode();

    const w = img.naturalWidth;
    const h = img.naturalHeight;
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    const ctx = c.getContext("2d", { willReadFrequently: true });
    ctx.drawImage(img, 0, 0);

    const id = ctx.getImageData(0, 0, w, h);
    const px = id.data;

    /* Near-white only. JPEG ringing means the background is not exactly
       #ffffff, but anything this bright next to the artwork is background. */
    const isWhite = (i) => px[i] > 246 && px[i + 1] > 246 && px[i + 2] > 246;

    // flood fill inward from every border pixel
    const seen = new Uint8Array(w * h);
    const stack = [];
    for (let x = 0; x < w; x++) {
      stack.push(x, (h - 1) * w + x);
    }
    for (let y = 0; y < h; y++) {
      stack.push(y * w, y * w + w - 1);
    }

    while (stack.length) {
      const p = stack.pop();
      if (seen[p]) continue;
      const i = p * 4;
      if (!isWhite(i)) continue;
      seen[p] = 1;
      px[i + 3] = 0;

      const x = p % w;
      const y = (p / w) | 0;
      if (x > 0) stack.push(p - 1);
      if (x < w - 1) stack.push(p + 1);
      if (y > 0) stack.push(p - w);
      if (y < h - 1) stack.push(p + w);
    }
    ctx.putImageData(id, 0, 0);

    // trim to the remaining ink
    let minX = w, minY = h, maxX = -1, maxY = -1;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (px[(y * w + x) * 4 + 3] > 8) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }
    let cw = maxX - minX + 1;
    let ch = maxY - minY + 1;

    /* Drop the strapline: find the last run of completely empty rows inside
       the trimmed artwork and crop at its top. The gap between a wordmark and
       its strapline is the only full-width blank band in a logo lockup, so
       this needs no hand-tuned coordinates. */
    if (noTagline) {
      const rowHasInk = [];
      for (let y = minY; y <= maxY; y++) {
        let ink = 0;
        for (let x = minX; x <= maxX; x++) {
          if (px[(y * w + x) * 4 + 3] > 8) { ink++; if (ink > 2) break; }
        }
        rowHasInk.push(ink > 2);
      }
      let gapEnd = -1;
      let gapStart = -1;
      for (let i = rowHasInk.length - 1; i >= 0; i--) {
        if (!rowHasInk[i]) {
          if (gapEnd === -1) gapEnd = i;
          gapStart = i;
        } else if (gapEnd !== -1) {
          break; // found ink above the gap: this is the wordmark/strapline gap
        }
      }
      // only act on a real band, not a single antialiased row
      if (gapStart > 0 && gapEnd - gapStart >= 2) {
        maxY = minY + gapStart - 1;
        ch = maxY - minY + 1;
      }
    }

    const scale = targetW / cw;
    const o = document.createElement("canvas");
    o.width = Math.round(cw * scale);
    o.height = Math.round(ch * scale);
    const octx = o.getContext("2d");
    octx.imageSmoothingQuality = "high";
    octx.drawImage(c, minX, minY, cw, ch, 0, 0, o.width, o.height);

    const type = webp ? "image/webp" : "image/png";
    return {
      dataUrl: o.toDataURL(type, webp ? 0.9 : undefined),
      source: `${w}x${h}`,
      trimmed: `${cw}x${ch}`,
      output: `${o.width}x${o.height}`,
      transparentPct: Math.round((seen.reduce((n, v) => n + v, 0) / (w * h)) * 100),
    };
  },
  { dataUrl: `data:${mime};base64,${b64}`, targetW: TARGET_W, noTagline, webp: out.endsWith(".webp") }
);

writeFileSync(out, Buffer.from(result.dataUrl.split(",")[1], "base64"));
await browser.close();

const kb = (readFileSync(out).length / 1024).toFixed(0);
console.log(`source    ${result.source}`);
console.log(`trimmed   ${result.trimmed}  (${result.transparentPct}% was background)`);
console.log(`written   ${out}  ${result.output}  ${kb} KB`);
