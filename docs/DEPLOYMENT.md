# Deployment Guide

## Docker Build
```bash
docker build -t veridex-backend .
```

## Docker Run
```bash
docker run -p 3001:3001 veridex-backend
```

## Environment Variables
- DATABASE_URL
- REDIS_URL
- JWT_SECRET
- DETECTION_API_URL
