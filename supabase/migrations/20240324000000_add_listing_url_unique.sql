-- Add unique constraint to listing_url column
ALTER TABLE listings ADD CONSTRAINT listings_listing_url_unique UNIQUE (listing_url);

-- Clean up any existing duplicates by keeping the most recent entry
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
); 