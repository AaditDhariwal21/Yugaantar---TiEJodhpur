import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const URL = process.env.URL || 'http://localhost:5180/';
const OUT = path.resolve('design-reference/build-shots');
fs.mkdirSync(OUT, { recursive: true });
const TAG = process.env.TAG || 'page';
const WIDTHS = (process.env.WIDTHS || '390,834,1440').split(',').map(Number);
const FULL = process.env.FULL !== '0';
const CLIP = process.env.CLIP || '';

const browser = await chromium.launch({ channel: 'chromium' });
let errors = [];
for (const w of WIDTHS) {
  const ctx = await browser.newContext({ viewport: { width: w, height: w < 500 ? 844 : 900 } });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => errors.push(`[${w}] pageerror: ${e.message}`));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(`[${w}] console: ${m.text().slice(0,200)}`); });
  await page.goto(URL, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(1200);
  await page.evaluate(async () => {
    const step = window.innerHeight * 0.75;
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y); await new Promise(r => setTimeout(r, 180));
    }
    window.scrollTo(0, 0); await new Promise(r => setTimeout(r, 400));
  });
  await page.waitForTimeout(1000);
  const opts = { path: path.join(OUT, `${TAG}-${w}.png`) };
  if (CLIP) { const [x,y,cw,ch] = CLIP.split(',').map(Number); opts.clip = {x,y,width:cw||w,height:ch}; opts.fullPage = true; }
  else opts.fullPage = FULL;
  await page.screenshot(opts);
  const h = await page.evaluate(() => document.body.scrollHeight);
  console.log(`[${w}] docH=${h} -> ${TAG}-${w}.png`);
  await ctx.close();
}
if (errors.length) { console.log('--- ERRORS ---'); errors.slice(0,20).forEach(e => console.log(e)); }
await browser.close();
