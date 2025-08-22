import { scrapeListing } from "@/lib/scrapping/streeteasy-front";
import "dotenv/config";

if (
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
) {
  console.error(
    "Error: Missing required environment variables. Please check your .env file."
  );
  process.exit(1);
}

console.log("Starting StreetEasy description cron job test...");
console.log("The job will run every minute. Press Ctrl+C to stop.");

// Run immediately on startup
scrapeListing("https://streeteasy.com/for-rent/nyc")
  .then(() => {
    console.log("Initial run completed");
  })
  .catch((error: Error) => {
    console.error("Error in initial run:", error);
  });

// Keep the process running
process.on("SIGINT", () => {
  console.log("\nStopping cron job...");
  process.exit(0);
});
