import { NextResponse } from "next/server";
import { scrapeSpareRoom } from "@/lib/scrapping/spareroom";

export async function GET() {
  try {
    const listings = await scrapeSpareRoom();
    return NextResponse.json(listings);
  } catch (error) {
    console.error("Error fetching SpareRoom listings:", error);
    return NextResponse.json(
      { error: "Failed to fetch listings" },
      { status: 500 }
    );
  }
}
