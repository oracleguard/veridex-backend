export interface Market {
  id: string;
  asset_pair: string;
  name: string;
  resolution_date: Date;
  status: "active" | "resolved" | "voided";
}

export interface Prediction {
  id: string;
  market_id: string;
  wallet_address: string;
  amount: number;
  choice: "YES" | "NO";
}

export interface User {
  address: string;
  name?: string;
  created_at: Date;
}
