import { NextResponse } from "next/server";
import { db } from "@/db";
import { listings } from "@/db/schema";
import { desc, eq, and, sql, or, ilike, asc } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const source = searchParams.get("source") as
      | "SPAREROOM"
      | "STREETEASY"
      | null;
    const city = searchParams.get("city");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const bedrooms = searchParams.get("bedrooms");
    const bathrooms = searchParams.get("bathrooms");
    const search = searchParams.get("search");
    const sort = searchParams.get("sort") || "newest";
    const amenities = searchParams.get("amenities")?.split(",") || [];
    const noBrokerFee = searchParams.get("noBrokerFee") === "true";

    const offset = (page - 1) * limit;

    // Build the where clause based on filters
    const conditions = [];
    if (source) {
      conditions.push(eq(listings.source, source));
    }
    if (city) {
      conditions.push(eq(listings.city, city));
    }
    if (minPrice) {
      conditions.push(sql`${listings.price} >= ${parseInt(minPrice)}`);
    }
    if (maxPrice) {
      conditions.push(sql`${listings.price} <= ${parseInt(maxPrice)}`);
    }
    if (bedrooms) {
      conditions.push(eq(listings.bedrooms, parseInt(bedrooms)));
    }
    if (bathrooms) {
      conditions.push(eq(listings.bathrooms, parseInt(bathrooms)));
    }
    if (search) {
      conditions.push(
        or(
          ilike(listings.title, `%${search}%`),
          ilike(listings.address, `%${search}%`),
          ilike(listings.neighborhood || "", `%${search}%`)
        )
      );
    }
    if (amenities.length > 0) {
      // Convert amenities array to match the database format
      const normalizedAmenities = amenities.map((a) => {
        // Normalize the amenity name
        let normalized = a.trim();

        // Handle special cases
        if (
          normalized.toLowerCase().includes("furnishings") ||
          normalized.toLowerCase().includes("furnished")
        )
          normalized = "Furnishings: Unfurnished";
        if (normalized.toLowerCase().includes("balcony"))
          normalized = "Balcony: Yes";
        if (
          normalized.toLowerCase().includes("disabledaccess") ||
          normalized.toLowerCase().includes("disabled access")
        )
          normalized = "Disabled access: Yes";
        if (
          normalized.toLowerCase().includes("livingroom") ||
          normalized.toLowerCase().includes("living room")
        )
          normalized = "Living room: shared";
        if (
          normalized.toLowerCase().includes("broadband") ||
          normalized.toLowerCase().includes("wifi") ||
          normalized.toLowerCase().includes("internet")
        )
          normalized = "Broadband included: Yes";
        if (normalized.toLowerCase().includes("parking"))
          normalized = "Parking: Yes";
        if (normalized.toLowerCase().includes("concierge"))
          normalized = "Concierge: Yes";
        if (normalized.toLowerCase().includes("doorman"))
          normalized = "Doorman: Yes";
        if (normalized.toLowerCase().includes("elevator"))
          normalized = "Elevator: Yes";
        if (
          normalized.toLowerCase().includes("storagespace") ||
          normalized.toLowerCase().includes("storage space")
        )
          normalized = "Storage space: Yes";
        if (
          normalized.toLowerCase().includes("yard") ||
          normalized.toLowerCase().includes("patio")
        )
          normalized = "Yard/patio: Yes";

        return normalized;
      });

      // Create a SQL condition that checks if any of the normalized amenities exist in the database array
      const amenitiesArray = `{${normalizedAmenities
        .map((a) => `"${a}"`)
        .join(",")}}`;
      conditions.push(sql`${listings.amenities} && ${amenitiesArray}::text[]`);
    }
    if (noBrokerFee) {
      conditions.push(
        or(eq(listings.source, "SPAREROOM"), eq(listings.noFee, true))
      );
    }

    // Add condition to filter out listings with null agentId
    conditions.push(sql`${listings.agentId} IS NOT NULL`);

    const whereClause = conditions.length > 0 ? and(...conditions) : sql`1=1`;

    // Get total count for pagination
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(listings)
      .where(whereClause);

    // Get the listings with pagination
    const results = await db
      .select()
      .from(listings)
      .where(whereClause)
      .orderBy(
        sort === "price_asc"
          ? asc(listings.price)
          : sort === "price_desc"
          ? desc(listings.price)
          : desc(listings.createdAt)
      )
      .limit(limit)
      .offset(offset);

    return NextResponse.json({
      listings: results,
      total: count,
      page,
      limit,
    });
  } catch (error) {
    console.error("Error fetching listings:", error);
    return NextResponse.json(
      { error: "Failed to fetch listings" },
      { status: 500 }
    );
  }
}
