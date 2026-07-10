import { Request, Response, NextFunction } from "express";
import { userService } from "../services/user-service";

interface AuthRequest extends Request {
  user?: any;
}

export async function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        success: false,
        error: "No authentication token provided",
      });
    }

    const decoded = await userService.verifyJWT(token);
    req.user = decoded;

    // Extract wallet address from params or body
    const walletAddress = req.params.walletAddress || req.body.walletAddress;
    if (walletAddress) {
      req.user.walletAddress = walletAddress;
    }

    next();
  } catch (error: any) {
    return res.status(401).json({
      success: false,
      error: "Invalid or expired token",
    });
  }
}
