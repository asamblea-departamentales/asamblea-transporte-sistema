import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TransportWizard from "../../../components/ui/TransportWizard";
import { Label, SelectInput, Spinner, SectionTitle, FieldError, inputCls } from "../Combustible/components/FormUI";
import { api } from "../../../lib/api";
import { VehicleDropdown, type Catalogo } from "../../../components/ui/VehicleDropdown";
import { formatCurrency, getTodayLocal } from "../../../lib/format";

// ─── Types ────────────────────────────────────────────────────────────────────
type TipoSolicitud = "taller" | "llantas";

interface CatalogosState {
  vehiculos: Catalogo[];
  tiposMantenimiento: Catalogo[];
  loading: boolean;
  error: string | null;
  warning: string | null;
}

interface FormData {
  vehiculo_id: string;
  veh_tipo_mantenimiento_id: string;
  tipo_solicitud: TipoSolicitud | "";
  detalle: string;
  fecha_sugerida: string;
  costo_estimado: string;
  observaciones: string;
}

const INITIAL: FormData = {
  vehiculo_id: "",
  veh_tipo_mantenimiento_id: "",
  tipo_solicitud: "",
  detalle: "",
  fecha_sugerida: "",
  costo_estimado: "",
  observaciones: "",
};

// ─── Step definitions ─────────────────────────────────────────────────────────
const STEPS = [
  { id: 1, title: "Vehículo", subtitle: "Selección del activo" },
  { id: 2, title: "Detalles", subtitle: "Información" },
  { id: 3, title: "Revisión", subtitle: "Confirmar envío" },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

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
      className={`relative flex w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 p-4 text-center transition focus:outline-none ${
        selected
          ? "border-blue-500 bg-blue-50/50 shadow-sm"
          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
      }`}
    >
      <div className={`flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${
        selected ? "bg-blue-600 text-white shadow-md shadow-blue-500/20" : "bg-slate-50 text-slate-400 border border-slate-100"
      }`}>
        {icon}
      </div>
      <div>
        <p className={`text-sm font-bold transition-colors ${selected ? "text-blue-900" : "text-slate-700"}`}>{label}</p>
        <p className="mt-0.5 text-[11px] font-medium leading-relaxed text-slate-500">{description}</p>
      </div>
      
      {/* Selection Indicator */}
      {selected && (
        <div className="absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-white">
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
             <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
    </button>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-slate-100 last:border-0 relative">
      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
        {label}
      </span>
      <span className="text-right text-[13px] font-semibold text-slate-800 max-w-[60%] leading-snug">{value || "—"}</span>
    </div>
  );
}

// ─── Success Screen (Modal Premium — Alineado con Transporte) ─────────────────

function MantenimientoSuccessScreen({ onReset }: { onReset: () => void }) {
  const navigate = useNavigate();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 30);
    return () => clearTimeout(t);
  }, []);

  function go(path: string) {
    setShow(false);
    setTimeout(() => navigate(path), 280);
  }

  function handleReset() {
    setShow(false);
    setTimeout(onReset, 280);
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center px-4 transition-all duration-300 ${
        show ? "bg-black/40 backdrop-blur-sm" : "bg-black/0 backdrop-blur-none"
      }`}
    >
      <div
        className={`w-full max-w-sm rounded-2xl border border-slate-200 bg-white shadow-xl transition-all duration-300 ${
          show ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        }`}
      >
        {/* Header */}
        <div className="border-b border-slate-100 px-6 py-5">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 transition-all delay-150 duration-500 ${
                show ? "scale-100 opacity-100" : "scale-75 opacity-0"
              }`}
            >
              <svg
                className="h-5 w-5 text-slate-800"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                  style={{
                    strokeDasharray: "28",
                    strokeDashoffset: show ? "0" : "28",
                    transition: "stroke-dashoffset 500ms 300ms ease",
                  }}
                />
              </svg>
            </div>
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400">
                Solicitud registrada
              </p>
              <p className="text-base font-black text-slate-900">
                Enviada correctamente
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div
          className={`px-6 py-5 transition-all delay-200 duration-300 ${
            show ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
          }`}
        >
          <p className="text-xs leading-relaxed text-slate-500">
            Tu solicitud de mantenimiento fue enviada correctamente. Puedes
            seguir el estado desde tu historial de solicitudes.
          </p>
        </div>

        {/* Footer */}
        <div
          className={`space-y-2 border-t border-slate-100 px-6 py-5 transition-all delay-300 duration-300 ${
            show ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
          }`}
        >
          <button
            onClick={() => go("/dashboard")}
            className="w-full rounded-xl border border-slate-900 bg-slate-900 px-4 py-2.5 text-sm font-bold text-white transition-all hover:bg-slate-800 active:scale-[0.98]"
          >
            Ir al Dashboard
          </button>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => go("/mis-solicitudes")}
              className="rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-semibold text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50 active:scale-[0.98]"
            >
              Mis solicitudes
            </button>
            <button
              onClick={handleReset}
              className="rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-semibold text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50 active:scale-[0.98]"
            >
              Nueva solicitud
            </button>
          </div>
        </div>
      </div>
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
    <div className="space-y-6">
      <div>
        <SectionTitle 
          label="Vehículo" 
          icon={<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/></svg>}
        />
        <Label required>Vehículo a procesar</Label>
        <VehicleDropdown
          value={data.vehiculo_id}
          onChange={(v) => update("vehiculo_id", v)}
          options={vehiculos}
          placeholder={loadingCatalogos ? "Cargando vehículos..." : "Seleccione un vehículo..."}
          error={!!errors.vehiculo_id}
          disabled={loadingCatalogos}
        />
        <FieldError msg={errors.vehiculo_id} />
      </div>

      <div className="border-t border-slate-100 pt-5">
        <SectionTitle 
          label="Gestión de Mantenimiento" 
          icon={<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>}
        />
        <Label required>Operación requerida</Label>
        <SelectInput
          value={data.veh_tipo_mantenimiento_id}
          onChange={(v) => update("veh_tipo_mantenimiento_id", v)}
          options={tiposMantenimiento}
          placeholder={loadingCatalogos ? "Cargando tipos..." : "Determine la operación..."}
          error={!!errors.veh_tipo_mantenimiento_id}
          disabled={loadingCatalogos}
        />
        <FieldError msg={errors.veh_tipo_mantenimiento_id} />
      </div>

      <div className="pt-2">
        <Label required>Categoría de solicitud</Label>
        <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <TipoCard
            value="taller"
            selected={data.tipo_solicitud === "taller"}
            onClick={() => update("tipo_solicitud", "taller")}
            label="Servicio de Taller"
            description="Mecánica general, sistema eléctrico o revisión."
            icon={<svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>}
          />
          <TipoCard
            value="llantas"
            selected={data.tipo_solicitud === "llantas"}
            onClick={() => update("tipo_solicitud", "llantas")}
            label="Gestión de Llantas"
            description="Alineación, balanceo, pinchazos y cambios."
            icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><path strokeLinecap="round" strokeLinejoin="round" d="M4.93 4.93l4.24 4.24m5.66 5.66l4.24 4.24m-14.14 0l4.24-4.24m5.66-5.66l4.24-4.24"/></svg>}
          />
        </div>
        <FieldError msg={errors.tipo_solicitud} />
      </div>
    </div>
  );
}

function Step2({ data, update, errors }: { data: FormData; update: (k: keyof FormData, v: string) => void; errors: Partial<Record<keyof FormData, string>> }) {
  return (
    <div className="space-y-5">
      <div>
        <Label required>Detalle técnico del mantenimiento</Label>
        <textarea
          value={data.detalle}
          onChange={(e) => update("detalle", e.target.value)}
          rows={4}
          placeholder="Describa ampliamente el trabajo que necesita el vehículo..."
          className={inputCls(errors.detalle) + " resize-none"}
        />
        <FieldError msg={errors.detalle} />
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <Label required>Fecha para ejecución</Label>
          <input
            type="date"
            value={data.fecha_sugerida}
            onChange={(e) => update("fecha_sugerida", e.target.value)}
            min={getTodayLocal()}
            className={inputCls(errors.fecha_sugerida)}
          />
          <FieldError msg={errors.fecha_sugerida} />
        </div>

        <div>
           <Label>Costo estimado <span className="font-normal text-slate-400 font-sans normal-case tracking-normal">(opcional)</span></Label>
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center text-sm font-black text-slate-400">$</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={data.costo_estimado}
                onChange={(e) => update("costo_estimado", e.target.value)}
                placeholder="0.00"
                className={inputCls(errors.costo_estimado) + " pl-7 font-mono"}
              />
          </div>
          <FieldError msg={errors.costo_estimado} />
        </div>
      </div>

      <div>
        <Label>Observaciones <span className="font-normal text-slate-400 font-sans normal-case tracking-normal">(opcional)</span></Label>
        <textarea
          value={data.observaciones}
          onChange={(e) => update("observaciones", e.target.value)}
          rows={2}
          maxLength={2000}
          placeholder="Algo más a tener en cuenta..."
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
  const vehiculo = vehiculos.find((v) => String(v.id) === data.vehiculo_id)?.label ?? "";
  const tipoMant = tiposMantenimiento.find((t) => String(t.id) === data.veh_tipo_mantenimiento_id)?.label ?? "";

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Resumen Listado</h3>
            <p className="text-[11px] font-medium text-slate-500">Revise la información cargada</p>
          </div>
        </div>

        <div className="space-y-1">
          <ReviewRow label="Vehículo" value={vehiculo} />
          <ReviewRow label="Operación" value={tipoMant} />
          <ReviewRow label="Categoría" value={data.tipo_solicitud === "taller" ? "Mecánica / Taller" : "Llantas / Neumáticos"} />
          <ReviewRow label="Ejecución" value={data.fecha_sugerida.split("-").reverse().join("/")} />
          <ReviewRow label="Costo Mínimo" value={formatCurrency(data.costo_estimado)} />
          
          <div className="pt-3 flex flex-col gap-1.5">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Descripción Técnica</span>
            <p className="text-[13px] text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed whitespace-pre-wrap">{data.detalle}</p>
          </div>
          
          {data.observaciones && (
            <div className="pt-3 flex flex-col gap-1.5">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Observaciones</span>
              <p className="text-[12px] italic text-slate-600 bg-amber-50/50 p-3 rounded-xl border border-amber-100/50">{data.observaciones}</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Disclaimer Jefatura */}
      <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3.5">
          <svg className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
             <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-[12px] font-medium leading-relaxed text-amber-800">
             Al continuar, esta solicitud se enviará a jefatura para validación. No podrá realizar ediciones posteriormente.
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
    if (!data.fecha_sugerida) e.fecha_sugerida = "Defina la fecha requerida.";
  }

  return e;
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
    warning: null,
  });

  const fetchCatalogos = useCallback(async (signal?: AbortSignal) => {
    setCatalogos((prev) => ({ ...prev, loading: true, error: null, warning: null }));

    const [vehiculosResult, tiposResult] = await Promise.allSettled([
      api.get("/api/catalogos/vehiculos", { signal }),
      api.get("/api/catalogos/tipos-mantenimiento", { signal }),
    ]);
    if (signal?.aborted) return;

    const getItems = <T,>(response: unknown): T[] => {
      if (Array.isArray(response)) return response as T[];
      if (response && typeof response === "object" && "data" in response) {
        const nested = (response as { data?: unknown }).data;
        return Array.isArray(nested) ? nested as T[] : [];
      }
      return [];
    };

    const vehiculos = vehiculosResult.status === "fulfilled"
      ? getItems<{ id: number | string; label?: string; nombre?: string; placa?: string; fotografia_url?: string; imagen?: string }>(vehiculosResult.value.data).map((v) => ({
          id: String(v.id),
          label: v.placa ? `${v.placa} - ${v.label ?? v.nombre ?? ""}` : (v.label ?? v.nombre ?? String(v.id)),
          image: v.fotografia_url || v.imagen || null,
          placa: v.placa || null,
        }))
      : undefined;
    const tiposMantenimiento = tiposResult.status === "fulfilled"
      ? getItems<{ id: number | string; nombre?: string; label?: string }>(tiposResult.value.data)
          .map((tipo) => ({ id: String(tipo.id), label: tipo.nombre ?? tipo.label ?? String(tipo.id) }))
      : undefined;
    const failed = [vehiculosResult, tiposResult].filter((result) => result.status === "rejected").length;

    setCatalogos((previous) => ({
      vehiculos: vehiculos ?? previous.vehiculos,
      tiposMantenimiento: tiposMantenimiento ?? previous.tiposMantenimiento,
      loading: false,
      error: failed === 2 ? "No se pudieron cargar los catálogos técnicos del módulo." : null,
      warning: failed === 1 ? "Un catálogo técnico no está disponible. Puede reintentar sin perder el formulario." : null,
    }));
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void fetchCatalogos(controller.signal);
    return () => controller.abort();
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
      await api.post("/api/solicitudes-mantenimiento", {
        vehiculo_id:               parseInt(data.vehiculo_id),
        veh_tipo_mantenimiento_id: parseInt(data.veh_tipo_mantenimiento_id),
        tipo_solicitud:            data.tipo_solicitud,
        detalle:                   data.detalle,
        fecha_sugerida:            data.fecha_sugerida,
        costo_estimado:            data.costo_estimado ? parseFloat(data.costo_estimado) : null,
        observaciones:             data.observaciones || null,
      });

      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e: unknown) {
      const axiosErr = e as { response?: { data?: { errors?: Record<string, string[]>; message?: string } }; message?: string };
      const errors = axiosErr.response?.data?.errors;
      const detail = errors
        ? Object.entries(errors).map(([k, v]) => `${k}: ${v[0]}`).join("\n")
        : axiosErr.response?.data?.message || (e instanceof Error ? e.message : "No se pudo conectar con el servidor.");
      setApiError(detail);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setLoading(false);
    }
  };

  // ── Success Screen ─────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <MantenimientoSuccessScreen
        onReset={() => { setData(INITIAL); setStep(1); setSubmitted(false); setApiError(null); }}
      />
    );
  }

  // ── Fallback Muerte de Catálogo ──────────────────────────────────────────
  if (!catalogos.loading && catalogos.error) {
    return (
      <div className="flex h-[70vh] items-center justify-center px-4">
        <div className="text-center w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <svg className="mx-auto h-12 w-12 text-slate-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          <p className="text-sm font-bold text-slate-800 mb-6">{catalogos.error}</p>
          <button onClick={() => void fetchCatalogos()} className="rounded-xl bg-slate-900 px-6 py-2.5 text-xs font-bold text-white hover:bg-slate-800">
            Reintentar Conexión
          </button>
        </div>
      </div>
    );
  }

  // ── Main Form ──────────────────────────────────────────────────────────────
  return (
    <div className="mx-auto max-w-2xl space-y-6 pb-8 pt-4 sm:pt-10">
      
      {/* ── Wizard stepper ─────────────────────────────────────────────── */}
      <TransportWizard steps={STEPS.map((s, i) => ({ id: i + 1, label: s.title }))} currentStep={step} />

      {/* ── Page heading ───────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <span className="inline-block h-[2px] w-5 rounded-full bg-blue-700" />
          <span className="text-[10px] font-black uppercase tracking-[.18em] text-blue-700">
            Mantenimiento 
          </span>
        </div>
        <h1 className="text-[28px] font-bold tracking-tight text-slate-900 leading-none">
          Nueva Solicitud
        </h1>
        <p className="mt-1.5 text-[13px] text-slate-500 leading-relaxed">
          Complete el reporte con los requisitos mecánicos o de desgaste del vehículo.
        </p>
      </div>

      {catalogos.warning && (
        <div role="status" className="flex items-center justify-between gap-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-semibold text-amber-900">
          <span>{catalogos.warning}</span>
          <button type="button" onClick={() => void fetchCatalogos()} className="shrink-0 rounded-lg px-3 py-1.5 font-bold hover:bg-amber-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600">
            Reintentar
          </button>
        </div>
      )}
      {/* Global Alert */}
      {apiError && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4">
             <svg className="mt-0.5 h-5 w-5 shrink-0 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /></svg>
             <div className="flex-1">
                <p className="text-sm font-black text-red-800">No se pudo enviar la solicitud</p>
                <p className="mt-1 whitespace-pre-line text-xs font-semibold text-red-600">{apiError}</p>
             </div>
             <button onClick={() => setApiError(null)} className="text-red-300 hover:text-red-500">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
             </button>
          </div>
      )}

      {/* Main card */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        
        <div className="p-5 sm:p-6">
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
        
        {/* Navegación inferior compartida idéntica a combustible */}
        <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:items-center sm:justify-between px-5 py-4 bg-slate-50/50 border-t border-slate-100">
             {step > 1 ? (
                <button
                  onClick={handleBack}
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-semibold text-slate-500 transition hover:bg-white hover:text-slate-700 border border-transparent hover:border-slate-200 hover:shadow-sm focus:outline-none disabled:opacity-50"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
                  Anterior
                </button>
             ) : (
                <button
                  onClick={() => navigate(-1)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-semibold text-slate-500 transition hover:bg-white hover:text-slate-700 border border-transparent hover:border-slate-200 hover:shadow-sm focus:outline-none"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
                  Cancelar
                </button>
             )}

             {step < 3 ? (
                <button
                  onClick={handleNext}
                  disabled={catalogos.loading}
                  className="inline-flex items-center justify-center gap-2 rounded-xl px-7 py-2.5 text-[13px] font-bold text-white transition active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg, #0f2548 0%, #2354b4 100%)", boxShadow: "0 4px 16px rgba(15,37,72,0.22), 0 1px 4px rgba(15,37,72,0.1)" }}
                >
                  {catalogos.loading && step === 1 ? (
                     <><Spinner className="h-4 w-4" /> Cargando...</>
                  ) : (
                     <>Continuar <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg></>
                  )}
                </button>
             ) : (
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 rounded-xl px-7 py-2.5 text-[13px] font-bold text-white transition active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-60"
                  style={{ background: "linear-gradient(135deg, #0f2548 0%, #2354b4 100%)", boxShadow: "0 4px 16px rgba(15,37,72,0.22), 0 1px 4px rgba(15,37,72,0.1)" }}
                >
                  {loading ? (
                     <><Spinner className="h-4 w-4" /> Enviando...</>
                  ) : (
                     <><svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg> Confirmar y enviar</>
                  )}
                </button>
             )}
        </div>
      </div>
    </div>
  );
}