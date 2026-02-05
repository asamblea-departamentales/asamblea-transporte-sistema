import React, { createContext, useContext, useMemo, useState } from "react";
import { tokenStorage } from "./auth.storage";

/**
 * ✅ Listo para backend:
 * Este user se llenará cuando tu API (Laravel) devuelva /api/auth/me
 */
export type AuthUser = {
  id: string;
  name: string;
  email: string;
};

type AuthContextValue = {
  token: string | null;
  user: AuthUser | null; // ✅ agregado
  isAuthenticated: boolean;
  setToken: (token: string) => void;
  setUser: (user: AuthUser | null) => void; // ✅ agregado
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setTokenState] = useState<string | null>(() => tokenStorage.get());

  // ✅ user inicia null (sin datos quemados)
  const [user, setUserState] = useState<AuthUser | null>(null);

  const setToken = (newToken: string) => {
    tokenStorage.set(newToken);
    setTokenState(newToken);
  };

  const setUser = (newUser: AuthUser | null) => {
    setUserState(newUser);
  };

  const logout = () => {
    tokenStorage.clear();
    setTokenState(null);
    setUserState(null); // ✅ limpia user
  };

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token),
      setToken,
      setUser,
      logout,
    }),
    [token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de un AuthProvider");
  return ctx;
}
