ALTER TABLE "listings" ALTER COLUMN "id" SET DEFAULT 'eg7uqwc8ijqz0z5w2sic2erl';--> statement-breakpoint
ALTER TABLE "saved_listings" ALTER COLUMN "id" SET DEFAULT 'z0p2bzwgnw05hsrsvhyp1rq4';--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "id" SET DEFAULT 'fkfu84xc0lwa08xoyugt6dz1';--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "mul_image_urls" text[] DEFAULT '{}' NOT NULL;