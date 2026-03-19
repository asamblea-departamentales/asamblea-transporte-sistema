import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ChevronLeft, ChevronRight, Check, CheckCircle2, 
  Send, RefreshCw, CarFront, Wrench, CircleDashed, 
  AlertCircle, FileText, Banknote, CalendarDays,
  AlertTriangle, XCircle
} from "lucide-react";

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
  { id: 1, title: "Vehículo", subtitle: "Selección del activo", icon: <CarFront className="h-5 w-5" /> },
  { id: 2, title: "Detalles", subtitle: "Información del mantenimiento", icon: <FileText className="h-5 w-5" /> },
  { id: 3, title: "Revisión", subtitle: "Confirmar y enviar", icon: <CheckCircle2 className="h-5 w-5" /> },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const prioridadConfig = {
  baja:  { label: "Baja",  color: "emerald" },
  media: { label: "Media", color: "amber" },
  alta:  { label: "Alta",  color: "red" },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function StepperHeader({ current }: { current: number }) {
  return (
    <div className="relative mb-8 sm:mb-10 px-2 sm:px-6">
      {/* connecting line */}
      <div className="absolute left-8 right-8 top-5 h-1 sm:h-1.5 rounded-full bg-slate-100 hidden sm:block" />
      <div
        className="absolute left-8 top-5 h-1 sm:h-1.5 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all duration-700 hidden sm:block shadow-[0_0_10px_rgba(52,211,153,0.5)]"
        style={{ width: `calc(${((current - 1) / (STEPS.length - 1)) * 100}% - 4rem)`, marginLeft: '2rem' }}
      />

      <div className="flex justify-between relative z-10">
        {STEPS.map((step) => {
          const done = step.id < current;
          const active = step.id === current;

          return (
            <div key={step.id} className="flex flex-col items-center gap-2 flex-1 sm:flex-none">
              <div
                className={`flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-2xl sm:rounded-[1.25rem] text-sm font-black transition-all duration-300 ${
                  done
                    ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 scale-95"
                    : active
                    ? "bg-white text-emerald-600 shadow-xl shadow-emerald-900/10 scale-110 ring-2 ring-emerald-500 ring-offset-2"
                    : "bg-white text-slate-300 shadow-sm border border-slate-100 scale-95"
                }`}
              >
                {done ? <Check className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={3} /> : step.icon}
              </div>
              <div className="text-center mt-1 sm:mt-2">
                <p className={`text-[10px] sm:text-xs font-black tracking-wide uppercase transition-colors ${active ? "text-emerald-700" : done ? "text-slate-600" : "text-slate-400"}`}>
                  {step.title}
                </p>
                <p className="hidden text-[11px] font-semibold text-slate-400 sm:block max-w-[120px] leading-tight mt-0.5">
                  {step.subtitle}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="mb-2 block text-xs font-black uppercase tracking-wider text-slate-500">
      {children}
      {required && <span className="ml-1 text-emerald-500">*</span>}
    </label>
  );
}

function inputCls(hasError = false) {
  return [
    "w-full rounded-2xl border px-4 py-3.5 text-sm font-bold text-slate-800 shadow-sm",
    "bg-white/60 backdrop-blur-md placeholder:font-medium placeholder-slate-400",
    "transition-all duration-200 ease-out",
    "focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/15 focus:border-emerald-400",
    hasError ? "border-red-300 ring-4 ring-red-500/10 focus:ring-red-500/20 focus:border-red-400" : "border-slate-200/80 hover:border-slate-300",
  ].join(" ");
}

function SelectInput({
  value, onChange, options, placeholder, error, disabled, icon
}: {
  value: string;
  onChange: (v: string) => void;
  options: Catalogo[];
  placeholder?: string;
  error?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <div className="relative">
      {icon && (
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
          {icon}
        </div>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`${inputCls(error)} cursor-pointer appearance-none ${icon ? 'pl-11' : ''} disabled:opacity-50 disabled:cursor-not-allowed`}
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' fill='none' viewBox='0 0 24 24'%3E%3Cpath stroke='%2394a3b8' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round' d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 14px center" }}
      >
        {placeholder && <option value="" disabled className="text-slate-400">{placeholder}</option>}
        {options.map((o) => <option key={o.id} value={String(o.id)} className="font-semibold text-slate-800">{o.label}</option>)}
      </select>
    </div>
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
      className={`group relative flex w-full flex-col items-start gap-4 rounded-3xl border-2 p-5 text-left transition-all duration-300 focus:outline-none ${
        selected
          ? "border-emerald-500 bg-emerald-50/80 shadow-lg shadow-emerald-500/10"
          : "border-slate-200/60 bg-white/40 hover:border-emerald-300 hover:bg-emerald-50/50 hover:shadow-md"
      }`}
    >
      <div className={`flex h-12 w-12 items-center justify-center rounded-2xl transition-all duration-300 ${
        selected ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/30 scale-110" : "bg-white text-slate-400 shadow-sm border border-slate-100 group-hover:bg-emerald-100 group-hover:text-emerald-600 group-hover:scale-105"
      }`}>
        {icon}
      </div>
      <div>
        <p className={`text-base font-black tracking-tight transition-colors ${selected ? "text-emerald-900" : "text-slate-800"}`}>{label}</p>
        <p className={`mt-1 text-xs font-semibold leading-relaxed transition-colors ${selected ? "text-emerald-700/80" : "text-slate-500"}`}>{description}</p>
      </div>
      
      {/* Selection Indicator */}
      <div className={`absolute right-5 top-5 flex h-6 w-6 items-center justify-center rounded-full transition-all duration-300 ${
        selected ? "bg-emerald-500 scale-100 opacity-100" : "bg-slate-200 scale-50 opacity-0"
      }`}>
        <Check className="h-3 w-3 text-white" strokeWidth={4} />
      </div>
    </button>
  );
}

function PrioridadButton({ value, current, onClick }: { value: Prioridad; current: Prioridad | ""; onClick: () => void }) {
  const cfg = prioridadConfig[value];
  const selected = current === value;
  
  const colorStyles = {
    emerald: selected ? "border-emerald-500 bg-emerald-50 text-emerald-700 ring-4 ring-emerald-500/10" : "",
    amber: selected ? "border-amber-500 bg-amber-50 text-amber-700 ring-4 ring-amber-500/10" : "",
    red: selected ? "border-red-500 bg-red-50 text-red-700 ring-4 ring-red-500/10" : "",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-2.5 rounded-2xl border-2 px-4 py-3.5 text-sm font-bold transition-all duration-200 focus:outline-none ${
        selected
          ? colorStyles[cfg.color as keyof typeof colorStyles]
          : "border-slate-200/70 bg-white/50 text-slate-500 hover:border-slate-300 hover:bg-white"
      }`}
    >
      <span className={`h-2.5 w-2.5 rounded-full transition-transform ${selected ? 'scale-125' : ''} bg-${cfg.color}-400 shadow-sm shadow-${cfg.color}-400/50`} />
      {cfg.label}
    </button>
  );
}

function ReviewRow({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3.5 border-b border-white/40 last:border-0 relative group">
      <span className="flex items-center gap-2 text-[11px] font-black text-slate-500 uppercase tracking-widest mt-0.5">
        {icon && <span className="text-slate-400">{icon}</span>}
        {label}
      </span>
      <span className="text-right text-sm font-bold text-slate-800 max-w-[60%] leading-snug">{value || "—"}</span>
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
    <div className="space-y-6 animate-fade-in">
      <div>
        <FieldLabel required>Vehículo a procesar</FieldLabel>
        <SelectInput
          value={data.vehiculo_id}
          onChange={(v) => update("vehiculo_id", v)}
          options={vehiculos}
          icon={<CarFront className="h-5 w-5" />}
          placeholder={loadingCatalogos ? "Cargando vehículos..." : "Seleccione un vehículo de la flota"}
          error={!!errors.vehiculo_id}
          disabled={loadingCatalogos}
        />
        {errors.vehiculo_id && <p className="mt-1.5 flex items-center gap-1 text-[11px] font-bold text-red-500 animate-slide-up"><AlertCircle className="h-3 w-3" /> {errors.vehiculo_id}</p>}
      </div>

      <div>
        <FieldLabel required>Manejo de Operación</FieldLabel>
        <SelectInput
          value={data.veh_tipo_mantenimiento_id}
          onChange={(v) => update("veh_tipo_mantenimiento_id", v)}
          options={tiposMantenimiento}
          icon={<Wrench className="h-5 w-5" />}
          placeholder={loadingCatalogos ? "Cargando tipos..." : "Determine la operación requerida"}
          error={!!errors.veh_tipo_mantenimiento_id}
          disabled={loadingCatalogos}
        />
        {errors.veh_tipo_mantenimiento_id && <p className="mt-1.5 flex items-center gap-1 text-[11px] font-bold text-red-500 animate-slide-up"><AlertCircle className="h-3 w-3" /> {errors.veh_tipo_mantenimiento_id}</p>}
      </div>

      <div>
        <FieldLabel required>Categoría de solicitud</FieldLabel>
        <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TipoCard
            value="taller"
            selected={data.tipo_solicitud === "taller"}
            onClick={() => update("tipo_solicitud", "taller")}
            label="Servicio de Taller"
            description="Mecánica general, reparaciones, servicio eléctrico y diagnóstico."
            icon={<Wrench className={data.tipo_solicitud === 'taller' ? "h-6 w-6" : "h-5 w-5"} strokeWidth={2.5} />}
          />
          <TipoCard
            value="llantas"
            selected={data.tipo_solicitud === "llantas"}
            onClick={() => update("tipo_solicitud", "llantas")}
            label="Gestión de Llantas"
            description="Cambios de neumático, rotación, balanceo y reparación de pinchazos."
            icon={<CircleDashed className={data.tipo_solicitud === 'llantas' ? "h-6 w-6" : "h-5 w-5"} strokeWidth={2.5} />}
          />
        </div>
        {errors.tipo_solicitud && <p className="mt-1.5 flex items-center gap-1 text-[11px] font-bold text-red-500 animate-slide-up"><AlertCircle className="h-3 w-3" /> {errors.tipo_solicitud}</p>}
      </div>
    </div>
  );
}

function Step2({ data, update, errors }: { data: FormData; update: (k: keyof FormData, v: string) => void; errors: Partial<Record<keyof FormData, string>> }) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <FieldLabel required>Detalle técnico del mantenimiento</FieldLabel>
        <div className="relative">
          <div className="absolute top-4 left-4 text-slate-400"><FileText className="h-5 w-5" /></div>
          <textarea
            value={data.detalle}
            onChange={(e) => update("detalle", e.target.value)}
            rows={4}
            placeholder="Describa ampliamente el trabajo que necesita el vehículo..."
            className={inputCls(!!errors.detalle) + " resize-none pl-12 pt-4 leading-relaxed"}
          />
        </div>
        {errors.detalle && <p className="mt-1.5 flex items-center gap-1 text-[11px] font-bold text-red-500"><AlertCircle className="h-3 w-3" /> {errors.detalle}</p>}
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <FieldLabel required>Fecha para ejecución</FieldLabel>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <CalendarDays className="h-5 w-5" />
            </div>
            <input
              type="date"
              value={data.fecha_sugerida}
              onChange={(e) => update("fecha_sugerida", e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              className={inputCls(!!errors.fecha_sugerida) + " pl-12"}
            />
          </div>
          {errors.fecha_sugerida && <p className="mt-1.5 flex items-center gap-1 text-[11px] font-bold text-red-500"><AlertCircle className="h-3 w-3" /> {errors.fecha_sugerida}</p>}
        </div>

        <div>
          <FieldLabel required>Presupuesto / Costo estimado</FieldLabel>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <Banknote className="h-5 w-5" />
            </div>
            <input
              type="number"
              min="0"
              step="0.01"
              value={data.costo_estimado}
              onChange={(e) => update("costo_estimado", e.target.value)}
              placeholder="0.00"
              className={inputCls(!!errors.costo_estimado) + " pl-12 font-mono"}
            />
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
              <span className="text-xs font-black text-slate-400">USD</span>
            </div>
          </div>
          {errors.costo_estimado && <p className="mt-1.5 flex items-center gap-1 text-[11px] font-bold text-red-500"><AlertCircle className="h-3 w-3" /> {errors.costo_estimado}</p>}
        </div>
      </div>

      <div>
        <FieldLabel required>Nivel de Prioridad</FieldLabel>
        <div className="flex gap-3">
          {(["baja", "media", "alta"] as Prioridad[]).map((p) => (
            <PrioridadButton key={p} value={p} current={data.prioridad} onClick={() => update("prioridad", p)} />
          ))}
        </div>
        {errors.prioridad && <p className="mt-1.5 flex items-center gap-1 text-[11px] font-bold text-red-500"><AlertCircle className="h-3 w-3" /> {errors.prioridad}</p>}
      </div>

      <div>
        <FieldLabel>Anotaciones Adicionales (Opcional)</FieldLabel>
        <textarea
          value={data.observaciones}
          onChange={(e) => update("observaciones", e.target.value)}
          rows={2}
          maxLength={2000}
          placeholder="Algo más que el encargado del taller deba saber..."
          className={inputCls() + " resize-none"}
        />
        <p className="mt-1.5 text-right text-[10px] font-bold text-slate-400">{data.observaciones.length}/2000</p>
      </div>
    </div>
  );
}

function Step3({ data, vehiculos, tiposMantenimiento }: {
  data: FormData;
  vehiculos: Catalogo[];
  tiposMantenimiento: Catalogo[];
}) {
  const vehiculo = vehiculos.find((v) => String(v.id) === data.vehiculo_id)?.label ?? "";
  const tipoMant = tiposMantenimiento.find((t) => String(t.id) === data.veh_tipo_mantenimiento_id)?.label ?? "";
  const pCfg = data.prioridad ? prioridadConfig[data.prioridad as Prioridad] : null;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="rounded-3xl border-2 border-emerald-100/50 bg-gradient-to-br from-emerald-50/90 via-white/50 to-teal-50/80 p-6 backdrop-blur-md shadow-lg shadow-emerald-100/20">
        <div className="flex items-start gap-4 mb-6 pb-5 border-b border-emerald-100">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm shadow-emerald-200 ring-1 ring-emerald-100">
            <CheckCircle2 className="h-6 w-6 text-emerald-500" />
          </div>
          <div className="flex-1 mt-1">
            <h3 className="text-sm font-black text-emerald-950 uppercase tracking-widest">Resumen Final</h3>
            <p className="text-xs font-semibold text-emerald-700/80 mt-0.5">Revise cuidadosamente los datos cargados.</p>
          </div>
          {pCfg && (
            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider bg-${pCfg.color}-100 text-${pCfg.color}-700 ring-1 ring-${pCfg.color}-200/50 shadow-sm shadow-${pCfg.color}-100`}>
              <span className={`h-1.5 w-1.5 rounded-full bg-${pCfg.color}-500`} />
              {pCfg.label}
            </span>
          )}
        </div>

        <div className="space-y-1">
          <ReviewRow icon={<CarFront className="h-3.5 w-3.5" />} label="Vehículo" value={vehiculo} />
          <ReviewRow icon={<Wrench className="h-3.5 w-3.5" />} label="Tipo de Asistencia" value={tipoMant} />
          <ReviewRow icon={<CircleDashed className="h-3.5 w-3.5" />} label="Clasificación" value={data.tipo_solicitud === "taller" ? "Mecánica / Taller" : data.tipo_solicitud === "llantas" ? "Neumáticos / Llantas" : ""} />
          <ReviewRow icon={<CalendarDays className="h-3.5 w-3.5" />} label="Fecha Programada" value={data.fecha_sugerida.split("-").reverse().join("/")} />
          <ReviewRow icon={<Banknote className="h-3.5 w-3.5" />} label="Presupuesto" value={data.costo_estimado ? `$${parseFloat(data.costo_estimado).toFixed(2)}` : ""} />
          <div className="py-4 border-b border-white/40 last:border-0 relative group">
            <span className="flex items-center gap-2 text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">
               <FileText className="h-3.5 w-3.5 text-slate-400" /> Descripción Técnica
            </span>
            <p className="text-sm font-semibold text-slate-800 bg-white/60 p-4 rounded-2xl shadow-sm border border-slate-100/50 leading-relaxed whitespace-pre-wrap">{data.detalle}</p>
          </div>
          {data.observaciones && (
            <div className="py-4 relative group">
              <span className="flex items-center gap-2 text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">
                 Observaciones Adicionales
              </span>
              <p className="text-xs font-medium text-slate-600 italic bg-slate-50/50 p-3 rounded-xl">{data.observaciones}</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-start gap-3.5 rounded-2xl border-2 border-amber-200/60 bg-gradient-to-r from-amber-50 to-orange-50/30 p-5 shadow-sm">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600 mt-0.5 shadow-sm shadow-amber-200/50">
          <AlertTriangle className="h-4 w-4" strokeWidth={2.5} />
        </div>
        <div>
          <p className="text-xs font-black text-amber-900 uppercase tracking-widest mb-1">Acción Irreversible</p>
          <p className="text-[13px] font-medium leading-relaxed text-amber-700/90">
            Al procesar esta solicitud, será dirigida automáticamente a la bandeja de jefatura para su validación administrativa. <strong className="font-extrabold text-amber-900">No podrá aplicar modificaciones posteriores.</strong>
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Validation ───────────────────────────────────────────────────────────────
function validate(step: number, data: FormData): Partial<Record<keyof FormData, string>> {
  const e: Partial<Record<keyof FormData, string>> = {};

  if (step === 1) {
    if (!data.vehiculo_id) e.vehiculo_id = "Requerido para iniciar.";
    if (!data.veh_tipo_mantenimiento_id) e.veh_tipo_mantenimiento_id = "Seleccione la operación a reportar.";
    if (!data.tipo_solicitud) e.tipo_solicitud = "Es necesario indicar la categoría técnica.";
  }

  if (step === 2) {
    if (!data.detalle.trim()) e.detalle = "Brinde una explicación detallada del servicio.";
    if (!data.fecha_sugerida) e.fecha_sugerida = "Defina la fecha proyectada.";
    if (!data.prioridad) e.prioridad = "Clasifique la urgencia del mantenimiento.";
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

      if (!resVehs.ok || !resTipos.ok) throw new Error("Avería al syncronizar inventario desde el cluster central.");

      const [jsonVehs, jsonTipos] = await Promise.all([resVehs.json(), resTipos.json()]);

      const vehiculos: Catalogo[] = (Array.isArray(jsonVehs) ? jsonVehs : jsonVehs.data ?? []).map(
        (v: { id: number | string; label?: string; nombre?: string; placa?: string }) => ({ 
          id: String(v.id), 
          label: v.placa ? `${v.placa} - ${v.label ?? v.nombre ?? ''}` : (v.label ?? v.nombre ?? String(v.id))
        })
      );

      const tiposMantenimiento: Catalogo[] = (Array.isArray(jsonTipos) ? jsonTipos : jsonTipos.data ?? []).map(
        (t: { id: number | string; nombre?: string; label?: string }) => ({ id: String(t.id), label: t.nombre ?? t.label ?? String(t.id) })
      );

      setCatalogos({ vehiculos, tiposMantenimiento, loading: false, error: null });
    } catch (err: unknown) {
      setCatalogos((prev) => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : "Desconexión detectada al recabar paramétros técnicos.",
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
    window.scrollTo({ top: 0, behavior: "smooth" });
    setStep((s) => s + 1);
  };

  const handleBack = () => {
    setErrors({});
    window.scrollTo({ top: 0, behavior: "smooth" });
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
      try { json = await res.json(); } catch { /* vacio */ }

      if (!res.ok) {
        const detail = json?.errors
          ? Object.entries(json.errors as Record<string, string[]>).map(([k, v]) => `${k}: ${v[0]}`).join("\n")
          : json?.message || `Fallo crítico ${res.status}`;
        throw new Error(detail);
      }

      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e: unknown) {
      setApiError(e instanceof Error ? e.message : "Error del clúster de enlace.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setLoading(false);
    }
  };

  // ── Success Screen ─────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-[80vh] w-full pb-20 pt-10 sm:py-16 px-4">
        <div className="relative overflow-hidden rounded-[2rem] border border-white/40 bg-white/70 backdrop-blur-xl shadow-2xl shadow-emerald-500/10 mx-auto max-w-lg">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-32 left-1/2 h-[30rem] w-[30rem] -translate-x-1/2 rounded-full bg-gradient-to-b from-emerald-300/40 to-transparent blur-3xl opacity-70" />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.7)2px,transparent_2px),linear-gradient(90deg,rgba(255,255,255,0.7)2px,transparent_2px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_0%,#000_70%,transparent_100%)] opacity-30" />
          </div>
          <div className="relative p-10 sm:p-14 text-center">
            <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-[2rem] bg-gradient-to-br from-emerald-400 to-teal-600 shadow-xl shadow-emerald-500/40 ring-4 ring-white">
              <Check className="h-12 w-12 text-white" strokeWidth={3.5} />
            </div>
            <h2 className="text-3xl font-black tracking-tight text-slate-900 mb-3">¡Despliegue Exitoso!</h2>
            <p className="text-[15px] font-semibold leading-relaxed text-slate-600 mb-10 max-w-[18rem] mx-auto">
              La solicitud técnica fue encolada correctamente a la bandeja del administrador asignado.
            </p>
            <div className="flex flex-col gap-3">
              <button onClick={() => navigate("/mis-solicitudes")} className="w-full flex items-center justify-center gap-2 rounded-2xl bg-slate-900 py-4 text-[13px] font-black text-white shadow-lg shadow-slate-900/20 transition-all hover:bg-black hover:scale-[1.02] active:scale-95">
                Regresar al Monitor Central
              </button>
              <button focus-ring="false" onClick={() => { setData(INITIAL); setStep(1); setSubmitted(false); setApiError(null); }} className="w-full flex items-center justify-center gap-2 rounded-2xl bg-white border-2 border-slate-100 py-4 text-[13px] font-black text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:border-slate-200 active:scale-95">
                <RefreshCw className="h-4 w-4" /> Emitir Nuevo Reporte
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Fallback Muerte de Catálogo ──────────────────────────────────────────
  if (!catalogos.loading && catalogos.error) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="relative mx-auto max-w-md w-full overflow-hidden rounded-[2rem] border border-red-100 bg-white/80 p-10 text-center shadow-2xl shadow-red-500/10 backdrop-blur-xl">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-[1.5rem] bg-red-50 text-red-500 shadow-inner ring-1 ring-red-100">
            <AlertCircle className="h-10 w-10" strokeWidth={2.5} />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">Error de Sincronía</h2>
          <p className="text-sm font-semibold text-slate-500 mb-8">{catalogos.error}</p>
          <button onClick={fetchCatalogos} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 py-4 text-sm font-black text-white shadow-lg shadow-emerald-500/30 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/40 active:translate-y-0">
            <RefreshCw className="h-4 w-4" /> Forzar Reconexión
          </button>
        </div>
      </div>
    );
  }

  // ── Main Form ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen w-full pb-32 sm:pb-20 relative font-sans text-slate-900 bg-slate-50/30">
      {/* Premium Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] h-[40rem] w-[40rem] rounded-full bg-emerald-200/30 blur-[100px]" />
        <div className="absolute bottom-[-20%] right-[-10%] h-[40rem] w-[40rem] rounded-full bg-teal-200/20 blur-[120px]" />
        <div className="absolute top-[20%] right-[10%] h-[30rem] w-[30rem] rounded-full bg-blue-100/30 blur-[100px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.035] mix-blend-overlay" />
      </div>

      <div className="relative mx-auto max-w-3xl px-4 py-8 sm:px-8 sm:py-12">
        {/* Header */}
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-200/60 bg-emerald-100/50 px-3.5 py-1.5 backdrop-blur-md shadow-sm">
              <div className="flex items-center justify-center bg-emerald-500 text-white rounded-full p-1 shadow-sm">
                <Wrench className="h-2.5 w-2.5" strokeWidth={3} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-800">
                Mantenimiento Automotriz
              </span>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl drop-shadow-sm">
              Generar Orden Técnica
            </h1>
            <p className="mt-2 text-sm font-semibold text-slate-500/90 leading-relaxed max-w-md">
              Complete el reporte con los requisitos mecánicos o de desgaste para avalar el ingreso a revisión.
            </p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="group hidden sm:inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl border-2 border-slate-200 bg-white/70 px-5 py-2.5 text-xs font-black uppercase tracking-widest text-slate-600 shadow-sm backdrop-blur-md transition-all hover:bg-white hover:text-slate-900 hover:shadow-md hover:border-slate-300 active:scale-95"
          >
            <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" strokeWidth={3} />
            Abandonar
          </button>
        </div>

        {/* Global Alert */}
        {apiError && (
          <div className="mb-8 flex items-start gap-3.5 rounded-3xl border border-red-200 bg-white/80 p-5 shadow-lg shadow-red-500/10 backdrop-blur animate-shake">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-red-100 text-red-500">
              <AlertTriangle className="h-5 w-5" strokeWidth={2.5} />
            </div>
            <div className="flex-1 mt-0.5">
              <p className="text-[13px] font-black tracking-wide text-red-900 uppercase">Señal Interrumpida</p>
              <p className="mt-1 text-sm font-semibold text-red-700/90 leading-snug">{apiError}</p>
            </div>
            <button onClick={() => setApiError(null)} className="rounded-xl p-2 text-red-400 hover:bg-red-50 hover:text-red-700 transition-colors">
              <XCircle className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Form Panel Glassmorphism */}
        <div className="overflow-hidden rounded-[2rem] border border-white/50 bg-white/60 shadow-2xl shadow-slate-200/40 backdrop-blur-2xl">
          
          <div className="bg-white/40 pt-8 pb-4 border-b border-white">
            <StepperHeader current={step} />
          </div>

          <div className="p-6 sm:p-10">
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
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden sm:flex items-center justify-between border-t border-slate-100 bg-white/50 px-10 py-6">
             <button
                onClick={step === 1 ? () => navigate(-1) : handleBack}
                disabled={loading}
                className={`inline-flex items-center gap-2 rounded-2xl border-2 px-6 py-3 text-sm font-bold shadow-sm transition-all focus:outline-none focus:ring-4 ${
                   step === 1 
                   ? "border-red-100 text-red-600 bg-white hover:bg-red-50 hover:border-red-200 focus:ring-red-100 active:scale-95"
                   : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300 focus:ring-slate-100 active:scale-95 disabled:opacity-50"
                }`}
              >
                <ChevronLeft className="h-5 w-5" />
                {step === 1 ? "Cancelar" : "Anterior"}
              </button>

              <button
                onClick={step < 3 ? handleNext : handleSubmit}
                disabled={catalogos.loading || loading}
                className="inline-flex items-center gap-2.5 rounded-2xl bg-slate-900 px-8 py-3 text-sm font-bold text-white shadow-lg shadow-slate-900/20 transition-all hover:bg-black hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                {loading || catalogos.loading ? (
                  <RefreshCw className="h-5 w-5 animate-spin" />
                ) : step < 3 ? (
                  <>Continuar Secuencia <ChevronRight className="h-5 w-5" /></>
                ) : (
                  <><Send className="h-4 w-4" /> Certificar Envio</>
                )}
              </button>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Thumb-Zone Navigation */}
      <div className="sm:hidden fixed bottom-6 left-4 right-4 z-50 animate-slide-up">
        <div className="flex items-center justify-between gap-3 rounded-3xl border border-white/40 bg-white/80 p-3 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] backdrop-blur-xl">
           <button
             onClick={step === 1 ? () => navigate(-1) : handleBack}
             disabled={loading}
             className="flex h-[3.5rem] flex-1 items-center justify-center gap-2 rounded-2xl border-2 border-slate-200 bg-white text-xs font-black uppercase tracking-wider text-slate-700 transition active:scale-95"
           >
             <ChevronLeft className="h-5 w-5" />
             {step === 1 ? "Cancelar" : "Atrás"}
           </button>
           
           <button
             onClick={step < 3 ? handleNext : handleSubmit}
             disabled={catalogos.loading || loading}
             className="flex h-[3.5rem] flex-1 items-center justify-center gap-2 rounded-2xl bg-slate-900 text-xs font-black uppercase tracking-wider text-white shadow-md active:scale-95 disabled:opacity-50"
           >
             {loading || catalogos.loading ? (
                <RefreshCw className="h-5 w-5 animate-spin" />
              ) : step < 3 ? (
                <>Siguiente <ChevronRight className="h-5 w-5" /></>
              ) : (
                <><Send className="h-4 w-4" /> Enviar</>
              )}
           </button>
        </div>
      </div>
    </div>
  );
}