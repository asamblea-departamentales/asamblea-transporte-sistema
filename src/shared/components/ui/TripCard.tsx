import { useNavigate } from "react-router-dom";
import type { ViajeAsignado } from "../../../viajes/viajes.service";

const ESTADO_COLORS: Record<string, string> = {
  ASIGNADA: "bg-amber-500",
  EN_EJECUCION: "bg-blue-500",
  FINALIZADA: "bg-emerald-500",
  CANCELADA: "bg-red-500",
  PROGRAMADA: "bg-purple-500",
  APROBADA: "bg-indigo-500",
};

export function SkeletonCard() {
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

export function TripCard({ viaje, isEditable = false }: { viaje: ViajeAsignado; isEditable?: boolean }) {
  const navigate = useNavigate();
  const isPending = ["ASIGNADA", "APROBADA", "PROGRAMADA"].includes(viaje.estado);
  const isFinalizada = viaje.estado === "FINALIZADA";
  const dateObj = new Date(viaje.fecha + "T00:00:00");
  const formattedDate = dateObj.toLocaleDateString("es-SV", { weekday: "long", day: "numeric", month: "long" });

  const handleCardClick = () => {
    if (isEditable) {
      navigate(`/viajes/${viaje.id}/activo`);
    }
  };

  return (
    <div 
      onClick={handleCardClick}
      className={`relative flex flex-col p-5 md:p-6 bg-white border ${
        !isEditable 
          ? 'border-slate-100 opacity-90 cursor-not-allowed select-none hover:opacity-100 bg-white' 
          : isPending 
            ? 'border-amber-200 shadow-[0_8px_30px_rgba(245,158,11,0.1)] hover:border-amber-300 cursor-pointer active:scale-[0.99] hover:shadow-md' 
            : 'border-blue-200 shadow-[0_8px_30px_rgba(59,130,246,0.08)] hover:border-blue-300 cursor-pointer active:scale-[0.99] hover:shadow-md'
      } rounded-[20px] transition-all duration-300 group overflow-hidden`}
    >
       {isPending && isEditable && <div className="absolute top-0 right-0 w-32 h-32 bg-amber-100 rounded-full blur-[50px] opacity-40 -mr-10 -mt-10 pointer-events-none" />}
       {viaje.estado === "EN_EJECUCION" && isEditable && <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100 rounded-full blur-[50px] opacity-40 -mr-10 -mt-10 pointer-events-none" />}
       
       <div className="flex items-center justify-between mb-5 z-10">
          <div className="flex flex-col">
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] mb-0.5">{formattedDate}</span>
            <span className="text-[18px] font-black tracking-tight text-[#0f172a] leading-none">{viaje.hora_salida}</span>
          </div>
          <div className="flex items-center gap-2">
            {!isEditable && (
              <span className="px-2.5 py-0.5 text-[9px] font-black uppercase rounded bg-slate-200 text-slate-500 tracking-wider">
                Solo Lectura
              </span>
            )}
            <span className={`px-3 py-1 text-[10px] font-black uppercase rounded-full tracking-wider ${
              ESTADO_COLORS[viaje.estado] || 'bg-slate-500'
            } text-white shadow-sm`}>
              {viaje.estado.replace("_", " ")}
            </span>
          </div>
       </div>
       <div className="flex items-stretch gap-4 z-10 w-full mb-1">
          <div className="flex flex-col items-center justify-between py-1.5 w-[20px]">
             <div className="w-4 h-4 bg-[#0f172a] rounded-full border-[3px] border-white shadow-sm shrink-0" />
             <div className="w-[2px] bg-slate-200/80 flex-1 my-1 rounded-full" />
             <div className={`w-4 h-4 ${isFinalizada ? 'bg-emerald-500' : 'bg-blue-500'} rounded-full border-[3px] border-white shadow-sm shrink-0`} />
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
       {(viaje.solicitante || isEditable) && (
         <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between z-10 bg-slate-50/50 -mx-5 -mb-5 px-5 md:-mx-6 md:-mb-6 md:px-6 pb-5 rounded-b-[20px]">
           <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-[#0f172a] flex items-center justify-center text-white text-[12px] font-black shadow-sm shrink-0">
               {viaje.solicitante ? viaje.solicitante.charAt(0) : "T"}
             </div>
             <div className="flex flex-col">
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">
                 {viaje.solicitante ? "Pasajero Asignado" : "Control Vial"}
               </span>
               <span className="text-[13px] font-bold text-[#0f172a] leading-none truncate max-w-[150px] sm:max-w-xs">
                 {viaje.solicitante || "Servicio Oficial"}
               </span>
             </div>
           </div>
           
           {isEditable && !isFinalizada && (
             <button className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-[#0f2548] text-white hover:bg-[#1a3a75] rounded-xl text-[11px] font-black uppercase tracking-wider shadow-sm transition-all shrink-0">
                <span>Modo Conducción</span>
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
             </button>
           )}
         </div>
       )}
    </div>
  );
}
