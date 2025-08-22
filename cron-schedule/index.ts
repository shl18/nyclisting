import cron from "node-cron";
import { updateDatabase } from "../scripts/update-streeteasy";
import fs from "fs";
import path from "path";

// Set up logging
const logFile = "/tmp/nyclistings-cron.log";

function log(message: string) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  fs.appendFileSync(logFile, logMessage);
  console.log(message);
}

// Run every 6 hours (at minute 0 of hours 0, 6, 12, and 18)
cron.schedule("0 */6 * * *", async () => {
  log("Running scheduled StreetEasy update...");
  try {
    await updateDatabase();
    log("StreetEasy update completed successfully");
  } catch (error: unknown) {
    log(
      `Error in StreetEasy update: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
});

// Run immediately on startup
log("Starting cron job...");
updateDatabase()
  .then(() => log("Initial update completed successfully"))
  .catch((error: unknown) =>
    log(
      `Error in initial update: ${
        error instanceof Error ? error.message : String(error)
      }`
    )
  );

log("Cron job started. Will run every 6 hours.");
