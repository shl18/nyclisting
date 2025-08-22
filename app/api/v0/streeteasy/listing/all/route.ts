import { NextResponse } from "next/server";
import { scrapeStreetEasy } from "@/lib/scrapping/streeteasy";

export async function GET() {
  try {
    const listings = await scrapeStreetEasy();
    return NextResponse.json(listings);
  } catch (error) {
    console.error("Error fetching StreetEasy listings:", error);
    return NextResponse.json(
      { error: "Failed to fetch listings" },
      { status: 500 }
    );
  }
}
