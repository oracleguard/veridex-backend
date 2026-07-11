import { userRepository } from "../db/repositories/user-repository";
import { fraudRepository } from "../db/repositories/fraud-repository";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export class UserService {
  async registerUser(walletAddress: string, email?: string, password?: string) {
    const existingUser = await userRepository.findByWalletAddress(walletAddress);
    if (existingUser) {
      throw new Error("User already exists");
    }

    let passwordHash;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      passwordHash = await bcrypt.hash(password, salt);
    }

    const user = await userRepository.create(walletAddress, walletAddress.slice(0, 8), email);
    
    if (passwordHash) {
      await userRepository.update(user.id, { passwordHash });
    }

    return user;
  }

  async authenticateUser(email: string, password: string) {
    const user = await userRepository.findByEmail(email);
    if (!user || !user.passwordHash) {
      throw new Error("Invalid credentials");
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      throw new Error("Invalid credentials");
    }

    return user;
  }

  async generateJWT(userId: string) {
    const token = jwt.sign(
      { userId },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "7d" }
    );
    return token;
  }

  async verifyJWT(token: string): Promise<{ userId: string }> {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret") as { userId: string };
      return decoded;
    } catch (error) {
      throw new Error("Invalid token");
    }
  }

  async getUserProfile(walletAddress: string) {
    const user = await userRepository.findByWalletAddress(walletAddress);
    if (!user) {
      throw new Error("User not found");
    }

    const fraudRecords = await fraudRepository.findByWalletAddress(walletAddress);
    const latestFraudRecord = fraudRecords[fraudRecords.length - 1];

    return {
      id: user.id,
      walletAddress: user.walletAddress,
      username: user.username,
      email: user.email,
      balance: user.balance.toString(),
      createdAt: user.createdAt,
      fraudProfile: latestFraudRecord ? {
        riskScore: latestFraudRecord.riskScore,
        riskLevel: latestFraudRecord.riskLevel,
        status: latestFraudRecord.status,
        updatedAt: latestFraudRecord.updatedAt,
      } : null,
    };
  }

  async depositBalance(walletAddress: string, amount: bigint) {
    const user = await userRepository.findByWalletAddress(walletAddress);
    if (!user) {
      throw new Error("User not found");
    }

    const updated = await userRepository.incrementBalance(walletAddress, amount);
    return updated;
  }

  async withdrawBalance(walletAddress: string, amount: bigint) {
    const user = await userRepository.findByWalletAddress(walletAddress);
    if (!user) {
      throw new Error("User not found");
    }

    if (user.balance < amount) {
      throw new Error("Insufficient balance");
    }

    const updated = await userRepository.decrementBalance(walletAddress, amount);
    return updated;
  }
}

export const userService = new UserService();
