ALTER TABLE "listings" ALTER COLUMN "id" SET DEFAULT 'cpyw5xt5v6annhb07dlz8i7d';--> statement-breakpoint
ALTER TABLE "saved_listings" ALTER COLUMN "id" SET DEFAULT 'yz2t3sw5hn4yne396n4jem5g';--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "id" SET DEFAULT 'nlnlf8r04ctepf10byow0v9r';--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "no_fee" boolean DEFAULT false;