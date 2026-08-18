import { chromium } from 'playwright';
const targets = [
  { name: 'BUILD', url: process.env.BUILD_URL || 'http://localhost:5180/' },
  { name: 'REF',   url: 'https://tieconamsterdam.org/' },
];
const IDS = ['top','about','experience','agenda','attend','speakers','planningcommittee','agendatable','tickets','sponsors','partners','contact'];
const W = Number(process.env.W || 390);
const browser = await chromium.launch({ channel: 'chromium' });
const out = {};
for (const t of targets) {
  const ctx = await browser.newContext({ viewport: { width: W, height: 844 } });
  const page = await ctx.newPage();
  await page.goto(t.url, { waitUntil: 'networkidle', timeout: 90000 }).catch(()=>{});
  await page.waitForTimeout(2000);
  await page.evaluate(async () => {
    const step = window.innerHeight * 0.75;
    for (let y = 0; y < document.body.scrollHeight; y += step) { window.scrollTo(0,y); await new Promise(r=>setTimeout(r,150)); }
    window.scrollTo(0,0); await new Promise(r=>setTimeout(r,400));
  });
  await page.waitForTimeout(800);
  out[t.name] = await page.evaluate((IDS) => {
    const r = { _doc: document.body.scrollHeight };
    for (const id of IDS) {
      const el = document.getElementById(id);
      if (!el) { r[id] = null; continue; }
      let n = el, block = el;
      for (let i = 0; i < 6 && n; i++) {
        const b = n.getBoundingClientRect();
        if (b.width >= window.innerWidth - 2 && b.height > 60) { block = n; break; }
        n = n.parentElement;
      }
      const b = block.getBoundingClientRect();
      r[id] = { top: Math.round(b.top + window.scrollY), h: Math.round(b.height) };
    }
    return r;
  }, IDS);
  await ctx.close();
}
console.log(`width=${W}`);
console.log('section'.padEnd(20), 'BUILD'.padStart(10), 'REF'.padStart(10), 'Δ'.padStart(9));
console.log('doc'.padEnd(20), String(out.BUILD._doc).padStart(10), String(out.REF._doc).padStart(10), String(out.BUILD._doc-out.REF._doc).padStart(9));
for (const id of IDS) {
  const a = out.BUILD[id], b = out.REF[id];
  if (!a || !b) { console.log(id.padEnd(20), (a?a.h:'-').toString().padStart(10), (b?b.h:'-').toString().padStart(10), 'n/a'.padStart(9)); continue; }
  console.log(id.padEnd(20), String(a.h).padStart(10), String(b.h).padStart(10), String(a.h-b.h).padStart(9));
}
await browser.close();
