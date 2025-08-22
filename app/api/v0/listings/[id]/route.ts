import { NextResponse } from "next/server";
import { db } from "@/db";
import { listings, agents, listingSourceEnum } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { PLACEHOLDER_IMAGE_URL } from "@/lib/constants";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await the params Promise in Next.js 15
    const { id } = await params;

    // Get the listing
    const [listing] = await db
      .select()
      .from(listings)
      .where(eq(listings.id, id));

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    // Get similar listings with the same address
    const similarListings = await db
      .select()
      .from(listings)
      .where(
        and(
          eq(listings.address, listing.address),
          sql`${listings.id} != ${listing.id}`
        )
      );

    // Filter similar listings to only include those with valid agents
    const validSimilarListings = await Promise.all(
      similarListings.map(async (similarListing) => {
        if (!similarListing.agentId) return null;

        const [agent] = await db
          .select()
          .from(agents)
          .where(eq(agents.id, similarListing.agentId));

        if (!agent || agent.name === "Unknown Agent") return null;

        return similarListing;
      })
    );

    // Remove null values from the filtered list and ensure type safety
    const filteredSimilarListings = validSimilarListings
      .filter(
        (listing): listing is NonNullable<typeof listing> => listing !== null
      )
      // Sort by price in descending order (higher to lower)
      .sort((a, b) => (b.price || 0) - (a.price || 0));

    // Get the agent if available
    let agentInfo = null;

    if (listing.agentId) {
      const [agent] = await db
        .select()
        .from(agents)
        .where(eq(agents.id, listing.agentId));

      if (agent && agent.name !== "Unknown Agent") {
        agentInfo = {
          name: agent.name,
          title: agent.profession || "Licensed Real Estate Agent",
          company: agent.company || "",
          phone: agent.phone || "",
          image: agent.logoUrl || "/placeholder-agent.jpg",
          website: agent.website || "",
        };
      }
    }

    // If no valid agent is found, return 404
    if (!agentInfo) {
      return NextResponse.json(
        { error: "Listing not available - no valid agent" },
        { status: 404 }
      );
    }

    // Transform the data to match our PropertyData interface
    const propertyData = {
      id: listing.id,
      address: listing.address || "Address not available",
      location: {
        neighborhood: listing.neighborhood || "Unknown",
        city: listing.city || "New York",
      },
      price: listing.price || 0,
      forRent: true,
      noFees: listing.description?.toLowerCase().includes("no fees") || false,
      features: {
        rooms: listing.bedrooms || 1,
        beds: listing.bedrooms || 1,
        bathrooms: listing.bathrooms || 1,
        hasWifi:
          listing.amenities?.some((a) => a.toLowerCase().includes("wifi")) ||
          false,
        pricePerSqFt: 0,
        area: listing.sqft || 0,
      },
      images: {
        main:
          listing.supabaseImageUrls?.[0] ||
          listing.imageUrls?.[0] ||
          PLACEHOLDER_IMAGE_URL,
        thumbnails: [
          ...(listing.supabaseImageUrls?.slice(1) || []),
          ...(listing.imageUrls || []),
        ].filter(Boolean),
        all: [
          ...(listing.supabaseImageUrls || []),
          ...(listing.imageUrls || []),
        ].filter(Boolean),
      },
      amenities: [
        {
          title: "Features",
          items: listing.amenities || [],
        },
      ],
      priceHistory: [
        {
          date: listing.createdAt
            ? new Date(listing.createdAt).toLocaleDateString()
            : new Date().toLocaleDateString(),
          price: `$${(listing.price || 0).toLocaleString()}`,
          event: "Listed",
        },
      ],
      description: listing.description || "No description available",
      agents: agentInfo ? [agentInfo] : [],
      latitude: listing.latitude || 40.7128,
      longitude: listing.longitude || -74.006,
      mapImageUrl: "",
      source: listing.source,
      listing_url: listing.listingUrl,
      duplicatePrices: filteredSimilarListings.map((similar) => ({
        price: similar.price,
        address: similar.address,
        url: `/individuallisting/${similar.id}`,
      })),
    };

    return NextResponse.json(propertyData);
  } catch (error) {
    console.error("Error fetching listing:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch listing",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
