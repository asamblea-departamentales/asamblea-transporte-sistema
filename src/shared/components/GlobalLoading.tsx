import React from "react";

interface GlobalLoadingProps {
  isClosing?: boolean;
  message?: string;
}

export const GlobalLoading: React.FC<GlobalLoadingProps> = ({ isClosing, message = "Iniciando Sesión Segura" }) => {
  return (
    <div className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-50 ${isClosing ? 'animate-fade-out-bg' : ''}`}>
      <div className="relative flex flex-col items-center">
        
        {/* Contenedor con perspectiva para el giro 3D */}
        <div className={`relative mb-10 h-40 w-64 perspective-1000 ${isClosing ? 'animate-zoom-fade-out' : ''}`}>
          <div className="relative h-full w-full animate-y-rotation preserve-3d">
            
            <img 
              src="/logo.png" 
              alt="Asamblea Legislativa"
              className="h-full w-full object-contain backface-hidden"
            />

            {/* Brillo metálico */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[-20deg]"></div>
            </div>
          </div>
        </div>

        {/* Barra de carga */}
        <div className={`flex flex-col items-center transition-opacity duration-300 ${isClosing ? 'opacity-0' : 'opacity-100'}`}>
          <div className="h-1.5 w-48 overflow-hidden rounded-full bg-slate-200">
            <div className="h-full w-full origin-left animate-progress-buffer bg-asamblea"></div>
          </div>
          <span className="mt-4 text-[10px] font-bold uppercase tracking-ultrawide text-asamblea opacity-70">
            {message}
          </span>
        </div>
      </div>
    </div>
  );
};
