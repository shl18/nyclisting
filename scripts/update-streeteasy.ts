import { scrapeStreetEasy } from "@/lib/scrapping/streeteasy";
import dotenv from "dotenv";

dotenv.config();

async function updateDatabase() {
  try {
    console.log("Starting StreetEasy data update...");
    const newListings = await scrapeStreetEasy();
    console.log(`Successfully processed ${newListings.length} listings`);
  } catch (error) {
    console.error("Error updating database:", error);
    throw error;
  }
}

export { updateDatabase };
