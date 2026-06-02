import React, { useState } from 'react';
import { Mail, Lock } from 'lucide-react';

import { useAuth } from '../context/AuthContext';

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login({ username, password });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Credenciales inválidas. Por favor intenta de nuevo.');
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
            {/* 
              Aquí puedes colocar la imagen de tu logo. 
              Solo necesitas guardar tu logo como "logo.png" (o el formato que uses) 
              dentro de la carpeta "public" y ajustar el "src".
              Las clases 'h-16 md:h-20 w-auto object-contain' aseguran que mantenga su proporción y tamaño correcto.
            */}
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
        <form onSubmit={handleSubmit} className="w-full space-y-5 md:space-y-6">
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

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full flex justify-center py-3 md:py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-[15px] md:text-[14px] font-semibold text-white transition-colors duration-200 mt-4 md:mt-2
              ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#859BFF] hover:bg-[#7089f9] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#859BFF]'}`}
          >
            {isLoading ? 'Iniciando sesión...' : 'INICIAR SESIÓN'}
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
