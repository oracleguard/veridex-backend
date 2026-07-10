export const config = {
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || "development",
  databaseUrl: process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/veridex",
  redisUrl: process.env.REDIS_URL || "redis://localhost:6379",
  jwtSecret: process.env.JWT_SECRET || "your-secret-key",
  corsOrigin: process.env.CORS_ORIGIN || "*",
  detectionApiUrl: process.env.DETECTION_API_URL || "http://localhost:8000",
  logLevel: process.env.LOG_LEVEL || "info",
};
