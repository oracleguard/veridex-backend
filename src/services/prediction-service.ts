import { predictionRepository } from "../db/repositories/prediction-repository";
import { marketRepository } from "../db/repositories/market-repository";
import { userRepository } from "../db/repositories/user-repository";

export interface PlacePredictionInput {
  marketId: string;
  walletAddress: string;
  amount: bigint;
  choice: "YES" | "NO";
}

export class PredictionService {
  async placePrediction(input: PlacePredictionInput) {
    const market = await marketRepository.findById(input.marketId);
    if (!market) {
      throw new Error("Market not found");
    }

    if (market.status !== "ACTIVE") {
      throw new Error("Market is not active");
    }

    if (new Date() > new Date(market.resolutionDate)) {
      throw new Error("Market resolution date has passed");
    }

    const user = await userRepository.findByWalletAddress(input.walletAddress);
    if (!user) {
      throw new Error("User not found");
    }

    if (user.balance < input.amount) {
      throw new Error("Insufficient balance");
    }

    // Deduct from user balance
    await userRepository.decrementBalance(input.walletAddress, input.amount);

    // Create prediction
    const prediction = await predictionRepository.create({
      marketId: input.marketId,
      walletAddress: input.walletAddress,
      amount: input.amount,
      choice: input.choice,
    });

    // Update market totals
    const field = input.choice === "YES" ? "totalYesAmount" : "totalNoAmount";
    const currentMarket = await marketRepository.findById(input.marketId);
    
    if (currentMarket) {
      const newTotal = input.choice === "YES"
        ? (BigInt(currentMarket.totalYesAmount || 0) + input.amount).toString()
        : (BigInt(currentMarket.totalNoAmount || 0) + input.amount).toString();
      
      await marketRepository.update(input.marketId, {
        [field]: newTotal,
      });
    }

    return prediction;
  }

  async getPrediction(id: string) {
    const prediction = await predictionRepository.findById(id);
    if (!prediction) {
      throw new Error("Prediction not found");
    }

    const market = await marketRepository.findById(prediction.marketId);
    return {
      ...prediction,
      market,
    };
  }

  async getUserPredictions(walletAddress: string) {
    return predictionRepository.findByWalletAddress(walletAddress);
  }

  async getMarketPredictions(marketId: string) {
    return predictionRepository.findByMarketId(marketId);
  }

  async getUnclaimedWinnings(walletAddress: string) {
    return predictionRepository.findUnclaimed(walletAddress);
  }

  async claimWinnings(walletAddress: string) {
    const unclaimed = await predictionRepository.findUnclaimed(walletAddress);
    
    if (unclaimed.length === 0) {
      throw new Error("No unclaimed winnings");
    }

    let totalWinnings = 0n;

    for (const prediction of unclaimed) {
      if (prediction.winnings) {
        totalWinnings += BigInt(prediction.winnings);
        await predictionRepository.update(prediction.id, {
          claimed: "CLAIMED",
          claimedAt: new Date(),
        });
      }
    }

    if (totalWinnings > 0n) {
      await userRepository.incrementBalance(walletAddress, totalWinnings);
    }

    return {
      claimed: unclaimed.length,
      totalWinnings: totalWinnings.toString(),
    };
  }

  async listPredictions(limit: number = 100, offset: number = 0) {
    return predictionRepository.list(limit, offset);
  }
}

export const predictionService = new PredictionService();
