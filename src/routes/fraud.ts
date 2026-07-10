import { Router, Request, Response, NextFunction } from "express";
import { fraudService } from "../services/fraud-service";
import { authMiddleware } from "../middleware/auth-middleware";
import { logger } from "../utils/logger";

const router = Router();

interface AuthRequest extends Request {
  user?: any;
}

// Check user fraud
router.post("/check", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { walletAddress } = req.body;

    if (!walletAddress) {
      return res.status(400).json({
        success: false,
        error: "Wallet address is required",
      });
    }

    const result = await fraudService.checkUserFraud(walletAddress);

    return res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    next(error);
  }
});

// Get user fraud profile
router.get("/:walletAddress/profile", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { walletAddress } = req.params;

    const profile = await fraudService.getUserFraudProfile(walletAddress);

    return res.json({
      success: true,
      data: profile,
    });
  } catch (error: any) {
    next(error);
  }
});

// Get fraud history
router.get("/:walletAddress/history", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { walletAddress } = req.params;

    const history = await fraudService.getFraudHistory(walletAddress);

    return res.json({
      success: true,
      data: history,
    });
  } catch (error: any) {
    next(error);
  }
});

// Get high risk users (admin)
router.get("/admin/high-risk", authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const users = await fraudService.getHighRiskUsers();

    return res.json({
      success: true,
      data: {
        count: users.length,
        users,
      },
    });
  } catch (error: any) {
    next(error);
  }
});

// List fraud records (admin)
router.get("/admin/records", authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { limit = 100, offset = 0 } = req.query;

    const records = await fraudService.listFraudRecords(Number(limit), Number(offset));

    return res.json({
      success: true,
      data: records,
      pagination: { limit: Number(limit), offset: Number(offset) },
    });
  } catch (error: any) {
    next(error);
  }
});

// Update fraud status (admin)
router.patch("/:recordId/status", authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { recordId } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        error: "Status is required",
      });
    }

    const updated = await fraudService.updateFraudStatus(recordId, status);

    return res.json({
      success: true,
      data: updated,
    });
  } catch (error: any) {
    next(error);
  }
});

export default router;
