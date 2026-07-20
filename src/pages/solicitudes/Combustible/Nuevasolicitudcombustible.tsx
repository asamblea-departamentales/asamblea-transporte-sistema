import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { getVehiculos, getMotoristas, getSolicitudesTransporteAsociables, crearSolicitudCombustible } from "../../../services/combustible.service";
import type { CrearSolicitudCombustiblePayload } from "../../../services/combustible.service";

// Tipos y constantes extraídas
import type { FormData, CatalogosState } from "./types";
import { INITIAL, STEPS, validate } from "./types";

// Componentes de interfaz compartidos y pantallas
import { Spinner } from "./components/FormUI";
import { SuccessScreen, ErrorCatalogos } from "./components/StatusScreens";
import TransportWizard from "../../../components/ui/TransportWizard";

// Pasos del formulario
import { Step1 } from "./components/Step1Vehiculo";
import { Step2 } from "./components/Step2Detalles";
import { Step3 } from "./components/Step3Revision";

// ══════════════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ══════════════════════════════════════════════════════════════════════════════

export default function NuevaSolicitudCombustible() {
  const navigate = useNavigate();

  // ── Estado del stepper ────────────────────────────────────────────────────
  const [step, setStep]           = useState(1);
  const [data, setData]           = useState<FormData>(INITIAL);
  const [errors, setErrors]       = useState<Partial<Record<keyof FormData, string>>>({});
  const [loading, setLoading]     = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [solicitudId, setSolicitudId] = useState<string | undefined>(undefined);
  const [apiError, setApiError]   = useState<string | null>(null);

  // ── Estado de catálogos ───────────────────────────────────────────────────
  const [catalogos, setCatalogos] = useState<CatalogosState>({
    vehiculos: [],
    motoristas: [],
    solicitudesTransporte: [],
    loading: true,
    loadingSolicitudes: true,
    error: null,
    warning: null,
  });

  // ── Carga inicial de catálogos desde el servicio ──────────────────────────
  const fetchCatalogos = useCallback(async (signal?: AbortSignal) => {
    setCatalogos((prev) => ({
      ...prev,
      loading: true,
      loadingSolicitudes: true,
      error: null,
      warning: null,
    }));

    const results = await Promise.allSettled([
      getVehiculos(signal),
      getMotoristas(signal),
      getSolicitudesTransporteAsociables(signal),
    ]);
    if (signal?.aborted) return;

    const [vehiculos, motoristas, solicitudesTransporte] = results;
    const failed = results.filter((result) => result.status === "rejected").length;

    setCatalogos((previous) => ({
      vehiculos: vehiculos.status === "fulfilled" ? vehiculos.value : previous.vehiculos,
      motoristas: motoristas.status === "fulfilled" ? motoristas.value : previous.motoristas,
      solicitudesTransporte: solicitudesTransporte.status === "fulfilled"
        ? solicitudesTransporte.value
        : previous.solicitudesTransporte,
      loading: false,
      loadingSolicitudes: false,
      error: failed === results.length ? "No se pudieron cargar los catálogos." : null,
      warning: failed > 0 && failed < results.length
        ? "Algunos catálogos no están disponibles. Puede reintentar sin perder los datos ingresados."
        : null,
    }));
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void fetchCatalogos(controller.signal);
    return () => controller.abort();
  }, [fetchCatalogos]);
  // ── Helpers de estado del formulario ─────────────────────────────────────
  const update = useCallback((key: keyof FormData, value: string) => {
    setData((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => { const n = { ...prev }; delete n[key]; return n; });
  }, []);

  const updateMultiple = useCallback((fields: Partial<FormData>) => {
    setData((prev) => ({ ...prev, ...fields }));
    setErrors((prev) => {
      const n = { ...prev };
      Object.keys(fields).forEach((k) => delete n[k as keyof FormData]);
      return n;
    });
  }, []);

  // ── Navegación entre steps ────────────────────────────────────────────────
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

  // ── Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    setApiError(null);
    setLoading(true);

    try {
      const payload: CrearSolicitudCombustiblePayload = {
        vehiculo_id:          parseInt(data.vehiculo_id),
        destino_actividad:    data.destino_actividad,
        fecha_solicitud:      data.fecha_solicitud,
        cantidad_combustible: parseFloat(data.cantidad_combustible),
      };

      if (data.solicitud_transporte_id) payload.solicitud_transporte_id = parseInt(data.solicitud_transporte_id);
      if (data.motorista_id)            payload.motorista_id = parseInt(data.motorista_id);
      if (data.fecha_inicio_periodo)    payload.fecha_inicio_periodo = data.fecha_inicio_periodo;
      if (data.fecha_fin_periodo)       payload.fecha_fin_periodo = data.fecha_fin_periodo;
      if (data.observaciones.trim())    payload.observaciones = data.observaciones.trim();

      const resp = await crearSolicitudCombustible(payload);
      setSolicitudId(resp.codigo);
      setSubmitted(true);
    } catch (err: unknown) {
      let message = "No se pudo conectar con el servidor.";
      if (err && typeof err === "object" && "response" in err) {
        const res = (err as { response?: { data?: { errors?: Record<string, string[]>; message?: string } } }).response;
        if (res?.data?.errors) {
          message = Object.entries(res.data.errors).map(([k, v]) => `${k}: ${v[0]}`).join("\n");
        } else if (res?.data?.message) {
          message = res.data.message;
        }
      } else if (err instanceof Error) {
        message = err.message;
      }
      setApiError(message);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setData(INITIAL);
    setStep(1);
    setSubmitted(false);
    setApiError(null);
  };

  // ── Renders condicionales ─────────────────────────────────────────────────
  if (submitted) return <SuccessScreen solicitudId={solicitudId} onReset={handleReset} />;

  if (!catalogos.loading && catalogos.error) {
    return <ErrorCatalogos message={catalogos.error} onRetry={fetchCatalogos} />;
  }

  // ── Render principal ──────────────────────────────────────────────────────
  return (
    <div className="mx-auto max-w-2xl space-y-6 pb-8 pt-4 sm:pt-10">
      
      {/* ── Wizard stepper ─────────────────────────────────────────────── */}
      <TransportWizard steps={STEPS.map((s, i) => ({ id: i + 1, label: s.title }))} currentStep={step} />

      {/* ── Page heading ───────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <span className="inline-block h-[2px] w-5 rounded-full bg-blue-700" />
          <span className="text-[10px] font-black uppercase tracking-[.18em] text-blue-700">
            Solicitud de Combustible
          </span>
        </div>
        <h1 className="text-[28px] font-bold tracking-tight text-slate-900 leading-none">
          Nueva Solicitud
        </h1>
        <p className="mt-1.5 text-[13px] text-slate-500 leading-relaxed">
          Complete los campos requeridos para continuar con el registro de carga.
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
      {/* ── Main card ──────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          

          {/* Banner de error de API */}
          {apiError && (
            <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4">
              <svg className="mt-0.5 h-5 w-5 shrink-0 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
              <div className="flex-1">
                <p className="text-sm font-black text-red-800">No se pudo enviar la solicitud</p>
                <p className="mt-1 whitespace-pre-line text-xs font-semibold text-red-600">{apiError}</p>
              </div>
              <button onClick={() => setApiError(null)} className="text-red-300 hover:text-red-500">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          {/* Contenedor del step activo */}
          <div className="p-5 sm:p-6">
            {step === 1 && (
              <Step1 data={data} update={update} updateMultiple={updateMultiple} errors={errors} catalogos={catalogos} />
            )}
            {step === 2 && <Step2 data={data} update={update} errors={errors} />}
            {step === 3 && <Step3 data={data} catalogos={catalogos} />}
          </div>
            {/* Navegación inferior */}
            <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:items-center sm:justify-between px-5 py-4 bg-slate-50/50 border-t border-slate-100">
              {step > 1 ? (
                <button
                  onClick={handleBack}
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-semibold text-slate-500 transition hover:bg-white hover:text-slate-700 border border-transparent hover:border-slate-200 hover:shadow-sm focus:outline-none disabled:opacity-50"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                  </svg>
                  Anterior
                </button>
              ) : (
                <button
                  onClick={() => navigate(-1)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-semibold text-slate-500 transition hover:bg-white hover:text-slate-700 border border-transparent hover:border-slate-200 hover:shadow-sm focus:outline-none"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                  </svg>
                  Cancelar
                </button>
              )}

              {step < 3 ? (
                <button
                  onClick={handleNext}
                  disabled={catalogos.loading}
                  className="inline-flex items-center justify-center gap-2 rounded-xl px-7 py-2.5 text-[13px] font-bold text-white transition active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-50"
                  style={{
                    background: "linear-gradient(135deg, #0f2548 0%, #2354b4 100%)",
                    boxShadow: "0 4px 16px rgba(15,37,72,0.22), 0 1px 4px rgba(15,37,72,0.1)",
                  }}
                >
                  {catalogos.loading && step === 1 ? (
                    <><Spinner /> Cargando...</>
                  ) : (
                    <>
                      Continuar
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
                      </svg>
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 rounded-xl px-7 py-2.5 text-[13px] font-bold text-white transition active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-60"
                  style={{
                    background: "linear-gradient(135deg, #0f2548 0%, #2354b4 100%)",
                    boxShadow: "0 4px 16px rgba(15,37,72,0.22), 0 1px 4px rgba(15,37,72,0.1)",
                  }}
                >
                  {loading ? (
                    <><Spinner /> Enviando...</>
                  ) : (
                    <>
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
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
  );
}