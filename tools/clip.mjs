import { chromium } from 'playwright';
import path from 'path';

const URL = process.env.TARGET_URL || 'https://tieconamsterdam.org/';
const W = Number(process.env.W || 1440);
const SHOTS = path.resolve('design-reference/screenshots');

// regions: name:y:height  (absolute page coords)
const REGIONS = (process.env.REGIONS || 'hero:0:920').split(',').map((r) => {
  const [name, y, h] = r.split(':');
  return { name, y: Number(y), h: Number(h) };
});

const browser = await chromium.launch({ channel: 'chromium' });
const ctx = await browser.newContext({ viewport: { width: W, height: 900 } });
const page = await ctx.newPage();
await page.goto(URL, { waitUntil: 'networkidle', timeout: 90000 });
await page.waitForTimeout(2500);

// full scroll pass so reveals have fired
await page.evaluate(async () => {
  const step = window.innerHeight * 0.7;
  for (let y = 0; y < document.body.scrollHeight; y += step) {
    window.scrollTo(0, y);
    await new Promise((r) => setTimeout(r, 200));
  }
});
await page.waitForTimeout(800);

for (const r of REGIONS) {
  await page.evaluate((y) => window.scrollTo(0, 0), 0);
  await page.waitForTimeout(300);
  const file = path.join(SHOTS, `ref-${r.name}-${W}.png`);
  await page.screenshot({ path: file, clip: { x: 0, y: r.y, width: W, height: r.h }, fullPage: true });
  console.log('shot', file);
}

await browser.close();
