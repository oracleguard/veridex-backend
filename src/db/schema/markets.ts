import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  text,
  boolean,
  numeric,
  index,
} from "drizzle-orm/pg-core";

export const markets = pgTable(
  "markets",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    assetPair: varchar("asset_pair", { length: 28 }).notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    creatorAddress: varchar("creator_address", { length: 56 }).notNull(),
    status: varchar("status", { length: 32 }).default("ACTIVE"), // "ACTIVE", "RESOLVED", "CANCELLED"
    resolution: varchar("resolution", { length: 10 }), // "YES", "NO", "CANCELLED"
    totalYesAmount: numeric("total_yes_amount", { precision: 20, scale: 8 })
      .default("0")
      .notNull(),
    totalNoAmount: numeric("total_no_amount", { precision: 20, scale: 8 })
      .default("0")
      .notNull(),
    resolutionDate: timestamp("resolution_date").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    isPrivate: boolean("is_private").default(false),
  },
  (table) => {
    return {
      statusIdx: index("markets_status_idx").on(table.status),
      creatorIdx: index("markets_creator_idx").on(table.creatorAddress),
    };
  }
);
