import { useState, useEffect, useCallback, useMemo } from "react";
import { getViajesMes } from "./viajes.service";
import type { ViajeAsignado } from "./viajes.service";

// ────────────────────────────────────────────────
// Helpers y Constantes
// ────────────────────────────────────────────────
const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

import { TripCard, SkeletonCard } from "../shared/components/ui/TripCard";



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
