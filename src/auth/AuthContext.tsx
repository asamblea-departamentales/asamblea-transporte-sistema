import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { meRequest, logoutRequest } from "../services/auth.service";
import type { AuthUser } from "../services/auth.service";

interface AuthContextType {
  user: AuthUser | null;
  setUser: (user: AuthUser | null) => void;
  logout: () => Promise<void>;
  loading: boolean;
  isAuthenticated: boolean; // ✅ Agregado
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        const userData = await meRequest();
        setUser(userData);
        console.log("✅ Sesión activa:", userData);
      } catch (err) {
        console.log("ℹ️ No hay sesión activa");
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
      setUser(null);
      console.log("✅ Sesión cerrada");
    } catch (err) {
      console.error("❌ Logout error:", err);
      setUser(null);
    }
  }

  // ✅ Calcular isAuthenticated
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, setUser, logout, loading, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth debe ser usado dentro de AuthProvider");
  }
  return context;
}