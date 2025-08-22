CREATE TABLE "recently_viewed_listings" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"listing_id" text NOT NULL,
	"viewed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "agents" ALTER COLUMN "id" SET DEFAULT 'q0fgs860yf9y4a1vph2vwgoc';--> statement-breakpoint
ALTER TABLE "listings" ALTER COLUMN "id" SET DEFAULT 'bpz9oudqu5zqjsz6dgzz5vup';--> statement-breakpoint
ALTER TABLE "saved_listings" ALTER COLUMN "id" SET DEFAULT 'rzzocq6l53l53siq3lolcwse';--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "id" SET DEFAULT 'ohnn0rga5ka3u6n7bzewnqx8';--> statement-breakpoint
ALTER TABLE "recently_viewed_listings" ADD CONSTRAINT "recently_viewed_listings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recently_viewed_listings" ADD CONSTRAINT "recently_viewed_listings_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE no action ON UPDATE no action;