import express from "express";
import { config } from "dotenv";

config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    service: "veridex-backend",
    version: "1.0.0"
  });
});

// API routes
app.get("/api/markets", (req, res) => {
  res.json({ markets: [] });
});

app.post("/api/markets", (req, res) => {
  res.json({ id: "mk_123", ...req.body });
});

app.get("/api/markets/:id/fraud-risk", (req, res) => {
  res.json({
    market_id: req.params.id,
    risk_score: 42,
    confidence: 87
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`✓ Server running on port ${PORT}`);
});
