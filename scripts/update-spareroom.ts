import dotenv from "dotenv";
import { scrapeSpareRoom } from "../lib/scrapping/spareroom";

dotenv.config();

async function updateDatabase() {
  try {
    console.log("Starting SpareRoom data update...");
    const newListings = await scrapeSpareRoom();
    console.log(`Successfully processed ${newListings.length} listings`);
  } catch (error) {
    console.error("Error updating database:", error);
    throw error;
  }
}

export { updateDatabase };
