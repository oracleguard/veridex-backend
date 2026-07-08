# Database Schema

## Markets Table
- id: UUID
- asset_pair: VARCHAR
- name: VARCHAR
- created_at: TIMESTAMP

## Predictions Table
- id: UUID
- market_id: UUID
- wallet: VARCHAR
- amount: BIGINT
- choice: VARCHAR
