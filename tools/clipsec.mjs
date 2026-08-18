import { chromium } from 'playwright';
import fs from 'fs'; import path from 'path';
/* Captures a section by scrolling it to the top of the viewport and shooting
   the viewport — full-page captures drop compositor-promoted layers (the
   ticket cards use will-change:transform) far down a long page. */
const URL = process.env.URL || 'http://localhost:5180/';
const W = Number(process.env.W || 390);
const IDS = (process.env.IDS || 'tickets').split(',');
const OUT = path.resolve('design-reference/build-shots');
fs.mkdirSync(OUT, { recursive: true });
const PRE = process.env.PRE || 'b';
const VH = Number(process.env.VH || 1400);
const browser = await chromium.launch({ channel: 'chromium' });
const ctx = await browser.newContext({ viewport: { width: W, height: VH } });
const page = await ctx.newPage();
await page.goto(URL, { waitUntil: 'networkidle', timeout: 90000 });
await page.waitForTimeout(1200);
await page.evaluate(async()=>{const st=innerHeight*.8;for(let y=0;y<document.body.scrollHeight;y+=st){scrollTo(0,y);await new Promise(r=>setTimeout(r,150));}});
await page.waitForTimeout(600);
for (const id of IDS) {
  const off = Number(process.env.OFF || 0);
  await page.evaluate(([id, off]) => {
    const el = document.getElementById(id);
    if (!el) return;
    let n = el, b = el;
    for (let i=0;i<6&&n;i++){const r=n.getBoundingClientRect(); if(r.width>=innerWidth-2&&r.height>60){b=n;break;} n=n.parentElement;}
    window.scrollTo(0, b.getBoundingClientRect().top + window.scrollY + off);
  }, [id, off]);
  await page.waitForTimeout(900);
  await page.screenshot({ path: path.join(OUT, `${PRE}-${id}-${W}.png`) });
  console.log(`${PRE}-${id}-${W}.png`);
}
await browser.close();
