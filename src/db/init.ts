import { migrate } from "drizzle-orm/node-postgres/migrator";
import { db } from "./client";
import path from "path";

export async function initializeDatabase() {
  try {
    console.log("Running migrations...");
    await migrate(db, { migrationsFolder: path.join(__dirname, "../db/migrations") });
    console.log("✓ Migrations completed successfully");
  } catch (error) {
    console.error("✗ Migration failed:", error);
    throw error;
  }
}
