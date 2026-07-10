import request from "supertest";
import express from "express";
import marketRoutes from "../../src/routes/markets";

const app = express();
app.use(express.json());
app.use("/api/markets", marketRoutes);

jest.mock("../../src/services/market-service");
const { marketService } = require("../../src/services/market-service");

jest.mock("../../src/middleware/auth-middleware", () => ({
  authMiddleware: (req: any, res: any, next: any) => {
    req.user = { walletAddress: "test_wallet" };
    next();
  },
}));

describe("Market Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /api/markets", () => {
    it("should create a new market", async () => {
      const mockMarket = {
        id: "market-123",
        assetPair: "BTC/USD",
        name: "Bitcoin Price",
        status: "ACTIVE",
      };

      marketService.createMarket.mockResolvedValue(mockMarket);

      const response = await request(app).post("/api/markets").send({
        assetPair: "BTC/USD",
        name: "Bitcoin Price",
        resolutionDate: new Date(Date.now() + 86400000),
      });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe("market-123");
    });

    it("should return 400 if required fields are missing", async () => {
      const response = await request(app).post("/api/markets").send({
        assetPair: "BTC/USD",
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe("GET /api/markets", () => {
    it("should list all markets", async () => {
      const mockMarkets = [
        { id: "market-1", assetPair: "BTC/USD", status: "ACTIVE" },
        { id: "market-2", assetPair: "ETH/USD", status: "ACTIVE" },
      ];

      marketService.listMarkets.mockResolvedValue(mockMarkets);

      const response = await request(app).get("/api/markets");

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
    });
  });

  describe("GET /api/markets/:id", () => {
    it("should get market details", async () => {
      const mockMarket = {
        id: "market-123",
        assetPair: "BTC/USD",
        name: "Bitcoin Price",
        status: "ACTIVE",
        yesCount: 100,
        noCount: 150,
      };

      marketService.getMarket.mockResolvedValue(mockMarket);

      const response = await request(app).get("/api/markets/market-123");

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.yesCount).toBe(100);
    });
  });

  describe("POST /api/markets/:id/resolve", () => {
    it("should resolve a market", async () => {
      const mockMarket = {
        id: "market-123",
        status: "RESOLVED",
        resolution: "YES",
      };

      marketService.resolveMarket.mockResolvedValue(mockMarket);

      const response = await request(app).post("/api/markets/market-123/resolve").send({
        resolution: "YES",
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.market.status).toBe("RESOLVED");
    });
  });

  describe("POST /api/markets/:id/cancel", () => {
    it("should cancel a market", async () => {
      const mockMarket = {
        id: "market-123",
        status: "CANCELLED",
        resolution: "CANCELLED",
      };

      marketService.cancelMarket.mockResolvedValue(mockMarket);

      const response = await request(app).post("/api/markets/market-123/cancel");

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.market.status).toBe("CANCELLED");
    });
  });
});
