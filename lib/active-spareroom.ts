import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { db } from "@/db";
import { listings } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import fs from "fs";

puppeteer.use(StealthPlugin());

function getBrowserPath(): string {
  if (process.env.PUPPETEER_EXECUTABLE_PATH) {
    return process.env.PUPPETEER_EXECUTABLE_PATH;
  }
  if (fs.existsSync("/usr/bin/google-chrome")) return "/usr/bin/google-chrome";
  if (fs.existsSync("/usr/bin/chromium-browser"))
    return "/usr/bin/chromium-browser";
  if (fs.existsSync("/usr/bin/chromium")) return "/usr/bin/chromium";
  if (process.platform === "darwin") {
    return "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
  }
  return "";
}

async function checkListing(url: string) {
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-accelerated-2d-canvas",
      "--disable-gpu",
      "--window-size=1280,800",
      "--disable-blink-features=AutomationControlled",
    ],
    executablePath: getBrowserPath(),
    timeout: 60000,
  });
  const page = await browser.newPage();

  try {
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
    );
    await page.setViewport({ width: 1280, height: 800 });
    await page.setExtraHTTPHeaders({
      "Accept-Language": "en-US,en;q=0.9",
    });

    // Advanced anti-bot evasion
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, "webdriver", { get: () => undefined });
      (window as any).chrome = { runtime: {} };
      Object.defineProperty(navigator, "languages", {
        get: () => ["en-US", "en"],
      });
      Object.defineProperty(navigator, "plugins", {
        get: () => [1, 2, 3, 4, 5],
      });
    });
    await page.setRequestInterception(true);
    page.on("request", (req) => {
      if (
        ["image", "stylesheet", "font", "media"].includes(req.resourceType())
      ) {
        req.abort();
      } else {
        req.continue();
      }
    });
    // Randomize viewport
    const width = 1280 + Math.floor(Math.random() * 40);
    const height = 800 + Math.floor(Math.random() * 20);
    await page.setViewport({ width, height });

    await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });

    // Check if the listing is expired
    const isExpired = await page
      .$eval(
        ".listing-contact__expired",
        (el) =>
          el.textContent?.includes("not currently accepting applications") ??
          false
      )
      .catch(() => false); // if selector not found, treat as not expired

    if (isExpired) {
      console.log("❌ The advertiser is NOT currently accepting applications.");
      return { isActive: false };
    } else {
      console.log("✅ The advertiser IS accepting applications.");
      return { isActive: true };
    }
  } catch (error) {
    console.error("Error occurred while checking the listing:", error);
    // Save screenshot and HTML if bot detection
    if (
      error &&
      typeof error === "object" &&
      "message" in error &&
      typeof error.message === "string" &&
      error.message.toLowerCase().includes("bot")
    ) {
      await page.screenshot({ path: `bot-detected-${Date.now()}.png` });
      const html = await page.content();
      require("fs").writeFileSync(`bot-detected-${Date.now()}.html`, html);
    }
    return null;
  } finally {
    await browser.close();
  }
}

export async function checkAllListings() {
  try {
    // Get all active SPAREROOM listings
    const spareroomListings = await db
      .select()
      .from(listings)
      .where(
        and(eq(listings.source, "SPAREROOM"), eq(listings.isActive, true))
      );

    console.log(`Found ${spareroomListings.length} active spareroom listings`);

    for (const listing of spareroomListings) {
      console.log(`\nChecking listing: ${listing.title}`);
      const result = await checkListing(listing.listingUrl);

      if (!result) {
        console.log("❌ Failed to check listing status");
        continue;
      }

      if (!result.isActive) {
        console.log("❌ Listing is inactive - removing from database");
        await db
          .update(listings)
          .set({ isActive: false })
          .where(eq(listings.id, listing.id));
      } else {
        console.log("✅ Listing is active");
      }
    }

    console.log("\nFinished checking all listings");
  } catch (error) {
    console.error("Error in checkAllListings:", error);
  }
}

checkAllListings();
