import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isShaking, setIsShaking] = useState(false);

  // Redirigir automáticamente si ya está autenticado
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    
    setError('');
    setIsShaking(false);
    setIsLoading(true);
    
    try {
      await login({ username, password });
      navigate('/', { replace: true });
    } catch (err: any) {
      // Manejo de errores amigable
      let errorMessage = err.response?.data?.message || err.message || 'Credenciales inválidas. Por favor intenta de nuevo.';
      
      if (err.response?.status === 422) {
        errorMessage = err.response?.data?.message || 'Por favor, completa todos los campos correctamente.';
      }
      
      setError(errorMessage);
      setIsShaking(true);
      
      // Remover la clase de animación después de 500ms
      setTimeout(() => setIsShaking(false), 500);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen min-h-[100dvh] flex flex-col bg-white font-body">
      {/* Spacer to push content to middle */}
      <div className="flex-1"></div>

      {/* Main Container */}
      <div className="w-full flex flex-col items-center px-6">
        <div className="w-full max-w-sm">
          
          {/* Logo Area */}
          <div className="flex justify-center mb-8">
            <img 
              src="/logo.png" 
              alt="Asamblea Legislativa Logo" 
              className="h-20 w-auto object-contain"
            />
          </div>

          {/* Welcome Text */}
          <h1 className="text-center text-2xl font-bold text-slate-900 mb-1 font-display">
            Acceso Restringido
          </h1>
          <p className="text-center text-sm text-slate-500 mb-10">
            Módulo exclusivo para Jefaturas y Administración
          </p>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className={`w-full space-y-6 ${isShaking ? 'animate-shake' : ''}`}>
            
            {/* Input Usuario */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">Usuario institucional</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-[15px] transition-all duration-200 text-slate-900 placeholder-gray-400 outline-none bg-white"
                  placeholder="usuario.institucional"
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            {/* Input Contraseña */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">Contraseña</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-[15px] transition-all duration-200 text-slate-900 placeholder-gray-400 outline-none bg-white"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            <div className={`transition-all duration-300 overflow-hidden ${error ? 'max-h-24 opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className="bg-red-50 px-4 py-3 rounded-lg text-sm text-red-600 flex items-start space-x-2">
                <span className="shrink-0 mt-0.5">⚠️</span>
                <span>{error}</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !username || !password}
              className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white transition-all duration-200 min-h-[48px]
                ${(isLoading || !username || !password) ? 'bg-primary/70 cursor-not-allowed' : 'bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary'}`}
            >
              {isLoading ? (
                <span className="flex items-center space-x-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Verificando...</span>
                </span>
              ) : 'INICIAR SESIÓN'}
            </button>
          </form>
        </div>
      </div>

      {/* Spacer */}
      <div className="flex-1"></div>

      {/* Footer */}
      <div className="pb-6 text-center text-xs text-slate-400 w-full">
        © 2026 Asamblea Legislativa de El Salvador
      </div>
    </div>
  );
};

export default LoginPage;
