import axios from "axios";
import { fraudRepository } from "../db/repositories/fraud-repository";
import { userRepository } from "../db/repositories/user-repository";

interface FraudCheckResult {
  wallet: string;
  riskScore: number;
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  flaggedFields: string[];
  details: Record<string, any>;
}

export class FraudService {
  private detectionApiUrl = process.env.DETECTION_API_URL || "http://localhost:8000";

  async checkUserFraud(walletAddress: string): Promise<FraudCheckResult> {
    try {
      // Call external fraud detection API
      const response = await axios.post(`${this.detectionApiUrl}/api/detect`, {
        wallet: walletAddress,
      });

      const { riskScore, flaggedFields, details } = response.data;

      // Determine risk level
      let riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" = "LOW";
      if (riskScore < 25) riskLevel = "LOW";
      else if (riskScore < 50) riskLevel = "MEDIUM";
      else if (riskScore < 75) riskLevel = "HIGH";
      else riskLevel = "CRITICAL";

      // Get or create user
      let user = await userRepository.findByWalletAddress(walletAddress);
      if (!user) {
        user = await userRepository.create(walletAddress);
      }

      // Store fraud record
      const record = await fraudRepository.create({
        walletAddress,
        userId: user.id,
        riskScore: riskScore.toString(),
        riskLevel,
        flaggedFields: JSON.stringify(flaggedFields),
        details: JSON.stringify(details),
      });

      return {
        wallet: walletAddress,
        riskScore,
        riskLevel,
        flaggedFields,
        details,
      };
    } catch (error: any) {
      console.error("Fraud check error:", error.message);
      
      // Mock response on API failure
      return {
        wallet: walletAddress,
        riskScore: 0,
        riskLevel: "LOW",
        flaggedFields: [],
        details: { error: "Unable to reach fraud detection service" },
      };
    }
  }

  async getUserFraudProfile(walletAddress: string) {
    const latestRecord = await fraudRepository.findLatestByWalletAddress(walletAddress);

    if (!latestRecord) {
      // Perform check if no record exists
      return this.checkUserFraud(walletAddress);
    }

    return {
      wallet: walletAddress,
      riskScore: parseFloat(latestRecord.riskScore),
      riskLevel: latestRecord.riskLevel,
      flaggedFields: latestRecord.flaggedFields ? JSON.parse(latestRecord.flaggedFields) : [],
      details: latestRecord.details ? JSON.parse(latestRecord.details) : {},
      status: latestRecord.status,
      updatedAt: latestRecord.updatedAt,
    };
  }

  async getFraudHistory(walletAddress: string) {
    const records = await fraudRepository.findByWalletAddress(walletAddress);

    return records.map((record) => ({
      id: record.id,
      riskScore: parseFloat(record.riskScore),
      riskLevel: record.riskLevel,
      flaggedFields: record.flaggedFields ? JSON.parse(record.flaggedFields) : [],
      status: record.status,
      createdAt: record.createdAt,
    }));
  }

  async updateFraudStatus(recordId: string, status: string) {
    return fraudRepository.update(recordId, { status });
  }

  async getHighRiskUsers() {
    return fraudRepository.findByRiskLevel("CRITICAL");
  }

  async listFraudRecords(limit: number = 100, offset: number = 0) {
    return fraudRepository.list(limit, offset);
  }
}

export const fraudService = new FraudService();
