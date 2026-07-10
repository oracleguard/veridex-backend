import { Worker, Queue } from "bullmq";
import { marketService } from "../services/market-service";
import { fraudService } from "../services/fraud-service";
import { logger } from "../utils/logger";
import { Redis } from "ioredis";

const redis = new Redis({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

// Create queues
export const marketResolutionQueue = new Queue("market-resolution", { connection: redis });
export const fraudScoringQueue = new Queue("fraud-scoring", { connection: redis });

// Market Resolution Worker
export const marketResolutionWorker = new Worker(
  "market-resolution",
  async (job) => {
    try {
      logger.info(`Processing market resolution job: ${job.data.marketId}`);
      
      const market = await marketService.getMarket(job.data.marketId);
      
      if (market.status === "ACTIVE" && new Date() > new Date(market.resolutionDate)) {
        await marketService.resolveMarket(job.data.marketId, job.data.resolution);
        logger.info(`Market ${job.data.marketId} resolved successfully`);
      }
    } catch (error: any) {
      logger.error(`Error processing market resolution: ${error.message}`);
      throw error;
    }
  },
  { connection: redis }
);

// Fraud Scoring Worker
export const fraudScoringWorker = new Worker(
  "fraud-scoring",
  async (job) => {
    try {
      logger.info(`Processing fraud scoring job for: ${job.data.walletAddress}`);
      
      await fraudService.checkUserFraud(job.data.walletAddress);
      logger.info(`Fraud check completed for: ${job.data.walletAddress}`);
    } catch (error: any) {
      logger.error(`Error processing fraud scoring: ${error.message}`);
      throw error;
    }
  },
  { connection: redis }
);

// Job event handlers
marketResolutionWorker.on("completed", (job) => {
  logger.info(`Market resolution job ${job.id} completed`);
});

marketResolutionWorker.on("failed", (job, error) => {
  logger.error(`Market resolution job ${job?.id} failed: ${error.message}`);
});

fraudScoringWorker.on("completed", (job) => {
  logger.info(`Fraud scoring job ${job.id} completed`);
});

fraudScoringWorker.on("failed", (job, error) => {
  logger.error(`Fraud scoring job ${job?.id} failed: ${error.message}`);
});

// Schedule market resolution checks every minute
export async function scheduleMarketResolution() {
  try {
    const pendingMarkets = await marketService.getPendingResolution();
    
    for (const market of pendingMarkets) {
      await marketResolutionQueue.add(
        "resolve",
        {
          marketId: market.id,
          resolution: "NO", // Default to NO if not specified
        },
        {
          delay: 0,
          attempts: 3,
          backoff: {
            type: "exponential",
            delay: 2000,
          },
        }
      );
    }

    logger.info(`Scheduled ${pendingMarkets.length} market resolutions`);
  } catch (error: any) {
    logger.error(`Error scheduling market resolutions: ${error.message}`);
  }
}

// Schedule fraud checks
export async function scheduleFraudCheck(walletAddress: string) {
  try {
    await fraudScoringQueue.add(
      "check",
      { walletAddress },
      {
        delay: 0,
        attempts: 2,
        backoff: {
          type: "exponential",
          delay: 1000,
        },
      }
    );

    logger.info(`Scheduled fraud check for: ${walletAddress}`);
  } catch (error: any) {
    logger.error(`Error scheduling fraud check: ${error.message}`);
  }
}
