// src/pages/solicitudes/combustible/paso-2-combustible.tsx
//
// Paso 2 del wizard de solicitud de combustible.
// Responsabilidad: destino/actividad, fecha, cantidad, prioridad,
// período de uso opcional y observaciones.
// Lee y escribe estado en localStorage bajo STORAGE_KEY.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { STORAGE_KEY, type WizardData } from "./paso-1-combustible";

// ══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════════════════════════════════════

function safeParse(json: string | null): WizardData {
  try { return json ? JSON.parse(json) : {}; } catch { return {}; }
}

type Prioridad = "baja" | "media" | "alta";

const PRIORIDAD_CONFIG: Record<Prioridad, { label: string; dot: string; active: string; border: string }> = {
  baja:  {
    label:  "Baja",
    dot:    "bg-emerald-400",
    active: "bg-emerald-50 text-emerald-700",
    border: "border-emerald-500",
  },
  media: {
    label:  "Media",
    dot:    "bg-amber-400",
    active: "bg-amber-50 text-amber-700",
    border: "border-amber-500",
  },
  alta:  {
    label:  "Alta",
    dot:    "bg-red-400",
    active: "bg-red-50 text-red-700",
    border: "border-red-500",
  },
};

// ══════════════════════════════════════════════════════════════════════════════
// COMPONENTES UI
// ══════════════════════════════════════════════════════════════════════════════

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="mb-1.5 block text-xs font-extrabold uppercase tracking-widest text-slate-400">
      {children}
      {required && <span className="ml-1 text-emerald-500">*</span>}
    </label>
  );
}

function inputCls(hasError = false) {
  return [
    "w-full rounded-2xl border px-4 py-3 text-sm font-semibold text-slate-800",
    "bg-white placeholder-slate-400 transition-all",
    "focus:outline-none focus:ring-2 focus:ring-emerald-400/60 focus:border-emerald-400",
    hasError
      ? "border-red-300 ring-2 ring-red-200/50"
      : "border-slate-200 hover:border-slate-300",
  ].join(" ");
}

function PrioridadBtn({
  value, current, onClick,
}: {
  value: Prioridad;
  current: Prioridad | "";
  onClick: () => void;
}) {
  const cfg = PRIORIDAD_CONFIG[value];
  const sel = current === value;
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "flex items-center gap-2 rounded-2xl border-2 px-4 py-2.5 text-sm font-black transition-all focus:outline-none",
        sel
          ? `${cfg.active} ${cfg.border}`
          : "border-slate-200 bg-white text-slate-500 hover:border-slate-300",
      ].join(" ")}
    >
      <span className={["h-2.5 w-2.5 rounded-full", cfg.dot].join(" ")} />
      {cfg.label}
    </button>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// PÁGINA PRINCIPAL
// ══════════════════════════════════════════════════════════════════════════════

export default function Paso2Combustible() {
  const navigate = useNavigate();

  // ── Formulario ─────────────────────────────────────────────────────────────
  const [destino,       setDestino]      = useState("");
  const [fechaSol,      setFechaSol]     = useState(new Date().toISOString().split("T")[0]);
  const [cantidad,      setCantidad]     = useState("");
  const [prioridad,     setPrioridad]    = useState<Prioridad | "">("");
  const [fechaInicio,   setFechaInicio]  = useState("");
  const [fechaFin,      setFechaFin]     = useState("");
  const [observaciones, setObservaciones]= useState("");
  const [errors,        setErrors]       = useState<Record<string, string>>({});

  // ── Guardar vehiculo_label para el resumen del paso 3 ─────────────────────
  const [vehiculoLabel, setVehiculoLabel] = useState("");

  // ── Verificar que viene del paso 1 ────────────────────────────────────────
  useEffect(() => {
    const saved = safeParse(localStorage.getItem(STORAGE_KEY));

    // Si no hay vehículo seleccionado, regresa al paso 1
    if (!saved.vehiculo_id) {
      navigate("/solicitudes/combustible/paso-1", { replace: true });
      return;
    }

    // Hidratar campos si ya pasó por aquí antes
    if (saved.destino_actividad)    setDestino(saved.destino_actividad);
    if (saved.fecha_solicitud)      setFechaSol(saved.fecha_solicitud);
    if (saved.cantidad_combustible) setCantidad(String(saved.cantidad_combustible));
    if (saved.prioridad)            setPrioridad(saved.prioridad);
    if (saved.fecha_inicio_periodo) setFechaInicio(saved.fecha_inicio_periodo);
    if (saved.fecha_fin_periodo)    setFechaFin(saved.fecha_fin_periodo);
    if (saved.observaciones)        setObservaciones(saved.observaciones);
    if (saved.vehiculo_label)       setVehiculoLabel(saved.vehiculo_label);
  }, [navigate]);

  // ── Validación ────────────────────────────────────────────────────────────
  function validate(): Record<string, string> {
    const e: Record<string, string> = {};
    if (!destino.trim())
      e.destino = "El destino o actividad es requerido.";
    if (!fechaSol)
      e.fechaSol = "La fecha de solicitud es requerida.";
    if (!cantidad || isNaN(Number(cantidad)) || Number(cantidad) <= 0)
      e.cantidad = "Ingrese una cantidad válida mayor a 0.";
    if (!prioridad)
      e.prioridad = "Seleccione una prioridad.";
    if (fechaInicio && fechaFin && fechaFin < fechaInicio)
      e.fechaFin = "La fecha fin debe ser posterior a la fecha de inicio.";
    return e;
  }

  // ── Avanzar al paso 3 ─────────────────────────────────────────────────────
  function handleNext() {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    const prev = safeParse(localStorage.getItem(STORAGE_KEY));
    const data: WizardData = {
      ...prev,
      destino_actividad:    destino.trim(),
      fecha_solicitud:      fechaSol,
      cantidad_combustible: parseFloat(cantidad),
      prioridad:            prioridad as Prioridad,
      fecha_inicio_periodo: fechaInicio || undefined,
      fecha_fin_periodo:    fechaFin    || undefined,
      observaciones:        observaciones.trim() || undefined,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    navigate("/solicitudes/combustible/paso-3");
  }

  function handleBack() {
    navigate("/solicitudes/combustible/paso-1");
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="mx-auto max-w-7xl space-y-7 pb-10">

      {/* ── Barra de progreso ──────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm sm:px-7">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-base font-bold text-slate-900">Nueva Solicitud de Combustible</h3>
          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Paso 2 de 3
          </span>
        </div>
        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div className="h-full w-2/3 rounded-full bg-emerald-500 transition-all duration-500" />
        </div>
        <div className="mt-3 flex items-center justify-between text-sm">
          <span className="text-slate-600">
            Actual: <span className="font-semibold text-emerald-600">Detalles</span>
          </span>
          <span className="italic text-slate-400">
            {vehiculoLabel ? `Vehículo: ${vehiculoLabel}` : "Información de la carga"}
          </span>
        </div>
      </div>

      {/* ── Título ────────────────────────────────────────────────────────── */}
      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-[34px]">
          Detalles de la Carga
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-slate-600">
          Completa la información sobre el destino, cantidad de combustible y prioridad
          de la solicitud.
        </p>
      </div>

      {/* ── Formulario ────────────────────────────────────────────────────── */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="space-y-7">

          {/* ── Destino / Actividad ───────────────────────────────────────── */}
          <section>
            <p className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400 mb-4">
              Destino y actividad
            </p>
            <div>
              <FieldLabel required>Destino / Actividad</FieldLabel>
              <input
                type="text"
                value={destino}
                onChange={(e) => {
                  setDestino(e.target.value);
                  setErrors((p) => { const n = { ...p }; delete n.destino; return n; });
                }}
                placeholder="Ej: Visita a sede central, reparto zona norte..."
                className={inputCls(!!errors.destino)}
              />
              {errors.destino && (
                <p className="mt-1.5 text-xs font-semibold text-red-500">{errors.destino}</p>
              )}
            </div>
          </section>

          {/* ── Fecha y cantidad ──────────────────────────────────────────── */}
          <section>
            <p className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400 mb-4">
              Fecha y cantidad
            </p>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <FieldLabel required>Fecha de solicitud</FieldLabel>
                <input
                  type="date"
                  value={fechaSol}
                  onChange={(e) => {
                    setFechaSol(e.target.value);
                    setErrors((p) => { const n = { ...p }; delete n.fechaSol; return n; });
                  }}
                  className={inputCls(!!errors.fechaSol)}
                />
                {errors.fechaSol && (
                  <p className="mt-1.5 text-xs font-semibold text-red-500">{errors.fechaSol}</p>
                )}
              </div>
              <div>
                <FieldLabel required>Cantidad (galones)</FieldLabel>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={cantidad}
                    onChange={(e) => {
                      setCantidad(e.target.value);
                      setErrors((p) => { const n = { ...p }; delete n.cantidad; return n; });
                    }}
                    placeholder="0.00"
                    className={inputCls(!!errors.cantidad) + " pr-16"}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400">
                    gal
                  </span>
                </div>
                {errors.cantidad && (
                  <p className="mt-1.5 text-xs font-semibold text-red-500">{errors.cantidad}</p>
                )}
              </div>
            </div>
          </section>

          {/* ── Período de uso (opcional) ─────────────────────────────────── */}
          <section className="rounded-2xl border border-dashed border-slate-200 p-5">
            <p className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400 mb-4">
              Período de uso{" "}
              <span className="normal-case font-semibold tracking-normal text-slate-400">(opcional)</span>
            </p>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <FieldLabel>Fecha de inicio</FieldLabel>
                <input
                  type="date"
                  value={fechaInicio}
                  onChange={(e) => {
                    setFechaInicio(e.target.value);
                    setErrors((p) => { const n = { ...p }; delete n.fechaFin; return n; });
                  }}
                  className={inputCls()}
                />
              </div>
              <div>
                <FieldLabel>Fecha de fin</FieldLabel>
                <input
                  type="date"
                  value={fechaFin}
                  min={fechaInicio || undefined}
                  onChange={(e) => {
                    setFechaFin(e.target.value);
                    setErrors((p) => { const n = { ...p }; delete n.fechaFin; return n; });
                  }}
                  className={inputCls(!!errors.fechaFin)}
                />
                {errors.fechaFin && (
                  <p className="mt-1.5 text-xs font-semibold text-red-500">{errors.fechaFin}</p>
                )}
              </div>
            </div>
          </section>

          {/* ── Prioridad ─────────────────────────────────────────────────── */}
          <section>
            <p className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400 mb-4">
              Prioridad
            </p>
            <div className="flex flex-wrap gap-3">
              {(["baja", "media", "alta"] as Prioridad[]).map((p) => (
                <PrioridadBtn
                  key={p}
                  value={p}
                  current={prioridad}
                  onClick={() => {
                    setPrioridad(p);
                    setErrors((prev) => { const n = { ...prev }; delete n.prioridad; return n; });
                  }}
                />
              ))}
            </div>
            {errors.prioridad && (
              <p className="mt-2 text-xs font-semibold text-red-500">{errors.prioridad}</p>
            )}
          </section>

          {/* ── Observaciones ─────────────────────────────────────────────── */}
          <section>
            <p className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400 mb-4">
              Observaciones{" "}
              <span className="normal-case font-semibold tracking-normal text-slate-400">(opcional)</span>
            </p>
            <textarea
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              rows={3}
              maxLength={2000}
              placeholder="Información adicional relevante para la solicitud..."
              className={inputCls() + " resize-none"}
            />
            <p className="mt-1 text-right text-[10px] font-semibold text-slate-400">
              {observaciones.length}/2000
            </p>
          </section>

        </div>

        {/* ── Navegación ──────────────────────────────────────────────────── */}
        <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <button
            onClick={() => navigate("/solicitudes/combustible")}
            className="inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Cancelar
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={handleBack}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-[0.99]"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Anterior
            </button>

            <button
              onClick={handleNext}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-600 active:scale-[0.99]"
            >
              Siguiente
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}