import {
  pgTable,
  text,
  varchar,
  timestamp,
  boolean,
  integer,
  real,
  uuid,
  primaryKey,
  unique,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";

export const listingSourceEnum = pgEnum("ListingSource", [
  "SPAREROOM",
  "STREETEASY",
]);

export const users = pgTable("users", {
  id: text("id").primaryKey().default(createId()),
  email: varchar("email", { length: 255 }).notNull().unique(),
  hashedPassword: text("hashed_password").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const agents = pgTable(
  "agents",
  {
    id: text("id").primaryKey().notNull(),
    name: text("name").notNull(),
    email: varchar("email", { length: 255 }),
    profession: text("profession"),
    phone: varchar("phone", { length: 20 }),
    company: text("company"),
    website: text("website"),
    logoUrl: text("logo_url"),
    source: listingSourceEnum("source").notNull(),
    sourceAgentId: text("source_agent_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    nameSourceUnique: unique().on(table.name, table.source),
  })
);

export const listings = pgTable("listings", {
  id: text("id").primaryKey().default(createId()),
  title: text("title").notNull(),
  description: text("description"),
  price: integer("price").notNull(),
  bedrooms: integer("bedrooms"),
  bathrooms: integer("bathrooms"),
  sqft: integer("sqft"),
  listingUrl: text("listing_url").notNull().unique(),
  imageUrls: text("image_urls").array().notNull(),
  supabaseImageUrls: text("supabase_image_urls").array().notNull().default([]),
  address: text("address").notNull(),
  latitude: real("latitude"),
  longitude: real("longitude"),
  neighborhood: text("neighborhood"),
  city: text("city").notNull(),
  source: listingSourceEnum("source").notNull(),
  amenities: text("amenities").array(),
  noFee: boolean("no_fee").default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  scrapedAt: timestamp("scraped_at", { withTimezone: true }).notNull(),
  isActive: boolean("is_active").default(true),
  agentId: text("agent_id").references(() => agents.id),
});

export const savedListings = pgTable(
  "saved_listings",
  {
    id: text("id").primaryKey().default(createId()),
    userId: text("user_id").notNull(),
    listingId: text("listing_id").notNull(),
    savedAt: timestamp("saved_at", { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    userListingUnique: unique().on(table.userId, table.listingId),
  })
);
