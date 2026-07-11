import { MarketService } from "../../src/services/market-service";
import * as marketRepo from "../../src/db/repositories/market-repository";
import * as userRepo from "../../src/db/repositories/user-repository";
import * as predictionRepo from "../../src/db/repositories/prediction-repository";

jest.mock("../../src/db/repositories/market-repository");
jest.mock("../../src/db/repositories/user-repository");
jest.mock("../../src/db/repositories/prediction-repository");

describe("MarketService", () => {
  let marketService: MarketService;

  beforeEach(() => {
    marketService = new MarketService();
    jest.clearAllMocks();
  });

  describe("createMarket", () => {
    it("should create a new market", async () => {
      const mockUser = { id: "user-123", walletAddress: "creator_address" };
      const mockMarket = {
        id: "market-123",
        assetPair: "BTC/USD",
        name: "Bitcoin Price",
        creatorAddress: "creator_address",
        status: "ACTIVE",
      };

      (userRepo.userRepository.findByWalletAddress as jest.Mock).mockResolvedValue(mockUser);
      (marketRepo.marketRepository.create as jest.Mock).mockResolvedValue(mockMarket);

      const result = await marketService.createMarket({
        assetPair: "BTC/USD",
        name: "Bitcoin Price",
        creatorAddress: "creator_address",
        resolutionDate: new Date(Date.now() + 86400000),
      });

      expect(result.id).toBe("market-123");
      expect(marketRepo.marketRepository.create).toHaveBeenCalled();
    });

    it("should throw error if resolution date is in the past", async () => {
      const mockUser = { id: "user-123", walletAddress: "creator_address" };

      (userRepo.userRepository.findByWalletAddress as jest.Mock).mockResolvedValue(mockUser);

      await expect(
        marketService.createMarket({
          assetPair: "BTC/USD",
          name: "Bitcoin Price",
          creatorAddress: "creator_address",
          resolutionDate: new Date(Date.now() - 1000),
        })
      ).rejects.toThrow("Resolution date must be in the future");
    });
  });

  describe("resolveMarket", () => {
    it("should resolve a market", async () => {
      const mockMarket = {
        id: "market-123",
        status: "ACTIVE",
        totalYesAmount: "1000",
        totalNoAmount: "500",
      };

      (marketRepo.marketRepository.findById as jest.Mock).mockResolvedValue(mockMarket);
      (predictionRepo.predictionRepository.findByMarketId as jest.Mock).mockResolvedValue([]);
      (marketRepo.marketRepository.resolveMarket as jest.Mock).mockResolvedValue({
        ...mockMarket,
        status: "RESOLVED",
        resolution: "YES",
      });

      const result = await marketService.resolveMarket("market-123", "YES");

      expect(result.status).toBe("RESOLVED");
      expect(result.resolution).toBe("YES");
    });
  });
});
