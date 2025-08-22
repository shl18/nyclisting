import { Listing } from "@/types/listing";
import { storeListings, createListingSchema } from "@/lib/listings";
import { z } from "zod";
import { PLACEHOLDER_IMAGE_URL } from "@/lib/constants";

export async function scrapeStreetEasy(): Promise<Listing[]> {
  const url = "https://api-v6.streeteasy.com/";

  const headers = {
    accept: "application/json",
    "accept-language": "en-US,en;q=0.9,hi;q=0.8",
    "apollographql-client-name": "srp-frontend-service",
    "apollographql-client-version": "1e7699159c9bb39eabfca0d0bed53751f8a3d2a9",
    "app-version": "1.0.0",
    authorization: "-7B7zzQdKyxVPjcfyLcRiw",
    "content-type": "application/json",
    origin: "https://streeteasy.com",
    os: "web",
    referer: "https://streeteasy.com/",
    "user-agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36",
    "x-forwarded-proto": "https",
  };
  const body = {
    query: `
      query GetListingRental($input: SearchRentalsInput!) {
        searchRentals(input: $input) {
          search {
            criteria
          }
          totalCount
          edges {
            ... on OrganicRentalEdge {
              node {
                id
                areaName
                bedroomCount
                buildingType
                fullBathroomCount
                geoPoint {
                  latitude
                  longitude
                }
                halfBathroomCount
                noFee
                leadMedia {
                  photo {
                    key
                  }
                }
                price
                relloExpress {
                  ctaEnabled
                  link
                  rentalId
                }
                sourceGroupLabel
                status
                street
                unit
                urlPath
              }
            }
          }
        }
      }
    `,
    variables: {
      input: {
        filters: {
          rentalStatus: "ACTIVE",
          areas: [100, 1000000, 200, 300, 400, 500], //empty array
        },
        page: 1,
        perPage: 100,
        sorting: {
          attribute: "RECOMMENDED",
          direction: "DESCENDING",
        },
        userSearchToken: "332ae56a-4e08-409a-bb46-7066a7594aff",
        adStrategy: "NONE",
      },
    },
  };

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch: ${res.statusText}`);
  }

  const json = await res.json();

  const listings = json.data.searchRentals.edges
    .map((edge: any) => {
      const photoKey = edge.node.leadMedia?.photo?.key;
      const listing = {
        title: edge.node.areaName || "No Title",
        price: Number(edge.node.price),
        address: edge.node.street || "No Address",
        bedrooms: Number(edge.node.bedroomCount || 0),
        bathrooms: Number(edge.node.fullBathroomCount || 0),
        imageUrls: photoKey
          ? [`https://photos.zillowstatic.com/fp/${photoKey}-p_e.webp`]
          : [PLACEHOLDER_IMAGE_URL],
        listingUrl: `https://streeteasy.com${edge.node.urlPath}`,
        city: "New York",
        source: "STREETEASY" as const,
        latitude: edge.node.geoPoint?.latitude
          ? Number(edge.node.geoPoint.latitude)
          : undefined,
        longitude: edge.node.geoPoint?.longitude
          ? Number(edge.node.geoPoint.longitude)
          : undefined,
      };

      // Validate each listing before adding to array
      const validationResult = createListingSchema.safeParse(listing);
      if (!validationResult.success) {
        console.error("Invalid listing:", listing);
        console.error("Validation errors:", validationResult.error.errors);
        return null;
      }

      return validationResult.data;
    })
    .filter(Boolean); // Remove any null entries from failed validation

  if (listings.length === 0) {
    throw new Error("No valid listings found after validation");
  }

  // Store listings in the database
  console.log("Storing listings:", JSON.stringify(listings, null, 2));
  await storeListings(listings);

  // Return the listings for immediate display
  return listings.map((listing: z.infer<typeof createListingSchema>) => ({
    ...listing,
    price: `$${listing.price.toLocaleString()}`,
    imageUrl: listing.imageUrls[0],
    url: listing.listingUrl,
  }));
}

scrapeStreetEasy();
