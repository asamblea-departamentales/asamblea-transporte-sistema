import React, { createContext, useContext, useMemo, useState } from "react";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  roles?: string[];
};

type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  setUser: (user: AuthUser | null) => void;
  logoutLocal: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<AuthUser | null>(null);

  const setUser = (newUser: AuthUser | null) => setUserState(newUser);

  // Esto solo limpia el estado local; el logout real se hace llamando /logout
  const logoutLocal = () => setUserState(null);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      setUser,
      logoutLocal,
    }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de un AuthProvider");
  return ctx;
}