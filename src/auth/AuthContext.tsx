import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { meRequest, logoutRequest } from "./auth.service";
import type { AuthUser } from "./auth.service";

interface AuthContextType {
  user: AuthUser | null;
  setUser: (user: AuthUser | null) => void;
  debeCambiarPassword: boolean;
  setDebeCambiarPassword: (val: boolean) => void;
  logout: () => Promise<void>;
  loading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [debeCambiarPassword, setDebeCambiarPasswordState] = useState<boolean>(() => {
    return sessionStorage.getItem("debe_cambiar_password") === "true";
  });
  const [loading, setLoading] = useState(true);

  const setDebeCambiarPassword = (val: boolean) => {
    setDebeCambiarPasswordState(val);
    sessionStorage.setItem("debe_cambiar_password", String(val));
  };

  useEffect(() => {
    async function checkAuth() {
      const token = sessionStorage.getItem("auth_token");
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }
      try {
        const userData = await meRequest();
        setUser(userData);
        // Si hay valor guardado en sessionStorage lo respetamos
        const savedDebeCambiar = sessionStorage.getItem("debe_cambiar_password") === "true";
        setDebeCambiarPasswordState(savedDebeCambiar);
      } catch {
        sessionStorage.removeItem("auth_token");
        sessionStorage.removeItem("debe_cambiar_password");
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, []);

  async function logout() {
    try {
      await logoutRequest();
    } finally {
      setUser(null);
      setDebeCambiarPasswordState(false);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        debeCambiarPassword,
        setDebeCambiarPassword,
        logout,
        loading,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return context;
}

