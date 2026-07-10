export interface AuthRequest {
  userId?: string;
  walletAddress?: string;
  token?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginationQuery {
  limit?: number;
  offset?: number;
}
