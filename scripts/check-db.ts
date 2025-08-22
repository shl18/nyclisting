import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

config({ path: ".env" });

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  console.log("Checking database connection and migrations...");

  const client = postgres(process.env.DATABASE_URL, { max: 1 });
  const db = drizzle(client);

  try {
    // Test connection
    await client`SELECT 1`;
    console.log("Database connection successful");

    // Run migrations
    console.log("Running migrations...");
    await migrate(db, { migrationsFolder: "./supabase/migrations" });
    console.log("Migrations completed successfully");

    // Verify tables
    const tables = await client`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    console.log("Available tables:", tables);

    // Check listings table
    const listings = await client`
      SELECT COUNT(*) as count FROM listings
    `;
    console.log("Current listings count:", listings[0].count);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
