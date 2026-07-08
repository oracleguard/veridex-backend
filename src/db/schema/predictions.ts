import { pgTable, uuid, varchar, bigint, timestamp } from "drizzle-orm/pg-core";
import { markets } from "./markets";

export const predictions = pgTable("predictions", {
  id: uuid("id").primaryKey().defaultRandom(),
  marketId: uuid("market_id").references(() => markets.id),
  walletAddress: varchar("wallet_address", { length: 56 }).notNull(),
  amount: bigint("amount").notNull(),
  choice: varchar("choice", { length: 10 }).notNull(), // "YES" or "NO"
  createdAt: timestamp("created_at").defaultNow(),
  claimedAt: timestamp("claimed_at"),
});
