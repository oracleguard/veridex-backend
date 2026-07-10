# API Documentation

## Base URL

```
http://localhost:3001
```

## Authentication

Most endpoints require a JWT token. Include it in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

## Response Format

All API responses follow a standard format:

### Success Response (200, 201)
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message"
}
```

### Error Response (400, 401, 404, 500)
```json
{
  "success": false,
  "error": "Error description"
}
```

## Authentication Endpoints

### Register User

**POST** `/api/auth/register`

Register a new user with wallet address and optional email/password.

**Request Body:**
```json
{
  "walletAddress": "GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "walletAddress": "GXXX...",
      "email": "user@example.com"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Login

**POST** `/api/auth/login`

Authenticate with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "walletAddress": "GXXX...",
      "email": "user@example.com"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Verify Token

**POST** `/api/auth/verify`

Verify if a JWT token is valid.

**Request Body:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "valid": true,
    "userId": "uuid"
  }
}
```

## User Endpoints

### Get User Profile

**GET** `/api/users/:walletAddress`

Get user profile and fraud risk information.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "walletAddress": "GXXX...",
    "username": "user123",
    "email": "user@example.com",
    "balance": "10000",
    "createdAt": "2024-01-01T00:00:00Z",
    "fraudProfile": {
      "riskScore": 25,
      "riskLevel": "LOW",
      "status": "PENDING",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  }
}
```

### Deposit Funds

**POST** `/api/users/:walletAddress/deposit` (requires auth)

Add funds to user balance.

**Request Body:**
```json
{
  "amount": "1000"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "balance": "11000",
    "message": "Deposit successful"
  }
}
```

### Withdraw Funds

**POST** `/api/users/:walletAddress/withdraw` (requires auth)

Withdraw funds from user balance.

**Request Body:**
```json
{
  "amount": "1000"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "balance": "10000",
    "message": "Withdrawal successful"
  }
}
```

## Market Endpoints

### Create Market

**POST** `/api/markets` (requires auth)

Create a new prediction market.

**Request Body:**
```json
{
  "assetPair": "BTC/USD",
  "name": "Bitcoin Price Above $50,000 by End of Q1",
  "description": "Will BTC price exceed $50k by March 31, 2024?",
  "resolutionDate": "2024-03-31T23:59:59Z",
  "isPrivate": false
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "assetPair": "BTC/USD",
    "name": "Bitcoin Price Above $50,000 by End of Q1",
    "description": "...",
    "creatorAddress": "GXXX...",
    "status": "ACTIVE",
    "totalYesAmount": "0",
    "totalNoAmount": "0",
    "resolutionDate": "2024-03-31T23:59:59Z",
    "createdAt": "2024-01-01T00:00:00Z",
    "isPrivate": false
  }
}
```

### List Markets

**GET** `/api/markets?status=ACTIVE&limit=100&offset=0`

Get paginated list of markets.

**Query Parameters:**
- `status` (optional): Filter by market status (ACTIVE, RESOLVED, CANCELLED)
- `limit` (optional): Number of results (default: 100)
- `offset` (optional): Result offset for pagination (default: 0)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "assetPair": "BTC/USD",
      "name": "...",
      "status": "ACTIVE",
      ...
    }
  ],
  "pagination": {
    "limit": 100,
    "offset": 0
  }
}
```

### Get Market Details

**GET** `/api/markets/:id`

Get detailed information about a specific market.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "assetPair": "BTC/USD",
    "name": "...",
    "status": "ACTIVE",
    "yesCount": 150,
    "noCount": 200,
    "totalPredictions": 350,
    ...
  }
}
```

### Get Market Fraud Risk

**GET** `/api/markets/:id/fraud-risk`

Get fraud risk assessment for a market.

**Response:**
```json
{
  "success": true,
  "data": {
    "market_id": "uuid",
    "risk_score": 42,
    "confidence": 87,
    "flagged_predictions": 3
  }
}
```

### Resolve Market

**POST** `/api/markets/:id/resolve` (requires auth)

Resolve a market to YES or NO.

**Request Body:**
```json
{
  "resolution": "YES"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "market": {
      "id": "uuid",
      "status": "RESOLVED",
      "resolution": "YES",
      ...
    },
    "message": "Market resolved to YES"
  }
}
```

### Cancel Market

**POST** `/api/markets/:id/cancel` (requires auth)

Cancel a market and refund all predictions.

**Response:**
```json
{
  "success": true,
  "data": {
    "market": {
      "id": "uuid",
      "status": "CANCELLED",
      "resolution": "CANCELLED",
      ...
    },
    "message": "Market cancelled and all predictions refunded"
  }
}
```

## Prediction Endpoints

### Place Prediction

**POST** `/api/predictions` (requires auth)

Place a YES or NO prediction on a market.

**Request Body:**
```json
{
  "marketId": "uuid",
  "amount": "100",
  "choice": "YES"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "marketId": "uuid",
    "walletAddress": "GXXX...",
    "amount": "100",
    "choice": "YES",
    "claimed": "UNCLAIMED",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### Get Prediction

**GET** `/api/predictions/:id`

Get details of a specific prediction.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "marketId": "uuid",
    "walletAddress": "GXXX...",
    "amount": "100",
    "choice": "YES",
    "winnings": "250",
    "claimed": "UNCLAIMED",
    "market": { ... }
  }
}
```

### Get User Predictions

**GET** `/api/predictions/user/:walletAddress`

Get all predictions made by a user.

**Response:**
```json
{
  "success": true,
  "data": [
    { ... },
    { ... }
  ]
}
```

### Get Market Predictions

**GET** `/api/predictions/market/:marketId`

Get all predictions on a specific market.

**Response:**
```json
{
  "success": true,
  "data": [
    { ... },
    { ... }
  ]
}
```

### Get Unclaimed Winnings

**GET** `/api/predictions/:walletAddress/unclaimed` (requires auth)

Get all unclaimed winning predictions.

**Response:**
```json
{
  "success": true,
  "data": {
    "count": 3,
    "predictions": [
      {
        "id": "uuid",
        "marketId": "uuid",
        "winnings": "250",
        "claimed": "UNCLAIMED",
        ...
      }
    ]
  }
}
```

### Claim Winnings

**POST** `/api/predictions/:walletAddress/claim` (requires auth)

Claim all unclaimed winnings.

**Response:**
```json
{
  "success": true,
  "data": {
    "claimed": 3,
    "totalWinnings": "750",
    "message": "Winnings claimed successfully"
  }
}
```

### List Predictions

**GET** `/api/predictions?limit=100&offset=0`

Get paginated list of all predictions.

**Query Parameters:**
- `limit` (optional): Number of results (default: 100)
- `offset` (optional): Result offset for pagination (default: 0)

**Response:**
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "limit": 100,
    "offset": 0
  }
}
```

## Fraud Detection Endpoints

### Check User Fraud

**POST** `/api/fraud/check`

Check fraud risk for a wallet address.

**Request Body:**
```json
{
  "walletAddress": "GXXX..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "wallet": "GXXX...",
    "riskScore": 35,
    "riskLevel": "MEDIUM",
    "flaggedFields": ["activity_pattern"],
    "details": { ... }
  }
}
```

### Get User Fraud Profile

**GET** `/api/fraud/:walletAddress/profile`

Get the latest fraud profile for a user.

**Response:**
```json
{
  "success": true,
  "data": {
    "wallet": "GXXX...",
    "riskScore": 35,
    "riskLevel": "MEDIUM",
    "flaggedFields": [...],
    "details": { ... },
    "status": "PENDING",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

### Get Fraud History

**GET** `/api/fraud/:walletAddress/history`

Get fraud check history for a user.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "riskScore": 35,
      "riskLevel": "MEDIUM",
      "flaggedFields": [...],
      "status": "PENDING",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### Get High Risk Users

**GET** `/api/fraud/admin/high-risk` (requires auth)

Get all high-risk (CRITICAL) users.

**Response:**
```json
{
  "success": true,
  "data": {
    "count": 5,
    "users": [
      {
        "id": "uuid",
        "walletAddress": "GXXX...",
        "riskScore": 95,
        "riskLevel": "CRITICAL",
        ...
      }
    ]
  }
}
```

### List Fraud Records

**GET** `/api/fraud/admin/records?limit=100&offset=0` (requires auth)

Get paginated list of all fraud records.

**Response:**
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "limit": 100,
    "offset": 0
  }
}
```

### Update Fraud Status

**PATCH** `/api/fraud/:recordId/status` (requires auth)

Update the status of a fraud record.

**Request Body:**
```json
{
  "status": "REVIEWED"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "walletAddress": "GXXX...",
    "riskLevel": "CRITICAL",
    "status": "REVIEWED",
    ...
  }
}
```

## Error Codes

| Code | Status | Description |
|------|--------|-------------|
| - | 200 | Success |
| - | 201 | Created |
| - | 400 | Bad Request |
| - | 401 | Unauthorized |
| - | 404 | Not Found |
| - | 500 | Internal Server Error |

## Rate Limits

- **Global**: 100 requests per 15 minutes
- **Auth Endpoints**: 10 requests per minute

Rate limit information is included in response headers:
- `RateLimit-Limit`: Maximum requests
- `RateLimit-Remaining`: Remaining requests
- `RateLimit-Reset`: Unix timestamp when limit resets
