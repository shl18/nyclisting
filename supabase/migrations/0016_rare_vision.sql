ALTER TABLE "recently_viewed_listings" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "recently_viewed_listings" CASCADE;--> statement-breakpoint
ALTER TABLE "agents" ALTER COLUMN "id" SET DEFAULT 'il8j1dewwq39dfwwt2qs6hjh';--> statement-breakpoint
ALTER TABLE "listings" ALTER COLUMN "id" SET DEFAULT 'wo6u4p0rz53gbb9q76pzzxon';--> statement-breakpoint
ALTER TABLE "saved_listings" ALTER COLUMN "id" SET DEFAULT 'ke7uogob7br2lz2qplpw4zxa';--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "id" SET DEFAULT 'bbzmsx8ijklyc0ks59qfgky1';--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "supabase_image_urls" text[] DEFAULT '{}' NOT NULL;