/* Captures the navbar and the Experience banner after the image swap. */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const BASE = process.env.BASE || "http://localhost:5185";
const OUT = "design-reference/img-shots";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();

async function shoot(w, h, tag) {
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  const bad = [];
  page.on("response", (r) => {
    if (!r.ok() && /\.(png|jpe?g|webp|svg)$/i.test(new URL(r.url()).pathname)) {
      bad.push(`${r.status()} ${new URL(r.url()).pathname}`);
    }
  });
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(700);

  await page.locator("header").screenshot({ path: `${OUT}/nav-${tag}.png` });

  // the banner lives in the section after #experience
  const banner = page.locator("[class*='_moment_']").first();
  await banner.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1100);
  await banner.screenshot({ path: `${OUT}/banner-${tag}.png` });

  const info = await page.evaluate(() => {
    const logo = document.querySelector("header a[class*='_brand_'] img");
    const bannerImg = document.querySelector("[class*='_moment_'] img");
    const brand = document.querySelector("header a[class*='_brand_']");
    return {
      logoSrc: logo ? logo.currentSrc.split("/").pop() : null,
      logoBox: logo ? `${Math.round(logo.clientWidth)}x${Math.round(logo.clientHeight)}` : null,
      logoLoaded: logo ? logo.naturalWidth > 0 : false,
      brandWidth: brand ? Math.round(brand.getBoundingClientRect().width) : null,
      bannerSrc: bannerImg ? bannerImg.currentSrc.split("/").pop() : null,
      bannerLoaded: bannerImg ? bannerImg.naturalWidth > 0 : false,
      bannerBg: bannerImg
        ? getComputedStyle(bannerImg.parentElement).backgroundImage
        : null,
      sideways:
        document.documentElement.scrollWidth - document.documentElement.clientWidth,
    };
  });

  // does the nav still fit, or has the wider logo pushed things out?
  const navFit = await page.evaluate(() => {
    const row = document.querySelector("header [class*='_in_']");
    if (!row) return null;
    return { scroll: row.scrollWidth, client: row.clientWidth };
  });

  await page.close();
  return { info, navFit, bad };
}

for (const [w, h, tag] of [
  [1440, 900, "1440"],
  [1101, 900, "1101"],
  [834, 900, "834"],
  [390, 800, "390"],
]) {
  const { info, navFit, bad } = await shoot(w, h, tag);
  console.log(`\n-- ${tag} --`);
  console.log(`  logo    ${info.logoSrc} ${info.logoBox} loaded=${info.logoLoaded}`);
  console.log(`  brand   ${info.brandWidth}px wide`);
  console.log(`  banner  ${info.bannerSrc} loaded=${info.bannerLoaded}`);
  console.log(`  red bg  ${info.bannerBg === "none" ? "gone" : info.bannerBg}`);
  console.log(`  nav row ${navFit.scroll}/${navFit.client}${navFit.scroll > navFit.client + 1 ? "  OVERFLOWING" : "  fits"}`);
  console.log(`  sideways scroll ${info.sideways}px`);
  if (bad.length) console.log(`  FAILED IMAGE REQUESTS: ${bad.join(", ")}`);
}

await browser.close();
