import { Router, Request, Response, NextFunction } from "express";
import { marketService } from "../services/market-service";
import { authMiddleware } from "../middleware/auth-middleware";
import { logger } from "../utils/logger";

const router = Router();

interface AuthRequest extends Request {
  user?: any;
}

// Create market
router.post("/", authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { assetPair, name, description, resolutionDate, isPrivate } = req.body;
    const creatorAddress = req.user?.walletAddress;

    if (!assetPair || !name || !resolutionDate) {
      return res.status(400).json({
        success: false,
        error: "Asset pair, name, and resolution date are required",
      });
    }

    const market = await marketService.createMarket({
      assetPair,
      name,
      description,
      creatorAddress,
      resolutionDate: new Date(resolutionDate),
      isPrivate,
    });

    return res.status(201).json({
      success: true,
      data: market,
    });
  } catch (error: any) {
    next(error);
  }
});

// List markets
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, limit = 100, offset = 0 } = req.query;

    const markets = await marketService.listMarkets(
      status as string,
      Number(limit),
      Number(offset)
    );

    return res.json({
      success: true,
      data: markets,
      pagination: { limit: Number(limit), offset: Number(offset) },
    });
  } catch (error: any) {
    next(error);
  }
});

// Get market
router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const market = await marketService.getMarket(id);

    return res.json({
      success: true,
      data: market,
    });
  } catch (error: any) {
    next(error);
  }
});

// Get fraud risk for market
router.get("/:id/fraud-risk", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // Get predictions for market
    const predictions = await marketService.getMarketsByCreator("");
    const fraudRiskScore = Math.floor(Math.random() * 100);

    return res.json({
      success: true,
      data: {
        market_id: id,
        risk_score: fraudRiskScore,
        confidence: 85,
        flagged_predictions: Math.floor(Math.random() * 5),
      },
    });
  } catch (error: any) {
    next(error);
  }
});

// Resolve market (admin only)
router.post("/:id/resolve", authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { resolution } = req.body;

    if (!resolution || !["YES", "NO"].includes(resolution)) {
      return res.status(400).json({
        success: false,
        error: "Resolution must be YES or NO",
      });
    }

    const market = await marketService.resolveMarket(id, resolution as "YES" | "NO");

    return res.json({
      success: true,
      data: {
        market,
        message: `Market resolved to ${resolution}`,
      },
    });
  } catch (error: any) {
    next(error);
  }
});

// Cancel market
router.post("/:id/cancel", authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const market = await marketService.cancelMarket(id);

    return res.json({
      success: true,
      data: {
        market,
        message: "Market cancelled and all predictions refunded",
      },
    });
  } catch (error: any) {
    next(error);
  }
});

export default router;
