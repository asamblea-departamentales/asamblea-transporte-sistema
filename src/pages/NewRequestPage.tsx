import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// ─────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────
export type VehiculoId = "sedan" | "microbus" | "camion";

export type SolicitudStep1 = {
  tipoVehiculo: VehiculoId | "";
  fecha: string;
  hora: string;
  encargado: string;
  subencargado: string;
  pasajeros: string;
};

export const STORAGE_KEY = "solicitud_transporte";

const STEP1_DEFAULTS: SolicitudStep1 = {
  tipoVehiculo: "",
  fecha: "",
  hora: "",
  encargado: "",
  subencargado: "",
  pasajeros: "",
};

// ─────────────────────────────────────────────
// Helpers de localStorage
// ─────────────────────────────────────────────
export function getStoredSolicitud(): Partial<SolicitudStep1> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveStoredSolicitud(data: Partial<SolicitudStep1>) {
  const current = getStoredSolicitud();
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...current, ...data }));
}

// ─────────────────────────────────────────────
// Datos de vehículos
// ─────────────────────────────────────────────
type Vehiculo = {
  id: VehiculoId;
  label: string;
  sublabel: string;
  capacity: string;
  svg: React.ReactNode;
};

const IconSedan = () => (
  <svg viewBox="0 0 80 38" fill="none" className="h-full w-full">
    <path
      d="M8 26 C8 26 14 14 24 12 L36 11 L44 11 C54 12 68 22 72 26 L72 30 C72 32 70 33 68 33 L12 33 C10 33 8 32 8 30 Z"
      fill="currentColor" opacity="0.18"
    />
    <path
      d="M22 26 C22 26 26 15 34 13 L46 13 C54 15 58 23 58 26 Z"
      fill="currentColor" opacity="0.30"
    />
    <path
      d="M8 28 L8 24 C8 20 12 18 16 18 L64 18 C68 18 72 20 72 24 L72 28 C72 30 70 31 68 31 L12 31 C10 31 8 30 8 28 Z"
      fill="currentColor" opacity="0.55"
    />
    <rect x="22" y="14" width="14" height="9" rx="2" fill="white" opacity="0.45"/>
    <rect x="38" y="14" width="14" height="9" rx="2" fill="white" opacity="0.45"/>
    <circle cx="22" cy="31" r="6" fill="currentColor" opacity="0.85"/>
    <circle cx="22" cy="31" r="3" fill="white" opacity="0.55"/>
    <circle cx="58" cy="31" r="6" fill="currentColor" opacity="0.85"/>
    <circle cx="58" cy="31" r="3" fill="white" opacity="0.55"/>
    <rect x="68" y="22" width="6" height="3" rx="1" fill="currentColor" opacity="0.4"/>
    <rect x="6" y="22" width="5" height="3" rx="1" fill="currentColor" opacity="0.3"/>
  </svg>
);

const IconMicrobus = () => (
  <svg viewBox="0 0 80 38" fill="none" className="h-full w-full">
    <path
      d="M4 10 C4 7 6 5 9 5 L71 5 C74 5 76 7 76 10 L76 30 C76 32 74 33 71 33 L9 33 C6 33 4 32 4 30 Z"
      fill="currentColor" opacity="0.20"
    />
    <rect x="4" y="5" width="72" height="6" rx="2" fill="currentColor" opacity="0.12"/>
    <rect x="8"  y="11" width="11" height="9" rx="2" fill="white" opacity="0.50"/>
    <rect x="23" y="11" width="11" height="9" rx="2" fill="white" opacity="0.50"/>
    <rect x="38" y="11" width="11" height="9" rx="2" fill="white" opacity="0.50"/>
    <rect x="53" y="11" width="11" height="9" rx="2" fill="white" opacity="0.50"/>
    <rect x="55" y="21" width="13" height="11" rx="1.5" fill="white" opacity="0.25"/>
    <circle cx="55" cy="26" r="1.2" fill="currentColor" opacity="0.5"/>
    <rect x="4" y="24" width="48" height="1.5" rx="0.75" fill="currentColor" opacity="0.10"/>
    <circle cx="18" cy="33" r="5.5" fill="currentColor" opacity="0.85"/>
    <circle cx="18" cy="33" r="2.5" fill="white" opacity="0.55"/>
    <circle cx="62" cy="33" r="5.5" fill="currentColor" opacity="0.85"/>
    <circle cx="62" cy="33" r="2.5" fill="white" opacity="0.55"/>
  </svg>
);

const IconCamion = () => (
  <svg viewBox="0 0 90 40" fill="none" className="h-full w-full">
    <rect x="2" y="8" width="50" height="24" rx="2.5" fill="currentColor" opacity="0.18"/>
    <rect x="2" y="8" width="50" height="6" fill="currentColor" opacity="0.10"/>
    <rect x="6"  y="11" width="9" height="7" rx="1.5" fill="white" opacity="0.40"/>
    <rect x="18" y="11" width="9" height="7" rx="1.5" fill="white" opacity="0.40"/>
    <rect x="30" y="11" width="9" height="7" rx="1.5" fill="white" opacity="0.40"/>
    <rect x="52" y="12" width="2" height="10" rx="1" fill="currentColor" opacity="0.30"/>
    <path
      d="M54 14 L54 32 C54 33 55 34 56 34 L84 34 C86 34 88 32 88 30 L88 22 C88 14 82 14 78 14 Z"
      fill="currentColor" opacity="0.50"
    />
    <rect x="55" y="15" width="13" height="9" rx="1.5" fill="white" opacity="0.45"/>
    <path d="M68 15 L78 15 C83 15 87 19 87 22 L87 24 L68 24 Z" fill="white" opacity="0.35"/>
    <circle cx="16" cy="34" r="5.5" fill="currentColor" opacity="0.85"/>
    <circle cx="16" cy="34" r="2.5" fill="white" opacity="0.55"/>
    <circle cx="38" cy="34" r="5.5" fill="currentColor" opacity="0.85"/>
    <circle cx="38" cy="34" r="2.5" fill="white" opacity="0.55"/>
    <circle cx="70" cy="34" r="5.5" fill="currentColor" opacity="0.85"/>
    <circle cx="70" cy="34" r="2.5" fill="white" opacity="0.55"/>
    <circle cx="81" cy="34" r="4" fill="currentColor" opacity="0.85"/>
    <circle cx="81" cy="34" r="2" fill="white" opacity="0.55"/>
  </svg>
);

const VEHICULOS: Vehiculo[] = [
  {
    id: "sedan",
    label: "Sedán",
    sublabel: "Viajes ejecutivos y cortos",
    capacity: "1 – 4 pasajeros",
    svg: <IconSedan />,
  },
  {
    id: "microbus",
    label: "Microbús",
    sublabel: "Grupos medianos",
    capacity: "5 – 20 pasajeros",
    svg: <IconMicrobus />,
  },
  {
    id: "camion",
    label: "Camión",
    sublabel: "Carga o grupos grandes",
    capacity: "20+ pasajeros",
    svg: <IconCamion />,
  },
];

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────
export default function TransportStep1Page() {
  const navigate = useNavigate();
  const [form, setForm] = useState<SolicitudStep1>(STEP1_DEFAULTS);
  const [touched, setTouched] = useState(false);

  // Restaurar desde localStorage
  useEffect(() => {
    const saved = getStoredSolicitud();
    if (Object.keys(saved).length) {
      setForm((prev) => ({ ...prev, ...saved }));
    }
  }, []);

  function set<K extends keyof SolicitudStep1>(key: K, value: SolicitudStep1[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const isValid =
    !!form.tipoVehiculo &&
    !!form.fecha &&
    !!form.hora &&
    form.encargado.trim().length > 0 &&
    !!form.pasajeros;

  function handleNext() {
    setTouched(true);
    if (!isValid) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    // Guardar paso 1 en localStorage
    saveStoredSolicitud({
      tipoVehiculo: form.tipoVehiculo,
      fecha: form.fecha,
      hora: form.hora,
      encargado: form.encargado.trim(),
      subencargado: form.subencargado.trim(),
      pasajeros: form.pasajeros,
    });
    navigate("/solicitudes/transporte/paso-2");
  }

  // Clases de input reutilizables
  const baseInput = [
    "w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-800",
    "transition duration-150 outline-none",
    "placeholder:text-slate-300",
    "focus:border-indigo-400 focus:ring-3 focus:ring-indigo-100",
  ].join(" ");

  function inputCls(valid: boolean) {
    return `${baseInput} ${touched && !valid ? "border-red-300 bg-red-50/40" : "border-slate-200"}`;
  }

  return (
    <div className="min-h-screen px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-2xl space-y-6">

        {/* ── Progreso ── */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              Paso 1 de 3
            </span>
            <span className="text-xs font-semibold text-indigo-600">Datos del viaje</span>
          </div>

          {/* Barra de progreso */}
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex flex-1 items-center gap-2">
                <div className={[
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all duration-300",
                  s === 1
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                    : "bg-slate-100 text-slate-400",
                ].join(" ")}>
                  {s === 1 ? (
                    <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="2.5">
                      <circle cx="8" cy="8" r="3" fill="white"/>
                    </svg>
                  ) : s}
                </div>
                {s < 3 && (
                  <div className="h-px flex-1 bg-slate-200">
                    <div className={`h-full bg-indigo-600 transition-all duration-500 ${s < 1 ? "w-full" : "w-0"}`} />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-between text-[11px] text-slate-400">
            <span className="font-semibold text-indigo-600">Datos del viaje</span>
            <span>Ruta</span>
            <span>Confirmación</span>
          </div>
        </div>

        {/* ── Encabezado ── */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Datos del viaje
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Complete la información para solicitar transporte institucional.
          </p>
        </div>

        {/* ── Alerta de error ── */}
        {touched && !isValid && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3.5">
            <svg className="mt-0.5 h-4.5 w-4.5 shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
            <p className="text-sm text-red-700">
              Complete todos los campos marcados con <span className="font-semibold">*</span> antes de continuar.
            </p>
          </div>
        )}

        {/* ═══════════════════════════════════════
            CARD PRINCIPAL
        ═══════════════════════════════════════ */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          {/* ── Bloque 1: Tipo de vehículo ── */}
          <div className="border-b border-slate-100 p-5 sm:p-7">
            <h2 className="mb-1 text-sm font-semibold text-slate-900">
              Tipo de vehículo <span className="text-red-500">*</span>
            </h2>
            <p className="mb-4 text-xs text-slate-400">
              Seleccione el vehículo adecuado para su viaje
            </p>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {VEHICULOS.map((v) => {
                const sel = form.tipoVehiculo === v.id;
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => set("tipoVehiculo", v.id)}
                    className={[
                      "group relative flex flex-row items-center gap-4 rounded-xl border-2 px-4 py-3.5 text-left",
                      "sm:flex-col sm:items-start sm:gap-3 sm:px-4 sm:py-4",
                      "transition-all duration-200 active:scale-[0.98]",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2",
                      sel
                        ? "border-indigo-500 bg-indigo-50/70 shadow-sm"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50",
                      touched && !form.tipoVehiculo ? "border-red-200 bg-red-50/30" : "",
                    ].join(" ")}
                    aria-pressed={sel}
                  >
                    {/* Radio visual */}
                    <span className={[
                      "absolute right-3 top-3 h-4.5 w-4.5 rounded-full border-2 transition-all duration-200",
                      sel ? "border-indigo-500 bg-indigo-500" : "border-slate-300 bg-white",
                    ].join(" ")}>
                      {sel && (
                        <span className="absolute inset-0 flex items-center justify-center">
                          <span className="h-2 w-2 rounded-full bg-white" />
                        </span>
                      )}
                    </span>

                    {/* Ilustración SVG */}
                    <div className={[
                      "shrink-0 rounded-lg transition-colors duration-200",
                      "h-12 w-20 sm:h-10 sm:w-full",
                      sel ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-500",
                    ].join(" ")}>
                      {v.svg}
                    </div>

                    {/* Texto */}
                    <div className="min-w-0">
                      <p className={`text-[14px] font-semibold leading-tight transition-colors ${sel ? "text-indigo-700" : "text-slate-800"}`}>
                        {v.label}
                      </p>
                      <p className={`mt-0.5 text-xs transition-colors ${sel ? "text-indigo-500" : "text-slate-400"}`}>
                        {v.sublabel}
                      </p>
                      <p className={[
                        "mt-1.5 inline-block rounded-full px-2 py-0.5 text-[11px] font-medium",
                        sel ? "bg-indigo-100 text-indigo-600" : "bg-slate-100 text-slate-500",
                      ].join(" ")}>
                        {v.capacity}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {touched && !form.tipoVehiculo && (
              <p className="mt-2.5 text-xs text-red-500">Seleccione un tipo de vehículo.</p>
            )}
          </div>

          {/* ── Bloque 2: Fecha y hora ── */}
          <div className="border-b border-slate-100 p-5 sm:p-7">
            <h2 className="mb-4 text-sm font-semibold text-slate-900">
              Fecha y hora de salida
            </h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-600">
                  Fecha <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={form.fecha}
                  onChange={(e) => set("fecha", e.target.value)}
                  className={inputCls(!!form.fecha)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-600">
                  Hora <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  value={form.hora}
                  onChange={(e) => set("hora", e.target.value)}
                  className={inputCls(!!form.hora)}
                />
              </div>
            </div>
          </div>

          {/* ── Bloque 3: Responsables y pasajeros ── */}
          <div className="p-5 sm:p-7">
            <h2 className="mb-4 text-sm font-semibold text-slate-900">
              Responsable del viaje
            </h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Encargado */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="block text-xs font-medium text-slate-600">
                  Nombre del encargado <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.encargado}
                  onChange={(e) => set("encargado", e.target.value)}
                  placeholder="Nombre completo"
                  className={inputCls(form.encargado.trim().length > 0)}
                />
              </div>

              {/* Subencargado */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="block text-xs font-medium text-slate-600">
                  Subencargado
                  <span className="ml-2 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500">
                    Opcional
                  </span>
                </label>
                <input
                  type="text"
                  value={form.subencargado}
                  onChange={(e) => set("subencargado", e.target.value)}
                  placeholder="Nombre completo"
                  className={`${baseInput} border-slate-200`}
                />
              </div>

              {/* Pasajeros */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-600">
                  Total de pasajeros <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min={1}
                  value={form.pasajeros}
                  onChange={(e) => set("pasajeros", e.target.value)}
                  placeholder="0"
                  className={inputCls(!!form.pasajeros)}
                />
                {form.tipoVehiculo && form.pasajeros && (
                  <p className="text-[11px] text-slate-400">
                    {form.tipoVehiculo === "sedan" && parseInt(form.pasajeros) > 4
                      ? "⚠ El sedán tiene capacidad máxima de 4 pasajeros."
                      : form.tipoVehiculo === "microbus" && parseInt(form.pasajeros) > 20
                      ? "⚠ El microbús tiene capacidad máxima de 20 pasajeros."
                      : null}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* ── Acciones ── */}
          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
            <button
              type="button"
              onClick={() => navigate("/nueva-solicitud")}
              className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 active:scale-[0.98]"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
              </svg>
              Cancelar
            </button>

            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm shadow-indigo-200 transition hover:bg-indigo-700 active:scale-[0.98] disabled:opacity-50"
            >
              Siguiente
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
              </svg>
            </button>
          </div>
        </div>

        <p className="pb-2 text-center text-[11px] text-slate-300">
          © 2026 Sistema de Transporte Institucional
        </p>
      </div>
    </div>
  );
}