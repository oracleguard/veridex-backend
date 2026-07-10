import { Router, Request, Response, NextFunction } from "express";
import { predictionService } from "../services/prediction-service";
import { authMiddleware } from "../middleware/auth-middleware";
import { logger } from "../utils/logger";

const router = Router();

interface AuthRequest extends Request {
  user?: any;
}

// Place prediction
router.post("/", authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { marketId, amount, choice } = req.body;
    const walletAddress = req.user?.walletAddress;

    if (!marketId || !amount || !choice) {
      return res.status(400).json({
        success: false,
        error: "Market ID, amount, and choice are required",
      });
    }

    if (!["YES", "NO"].includes(choice)) {
      return res.status(400).json({
        success: false,
        error: "Choice must be YES or NO",
      });
    }

    const prediction = await predictionService.placePrediction({
      marketId,
      walletAddress,
      amount: BigInt(amount),
      choice: choice as "YES" | "NO",
    });

    return res.status(201).json({
      success: true,
      data: prediction,
    });
  } catch (error: any) {
    next(error);
  }
});

// Get prediction
router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const prediction = await predictionService.getPrediction(id);

    return res.json({
      success: true,
      data: prediction,
    });
  } catch (error: any) {
    next(error);
  }
});

// Get user predictions
router.get("/user/:walletAddress", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { walletAddress } = req.params;

    const predictions = await predictionService.getUserPredictions(walletAddress);

    return res.json({
      success: true,
      data: predictions,
    });
  } catch (error: any) {
    next(error);
  }
});

// Get market predictions
router.get("/market/:marketId", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { marketId } = req.params;

    const predictions = await predictionService.getMarketPredictions(marketId);

    return res.json({
      success: true,
      data: predictions,
    });
  } catch (error: any) {
    next(error);
  }
});

// Get unclaimed winnings
router.get("/:walletAddress/unclaimed", authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { walletAddress } = req.params;

    const unclaimed = await predictionService.getUnclaimedWinnings(walletAddress);

    return res.json({
      success: true,
      data: {
        count: unclaimed.length,
        predictions: unclaimed,
      },
    });
  } catch (error: any) {
    next(error);
  }
});

// Claim winnings
router.post("/:walletAddress/claim", authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { walletAddress } = req.params;

    const result = await predictionService.claimWinnings(walletAddress);

    return res.json({
      success: true,
      data: {
        ...result,
        message: "Winnings claimed successfully",
      },
    });
  } catch (error: any) {
    next(error);
  }
});

// List predictions
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { limit = 100, offset = 0 } = req.query;

    const predictions = await predictionService.listPredictions(
      Number(limit),
      Number(offset)
    );

    return res.json({
      success: true,
      data: predictions,
      pagination: { limit: Number(limit), offset: Number(offset) },
    });
  } catch (error: any) {
    next(error);
  }
});

export default router;
