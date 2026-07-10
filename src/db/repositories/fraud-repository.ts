import { db } from "../client";
import { fraudRecords } from "../schema/fraud";
import { eq } from "drizzle-orm";

export class FraudRepository {
  async create(data: {
    walletAddress: string;
    userId?: string;
    riskScore: string;
    riskLevel: string;
    flaggedFields?: string;
    details?: string;
  }) {
    const result = await db
      .insert(fraudRecords)
      .values(data)
      .returning();
    return result[0];
  }

  async findById(id: string) {
    const result = await db
      .select()
      .from(fraudRecords)
      .where(eq(fraudRecords.id, id));
    return result[0] || null;
  }

  async findByWalletAddress(walletAddress: string) {
    const result = await db
      .select()
      .from(fraudRecords)
      .where(eq(fraudRecords.walletAddress, walletAddress))
      .orderBy(fraudRecords.createdAt);
    return result;
  }

  async findLatestByWalletAddress(walletAddress: string) {
    const results = await db
      .select()
      .from(fraudRecords)
      .where(eq(fraudRecords.walletAddress, walletAddress))
      .orderBy(fraudRecords.createdAt)
      .limit(1);
    return results[0] || null;
  }

  async update(
    id: string,
    data: {
      status?: string;
      riskScore?: string;
      riskLevel?: string;
      details?: string;
    }
  ) {
    const result = await db
      .update(fraudRecords)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(fraudRecords.id, id))
      .returning();
    return result[0];
  }

  async findByRiskLevel(riskLevel: string) {
    return db
      .select()
      .from(fraudRecords)
      .where(eq(fraudRecords.riskLevel, riskLevel));
  }

  async list(limit: number = 100, offset: number = 0) {
    return db
      .select()
      .from(fraudRecords)
      .limit(limit)
      .offset(offset);
  }
}

export const fraudRepository = new FraudRepository();
