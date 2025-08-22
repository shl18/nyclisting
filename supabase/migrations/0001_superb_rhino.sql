ALTER TABLE "listings" ALTER COLUMN "id" SET DEFAULT 'df6q3dcd0bxf3l2hwagnnrhc';--> statement-breakpoint
ALTER TABLE "saved_listings" ALTER COLUMN "id" SET DEFAULT 'rb5ecxt1x1yo86atx688vrhj';--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "id" SET DEFAULT 'i5jwq5moejdswlgz42570sce';--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "amenities" text[];