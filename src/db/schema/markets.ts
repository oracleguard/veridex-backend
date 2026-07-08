import { pgTable, uuid, varchar, timestamp, text, boolean } from "drizzle-orm/pg-core";

export const markets = pgTable("markets", {
  id: uuid("id").primaryKey().defaultRandom(),
  assetPair: varchar("asset_pair", { length: 28 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  resolutionDate: timestamp("resolution_date").notNull(),
  status: varchar("status", { length: 32 }).default("active"),
  isPrivate: boolean("is_private").default(false),
});
