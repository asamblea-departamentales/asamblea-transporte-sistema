import React, { useEffect, useState, ReactNode } from 'react';
import { User } from '../types';
import { LoginCredentials } from '../types';
import { authApi } from '../api/authApi';
import { hasJefaturaAccess } from '@/shared/auth/roles';
import { unsubscribeUserFromPush } from '@/shared/services/push.service';
import { AuthContext } from './auth-context';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        try {
          const profile = await authApi.getProfile();

          if (!hasJefaturaAccess(profile.roles)) {
            throw new Error('Acceso denegado: Privilegios insuficientes.');
          }

          setUser(profile);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Error validando la sesión:', error);
          localStorage.removeItem('auth_token');
        }
      }
      setIsLoading(false);
    };

    void initAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    const data = await authApi.login(credentials);

    if (!hasJefaturaAccess(data.user.roles)) {
      throw new Error('Acceso denegado: Este módulo es exclusivo para Jefaturas y Administradores.');
    }

    localStorage.setItem('auth_token', data.token);
    setUser(data.user);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    try {
      await unsubscribeUserFromPush();
    } catch (error) {
      console.error('Error al desuscribir Push durante el cierre de sesión:', error);
    }

    try {
      await authApi.logout();
    } catch (error) {
      console.error('Error al cerrar sesión en el servidor:', error);
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
