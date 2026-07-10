import { marketRepository } from "../db/repositories/market-repository";
import { predictionRepository } from "../db/repositories/prediction-repository";
import { userRepository } from "../db/repositories/user-repository";

export interface CreateMarketInput {
  assetPair: string;
  name: string;
  description?: string;
  creatorAddress: string;
  resolutionDate: Date;
  isPrivate?: boolean;
}

export class MarketService {
  async createMarket(input: CreateMarketInput) {
    const user = await userRepository.findByWalletAddress(input.creatorAddress);
    if (!user) {
      throw new Error("Creator user not found");
    }

    if (new Date(input.resolutionDate) <= new Date()) {
      throw new Error("Resolution date must be in the future");
    }

    const market = await marketRepository.create({
      assetPair: input.assetPair.toUpperCase(),
      name: input.name,
      description: input.description,
      creatorAddress: input.creatorAddress,
      resolutionDate: new Date(input.resolutionDate),
      isPrivate: input.isPrivate || false,
    });

    return market;
  }

  async getMarket(id: string) {
    const market = await marketRepository.findById(id);
    if (!market) {
      throw new Error("Market not found");
    }

    const predictions = await predictionRepository.findByMarketId(id);
    const yesCount = predictions.filter((p) => p.choice === "YES").length;
    const noCount = predictions.filter((p) => p.choice === "NO").length;

    return {
      ...market,
      yesCount,
      noCount,
      totalPredictions: predictions.length,
    };
  }

  async listMarkets(
    status?: string,
    limit: number = 100,
    offset: number = 0
  ) {
    if (status) {
      return marketRepository.findByStatus(status, limit, offset);
    }
    return marketRepository.list(limit, offset);
  }

  async getMarketsByCreator(creatorAddress: string) {
    return marketRepository.listByCreator(creatorAddress);
  }

  async resolveMarket(id: string, resolution: "YES" | "NO") {
    const market = await marketRepository.findById(id);
    if (!market) {
      throw new Error("Market not found");
    }

    if (market.status !== "ACTIVE") {
      throw new Error("Market already resolved");
    }

    const predictions = await predictionRepository.findByMarketId(id);
    const winningPredictions = predictions.filter((p) => p.choice === resolution);
    const losingPredictions = predictions.filter((p) => p.choice !== resolution);

    const totalLosingAmount = losingPredictions.reduce(
      (sum, p) => sum + p.amount,
      0n
    );
    const pool = totalLosingAmount;

    // Calculate winnings for each winning prediction
    const totalWinningAmount = winningPredictions.reduce(
      (sum, p) => sum + p.amount,
      0n
    );

    for (const prediction of winningPredictions) {
      const share = Number(prediction.amount) / Number(totalWinningAmount);
      const winnings = Math.floor(Number(pool) * share).toString();
      
      await predictionRepository.claimWinnings(prediction.id, winnings);
      
      // Add winnings to user balance
      const user = await userRepository.findByWalletAddress(prediction.walletAddress);
      if (user) {
        await userRepository.incrementBalance(
          prediction.walletAddress,
          BigInt(prediction.amount) + BigInt(winnings)
        );
      }
    }

    const resolved = await marketRepository.resolveMarket(id, resolution);
    return resolved;
  }

  async cancelMarket(id: string) {
    const market = await marketRepository.findById(id);
    if (!market) {
      throw new Error("Market not found");
    }

    if (market.status !== "ACTIVE") {
      throw new Error("Market already resolved");
    }

    const predictions = await predictionRepository.findByMarketId(id);
    
    // Refund all predictions
    for (const prediction of predictions) {
      const user = await userRepository.findByWalletAddress(prediction.walletAddress);
      if (user) {
        await userRepository.incrementBalance(prediction.walletAddress, prediction.amount);
      }
    }

    const cancelled = await marketRepository.cancelMarket(id);
    return cancelled;
  }

  async getPendingResolution() {
    return marketRepository.findPendingResolution();
  }
}

export const marketService = new MarketService();
