export const config = {
  port: parseInt(process.env.PORT || "3001"),
  database_url: process.env.DATABASE_URL || "",
  redis_url: process.env.REDIS_URL || "redis://localhost:6379",
  jwt_secret: process.env.JWT_SECRET || "secret",
  detection_api: process.env.DETECTION_API_URL || "http://localhost:8000",
};
