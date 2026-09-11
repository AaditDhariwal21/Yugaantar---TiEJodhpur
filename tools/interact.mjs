import { chromium } from 'playwright';
import path from 'path';

const URL = 'http://localhost:5180/';
const OUT = path.resolve('design-reference/build-shots');
const browser = await chromium.launch({ channel: 'chromium' });
const errors = [];
const results = [];
const ok = (n, pass, note = '') => results.push(`${pass ? 'PASS' : 'FAIL'}  ${n}${note ? '  — ' + note : ''}`);

// ---------- desktop interactions ----------
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text().slice(0, 160)); });
  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);

  // --- agenda filters
  await page.locator('#agendatable').scrollIntoViewIfNeeded();
  await page.waitForTimeout(700);
  const rowCount = () => page.locator('#agendatable [class*="row"]').count();
  const all = await rowCount();
  await page.getByRole('tab', { name: 'Plenary' }).click();
  await page.waitForTimeout(500);
  const plenary = await rowCount();
  await page.getByRole('tab', { name: 'Breakouts' }).click();
  await page.waitForTimeout(500);
  const breakouts = await rowCount();
  await page.getByRole('tab', { name: 'Full Day' }).click();
  await page.waitForTimeout(500);
  ok('agenda filter narrows rows', all > plenary && plenary > breakouts, `all=${all} plenary=${plenary} breakouts=${breakouts}`);

  // --- day switcher
  const dayState = () => page.evaluate(() => {
    const sec = document.getElementById('agendatable');
    return {
      date: sec.querySelector('[class*="date_"]').innerText,
      rows: sec.querySelectorAll('[class*="row_"]').length,
    };
  });
  const d1 = await dayState();
  await page.getByRole('tab', { name: /Day 2/ }).click();
  await page.waitForTimeout(600);
  const d2 = await dayState();
  ok('day switcher swaps the schedule', /22 OCTOBER/i.test(d1.date) && /23 OCTOBER/i.test(d2.date) && d1.rows > 0 && d2.rows > 0,
     `${d1.date} (${d1.rows}) -> ${d2.date} (${d2.rows})`);
  await page.getByRole('tab', { name: /Day 1/ }).click();
  await page.waitForTimeout(500);

  // --- add to calendar emits a valid .ics
  const dl = page.waitForEvent('download', { timeout: 8000 }).catch(() => null);
  await page.locator('#agendatable button', { hasText: 'Add to calendar' }).click();
  const download = await dl;
  let icsOk = false, icsNote = 'no download';
  if (download) {
    const stream = await download.createReadStream();
    const chunks = [];
    for await (const c of stream) chunks.push(c);
    const text = Buffer.concat(chunks).toString('utf8');
    icsOk = text.startsWith('BEGIN:VCALENDAR') && text.includes('DTSTART;VALUE=DATE:20261022')
            && text.includes('DTEND;VALUE=DATE:20261024') && text.trim().endsWith('END:VCALENDAR');
    icsNote = download.suggestedFilename() + ' - ' + text.length + ' bytes';
  }
  ok('add-to-calendar downloads a valid .ics', icsOk, icsNote);

  // --- breakout expand
  // Day 1's breakouts are parallel sessions with no sub-tracks; the expandable
  // multi-track rows live on Day 2, so switch there first.
  await page.getByRole('tab', { name: /Day 2/ }).click();
  await page.waitForTimeout(700);
  const expander = page.locator('#agendatable button[aria-expanded]').first();
  const before = await page.locator('#agendatable [class*="track"]:not([class*="tracks"])').count();
  await expander.click();
  await page.waitForTimeout(700);
  const after = await page.locator('#agendatable [class*="track"]:not([class*="tracks"])').count();
  ok('breakout row expands to tracks', after > before, `before=${before} after=${after}`);
  await page.screenshot({ path: path.join(OUT, 'ix-agenda-expanded.png'), clip: await expander.evaluate((el) => {
    const r = el.closest('[class*="row"]').getBoundingClientRect();
    return { x: 0, y: Math.max(0, r.top - 20), width: 1440, height: Math.min(700, r.height + 220) };
  }) });
  await expander.click();
  await page.waitForTimeout(500);
  await page.getByRole('tab', { name: /Day 1/ }).click();
  await page.waitForTimeout(400);

  // --- partner filters
  await page.locator('#sponsors').scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);
  const tiles = () => page.locator('#sponsors [class*="lgbox"]').count();
  const allP = await tiles();
  await page.getByRole('button', { name: /Silver Partner/ }).click();
  await page.waitForTimeout(500);
  const silver = await tiles();
  ok('partner filter narrows tiles', allP === 8 && silver === 5, `all=${allP} silver=${silver}`);
  await page.getByRole('button', { name: /^All/ }).click();
  await page.waitForTimeout(400);

  // --- anchors
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(400);
  await page.locator('header a', { hasText: 'Delegates' }).first().click();
  await page.waitForTimeout(1400);
  const atDelegates = await page.evaluate(() => {
    const el = document.getElementById('delegates');
    return Math.abs(el.getBoundingClientRect().top) < 130;
  });
  ok('nav anchor scrolls to #delegates', atDelegates);

  // --- pass carousel advances, pauses on hover, and carries no per-card CTA
  await page.locator('#tickets').scrollIntoViewIfNeeded();
  await page.waitForTimeout(900);
  const centred = () => page.evaluate(() =>
    document.querySelector('#tickets [data-active] [class*="_name_"]')?.textContent.trim());

  const p1 = await centred();
  await page.waitForTimeout(6200);
  ok('pass carousel advances', p1 !== (await centred()), `${p1} -> ${await centred()}`);

  const stageBox = await page.locator('#tickets [class*="_stage_"]').boundingBox();
  await page.mouse.move(stageBox.x + stageBox.width / 2, stageBox.y + 8);
  await page.waitForTimeout(400);
  const h1 = await centred();
  await page.waitForTimeout(6200);
  ok('pass carousel pauses on hover', h1 === (await centred()), h1);
  await page.mouse.move(5, 5);

  const passInfo = await page.evaluate(() => ({
    cards: document.querySelectorAll('#tickets article').length,
    detailed: document.querySelectorAll('#tickets [class*="_list_"]').length,
    /* Selecting a pass is navigation within the belt; buying is not offered
       per card, so no card may contain a link. */
    cardLinks: document.querySelectorAll('#tickets article a').length,
    buyLinks: document.querySelectorAll('#tickets a[href*="buyTickets"]').length,
    footCta: document.querySelector('#tickets a[href*="buyTickets"]')?.getAttribute('target'),
  }));
  ok('all twelve passes rendered', passInfo.cards === 12, `${passInfo.cards}`);
  ok('only the centred pass shows its inclusions', passInfo.detailed === 1, `${passInfo.detailed}`);
  ok('no per-card CTA', passInfo.cardLinks === 0 && passInfo.buyLinks === 1,
     `${passInfo.cardLinks} card links, ${passInfo.buyLinks} buy links`);
  ok('pass CTA deep-links to the ticket selector', passInfo.footCta === '_blank');

  // --- marquee is actually moving
  await page.locator('#attend').scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  const t1 = await page.locator('#attend [class*="track"]').first().evaluate((el) => getComputedStyle(el).transform);
  await page.waitForTimeout(900);
  const t2 = await page.locator('#attend [class*="track"]').first().evaluate((el) => getComputedStyle(el).transform);
  ok('attend marquee animates', t1 !== t2, `${String(t1).slice(0, 28)} -> ${String(t2).slice(0, 28)}`);

  // --- counters counted up
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(1800);
  const pillText = await page.evaluate(() => {
    const pill = document.querySelector('[class*="pill"]');
    return pill ? pill.innerText.split('\n').join(' ') : '';
  });
  ok('hero counters reached target', /500,000\+/.test(pillText) && /15,000\+/.test(pillText),
     pillText.slice(0, 70));

  await ctx.close();
}

// ---------- mobile nav ----------
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => errors.push('m pageerror: ' + e.message));
  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  const linksHidden = await page.locator('header nav[aria-label="Primary"]').isHidden();
  ok('desktop links hidden on mobile', linksHidden);

  const burger = page.locator('header button[aria-label="Open menu"]');
  const box = await burger.boundingBox();
  ok('burger meets 44px tap target', box && box.width >= 44 && box.height >= 44, box ? `${Math.round(box.width)}x${Math.round(box.height)}` : 'missing');

  await burger.click();
  await page.waitForTimeout(600);
  const menuOpen = await page.locator('header nav[aria-label="Mobile"]').isVisible();
  ok('burger opens the mobile panel', menuOpen);
  await page.screenshot({ path: path.join(OUT, 'ix-mobile-nav.png'), clip: { x: 0, y: 0, width: 390, height: 560 } });

  await page.locator('header nav[aria-label="Mobile"] a', { hasText: 'Tickets' }).first().click();
  await page.waitForTimeout(1400);
  const closed = await page.locator('header nav[aria-label="Mobile"]').isHidden();
  ok('menu closes after choosing a link', closed);

  await ctx.close();
}

console.log(results.join('\n'));
console.log('\nerrors: ' + (errors.length ? '\n' + errors.slice(0, 12).join('\n') : 'none'));
await browser.close();
