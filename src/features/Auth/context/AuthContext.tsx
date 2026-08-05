import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, LoginCredentials } from '../types';
import { authApi } from '../api/authApi';
import { hasJefaturaAccess } from '@/shared/auth/roles';
import { subscribeUserToPush, unsubscribeUserFromPush } from '@/shared/services/push.service';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Auto-suscribir a push cuando el usuario se autentica
  useEffect(() => {
    if (isAuthenticated && user) {
      subscribeUserToPush().catch((err) =>
        console.error('[AuthContext] Error en auto-suscripción push:', err)
      );
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        try {
          const profile = await authApi.getProfile();
          
          if (!hasJefaturaAccess(profile.roles)) {
            throw new Error("Acceso denegado: Privilegios insuficientes.");
          }

          setUser(profile);
          setIsAuthenticated(true);
        } catch (error) {
          console.error("Error validando la sesión:", error);
          localStorage.removeItem('auth_token');
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    const data = await authApi.login(credentials);
    
    if (!hasJefaturaAccess(data.user.roles)) {
      throw new Error("Acceso denegado: Este módulo es exclusivo para Jefaturas y Administradores.");
    }

    localStorage.setItem('auth_token', data.token);
    setUser(data.user);
    setIsAuthenticated(true);
    // La auto-suscripción push se dispara vía el useEffect de arriba
  };

  const logout = async () => {
    // Desuscribir push ANTES de cerrar sesión (necesita el token válido)
    try {
      await unsubscribeUserFromPush();
    } catch (error) {
      console.error("[AuthContext] Error al desuscribir push en logout:", error);
    }

    try {
      await authApi.logout();
    } catch (error) {
      console.error("Error al cerrar sesión en el servidor", error);
    } finally {
      localStorage.removeItem('auth_token');
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};
