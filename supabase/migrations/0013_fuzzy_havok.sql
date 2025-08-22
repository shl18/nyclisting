ALTER TABLE "agents" ALTER COLUMN "id" SET DEFAULT 'm3fdq2e20xxl1v2enw5lcs7t';--> statement-breakpoint
ALTER TABLE "listings" ALTER COLUMN "id" SET DEFAULT 'x4090a8xxcb7oycrr0570z2w';--> statement-breakpoint
ALTER TABLE "saved_listings" ALTER COLUMN "id" SET DEFAULT 'h7m204q1padcbag8trcgsrux';--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "id" SET DEFAULT 'v2c5fl8921j3y1b7vm5pzz0j';--> statement-breakpoint
ALTER TABLE "agents" ADD COLUMN "profession" text;--> statement-breakpoint
ALTER TABLE "agents" ADD COLUMN "logo_url" text;