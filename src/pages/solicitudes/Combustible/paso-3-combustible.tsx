// src/pages/solicitudes/combustible/paso-3-combustible.tsx
//
// Paso 3 del wizard de solicitud de combustible.
// Responsabilidad: mostrar resumen completo, enviar al backend
// y limpiar localStorage al éxito.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { STORAGE_KEY, type WizardData } from "./paso-1-combustible";
import {
  crearSolicitudCombustible,
  enviarSolicitud,
  type CrearSolicitudCombustiblePayload,
} from "../../../services/combustible.service";

// ══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════════════════════════════════════

function safeParse(json: string | null): WizardData {
  try { return json ? JSON.parse(json) : {}; } catch { return {}; }
}

function formatFecha(fecha?: string): string {
  if (!fecha) return "—";
  return new Date(fecha + "T00:00:00").toLocaleDateString("es-SV", {
    day: "2-digit", month: "long", year: "numeric",
  });
}

const PRIORIDAD_LABEL: Record<string, string> = {
  baja:  "Baja",
  media: "Media",
  alta:  "Alta",
};

const PRIORIDAD_BADGE: Record<string, string> = {
  baja:  "bg-emerald-50 text-emerald-700 ring-emerald-100",
  media: "bg-amber-50 text-amber-700 ring-amber-100",
  alta:  "bg-red-50 text-red-700 ring-red-100",
};

const PRIORIDAD_DOT: Record<string, string> = {
  baja:  "bg-emerald-400",
  media: "bg-amber-400",
  alta:  "bg-red-400",
};

// ══════════════════════════════════════════════════════════════════════════════
// COMPONENTES UI
// ══════════════════════════════════════════════════════════════════════════════

function Spinner({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 py-3 last:border-0">
      <span className="shrink-0 text-xs font-extrabold uppercase tracking-wider text-slate-400">
        {label}
      </span>
      <span className="text-right text-sm font-semibold text-slate-800">{value || "—"}</span>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// PANTALLA DE ÉXITO
// ══════════════════════════════════════════════════════════════════════════════

function SuccessScreen({ onNueva }: { onNueva: () => void }) {
  const navigate = useNavigate();
  return (
    <div className="mx-auto max-w-7xl pb-10">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mx-auto max-w-lg py-12 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 shadow-[0_14px_35px_-10px_rgba(16,185,129,.45)]">
            <svg className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            ¡Solicitud enviada!
          </h2>
          <p className="mt-3 text-sm font-semibold leading-relaxed text-slate-500">
            Tu solicitud de combustible fue registrada y enviada correctamente.
            Está pendiente de revisión y aprobación.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              onClick={() => navigate("/solicitudes/combustible")}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-6 py-3 text-sm font-extrabold text-white shadow-sm transition hover:opacity-90 active:scale-[0.99]"
            >
              Ver mis solicitudes
            </button>
            <button
              onClick={onNueva}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-extrabold text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-[0.99]"
            >
              Nueva solicitud
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// PÁGINA PRINCIPAL
// ══════════════════════════════════════════════════════════════════════════════

export default function Paso3Combustible() {
  const navigate     = useNavigate();
  const submittedRef = useRef(false);

  const [data,       setData]       = useState<WizardData>({});
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg,   setErrorMsg]   = useState<string | null>(null);
  const [success,    setSuccess]    = useState(false);

  // ── Verificar que viene del paso 2 ────────────────────────────────────────
  useEffect(() => {
    const saved = safeParse(localStorage.getItem(STORAGE_KEY));

    const ok =
      !!saved.vehiculo_id &&
      !!saved.destino_actividad &&
      !!saved.fecha_solicitud &&
      !!saved.cantidad_combustible &&
      !!saved.prioridad;

    if (!ok) {
      navigate("/solicitudes/combustible/paso-1", { replace: true });
      return;
    }

    setData(saved);
  }, [navigate]);

  // ── Submit ────────────────────────────────────────────────────────────────
  async function handleSubmit() {
    if (submittedRef.current || submitting) return;
    submittedRef.current = true;
    setErrorMsg(null);
    setSubmitting(true);

    try {
      // Construir payload tipado
      const payload: CrearSolicitudCombustiblePayload = {
        vehiculo_id:          data.vehiculo_id!,
        destino_actividad:    data.destino_actividad!,
        fecha_solicitud:      data.fecha_solicitud!,
        cantidad_combustible: data.cantidad_combustible!,
        prioridad:            data.prioridad!,
      };

      if (data.motorista_id)           payload.motorista_id           = data.motorista_id;
      if (data.solicitud_transporte_id) payload.solicitud_transporte_id = data.solicitud_transporte_id;
      if (data.fecha_inicio_periodo)   payload.fecha_inicio_periodo   = data.fecha_inicio_periodo;
      if (data.fecha_fin_periodo)      payload.fecha_fin_periodo      = data.fecha_fin_periodo;
      if (data.observaciones)          payload.observaciones          = data.observaciones;

      // Crear + enviar automáticamente (estado pendiente → en_revision)
      const solicitud = await crearSolicitudCombustible(payload);
      await enviarSolicitud(solicitud.id);

      localStorage.removeItem(STORAGE_KEY);
      setSuccess(true);
    } catch (e: unknown) {
      submittedRef.current = false; // permite reintentar

      let message = "No se pudo conectar con el servidor.";
      if (e && typeof e === "object" && "response" in e) {
        const res = (e as { response?: { data?: { errors?: Record<string, string[]>; message?: string } } }).response;
        if (res?.data?.errors) {
          message = Object.entries(res.data.errors)
            .map(([k, v]) => `${k}: ${v[0]}`)
            .join("\n");
        } else if (res?.data?.message) {
          message = res.data.message;
        }
      } else if (e instanceof Error) {
        message = e.message;
      }

      setErrorMsg(message);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSubmitting(false);
    }
  }

  function handleNueva() {
    localStorage.removeItem(STORAGE_KEY);
    navigate("/solicitudes/combustible/paso-1");
  }

  // ── Pantalla de éxito ─────────────────────────────────────────────────────
  if (success) return <SuccessScreen onNueva={handleNueva} />;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="mx-auto max-w-7xl space-y-7 pb-10">

      {/* ── Barra de progreso ──────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm sm:px-7">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-base font-bold text-slate-900">Nueva Solicitud de Combustible</h3>
          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Paso 3 de 3
          </span>
        </div>
        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div className="h-full w-full rounded-full bg-emerald-500 transition-all duration-500" />
        </div>
        <div className="mt-3 flex items-center justify-between text-sm">
          <span className="text-slate-600">
            Actual: <span className="font-semibold text-emerald-600">Confirmación</span>
          </span>
          <span className="italic text-slate-400">Listo para enviar</span>
        </div>
      </div>

      {/* ── Título ────────────────────────────────────────────────────────── */}
      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-[34px]">
          Confirmación de Solicitud
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-slate-600">
          Verifique la información antes de enviar. Si algo está incorrecto,
          regrese al paso anterior.
        </p>
      </div>

      {/* ── Error ─────────────────────────────────────────────────────────── */}
      {errorMsg && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          <svg className="mt-0.5 h-5 w-5 shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
          <div className="flex-1">
            <p className="font-bold text-red-900">No se pudo enviar la solicitud</p>
            <p className="mt-0.5 whitespace-pre-line">{errorMsg}</p>
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-red-300 hover:text-red-500">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* ── Resumen ───────────────────────────────────────────────────────── */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="space-y-6">

          {/* Vehículo */}
          <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="mb-4 flex items-center justify-between gap-2">
              <p className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400">
                Vehículo
              </p>
              {data.solicitud_transporte_codigo && (
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-black text-blue-700 ring-1 ring-blue-100">
                  Vinculado a {data.solicitud_transporte_codigo}
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
              {[
                { label: "Placa",  value: data.vehiculo_placa  ?? "—" },
                { label: "Marca",  value: data.vehiculo_marca  ?? "—" },
                { label: "Modelo", value: data.vehiculo_modelo ?? "—" },
                { label: "Tipo",   value: data.vehiculo_tipo   ?? "—" },
              ].map((item) => (
                <div key={item.label} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5">
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">{item.label}</p>
                  <p className="mt-0.5 truncate text-sm font-bold text-slate-800">{item.value}</p>
                </div>
              ))}
            </div>
            {data.motorista_nombre && (
              <p className="mt-3 text-xs font-semibold text-slate-500">
                Motorista:{" "}
                <span className="font-black text-slate-700">{data.motorista_nombre}</span>
              </p>
            )}
          </section>

          {/* Detalles de la carga */}
          <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <p className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400">
                Detalles de la carga
              </p>
              {data.prioridad && (
                <span className={[
                  "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-black ring-1",
                  PRIORIDAD_BADGE[data.prioridad] ?? "bg-slate-50 text-slate-600 ring-slate-200",
                ].join(" ")}>
                  <span className={[
                    "h-1.5 w-1.5 rounded-full",
                    PRIORIDAD_DOT[data.prioridad] ?? "bg-slate-400",
                  ].join(" ")} />
                  Prioridad {PRIORIDAD_LABEL[data.prioridad]}
                </span>
              )}
            </div>
            <div>
              <ReviewRow label="Destino / Actividad" value={data.destino_actividad ?? "—"} />
              <ReviewRow label="Fecha de solicitud"  value={formatFecha(data.fecha_solicitud)} />
              <ReviewRow
                label="Cantidad"
                value={data.cantidad_combustible
                  ? `${data.cantidad_combustible.toFixed(2)} galones`
                  : "—"}
              />
              {data.fecha_inicio_periodo && (
                <ReviewRow label="Período inicio" value={formatFecha(data.fecha_inicio_periodo)} />
              )}
              {data.fecha_fin_periodo && (
                <ReviewRow label="Período fin"    value={formatFecha(data.fecha_fin_periodo)} />
              )}
              {data.observaciones && (
                <ReviewRow label="Observaciones"  value={data.observaciones} />
              )}
            </div>
          </section>

          {/* Aviso de envío */}
          <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4">
            <svg className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
            <p className="text-xs font-semibold text-amber-700">
              Al confirmar, la solicitud será creada y enviada automáticamente para revisión y aprobación.
              No podrá editarse una vez enviada.
            </p>
          </div>

        </div>

        {/* ── Navegación ──────────────────────────────────────────────────── */}
        <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <button
            onClick={() => navigate("/solicitudes/combustible")}
            disabled={submitting}
            className="inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 disabled:opacity-50"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Cancelar
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/solicitudes/combustible/paso-2")}
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-[0.99] disabled:opacity-50"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Anterior
            </button>

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-600 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? (
                <>
                  <Spinner className="h-4 w-4" />
                  Enviando...
                </>
              ) : (
                <>
                  Enviar solicitud
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}