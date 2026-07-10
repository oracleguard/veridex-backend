import { db } from "../client";
import { users } from "../schema/users";
import { eq, sql } from "drizzle-orm";

export class UserRepository {
  async create(walletAddress: string, username?: string, email?: string) {
    const result = await db
      .insert(users)
      .values({
        walletAddress,
        username,
        email,
      })
      .returning();
    return result[0];
  }

  async findByWalletAddress(walletAddress: string) {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.walletAddress, walletAddress));
    return result[0] || null;
  }

  async findById(id: string) {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.id, id));
    return result[0] || null;
  }

  async findByEmail(email: string) {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.email, email));
    return result[0] || null;
  }

  async update(
    id: string,
    data: {
      username?: string;
      email?: string;
      passwordHash?: string;
      balance?: bigint;
    }
  ) {
    const result = await db
      .update(users)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return result[0];
  }

  async incrementBalance(walletAddress: string, amount: bigint) {
    const result = await db
      .update(users)
      .set({
        balance: sql`balance + ${amount}`,
        updatedAt: new Date(),
      })
      .where(eq(users.walletAddress, walletAddress))
      .returning();
    return result[0];
  }

  async decrementBalance(walletAddress: string, amount: bigint) {
    const result = await db
      .update(users)
      .set({
        balance: sql`balance - ${amount}`,
        updatedAt: new Date(),
      })
      .where(eq(users.walletAddress, walletAddress))
      .returning();
    return result[0];
  }

  async list(limit: number = 100, offset: number = 0) {
    return db
      .select()
      .from(users)
      .limit(limit)
      .offset(offset);
  }
}

export const userRepository = new UserRepository();
