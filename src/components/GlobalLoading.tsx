// src/components/GlobalLoading.tsx
import React from "react";
import logoAsamblea from "../assets/asamble.png"; // <-- Importación correcta desde assets

interface GlobalLoadingProps {
  isClosing?: boolean;
}

export const GlobalLoading: React.FC<GlobalLoadingProps> = ({ isClosing }) => {
  return (
    <div className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#f8fafc] ${isClosing ? 'animate-fade-out-bg' : ''}`}>
      <div className="relative flex flex-col items-center">
        
        {/* Contenedor con perspectiva para el giro 3D */}
        <div className={`relative mb-10 h-40 w-64 perspective-1000 ${isClosing ? 'animate-zoom-fade-out' : ''}`}>
          <div className="relative h-full w-full animate-y-rotation preserve-3d">
            
            {/* Usamos la variable logoAsamblea aquí */}
            <img 
              src={logoAsamblea} 
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
            <div className="h-full w-full origin-left animate-progress-buffer bg-[#2d3a61]"></div>
          </div>
          <span className="mt-4 text-[10px] font-bold uppercase tracking-[0.3em] text-[#2d3a61] opacity-70">
            Iniciando Sesión Segura
          </span>
        </div>
      </div>
    </div>
  );
};