import { listings } from "@/db/schema";
import { z } from "zod";
import { db } from "@/db";
import { createId } from "@paralleldrive/cuid2";
import { sql } from "drizzle-orm";

export const createListingSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  price: z.number().positive(),
  bedrooms: z.number().min(0).optional(),
  bathrooms: z.number().min(0).optional(),
  sqft: z.number().positive().optional(),
  listingUrl: z.string().url(),
  imageUrls: z.array(z.string().url()),
  address: z.string().min(1),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  neighborhood: z.string().optional(),
  city: z.string().min(1),
  source: z.enum(["SPAREROOM", "STREETEASY"]),
});

export type CreateListingInput = z.infer<typeof createListingSchema>;
export type Listing = typeof listings.$inferSelect;

export async function createListing(
  data: CreateListingInput
): Promise<Listing> {
  const response = await fetch("/api/v0/listings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to create listing");
  }

  return response.json();
}

export async function getListings(params?: {
  city?: string;
  source?: "SPAREROOM" | "STREETEASY";
}): Promise<Listing[]> {
  const searchParams = new URLSearchParams();
  if (params?.city) searchParams.set("city", params.city);
  if (params?.source) searchParams.set("source", params.source);

  const response = await fetch(`/api/v0/listings?${searchParams.toString()}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch listings");
  }

  return response.json();
}

export async function storeListings(
  listingsData: z.infer<typeof createListingSchema>[]
) {
  try {
    // First, clean up any existing duplicates by keeping the most recent entry
    await db.execute(sql`
      WITH duplicates AS (
        SELECT listing_url, MAX(scraped_at) as latest_scrape
        FROM listings
        GROUP BY listing_url
        HAVING COUNT(*) > 1
      )
      DELETE FROM listings l
      WHERE EXISTS (
        SELECT 1 FROM duplicates d
        WHERE d.listing_url = l.listing_url
        AND d.latest_scrape > l.scraped_at
      )
    `);

    // Deduplicate listings by listingUrl, keeping the most recent one
    const uniqueListings = Array.from(
      new Map(
        listingsData.map((listing) => [listing.listingUrl, listing])
      ).values()
    );

    // Process listings in batches of 50
    const BATCH_SIZE = 50;
    const results = [];

    for (let i = 0; i < uniqueListings.length; i += BATCH_SIZE) {
      const batch = uniqueListings.slice(i, i + BATCH_SIZE);
      const batchResult = await db
        .insert(listings)
        .values(
          batch.map((listing) => ({
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

      results.push(...batchResult);
    }

    return results;
  } catch (error) {
    console.error("Error storing listings:", error);
    throw error;
  }
}
