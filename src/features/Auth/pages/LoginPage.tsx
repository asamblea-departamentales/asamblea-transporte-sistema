import React, { useState } from 'react';
import { Mail, Lock } from 'lucide-react';

import { useAuth } from '../context/AuthContext';

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isShaking, setIsShaking] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsShaking(false);
    setIsLoading(true);
    
    try {
      await login({ username, password });
    } catch (err: any) {
      // Manejo de errores amigable
      let errorMessage = 'Credenciales inválidas. Por favor intenta de nuevo.';
      
      if (err.response?.status === 422) {
        errorMessage = 'Por favor, completa todos los campos correctamente.';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      
      setError(errorMessage);
      setIsShaking(true);
      
      // Remover la clase de animación después de 500ms para que se pueda volver a disparar
      setTimeout(() => setIsShaking(false), 500);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between items-center bg-white p-6 font-body">
      {/* Spacer to push content to middle */}
      <div className="flex-1"></div>

      {/* Main Container */}
      <div className="w-full max-w-md mx-auto flex flex-col items-center">
        
        {/* Logo Area */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex flex-col items-center justify-center">
            <img 
              src="/logo.png" 
              alt="Asamblea Legislativa Logo" 
              className="h-16 md:h-20 w-auto object-contain mb-1"
            />
          </div>
        </div>

        {/* Welcome Text */}
        <h2 className="text-[26px] font-extrabold text-[#182645] mb-2 font-title tracking-tight">Bienvenido</h2>
        <p className="text-[13px] text-gray-500 mb-8 font-body">Ingresa tus credenciales institucionales</p>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className={`w-full space-y-5 md:space-y-6 ${isShaking ? 'animate-shake' : ''}`}>
          <div className="space-y-1.5">
            <label className="block text-sm md:text-[13px] font-medium text-[#182645]">Usuario institucional</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-4 md:h-5 w-4 md:w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 md:py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#859BFF] focus:border-[#859BFF] text-base md:text-[14px] transition-all duration-200 text-gray-800 placeholder-gray-400 outline-none"
                placeholder="usuario.institucional"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm md:text-[13px] font-medium text-[#182645]">Contraseña</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-4 md:h-5 w-4 md:w-5 text-gray-400" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 md:py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#859BFF] focus:border-[#859BFF] text-base md:text-[14px] transition-all duration-200 text-gray-800 placeholder-gray-400 outline-none"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {/* Smooth error transition */}
          <div className={`transition-all duration-300 overflow-hidden ${error ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="bg-red-50 border border-red-100 text-red-600 p-3 rounded-lg text-sm mt-1">
              {error}
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full flex justify-center py-3 md:py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-[15px] md:text-[14px] font-semibold text-white transition-all duration-200 mt-4 md:mt-2
              ${isLoading ? 'bg-[#859BFF]/70 cursor-wait' : 'bg-[#182645] hover:bg-[#203159] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#182645]'}`}
          >
            {isLoading ? (
              <span className="flex items-center space-x-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Iniciando sesión...</span>
              </span>
            ) : 'INICIAR SESIÓN'}
          </button>
        </form>
      </div>

      {/* Spacer */}
      <div className="flex-1"></div>

      {/* Footer */}
      <div className="text-center pb-4 w-full">
        <p className="text-[11px] text-gray-400 font-medium">© 2026 Asamblea Legislativa de El Salvador</p>
      </div>
    </div>
  );
};

export default LoginPage;
