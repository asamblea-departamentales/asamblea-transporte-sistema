import React from "react";
import logoAsamblea from "../assets/asamble.png";

interface InnerLoadingProps {
  message?: string;
}

export const InnerLoading: React.FC<InnerLoadingProps> = ({ message = "Cargando información..." }) => {
  return (
    <div className="flex w-full flex-col items-center justify-center py-20 animate-fade-in">
      <div className="relative flex flex-col items-center">
        
        {/* Contenedor con perspectiva para el giro 3D */}
        <div className="relative mb-6 h-28 w-44 perspective-1000">
          <div className="relative h-full w-full animate-y-rotation preserve-3d">
            <img 
              src={logoAsamblea} 
              alt="Cargando"
              className="h-full w-full object-contain filter drop-shadow-md opacity-80 backface-hidden"
            />
            {/* Brillo metálico */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-xl">
              <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/50 to-transparent skew-x-[-20deg]"></div>
            </div>
          </div>
        </div>

        {/* Barra de carga */}
        <div className="flex flex-col items-center">
          <div className="h-1.5 w-40 overflow-hidden rounded-full bg-slate-100 shadow-inner">
            <div className="h-full w-full origin-left animate-progress-buffer bg-asamblea rounded-full"></div>
          </div>
          <span className="mt-4 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
            {message}
          </span>
        </div>
      </div>
    </div>
  );
};
