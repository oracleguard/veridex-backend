import { Router, Request, Response } from "express";
import { scoreWallet, scoreMarket } from "../services/fraud-client";

const router = Router();

/**
 * GET /api/markets/:id/fraud-risk
 * Get fraud risk assessment for a market
 */
router.get("/markets/:id/fraud-risk", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // TODO: Fetch market from database to get asset_pair
    const assetPair = "XLM/USDC"; // Placeholder
    
    const riskData = await scoreMarket(assetPair);
    
    if (!riskData) {
      return res.status(503).json({
        error: "Fraud detection service unavailable",
        market_id: id
      });
    }
    
    res.json({
      market_id: id,
      asset_pair: assetPair,
      ...riskData,
      retrieved_at: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error fetching market fraud risk:", error);
    res.status(500).json({
      error: "Failed to fetch fraud risk",
      market_id: req.params.id
    });
  }
});

/**
 * GET /api/users/:addr/fraud-profile
 * Get fraud profile for a wallet address
 */
router.get("/users/:addr/fraud-profile", async (req: Request, res: Response) => {
  try {
    const { addr } = req.params;
    
    // Validate Stellar address format
    if (!addr.startsWith("G") || addr.length !== 56) {
      return res.status(400).json({
        error: "Invalid Stellar address",
        provided: addr
      });
    }
    
    const riskScore = await scoreWallet(addr);
    
    if (riskScore === null) {
      return res.status(503).json({
        error: "Fraud detection service unavailable",
        wallet: addr
      });
    }
    
    res.json({
      wallet: addr,
      risk_score: riskScore,
      risk_level: 
        riskScore < 30 ? "low" :
        riskScore < 60 ? "medium" :
        riskScore < 80 ? "high" :
        "critical",
      retrieved_at: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error fetching wallet fraud profile:", error);
    res.status(500).json({
      error: "Failed to fetch fraud profile",
      wallet: req.params.addr
    });
  }
});

/**
 * GET /api/fraud/alerts
 * Get recent fraud alerts
 */
router.get("/fraud/alerts", async (req: Request, res: Response) => {
  try {
    const { limit = 100, min_score = 70 } = req.query;
    
    // TODO: Fetch alerts from detection engine or local cache
    
    res.json({
      alerts: [],
      total: 0,
      limit: parseInt(limit as string),
      min_score: parseInt(min_score as string),
      retrieved_at: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error fetching fraud alerts:", error);
    res.status(500).json({
      error: "Failed to fetch fraud alerts"
    });
  }
});

export default router;
