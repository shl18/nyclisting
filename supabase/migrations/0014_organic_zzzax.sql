ALTER TABLE "agents" DROP CONSTRAINT "agents_source_agent_id_unique";--> statement-breakpoint
ALTER TABLE "agents" ALTER COLUMN "id" SET DEFAULT 'd7voe1hh4wttylpuo5gijvs5';--> statement-breakpoint
ALTER TABLE "agents" ALTER COLUMN "source_agent_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "listings" ALTER COLUMN "id" SET DEFAULT 'nsmwkuduh3swp886yezi5b2e';--> statement-breakpoint
ALTER TABLE "saved_listings" ALTER COLUMN "id" SET DEFAULT 'kh9crxjjnzjvcy21xmc1o6oz';--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "id" SET DEFAULT 'wtsz28qmfcmkiy6zrmxrvk23';--> statement-breakpoint
ALTER TABLE "agents" ADD CONSTRAINT "agents_name_source_unique" UNIQUE("name","source");