import { Router } from "express";
import { authMiddleware } from "../middleware/auth-middleware";

const router = Router();

router.post("/", authMiddleware, async (req, res) => {
  res.status(201).json({ prediction_id: "pred_1" });
});

export default router;
