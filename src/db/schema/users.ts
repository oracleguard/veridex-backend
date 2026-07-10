import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  bigint,
  index,
} from "drizzle-orm/pg-core";

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    walletAddress: varchar("wallet_address", { length: 56 }).notNull().unique(),
    username: varchar("username", { length: 255 }),
    email: varchar("email", { length: 255 }).unique(),
    passwordHash: varchar("password_hash", { length: 255 }),
    balance: bigint("balance").default(0n).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => {
    return {
      walletIdx: index("users_wallet_idx").on(table.walletAddress),
      emailIdx: index("users_email_idx").on(table.email),
    };
  }
);
