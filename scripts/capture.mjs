import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const sites = [
  { slug: "anipm", url: "https://ani.pm" },
  { slug: "animex", url: "https://animex.one" },
  { slug: "anilight", url: "https://anilight.live" },
  { slug: "anikura", url: "https://anikura.club" },
  { slug: "yumezone", url: "https://yumezone.live" },
  { slug: "nekowatch", url: "https://nekowatch.xyz" },
];

const outBase = path.resolve("./public/screenshots");

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    deviceScaleFactor: 1.5,
  });

  for (const site of sites) {
    const siteDir = path.join(outBase, site.slug);
    fs.mkdirSync(siteDir, { recursive: true });

    console.log(`\n=== Processing ${site.slug} (${site.url}) ===`);
    const page = await context.newPage();

    try {
      console.log(`Navigating to ${site.url}...`);
      await page.goto(site.url, { waitUntil: "domcontentloaded", timeout: 25000 });
      await page.waitForTimeout(3000);

      // Dismiss any popups or consent if present
      const homePath = path.join(siteDir, "01-home.jpg");
      await page.screenshot({ path: homePath, type: "jpeg", quality: 85 });
      console.log(`Saved ${homePath}`);

      // Try to find a link to a second page (e.g. an anime detail or catalog or browse)
      const links = await page.$$eval("a[href]", (els) => {
        return els
          .map((a) => a.getAttribute("href"))
          .filter((href) => {
            if (!href) return false;
            if (href.startsWith("#") || href.startsWith("javascript:")) return false;
            if (href.includes("discord") || href.includes("twitter") || href.includes("github")) return false;
            return true;
          });
      });

      console.log(`Found ${links.length} links on ${site.slug}`);

      // Filter interesting links (e.g. watch, anime, series, catalog, browse, search)
      const detailLink = links.find((l) =>
        /watch|anime|series|info|view|title/i.test(l)
      ) || links.find((l) =>
        /catalog|browse|explore|search|genre/i.test(l)
      ) || links[0];

      if (detailLink) {
        try {
          const detailUrl = new URL(detailLink, site.url).href;
          console.log(`Navigating to detail/anime page: ${detailUrl}...`);
          await page.goto(detailUrl, { waitUntil: "domcontentloaded", timeout: 20000 });
          await page.waitForTimeout(3000);
          const detailPath = path.join(siteDir, "02-anime.jpg");
          await page.screenshot({ path: detailPath, type: "jpeg", quality: 85 });
          console.log(`Saved ${detailPath}`);

          // Try to find a watch/player page or browse page
          const secondLinks = await page.$$eval("a[href]", (els) => {
            return els
              .map((a) => a.getAttribute("href"))
              .filter((href) => href && !href.startsWith("#") && !href.includes("discord"));
          });

          const watchLink = secondLinks.find((l) => /episode|ep-|watch|play/i.test(l)) ||
            links.find((l) => /browse|catalog|trending|top|schedule/i.test(l) && l !== detailLink);

          if (watchLink) {
            const watchUrl = new URL(watchLink, detailUrl).href;
            console.log(`Navigating to third page: ${watchUrl}...`);
            await page.goto(watchUrl, { waitUntil: "domcontentloaded", timeout: 20000 });
            await page.waitForTimeout(3000);
            const watchPath = path.join(siteDir, "03-watch.jpg");
            await page.screenshot({ path: watchPath, type: "jpeg", quality: 85 });
            console.log(`Saved ${watchPath}`);
          }
        } catch (e) {
          console.warn(`Detail link navigation error for ${site.slug}:`, e.message);
        }
      }
    } catch (err) {
      console.error(`Failed on ${site.slug}:`, err.message);
    } finally {
      await page.close();
    }
  }

  await browser.close();
  console.log("\nFinished taking screenshots!");
}

main().catch(console.error);
