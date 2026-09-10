/* Re-reads the live pass catalogue from the TiE events platform.
   Run this whenever pricing changes (e.g. when early-bird windows close) and
   reconcile client/src/data/tickets.js against the output.

   The ticket data arrives as JSON from
     /backstage/public/tickets/<eventId>?portalId=<portalId>
   which is saved to design-reference/raw/tie-tickets-source.json. */
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const URL = 'https://events.tie.org/Yugaantar-TiEJodhpurlaunch-TheStartupFestival#/buyTickets/selectTickets?lang=en';
const OUT = path.resolve('design-reference');
const browser = await chromium.launch({ channel: 'chromium' });
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
});
const page = await ctx.newPage();

// capture any JSON the app pulls — the ticket catalogue usually arrives that way
const api = [];
page.on('response', async (res) => {
  const u = res.url();
  const ct = res.headers()['content-type'] || '';
  if (!ct.includes('json')) return;
  try { api.push({ url: u, body: await res.text() }); } catch {}
});

await page.goto(URL, { waitUntil: 'networkidle', timeout: 90000 });
await page.waitForTimeout(6000);
// SPA hash routes sometimes need a nudge to actually mount
await page.evaluate(() => { window.location.hash = '#/buyTickets/selectTickets?lang=en'; });
await page.waitForTimeout(6000);

await page.screenshot({ path: path.join(OUT, 'screenshots', 'tie-tickets.png'), fullPage: true });
const text = await page.evaluate(() => document.body.innerText);
fs.writeFileSync(path.join(OUT, 'raw', 'tie-tickets.txt'), text);
const catalogue = api.find((a) => /\/public\/tickets\//.test(a.url));
if (catalogue) {
  fs.writeFileSync(path.join(OUT, 'raw', 'tie-tickets-source.json'), catalogue.body);
  console.log('saved catalogue:', catalogue.url);
} else {
  console.log('WARNING: no /public/tickets/ response seen');
}

console.log('--- visible text ---');
console.log(text.slice(0, 4000));
console.log('\n--- json responses ---');
api.forEach((a, i) => console.log(i, a.body.length, a.url.slice(0, 130)));
await browser.close();
