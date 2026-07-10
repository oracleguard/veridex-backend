import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  numeric,
  text,
  index,
  foreignKey,
} from "drizzle-orm/pg-core";
import { users } from "./users";

export const fraudRecords = pgTable(
  "fraud_records",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    walletAddress: varchar("wallet_address", { length: 56 }).notNull(),
    userId: uuid("user_id"),
    riskScore: numeric("risk_score", { precision: 5, scale: 2 }).notNull(),
    riskLevel: varchar("risk_level", { length: 32 }).notNull(), // "LOW", "MEDIUM", "HIGH", "CRITICAL"
    flaggedFields: text("flagged_fields"), // JSON array of flagged fields
    details: text("details"), // JSON details
    status: varchar("status", { length: 32 }).default("PENDING"), // "PENDING", "REVIEWED", "RESOLVED"
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => {
    return {
      walletIdx: index("fraud_wallet_idx").on(table.walletAddress),
      riskScoreIdx: index("fraud_risk_score_idx").on(table.riskScore),
      userFk: foreignKey({
        columns: [table.userId],
        foreignColumns: [users.id],
      }),
    };
  }
);
