import { useEffect, useState, ReactNode } from "react";
import { AuthContext } from "./AuthContext";
import { User } from "@/types/user";
import { decodeJwt } from "@/utils/decodeJwt";

interface Props {
  children: ReactNode;
}

interface DecodedToken {
  sub: string;
  username: string;
  first_name?: string;
  is_admin?: boolean;
  exp: number;
}

export const AuthProvider = ({ children }: Props) => {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("access_token")
  );

  const [expiresAt, setExpiresAt] = useState<number | null>(
    Number(localStorage.getItem("expires_at")) || null
  );

  const [user, setUser] = useState<User | null>(() => {
    const raw = localStorage.getItem("user");
    return raw ? (JSON.parse(raw) as User) : null;
  });

  const logout = () => {
    localStorage.clear();
    setToken(null);
    setExpiresAt(null);
    setUser(null);
    window.location.href = "/login";
  };

  const login = (accessToken: string) => {
    const decoded = decodeJwt(accessToken) as DecodedToken;

    if (!decoded?.exp) {
      logout();
      return;
    }

    const userData: User = {
      id: decoded.sub,
      username: decoded.username,
      first_name: decoded.first_name,
      is_admin: decoded.is_admin ?? false,
    };

    localStorage.setItem("access_token", accessToken);
    localStorage.setItem("expires_at", decoded.exp.toString());
    localStorage.setItem("user", JSON.stringify(userData));

    setToken(accessToken);
    setExpiresAt(decoded.exp);
    setUser(userData);

    window.location.assign("/dashboard");
  };

  // 🔥 TOKEN EXPIRY ENFORCEMENT
  useEffect(() => {
    if (!expiresAt) return;

    const interval = setInterval(() => {
      const now = Math.floor(Date.now() / 1000);
      if (now >= expiresAt) {
        logout();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        expiresAt,
        login,
        logout,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};