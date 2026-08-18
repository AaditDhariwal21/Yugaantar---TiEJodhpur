import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const URL = process.env.TARGET_URL || 'https://tieconamsterdam.org/';
const SLUG = process.env.TARGET_SLUG || 'home';
const OUT = path.resolve('design-reference');
const SHOTS = path.join(OUT, 'screenshots');
fs.mkdirSync(SHOTS, { recursive: true });

const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'tablet', width: 834, height: 1112 },
  { name: 'mobile', width: 390, height: 844 },
];

const browser = await chromium.launch({ channel: 'chromium' });
const report = { url: URL, viewports: {} };

for (const vp of VIEWPORTS) {
  const ctx = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: 1,
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  });
  const page = await ctx.newPage();
  await page
    .goto(URL, { waitUntil: 'networkidle', timeout: 90000 })
    .catch((e) => console.error('nav', e.message));
  await page.waitForTimeout(2500);

  await page.evaluate(async () => {
    const step = window.innerHeight * 0.7;
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 220));
    }
    window.scrollTo(0, 0);
    await new Promise((r) => setTimeout(r, 600));
  });
  await page.waitForTimeout(1200);

  await page.screenshot({
    path: path.join(SHOTS, SLUG + '-' + vp.name + '-' + vp.width + '.png'),
    fullPage: true,
  });

  const data = await page.evaluate(() => {
    const cs = getComputedStyle(document.body);
    const root = getComputedStyle(document.documentElement);

    const vars = {};
    for (const sheet of Array.from(document.styleSheets)) {
      let rules;
      try {
        rules = sheet.cssRules;
      } catch (e) {
        continue;
      }
      for (const r of Array.from(rules || [])) {
        if (r.style && r.selectorText && /:root|^html$|^body$/.test(r.selectorText)) {
          for (const p of Array.from(r.style)) {
            if (p.startsWith('--')) vars[p] = r.style.getPropertyValue(p).trim();
          }
        }
      }
    }

    const headings = [];
    document.querySelectorAll('h1,h2,h3,h4,h5,h6').forEach((h) => {
      const s = getComputedStyle(h);
      headings.push({
        tag: h.tagName,
        text: (h.innerText || '').trim().slice(0, 90),
        fontSize: s.fontSize,
        fontWeight: s.fontWeight,
        lineHeight: s.lineHeight,
        letterSpacing: s.letterSpacing,
        color: s.color,
        fontFamily: s.fontFamily.split(',')[0],
        textTransform: s.textTransform,
      });
    });

    const main = document.querySelector('#main') || document.querySelector('main') || document.body;
    const sections = [];
    Array.from(main.children).forEach((el, i) => {
      const s = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      sections.push({
        i,
        tag: el.tagName,
        id: el.id || null,
        cls: (el.className || '').toString().slice(0, 80),
        paddingTop: s.paddingTop,
        paddingBottom: s.paddingBottom,
        bg: s.backgroundColor,
        bgImage: s.backgroundImage.slice(0, 120),
        height: Math.round(r.height),
        width: Math.round(r.width),
        heading: ((el.querySelector('h1,h2,h3') || {}).innerText || '').trim().slice(0, 80),
        text: (el.innerText || '').trim().slice(0, 300).replace(/\n+/g, ' | '),
      });
    });

    const anchors = Array.from(document.querySelectorAll('[id]')).map((e) => e.id).filter(Boolean);

    const btns = [];
    document.querySelectorAll('a[href], button').forEach((b) => {
      const s = getComputedStyle(b);
      const t = (b.innerText || '').trim();
      if (!t || t.length > 40) return;
      btns.push({
        text: t,
        href: b.getAttribute('href'),
        bg: s.backgroundColor,
        color: s.color,
        radius: s.borderRadius,
        padding: s.padding,
        fontSize: s.fontSize,
        fontWeight: s.fontWeight,
        border: s.border,
        boxShadow: s.boxShadow.slice(0, 80),
      });
    });

    const radii = {}, shadows = {}, bgs = {};
    document.querySelectorAll('*').forEach((el) => {
      const s = getComputedStyle(el);
      if (s.borderRadius && s.borderRadius !== '0px') radii[s.borderRadius] = (radii[s.borderRadius] || 0) + 1;
      if (s.boxShadow && s.boxShadow !== 'none') shadows[s.boxShadow] = (shadows[s.boxShadow] || 0) + 1;
      if (s.backgroundColor && !/rgba\(0, 0, 0, 0\)/.test(s.backgroundColor))
        bgs[s.backgroundColor] = (bgs[s.backgroundColor] || 0) + 1;
    });

    const maxW = {};
    document.querySelectorAll('div,section').forEach((el) => {
      const s = getComputedStyle(el);
      if (s.maxWidth && s.maxWidth !== 'none') maxW[s.maxWidth] = (maxW[s.maxWidth] || 0) + 1;
    });

    const nav = document.querySelector('nav') || document.querySelector('header');
    let navStyle = null;
    if (nav) {
      const s = getComputedStyle(nav);
      navStyle = {
        position: s.position,
        bg: s.backgroundColor,
        backdrop: s.backdropFilter,
        height: Math.round(nav.getBoundingClientRect().height),
        border: s.borderBottom,
        links: Array.from(nav.querySelectorAll('a'))
          .map((a) => ({ t: (a.innerText || '').trim(), h: a.getAttribute('href') }))
          .filter((x) => x.t),
      };
    }

    return {
      body: {
        bg: cs.backgroundColor,
        color: cs.color,
        fontFamily: cs.fontFamily,
        fontSize: cs.fontSize,
        lineHeight: cs.lineHeight,
      },
      rootFontSize: root.fontSize,
      vars,
      headings,
      sections,
      anchors,
      nav: navStyle,
      buttons: btns.slice(0, 60),
      topRadii: Object.entries(radii).sort((a, b) => b[1] - a[1]).slice(0, 14),
      topShadows: Object.entries(shadows).sort((a, b) => b[1] - a[1]).slice(0, 12),
      topBgs: Object.entries(bgs).sort((a, b) => b[1] - a[1]).slice(0, 18),
      maxWidths: Object.entries(maxW).sort((a, b) => b[1] - a[1]).slice(0, 10),
      docHeight: document.body.scrollHeight,
    };
  });

  report.viewports[vp.name] = data;
  console.log('[' + vp.name + '] sections=' + data.sections.length + ' docH=' + data.docHeight + ' headings=' + data.headings.length);
  await ctx.close();
}

{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(URL, { waitUntil: 'networkidle', timeout: 90000 }).catch(() => {});
  await page.waitForTimeout(2000);
  const snap = () =>
    page.evaluate(() => {
      const n = document.querySelector('nav') || document.querySelector('header');
      if (!n) return null;
      const s = getComputedStyle(n);
      return {
        bg: s.backgroundColor,
        backdrop: s.backdropFilter,
        shadow: s.boxShadow,
        border: s.borderBottom,
        transform: s.transform,
        transition: s.transition,
        h: Math.round(n.getBoundingClientRect().height),
      };
    });
  const atTop = await snap();
  await page.evaluate(() => window.scrollTo(0, 1400));
  await page.waitForTimeout(1400);
  const scrolled = await snap();
  report.navScrollState = { atTop, scrolled };
  await page.screenshot({
    path: path.join(SHOTS, SLUG + '-nav-scrolled.png'),
    clip: { x: 0, y: 0, width: 1440, height: 200 },
  });
  await ctx.close();
}

fs.writeFileSync(path.join(OUT, 'audit-' + SLUG + '.json'), JSON.stringify(report, null, 2));
console.log('WROTE design-reference/audit-' + SLUG + '.json');
await browser.close();
