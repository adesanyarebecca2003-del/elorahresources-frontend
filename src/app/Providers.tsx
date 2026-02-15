import { ReactNode } from "react";
import { AuthProvider } from "@/context/AuthProvider";

export const Providers = ({ children }: { children: ReactNode }) => {
  return <AuthProvider>{children}</AuthProvider>;
};