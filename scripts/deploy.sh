#!/bin/bash
set -e

NETWORK=${1:-testnet}
CONTRACT=${2:-ledgerlens-score}

echo "Deploying $CONTRACT to $NETWORK..."

cd contracts/$CONTRACT

# Build WASM
cargo build --release

# Deploy (requires Soroban CLI configured)
soroban contract deploy \
  --wasm target/wasm32-unknown-unknown/release/*.wasm \
  --network $NETWORK

echo "✓ Deployment complete"
