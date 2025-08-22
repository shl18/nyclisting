import "dotenv/config";
import "../cron-schedule/scraper";

// Keep the process running
process.on("SIGINT", () => {
  console.log("\nStopping scraper cron job...");
  process.exit(0);
});
console.log("Scraper cron job started. Press Ctrl+C to stop.");
