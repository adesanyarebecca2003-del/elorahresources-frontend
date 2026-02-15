import { createContext } from "react";
import { User } from "@/types/user";

export interface AuthContextType {
  user: User | null;
  token: string | null;
  expiresAt: number | null;
  login: (accessToken: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);