// src/pages/solicitudes/combustible/NuevaSolicitudCombustible.tsx
import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:8000";

type Prioridad = "baja" | "media" | "alta";

interface Catalogo { id: string; label: string; }

interface CatalogosState {
  vehiculos: Catalogo[];
  motoristas: Catalogo[];
  loading: boolean;
  error: string | null;
}

interface FormData {
  vehiculo_id: string;
  motorista_id: string;
  destino_actividad: string;
  fecha_solicitud: string;
  fecha_inicio_periodo: string;
  fecha_fin_periodo: string;
  cantidad: string;
  prioridad: Prioridad | "";
  observaciones: string;
}

const INITIAL: FormData = {
  vehiculo_id: "",
  motorista_id: "",
  destino_actividad: "",
  fecha_solicitud: new Date().toISOString().split("T")[0],
  fecha_inicio_periodo: "",
  fecha_fin_periodo: "",
  cantidad: "",
  prioridad: "",
  observaciones: "",
};

const STEPS = [
  { id: 1, title: "Vehículo",  subtitle: "Selección del activo"    },
  { id: 2, title: "Detalles",  subtitle: "Información de la carga" },
  { id: 3, title: "Revisión",  subtitle: "Confirmar y enviar"      },
];

const prioridadConfig = {
  baja:  { label: "Baja",  dot: "bg-emerald-400", badge: "bg-emerald-50 text-emerald-700 ring-emerald-200/70" },
  media: { label: "Media", dot: "bg-amber-400",   badge: "bg-amber-50 text-amber-700 ring-amber-200/70"       },
  alta:  { label: "Alta",  dot: "bg-red-400",     badge: "bg-red-50 text-red-700 ring-red-200/70"             },
};

function authHeaders(): HeadersInit {
  const token = localStorage.getItem("auth_token");
  return { Accept: "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) };
}

// ─── Shared UI ────────────────────────────────────────────────────────────────

function StepperHeader({ current }: { current: number }) {
  return (
    <div className="relative mb-8 flex items-center justify-between">
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
            <div className={[
              "flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-black transition-all duration-300",
              done   ? "border-emerald-500 bg-emerald-500 text-white shadow-[0_0_0_4px_rgba(16,185,129,.15)]"
              : active ? "border-emerald-500 bg-white text-emerald-600 shadow-[0_0_0_4px_rgba(16,185,129,.15)] scale-110"
              :          "border-slate-200 bg-white text-slate-400",
            ].join(" ")}>
              {done ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : step.id}
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
      {children}{required && <span className="ml-1 text-emerald-500">*</span>}
    </label>
  );
}

function inputCls(hasError = false) {
  return [
    "w-full rounded-xl border px-4 py-3 text-sm font-semibold text-slate-800",
    "bg-white/80 backdrop-blur placeholder-slate-400 transition-all duration-200",
    "focus:outline-none focus:ring-2 focus:ring-emerald-400/60 focus:border-emerald-400",
    hasError ? "border-red-300 ring-2 ring-red-200/50" : "border-slate-200/80 hover:border-slate-300",
  ].join(" ");
}

function SelectInput({ value, onChange, options, placeholder, error, disabled }: {
  value: string; onChange: (v: string) => void; options: Catalogo[];
  placeholder?: string; error?: boolean; disabled?: boolean;
}) {
  return (
    <select
      value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled}
      className={inputCls(error) + " cursor-pointer appearance-none disabled:opacity-50 disabled:cursor-not-allowed"}
      style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' fill='none' viewBox='0 0 24 24'%3E%3Cpath stroke='%2394a3b8' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round' d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 14px center" }}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((o) => <option key={o.id} value={String(o.id)}>{o.label}</option>)}
    </select>
  );
}

function PrioridadButton({ value, current, onClick }: { value: Prioridad; current: Prioridad | ""; onClick: () => void }) {
  const cfg = prioridadConfig[value];
  const sel = current === value;
  return (
    <button type="button" onClick={onClick}
      className={[
        "flex items-center gap-2 rounded-xl border-2 px-4 py-2.5 text-sm font-black transition-all focus:outline-none",
        sel
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
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 py-3 last:border-0">
      <span className="text-xs font-black uppercase tracking-wide text-slate-500">{label}</span>
      <span className="max-w-[60%] text-right text-sm font-semibold text-slate-800">{value || "—"}</span>
    </div>
  );
}

// ─── Step 1 ───────────────────────────────────────────────────────────────────
function Step1({ data, update, errors, catalogos }: {
  data: FormData; update: (k: keyof FormData, v: string) => void;
  errors: Partial<Record<keyof FormData, string>>; catalogos: CatalogosState;
}) {
  return (
    <div className="space-y-5">
      <div>
        <FieldLabel required>Vehículo</FieldLabel>
        <SelectInput
          value={data.vehiculo_id} onChange={(v) => update("vehiculo_id", v)}
          options={catalogos.vehiculos}
          placeholder={catalogos.loading ? "Cargando vehículos..." : "Seleccione un vehículo..."}
          error={!!errors.vehiculo_id} disabled={catalogos.loading}
        />
        {errors.vehiculo_id && <p className="mt-1 text-xs font-semibold text-red-500">{errors.vehiculo_id}</p>}
      </div>

      <div>
        <FieldLabel>Motorista <span className="font-normal text-slate-400">(opcional)</span></FieldLabel>
        <SelectInput
          value={data.motorista_id} onChange={(v) => update("motorista_id", v)}
          options={catalogos.motoristas}
          placeholder={catalogos.loading ? "Cargando motoristas..." : "Sin motorista asignado"}
          disabled={catalogos.loading}
        />
      </div>

      <div className="flex items-start gap-3 rounded-xl border border-emerald-100 bg-emerald-50/60 p-4">
        <svg className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-xs font-semibold text-emerald-700">
          Solo se muestran los vehículos activos. Si el vehículo no aparece, contacte a administración.
        </p>
      </div>
    </div>
  );
}

// ─── Step 2 ───────────────────────────────────────────────────────────────────
function Step2({ data, update, errors }: {
  data: FormData; update: (k: keyof FormData, v: string) => void;
  errors: Partial<Record<keyof FormData, string>>;
}) {
  return (
    <div className="space-y-5">
      <div>
        <FieldLabel required>Destino / Actividad</FieldLabel>
        <input
          type="text" value={data.destino_actividad}
          onChange={(e) => update("destino_actividad", e.target.value)}
          placeholder="Ej: Visita a sede central, reparto zona norte..."
          className={inputCls(!!errors.destino_actividad)}
        />
        {errors.destino_actividad && <p className="mt-1 text-xs font-semibold text-red-500">{errors.destino_actividad}</p>}
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <FieldLabel required>Fecha de solicitud</FieldLabel>
          <input
            type="date" value={data.fecha_solicitud}
            onChange={(e) => update("fecha_solicitud", e.target.value)}
            className={inputCls(!!errors.fecha_solicitud)}
          />
          {errors.fecha_solicitud && <p className="mt-1 text-xs font-semibold text-red-500">{errors.fecha_solicitud}</p>}
        </div>
        <div>
          <FieldLabel required>Cantidad (galones)</FieldLabel>
          <input
            type="number" min="0" step="0.01" value={data.cantidad}
            onChange={(e) => update("cantidad", e.target.value)}
            placeholder="0.00" className={inputCls(!!errors.cantidad)}
          />
          {errors.cantidad && <p className="mt-1 text-xs font-semibold text-red-500">{errors.cantidad}</p>}
        </div>
      </div>

      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 p-4">
        <p className="mb-3 text-[11px] font-black uppercase tracking-wider text-slate-400">
          Período de uso <span className="font-normal normal-case tracking-normal text-slate-400">(opcional)</span>
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <FieldLabel>Fecha inicio</FieldLabel>
            <input
              type="date" value={data.fecha_inicio_periodo}
              onChange={(e) => update("fecha_inicio_periodo", e.target.value)}
              className={inputCls(!!errors.fecha_inicio_periodo)}
            />
            {errors.fecha_inicio_periodo && <p className="mt-1 text-xs font-semibold text-red-500">{errors.fecha_inicio_periodo}</p>}
          </div>
          <div>
            <FieldLabel>Fecha fin</FieldLabel>
            <input
              type="date" value={data.fecha_fin_periodo}
              onChange={(e) => update("fecha_fin_periodo", e.target.value)}
              min={data.fecha_inicio_periodo || undefined}
              className={inputCls(!!errors.fecha_fin_periodo)}
            />
            {errors.fecha_fin_periodo && <p className="mt-1 text-xs font-semibold text-red-500">{errors.fecha_fin_periodo}</p>}
          </div>
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
          value={data.observaciones} onChange={(e) => update("observaciones", e.target.value)}
          rows={3} maxLength={2000}
          placeholder="Información adicional relevante (opcional)..."
          className={inputCls() + " resize-none"}
        />
        <p className="mt-1 text-right text-[10px] font-semibold text-slate-400">{data.observaciones.length}/2000</p>
      </div>
    </div>
  );
}

// ─── Step 3 ───────────────────────────────────────────────────────────────────
function Step3({ data, catalogos }: { data: FormData; catalogos: CatalogosState }) {
  const vehiculo  = catalogos.vehiculos.find((v) => String(v.id) === data.vehiculo_id)?.label ?? "";
  const motorista = catalogos.motoristas.find((m) => String(m.id) === data.motorista_id)?.label ?? "Sin asignar";
  const prioCfg   = data.prioridad ? prioridadConfig[data.prioridad as Prioridad] : null;

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50/70 to-teal-50/50 p-5">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10">
            <svg className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-black text-slate-800">Resumen de solicitud</p>
            <p className="text-xs font-semibold text-slate-500">Verifique los datos antes de enviar</p>
          </div>
          {prioCfg && (
            <span className={["ml-auto inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-black ring-1", prioCfg.badge].join(" ")}>
              <span className={["h-2 w-2 rounded-full", prioCfg.dot].join(" ")} />
              {prioCfg.label}
            </span>
          )}
        </div>
        <div>
          <ReviewRow label="Vehículo"       value={vehiculo} />
          <ReviewRow label="Motorista"       value={motorista} />
          <ReviewRow label="Destino"         value={data.destino_actividad} />
          <ReviewRow label="Fecha solicitud" value={data.fecha_solicitud} />
          <ReviewRow label="Cantidad"        value={data.cantidad ? `${parseFloat(data.cantidad).toFixed(2)} gal` : ""} />
          {data.fecha_inicio_periodo && <ReviewRow label="Período inicio" value={data.fecha_inicio_periodo} />}
          {data.fecha_fin_periodo    && <ReviewRow label="Período fin"    value={data.fecha_fin_periodo} />}
          {data.observaciones        && <ReviewRow label="Observaciones"  value={data.observaciones} />}
        </div>
      </div>

      <div className="flex items-start gap-3 rounded-xl border border-amber-200/60 bg-amber-50/60 p-4">
        <svg className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        </svg>
        <p className="text-xs font-semibold text-amber-700">
          Al confirmar, la solicitud será enviada automáticamente para aprobación. No podrá editarse una vez enviada.
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
  }
  if (step === 2) {
    if (!data.destino_actividad.trim()) e.destino_actividad = "El destino o actividad es requerido.";
    if (!data.fecha_solicitud)          e.fecha_solicitud   = "La fecha de solicitud es requerida.";
    if (!data.cantidad || isNaN(Number(data.cantidad)) || Number(data.cantidad) <= 0)
      e.cantidad = "Ingrese una cantidad válida mayor a 0.";
    if (!data.prioridad) e.prioridad = "Seleccione una prioridad.";
    if (data.fecha_inicio_periodo && data.fecha_fin_periodo && data.fecha_fin_periodo < data.fecha_inicio_periodo)
      e.fecha_fin_periodo = "Debe ser posterior a la fecha de inicio.";
  }
  return e;
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function NuevaSolicitudCombustible() {
  const navigate = useNavigate();
  const [step, setStep]           = useState(1);
  const [data, setData]           = useState<FormData>(INITIAL);
  const [errors, setErrors]       = useState<Partial<Record<keyof FormData, string>>>({});
  const [loading, setLoading]     = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [apiError, setApiError]   = useState<string | null>(null);

  const [catalogos, setCatalogos] = useState<CatalogosState>({
    vehiculos: [], motoristas: [], loading: true, error: null,
  });

  const fetchCatalogos = useCallback(async () => {
    setCatalogos((p) => ({ ...p, loading: true, error: null }));
    try {
      const headers = authHeaders();
      const [resV, resM] = await Promise.all([
        fetch(`${API_BASE}/api/catalogos/vehiculos`,  { headers }),
        fetch(`${API_BASE}/api/catalogos/motoristas`, { headers }),
      ]);
      if (!resV.ok || !resM.ok) throw new Error("Error al obtener los catálogos del servidor.");
      const [jV, jM] = await Promise.all([resV.json(), resM.json()]);
      const vehiculos:  Catalogo[] = (Array.isArray(jV) ? jV : jV.data ?? []).map((v: any) => ({ id: String(v.id), label: v.label ?? v.nombre ?? String(v.id) }));
      const motoristas: Catalogo[] = (Array.isArray(jM) ? jM : jM.data ?? []).map((m: any) => ({ id: String(m.id), label: m.nombre ?? m.label ?? String(m.id) }));
      setCatalogos({ vehiculos, motoristas, loading: false, error: null });
    } catch (err: any) {
      setCatalogos((p) => ({ ...p, loading: false, error: err?.message ?? "No se pudieron cargar los catálogos." }));
    }
  }, []);

  useEffect(() => { fetchCatalogos(); }, [fetchCatalogos]);

  const update = useCallback((key: keyof FormData, value: string) => {
    setData((p) => ({ ...p, [key]: value }));
    setErrors((p) => { const n = { ...p }; delete n[key]; return n; });
  }, []);

  const handleNext = () => {
    const errs = validate(step, data);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setStep((s) => s + 1);
  };

  const handleBack = () => { setErrors({}); setStep((s) => s - 1); };

  const handleSubmit = async () => {
    setApiError(null);
    setLoading(true);
    try {
      const body: Record<string, any> = {
        vehiculo_id:       parseInt(data.vehiculo_id),
        destino_actividad: data.destino_actividad,
        fecha_solicitud:   data.fecha_solicitud,
        cantidad:          parseFloat(data.cantidad),
        prioridad:         data.prioridad,
      };
      if (data.motorista_id)         body.motorista_id         = parseInt(data.motorista_id);
      if (data.fecha_inicio_periodo) body.fecha_inicio_periodo = data.fecha_inicio_periodo;
      if (data.fecha_fin_periodo)    body.fecha_fin_periodo    = data.fecha_fin_periodo;
      if (data.observaciones.trim()) body.observaciones        = data.observaciones;

      const res = await fetch(`${API_BASE}/api/solicitudes-combustible`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify(body),
      });

      let json: any = null;
      try { json = await res.json(); } catch { /* vacío */ }

      if (!res.ok) {
        const detail = json?.errors
          ? Object.entries(json.errors as Record<string, string[]>).map(([k, v]) => `${k}: ${v[0]}`).join("\n")
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

  // ── Success ───────────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="pb-10">
        <div className="rounded-3xl border border-slate-200/60 bg-white">
          <div className="mx-auto max-w-lg px-6 py-16 text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 shadow-[0_14px_35px_-10px_rgba(16,185,129,.6)]">
              <svg className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-black text-slate-900 sm:text-3xl">¡Solicitud enviada!</h2>
            <p className="mt-3 text-sm font-semibold leading-relaxed text-slate-600">
              Tu solicitud de combustible fue enviada correctamente y está pendiente de aprobación.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                onClick={() => navigate("/mis-solicitudes")}
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

  // ── Error catálogos ───────────────────────────────────────────────────────
  if (!catalogos.loading && catalogos.error) {
    return (
      <div className="pb-10">
        <div className="rounded-3xl border border-slate-200/60 bg-white">
          <div className="mx-auto max-w-lg px-6 py-16 text-center">
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

  // ── Form ──────────────────────────────────────────────────────────────────
  return (
    <div className="pb-10">
      <div className="rounded-3xl border border-slate-200/60 bg-white">
        <div className="mx-auto max-w-2xl px-4 py-8 sm:px-8 sm:py-10">

          {/* Header */}
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-black text-emerald-700 ring-1 ring-emerald-200/60">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Combustible Vehicular
              </div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">Nueva Solicitud</h1>
              <p className="mt-1 text-sm font-semibold text-slate-500">Complete los datos para registrar la carga de combustible.</p>
            </div>
            <button
              onClick={() => navigate(-1)}
              className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-sm font-extrabold text-slate-700 ring-1 ring-slate-200/70 shadow-sm transition-all hover:bg-slate-50 hover:shadow-md active:scale-95"
            >
              <svg className="h-4 w-4 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="hidden sm:inline">Volver</span>
            </button>
          </div>

          {/* API error */}
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

          <StepperHeader current={step} />

          {/* Card */}
          <div className="overflow-hidden rounded-3xl border border-slate-200/60 bg-white p-6 shadow-[0_18px_40px_-28px_rgba(15,23,42,.12)] sm:p-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-xs font-black text-white shadow-[0_6px_16px_-6px_rgba(16,185,129,.6)]">
                {step}
              </div>
              <div>
                <p className="text-base font-black text-slate-900">{STEPS[step - 1].title}</p>
                <p className="text-xs font-semibold text-slate-500">{STEPS[step - 1].subtitle}</p>
              </div>
            </div>

            {step === 1 && <Step1 data={data} update={update} errors={errors} catalogos={catalogos} />}
            {step === 2 && <Step2 data={data} update={update} errors={errors} />}
            {step === 3 && <Step3 data={data} catalogos={catalogos} />}

            {/* Navigation */}
            <div className="mt-8 flex items-center justify-between gap-4 border-t border-slate-100 pt-6">
              {step > 1 ? (
                <button onClick={handleBack} disabled={loading}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white px-5 py-2.5 text-sm font-extrabold text-slate-700 shadow-sm transition-all hover:bg-slate-50 active:scale-95 disabled:opacity-50">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                  Anterior
                </button>
              ) : <span />}

              {step < 3 ? (
                <button onClick={handleNext} disabled={catalogos.loading}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-2.5 text-sm font-extrabold text-white shadow-[0_6px_18px_-8px_rgba(16,185,129,.7)] transition-all hover:opacity-90 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
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
                <button onClick={handleSubmit} disabled={loading}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-7 py-2.5 text-sm font-extrabold text-white shadow-[0_6px_18px_-8px_rgba(16,185,129,.7)] transition-all hover:opacity-90 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed">
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

          <p className="mt-4 text-center text-[11px] font-bold text-slate-400">
            Paso {step} de {STEPS.length}
          </p>
        </div>
      </div>
    </div>
  );
}