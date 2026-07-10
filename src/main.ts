import express, { Express, Request, Response } from "express";
import { config } from "dotenv";
import { corsMiddleware } from "./middleware/cors";
import { rateLimiter, strictRateLimiter } from "./middleware/rate-limit";
import { errorHandler } from "./middleware/error-handler";
import { logger } from "./utils/logger";
import authRoutes from "./routes/auth";
import userRoutes from "./routes/users";
import marketRoutes from "./routes/markets";
import predictionRoutes from "./routes/predictions";
import fraudRoutes from "./routes/fraud";
import { scheduleMarketResolution } from "./workers";

config();

const app: Express = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(corsMiddleware);
app.use(rateLimiter);

// Health check
app.get("/health", (req: Request, res: Response) => {
  res.json({
    status: "healthy",
    service: "veridex-backend",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use("/api/auth", strictRateLimiter, authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/markets", marketRoutes);
app.use("/api/predictions", predictionRoutes);
app.use("/api/fraud", fraudRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: "Endpoint not found",
  });
});

// Error handler (must be last)
app.use(errorHandler);

// Start server
const server = app.listen(PORT, async () => {
  logger.info(`✓ Server running on port ${PORT}`);
  logger.info(`✓ Environment: ${process.env.NODE_ENV || "development"}`);

  // Schedule background jobs
  try {
    // Run market resolution check every minute
    setInterval(scheduleMarketResolution, 60000);
    logger.info("✓ Background job scheduler started");
  } catch (error: any) {
    logger.error(`Error starting background jobs: ${error.message}`);
  }
});

// Graceful shutdown
process.on("SIGTERM", () => {
  logger.info("SIGTERM received, shutting down gracefully...");
  server.close(() => {
    logger.info("Server closed");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  logger.info("SIGINT received, shutting down gracefully...");
  server.close(() => {
    logger.info("Server closed");
    process.exit(0);
  });
});

export default app;
