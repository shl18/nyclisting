import { NextResponse } from "next/server";
import { db } from "@/db";
import { listings } from "@/db/schema";
import { createListingSchema } from "@/lib/listings";
import { z } from "zod";
import { createId } from "@paralleldrive/cuid2";

const batchListingSchema = z.object({
  listings: z.array(createListingSchema),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("Received body:", JSON.stringify(body, null, 2));

    // Validate the input
    const validationResult = batchListingSchema.safeParse(body);
    if (!validationResult.success) {
      console.error("Validation errors:", validationResult.error.errors);
      return NextResponse.json(
        {
          error: "Invalid listing data",
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const { listings: newListings } = validationResult.data;

    // Insert listings with conflict handling on listing_url
    const result = await db
      .insert(listings)
      .values(
        newListings.map((listing) => ({
          id: createId(),
          ...listing,
          scrapedAt: new Date(),
        }))
      )
      .onConflictDoUpdate({
        target: listings.listingUrl,
        set: {
          title: listings.title,
          description: listings.description,
          price: listings.price,
          bedrooms: listings.bedrooms,
          bathrooms: listings.bathrooms,
          sqft: listings.sqft,
          imageUrls: listings.imageUrls,
          address: listings.address,
          latitude: listings.latitude,
          longitude: listings.longitude,
          neighborhood: listings.neighborhood,
          city: listings.city,
          updatedAt: new Date(),
          scrapedAt: new Date(),
          isActive: true,
        },
      })
      .returning();

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error storing listings:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid listing data", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      {
        error: "Failed to store listings",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
