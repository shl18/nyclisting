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

    // Randomize viewport
    const width = 1280 + Math.floor(Math.random() * 40);
    const height = 800 + Math.floor(Math.random() * 20);
    await page.setViewport({ width, height });

    // Enable request interception to block unnecessary resources
    await page.setRequestInterception(true);
    page.on("request", (request) => {
      const resourceType = request.resourceType();
      if (["image", "stylesheet", "font", "media"].includes(resourceType)) {
        request.abort();
      } else {
        request.continue();
      }
    });

    await page.setExtraHTTPHeaders({
      "Accept-Language": "en-US,en;q=0.9",
    });

    console.log(`Navigating to ${url}`);
    await page.goto(url, {
      waitUntil: "networkidle0",
      timeout: 30000,
    });

    // Wait for the main content to be visible
    await page.waitForSelector("body", { timeout: 30000 });

    // Increased wait time for dynamic content
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // Check if we're on a valid page
    const pageTitle = await page.title();
    if (pageTitle.includes("Access Denied") || pageTitle.includes("Error")) {
      // Save screenshot and HTML if bot detection
      await page.screenshot({ path: `bot-detected-${Date.now()}.png` });
      const html = await page.content();
      require("fs").writeFileSync(`bot-detected-${Date.now()}.html`, html);
      throw new Error(`Invalid page access: ${pageTitle}`);
    }

    // Try multiple selector variations
    const selectors = {
      daysOnMarket: [
        '[data-testid="rentalListingSpec-daysOnMarket"] p.Body_base_gyzqw',
        '[data-testid="rentalListingSpec-daysOnMarket"]',
        ".days-on-market",
      ],
      available: [
        '[data-testid="rentalListingSpec-available"] p.Body_base_gyzqw',
        '[data-testid="rentalListingSpec-available"]',
        ".availability-status",
      ],
    };

    let daysOnMarketText = "";
    let availableText = "";

    // Try each selector variation
    for (const selector of selectors.daysOnMarket) {
      try {
        await page.waitForSelector(selector, { timeout: 5000 });
        daysOnMarketText = await page.$eval(
          selector,
          (el) => el.textContent?.trim() || ""
        );
        if (daysOnMarketText) break;
      } catch (e) {
        continue;
      }
    }

    for (const selector of selectors.available) {
      try {
        await page.waitForSelector(selector, { timeout: 5000 });
        availableText = await page.$eval(
          selector,
          (el) => el.textContent?.trim() || ""
        );
        if (availableText) break;
      } catch (e) {
        continue;
      }
    }

    if (!daysOnMarketText || !availableText) {
      throw new Error("Could not find required listing information");
    }

    const daysMatch = daysOnMarketText.match(/(\d+)/);
    const daysOnMarket = daysMatch ? parseInt(daysMatch[1], 10) : 0;

    console.log(`Days on Market: ${daysOnMarket}`);
    console.log(`Availability: ${availableText}`);

    return {
      daysOnMarket,
      isAvailable: /available now/i.test(availableText),
    };
  } catch (error) {
    console.error("Error occurred while checking the listing:", error);
    // Take a screenshot for debugging
    try {
      await page.screenshot({ path: `error-${Date.now()}.png` });
    } catch (screenshotError) {
      console.error("Failed to take error screenshot:", screenshotError);
    }
    return null;
  } finally {
    await browser.close();
  }
}

export async function checkAllListings() {
  try {
    // Get all active StreetEasy listings
    const streetEasyListings = await db
      .select()
      .from(listings)
      .where(
        and(eq(listings.source, "STREETEASY"), eq(listings.isActive, true))
      );

    console.log(
      `Found ${streetEasyListings.length} active StreetEasy listings`
    );

    for (const listing of streetEasyListings) {
      console.log(`\nChecking listing: ${listing.title}`);
      const result = await checkListing(listing.listingUrl);

      if (!result) {
        console.log("❌ Failed to check listing status");
        continue;
      }

      if (result.daysOnMarket > 80 || !result.isAvailable) {
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
