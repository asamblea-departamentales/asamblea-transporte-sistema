import { Truck, RefreshCw } from "lucide-react";

interface MapaViajeProps {
  destino: string;
  faseActual: number;
  isOnline: boolean;
  setIsOnline: (val: boolean) => void;
}

export function MapaViaje({ destino, faseActual, isOnline, setIsOnline }: MapaViajeProps) {
  return (
    <div className="bg-white border border-slate-100 rounded-[24px] p-6 shadow-sm flex flex-col flex-1 min-h-[300px] relative overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[13px] font-black text-slate-800 uppercase tracking-wider">
          Mapa del Recorrido (San Salvador ➔ {destino.split(",")[0]})
        </h3>
        <span className="text-[10.5px] font-bold text-blue-500 bg-blue-50 px-2.5 py-1 rounded-md">
          Monitoreo Activo
        </span>
      </div>
      
      <div className="flex-1 bg-slate-50 border border-slate-100 rounded-2xl relative flex items-center justify-center overflow-hidden p-4">
        <svg viewBox="0 0 400 200" className="w-full h-full max-h-[220px]">
          <path d="M 0 100 Q 100 50 200 120 T 400 80" fill="none" stroke="#f1f5f9" strokeWidth="20" strokeLinecap="round" />
          <path d="M 0 150 Q 150 90 300 170 T 400 130" fill="none" stroke="#f1f5f9" strokeWidth="12" strokeLinecap="round" />
          
          <path d="M 50 120 C 120 60, 200 150, 350 80" fill="none" stroke="#e2e8f0" strokeWidth="6" strokeLinecap="round" />
          
          <path 
            d="M 50 120 C 120 60, 200 150, 350 80" 
            fill="none" 
            stroke={faseActual >= 3 ? "#f59e0b" : faseActual > 0 ? "#3b82f6" : "#e2e8f0"} 
            strokeWidth="6" 
            strokeLinecap="round" 
            strokeDasharray="400"
            strokeDashoffset={faseActual === 1 ? "250" : faseActual === 2 ? "120" : faseActual >= 3 ? "0" : "400"}
            className="transition-all duration-1000 ease-in-out"
          />

          <g transform="translate(50, 120)">
            <circle r="8" fill="#0f2548" className="animate-ping opacity-25" />
            <circle r="6" fill="#0f2548" />
            <circle r="3" fill="#fff" />
            <text y="20" textAnchor="middle" className="text-[9px] font-black fill-slate-500 uppercase tracking-wider">Base</text>
          </g>

          <g transform="translate(350, 80)">
            <circle r="8" fill="#fbbf24" className="animate-ping opacity-25" />
            <circle r="6" fill="#fbbf24" />
            <circle r="3" fill="#0f2548" />
            <text y="-12" textAnchor="middle" className="text-[9px] font-black fill-[#b45309] uppercase tracking-wider">{destino.split(",")[0]}</text>
          </g>

          {faseActual > 0 && faseActual < 4 && (
            <g 
              className="transition-all duration-1000 ease-in-out"
              style={{
                transform: faseActual === 1 
                  ? 'translate(130px, 90px)' 
                  : faseActual === 2 
                    ? 'translate(350px, 80px)' 
                    : 'translate(230px, 120px)'
              }}
            >
              <circle r="14" fill="#3b82f6" className="fill-blue-500 opacity-20 animate-pulse" />
              <foreignObject x="-10" y="-12" width="20" height="20">
                <Truck className="w-5 h-5 text-blue-600 animate-bounce" />
              </foreignObject>
            </g>
          )}
        </svg>
        //

        {import.meta.env.DEV && (
          <button 
            onClick={() => setIsOnline(!isOnline)}
            className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm border border-slate-200/50 shadow-sm py-1.5 px-3 rounded-lg text-[10px] font-extrabold uppercase text-slate-500 hover:text-slate-800 active:scale-95 transition-all flex items-center gap-1.5"
          >
            <RefreshCw className="w-3 h-3 text-slate-400" />
            Simular Señal
          </button>
        )}
      </div>
    </div>
  );
}
