import { NextResponse } from "next/server";
import { db } from "@/db";
import { agents, listings } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    // Get the ID from the URL
    const url = new URL(request.url);
    const id = url.pathname.split("/").pop();

    if (!id) {
      return NextResponse.json(
        { error: "Listing ID is required" },
        { status: 400 }
      );
    }

    // Fetch the listing data from the database
    const [listing] = await db
      .select()
      .from(listings)
      .where(eq(listings.id, id));

    if (!listing) {
      return NextResponse.json(
        { error: "Listing not found", id },
        { status: 404 }
      );
    }

    // Validate required fields
    if (!listing.address) {
      console.error("Listing missing address:", listing.id);
    }

    if (!listing.latitude || !listing.longitude) {
      console.warn("Listing missing coordinates:", listing.id);
    }

    // Fetch agent information if available
    let agentInfo = null;

    if (listing.agentId) {
      try {
        const [agent] = await db
          .select({
            name: agents.name,
            phone: agents.phone,
            logoUrl: agents.logoUrl,
            website: agents.website,
          })
          .from(agents)
          .where(eq(agents.id, listing.agentId));

        if (agent && agent.name !== "Unknown Agent") {
          agentInfo = {
            name: agent.name,
            phone: agent.phone || "",
            image: agent.logoUrl || "",
            website: agent.website || undefined,
          };
        }
      } catch (error) {
        console.error("Error fetching agent:", error);
        // Continue without agent info
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
          "/placeholder-property.jpg",
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
          title: "Unit Features",
          items:
            listing.amenities?.filter((a) => {
              const amenity = a.toLowerCase();
              return (
                amenity === "furnished" ||
                amenity === "balcony" ||
                amenity === "livingroom" ||
                amenity === "disabledaccess"
              );
            }) || [],
        },
        {
          title: "Building Features",
          items:
            listing.amenities?.filter((a) => {
              const amenity = a.toLowerCase();
              return (
                amenity === "wifi" ||
                amenity === "broadband" ||
                amenity === "internet" ||
                amenity === "parking" ||
                amenity === "doorman" ||
                amenity === "gym"
              );
            }) || [],
        },
        {
          title: "Other Features",
          items:
            listing.amenities?.filter((a) => {
              const amenity = a.toLowerCase();
              return !(
                amenity === "furnished" ||
                amenity === "balcony" ||
                amenity === "livingroom" ||
                amenity === "disabledaccess" ||
                amenity === "wifi" ||
                amenity === "broadband" ||
                amenity === "internet" ||
                amenity === "parking" ||
                amenity === "doorman" ||
                amenity === "gym"
              );
            }) || [],
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
      agents: [
        {
          name: agentInfo?.name || "Unknown Agent",
          title: "Licensed Real Estate Agent",
          company: listing.source || "Unknown",
          phone: agentInfo?.phone || "",
          image: agentInfo?.image || "",
          website: agentInfo?.website || undefined,
        },
      ],
      latitude: listing.latitude || 40.7128,
      longitude: listing.longitude || -74.006,
      mapImageUrl: "",
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
