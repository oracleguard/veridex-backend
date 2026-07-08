export async function placePrediction(marketId: string, walletAddr: string, amount: number, choice: string) {
  return { prediction_id: "pred_1", market_id: marketId, wallet: walletAddr, amount, choice };
}

export async function getPrediction(id: string) {
  return { id };
}

export async function listUserPredictions(wallet: string) {
  return [];
}
