# Veridex Backend

A comprehensive prediction market API with integrated fraud detection, built with Node.js, TypeScript, PostgreSQL, and Redis.

## Features

✅ **Complete Prediction Market System**
- Create and manage markets
- Place predictions with YES/NO outcomes
- Automatic market resolution with winner calculation
- Winnings distribution and claiming

✅ **User Management**
- Wallet-based registration and authentication
- Email/password optional authentication
- Balance tracking and fund transfers
- User fraud profiles

✅ **Fraud Detection Integration**
- Real-time fraud risk assessment
- Risk scoring and categorization
- Fraud history tracking
- High-risk user identification

✅ **Background Processing**
- BullMQ job queue for market resolution
- Automatic fraud scoring
- Scheduled background tasks

✅ **Production-Ready**
- JWT authentication
- Rate limiting and CORS
- Comprehensive error handling
- Pino logging
- Unit and integration tests

## Stack

- **Runtime**: Node.js 20 + TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL + Drizzle ORM
- **Cache/Queue**: Redis + BullMQ
- **Auth**: JWT + bcryptjs
- **Logging**: Pino
- **Testing**: Jest + Supertest

## Quick Start

### Prerequisites

- Docker & Docker Compose
- Node.js 20+
- npm or yarn

### Installation

```bash
# Clone and install
npm install

# Start services (PostgreSQL, Redis)
docker-compose up -d

# Run development server
npm run dev

# Verify health
curl http://localhost:3001/health
```

### Environment Setup

Copy `.env.example` to `.env.development`:

```bash
cp .env.example .env.development
```

Update with your configuration:

```
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/veridex
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_jwt_secret_here
DETECTION_API_URL=http://localhost:8000
CORS_ORIGIN=*
LOG_LEVEL=info
```

## API Endpoints

### Authentication

```
POST   /api/auth/register        - Register new user
POST   /api/auth/login           - Login user
POST   /api/auth/verify          - Verify JWT token
```

### Users

```
GET    /api/users/:walletAddress - Get user profile
POST   /api/users/:walletAddress/deposit   - Deposit funds
POST   /api/users/:walletAddress/withdraw  - Withdraw funds
```

### Markets

```
GET    /api/markets                        - List all markets
POST   /api/markets                        - Create market (auth required)
GET    /api/markets/:id                    - Get market details
GET    /api/markets/:id/fraud-risk         - Get market fraud risk score
POST   /api/markets/:id/resolve            - Resolve market (auth required)
POST   /api/markets/:id/cancel             - Cancel market (auth required)
```

### Predictions

```
GET    /api/predictions                    - List all predictions
POST   /api/predictions                    - Place prediction (auth required)
GET    /api/predictions/:id                - Get prediction details
GET    /api/predictions/user/:walletAddress     - Get user predictions
GET    /api/predictions/market/:marketId       - Get market predictions
GET    /api/predictions/:walletAddress/unclaimed - Get unclaimed winnings
POST   /api/predictions/:walletAddress/claim    - Claim winnings (auth required)
```

### Fraud Detection

```
POST   /api/fraud/check                    - Check fraud for wallet
GET    /api/fraud/:walletAddress/profile   - Get user fraud profile
GET    /api/fraud/:walletAddress/history   - Get fraud check history
GET    /api/fraud/admin/high-risk          - List high-risk users (admin)
GET    /api/fraud/admin/records            - List all fraud records (admin)
PATCH  /api/fraud/:recordId/status         - Update fraud status (admin)
```

## Project Structure

```
src/
├── db/
│   ├── schema/           # Drizzle ORM table definitions
│   ├── repositories/     # Data access layer
│   ├── client.ts         # Database connection
│   └── init.ts           # Migration runner
├── services/             # Business logic
│   ├── user-service.ts
│   ├── market-service.ts
│   ├── prediction-service.ts
│   └── fraud-service.ts
├── routes/               # API endpoints
│   ├── auth.ts
│   ├── users.ts
│   ├── markets.ts
│   ├── predictions.ts
│   └── fraud.ts
├── middleware/           # Express middleware
│   ├── auth-middleware.ts
│   ├── cors.ts
│   ├── rate-limit.ts
│   └── error-handler.ts
├── workers/              # Background jobs
│   └── market-resolution.ts
├── utils/                # Utility functions
├── types/                # TypeScript types
├── config/               # Configuration
└── main.ts               # Application entry point

tests/
├── services/             # Service unit tests
└── routes/               # Route integration tests
```

## Database Schema

### Users
- `id` (UUID, PK)
- `walletAddress` (VARCHAR, unique)
- `username` (VARCHAR)
- `email` (VARCHAR, unique)
- `passwordHash` (VARCHAR)
- `balance` (BIGINT)
- `createdAt`, `updatedAt` (TIMESTAMP)

### Markets
- `id` (UUID, PK)
- `assetPair` (VARCHAR)
- `name` (VARCHAR)
- `description` (TEXT)
- `creatorAddress` (VARCHAR, FK → users)
- `status` (VARCHAR: ACTIVE, RESOLVED, CANCELLED)
- `resolution` (VARCHAR: YES, NO, CANCELLED)
- `totalYesAmount`, `totalNoAmount` (NUMERIC)
- `resolutionDate` (TIMESTAMP)
- `isPrivate` (BOOLEAN)
- `createdAt`, `updatedAt` (TIMESTAMP)

### Predictions
- `id` (UUID, PK)
- `marketId` (UUID, FK → markets)
- `walletAddress` (VARCHAR)
- `amount` (BIGINT)
- `choice` (VARCHAR: YES, NO)
- `winnings` (NUMERIC)
- `claimed` (VARCHAR: CLAIMED, UNCLAIMED, PENDING)
- `claimedAt` (TIMESTAMP)
- `createdAt`, `updatedAt` (TIMESTAMP)

### Fraud Records
- `id` (UUID, PK)
- `walletAddress` (VARCHAR)
- `userId` (UUID, FK → users)
- `riskScore` (NUMERIC)
- `riskLevel` (VARCHAR: LOW, MEDIUM, HIGH, CRITICAL)
- `flaggedFields` (TEXT, JSON)
- `details` (TEXT, JSON)
- `status` (VARCHAR: PENDING, REVIEWED, RESOLVED)
- `createdAt`, `updatedAt` (TIMESTAMP)

## Background Jobs

### Market Resolution
- Runs every minute
- Checks for markets past resolution date
- Calculates winnings based on market resolution
- Distributes winnings to winners

### Fraud Scoring
- Triggered on user registration and prediction placement
- Calls external fraud detection API
- Stores risk assessment in database
- Updates user fraud profile

## Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- user-service.spec.ts

# Watch mode
npm test -- --watch
```

## Development

```bash
# Format code
npm run lint

# Build TypeScript
npm run build

# Production build and start
npm run build && npm start
```

## Error Handling

All endpoints return standardized JSON responses:

### Success Response
```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message"
}
```

## Security

- **JWT Authentication**: Stateless token-based auth with expiration
- **Password Hashing**: bcryptjs with salt rounds
- **Rate Limiting**: 100 requests per 15 minutes globally, 10 per minute on auth endpoints
- **CORS**: Configurable origins
- **Input Validation**: Type-safe with TypeScript

## Deployment

### Docker

```bash
# Build image
docker build -t veridex-backend .

# Run container
docker run -p 3001:3001 \
  -e DATABASE_URL=postgresql://... \
  -e REDIS_URL=redis://... \
  veridex-backend
```

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| NODE_ENV | development | Environment |
| PORT | 3001 | Server port |
| DATABASE_URL | - | PostgreSQL connection |
| REDIS_URL | - | Redis connection |
| JWT_SECRET | - | JWT signing secret |
| DETECTION_API_URL | - | Fraud detection API |
| CORS_ORIGIN | * | CORS allowed origins |
| LOG_LEVEL | info | Logging level |

## Monitoring & Logging

- **Pino Logger**: Structured JSON logging
- **Background Job Tracking**: BullMQ dashboard integration
- **Health Check**: `/health` endpoint for uptime monitoring

## Performance Considerations

- **Database Indexing**: Indexes on frequently queried fields
- **Connection Pooling**: PostgreSQL connection pooling
- **Redis Caching**: Fraud profiles cached via Redis
- **Async Processing**: Background jobs via BullMQ

## Contributing

1. Create feature branch
2. Make changes
3. Run tests
4. Commit with descriptive message
5. Push and create pull request

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.
