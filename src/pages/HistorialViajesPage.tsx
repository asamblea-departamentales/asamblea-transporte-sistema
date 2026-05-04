import { useState, useEffect, useCallback, useMemo } from "react";
import { getViajesMes } from "../services/viajes.service";
import type { ViajeAsignado } from "../services/viajes.service";

// ────────────────────────────────────────────────
// Helpers y Constantes
// ────────────────────────────────────────────────
const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

const ESTADO_COLORS: Record<string, string> = {
  ASIGNADA: "bg-amber-500",
  EN_EJECUCION: "bg-blue-500",
  FINALIZADA: "bg-emerald-500",
  CANCELADA: "bg-red-500",
};

function SkeletonCard() {
  return (
    <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 14, padding: "22px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ height: 11, width: 70, borderRadius: 6, background: "#f1f5f9", animation: "skpulse 1.4s ease-in-out infinite" }} />
          <div style={{ height: 34, width: 55, borderRadius: 8, background: "#e2e8f0", animation: "skpulse 1.4s ease-in-out infinite" }} />
        </div>
        <div style={{ width: 42, height: 42, borderRadius: 11, background: "#f1f5f9", animation: "skpulse 1.4s ease-in-out infinite" }} />
      </div>
      <div style={{ height: 10, width: 90, borderRadius: 6, background: "#f1f5f9", animation: "skpulse 1.4s ease-in-out infinite" }} />
    </div>
  );
}

function TripCard({ viaje }: { viaje: ViajeAsignado }) {
  const isFinalizada = viaje.estado === "FINALIZADA";
  const dateObj = new Date(viaje.fecha + "T00:00:00");
  const formattedDate = dateObj.toLocaleDateString("es-SV", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div className={`relative flex flex-col p-5 md:p-6 bg-white border border-slate-200 hover:border-slate-300 hover:shadow-md rounded-[20px] transition-all duration-300 group overflow-hidden opacity-90 hover:opacity-100`}>
       <div className="flex items-center justify-between mb-5 z-10">
          <div className="flex flex-col">
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] mb-0.5">{formattedDate}</span>
            <span className="text-[18px] font-black tracking-tight text-[#0f172a] leading-none">{viaje.hora_salida}</span>
          </div>
          <span className={`px-3 py-1 text-[10px] font-black uppercase rounded-full tracking-wider ${ESTADO_COLORS[viaje.estado] || 'bg-slate-500'} text-white shadow-sm`}>
            {viaje.estado.replace("_", " ")}
          </span>
       </div>
       <div className="flex items-stretch gap-4 z-10 w-full mb-1">
          <div className="flex flex-col items-center justify-between py-1.5 w-[20px]">
             <div className="w-4 h-4 bg-[#0f172a] rounded-full border-[3px] border-white shadow-sm shrink-0" />
             <div className="w-[2px] bg-slate-200/80 flex-1 my-1 rounded-full" />
             <div className={`w-4 h-4 ${isFinalizada ? 'bg-emerald-500' : 'bg-slate-400'} rounded-full border-[3px] border-white shadow-sm shrink-0`} />
          </div>
          <div className="flex flex-col flex-1 gap-5 py-1">
             <div>
               <p className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider mb-1 leading-none">Punto de Origen</p>
               <p className="text-[14.5px] font-bold text-slate-800 leading-tight">{viaje.origen}</p>
             </div>
             <div>
               <p className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider mb-1 leading-none">Destino Principal</p>
               <p className="text-[14.5px] font-bold text-slate-800 leading-tight">{viaje.destino}</p>
             </div>
          </div>
       </div>
       {viaje.solicitante && (
         <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between z-10 bg-slate-50/50 -mx-5 -mb-5 px-5 md:-mx-6 md:-mb-6 md:px-6 pb-5 rounded-b-[20px]">
           <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-[#0f172a] flex items-center justify-center text-white text-[12px] font-black shadow-sm shrink-0">{viaje.solicitante.charAt(0)}</div>
             <div className="flex flex-col">
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Pasajero Asignado</span>
               <span className="text-[13px] font-bold text-[#0f172a] leading-none truncate max-w-[150px] sm:max-w-xs">{viaje.solicitante}</span>
             </div>
           </div>
         </div>
       )}
    </div>
  )
}

export default function HistorialViajesPage() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [viajes, setViajes] = useState<ViajeAsignado[]>([]);
  const [loadingViajes, setLoadingViajes] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargarViajes = useCallback(async () => {
    setLoadingViajes(true);
    try {
      const mes = `${year}-${String(month + 1).padStart(2, "0")}`;
      const data = await getViajesMes(mes);
      setViajes(data);
      if(error) setError(null);
    } catch {
      setError("No se pudo conectar con los servidores para cargar el historial.");
    } finally {
      setLoadingViajes(false);
    }
  }, [year, month, error]);

  useEffect(() => {
    cargarViajes();
  }, [cargarViajes]);

  const prevMonth = () => { if (month === 0) { setYear(y => y - 1); setMonth(11); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 11) { setYear(y => y + 1); setMonth(0); } else setMonth(m => m + 1); };

  const sortedViajes = useMemo(() => {
    return [...viajes].sort((a, b) => new Date(`${b.fecha}T${b.hora_salida}`).getTime() - new Date(`${a.fecha}T${a.hora_salida}`).getTime()); // Descendente
  }, [viajes]);

  const FONT = "'Plus Jakarta Sans', system-ui, sans-serif";

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap'); * { box-sizing: border-box; } @keyframes skpulse { 0%,100%{opacity:1} 50%{opacity:.4} }`}</style>
      <div className="p-4 md:p-8 w-full max-w-4xl mx-auto" style={{ fontFamily: FONT }}>
        
        <div className="flex items-end justify-between mb-7 gap-4 flex-wrap">
          <div>
            <p className="m-0 text-[11px] font-bold text-slate-400 tracking-[0.08em] uppercase">Asamblea Legislativa · Transporte</p>
            <h1 className="m-0 mt-1 mb-1 text-2xl md:text-3xl font-extrabold text-[#0f172a] tracking-tight leading-tight">Historial de Viajes</h1>
            <p className="m-0 text-[13.5px] text-slate-500 font-medium">Consulta tus rutas pasadas y finalizadas</p>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-red-50 border border-red-200 mb-6 shadow-sm">
            <svg width={18} height={18} fill="none" viewBox="0 0 24 24" stroke="#dc2626" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            <p className="m-0 text-[13px] text-red-800 font-bold">{error}</p>
          </div>
        )}

        <div className="flex flex-col gap-5">
           <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60">
              <div>
                 <h2 className="text-[18px] font-extrabold text-[#0f172a] flex items-center gap-2">
                    Viajes del Mes Seleccionado
                 </h2>
                 <p className="text-[13px] font-medium text-slate-500 mt-0.5">Mostrando todos los viajes registrados</p>
              </div>
              <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-sm shrink-0">
                <button onClick={prevMonth} className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-50 font-bold transition-all shrink-0">‹</button>
                <div className="px-4 py-1.5 min-w-[120px] text-center shrink-0">
                   <h2 className="text-[12px] font-black text-[#0f172a] uppercase tracking-widest">{MESES[month]} {year}</h2>
                </div>
                <button onClick={nextMonth} className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-50 font-bold transition-all shrink-0">›</button>
              </div>
           </div>

           {loadingViajes && sortedViajes.length === 0 ? (
             <div className="flex flex-col gap-4 py-4"><SkeletonCard /><SkeletonCard /></div>
           ) : sortedViajes.length === 0 ? (
             <div className="flex flex-col items-center justify-center py-16 px-4 bg-white/50 border border-slate-200/60 border-dashed rounded-3xl mt-2 text-center">
                <div className="w-16 h-16 bg-slate-100 text-slate-300 rounded-full flex items-center justify-center mb-4">
                  <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-[16px] font-bold text-slate-800 mb-1">Sin historial en este mes</h3>
                <p className="text-[13.5px] font-medium text-slate-500 max-w-sm">No hay registros de viajes en {MESES[month]} de {year}.</p>
             </div>
           ) : (
             <div className={`flex flex-col gap-4 mt-2 transition-opacity duration-300 ${loadingViajes ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                {sortedViajes.map((v) => <TripCard key={v.id} viaje={v} />)}
             </div>
           )}
        </div>
      </div>
    </>
  );
}
