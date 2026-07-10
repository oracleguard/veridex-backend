import { db } from "../client";
import { predictions } from "../schema/predictions";
import { eq, and } from "drizzle-orm";

export class PredictionRepository {
  async create(data: {
    marketId: string;
    walletAddress: string;
    amount: bigint;
    choice: "YES" | "NO";
  }) {
    const result = await db
      .insert(predictions)
      .values(data)
      .returning();
    return result[0];
  }

  async findById(id: string) {
    const result = await db
      .select()
      .from(predictions)
      .where(eq(predictions.id, id));
    return result[0] || null;
  }

  async findByMarketId(marketId: string) {
    return db
      .select()
      .from(predictions)
      .where(eq(predictions.marketId, marketId));
  }

  async findByWalletAddress(walletAddress: string) {
    return db
      .select()
      .from(predictions)
      .where(eq(predictions.walletAddress, walletAddress));
  }

  async findByMarketAndWallet(marketId: string, walletAddress: string) {
    return db
      .select()
      .from(predictions)
      .where(
        and(
          eq(predictions.marketId, marketId),
          eq(predictions.walletAddress, walletAddress)
        )
      );
  }

  async findUnclaimed(walletAddress: string) {
    return db
      .select()
      .from(predictions)
      .where(
        and(
          eq(predictions.walletAddress, walletAddress),
          eq(predictions.claimed, "UNCLAIMED")
        )
      );
  }

  async update(
    id: string,
    data: {
      winnings?: string;
      claimed?: string;
      claimedAt?: Date;
    }
  ) {
    const result = await db
      .update(predictions)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(predictions.id, id))
      .returning();
    return result[0];
  }

  async claimWinnings(id: string, winnings: string) {
    const result = await db
      .update(predictions)
      .set({
        winnings,
        claimed: "CLAIMED",
        claimedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(predictions.id, id))
      .returning();
    return result[0];
  }

  async list(limit: number = 100, offset: number = 0) {
    return db
      .select()
      .from(predictions)
      .limit(limit)
      .offset(offset);
  }

  async countByMarketAndChoice(marketId: string, choice: "YES" | "NO") {
    const result = await db
      .select()
      .from(predictions)
      .where(
        and(
          eq(predictions.marketId, marketId),
          eq(predictions.choice, choice)
        )
      );
    return result.length;
  }

  async sumAmountByMarketAndChoice(marketId: string, choice: "YES" | "NO") {
    const result = await db
      .select()
      .from(predictions)
      .where(
        and(
          eq(predictions.marketId, marketId),
          eq(predictions.choice, choice)
        )
      );
    return result.reduce((sum, p) => sum + BigInt(p.amount), 0n);
  }
}

export const predictionRepository = new PredictionRepository();
