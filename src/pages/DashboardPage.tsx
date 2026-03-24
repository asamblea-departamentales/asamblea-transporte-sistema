import { useState, useEffect, useCallback } from "react";
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
  // 0=lunes ... 6=domingo
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1;
}

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];
const DIAS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

const ESTADO_COLORS: Record<string, string> = {
  ASIGNADA: "bg-blue-500",
  EN_EJECUCION: "bg-amber-500",
  FINALIZADA: "bg-emerald-500",
  CANCELADA: "bg-red-400",
};

// ────────────────────────────────────────────────
// Modal de detalle de viaje
// ────────────────────────────────────────────────
function ViajeModal({ viajes, onClose }: { viajes: ViajeAsignado[]; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white shadow-2xl p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-base font-black text-slate-900">Viajes del día</h3>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition"
          >
            ✕
          </button>
        </div>
        {viajes.map((v) => (
          <div key={v.id} className="rounded-xl border border-slate-100 bg-slate-50 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">{v.hora_salida}</span>
              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold text-white ${ESTADO_COLORS[v.estado] ?? "bg-slate-400"}`}>
                {v.estado.replace("_", " ")}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="font-semibold text-slate-800 truncate">{v.origen}</span>
              <svg className="h-4 w-4 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
              <span className="font-semibold text-slate-800 truncate">{v.destino}</span>
            </div>
            {v.solicitante && (
              <p className="text-xs text-slate-400">Solicitante: <span className="text-slate-600">{v.solicitante}</span></p>
            )}
          </div>
        ))}
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
  const [selectedDayViajes, setSelectedDayViajes] = useState<ViajeAsignado[] | null>(null);

  // Cargar viajes del mes
  const cargarViajes = useCallback(async () => {
    setLoadingViajes(true);
    try {
      const mes = `${year}-${String(month + 1).padStart(2, "0")}`;
      const data = await getViajesMes(mes);
      setViajes(data);
    } catch {
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

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto">

      {/* Header de sección */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-slate-900">Mis Viajes</h1>
          <p className="text-sm text-slate-500 mt-0.5">Calendario de viajes asignados</p>
        </div>
        {/* Chip de disponibilidad */}
        {activo !== null && (
          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
            activo
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}>
            <span className={`h-2 w-2 rounded-full ${activo ? "bg-emerald-500" : "bg-red-500"}`} />
            {activo ? "Habilitado" : "En Incapacidad"}
          </span>
        )}
      </div>

      {/* Card del calendario */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {/* Navegación de mes */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <button
            onClick={prevMonth}
            className="h-9 w-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition"
          >
            ‹
          </button>
          <h2 className="text-base font-black text-slate-800">
            {MESES[month]} {year}
          </h2>
          <button
            onClick={nextMonth}
            className="h-9 w-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition"
          >
            ›
          </button>
        </div>

        {/* Grid */}
        <div className="px-4 pb-4 pt-3">
          {/* Cabecera días */}
          <div className="grid grid-cols-7 mb-1">
            {DIAS.map((d) => (
              <div key={d} className="text-center text-[11px] font-bold text-slate-400 py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Días */}
          <div className="grid grid-cols-7 gap-1">
            {blanks.map((_, i) => <div key={`b-${i}`} />)}
            {days.map((day) => {
              const tieneViajes = !!viajesPorDia[day];
              const estaHoy = isToday(day);
              return (
                <button
                  key={day}
                  onClick={() => tieneViajes && setSelectedDayViajes(viajesPorDia[day])}
                  className={`relative flex flex-col items-center justify-center rounded-xl aspect-square transition-all
                    ${estaHoy ? "bg-[#0f2548] text-white font-black shadow-lg" : "text-slate-700 hover:bg-slate-50"}
                    ${tieneViajes && !estaHoy ? "font-bold" : ""}
                    ${tieneViajes ? "cursor-pointer" : "cursor-default"}
                  `}
                >
                  <span className="text-sm">{day}</span>
                  {tieneViajes && (
                    <span className={`mt-0.5 h-1.5 w-1.5 rounded-full ${estaHoy ? "bg-blue-300" : "bg-blue-500"}`} />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Loading overlay */}
        {loadingViajes && (
          <div className="flex items-center justify-center py-6 text-sm text-slate-400 gap-2">
            <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
            </svg>
            Cargando viajes...
          </div>
        )}
      </div>

      {/* Leyenda */}
      <div className="mt-4 flex items-center gap-4 text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-blue-500" /> Viaje asignado
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-[#0f2548]" /> Hoy
        </span>
      </div>

      {/* Modal */}
      {selectedDayViajes && (
        <ViajeModal viajes={selectedDayViajes} onClose={() => setSelectedDayViajes(null)} />
      )}
    </div>
  );
}
