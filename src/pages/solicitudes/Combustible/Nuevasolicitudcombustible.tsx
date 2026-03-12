import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import {
  getVehiculos,
  getMotoristas,
  getSolicitudesTransporteAsociables,
  crearSolicitudCombustible,
} from "../../../services/combustible.service";
import type { CrearSolicitudCombustiblePayload, Prioridad } from "../../../services/combustible.service";

// Tipos y constantes extraídas
import type { FormData, CatalogosState } from "./types";
import { INITIAL, STEPS, validate } from "./types";

// Componentes de interfaz compartidos y pantallas
import { StepperHeader, Spinner } from "./components/FormUI";
import { SuccessScreen, ErrorCatalogos } from "./components/StatusScreens";

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
  const [apiError, setApiError]   = useState<string | null>(null);

  // ── Estado de catálogos ───────────────────────────────────────────────────
  const [catalogos, setCatalogos] = useState<CatalogosState>({
    vehiculos: [],
    motoristas: [],
    solicitudesTransporte: [],
    loading: true,
    loadingSolicitudes: true,
    error: null,
  });

  // ── Carga inicial de catálogos desde el servicio ──────────────────────────
  const fetchCatalogos = useCallback(async () => {
    setCatalogos((prev) => ({ ...prev, loading: true, loadingSolicitudes: true, error: null }));
    try {
      const [vehiculos, motoristas, solicitudesTransporte] = await Promise.all([
        getVehiculos(),
        getMotoristas(),
        getSolicitudesTransporteAsociables(),
      ]);

      setCatalogos({
        vehiculos,
        motoristas,
        solicitudesTransporte,
        loading: false,
        loadingSolicitudes: false,
        error: null,
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "No se pudieron cargar los catálogos.";
      setCatalogos((prev) => ({
        ...prev,
        loading: false,
        loadingSolicitudes: false,
        error: message,
      }));
    }
  }, []);

  useEffect(() => { fetchCatalogos(); }, [fetchCatalogos]);

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
        prioridad:            data.prioridad as Prioridad,
      };

      if (data.solicitud_transporte_id) payload.solicitud_transporte_id = parseInt(data.solicitud_transporte_id);
      if (data.motorista_id)            payload.motorista_id = parseInt(data.motorista_id);
      if (data.fecha_inicio_periodo)    payload.fecha_inicio_periodo = data.fecha_inicio_periodo;
      if (data.fecha_fin_periodo)       payload.fecha_fin_periodo = data.fecha_fin_periodo;
      if (data.observaciones.trim())    payload.observaciones = data.observaciones.trim();

      await crearSolicitudCombustible(payload);
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
  if (submitted) return <SuccessScreen onReset={handleReset} />;

  if (!catalogos.loading && catalogos.error) {
    return <ErrorCatalogos message={catalogos.error} onRetry={fetchCatalogos} />;
  }

  // ── Render principal ──────────────────────────────────────────────────────
  return (
    <div className="pb-10">
      <div className="rounded-2xl border border-slate-200 bg-white">
        <div className="mx-auto max-w-2xl px-4 py-8 sm:px-8 sm:py-10">

          {/* Header */}
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold text-slate-600">
                <span className="h-2 w-2 rounded-full bg-slate-900" />
                Combustible Vehicular
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Nueva Solicitud
              </h1>
              <p className="mt-1 text-sm font-medium text-slate-500">
                Complete los datos para registrar la carga de combustible.
              </p>
            </div>
            <button
              onClick={() => navigate(-1)}
              className="group inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 active:scale-95"
            >
              <svg className="h-4 w-4 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="hidden sm:inline">Volver</span>
            </button>
          </div>

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

          <StepperHeader current={step} />

          {/* Contenedor del step activo */}
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-sm font-bold text-white shadow-sm">
                {step}
              </div>
              <div>
                <p className="text-base font-bold tracking-tight text-slate-900">{STEPS[step - 1].title}</p>
                <p className="text-sm font-medium text-slate-500">{STEPS[step - 1].subtitle}</p>
              </div>
            </div>

            {step === 1 && (
              <Step1 data={data} update={update} updateMultiple={updateMultiple} errors={errors} catalogos={catalogos} />
            )}
            {step === 2 && <Step2 data={data} update={update} errors={errors} />}
            {step === 3 && <Step3 data={data} catalogos={catalogos} />}

            {/* Navegación inferior */}
            <div className="mt-8 flex items-center justify-between gap-4 border-t border-slate-100 pt-6">
              {step > 1 ? (
                <button
                  onClick={handleBack}
                  disabled={loading}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 active:scale-95 disabled:opacity-50"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                  Anterior
                </button>
              ) : <span />}

              {step < 3 ? (
                <button
                  onClick={handleNext}
                  disabled={catalogos.loading}
                  className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-slate-800 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {catalogos.loading && step === 1 ? (
                    <><Spinner /> Cargando...</>
                  ) : (
                    <>
                      Siguiente
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-7 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-slate-800 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <><Spinner /> Enviando...</>
                  ) : (
                    <>
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
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