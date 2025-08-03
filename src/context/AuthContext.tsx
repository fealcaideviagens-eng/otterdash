import React, { createContext, useContext } from "react";
import { useAuth as useAuthHook } from "@/hooks/useAuth";

// Tipo de usuário simples para teste
interface User {
  "user-id": string;
  nome: string;
  senha?: number;
  email?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (nome: string, senha: string) => Promise<boolean>;
  register: (nome: string, senha: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = useAuthHook();

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
};