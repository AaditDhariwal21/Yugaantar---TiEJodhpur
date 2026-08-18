import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const URL = process.env.TARGET_URL || 'https://tieconamsterdam.org/';
const SLUG = process.env.TARGET_SLUG || 'home';
const OUT = path.resolve('design-reference');
const SHOTS = path.join(OUT, 'screenshots');
fs.mkdirSync(SHOTS, { recursive: true });

const browser = await chromium.launch({ channel: 'chromium' });
const out = { url: URL };

// ============ DESKTOP DEEP PROBE ============
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.goto(URL, { waitUntil: 'networkidle', timeout: 90000 });
await page.waitForTimeout(2500);

// --- real navbar: the fixed/sticky element at top
out.navbar = await page.evaluate(() => {
  const cands = [];
  document.querySelectorAll('body *').forEach((el) => {
    const s = getComputedStyle(el);
    if ((s.position === 'fixed' || s.position === 'sticky') && el.getBoundingClientRect().top < 120) {
      const r = el.getBoundingClientRect();
      if (r.height > 30 && r.height < 200 && r.width > 500) {
        cands.push({
          tag: el.tagName, id: el.id, cls: (el.className || '').toString().slice(0, 60),
          position: s.position, top: s.top, zIndex: s.zIndex,
          bg: s.backgroundColor, backdrop: s.backdropFilter, shadow: s.boxShadow,
          borderBottom: s.borderBottom, transition: s.transition,
          h: Math.round(r.height), w: Math.round(r.width),
          padding: s.padding,
          links: Array.from(el.querySelectorAll('a')).map((a) => ({
            t: (a.innerText || '').trim(), h: a.getAttribute('href'),
          })).filter((x) => x.t),
          imgs: Array.from(el.querySelectorAll('img')).map((i) => i.getAttribute('src')).slice(0, 3),
        });
      }
    }
  });
  return cands;
});

// --- nav scrolled state (re-measure the same node)
out.navScroll = await page.evaluate(async () => {
  const find = () => {
    let best = null;
    document.querySelectorAll('body *').forEach((el) => {
      const s = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      if ((s.position === 'fixed' || s.position === 'sticky') && r.top < 120 && r.height > 30 && r.height < 200 && r.width > 500) {
        if (!best) best = el;
      }
    });
    return best;
  };
  const el = find();
  if (!el) return null;
  const read = () => {
    const s = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    return { bg: s.backgroundColor, backdrop: s.backdropFilter, shadow: s.boxShadow,
             borderBottom: s.borderBottom, h: Math.round(r.height), padding: s.padding,
             transform: s.transform, opacity: s.opacity };
  };
  window.scrollTo(0, 0); await new Promise((r) => setTimeout(r, 900));
  const atTop = read();
  window.scrollTo(0, 1600); await new Promise((r) => setTimeout(r, 1400));
  const scrolled = read();
  window.scrollTo(0, 0); await new Promise((r) => setTimeout(r, 900));
  return { atTop, scrolled };
});

// --- section map: find elements that own the known anchor ids, plus their visual block
const ANCHORS = ['top','about','experience','agenda','attend','speakers','planningcommittee','committee','agendatable','tickets','sponsors','partners','contact'];
out.sections = await page.evaluate((ANCHORS) => {
  const res = [];
  for (const id of ANCHORS) {
    const el = document.getElementById(id);
    if (!el) { res.push({ id, missing: true }); continue; }
    // climb to the nearest ancestor that is a full-width block
    let node = el, block = el;
    for (let i = 0; i < 6 && node; i++) {
      const r = node.getBoundingClientRect();
      if (r.width >= window.innerWidth - 2 && r.height > 100) { block = node; break; }
      node = node.parentElement;
    }
    const s = getComputedStyle(block);
    const r = block.getBoundingClientRect();
    res.push({
      id,
      tag: block.tagName,
      absTop: Math.round(r.top + window.scrollY),
      height: Math.round(r.height),
      width: Math.round(r.width),
      paddingTop: s.paddingTop, paddingBottom: s.paddingBottom,
      paddingLeft: s.paddingLeft, paddingRight: s.paddingRight,
      bg: s.backgroundColor,
      bgImage: s.backgroundImage.slice(0, 160),
      gap: s.gap, display: s.display,
    });
  }
  return res.sort((a, b) => (a.absTop || 0) - (b.absTop || 0));
}, ANCHORS);

// --- typography census: every text node's computed style, grouped
out.typography = await page.evaluate(() => {
  const seen = {};
  document.querySelectorAll('h1,h2,h3,h4,h5,h6,p,span,a,li,div').forEach((el) => {
    const txt = Array.from(el.childNodes).filter((n) => n.nodeType === 3).map((n) => n.textContent.trim()).join(' ').trim();
    if (!txt || txt.length < 2) return;
    const s = getComputedStyle(el);
    const key = [s.fontFamily.split(',')[0].replace(/["']/g, ''), s.fontSize, s.fontWeight, s.lineHeight, s.letterSpacing, s.textTransform, s.color].join(' | ');
    if (!seen[key]) seen[key] = { key, count: 0, samples: [] };
    seen[key].count++;
    if (seen[key].samples.length < 3) seen[key].samples.push(txt.slice(0, 60));
  });
  return Object.values(seen).sort((a, b) => b.count - a.count).slice(0, 45);
});

// --- fonts actually loaded
out.fonts = await page.evaluate(() => {
  const set = new Set();
  document.fonts.forEach((f) => set.add(`${f.family} | ${f.weight} | ${f.style} | ${f.status}`));
  return Array.from(set);
});

// --- container max-width: measure the actual inner content wrapper width
out.contentWidths = await page.evaluate(() => {
  const counts = {};
  document.querySelectorAll('div,section').forEach((el) => {
    const r = el.getBoundingClientRect();
    const w = Math.round(r.width);
    if (r.height > 80 && w > 600 && w < 1440) counts[w] = (counts[w] || 0) + 1;
  });
  return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 12);
});

// --- buttons
out.buttons = await page.evaluate(() => {
  const res = [];
  document.querySelectorAll('a,button').forEach((b) => {
    const t = (b.innerText || '').trim();
    if (!t || t.length > 42) return;
    const s = getComputedStyle(b);
    const r = b.getBoundingClientRect();
    if (r.height < 24) return;
    res.push({ text: t, href: b.getAttribute('href'), bg: s.backgroundColor, color: s.color,
      radius: s.borderRadius, padding: s.padding, fontSize: s.fontSize, fontWeight: s.fontWeight,
      border: s.border, shadow: s.boxShadow.slice(0, 90), h: Math.round(r.height), letterSpacing: s.letterSpacing });
  });
  const uniq = {}; res.forEach((r) => { const k = r.text + r.bg + r.radius; if (!uniq[k]) uniq[k] = r; });
  return Object.values(uniq).slice(0, 40);
});

// --- radii / shadows / borders census
out.census = await page.evaluate(() => {
  const radii = {}, shadows = {}, borders = {}, bgs = {};
  document.querySelectorAll('*').forEach((el) => {
    const s = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    if (r.width < 20 || r.height < 20) return;
    if (s.borderRadius !== '0px') radii[s.borderRadius] = (radii[s.borderRadius] || 0) + 1;
    if (s.boxShadow !== 'none') shadows[s.boxShadow] = (shadows[s.boxShadow] || 0) + 1;
    if (s.borderTopWidth !== '0px' || s.borderTopStyle !== 'none') {
      const b = `${s.borderTopWidth} ${s.borderTopStyle} ${s.borderTopColor}`;
      if (!/0px/.test(s.borderTopWidth)) borders[b] = (borders[b] || 0) + 1;
    }
    if (!/rgba\(0, 0, 0, 0\)/.test(s.backgroundColor)) bgs[s.backgroundColor] = (bgs[s.backgroundColor] || 0) + 1;
  });
  const top = (o, n) => Object.entries(o).sort((a, b) => b[1] - a[1]).slice(0, n);
  return { radii: top(radii, 12), shadows: top(shadows, 12), borders: top(borders, 10), bgs: top(bgs, 16) };
});

// --- animation / transition census (scroll reveal fingerprints)
out.motion = await page.evaluate(() => {
  const trans = {}, anims = {}, willChange = {};
  document.querySelectorAll('*').forEach((el) => {
    const s = getComputedStyle(el);
    if (s.transitionDuration !== '0s') {
      const k = `${s.transitionProperty} | ${s.transitionDuration} | ${s.transitionTimingFunction} | ${s.transitionDelay}`;
      trans[k] = (trans[k] || 0) + 1;
    }
    if (s.animationName !== 'none') {
      const k = `${s.animationName} | ${s.animationDuration} | ${s.animationTimingFunction} | ${s.animationIterationCount} | ${s.animationDirection}`;
      anims[k] = (anims[k] || 0) + 1;
    }
    if (s.willChange !== 'auto') willChange[s.willChange] = (willChange[s.willChange] || 0) + 1;
  });
  const top = (o, n) => Object.entries(o).sort((a, b) => b[1] - a[1]).slice(0, n);
  // keyframes text
  const kf = [];
  for (const sheet of Array.from(document.styleSheets)) {
    let rules; try { rules = sheet.cssRules; } catch (e) { continue; }
    for (const r of Array.from(rules || [])) {
      if (r.type === CSSRule.KEYFRAMES_RULE) kf.push(r.cssText.slice(0, 400));
    }
  }
  return { transitions: top(trans, 14), animations: top(anims, 14), willChange: top(willChange, 8), keyframes: kf.slice(0, 20) };
});

// --- canvas / webgl / video background check
out.backgroundTech = await page.evaluate(() => ({
  canvases: Array.from(document.querySelectorAll('canvas')).map((c) => ({
    w: c.width, h: c.height, cls: (c.className || '').toString().slice(0, 60),
    style: c.getAttribute('style') ? c.getAttribute('style').slice(0, 140) : null,
  })),
  videos: Array.from(document.querySelectorAll('video')).map((v) => ({ src: v.currentSrc || v.src, loop: v.loop, muted: v.muted })),
  gradientEls: Array.from(document.querySelectorAll('*')).filter((el) => {
    const bi = getComputedStyle(el).backgroundImage;
    return bi && bi.includes('gradient') && el.getBoundingClientRect().height > 200;
  }).slice(0, 10).map((el) => ({
    cls: (el.className || '').toString().slice(0, 50),
    bi: getComputedStyle(el).backgroundImage.slice(0, 220),
    h: Math.round(el.getBoundingClientRect().height),
  })),
}));

// --- marquee detection
out.marquee = await page.evaluate(() => {
  const res = [];
  document.querySelectorAll('*').forEach((el) => {
    const s = getComputedStyle(el);
    const hasAnim = s.animationName !== 'none' && parseFloat(s.animationDuration) > 3;
    const isTicker = /ticker|marquee|scroll/i.test((el.className || '').toString());
    if (hasAnim || isTicker) {
      const r = el.getBoundingClientRect();
      if (r.width > 200) res.push({
        cls: (el.className || '').toString().slice(0, 70),
        anim: s.animationName, dur: s.animationDuration, timing: s.animationTimingFunction,
        dir: s.animationDirection, w: Math.round(r.width), h: Math.round(r.height),
        transform: s.transform.slice(0, 60),
        text: (el.innerText || '').trim().slice(0, 80).replace(/\n/g, ' / '),
      });
    }
  });
  return res.slice(0, 20);
});

// --- images inventory
out.images = await page.evaluate(() =>
  Array.from(document.querySelectorAll('img')).map((i) => {
    const r = i.getBoundingClientRect();
    return { src: (i.currentSrc || i.src || '').split('?')[0], alt: i.alt, w: Math.round(r.width), h: Math.round(r.height),
             radius: getComputedStyle(i).borderRadius, fit: getComputedStyle(i).objectFit };
  }).filter((i) => i.w > 10).slice(0, 90)
);

fs.writeFileSync(path.join(OUT, `probe-${SLUG}.json`), JSON.stringify(out, null, 2));
console.log('WROTE probe-' + SLUG + '.json');
console.log('navbar candidates:', out.navbar.length, '| sections:', out.sections.length, '| marquee:', out.marquee.length);

await ctx.close();
await browser.close();
