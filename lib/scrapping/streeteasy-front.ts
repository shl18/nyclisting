import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { db } from "@/db";
import { listings, agents } from "@/db/schema";
import { eq, isNull, and, or } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";
import { formatImageUrls } from "../utils/image-format";
import fs from "fs";

puppeteer.use(StealthPlugin());

interface ScrapedData {
  description: string;
  amenities: string[];
  imageUrls: string[];
  url: string;
  noFee: boolean;
  agent?: {
    name: string;
    company: string;
    sourceAgentId: string;
    website?: string;
    phone?: string;
    logoUrl?: string;
    profession?: string;
  };
}

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

async function scrapeListing(url: string): Promise<ScrapedData> {
  console.log("🧭 Launching browser...");
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
      "--disable-images",
      "--window-size=1280,800",
    ],
    defaultViewport: { width: 1280, height: 800 },
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

  // More realistic user agent
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
  );

  // Randomize viewport
  const width = 1280 + Math.floor(Math.random() * 40);
  const height = 800 + Math.floor(Math.random() * 20);
  await page.setViewport({ width, height });

  // Improved request interception
  await page.setRequestInterception(true);
  page.on("request", (req) => {
    if (["image", "stylesheet", "font", "media"].includes(req.resourceType())) {
      req.abort();
    } else {
      req.continue();
    }
  });

  // Set more realistic headers
  await page.setExtraHTTPHeaders({
    "Accept-Language": "en-US,en;q=0.9",
    Accept:
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "Accept-Encoding": "gzip, deflate, br",
    Connection: "keep-alive",
    "Upgrade-Insecure-Requests": "1",
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "none",
    "Sec-Fetch-User": "?1",
    "Cache-Control": "max-age=0",
  });

  try {
    console.log("🌐 Navigating to URL:", url);
    const response = await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });

    console.log(`📄 Response status: ${response?.status()}`);

    // Wait for page to settle
    await new Promise((resolve) =>
      setTimeout(resolve, Math.random() * 3000 + 2000)
    );

    // Handle bot detection
    const pageText = await page.evaluate(() => document.body?.innerText || "");
    const botDetectionPatterns = [
      "Press & Hold",
      "confirm you are human",
      "not a bot",
      "captcha",
      "cloudflare",
      "access denied",
      "blocked",
      "reference id",
    ];

    const isBotDetected = botDetectionPatterns.some((pattern) =>
      pageText.toLowerCase().includes(pattern)
    );

    if (isBotDetected) {
      console.log("🚫 Bot detection triggered!");
      // Save screenshot and HTML if bot detection
      await page.screenshot({ path: `bot-detected-${Date.now()}.png` });
      const html = await page.content();
      require("fs").writeFileSync(`bot-detected-${Date.now()}.html`, html);
      throw new Error("Bot detection triggered");
    }

    // Extract description
    let description = "";
    const aboutSelectors = [
      '[data-testid="about-section"]',
      ".AboutSection_title__3ERwx",
      ".ListingDescription_longDescription__vvBTw",
      ".detaildesc",
      '[class*="about"]',
      '[class*="description"]',
    ];

    // Check for no-fee pill
    const noFeeElement = await page.$('[data-testid="pill-noFee"]');
    const noFee = !!noFeeElement;

    for (const selector of aboutSelectors) {
      try {
        const element = await page.$(selector);
        if (element) {
          const text = await page.evaluate(
            (el) => el.textContent?.trim(),
            element
          );
          if (text && text.length > 10) {
            description = text.replace(/^About\s*/i, "");
            break;
          }
        }
      } catch (err) {
        console.log(`❌ Selector ${selector} failed:`, err);
      }
    }

    // If no description found with selectors, try finding elements containing "About" text
    if (!description) {
      try {
        const aboutElements = await page.$$("section, div, h2");
        for (const element of aboutElements) {
          const text = await page.evaluate(
            (el) => el.textContent?.trim(),
            element
          );
          if (
            text &&
            text.toLowerCase().includes("about") &&
            text.length > 10
          ) {
            description = text.replace(/^About\s*/i, "");
            break;
          }
        }
      } catch (err) {
        console.log('❌ Failed to find elements with "About" text:', err);
      }
    }

    // Extract amenities
    const amenities: string[] = [];
    const amenitySelectors = [
      '[data-testid="services-and-facilities-section"] ul li p',
      '[class*="amenities"] li',
      '[class*="features"] li',
      'ul:has-text("Amenities") li',
    ];

    for (const selector of amenitySelectors) {
      try {
        const elements = await page.$$(selector);
        for (const element of elements) {
          const text = await page.evaluate(
            (el) => el.textContent?.trim(),
            element
          );
          if (text && text.length > 0) {
            amenities.push(text);
          }
        }
        if (amenities.length > 0) break;
      } catch (err) {
        console.log(`❌ Amenity selector ${selector} failed:`, err);
      }
    }

    // Extract images
    const imageUrls: string[] = [];
    const imageSelectors = [
      '.MediaCarouselThumbs_thumbImage_No3MY[src*="zillowstatic.com"]',
      'img[src*="zillowstatic.com"]',
      'img[alt*="photo"]',
      'img[alt*="apartment"]',
      'img[alt*="building"]',
    ];

    for (const selector of imageSelectors) {
      try {
        const imgs = await page.$$eval(selector, (imgs) =>
          imgs
            .map((img) => (img as HTMLImageElement).src)
            .filter((src) => {
              // Filter out floor plans and map images
              return (
                src &&
                !src.includes("data:") &&
                !src.includes("floor-plan") &&
                !src.includes("maps.googleapis.com") &&
                !src.includes("pin.png") &&
                src.includes("zillowstatic.com")
              );
            })
        );
        if (imgs.length > 0) {
          imageUrls.push(...imgs);
          break;
        }
      } catch (err) {
        console.log(`❌ Image selector ${selector} failed:`, err);
      }
    }

    // Remove duplicates and ensure we only have actual photos
    const uniqueImageUrls = [...new Set(imageUrls)].filter(
      (url) =>
        url.includes("zillowstatic.com") &&
        !url.includes("floor-plan") &&
        !url.includes("maps.googleapis.com") &&
        !url.includes("pin.png")
    );

    // Format the image URLs to match the standard format with large dimensions
    const formattedImageUrls = formatImageUrls(uniqueImageUrls, {
      width: 800,
      height: 400,
    });

    // Extract agent information
    const agentData = await page.evaluate(() => {
      console.log("🔍 Starting agent data extraction...");

      // Try multiple selectors for agent name
      const nameSelectors = [
        ".AgentInfo_agentName__3ERwx",
        ".AgentInfo_name__3ERwx",
        ".AgentInfo_agentName__3ERwx a",
        ".AgentInfo_name__3ERwx a",
        "a[href*='/profile/']",
        ".text-action_brandColor_twufp",
        ".agent-name",
        ".listing-agent-name",
        "[data-testid='agent-name']",
        ".agent-info-name",
      ];

      let nameElement = null;
      for (const selector of nameSelectors) {
        const elements = document.querySelectorAll(selector);
        for (const element of elements) {
          // Check if this is likely the agent name (not a company name or other text)
          const text = element.textContent?.trim();
          if (
            text &&
            !text.includes("Street") &&
            !text.includes("Avenue") &&
            !text.includes("Building")
          ) {
            nameElement = element;
            break;
          }
        }
        if (nameElement) break;
      }

      // Try multiple selectors for company
      const companySelectors = [
        ".AgentInfo_company__3ERwx",
        ".AgentInfo_companyName__3ERwx",
        ".Body_base_gyzqw",
        ".agent-company",
        ".listing-agent-company",
        "[data-testid='agent-company']",
        ".agent-info-company",
      ];

      let companyElement = null;
      for (const selector of companySelectors) {
        companyElement = document.querySelector(selector);
        if (companyElement) break;
      }

      // Try multiple selectors for agent link
      const linkSelectors = [
        ".AgentInfo_agentName__3ERwx a",
        ".AgentInfo_name__3ERwx a",
        'a[href*="/profile/"]',
        'a[href*="/agent/"]',
        'a[href*="/broker/"]',
        ".agent-link",
        '[data-testid="agent-link"]',
      ];

      let agentLink = null;
      for (const selector of linkSelectors) {
        agentLink = document.querySelector(selector);
        if (agentLink) break;
      }

      // Extract sourceAgentId from the profile URL
      let sourceAgentId = "";
      if (agentLink) {
        const href = agentLink.getAttribute("href");
        if (href) {
          const match = href.match(/\/profile\/(\d+)/);
          if (match) {
            sourceAgentId = match[1];
          }
        }
      }

      // Get logo URL from either the object data attribute or img src
      let logoUrl = null;
      const logoElement = document.querySelector(
        ".avatar_container_7ZTNM object[data], .avatar_imageBase_DYjiu img[src], .AgentInfo_avatar__3ERwx img"
      );
      if (logoElement) {
        // Try to get URL from object data attribute first
        logoUrl =
          logoElement.getAttribute("data") || logoElement.getAttribute("src");

        // If it's a data URL (SVG), try to find the actual image URL
        if (logoUrl && logoUrl.startsWith("data:")) {
          const imgElement = logoElement.querySelector("img");
          if (imgElement) {
            logoUrl = imgElement.getAttribute("src");
          }
        }
      }

      // Try multiple selectors for profession
      const professionSelectors = [
        ".AgentInfo_title__3ERwx",
        ".AgentInfo_profession__3ERwx",
        ".Body_base_gyzqw.styled__Text-sc-1lwfbzj-4",
        ".agent-profession",
        ".listing-agent-profession",
        "[data-testid='agent-profession']",
        ".agent-info-profession",
      ];

      let professionElement = null;
      for (const selector of professionSelectors) {
        professionElement = document.querySelector(selector);
        if (professionElement) break;
      }

      const agentInfo = {
        name: nameElement?.textContent?.trim() || "",
        company: companyElement?.textContent?.trim() || "",
        sourceAgentId,
        website: agentLink?.getAttribute("href") || undefined,
        logoUrl: logoUrl || undefined,
        profession: professionElement?.textContent?.trim() || undefined,
      };

      console.log("🔍 Raw agent data:", {
        nameElement: nameElement?.outerHTML,
        companyElement: companyElement?.outerHTML,
        agentLink: agentLink?.outerHTML,
        logoElement: logoElement?.outerHTML,
        professionElement: professionElement?.outerHTML,
      });

      console.log("📝 Extracted agent data:", agentInfo);
      return agentInfo;
    });

    console.log("🔍 Agent data from page:", agentData);

    return {
      description: description || "No description available",
      amenities,
      imageUrls: formattedImageUrls,
      url,
      noFee,
      agent: agentData.name && agentData.sourceAgentId ? agentData : undefined,
    };
  } catch (err) {
    console.error("❌ Error during scraping:", err);
    throw err;
  } finally {
    await browser.close();
    console.log("✅ Browser closed.");
  }
}

async function processListings() {
  try {
    // Get listings that need updating - only those with no description AND no images, and source is STREETEASY
    const emptyListings = await db
      .select()
      .from(listings)
      .where(
        and(
          eq(listings.source, "STREETEASY"),
          isNull(listings.description),
          or(
            isNull(listings.supabaseImageUrls),
            eq(listings.supabaseImageUrls, [])
          )
        )
      );

    console.log(`Found ${emptyListings.length} listings to process`);

    for (const listing of emptyListings) {
      try {
        // Double check if the listing still needs updating
        const currentListing = await db
          .select()
          .from(listings)
          .where(eq(listings.id, listing.id))
          .limit(1);

        if (
          currentListing.length === 0 ||
          (currentListing[0].description &&
            currentListing[0].supabaseImageUrls &&
            currentListing[0].supabaseImageUrls.length > 0)
        ) {
          console.log(`Skipping listing ${listing.id} - already processed`);
          continue;
        }

        console.log(`Processing listing: ${listing.listingUrl}`);
        const scrapedData = await scrapeListing(listing.listingUrl);

        // Handle agent data
        let agentId = listing.agentId;
        if (scrapedData.agent && !agentId) {
          console.log("🔍 Processing agent data:", scrapedData.agent);
          try {
            // First try to find existing agent by name and source
            const existingAgents = await db
              .select()
              .from(agents)
              .where(
                and(
                  eq(agents.name, scrapedData.agent.name),
                  eq(agents.source, "STREETEASY")
                )
              );

            console.log("🔍 Found existing agents:", existingAgents);

            if (existingAgents.length > 0) {
              // Use the first existing agent
              const existingAgent = existingAgents[0];

              // Update existing agent with new information
              const [updatedAgent] = await db
                .update(agents)
                .set({
                  company: scrapedData.agent.company,
                  profession: scrapedData.agent.profession,
                  logoUrl: scrapedData.agent.logoUrl,
                  sourceAgentId: scrapedData.agent.sourceAgentId,
                  website: scrapedData.agent.website,
                  updatedAt: new Date(),
                })
                .where(eq(agents.id, existingAgent.id))
                .returning();

              agentId = updatedAgent.id;
              console.log(
                `✅ Updated existing agent: ${agentId} with source ID: ${scrapedData.agent.sourceAgentId}`
              );
            } else {
              console.log("🔍 Creating new agent...");
              // Create new agent
              const [newAgent] = await db
                .insert(agents)
                .values({
                  id: createId(),
                  name: scrapedData.agent.name,
                  company: scrapedData.agent.company || null,
                  profession: scrapedData.agent.profession || null,
                  logoUrl: scrapedData.agent.logoUrl || null,
                  source: "STREETEASY",
                  sourceAgentId: scrapedData.agent.sourceAgentId,
                  website: scrapedData.agent.website || null,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                })
                .returning();

              if (newAgent) {
                agentId = newAgent.id;
                console.log(
                  `✅ Created new agent: ${agentId} with source ID: ${scrapedData.agent.sourceAgentId}`
                );
              }
            }
          } catch (agentError: any) {
            console.error("❌ Agent error details:", {
              code: agentError.code,
              message: agentError.message,
              detail: agentError.detail,
            });

            if (agentError.code === "23505") {
              // Duplicate key violation - try to find the existing agent
              const existingAgents = await db
                .select()
                .from(agents)
                .where(
                  and(
                    eq(agents.name, scrapedData.agent.name),
                    eq(agents.source, "STREETEASY")
                  )
                );

              if (existingAgents.length > 0) {
                agentId = existingAgents[0].id;
                console.log(
                  `✅ Found existing agent after conflict: ${agentId}`
                );
              } else {
                console.error(
                  "❌ Failed to handle agent after conflict:",
                  agentError
                );
                agentId = null;
              }
            } else {
              console.error("❌ Error handling agent:", agentError);
              agentId = null;
            }
          }
        }

        // Update the listing with scraped data and agent ID
        await db
          .update(listings)
          .set({
            description: scrapedData.description,
            amenities: scrapedData.amenities,
            supabaseImageUrls: scrapedData.imageUrls,
            agentId: agentId,
            noFee: scrapedData.noFee,
            updatedAt: new Date(),
          })
          .where(eq(listings.id, listing.id));

        console.log(
          `✅ Updated listing ${listing.id}${
            agentId ? ` with agent ${agentId}` : ""
          }`
        );

        // Wait 30 seconds after successful scrape
        console.log("⏳ Waiting 30 seconds before next request...");
        await new Promise((resolve) => setTimeout(resolve, 30000));
      } catch (err) {
        console.error(`❌ Failed to process listing ${listing.id}:`, err);
        // Wait 70 seconds after failure
        console.log("⏳ Failed scrape. Waiting 70 seconds...");
        await new Promise((resolve) => setTimeout(resolve, 70000));
        // Exit the loop on failure
        throw err;
      }
    }
  } catch (err) {
    console.error("💥 Fatal error in processing listings:", err);
    process.exit(1);
  }
}

// Run the process
processListings().catch((err) => {
  console.error("💥 Fatal error:", err);
  process.exit(1);
});

export { scrapeListing, processListings };
