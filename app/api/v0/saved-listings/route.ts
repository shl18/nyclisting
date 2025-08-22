import { NextResponse } from "next/server";
import { db } from "@/db";
import { savedListings, listings } from "@/db/schema";
import { createId } from "@paralleldrive/cuid2";
import { eq, and } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    const { userId, listingId } = await request.json();

    if (!userId || !listingId) {
      return NextResponse.json(
        { error: "userId and listingId are required" },
        { status: 400 }
      );
    }

    // Check if the listing is already saved
    const existingSaved = await db
      .select()
      .from(savedListings)
      .where(
        and(
          eq(savedListings.userId, userId),
          eq(savedListings.listingId, listingId)
        )
      );

    if (existingSaved.length > 0) {
      // If already saved, remove it (unsave)
      await db
        .delete(savedListings)
        .where(
          and(
            eq(savedListings.userId, userId),
            eq(savedListings.listingId, listingId)
          )
        );
      return NextResponse.json({ saved: false });
    }

    // If not saved, save it
    await db.insert(savedListings).values({
      id: createId(),
      userId,
      listingId,
    });

    return NextResponse.json({ saved: true });
  } catch (error) {
    console.error("Error saving listing:", error);
    return NextResponse.json(
      { error: "Failed to save listing" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    // Join saved_listings with listings table to get all details in one query
    const saved = await db
      .select({
        id: savedListings.id,
        listingId: savedListings.listingId,
        savedAt: savedListings.savedAt,
        listing: {
          id: listings.id,
          title: listings.title,
          price: listings.price,
          address: listings.address,
          bedrooms: listings.bedrooms,
          bathrooms: listings.bathrooms,
          sqft: listings.sqft,
          imageUrls: listings.imageUrls,
          supabaseImageUrls: listings.supabaseImageUrls,
          city: listings.city,
          neighborhood: listings.neighborhood,
        },
      })
      .from(savedListings)
      .leftJoin(listings, eq(savedListings.listingId, listings.id))
      .where(eq(savedListings.userId, userId));

    return NextResponse.json(saved);
  } catch (error) {
    console.error("Error fetching saved listings:", error);
    return NextResponse.json(
      { error: "Failed to fetch saved listings" },
      { status: 500 }
    );
  }
}
