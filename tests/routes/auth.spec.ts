import request from "supertest";
import express from "express";
import authRoutes from "../../src/routes/auth";

const app = express();
app.use(express.json());
app.use("/api/auth", authRoutes);

jest.mock("../../src/services/user-service");
const { userService } = require("../../src/services/user-service");

describe("Auth Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /api/auth/register", () => {
    it("should register a new user", async () => {
      const mockUser = {
        id: "user-123",
        walletAddress: "wallet_address",
        email: "test@example.com",
      };

      userService.registerUser.mockResolvedValue(mockUser);
      userService.generateJWT.mockResolvedValue("jwt_token");

      const response = await request(app).post("/api/auth/register").send({
        walletAddress: "wallet_address",
        email: "test@example.com",
        password: "password123",
      });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.walletAddress).toBe("wallet_address");
    });

    it("should return 400 if wallet address is missing", async () => {
      const response = await request(app).post("/api/auth/register").send({
        email: "test@example.com",
        password: "password123",
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe("POST /api/auth/login", () => {
    it("should login a user", async () => {
      const mockUser = {
        id: "user-123",
        walletAddress: "wallet_address",
        email: "test@example.com",
      };

      userService.authenticateUser.mockResolvedValue(mockUser);
      userService.generateJWT.mockResolvedValue("jwt_token");

      const response = await request(app).post("/api/auth/login").send({
        email: "test@example.com",
        password: "password123",
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBe("jwt_token");
    });
  });

  describe("POST /api/auth/verify", () => {
    it("should verify a token", async () => {
      userService.verifyJWT.mockResolvedValue({ userId: "user-123" });

      const response = await request(app).post("/api/auth/verify").send({
        token: "jwt_token",
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.valid).toBe(true);
    });
  });
});
