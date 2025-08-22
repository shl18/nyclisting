-- Drop the column if it exists
ALTER TABLE "listings" DROP COLUMN IF EXISTS "amenities";

-- Add the column
ALTER TABLE "listings" ADD COLUMN "amenities" text[] DEFAULT '{}';

-- Update existing rows to have an empty array instead of null
UPDATE "listings" SET "amenities" = '{}' WHERE "amenities" IS NULL; 