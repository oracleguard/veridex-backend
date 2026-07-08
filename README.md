# Veridex Backend

Prediction market API with integrated fraud detection.

Merged from: Predictify + Veridex fraud integration

## Stack
- Node.js 20 + TypeScript
- Express
- PostgreSQL + Drizzle
- Redis + BullMQ

## Quick Start

```bash
docker-compose up -d
npm install && npm run dev
curl http://localhost:3001/health
```

## API Endpoints

- `POST /api/markets` - Create market
- `GET /api/markets` - List markets
- `POST /api/predictions` - Place prediction
- `GET /api/markets/:id/fraud-risk` - Get fraud risk (NEW)
- `GET /api/users/:addr/fraud-profile` - User fraud profile (NEW)

## Documentation

See [docs/API.md](docs/) for full reference.
