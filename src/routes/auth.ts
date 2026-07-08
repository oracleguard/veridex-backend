import { Router } from "express";

const router = Router();

router.post("/challenge", async (req, res) => {
  res.json({ challenge: "challenge_string" });
});

router.post("/verify", async (req, res) => {
  res.json({ access_token: "token", refresh_token: "refresh" });
});

export default router;
