CREATE TYPE "public"."ListingSource" AS ENUM('SPAREROOM', 'STREETEASY');--> statement-breakpoint
CREATE TABLE "listings" (
	"id" text PRIMARY KEY DEFAULT 'h4kmifb4hlvre0ihfbaubrli' NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"price" integer NOT NULL,
	"bedrooms" integer,
	"bathrooms" integer,
	"sqft" integer,
	"listing_url" text NOT NULL,
	"image_urls" text[] NOT NULL,
	"address" text NOT NULL,
	"latitude" real,
	"longitude" real,
	"neighborhood" text,
	"city" text NOT NULL,
	"source" "ListingSource" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"scraped_at" timestamp with time zone NOT NULL,
	"is_active" boolean DEFAULT true,
	CONSTRAINT "listings_listing_url_unique" UNIQUE("listing_url")
);
--> statement-breakpoint
CREATE TABLE "saved_listings" (
	"id" text PRIMARY KEY DEFAULT 'gj5piyikzp562brahs43k7ke' NOT NULL,
	"user_id" text NOT NULL,
	"listing_id" text NOT NULL,
	"saved_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "saved_listings_user_id_listing_id_unique" UNIQUE("user_id","listing_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY DEFAULT 'gmgljhq1331knqctykuonxkj' NOT NULL,
	"email" varchar(255) NOT NULL,
	"hashed_password" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
