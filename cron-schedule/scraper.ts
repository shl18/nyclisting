import cron from "node-cron";
import { scrapeSpareRoom } from "../lib/scrapping/spareroom";
import { scrapeStreetEasy } from "../lib/scrapping/streeteasy";
import { processEmptyDescriptions } from "../lib/scrapping/spareroom-front";
import { processListings } from "../lib/scrapping/streeteasy-front";
import { checkAllListings as checkSpareroomListings } from "../lib/active-spareroom";
import { checkAllListings as checkStreeteasyListings } from "../lib/active-streeteasy";
import fs from "fs";
import path from "path";

// Set up logging
const logFile = path.join(process.cwd(), "logs", "scraper-cron.log");

// Ensure logs directory exists
if (!fs.existsSync(path.dirname(logFile))) {
  fs.mkdirSync(path.dirname(logFile), { recursive: true });
}

function log(message: string) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  fs.appendFileSync(logFile, logMessage);
  console.log(message);
}

async function runMainScrapers() {
  log("Starting main scheduled scraping jobs...");

  try {
    // Run SpareRoom scraper
    log("Running SpareRoom scraper...");
    const spareRoomListings = await scrapeSpareRoom();
    log(
      `SpareRoom scraper completed successfully. Found ${spareRoomListings.length} listings.`
    );
  } catch (error) {
    log(
      `Error in SpareRoom scraper: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }

  try {
    // Run StreetEasy scraper
    log("Running StreetEasy scraper...");
    const streetEasyListings = await scrapeStreetEasy();
    log(
      `StreetEasy scraper completed successfully. Found ${streetEasyListings.length} listings.`
    );
  } catch (error) {
    log(
      `Error in StreetEasy scraper: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

async function runFrontEndScrapers() {
  log("Starting front-end scheduled scraping jobs...");

  try {
    // Run SpareRoom front-end scraper
    log("Running SpareRoom front-end scraper...");
    await processEmptyDescriptions();
    log("SpareRoom front-end scraper completed successfully.");
  } catch (error) {
    log(
      `Error in SpareRoom front-end scraper: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }

  try {
    // Run StreetEasy front-end scraper
    log("Running StreetEasy front-end scraper...");
    await processListings();
    log("StreetEasy front-end scraper completed successfully.");
  } catch (error) {
    log(
      `Error in StreetEasy front-end scraper: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

async function runListingChecks() {
  log("Starting daily listing checks...");

  try {
    // Run Spareroom listing checks
    log("Running Spareroom listing checks...");
    await checkSpareroomListings();
    log("Spareroom listing checks completed successfully.");
  } catch (error) {
    log(
      `Error in Spareroom listing checks: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }

  try {
    // Run StreetEasy listing checks
    log("Running StreetEasy listing checks...");
    await checkStreeteasyListings();
    log("StreetEasy listing checks completed successfully.");
  } catch (error) {
    log(
      `Error in StreetEasy listing checks: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}
// Run main scrapers every 12 hours (at minute 0 of hours 0 and 12)
cron.schedule("0 */12 * * *", async () => {
  log("Running main scheduled scraping jobs...");
  await runMainScrapers();
});

// Run front-end scrapers every 12.5 hours (at minute 30 of hours 0 and 12)
cron.schedule("30 */12 * * *", async () => {
  log("Running front-end scheduled scraping jobs...");
  await runFrontEndScrapers();
});

// Run listing checks daily at 9:00 AM
cron.schedule("0 9 * * *", async () => {
  log("Running daily listing checks...");
  await runListingChecks();
});

// Calculate time until next main run
const now = new Date();
const nextMainRun = new Date(now);
nextMainRun.setHours(now.getHours() + 12, 0, 0, 0); // Set to next 12-hour mark
const timeUntilNextMainRun = nextMainRun.getTime() - now.getTime();

// Calculate time until next front-end run
const nextFrontEndRun = new Date(now);
nextFrontEndRun.setHours(now.getHours() + 12, 30, 0, 0); // Set to next 12.5-hour mark
const timeUntilNextFrontEndRun = nextFrontEndRun.getTime() - now.getTime();

// Calculate time until next listing checks run
const nextListingChecksRun = new Date(now);
nextListingChecksRun.setHours(9, 0, 0, 0); // Set to 9:00 AM
if (nextListingChecksRun <= now) {
  nextListingChecksRun.setDate(nextListingChecksRun.getDate() + 1); // Move to next day if current time is past 9 AM
}
const timeUntilNextListingChecksRun =
  nextListingChecksRun.getTime() - now.getTime();

log(`Scraper cron jobs started.`);
log(`Main scrapers will run every 12 hours.`);
log(`Front-end scrapers will run every 12.5 hours.`);
log(`Listing checks will run daily at 9:00 AM.`);
log(`Next main run scheduled for: ${nextMainRun.toLocaleString()}`);
log(`Next front-end run scheduled for: ${nextFrontEndRun.toLocaleString()}`);
log(
  `Next listing checks run scheduled for: ${nextListingChecksRun.toLocaleString()}`
);
log(
  `Time until next main run: ${Math.floor(
    timeUntilNextMainRun / (1000 * 60)
  )} minutes`
);
log(
  `Time until next front-end run: ${Math.floor(
    timeUntilNextFrontEndRun / (1000 * 60)
  )} minutes`
);
log(
  `Time until next listing checks run: ${Math.floor(
    timeUntilNextListingChecksRun / (1000 * 60)
  )} minutes`
);
