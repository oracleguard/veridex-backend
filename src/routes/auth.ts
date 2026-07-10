import { Router, Request, Response, NextFunction } from "express";
import { userService } from "../services/user-service";
import { logger } from "../utils/logger";

const router = Router();

interface AuthRequest extends Request {
  user?: any;
}

// Register
router.post("/register", async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { walletAddress, email, password } = req.body;

    if (!walletAddress) {
      return res.status(400).json({
        success: false,
        error: "Wallet address is required",
      });
    }

    const user = await userService.registerUser(walletAddress, email, password);
    const token = await userService.generateJWT(user.id);

    return res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          walletAddress: user.walletAddress,
          email: user.email,
        },
        token,
      },
    });
  } catch (error: any) {
    next(error);
  }
});

// Login
router.post("/login", async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Email and password are required",
      });
    }

    const user = await userService.authenticateUser(email, password);
    const token = await userService.generateJWT(user.id);

    return res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          walletAddress: user.walletAddress,
          email: user.email,
        },
        token,
      },
    });
  } catch (error: any) {
    next(error);
  }
});

// Verify token
router.post("/verify", async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: "Token is required",
      });
    }

    const decoded = await userService.verifyJWT(token);

    return res.json({
      success: true,
      data: { valid: true, userId: typeof decoded === 'object' ? decoded.userId : decoded },
    });
  } catch (error: any) {
    next(error);
  }
});

export default router;
