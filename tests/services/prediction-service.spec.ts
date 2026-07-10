import { PredictionService } from "../../src/services/prediction-service";
import * as predictionRepo from "../../src/db/repositories/prediction-repository";
import * as marketRepo from "../../src/db/repositories/market-repository";
import * as userRepo from "../../src/db/repositories/user-repository";

jest.mock("../../src/db/repositories/prediction-repository");
jest.mock("../../src/db/repositories/market-repository");
jest.mock("../../src/db/repositories/user-repository");

describe("PredictionService", () => {
  let predictionService: PredictionService;

  beforeEach(() => {
    predictionService = new PredictionService();
    jest.clearAllMocks();
  });

  describe("placePrediction", () => {
    it("should place a new prediction", async () => {
      const mockMarket = {
        id: "market-123",
        status: "ACTIVE",
        resolutionDate: new Date(Date.now() + 86400000),
      };

      const mockUser = {
        id: "user-123",
        balance: 10000n,
      };

      const mockPrediction = {
        id: "pred-123",
        marketId: "market-123",
        walletAddress: "wallet_address",
        amount: 100n,
        choice: "YES",
      };

      (marketRepo.marketRepository.findById as jest.Mock).mockResolvedValue(mockMarket);
      (userRepo.userRepository.findByWalletAddress as jest.Mock).mockResolvedValue(mockUser);
      (userRepo.userRepository.decrementBalance as jest.Mock).mockResolvedValue(mockUser);
      (predictionRepo.predictionRepository.create as jest.Mock).mockResolvedValue(mockPrediction);

      const result = await predictionService.placePrediction({
        marketId: "market-123",
        walletAddress: "wallet_address",
        amount: 100n,
        choice: "YES",
      });

      expect(result.id).toBe("pred-123");
      expect(predictionRepo.predictionRepository.create).toHaveBeenCalled();
    });

    it("should throw error if user has insufficient balance", async () => {
      const mockMarket = {
        id: "market-123",
        status: "ACTIVE",
        resolutionDate: new Date(Date.now() + 86400000),
      };

      const mockUser = {
        id: "user-123",
        balance: 10n, // Insufficient
      };

      (marketRepo.marketRepository.findById as jest.Mock).mockResolvedValue(mockMarket);
      (userRepo.userRepository.findByWalletAddress as jest.Mock).mockResolvedValue(mockUser);

      await expect(
        predictionService.placePrediction({
          marketId: "market-123",
          walletAddress: "wallet_address",
          amount: 100n,
          choice: "YES",
        })
      ).rejects.toThrow("Insufficient balance");
    });
  });
});
