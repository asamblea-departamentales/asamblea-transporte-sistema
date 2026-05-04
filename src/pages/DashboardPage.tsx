import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { getViajesMes } from "../services/viajes.service";
import type { ViajeAsignado } from "../services/viajes.service";
import { useNotification } from "../contexts/NotificationContext";

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
};

// ────────────────────────────────────────────────
// Skeleton & Stat Component del Diseño
// ────────────────────────────────────────────────

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

function StatCard({ title, value, tag, icon, accent, loading }: { title: string; value: number | null; tag: string; icon: React.ReactNode; accent: { bg: string; iconColor: string; text: string; dot: string; line: string }; loading: boolean; }) {
  const [hovered, setHovered] = useState(false);
  if (loading) return <SkeletonCard />;

  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative", background: "#fff", border: "1px solid", borderColor: hovered ? "#d1d5db" : "#e5e7eb", borderRadius: 14, padding: "22px 24px 20px", display: "flex", flexDirection: "column", overflow: "hidden", transition: "border-color 200ms, box-shadow 200ms, transform 200ms", boxShadow: hovered ? "0 8px 30px rgba(0,0,0,0.08)" : "0 1px 3px rgba(0,0,0,0.04)", transform: hovered ? "translateY(-2px)" : "translateY(0)"
      }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: accent.line, borderRadius: "14px 14px 0 0", transform: hovered ? "scaleX(1)" : "scaleX(0)", transformOrigin: "left", transition: "transform 250ms cubic-bezier(0.4,0,0.2,1)" }} />
      <div style={{ position: "absolute", top: -30, right: -30, width: 80, height: 80, borderRadius: "50%", background: accent.line, opacity: hovered ? 0.08 : 0, transition: "opacity 250ms", filter: "blur(20px)", pointerEvents: "none" }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
        <div>
          <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: "#9ca3af", letterSpacing: "0.07em", textTransform: "uppercase" }}>{title}</p>
          <p style={{ margin: "7px 0 0", fontSize: 32, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.04em", lineHeight: 1 }}>{value ?? 0}</p>
        </div>
        <div style={{ width: 42, height: 42, borderRadius: 11, background: hovered ? accent.bg : "#f8fafc", color: accent.iconColor, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "background 200ms" }}>
          {icon}
        </div>
      </div>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11.5, fontWeight: 600, color: accent.text }}>
        <span style={{ width: 5, height: 5, borderRadius: "50%", background: accent.dot }} />{tag}
      </span>
    </div>
  );
}

// ────────────────────────────────────────────────
// Componente: Tarjeta de Viaje Dinámica
// ────────────────────────────────────────────────
function TripCard({ viaje }: { viaje: ViajeAsignado }) {
  const isPending = viaje.estado === "ASIGNADA";
  const dateObj = new Date(viaje.fecha + "T00:00:00");
  const formattedDate = dateObj.toLocaleDateString("es-SV", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div className={`relative flex flex-col p-5 md:p-6 bg-white border ${isPending ? 'border-amber-200 shadow-[0_8px_30px_rgba(245,158,11,0.1)] hover:border-amber-300' : 'border-slate-200 hover:border-slate-300 hover:shadow-md'} rounded-[20px] transition-all duration-300 group overflow-hidden`}>
       {isPending && <div className="absolute top-0 right-0 w-32 h-32 bg-amber-100 rounded-full blur-[50px] opacity-40 -mr-10 -mt-10 pointer-events-none" />}
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
             <div className="w-4 h-4 bg-blue-500 rounded-full border-[3px] border-white shadow-sm shrink-0" />
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
           <button className="flex items-center justify-center w-8 h-8 bg-white border border-slate-200 group-hover:border-blue-200 text-slate-400 group-hover:text-blue-600 rounded-full shadow-sm transition-colors shrink-0">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
           </button>
         </div>
       )}
    </div>
  )
}

// ────────────────────────────────────────────────
// Página principal
// ────────────────────────────────────────────────
export default function DashboardPage() {
  const [viajes, setViajes] = useState<ViajeAsignado[]>([]);
  const [loadingViajes, setLoadingViajes] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { simulateNotification } = useNotification();
  const prevViajesLength = useRef<number | null>(null);

  const cargarViajes = useCallback(async () => {
    try {
      const today = new Date();
      const currentMonthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
      
      let nextMonth = today.getMonth() + 1;
      let nextYear = today.getFullYear();
      if (nextMonth > 11) { nextMonth = 0; nextYear++; }
      const nextMonthStr = `${nextYear}-${String(nextMonth + 1).padStart(2, "0")}`;

      const [dataCurrent, dataNext] = await Promise.all([
        getViajesMes(currentMonthStr),
        getViajesMes(nextMonthStr)
      ]);
      
      const allViajes = [...dataCurrent, ...dataNext];
      const activeViajes = allViajes.filter(v => v.estado === "ASIGNADA" || v.estado === "EN_EJECUCION");
      
      // Eliminar duplicados por si acaso el backend devuelve algo raro
      const uniqueViajes = Array.from(new Map(activeViajes.map(item => [item.id, item])).values());
      
      setViajes(uniqueViajes);
      if(error) setError(null);
    } catch {
      setError("No se pudo conectar con los servidores de asignación de viajes.");
    } finally {
      setLoadingViajes(false);
    }
  }, [error]);

  // Carga inicial y Polling (refresca info en background cada X segundos)
  useEffect(() => {
    cargarViajes();
    
    // Polling cada 15 segundos para buscar nuevos viajes
    const interval = setInterval(() => {
      cargarViajes();
    }, 15000); 

    return () => clearInterval(interval);
  }, [cargarViajes]);

  // Lógica de Notificador In-App Integrada al Fetch
  useEffect(() => {
    if (loadingViajes) return; // Wait until initial load is completely done
    
    const countAsignadas = viajes.filter(v => v.estado === "ASIGNADA").length;
    
    // Si la cantidad de asignadas ahora es mayor que la medición de hace unos instantes...
    if (prevViajesLength.current !== null && countAsignadas > prevViajesLength.current) {
        simulateNotification(
           "🚗 ¡Nuevo Viaje Asignado!", 
           "Revisa tu panel. La jefatura te ha despachado una nueva ruta."
        );
    }
    
    // Almacenamos el count actual para compararlo en el siguiente renderizado/fetch
    prevViajesLength.current = countAsignadas;
  }, [viajes, loadingViajes, simulateNotification]);

  const sortedViajes = useMemo(() => {
    return [...viajes].sort((a, b) => new Date(`${a.fecha}T${a.hora_salida}`).getTime() - new Date(`${b.fecha}T${b.hora_salida}`).getTime());
  }, [viajes]);

  const totalActivos = viajes.length;
  const asignadas = viajes.filter(v => v.estado === "ASIGNADA").length;
  const enEjecucion = viajes.filter(v => v.estado === "EN_EJECUCION").length;

  const FONT = "'Plus Jakarta Sans', system-ui, sans-serif";

  const cards = useMemo(() => [
    { title: "Por Iniciar", value: asignadas, tag: "Nuevas", accent: { bg: "#fffbeb", iconColor: "#d97706", text: "#b45309", dot: "#f59e0b", line: "#f59e0b" }, icon: <svg width={19} height={19} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
    { title: "En Curso", value: enEjecucion, tag: "Actualmente", accent: { bg: "#eff6ff", iconColor: "#2563eb", text: "#1d4ed8", dot: "#3b82f6", line: "#3b82f6" }, icon: <svg width={19} height={19} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg> },
  ], [asignadas, enEjecucion]);

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap'); * { box-sizing: border-box; } @keyframes skpulse { 0%,100%{opacity:1} 50%{opacity:.4} }`}</style>
      <div className="p-4 md:p-8 w-full max-w-4xl mx-auto" style={{ fontFamily: FONT }}>
        
        {/* Header (Limpio ya que la disponibilidad pasó al Sidebar) */}
        <div className="flex items-end justify-between mb-7 gap-4 flex-wrap">
          <div>
            <p className="m-0 text-[11px] font-bold text-slate-400 tracking-[0.08em] uppercase">Asamblea Legislativa · Transporte</p>
            <h1 className="m-0 mt-1 mb-1 text-2xl md:text-3xl font-extrabold text-[#0f172a] tracking-tight leading-tight">Panel Principal</h1>
            <p className="m-0 text-[13.5px] text-slate-500 font-medium">Actualización automática activada</p>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-red-50 border border-red-200 mb-6 shadow-sm">
            <svg width={18} height={18} fill="none" viewBox="0 0 24 24" stroke="#dc2626" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            <p className="m-0 text-[13px] text-red-800 font-bold">{error}</p>
          </div>
        )}

        {/* Cards Stats */}
        <div className="grid grid-cols-2 gap-3 md:gap-4 mb-8">
          {cards.map(c => <StatCard key={c.title} {...c} loading={loadingViajes} />)}
        </div>

        {/* Lista de Viajes Pendientes */}
        <div className="flex flex-col gap-5">
           <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60">
              <div>
                 <h2 className="text-[18px] font-extrabold text-[#0f172a] flex items-center gap-2">
                    Próximos Viajes
                    {asignadas > 0 && <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] uppercase font-black tracking-wider rounded-lg animate-pulse">Pendientes</span>}
                 </h2>
                 <p className="text-[13px] font-medium text-slate-500 mt-0.5">Listado de asignaciones activas por atender</p>
              </div>
           </div>

           {loadingViajes ? (
             <div className="flex flex-col gap-4 py-4"><SkeletonCard /><SkeletonCard /></div>
           ) : sortedViajes.length === 0 ? (
             <div className="flex flex-col items-center justify-center py-16 px-4 bg-[#f8fafc] border border-slate-200 rounded-3xl mt-2 text-center shadow-inner">
                <div className="w-20 h-20 bg-white shadow-sm border border-slate-100 text-emerald-500 rounded-full flex items-center justify-center mb-5">
                  <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-[18px] font-extrabold text-slate-800 mb-2">¡Todo al día!</h3>
                <p className="text-[14px] font-medium text-slate-500 max-w-sm leading-relaxed">
                   Actualmente no tienes viajes pendientes o en curso. Mantente alerta, te avisaremos cuando se te asigne una nueva ruta.
                </p>
             </div>
           ) : (
             <div className="flex flex-col gap-4 mt-2">
                {sortedViajes.map((v) => <TripCard key={v.id} viaje={v} />)}
             </div>
           )}
        </div>
      </div>
    </>
  );
}
