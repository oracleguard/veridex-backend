import { UserService } from "../../src/services/user-service";
import * as userRepo from "../../src/db/repositories/user-repository";

jest.mock("../../src/db/repositories/user-repository");
jest.mock("bcryptjs");
jest.mock("jsonwebtoken");

describe("UserService", () => {
  let userService: UserService;

  beforeEach(() => {
    userService = new UserService();
    jest.clearAllMocks();
  });

  describe("registerUser", () => {
    it("should register a new user", async () => {
      const mockUser = {
        id: "user-123",
        walletAddress: "wallet_address",
        username: "wallet_a",
        email: "test@example.com",
      };

      (userRepo.userRepository.findByWalletAddress as jest.Mock).mockResolvedValue(null);
      (userRepo.userRepository.create as jest.Mock).mockResolvedValue(mockUser);

      const result = await userService.registerUser("wallet_address", "test@example.com");

      expect(result).toEqual(mockUser);
      expect(userRepo.userRepository.create).toHaveBeenCalled();
    });

    it("should throw error if user already exists", async () => {
      const existingUser = { id: "user-123", walletAddress: "wallet_address" };

      (userRepo.userRepository.findByWalletAddress as jest.Mock).mockResolvedValue(existingUser);

      await expect(userService.registerUser("wallet_address")).rejects.toThrow("User already exists");
    });
  });

  describe("generateJWT", () => {
    it("should generate a JWT token", async () => {
      const token = await userService.generateJWT("user-123");

      expect(token).toBeDefined();
      expect(typeof token).toBe("string");
    });
  });

  describe("getUserProfile", () => {
    it("should return user profile with fraud info", async () => {
      const mockUser = {
        id: "user-123",
        walletAddress: "wallet_address",
        username: "testuser",
        email: "test@example.com",
        balance: 1000n,
        createdAt: new Date(),
      };

      (userRepo.userRepository.findByWalletAddress as jest.Mock).mockResolvedValue(mockUser);

      const result = await userService.getUserProfile("wallet_address");

      expect(result.walletAddress).toBe("wallet_address");
      expect(result.username).toBe("testuser");
    });
  });
});
