import { useState, useEffect, useCallback, useMemo } from "react";

import { getViajesMes } from "./viajes.service";
import type { ViajeAsignado } from "./viajes.service";

// ────────────────────────────────────────────────
// Helpers y Constantes
// ────────────────────────────────────────────────

import { TripCard, SkeletonCard } from "../shared/components/ui/TripCard";

// ────────────────────────────────────────────────
// Skeleton & Stat Component del Diseño
// ────────────────────────────────────────────────


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
// Página principal
// ────────────────────────────────────────────────
export default function DashboardPage() {
  const [viajes, setViajes] = useState<ViajeAsignado[]>([]);
  const [loadingViajes, setLoadingViajes] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      const activeViajes = allViajes.filter(v => ["ASIGNADA", "APROBADA", "PROGRAMADA", "EN_EJECUCION"].includes(v.estado));
      
      // Sincronizar el viaje activo global
      const enEjecucionTrip = allViajes.find(v => v.estado === "EN_EJECUCION");
      if (enEjecucionTrip) {
        localStorage.setItem("viaje_en_ejecucion_id", String(enEjecucionTrip.id));
      } else {
        localStorage.removeItem("viaje_en_ejecucion_id");
      }
      
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

  const sortedViajes = useMemo(() => {
    return [...viajes].sort((a, b) => new Date(`${a.fecha}T${a.hora_salida}`).getTime() - new Date(`${b.fecha}T${b.hora_salida}`).getTime());
  }, [viajes]);

  const todayStr = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }, []);

  const { viajesHoy, viajesFuturos } = useMemo(() => {
    const hoy: ViajeAsignado[] = [];
    const futuros: ViajeAsignado[] = [];
    sortedViajes.forEach(v => {
      if (v.fecha <= todayStr) {
        hoy.push(v);
      } else {
        futuros.push(v);
      }
    });
    return { viajesHoy: hoy, viajesFuturos: futuros };
  }, [sortedViajes, todayStr]);

  const asignadas = viajes.filter(v => ["ASIGNADA", "APROBADA", "PROGRAMADA"].includes(v.estado)).length;
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
        
        {/* Header */}
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

        {/* Estructura Jerárquica de Viajes */}
        <div className="flex flex-col gap-8">
           
           {/* ZONA A: Viaje Activo/Prioritario de Hoy */}
           <div className="flex flex-col gap-4">
              <div className="pb-2 border-b border-slate-200/60">
                 <h2 className="text-[17px] font-black text-[#0f172a] flex items-center gap-2 tracking-tight">
                    Ruta Prioritaria de Hoy
                    {viajesHoy.length > 0 && (
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] uppercase font-black tracking-wider rounded-lg animate-pulse">
                         {viajesHoy.some(v => v.estado === "EN_EJECUCION") ? "En Curso" : "Por Iniciar"}
                      </span>
                    )}
                 </h2>
                 <p className="text-[12.5px] font-medium text-slate-500 mt-0.5">Asignación técnica obligatoria para atender hoy</p>
              </div>

              {loadingViajes && sortedViajes.length === 0 ? (
                <SkeletonCard />
              ) : viajesHoy.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 px-4 bg-[#f8fafc] border border-dashed border-slate-200 rounded-[20px] text-center">
                   <p className="text-[13px] font-semibold text-slate-400">No posees viajes programados para el día de hoy</p>
                </div>
              ) : (
                <div className={`flex flex-col gap-4 mt-1 transition-opacity duration-300 ${loadingViajes ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                   {viajesHoy.map((v) => {
                      const isEditable = v.fecha === todayStr || v.estado === "EN_EJECUCION";
                      return <TripCard key={v.id} viaje={v} isEditable={isEditable} />;
                   })}
                </div>
              )}
           </div>

           {/* ZONA B: Próximos Viajes (Otros Días de la Semana) */}
           <div className="flex flex-col gap-4">
              <div className="pb-2 border-b border-slate-200/60">
                 <h2 className="text-[17px] font-black text-[#0f172a] flex items-center gap-2 tracking-tight">
                    Próximos Viajes de la Semana
                    {viajesFuturos.length > 0 && (
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] uppercase font-black tracking-wider rounded-lg">
                         En Agenda
                      </span>
                    )}
                 </h2>
                 <p className="text-[12.5px] font-medium text-slate-500 mt-0.5">Programación y planificación de rutas futuras</p>
              </div>

              {loadingViajes && sortedViajes.length === 0 ? (
                <div className="flex flex-col gap-4 py-4"><SkeletonCard /><SkeletonCard /></div>
              ) : viajesFuturos.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 px-4 bg-[#f8fafc] border border-dashed border-slate-200 rounded-[20px] text-center">
                   <p className="text-[13px] font-semibold text-slate-400">No tienes viajes agendados para los días futuros</p>
                </div>
              ) : (
                <div className={`flex flex-col gap-4 mt-1 transition-opacity duration-300 ${loadingViajes ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                   {viajesFuturos.map((v) => {
                      const isEditable = v.fecha === todayStr || v.estado === "EN_EJECUCION";
                      return <TripCard key={v.id} viaje={v} isEditable={isEditable} />;
                   })}
                </div>
              )}
           </div>

        </div>
      </div>
    </>
  );
}
