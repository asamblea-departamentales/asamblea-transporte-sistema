import React from "react";

interface GlobalLoadingProps {
  isClosing?: boolean;
  message?: string;
}

export const GlobalLoading: React.FC<GlobalLoadingProps> = ({
  isClosing,
  message = "Cargando...",
}) => {
  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#f8fafc] ${
        isClosing ? "animate-fade-out-bg" : ""
      }`}
    >
      <div className="relative flex flex-col items-center">
        {/* Logo giratorio */}
        <div
          className={`relative mb-10 h-32 w-52 perspective-1000 ${
            isClosing ? "animate-zoom-fade-out" : ""
          }`}
        >
          <div className="relative h-full w-full animate-y-rotation preserve-3d">
            {/* Escudo institucional SVG */}
            <svg
              className="h-full w-full object-contain backface-hidden"
              viewBox="0 0 120 80"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect width="120" height="80" rx="8" fill="#0f2548" />
              <text
                x="60"
                y="30"
                textAnchor="middle"
                fill="white"
                fontSize="9"
                fontWeight="bold"
                fontFamily="system-ui"
              >
                ASAMBLEA
              </text>
              <text
                x="60"
                y="44"
                textAnchor="middle"
                fill="white"
                fontSize="9"
                fontWeight="bold"
                fontFamily="system-ui"
              >
                LEGISLATIVA
              </text>
              <text
                x="60"
                y="62"
                textAnchor="middle"
                fill="#94a3b8"
                fontSize="7"
                fontFamily="system-ui"
              >
                Sistema Motorista
              </text>
            </svg>

            {/* Brillo metálico */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[-20deg]" />
            </div>
          </div>
        </div>

        {/* Barra de carga */}
        <div
          className={`flex flex-col items-center transition-opacity duration-300 ${
            isClosing ? "opacity-0" : "opacity-100"
          }`}
        >
          <div className="h-1.5 w-48 overflow-hidden rounded-full bg-slate-200">
            <div className="h-full w-full origin-left animate-progress-buffer bg-[#0f2548]" />
          </div>
          <span className="mt-4 text-[10px] font-bold uppercase tracking-[0.3em] text-[#0f2548] opacity-70">
            {message}
          </span>
        </div>
      </div>
    </div>
  );
};
