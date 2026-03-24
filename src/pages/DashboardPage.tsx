import { useState, useEffect, useCallback, useMemo } from "react";
import { getViajesMes } from "../services/viajes.service";
import type { ViajeAsignado } from "../services/viajes.service";
import { getDisponibilidad } from "../services/disponibilidad.service";

// ────────────────────────────────────────────────
// Helpers de calendario
// ────────────────────────────────────────────────
function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number) {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1;
}

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];
const DIAS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

const ESTADO_COLORS: Record<string, string> = {
  ASIGNADA: "bg-amber-500",
  EN_EJECUCION: "bg-blue-500",
  FINALIZADA: "bg-emerald-500",
  CANCELADA: "bg-red-400",
};

// ────────────────────────────────────────────────
// Skeleton & Stat Component del Diseño
// ────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div style={{
      background: "#fff", border: "1px solid #e5e7eb", borderRadius: 14,
      padding: "22px 24px", display: "flex", flexDirection: "column", gap: 14,
    }}>
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

function StatCard({ title, value, tag, icon, accent, loading }: {
  title: string; value: number | null; tag: string;
  icon: React.ReactNode;
  accent: { bg: string; iconColor: string; text: string; dot: string; line: string };
  loading: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  if (loading) return <SkeletonCard />;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        background: "#fff",
        border: "1px solid",
        borderColor: hovered ? "#d1d5db" : "#e5e7eb",
        borderRadius: 14,
        padding: "22px 24px 20px",
        display: "flex", flexDirection: "column",
        overflow: "hidden",
        transition: "border-color 200ms, box-shadow 200ms, transform 200ms",
        boxShadow: hovered ? "0 8px 30px rgba(0,0,0,0.08)" : "0 1px 3px rgba(0,0,0,0.04)",
        transform: hovered ? "translateY(-2px)" : "translateY(0)",
        cursor: "default",
      }}
    >
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 3,
        background: accent.line,
        borderRadius: "14px 14px 0 0",
        transform: hovered ? "scaleX(1)" : "scaleX(0)",
        transformOrigin: "left",
        transition: "transform 250ms cubic-bezier(0.4,0,0.2,1)",
      }} />

      <div style={{
        position: "absolute", top: -30, right: -30,
        width: 80, height: 80, borderRadius: "50%",
        background: accent.line,
        opacity: hovered ? 0.08 : 0,
        transition: "opacity 250ms",
        filter: "blur(20px)",
        pointerEvents: "none",
      }} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
        <div>
          <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: "#9ca3af", letterSpacing: "0.07em", textTransform: "uppercase" }}>
            {title}
          </p>
          <p style={{ margin: "7px 0 0", fontSize: 32, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.04em", lineHeight: 1 }}>
            {value ?? 0}
          </p>
        </div>
        <div style={{
          width: 42, height: 42, borderRadius: 11,
          background: hovered ? accent.bg : "#f8fafc",
          color: accent.iconColor,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0, transition: "background 200ms",
        }}>
          {icon}
        </div>
      </div>

      <span style={{
        display: "inline-flex", alignItems: "center", gap: 5,
        fontSize: 11.5, fontWeight: 600, color: accent.text,
      }}>
        <span style={{ width: 5, height: 5, borderRadius: "50%", background: accent.dot }} />
        {tag}
      </span>
    </div>
  );
}

// ────────────────────────────────────────────────
// Modal de detalle de viaje
// ────────────────────────────────────────────────
function ViajeModal({ viajes, onClose }: { viajes: ViajeAsignado[]; onClose: () => void }) {
  const FONT = "'Plus Jakarta Sans', system-ui, sans-serif";
  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 transition-opacity"
      onClick={onClose}
      style={{ fontFamily: FONT }}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white shadow-2xl p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-base font-black text-slate-800">Viajes Asignados</h3>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition"
          >
            ✕
          </button>
        </div>
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          {viajes.map((v) => (
            <div key={v.id} className="rounded-xl border border-slate-100 bg-slate-50/80 p-4 space-y-2 hover:bg-white hover:shadow-sm transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{v.hora_salida}</span>
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider ${ESTADO_COLORS[v.estado] ?? "bg-slate-400"}`}>
                  {v.estado.replace("_", " ")}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm mt-1">
                <span className="font-semibold text-slate-800 truncate">{v.origen}</span>
                <svg className="h-4 w-4 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
                <span className="font-semibold text-slate-800 truncate">{v.destino}</span>
              </div>
              {v.solicitante && (
                <p className="text-xs text-slate-500 font-medium">Pasajero: <span className="text-slate-700 font-bold">{v.solicitante}</span></p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────
// Página principal
// ────────────────────────────────────────────────
export default function DashboardPage() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [viajes, setViajes] = useState<ViajeAsignado[]>([]);
  const [loadingViajes, setLoadingViajes] = useState(true);
  const [activo, setActivo] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedDayViajes, setSelectedDayViajes] = useState<ViajeAsignado[] | null>(null);

  const cargarViajes = useCallback(async () => {
    setLoadingViajes(true);
    setError(null);
    try {
      const mes = `${year}-${String(month + 1).padStart(2, "0")}`;
      const data = await getViajesMes(mes);
      setViajes(data);
    } catch {
      setError("No se pudo cargar el calendario de viajes.");
      setViajes([]);
    } finally {
      setLoadingViajes(false);
    }
  }, [year, month]);

  useEffect(() => {
    getDisponibilidad()
      .then((d) => setActivo(d.activo))
      .catch(() => setActivo(null));
  }, []);

  useEffect(() => {
    cargarViajes();
  }, [cargarViajes]);

  // Mapa día → viajes
  const viajesPorDia: Record<number, ViajeAsignado[]> = {};
  viajes.forEach((v) => {
    const dia = parseInt(v.fecha.split("-")[2], 10);
    if (!viajesPorDia[dia]) viajesPorDia[dia] = [];
    viajesPorDia[dia].push(v);
  });

  const totalDays = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfWeek(year, month);
  const blanks = Array(firstDay).fill(null);
  const days = Array.from({ length: totalDays }, (_, i) => i + 1);

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
  };

  const isToday = (day: number) =>
    day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  // Cards stats
  const totalViajes = viajes.length;
  const asignadas = viajes.filter(v => v.estado === "ASIGNADA").length;
  const enEjecucion = viajes.filter(v => v.estado === "EN_EJECUCION").length;
  const finalizadas = viajes.filter(v => v.estado === "FINALIZADA").length;

  const FONT = "'Plus Jakarta Sans', system-ui, sans-serif";

  const cards = useMemo(() => [
    {
      title: "Asignadas",
      value: asignadas,
      tag: "Por iniciar",
      accent: { bg: "#fffbeb", iconColor: "#d97706", text: "#b45309", dot: "#f59e0b", line: "#f59e0b" },
      icon: <svg width={19} height={19} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    },
    {
      title: "En Progreso",
      value: enEjecucion,
      tag: "En proceso",
      accent: { bg: "#eff6ff", iconColor: "#2563eb", text: "#1d4ed8", dot: "#3b82f6", line: "#3b82f6" },
      icon: <svg width={19} height={19} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
    },
    {
      title: "Finalizadas",
      value: finalizadas,
      tag: "Completadas",
      accent: { bg: "#f0fdf4", iconColor: "#16a34a", text: "#15803d", dot: "#22c55e", line: "#22c55e" },
      icon: <svg width={19} height={19} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    },
    {
      title: "Total de Mes",
      value: totalViajes,
      tag: "Global",
      accent: { bg: "#f1f5f9", iconColor: "#64748b", text: "#475569", dot: "#94a3b8", line: "#94a3b8" },
      icon: <svg width={19} height={19} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
    },
  ], [asignadas, enEjecucion, finalizadas, totalViajes]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        @keyframes skpulse { 0%,100%{opacity:1} 50%{opacity:.4} }
      `}</style>

      {/* Responsive padding and layout centered */}
      <div className="p-4 md:p-8 w-full max-w-6xl mx-auto" style={{ fontFamily: FONT }}>
        
        {/* ── Header ── */}
        <div style={{
          display: "flex", alignItems: "flex-end", justifyContent: "space-between",
          marginBottom: 28, gap: 16, flexWrap: "wrap",
        }}>
          <div>
            <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: "#9ca3af", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Asamblea Legislativa · Transporte
            </p>
            <h1 style={{ margin: "4px 0 5px", fontSize: 28, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.035em", lineHeight: 1.1 }}>
              Dashboard
            </h1>
            <p style={{ margin: 0, fontSize: 13.5, color: "#6b7280" }}>
              Resumen general de viajes asignados
            </p>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            {/* Chip de disponibilidad */}
            {activo !== null && (
              <div 
                className={`inline-flex items-center gap-2.5 rounded-xl px-4 py-2 text-[13px] font-bold shadow-sm transition-all border ${
                  activo
                    ? "bg-white text-emerald-700 border-emerald-100"
                    : "bg-white text-red-700 border-red-100"
                }`}
              >
                <span className="relative flex h-3 w-3">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-30 ${activo ? "bg-emerald-400" : "bg-red-400"}`}></span>
                  <span className={`relative inline-flex rounded-full h-3 w-3 ${activo ? "bg-emerald-500" : "bg-red-500"}`}></span>
                </span>
                {activo ? "Disponible" : "En Incapacidad"}
              </div>
            )}
          </div>
        </div>

        {/* ── Error ── */}
        {error && (
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "13px 16px", borderRadius: 10,
            background: "#fef2f2", border: "1px solid #fecaca", marginBottom: 24,
          }}>
            <svg width={15} height={15} fill="none" viewBox="0 0 24 24" stroke="#dc2626" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            <p style={{ margin: 0, fontSize: 13.5, color: "#991b1b", fontWeight: 500 }}>{error}</p>
          </div>
        )}

        {/* ── Cards ── */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))",
          gap: 14, marginBottom: 28,
        }}>
          {cards.map(c => <StatCard key={c.title} {...c} loading={loadingViajes} />)}
        </div>

        {/* ── Calendario Principal Enmarcado ── */}
        <div style={{
          background: "#fff", border: "1px solid #e5e7eb",
          borderRadius: 14, overflow: "hidden",
        }}>
          {/* Calendar Top (Sustrato de la antigua tabla) */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "18px 22px", borderBottom: "1px solid #f1f5f9", background: "#fcfcfc"
          }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.02em" }}>
                Calendario de Viajes
              </h2>
              <p style={{ margin: "2px 0 0", fontSize: 12.5, color: "#9ca3af", fontWeight: 500 }}>
                Explora los viajes de tu mes actual
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={prevMonth}
                className="h-8 w-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 shadow-sm transition"
              >
                ‹
              </button>
              <h2 className="text-sm font-black text-[#0f172a] tracking-wide uppercase">
                {MESES[month]} {year}
              </h2>
              <button
                onClick={nextMonth}
                className="h-8 w-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 shadow-sm transition"
              >
                ›
              </button>
            </div>
          </div>

          {/* Grid Layout PWA Mobile First */}
          <div className="px-4 md:px-6 pb-6 pt-5">
            {/* Cabecera días */}
            <div className="grid grid-cols-7 mb-2">
              {DIAS.map((d) => (
                <div key={d} className="text-center text-[10.5px] font-bold text-slate-400 uppercase tracking-[0.1em] py-1">
                  {d}
                </div>
              ))}
            </div>

            {/* Celdas Días */}
            <div className="grid grid-cols-7 gap-1 md:gap-2">
              {blanks.map((_, i) => <div key={`b-${i}`} className="aspect-square" />)}
              {days.map((day) => {
                const tieneViajes = !!viajesPorDia[day];
                const estaHoy = isToday(day);
                return (
                  <button
                    key={day}
                    onClick={() => tieneViajes && setSelectedDayViajes(viajesPorDia[day])}
                    className={`relative flex flex-col items-center justify-center rounded-[10px] md:rounded-xl aspect-square transition-all duration-200 border
                      ${estaHoy ? "bg-[#0f172a] text-white border-[#0f172a] font-black shadow-[0_4px_12px_rgba(15,23,42,0.3)]" : "bg-white text-slate-600 border-slate-100 hover:border-slate-300 hover:bg-slate-50"}
                      ${tieneViajes && !estaHoy ? "font-bold text-slate-900 bg-slate-50/50 hover:bg-slate-100 border-slate-200" : ""}
                      ${tieneViajes ? "cursor-pointer" : "cursor-default opacity-80"}
                    `}
                  >
                    <span className="text-[13px] md:text-sm">{day}</span>
                    {tieneViajes && (
                      <div className="flex gap-0.5 md:gap-1 mt-1">
                         {/* Indicadores de viajes */}
                         {viajesPorDia[day].slice(0, 3).map((v, i) => (
                            <span key={i} className={`h-1.5 w-1.5 rounded-full ${estaHoy ? "bg-amber-400" : (ESTADO_COLORS[v.estado] || "bg-blue-500")}`} />
                         ))}
                         {viajesPorDia[day].length > 3 && (
                            <span className={`h-1.5 w-1.5 rounded-full ${estaHoy ? "bg-white" : "bg-slate-300"}`} />
                         )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Loading overlay del Calendario (si aplica y no es el inicio) */}
          {loadingViajes && (
            <div className="absolute inset-x-0 bottom-0 top-[80px] bg-white/70 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center gap-3">
               <div style={{ width: 40, height: 40, borderRadius: 10, background: "#f1f5f9", animation: "skpulse 1.4s ease-in-out infinite" }} />
               <p className="text-xs font-bold text-slate-500 uppercase tracking-widest animate-pulse">Cargando...</p>
            </div>
          )}
        </div>

      </div>

      {/* Modal */}
      {selectedDayViajes && (
        <ViajeModal viajes={selectedDayViajes} onClose={() => setSelectedDayViajes(null)} />
      )}
    </>
  );
}
