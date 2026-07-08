import axios from "axios";

const DETECTION_API = process.env.DETECTION_API_URL || "http://localhost:8000";

export async function scoreWallet(wallet: string): Promise<number | null> {
  try {
    const res = await axios.get(`${DETECTION_API}/v1/scores/${wallet}`, {
      timeout: 5000,
    });
    return res.data.score;
  } catch (error) {
    console.error(`Failed to score wallet ${wallet}:`, error);
    return null;
  }
}

export async function scoreMarket(assetPair: string) {
  try {
    const res = await axios.get(`${DETECTION_API}/v1/markets/${assetPair}/risk`, {
      timeout: 5000,
    });
    return res.data;
  } catch (error) {
    console.error(`Failed to score market:`, error);
    return null;
  }
}
