import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";

export function errorHandler(
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  logger.error("Error:", error.message);

  // Handle specific error types
  if (error.message.includes("not found")) {
    return res.status(404).json({
      success: false,
      error: error.message,
    });
  }

  if (error.message.includes("Invalid") || error.message.includes("required")) {
    return res.status(400).json({
      success: false,
      error: error.message,
    });
  }

  if (error.message.includes("Insufficient")) {
    return res.status(400).json({
      success: false,
      error: error.message,
    });
  }

  // Default error response
  return res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === "production" ? "Internal server error" : error.message,
  });
}
