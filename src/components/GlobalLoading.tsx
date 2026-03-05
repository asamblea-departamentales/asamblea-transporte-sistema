// src/components/GlobalLoading.tsx
import React from "react";

// Definimos la prop que viene de App.tsx
interface GlobalLoadingProps {
  isClosing?: boolean;
}

export const GlobalLoading: React.FC<GlobalLoadingProps> = ({ isClosing }) => {
  return (
    <div className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#f8fafc] ${isClosing ? 'animate-fade-out-bg' : ''}`}>
      <div className="relative flex flex-col items-center">
        
        {/* Contenedor del Logo con Giro 3D y Brillo */}
        <div className={`relative mb-10 h-40 w-64 perspective-1000 ${isClosing ? 'animate-zoom-fade-out' : ''}`}>
          <div className="relative h-full w-full animate-y-rotation preserve-3d">
            
            {/* Logo Principal de la Asamblea (Asegúrate de tenerlo en public/) */}
            <img 
              src="/assets/logo-asamblea.png" 
              alt="Asamblea Legislativa"
              className="h-full w-full object-contain backface-hidden"
            />

            {/* Efecto de Brillo (Glint) */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[-20deg]"></div>
            </div>
          </div>
        </div>

        {/* Indicador de carga inferior (desaparece al cerrar) */}
        <div className={`flex flex-col items-center transition-opacity duration-300 ${isClosing ? 'opacity-0' : 'opacity-100'}`}>
          <div className="h-1 w-48 overflow-hidden rounded-full bg-slate-200">
            <div className="h-full w-full origin-left animate-progress-buffer bg-[#2d3a61]"></div>
          </div>
          <span className="mt-4 text-xs font-bold uppercase tracking-[0.2em] text-[#2d3a61] opacity-80">
            Cargando Sistema Institucional
          </span>
        </div>
      </div>
    </div>
  );
};