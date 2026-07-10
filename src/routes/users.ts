import { Router, Request, Response, NextFunction } from "express";
import { userService } from "../services/user-service";
import { authMiddleware } from "../middleware/auth-middleware";
import { logger } from "../utils/logger";

const router = Router();

interface AuthRequest extends Request {
  user?: any;
}

// Get user profile
router.get("/:walletAddress", async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { walletAddress } = req.params;

    const profile = await userService.getUserProfile(walletAddress);

    return res.json({
      success: true,
      data: profile,
    });
  } catch (error: any) {
    next(error);
  }
});

// Deposit balance
router.post("/:walletAddress/deposit", authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { walletAddress } = req.params;
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: "Valid amount is required",
      });
    }

    const updated = await userService.depositBalance(walletAddress, BigInt(amount));

    return res.json({
      success: true,
      data: {
        balance: updated.balance.toString(),
        message: "Deposit successful",
      },
    });
  } catch (error: any) {
    next(error);
  }
});

// Withdraw balance
router.post("/:walletAddress/withdraw", authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { walletAddress } = req.params;
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: "Valid amount is required",
      });
    }

    const updated = await userService.withdrawBalance(walletAddress, BigInt(amount));

    return res.json({
      success: true,
      data: {
        balance: updated.balance.toString(),
        message: "Withdrawal successful",
      },
    });
  } catch (error: any) {
    next(error);
  }
});

export default router;
