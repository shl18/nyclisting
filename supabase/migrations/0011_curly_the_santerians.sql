CREATE TABLE "agents" (
	"id" text PRIMARY KEY DEFAULT 'u0nqkekw4x6i1kircos2hsex' NOT NULL,
	"name" text NOT NULL,
	"email" varchar(255),
	"phone" varchar(20),
	"company" text,
	"website" text,
	"source" "ListingSource" NOT NULL,
	"source_agent_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "agents_source_agent_id_unique" UNIQUE("source_agent_id")
);
--> statement-breakpoint
ALTER TABLE "listings" ALTER COLUMN "id" SET DEFAULT 'hnrhu9fuwg0lw98dekymeog6';--> statement-breakpoint
ALTER TABLE "saved_listings" ALTER COLUMN "id" SET DEFAULT 'ifz2linyzagst2vicuj9ra9t';--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "id" SET DEFAULT 'rttobt17utvj0grkhn8pms3l';--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "agent_id" text;--> statement-breakpoint
ALTER TABLE "listings" ADD CONSTRAINT "listings_agent_id_agents_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."agents"("id") ON DELETE no action ON UPDATE no action;