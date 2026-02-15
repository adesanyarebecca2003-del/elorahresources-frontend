export interface AuthUser {
  id: number;
  username: string;
  first_name?: string;
  last_name?: string;
}

export interface AuthTokens {
  accessToken: string;
  expiresAt: number; // unix timestamp (seconds)
}