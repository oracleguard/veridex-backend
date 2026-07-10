export const redisConfig = {
  url: process.env.REDIS_URL || "redis://localhost:6379",
  // Note: ioredis v5 doesn't use maxRetries/enableReadyCheck in options
  // These are handled via connection URL
};
