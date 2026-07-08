import { Router } from "express";
import { authMiddleware } from "../middleware/auth-middleware";

const router = Router();

router.get("/", async (req, res) => {
  res.json({ markets: [] });
});

router.post("/", authMiddleware, async (req, res) => {
  res.status(201).json({ id: "mk_1" });
});

export default router;
