import { db } from "../client";
import { markets } from "../schema/markets";
import { eq, and, lt, gt } from "drizzle-orm";

export class MarketRepository {
  async create(data: {
    assetPair: string;
    name: string;
    description?: string;
    creatorAddress: string;
    resolutionDate: Date;
    isPrivate?: boolean;
  }) {
    const result = await db
      .insert(markets)
      .values(data)
      .returning();
    return result[0];
  }

  async findById(id: string) {
    const result = await db
      .select()
      .from(markets)
      .where(eq(markets.id, id));
    return result[0] || null;
  }

  async findByStatus(status: string, limit: number = 100, offset: number = 0) {
    return db
      .select()
      .from(markets)
      .where(eq(markets.status, status))
      .limit(limit)
      .offset(offset);
  }

  async list(limit: number = 100, offset: number = 0) {
    return db
      .select()
      .from(markets)
      .limit(limit)
      .offset(offset);
  }

  async listByCreator(creatorAddress: string) {
    return db
      .select()
      .from(markets)
      .where(eq(markets.creatorAddress, creatorAddress));
  }

  async update(
    id: string,
    data: {
      status?: string;
      resolution?: string;
      totalYesAmount?: string;
      totalNoAmount?: string;
    }
  ) {
    const result = await db
      .update(markets)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(markets.id, id))
      .returning();
    return result[0];
  }

  async findPendingResolution() {
    const now = new Date();
    return db
      .select()
      .from(markets)
      .where(
        and(
          eq(markets.status, "ACTIVE"),
          lt(markets.resolutionDate, now)
        )
      );
  }

  async incrementTotalAmount(
    id: string,
    choice: "YES" | "NO",
    amount: bigint
  ) {
    const field = choice === "YES" ? markets.totalYesAmount : markets.totalNoAmount;
    const result = await db
      .update(markets)
      .set({
        [choice === "YES" ? "totalYesAmount" : "totalNoAmount"]: 
          `(SELECT ${choice === "YES" ? "total_yes_amount" : "total_no_amount"} FROM markets WHERE id = $1) + $2`,
        updatedAt: new Date(),
      })
      .where(eq(markets.id, id))
      .returning();
    return result[0];
  }

  async resolveMarket(id: string, resolution: "YES" | "NO") {
    const result = await db
      .update(markets)
      .set({
        status: "RESOLVED",
        resolution,
        updatedAt: new Date(),
      })
      .where(eq(markets.id, id))
      .returning();
    return result[0];
  }

  async cancelMarket(id: string) {
    const result = await db
      .update(markets)
      .set({
        status: "CANCELLED",
        resolution: "CANCELLED",
        updatedAt: new Date(),
      })
      .where(eq(markets.id, id))
      .returning();
    return result[0];
  }
}

export const marketRepository = new MarketRepository();
