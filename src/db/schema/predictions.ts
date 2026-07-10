import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  bigint,
  numeric,
  index,
  foreignKey,
} from "drizzle-orm/pg-core";
import { markets } from "./markets";

export const predictions = pgTable(
  "predictions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    marketId: uuid("market_id").notNull(),
    walletAddress: varchar("wallet_address", { length: 56 }).notNull(),
    amount: bigint("amount").notNull(),
    choice: varchar("choice", { length: 10 }).notNull(), // "YES" or "NO"
    winnings: numeric("winnings", { precision: 20, scale: 8 }),
    claimed: varchar("claimed", { length: 10 }).default("UNCLAIMED"), // "CLAIMED", "UNCLAIMED", "PENDING"
    createdAt: timestamp("created_at").defaultNow().notNull(),
    claimedAt: timestamp("claimed_at"),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => {
    return {
      marketIdIdx: index("predictions_market_id_idx").on(table.marketId),
      walletIdx: index("predictions_wallet_idx").on(table.walletAddress),
      marketFk: foreignKey({
        columns: [table.marketId],
        foreignColumns: [markets.id],
      }),
    };
  }
);
