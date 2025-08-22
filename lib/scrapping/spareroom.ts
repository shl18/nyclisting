import axios from "axios";
import * as cheerio from "cheerio";
import { Listing } from "@/types/listing";
import { storeListings, createListingSchema } from "@/lib/listings";
import { z } from "zod";

const BASE_URL = "https://www.spareroom.com/roommate/";
const ITEMS_PER_PAGE = 10; // SpareRoom shows 10 items per page
const MAX_PAGES = 10;
const PLACEHOLDER_IMAGE_URL =
  "https://placehold.co/600x400/e2e8f0/1e293b?text=No+Image+Available";

async function getListingCoordinates(
  listingUrl: string
): Promise<{ latitude: number; longitude: number } | null> {
  try {
    const { data } = await axios.get(listingUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; ScraperBot/1.0)",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });

    const $ = cheerio.load(data);

    const scripts = $("script")
      .map((_, el) => $(el).html())
      .get();

    for (const script of scripts) {
      if (script) {
        const latMatch = script.match(/latitude["\s:]+([\d.-]+)/);
        const lngMatch = script.match(/longitude["\s:]+([\d.-]+)/);

        if (latMatch && lngMatch) {
          return {
            latitude: parseFloat(latMatch[1]),
            longitude: parseFloat(lngMatch[1]),
          };
        }
      }
    }

    return null;
  } catch (error) {
    console.error(`Error fetching coordinates for ${listingUrl}:`, error);
    return null;
  }
}

export async function scrapeSpareRoom(): Promise<Listing[]> {
  const listings: z.infer<typeof createListingSchema>[] = [];
  let totalListingsScraped = 0;
  const seenImageUrls = new Set<string>(); // Track unique image URLs

  for (let page = 0; page < MAX_PAGES; page++) {
    const offset = page * ITEMS_PER_PAGE;
    const pageURL = `${BASE_URL}?offset=${offset}&search_id=500076765418&sort_by=by_day&mode=list`;
    console.log(`Scraping offset ${offset} (page ${page + 1})...`);

    try {
      const { data } = await axios.get(pageURL, {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; ScraperBot/1.0)",
        },
      });

      const $ = cheerio.load(data);
      let listingsOnPage = 0;
      let duplicatesOnPage = 0;
      const pageListings: z.infer<typeof createListingSchema>[] = [];

      for (const el of $(".listing-card").get()) {
        const title = $(el).find("h2.listing-card__title").text().trim();
        const priceText = $(el)
          .find("p.listing-card__price")
          .text()
          .trim()
          .replace(/\s+/g, " ");
        const room = $(el)
          .find("span.listing-card__room.offered")
          .text()
          .trim();
        const location = $(el).find("p.listing-card__location").text().trim();
        const relativeLink = $(el).find("a.listing-card__link").attr("href");
        const imagePath = $(el)
          .find("img.listing-card__main-image")
          .attr("src");

        // Extract price as a number
        const priceMatch = priceText.match(/\$([\d,]+)/);
        const price = priceMatch
          ? parseInt(priceMatch[1].replace(/,/g, ""))
          : 0;

        // Extract bedrooms from room text
        const bedroomMatch = room.match(/(\d+)\s*rooms?/i);
        const bedrooms = bedroomMatch ? parseInt(bedroomMatch[1]) : 1;

        const listingUrl = relativeLink
          ? `https://www.spareroom.com${relativeLink}`
          : "";
        const imageUrl = imagePath ? `https:${imagePath}` : "";

        // Skip if we've seen this image URL before
        if (imageUrl && seenImageUrls.has(imageUrl)) {
          console.log(`Skipping duplicate listing with image URL: ${imageUrl}`);
          duplicatesOnPage++;
          continue;
        }

        if (title && listingUrl) {
          // Add image URL to seen set
          if (imageUrl) {
            seenImageUrls.add(imageUrl);
          }

          // Extract flatshare_id from URL to ensure uniqueness
          const flatshareIdMatch = listingUrl.match(/flatshare_id=(\d+)/);
          const searchIdMatch = listingUrl.match(/search_id=(\d+)/);
          const searchId = searchIdMatch ? searchIdMatch[1] : "500076765418";

          // Create a unique URL that includes both flatshare_id and search_id
          const baseUrl = flatshareIdMatch
            ? `https://www.spareroom.com/roommate/room_for_rent.pl?flatshare_id=${flatshareIdMatch[1]}&search_id=${searchId}&page=${page}`
            : listingUrl;

          const coordinates = await getListingCoordinates(baseUrl);

          const listing = {
            title,
            price,
            bedrooms,
            bathrooms: 1,
            listingUrl: baseUrl,
            imageUrls: [imageUrl || PLACEHOLDER_IMAGE_URL],
            address: location,
            city: "New York",
            source: "SPAREROOM" as const,
            neighborhood: location.split("(")[0].trim(),
            latitude: coordinates?.latitude || null,
            longitude: coordinates?.longitude || null,
          };

          const validationResult = createListingSchema.safeParse(listing);
          if (!validationResult.success) {
            console.error("Invalid listing:", listing);
            console.error("Validation errors:", validationResult.error.errors);
            continue;
          }

          pageListings.push(validationResult.data);
          listingsOnPage++;
        }
      }

      console.log(
        `Found ${listingsOnPage} unique listings and ${duplicatesOnPage} duplicates on page ${page}`
      );
      listings.push(...pageListings);
      totalListingsScraped += listingsOnPage;

      if (listingsOnPage === 0) {
        console.log(`No new listings found on page ${page}, stopping.`);
        break;
      }
    } catch (error) {
      console.error(`Error scraping page ${page}:`, error);
      break;
    }
  }

  console.log(`Total unique listings scraped: ${totalListingsScraped}`);
  console.log(`Total unique image URLs found: ${seenImageUrls.size}`);

  if (listings.length === 0) {
    throw new Error("No valid listings found after validation");
  }

  // Store listings in the database
  console.log("Storing listings in database...");
  await storeListings(listings);
  console.log("Listings stored successfully");

  // Return the listings for immediate display
  return listings.map((listing) => ({
    title: listing.title,
    price: `$${listing.price.toLocaleString()}`,
    address: listing.address,
    bedrooms: listing.bedrooms || 1,
    bathrooms: listing.bathrooms || 1,
    imageUrl: listing.imageUrls[0],
    url: listing.listingUrl,
    description: listing.description,
    sqft: listing.sqft,
    neighborhood: listing.neighborhood,
    city: listing.city,
    source: listing.source,
    latitude: listing.latitude ?? undefined,
    longitude: listing.longitude ?? undefined,
  }));
}

scrapeSpareRoom();
