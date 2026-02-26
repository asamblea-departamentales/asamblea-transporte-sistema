// src/pages/solicitudes/mantenimiento/NuevaSolicitudMantenimiento.tsx
import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:8000";

// ─── Types ────────────────────────────────────────────────────────────────────
type Prioridad = "baja" | "media" | "alta";
type TipoSolicitud = "taller" | "llantas";

interface Catalogo {
  id: string;
  label: string;
}

interface CatalogosState {
  vehiculos: Catalogo[];
  tiposMantenimiento: Catalogo[];
  loading: boolean;
  error: string | null;
}

interface FormData {
  vehiculo_id: string;
  veh_tipo_mantenimiento_id: string;
  tipo_solicitud: TipoSolicitud | "";
  detalle: string;
  fecha_sugerida: string;
  prioridad: Prioridad | "";
  costo_estimado: string;
  observaciones: string;
}

const INITIAL: FormData = {
  vehiculo_id: "",
  veh_tipo_mantenimiento_id: "",
  tipo_solicitud: "",
  detalle: "",
  fecha_sugerida: "",
  prioridad: "",
  costo_estimado: "",
  observaciones: "",
};

// ─── Step definitions ─────────────────────────────────────────────────────────
const STEPS = [
  { id: 1, title: "Vehículo", subtitle: "Selección del activo" },
  { id: 2, title: "Detalles", subtitle: "Información del mantenimiento" },
  { id: 3, title: "Revisión", subtitle: "Confirmar y enviar" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const prioridadConfig = {
  baja:  { label: "Baja",  dot: "bg-emerald-400", badge: "bg-emerald-50 text-emerald-700 ring-emerald-200/70" },
  media: { label: "Media", dot: "bg-amber-400",   badge: "bg-amber-50 text-amber-700 ring-amber-200/70" },
  alta:  { label: "Alta",  dot: "bg-red-400",      badge: "bg-red-50 text-red-700 ring-red-200/70" },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function StepperHeader({ current }: { current: number }) {
  return (
    <div className="relative mb-8 flex items-center justify-between">
      {/* connecting line */}
      <div className="absolute left-0 right-0 top-5 h-px bg-slate-200/80" />
      <div
        className="absolute left-0 top-5 h-px bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-700"
        style={{ width: `${((current - 1) / (STEPS.length - 1)) * 100}%` }}
      />

      {STEPS.map((step) => {
        const done   = step.id < current;
        const active = step.id === current;

        return (
          <div key={step.id} className="relative z-10 flex flex-col items-center gap-1.5">
            <div
              className={[
                "flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-black transition-all duration-300",
                done
                  ? "border-emerald-500 bg-emerald-500 text-white shadow-[0_0_0_4px_rgba(16,185,129,.15)]"
                  : active
                  ? "border-emerald-500 bg-white text-emerald-600 shadow-[0_0_0_4px_rgba(16,185,129,.15)] scale-110"
                  : "border-slate-200 bg-white text-slate-400",
              ].join(" ")}
            >
              {done ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                step.id
              )}
            </div>
            <div className="text-center">
              <p className={["text-[11px] font-black tracking-tight", active ? "text-emerald-700" : done ? "text-slate-700" : "text-slate-400"].join(" ")}>
                {step.title}
              </p>
              <p className="hidden text-[10px] font-semibold text-slate-400 sm:block">{step.subtitle}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="mb-1.5 block text-xs font-black tracking-wide text-slate-700">
      {children}
      {required && <span className="ml-1 text-emerald-500">*</span>}
    </label>
  );
}

function inputCls(hasError = false) {
  return [
    "w-full rounded-xl border px-4 py-3 text-sm font-semibold text-slate-800",
    "bg-white/80 backdrop-blur placeholder-slate-400",
    "transition-all duration-200",
    "focus:outline-none focus:ring-2 focus:ring-emerald-400/60 focus:border-emerald-400",
    hasError ? "border-red-300 ring-2 ring-red-200/50" : "border-slate-200/80 hover:border-slate-300",
  ].join(" ");
}

function SelectInput({
  value, onChange, options, placeholder, error, disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  options: Catalogo[];
  placeholder?: string;
  error?: boolean;
  disabled?: boolean;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={inputCls(error) + " cursor-pointer appearance-none disabled:opacity-50 disabled:cursor-not-allowed"}
      style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' fill='none' viewBox='0 0 24 24'%3E%3Cpath stroke='%2394a3b8' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round' d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 14px center" }}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((o) => <option key={o.id} value={String(o.id)}>{o.label}</option>)}
    </select>
  );
}

function TipoCard({
  selected, onClick, label, description, icon,
}: {
  value: TipoSolicitud;
  selected: boolean;
  onClick: () => void;
  label: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "group relative flex w-full flex-col items-start gap-3 rounded-2xl border-2 p-5 text-left",
        "transition-all duration-200 focus:outline-none",
        selected
          ? "border-emerald-500 bg-emerald-50/70 shadow-[0_0_0_3px_rgba(16,185,129,.12)]"
          : "border-slate-200/80 bg-white/70 hover:border-emerald-300 hover:bg-emerald-50/30",
      ].join(" ")}
    >
      <div className={[
        "flex h-10 w-10 items-center justify-center rounded-xl transition-all",
        selected ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-500 group-hover:bg-emerald-100 group-hover:text-emerald-600",
      ].join(" ")}>
        {icon}
      </div>
      <div>
        <p className={["text-sm font-black", selected ? "text-emerald-800" : "text-slate-800"].join(" ")}>{label}</p>
        <p className="mt-0.5 text-xs font-semibold text-slate-500">{description}</p>
      </div>
      {selected && (
        <div className="absolute right-4 top-4 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500">
          <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
    </button>
  );
}

function PrioridadButton({ value, current, onClick }: { value: Prioridad; current: Prioridad | ""; onClick: () => void }) {
  const cfg = prioridadConfig[value];
  const selected = current === value;
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "flex items-center gap-2 rounded-xl border-2 px-4 py-2.5 text-sm font-black transition-all",
        "focus:outline-none",
        selected
          ? value === "baja"  ? "border-emerald-500 bg-emerald-50 text-emerald-700"
          : value === "media" ? "border-amber-500 bg-amber-50 text-amber-700"
          :                     "border-red-500 bg-red-50 text-red-700"
          : "border-slate-200/80 bg-white/70 text-slate-500 hover:border-slate-300",
      ].join(" ")}
    >
      <span className={["h-2.5 w-2.5 rounded-full", cfg.dot].join(" ")} />
      {cfg.label}
    </button>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-slate-100 last:border-0">
      <span className="text-xs font-black text-slate-500 uppercase tracking-wide">{label}</span>
      <span className="text-right text-sm font-semibold text-slate-800 max-w-[60%]">{value || "—"}</span>
    </div>
  );
}

// ─── Steps ────────────────────────────────────────────────────────────────────

function Step1({
  data, update, errors, vehiculos, tiposMantenimiento, loadingCatalogos,
}: {
  data: FormData;
  update: (k: keyof FormData, v: string) => void;
  errors: Partial<Record<keyof FormData, string>>;
  vehiculos: Catalogo[];
  tiposMantenimiento: Catalogo[];
  loadingCatalogos: boolean;
}) {
  return (
    <div className="space-y-5">
      <div>
        <FieldLabel required>Vehículo</FieldLabel>
        <SelectInput
          value={data.vehiculo_id}
          onChange={(v) => update("vehiculo_id", v)}
          options={vehiculos}
          placeholder={loadingCatalogos ? "Cargando vehículos..." : "Seleccione un vehículo..."}
          error={!!errors.vehiculo_id}
          disabled={loadingCatalogos}
        />
        {errors.vehiculo_id && <p className="mt-1 text-xs font-semibold text-red-500">{errors.vehiculo_id}</p>}
      </div>

      <div>
        <FieldLabel required>Tipo de Mantenimiento</FieldLabel>
        <SelectInput
          value={data.veh_tipo_mantenimiento_id}
          onChange={(v) => update("veh_tipo_mantenimiento_id", v)}
          options={tiposMantenimiento}
          placeholder={loadingCatalogos ? "Cargando tipos..." : "Seleccione el tipo..."}
          error={!!errors.veh_tipo_mantenimiento_id}
          disabled={loadingCatalogos}
        />
        {errors.veh_tipo_mantenimiento_id && <p className="mt-1 text-xs font-semibold text-red-500">{errors.veh_tipo_mantenimiento_id}</p>}
      </div>

      <div>
        <FieldLabel required>Categoría de solicitud</FieldLabel>
        <div className="mt-1 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <TipoCard
            value="taller"
            selected={data.tipo_solicitud === "taller"}
            onClick={() => update("tipo_solicitud", "taller")}
            label="Taller"
            description="Reparación mecánica y servicio general"
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" strokeLinejoin="round" />
              </svg>
            }
          />
          <TipoCard
            value="llantas"
            selected={data.tipo_solicitud === "llantas"}
            onClick={() => update("tipo_solicitud", "llantas")}
            label="Llantas"
            description="Cambio, rotación y alineación"
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="9" />
                <circle cx="12" cy="12" r="3" />
                <path d="M12 3v3M12 18v3M3 12h3M18 12h3" strokeLinecap="round" />
              </svg>
            }
          />
        </div>
        {errors.tipo_solicitud && <p className="mt-1 text-xs font-semibold text-red-500">{errors.tipo_solicitud}</p>}
      </div>
    </div>
  );
}

function Step2({ data, update, errors }: { data: FormData; update: (k: keyof FormData, v: string) => void; errors: Partial<Record<keyof FormData, string>> }) {
  return (
    <div className="space-y-5">
      <div>
        <FieldLabel required>Detalle del mantenimiento</FieldLabel>
        <textarea
          value={data.detalle}
          onChange={(e) => update("detalle", e.target.value)}
          rows={3}
          placeholder="Describa detalladamente el trabajo a realizar..."
          className={inputCls(!!errors.detalle) + " resize-none"}
        />
        {errors.detalle && <p className="mt-1 text-xs font-semibold text-red-500">{errors.detalle}</p>}
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <FieldLabel required>Fecha sugerida</FieldLabel>
          <input
            type="date"
            value={data.fecha_sugerida}
            onChange={(e) => update("fecha_sugerida", e.target.value)}
            min={new Date().toISOString().split("T")[0]}
            className={inputCls(!!errors.fecha_sugerida)}
          />
          {errors.fecha_sugerida && <p className="mt-1 text-xs font-semibold text-red-500">{errors.fecha_sugerida}</p>}
        </div>

        <div>
          <FieldLabel required>Costo estimado ($)</FieldLabel>
          <input
            type="number"
            min="0"
            step="0.01"
            value={data.costo_estimado}
            onChange={(e) => update("costo_estimado", e.target.value)}
            placeholder="0.00"
            className={inputCls(!!errors.costo_estimado)}
          />
          {errors.costo_estimado && <p className="mt-1 text-xs font-semibold text-red-500">{errors.costo_estimado}</p>}
        </div>
      </div>

      <div>
        <FieldLabel required>Prioridad</FieldLabel>
        <div className="flex flex-wrap gap-3">
          {(["baja", "media", "alta"] as Prioridad[]).map((p) => (
            <PrioridadButton key={p} value={p} current={data.prioridad} onClick={() => update("prioridad", p)} />
          ))}
        </div>
        {errors.prioridad && <p className="mt-1 text-xs font-semibold text-red-500">{errors.prioridad}</p>}
      </div>

      <div>
        <FieldLabel>Observaciones adicionales</FieldLabel>
        <textarea
          value={data.observaciones}
          onChange={(e) => update("observaciones", e.target.value)}
          rows={2}
          maxLength={2000}
          placeholder="Información adicional relevante (opcional)..."
          className={inputCls() + " resize-none"}
        />
        <p className="mt-1 text-right text-[10px] font-semibold text-slate-400">{data.observaciones.length}/2000</p>
      </div>
    </div>
  );
}

function Step3({ data, vehiculos, tiposMantenimiento }: {
  data: FormData;
  vehiculos: Catalogo[];
  tiposMantenimiento: Catalogo[];
}) {
  // Resuelve labels desde los catálogos reales
  const vehiculo = vehiculos.find((v) => String(v.id) === data.vehiculo_id)?.label ?? "";
  const tipoMant = tiposMantenimiento.find((t) => String(t.id) === data.veh_tipo_mantenimiento_id)?.label ?? "";
  const prioridadCfg = data.prioridad ? prioridadConfig[data.prioridad as Prioridad] : null;

  return (
    <div className="space-y-5">
      {/* Summary card */}
      <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50/70 to-teal-50/50 p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10">
            <svg className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-black text-slate-800">Resumen de solicitud</p>
            <p className="text-xs font-semibold text-slate-500">Verifique los datos antes de enviar</p>
          </div>
          {prioridadCfg && (
            <span className={["ml-auto inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-black ring-1", prioridadCfg.badge].join(" ")}>
              <span className={["h-2 w-2 rounded-full", prioridadCfg.dot].join(" ")} />
              {prioridadCfg.label}
            </span>
          )}
        </div>

        <div>
          <ReviewRow label="Vehículo" value={vehiculo} />
          <ReviewRow label="Tipo Mantenimiento" value={tipoMant} />
          <ReviewRow label="Categoría" value={data.tipo_solicitud === "taller" ? "Taller" : data.tipo_solicitud === "llantas" ? "Llantas" : ""} />
          <ReviewRow label="Fecha sugerida" value={data.fecha_sugerida} />
          <ReviewRow label="Costo estimado" value={data.costo_estimado ? `$${parseFloat(data.costo_estimado).toFixed(2)}` : ""} />
          <ReviewRow label="Detalle" value={data.detalle} />
          {data.observaciones && <ReviewRow label="Observaciones" value={data.observaciones} />}
        </div>
      </div>

      {/* Warning */}
      <div className="flex items-start gap-3 rounded-xl border border-amber-200/60 bg-amber-50/60 p-4">
        <svg className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        </svg>
        <p className="text-xs font-semibold text-amber-700">
          Al confirmar, la solicitud será enviada automáticamente para aprobación del jefe correspondiente. No podrá editarse una vez enviada.
        </p>
      </div>
    </div>
  );
}

// ─── Validation ───────────────────────────────────────────────────────────────
function validate(step: number, data: FormData): Partial<Record<keyof FormData, string>> {
  const e: Partial<Record<keyof FormData, string>> = {};

  if (step === 1) {
    if (!data.vehiculo_id) e.vehiculo_id = "Seleccione un vehículo.";
    if (!data.veh_tipo_mantenimiento_id) e.veh_tipo_mantenimiento_id = "Seleccione el tipo de mantenimiento.";
    if (!data.tipo_solicitud) e.tipo_solicitud = "Seleccione una categoría.";
  }

  if (step === 2) {
    if (!data.detalle.trim()) e.detalle = "El detalle es requerido.";
    if (!data.fecha_sugerida) e.fecha_sugerida = "Ingrese una fecha sugerida.";
    if (!data.prioridad) e.prioridad = "Seleccione una prioridad.";
  }

  return e;
}

// ─── API helper ───────────────────────────────────────────────────────────────
function authHeaders(): HeadersInit {
  const token = localStorage.getItem("auth_token");
  return {
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function NuevaSolicitudMantenimiento() {
  const navigate  = useNavigate();
  const [step, setStep]       = useState(1);
  const [data, setData]       = useState<FormData>(INITIAL);
  const [errors, setErrors]   = useState<Partial<Record<keyof FormData, string>>>({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [apiError, setApiError]   = useState<string | null>(null);

  // ── Catálogos ──────────────────────────────────────────────────────────────
  const [catalogos, setCatalogos] = useState<CatalogosState>({
    vehiculos: [],
    tiposMantenimiento: [],
    loading: true,
    error: null,
  });

  const fetchCatalogos = useCallback(async () => {
    setCatalogos((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const headers = authHeaders();
      const [resVehs, resTipos] = await Promise.all([
        fetch(`${API_BASE}/api/catalogos/vehiculos`,           { headers }),
        fetch(`${API_BASE}/api/catalogos/tipos-mantenimiento`, { headers }),
      ]);

      if (!resVehs.ok || !resTipos.ok) {
        throw new Error("Error al obtener los catálogos del servidor.");
      }

      const [jsonVehs, jsonTipos] = await Promise.all([resVehs.json(), resTipos.json()]);

      // El endpoint de vehiculos devuelve array con { id, label, placa, marca, modelo, tipo }
      // El endpoint de tipos devuelve array con { id, nombre }
      const vehiculos: Catalogo[] = (Array.isArray(jsonVehs) ? jsonVehs : jsonVehs.data ?? []).map(
        (v: any) => ({ id: String(v.id), label: v.label ?? v.nombre ?? String(v.id) })
      );

      const tiposMantenimiento: Catalogo[] = (Array.isArray(jsonTipos) ? jsonTipos : jsonTipos.data ?? []).map(
        (t: any) => ({ id: String(t.id), label: t.nombre ?? t.label ?? String(t.id) })
      );

      setCatalogos({ vehiculos, tiposMantenimiento, loading: false, error: null });
    } catch (err: any) {
      setCatalogos((prev) => ({
        ...prev,
        loading: false,
        error: err?.message ?? "No se pudieron cargar los catálogos.",
      }));
    }
  }, []);

  useEffect(() => {
    fetchCatalogos();
  }, [fetchCatalogos]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const update = useCallback((key: keyof FormData, value: string) => {
    setData((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => { const n = { ...prev }; delete n[key]; return n; });
  }, []);

  const handleNext = () => {
    const errs = validate(step, data);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setStep((s) => s + 1);
  };

  const handleBack = () => {
    setErrors({});
    setStep((s) => s - 1);
  };

  const handleSubmit = async () => {
    setApiError(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/solicitudes-mantenimiento`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(),
        },
        body: JSON.stringify({
          vehiculo_id:               parseInt(data.vehiculo_id),
          veh_tipo_mantenimiento_id: parseInt(data.veh_tipo_mantenimiento_id),
          tipo_solicitud:            data.tipo_solicitud,
          detalle:                   data.detalle,
          fecha_sugerida:            data.fecha_sugerida,
          prioridad:                 data.prioridad,
          costo_estimado:            data.costo_estimado ? parseFloat(data.costo_estimado) : null,
          observaciones:             data.observaciones || null,
        }),
      });

      let json: any = null;
      try { json = await res.json(); } catch { /* respuesta vacía */ }

      if (!res.ok) {
        const detail = json?.errors
          ? Object.entries(json.errors as Record<string, string[]>)
              .map(([k, v]) => `${k}: ${v[0]}`)
              .join("\n")
          : json?.message || `Error ${res.status}`;
        throw new Error(detail);
      }

      setSubmitted(true);
    } catch (e: any) {
      setApiError(e?.message || "No se pudo conectar con el servidor.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setLoading(false);
    }
  };

  // ── Success Screen ─────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="pb-10">
        <div className="relative overflow-hidden rounded-3xl border border-slate-200/60 bg-white">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-28 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-emerald-200/50 blur-3xl" />
            <div className="absolute -bottom-32 -left-24 h-96 w-96 rounded-full bg-teal-200/40 blur-3xl" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(148,163,184,.22)_1px,transparent_0)] [background-size:18px_18px] opacity-60" />
          </div>
          <div className="relative mx-auto max-w-lg px-6 py-16 text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 shadow-[0_14px_35px_-10px_rgba(16,185,129,.6)]">
              <svg className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-black text-slate-900 sm:text-3xl">¡Solicitud enviada!</h2>
            <p className="mt-3 text-sm font-semibold leading-relaxed text-slate-600">
              Tu solicitud de mantenimiento fue enviada correctamente y está pendiente de aprobación.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                onClick={() => navigate("/solicitudes/mantenimiento")}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-6 py-3 text-sm font-extrabold text-white shadow-sm transition-all hover:opacity-90 active:scale-95"
              >
                Ver mis solicitudes
              </button>
              <button
                onClick={() => { setData(INITIAL); setStep(1); setSubmitted(false); setApiError(null); }}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200/80 bg-white px-6 py-3 text-sm font-extrabold text-slate-700 shadow-sm transition-all hover:bg-slate-50 active:scale-95"
              >
                Nueva solicitud
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Error de catálogos (pantalla bloqueante) ───────────────────────────────
  if (!catalogos.loading && catalogos.error) {
    return (
      <div className="pb-10">
        <div className="relative overflow-hidden rounded-3xl border border-slate-200/60 bg-white">
          <div className="relative mx-auto max-w-lg px-6 py-16 text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 ring-1 ring-red-200">
              <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
            </div>
            <h2 className="text-lg font-black text-slate-900">Error al cargar datos</h2>
            <p className="mt-2 text-sm font-semibold text-slate-500">{catalogos.error}</p>
            <button
              onClick={fetchCatalogos}
              className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-3 text-sm font-extrabold text-white shadow-sm transition-all hover:opacity-90 active:scale-95"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Main Form ──────────────────────────────────────────────────────────────
  return (
    <div className="pb-10">
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/60 bg-white">
        {/* bg mesh */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-28 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-emerald-200/50 blur-3xl" />
          <div className="absolute -bottom-32 -left-24 h-96 w-96 rounded-full bg-emerald-200/40 blur-3xl" />
          <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-teal-200/35 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(148,163,184,.22)_1px,transparent_0)] [background-size:18px_18px] opacity-60" />
        </div>

        <div className="relative mx-auto max-w-2xl px-4 py-8 sm:px-8 sm:py-10">
          {/* Header */}
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-black text-emerald-700 ring-1 ring-emerald-200/60">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Mantenimiento Vehicular
              </div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                Nueva Solicitud
              </h1>
              <p className="mt-1 text-sm font-semibold text-slate-500">
                Complete los datos para registrar el mantenimiento.
              </p>
            </div>
            <button
              onClick={() => navigate(-1)}
              className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-white/80 px-4 py-2.5 text-sm font-extrabold text-slate-700 ring-1 ring-slate-200/70 shadow-sm backdrop-blur transition-all hover:bg-white hover:shadow-md active:scale-95"
            >
              <svg className="h-4 w-4 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="hidden sm:inline">Volver</span>
            </button>
          </div>

          {/* Error de API al enviar */}
          {apiError && (
            <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200/80 bg-red-50 px-5 py-4">
              <svg className="mt-0.5 h-5 w-5 shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
              <div className="flex-1">
                <p className="text-sm font-black text-red-800">No se pudo enviar la solicitud</p>
                <p className="mt-1 whitespace-pre-line text-xs font-semibold text-red-700">{apiError}</p>
              </div>
              <button onClick={() => setApiError(null)} className="text-red-400 hover:text-red-600">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          {/* Stepper */}
          <StepperHeader current={step} />

          {/* Card */}
          <div className="overflow-hidden rounded-3xl border border-slate-200/60 bg-white/75 p-6 shadow-[0_18px_40px_-28px_rgba(15,23,42,.35)] backdrop-blur sm:p-8">
            {/* Step title */}
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-xs font-black text-white shadow-[0_6px_16px_-6px_rgba(16,185,129,.6)]">
                {step}
              </div>
              <div>
                <p className="text-base font-black text-slate-900">{STEPS[step - 1].title}</p>
                <p className="text-xs font-semibold text-slate-500">{STEPS[step - 1].subtitle}</p>
              </div>
            </div>

            {/* Step content */}
            {step === 1 && (
              <Step1
                data={data}
                update={update}
                errors={errors}
                vehiculos={catalogos.vehiculos}
                tiposMantenimiento={catalogos.tiposMantenimiento}
                loadingCatalogos={catalogos.loading}
              />
            )}
            {step === 2 && <Step2 data={data} update={update} errors={errors} />}
            {step === 3 && (
              <Step3
                data={data}
                vehiculos={catalogos.vehiculos}
                tiposMantenimiento={catalogos.tiposMantenimiento}
              />
            )}

            {/* Navigation */}
            <div className="mt-8 flex items-center justify-between gap-4 border-t border-slate-100 pt-6">
              {step > 1 ? (
                <button
                  onClick={handleBack}
                  disabled={loading}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white px-5 py-2.5 text-sm font-extrabold text-slate-700 shadow-sm transition-all hover:bg-slate-50 active:scale-95 disabled:opacity-50"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                  Anterior
                </button>
              ) : (
                <span />
              )}

              {step < 3 ? (
                <button
                  onClick={handleNext}
                  disabled={catalogos.loading}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-2.5 text-sm font-extrabold text-white shadow-[0_6px_18px_-8px_rgba(16,185,129,.7)] transition-all hover:opacity-90 hover:shadow-[0_8px_22px_-8px_rgba(16,185,129,.75)] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {catalogos.loading && step === 1 ? (
                    <>
                      <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Cargando...
                    </>
                  ) : (
                    <>
                      Siguiente
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-7 py-2.5 text-sm font-extrabold text-white shadow-[0_6px_18px_-8px_rgba(16,185,129,.7)] transition-all hover:opacity-90 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Enviando...
                    </>
                  ) : (
                    <>
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      Confirmar y enviar
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Progress indicator */}
          <p className="mt-4 text-center text-[11px] font-bold text-slate-400">
            Paso {step} de {STEPS.length}
          </p>
        </div>
      </div>
    </div>
  );
}