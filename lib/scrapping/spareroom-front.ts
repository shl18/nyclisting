import puppeteer from "puppeteer";
import * as cheerio from "cheerio";
import { db } from "@/db";
import { listings } from "@/db/schema";
import { eq, isNull, and, or, sql } from "drizzle-orm";
import { agents } from "@/db/schema";
import { uploadImagesToStorage } from "@/lib/storage";
import { createId } from "@paralleldrive/cuid2";
import fs from "fs";

const PLACEHOLDER_IMAGE_URL =
  "https://placehold.co/600x400/e2e8f0/1e293b?text=No+Image+Available";

interface ListingData {
  description: string;
  amenities: string[];
  url: string;
  id: string;
  imageUrls: string[];
  agent: {
    name: string;
    profession: string | null;
    logoUrl: string | null;
  } | null;
  contactUrl?: string;
  noFee: boolean;
}

const randomDelay = (min: number, max: number) => {
  const delay = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise((resolve) => setTimeout(resolve, delay));
};

const userAgents = [
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3.1 Safari/605.1.15",
];

function getBrowserPath(): string {
  if (process.env.PUPPETEER_EXECUTABLE_PATH) {
    return process.env.PUPPETEER_EXECUTABLE_PATH;
  }
  if (fs.existsSync("/usr/bin/google-chrome")) return "/usr/bin/google-chrome";
  if (fs.existsSync("/usr/bin/chromium-browser"))
    return "/usr/bin/chromium-browser";
  if (fs.existsSync("/usr/bin/chromium")) return "/usr/bin/chromium";
  if (process.platform === "darwin") {
    return "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
  }
  return "";
}

async function scrapeSpareRoomWithPuppeteer(url: string): Promise<ListingData> {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: getBrowserPath(),
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-web-security",
      "--disable-features=VizDisplayCompositor",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--no-first-run",
      "--disable-blink-features=AutomationControlled",
      "--window-size=1280,800",
    ],
    timeout: 60000,
  });

  const page = await browser.newPage();

  // Advanced anti-bot evasion
  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, "webdriver", { get: () => undefined });
    (window as any).chrome = { runtime: {} };
    Object.defineProperty(navigator, "languages", {
      get: () => ["en-US", "en"],
    });
    Object.defineProperty(navigator, "plugins", { get: () => [1, 2, 3, 4, 5] });
  });
  await page.setRequestInterception(true);
  page.on("request", (req) => {
    if (["image", "stylesheet", "font", "media"].includes(req.resourceType())) {
      req.abort();
    } else {
      req.continue();
    }
  });
  // Randomize viewport
  const width = 1280 + Math.floor(Math.random() * 40);
  const height = 800 + Math.floor(Math.random() * 20);
  await page.setViewport({ width, height });

  // Set a random user agent
  const randomUserAgent =
    userAgents[Math.floor(Math.random() * userAgents.length)];
  await page.setUserAgent(randomUserAgent);

  await page.setExtraHTTPHeaders({
    "Accept-Language": "en-US,en;q=0.9",
  });

  try {
    let retryCount = 0;
    const maxRetries = 2;
    let success = false;

    while (retryCount < maxRetries && !success) {
      try {
        await randomDelay(2000, 5000);
        await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });
        await page.waitForSelector("body", { timeout: 10000 });
        success = true;
      } catch (error) {
        retryCount++;
        console.log(`Navigation retry ${retryCount} failed for ${url}`);
        if (retryCount === maxRetries) {
          // Save HTML on any navigation error
          console.error(`Navigation error on ${url}:`, error);
          const html = await page.content();
          const htmlPath = `navigation-error-${Date.now()}.html`;
          require("fs").writeFileSync(htmlPath, html);
          console.error(`Saved error HTML to ${htmlPath}`);
          throw error;
        }
        await randomDelay(3000, 8000);
      }
    }

    // Wait for the content to load
    await page
      .waitForSelector(".feature--amenities, .description, .gallery__image", {
        timeout: 10000,
      })
      .catch(() => console.log("Content not found, continuing anyway..."));

    const html = await page.content();
    const $ = cheerio.load(html);

    const agentName = $(".profile-photo__name").text().trim();
    const agentProfession = $(".profile-photo__name + em").text().trim();

    let agentLogoUrl = null;
    const profilePhoto = $(".profile-photo.advert-details__profile-photo").attr(
      "src"
    );
    const logo = $(".profile_logo").attr("src");

    // Convert relative URL to absolute URL
    const getAbsoluteUrl = (relativeUrl: string | undefined) => {
      if (!relativeUrl) return null;
      if (relativeUrl.startsWith("http")) return relativeUrl;
      if (relativeUrl.startsWith("//")) return `https:${relativeUrl}`;
      return `https://www.spareroom.com${
        relativeUrl.startsWith("/") ? "" : "/"
      }${relativeUrl}`;
    };

    agentLogoUrl = getAbsoluteUrl(logo) || getAbsoluteUrl(profilePhoto);

    const agent = agentName
      ? {
          name: agentName,
          profession: agentProfession || null,
          logoUrl: agentLogoUrl,
        }
      : null;

    // Check for no fees
    const noFee =
      $('.feature--extra-cost .feature-list__key:contains("Fees apply?")')
        .next(".feature-list__value")
        .text()
        .trim()
        .toLowerCase() === "no";

    // Extract description
    let description = "";
    const descriptionSection = $(".description, .detaildesc");
    if (descriptionSection.length > 0) {
      description = descriptionSection
        .map((_, el) => {
          const text = $(el)
            .text()
            .trim()
            .replace(/\s+/g, " ")
            .replace(/\n+/g, "\n")
            .replace(/<br>/g, "\n")
            .replace(/&amp;/g, "&")
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">");
          return text;
        })
        .get()
        .join("\n\n");
    }

    // If still no description, try finding any text content that might be a description
    if (!description) {
      const possibleDescription = $("p, div")
        .filter((_, el) => {
          const text = $(el).text().trim();
          return (
            text.length > 100 &&
            (text.includes("bedroom") || text.includes("room"))
          );
        })
        .first()
        .text()
        .trim();

      if (possibleDescription) {
        description = possibleDescription;
      } else {
        const title = $("h1").first().text().trim();
        description = `No detailed description available for ${title}. Property listing available at: ${url}`;
      }
    }

    // Clean up the description
    description = description.replace(/\s+/g, " ").replace(/\n+/g, "\n").trim();

    // Extract amenities
    const amenities: string[] = [];
    const amenitiesSection = $(".feature--amenities");

    if (amenitiesSection.length > 0) {
      amenitiesSection.find(".feature-list__key").each((_, el) => {
        const key = $(el).text().trim();
        const value = $(el).next(".feature-list__value").text().trim();

        // Only add amenities that are available (not marked with "No")
        if (!value.includes("No")) {
          // Normalize the key to handle various formats
          let normalizedKey = key
            .toLowerCase()
            .replace(/\s+/g, "")
            .replace(/[^a-zA-Z0-9]/g, "");

          // Handle special cases
          if (
            normalizedKey.includes("furnishings") ||
            normalizedKey.includes("furnished")
          )
            normalizedKey = "furnished";
          if (normalizedKey.includes("balcony")) normalizedKey = "balcony";
          if (normalizedKey.includes("disabledaccess"))
            normalizedKey = "disabledaccess";
          if (normalizedKey.includes("livingroom"))
            normalizedKey = "livingroom";
          if (
            normalizedKey.includes("broadband") ||
            normalizedKey.includes("wifi") ||
            normalizedKey.includes("internet")
          )
            normalizedKey = "wifi";
          if (normalizedKey.includes("parking")) normalizedKey = "parking";
          if (normalizedKey.includes("doorman")) normalizedKey = "doorman";
          if (
            normalizedKey.includes("gym") ||
            normalizedKey.includes("fitness")
          )
            normalizedKey = "gym";

          // Only add if not already present
          if (!amenities.includes(normalizedKey)) {
            amenities.push(normalizedKey);
          }
        }
      });
    }

    // Extract image URLs (large images)
    const imageUrls: string[] = [];

    // Main image (large)
    const mainImage =
      $(".photo-gallery__main-image-wrapper a").attr("href") ||
      $(".photo-gallery__main-image-wrapper a").attr("data-src");
    if (mainImage && mainImage.startsWith("http")) {
      imageUrls.push(mainImage);
    }

    // Thumbnails (large)
    $(".photo-gallery__thumbnails a").each((_, el) => {
      const href = $(el).attr("href") || $(el).attr("data-src");
      if (href && href.startsWith("http") && !imageUrls.includes(href)) {
        imageUrls.push(href);
      }
    });

    // Fallback: If no images found, try all images as before
    if (imageUrls.length === 0) {
      $("img").each((_, el) => {
        const src = $(el).attr("src") || $(el).attr("data-src");
        if (
          src &&
          src.startsWith("http") &&
          !src.includes("logo") &&
          !src.includes("icon") &&
          !src.includes("avatar") &&
          !imageUrls.includes(src)
        ) {
          imageUrls.push(src);
        }
      });
    }

    // Remove duplicates and filter out non-listing images
    const uniqueImageUrls = [...new Set(imageUrls)].filter(
      (url) =>
        !url.includes("logo") &&
        !url.includes("icon") &&
        !url.includes("avatar") &&
        url.match(/\.(jpg|jpeg|png|webp)/i)
    );

    // Check for existing listings with the same image URLs
    const existingListings = await db
      .select()
      .from(listings)
      .where(
        or(
          ...uniqueImageUrls.map(
            (url) => sql`${listings.imageUrls} @> ARRAY[${url}]::text[]`
          )
        )
      );

    // Filter out image URLs that already exist in other listings
    const finalImageUrls = uniqueImageUrls.filter(
      (url) =>
        !existingListings.some((listing) => listing.imageUrls.includes(url))
    );

    // If no images found, use placeholder
    if (finalImageUrls.length === 0) {
      finalImageUrls.push(PLACEHOLDER_IMAGE_URL);
    }

    // Extract contact URL
    const contactUrl = $(
      'a.button.button--wide[title="Email advertiser"]'
    ).attr("href");
    let absoluteContactUrl = null;
    if (contactUrl) {
      absoluteContactUrl = getAbsoluteUrl(contactUrl);
    }

    await browser.close();
    return {
      description,
      amenities,
      url,
      id: "",
      imageUrls: finalImageUrls,
      agent,
      contactUrl: absoluteContactUrl || undefined,
      noFee,
    };
  } catch (error) {
    await browser.close();
    console.error(` Failed scraping: ${url}`, error);
    throw error;
  }
}

async function processEmptyDescriptions() {
  try {
    // Get listings with empty descriptions

    const emptyListings = await db
      .select()
      .from(listings)
      .where(
        and(
          eq(listings.source, "SPAREROOM"),
          or(isNull(listings.description), eq(listings.supabaseImageUrls, []))
        )
      );

    console.log(
      `Found ${emptyListings.length} listings with empty descriptions`
    );

    for (const listing of emptyListings) {
      let retryCount = 0;
      const maxRetries = 3;
      let updated = false;

      while (retryCount < maxRetries && !updated) {
        try {
          await randomDelay(4000, 8000);
          const scraped = await scrapeSpareRoomWithPuppeteer(
            listing.listingUrl
          );

          // Upload images to Supabase storage
          const supabaseImageUrls = await uploadImagesToStorage(
            scraped.imageUrls,
            listing.id
          );

          // Handle agent information
          let agentId = listing.agentId;
          if (scraped.agent && !agentId) {
            try {
              // Extract source agent ID from the URL or listing data
              const sourceAgentId = scraped.agent.name
                .toLowerCase()
                .replace(/\s+/g, "-");

              // First try to find existing agent by name and source
              const existingAgents = await db
                .select()
                .from(agents)
                .where(
                  and(
                    eq(agents.name, scraped.agent.name),
                    eq(agents.source, "SPAREROOM")
                  )
                );

              if (existingAgents.length > 0) {
                // Use the first existing agent
                const existingAgent = existingAgents[0];

                // Update existing agent with new information
                const [updatedAgent] = await db
                  .update(agents)
                  .set({
                    profession: scraped.agent.profession,
                    logoUrl: scraped.agent.logoUrl,
                    sourceAgentId: sourceAgentId,
                    updatedAt: new Date(),
                    website: scraped.contactUrl,
                  })
                  .where(eq(agents.id, existingAgent.id))
                  .returning();

                agentId = updatedAgent.id;
                console.log(
                  `Updated existing agent: ${agentId} with source ID: ${sourceAgentId}`
                );
              } else {
                // Create new agent - let the database generate the ID
                const [newAgent] = await db
                  .insert(agents)
                  .values({
                    id: createId(),
                    name: scraped.agent.name,
                    profession: scraped.agent.profession,
                    logoUrl: scraped.agent.logoUrl,
                    source: "SPAREROOM",
                    sourceAgentId: sourceAgentId,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    website: scraped.contactUrl,
                  })
                  .returning();

                if (newAgent) {
                  agentId = newAgent.id;
                  console.log(
                    `Created new agent: ${agentId} with source ID: ${sourceAgentId}`
                  );
                }
              }
            } catch (agentError: any) {
              if (agentError.code === "23505") {
                // Duplicate key violation - try to find the existing agent
                const existingAgents = await db
                  .select()
                  .from(agents)
                  .where(
                    and(
                      eq(agents.name, scraped.agent.name),
                      eq(agents.source, "SPAREROOM")
                    )
                  );

                if (existingAgents.length > 0) {
                  agentId = existingAgents[0].id;
                  console.log(
                    `Found existing agent after conflict: ${agentId}`
                  );
                } else {
                  console.error(
                    "Failed to handle agent after conflict:",
                    agentError
                  );
                  agentId = null;
                }
              } else {
                console.error("Error handling agent:", agentError);
                agentId = null;
              }
            }
          }

          // Update listing with only supabaseImageUrls
          await db
            .update(listings)
            .set({
              description: scraped.description,
              amenities: scraped.amenities,
              supabaseImageUrls: supabaseImageUrls,
              agentId: agentId,
              updatedAt: new Date(),
              noFee: scraped.noFee,
            })
            .where(eq(listings.id, listing.id));

          console.log(
            `Updated listing ${listing.id} with ${
              supabaseImageUrls.length
            } images${agentId ? ` and agent ${agentId}` : ""}`
          );
          updated = true;
        } catch (err) {
          retryCount++;
          console.error(
            `Retry ${retryCount}/${maxRetries} failed for ${listing.id}:`,
            err
          );

          if (retryCount === maxRetries) {
            await db
              .update(listings)
              .set({
                description: `Unable to fetch description. Listing: ${listing.listingUrl}`,
                updatedAt: new Date(),
              })
              .where(eq(listings.id, listing.id));
            console.error(`Gave up on ${listing.id}`);
          }

          await randomDelay(10000, 20000);
        }
      }
    }
  } catch (err) {
    console.error("Fatal error in processing listings:", err);
  }
}

processEmptyDescriptions();

// cron.schedule("0 */6 * * *", async () => {
//   console.log(
//     " Running SpareRoom description updater:",
//     new Date().toISOString()
//   );
//   await processEmptyDescriptions();
// });

export { scrapeSpareRoomWithPuppeteer, processEmptyDescriptions };
