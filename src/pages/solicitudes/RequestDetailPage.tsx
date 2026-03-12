import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getRequestById,
  completeRequest,
} from "../../services/requests.service";
import {
  getMantenimientoById,
} from "../../services/mantenimiento.service";
import {
  getSolicitudCombustible,
} from "../../services/combustible.service";
import { getStatusStyle } from "../../lib/format";
import AsignacionBloque from "../../components/ui/AsignacionBloque";
import { Spinner } from "./Combustible/components/FormUI";
import FinalizarCombustibleModal from "./Combustible/components/FinalizarCombustibleModal";
import FinalizarMantenimientoModal from "./mantenimiento/components/FinalizarMantenimientoModal";
import { useAuth } from "../../auth/AuthContext";

type GenericRequest = any;

// ─── HELPER ───────────────────────────────────────────────────────────────────
function str(value: any): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "object") return value.nombre ?? value.name ?? String(value);
  return String(value);
}

export default function RequestDetailPage() {
  const { modulo, id } = useParams<{ modulo: string; id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<GenericRequest | null>(null);
  const [isFinalizarModalOpen, setIsFinalizarModalOpen] = useState(false);
  const [isFinalizarMantenimientoOpen, setIsFinalizarMantenimientoOpen] = useState(false);
  const [showConfirmTransporte, setShowConfirmTransporte] = useState(false);
  const [finalizandoTransporte, setFinalizandoTransporte] = useState(false);

  const fetchData = async () => {
    if (!modulo || !id) return;
    setLoading(true);
    setError(null);
    try {
      let res;
      if (modulo === "transporte") res = await getRequestById(id);
      else if (modulo === "mantenimiento") res = await getMantenimientoById(id);
      else if (modulo === "combustible") res = await getSolicitudCombustible(parseInt(id));

      if (!res) throw new Error("No se encontró la solicitud");
      setData(res);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Error al cargar el detalle");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [modulo, id]);

  if (loading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
        <Spinner className="h-10 w-10 text-slate-400" />
        <p className="animate-pulse text-sm font-medium text-slate-500">Cargando información...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-500 ring-1 ring-red-100">
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        </div>
        <h2 className="text-xl font-bold text-slate-900">¡Ops! Algo salió mal</h2>
        <p className="mt-2 text-slate-500">{error || "No pudimos encontrar la solicitud solicitada."}</p>
        <button onClick={() => navigate("/mis-solicitudes")} className="mt-8 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800">
          Volver al historial
        </button>
      </div>
    );
  }

  const isCombustible = modulo === "combustible";
  const isTransporte = modulo === "transporte";
  const isMantenimiento = modulo === "mantenimiento";
  const isOwner = Number(data.solicitante_id) === Number(user?.id);

  // ✅ Combustible: finalizar cuando está "asignada"
  const canFinalizarCombustible =
    isCombustible && data.estado === "asignada" && isOwner;

  // ✅ Transporte: finalizar cuando está "aprobada", "programada" o "en_ejecucion"
  const canFinalizarTransporte =
    isTransporte &&
    ["aprobada", "programada", "en_ejecucion"].includes(data.estado) &&
    isOwner;

  // ✅ Mantenimiento: finalizar cuando está "en_ejecucion" o "programada"
  //    (no "aprobada" porque el mantenimiento aún no ha iniciado)
  const canFinalizarMantenimiento =
    isMantenimiento &&
    ["programada", "en_ejecucion"].includes(data.estado) &&
    isOwner;

  const handleFinalizarTransporte = async () => {
    setFinalizandoTransporte(true);
    try {
      await completeRequest(data.id);
      setShowConfirmTransporte(false);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.error || err.response?.data?.message || "Error al finalizar el viaje.");
    } finally {
      setFinalizandoTransporte(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-12">
      {/* Header / Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="group flex items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-slate-900"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white shadow-sm transition group-hover:bg-slate-50">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </div>
          Volver
        </button>

        <div className="flex items-center gap-3">
          <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider shadow-sm ${getStatusStyle(data.estado)}`}>
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            {data.estado.replace("_", " ")}
          </span>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50">
        <div className={`h-2 w-full ${modulo === 'transporte' ? 'bg-blue-500' : modulo === 'combustible' ? 'bg-amber-500' : 'bg-emerald-500'}`} />

        <div className="p-6 md:p-8">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-start">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <span className={`rounded-lg px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-white ${modulo === 'transporte' ? 'bg-blue-600' : modulo === 'combustible' ? 'bg-amber-600' : 'bg-emerald-600'}`}>
                  {modulo}
                </span>
                <span className="text-sm font-bold text-slate-400">#{data.codigo}</span>
              </div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900 md:text-3xl">
                {isCombustible ? "Solicitud de Combustible" :
                  modulo === "mantenimiento" ? str(data.descripcion) :
                    str(data.motivo_actividad)}
              </h1>
              <p className="mt-2 text-slate-500">
                {modulo === "transporte" ? "Servicio de transporte institucional" :
                  isCombustible ? str(data.destino_actividad) :
                    modulo === "mantenimiento" ? str(data.tipo_mantenimiento) :
                      "Detalle de solicitud"}
              </p>
            </div>

            {/* Botón Finalizar Combustible */}
            {canFinalizarCombustible && (
              <button
                onClick={() => setIsFinalizarModalOpen(true)}
                className="inline-flex shrink-0 items-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-200 transition hover:-translate-y-0.5 hover:bg-emerald-700 active:translate-y-0"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Finalizar Carga
              </button>
            )}

            {/* Botón Finalizar Transporte */}
            {canFinalizarTransporte && !showConfirmTransporte && (
              <button
                onClick={() => setShowConfirmTransporte(true)}
                className="inline-flex shrink-0 items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5 hover:bg-blue-700 active:translate-y-0"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Finalizar Viaje
              </button>
            )}

            {/* Botón Finalizar Mantenimiento */}
            {canFinalizarMantenimiento && (
              <button
                onClick={() => setIsFinalizarMantenimientoOpen(true)}
                className="inline-flex shrink-0 items-center gap-2 rounded-2xl bg-violet-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-violet-200 transition hover:-translate-y-0.5 hover:bg-violet-700 active:translate-y-0"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Finalizar Mantenimiento
              </button>
            )}
          </div>

          <div className="mt-10 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Detalles Comunes */}
            <DetailItem
              icon={<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
              label="Solicitante"
              value={str(data.solicitante?.name ?? data.solicitante)}
            />
            <DetailItem
              icon={<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>}
              label="Unidad"
              value={str(data.unidad?.nombre ?? data.unidad)}
            />
            <DetailItem
              icon={<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
              label="Fecha"
              value={new Date(data.fecha_salida || data.fecha_solicitud || data.fecha_sugerida).toLocaleDateString()}
            />

            {/* Especiales Combustible */}
            {isCombustible && (
              <>
                <DetailItem
                  icon={<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
                  label="Cantidad Solicitada"
                  value={`${data.cantidad_combustible} Galones`}
                />
                <DetailItem
                  icon={<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                  label="Prioridad"
                  value={str(data.prioridad)}
                />
                {data.cantidad_vales != null && (
                  <DetailItem
                    icon={<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
                    label="Cantidad de Vales"
                    value={`${data.cantidad_vales} vales`}
                  />
                )}
                {data.correlativo_inicio != null && (
                  <DetailItem
                    icon={<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" /></svg>}
                    label="Correlativos"
                    value={`${data.correlativo_inicio} — ${data.correlativo_fin}`}
                  />
                )}
              </>
            )}

            {/* Especiales Transporte */}
            {modulo === 'transporte' && (
              <>
                <DetailItem
                  icon={<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
                  label="Pasajeros"
                  value={`${data.cantidad_personas} Personas`}
                />
                <DetailItem
                  icon={<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
                  label="Origen"
                  value={str(data.origen)}
                />
                <DetailItem
                  icon={<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
                  label="Destino"
                  value={str(data.destino)}
                />
              </>
            )}

            {/* Especiales Mantenimiento */}
            {modulo === 'mantenimiento' && (
              <>
                <DetailItem
                  icon={<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
                  label="Tipo de Mantenimiento"
                  value={str(data.tipo_mantenimiento)}
                />
                <DetailItem
                  icon={<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                  label="Prioridad"
                  value={str(data.prioridad)}
                />
              </>
            )}
          </div>

          {(data.observaciones || data.motivo_actividad) && (
            <div className="mt-10 rounded-2xl bg-slate-50 p-6 ring-1 ring-slate-100">
              <h3 className="mb-3 text-xs font-black uppercase tracking-widest text-slate-400">
                Observaciones / Motivo
              </h3>
              <p className="text-sm leading-relaxed text-slate-600">
                {str(data.observaciones || data.motivo_actividad)}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Bloque de Asignación */}
      {(data.vehiculo || data.motorista) && (
        <section className="animate-fade-in-up">
          <h2 className="mb-4 flex items-center gap-2 px-1 text-sm font-black uppercase tracking-widest text-slate-400">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" /><path d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" /></svg>
            Asignación de recursos
          </h2>
          <AsignacionBloque request={data} />
        </section>
      )}

      {/* ── Datos de Finalización ────────────────────────────────────── */}
      {["completada", "finalizada"].includes(data.estado) && (
        <FinalizacionDataSection data={data} modulo={modulo!} />
      )}

      {/* Confirmación inline Transporte */}
      {showConfirmTransporte && (
        <div className="overflow-hidden rounded-3xl border border-blue-200 bg-gradient-to-br from-blue-50 to-sky-50 shadow-xl">
          <div className="p-6 md:p-8">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-500 shadow-lg shadow-blue-200">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-black text-slate-900">¿Finalizar este viaje?</h3>
                <p className="mt-1 text-sm text-slate-600">
                  Al confirmar, la solicitud <strong>{data.codigo}</strong> pasará a estado <strong>Completada</strong>. Esta acción no se puede deshacer.
                </p>
                <div className="mt-5 flex gap-3">
                  <button
                    onClick={() => setShowConfirmTransporte(false)}
                    disabled={finalizandoTransporte}
                    className="rounded-2xl border border-slate-200 bg-white px-6 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleFinalizarTransporte}
                    disabled={finalizandoTransporte}
                    className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 disabled:opacity-50"
                  >
                    {finalizandoTransporte
                      ? <Spinner className="h-4 w-4 text-white" />
                      : <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    }
                    {finalizandoTransporte ? "Finalizando..." : "Sí, finalizar viaje"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Finalización Combustible */}
      {isCombustible && (
        <FinalizarCombustibleModal
          isOpen={isFinalizarModalOpen}
          onClose={() => setIsFinalizarModalOpen(false)}
          solicitudId={data.id}
          onSuccess={() => {
            setIsFinalizarModalOpen(false);
            fetchData();
          }}
        />
      )}

      {/* Modal de Finalización Mantenimiento */}
      {isMantenimiento && (
        <FinalizarMantenimientoModal
          isOpen={isFinalizarMantenimientoOpen}
          onClose={() => setIsFinalizarMantenimientoOpen(false)}
          solicitudId={data.id}
          onSuccess={() => {
            setIsFinalizarMantenimientoOpen(false);
            fetchData();
          }}
        />
      )}
    </div>
  );
}

function DetailItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: any }) {
  const safe = (v: any): string => {
    if (v === null || v === undefined) return "—";
    if (typeof v === "object") return v.nombre ?? v.name ?? String(v);
    return String(v);
  };
  return (
    <div className="group relative flex items-start gap-3 rounded-2xl bg-slate-50/60 p-4 transition hover:bg-slate-100/80">
      <div className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm ring-1 ring-slate-200/60">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
        <p className="mt-0.5 text-[13px] font-bold leading-snug text-slate-800">{safe(value)}</p>
      </div>
    </div>
  );
}

// ── Sección de datos de finalización ────────────────────────────────────────

const FORMA_PAGO_LABELS: Record<string, { label: string; icon: string }> = {
  vale:     { label: "Vale",     icon: "🧾" },
  ticket:   { label: "Ticket",   icon: "🎫" },
  tarjeta:  { label: "Tarjeta",  icon: "💳" },
  efectivo: { label: "Efectivo", icon: "💵" },
  otro:     { label: "Otro",     icon: "📄" },
};

function storageUrl(path: string): string {
  const base = import.meta.env.VITE_API_BASE_URL || "";
  return `${base}/storage/${path}`;
}

function isImage(path: string): boolean {
  return /\.(jpg|jpeg|png|gif|webp)$/i.test(path);
}

function FinalizacionDataSection({ data, modulo }: { data: any; modulo: string }) {
  const isCombustible = modulo === "combustible";
  const isMantenimiento = modulo === "mantenimiento";
  const isTransporte = modulo === "transporte";

  const hasData =
    (isCombustible && (data.forma_pago || data.valor_total || data.comprobantes?.length)) ||
    (isMantenimiento && (data.fecha_realizada || data.costo_real != null || data.adjuntos?.length)) ||
    isTransporte;

  if (!hasData) return null;

  const archivos: string[] = isCombustible
    ? (data.comprobantes ?? [])
    : isMantenimiento
      ? (data.adjuntos ?? [])
      : [];

  const accentColor =
    isCombustible ? "bg-amber-500" :
    isMantenimiento ? "bg-emerald-500" :
    "bg-blue-500";

  return (
    <section className="animate-fade-in-up">
      <h2 className="mb-4 flex items-center gap-2 px-1 text-sm font-bold uppercase tracking-widest text-slate-400">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Datos de Finalización
      </h2>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
        {/* Accent strip */}
        <div className={`h-1.5 w-full ${accentColor}`} />

        <div className="p-6 md:p-8">
          {/* Info chips */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">

            {/* Combustible fields */}
            {isCombustible && (
              <>
                {data.forma_pago && (
                  <InfoChip
                    label="Forma de Pago"
                    value={FORMA_PAGO_LABELS[data.forma_pago]?.label ?? data.forma_pago}
                    icon={FORMA_PAGO_LABELS[data.forma_pago]?.icon ?? "📋"}
                  />
                )}
                {data.valor_total != null && (
                  <InfoChip label="Valor Total" value={`$${parseFloat(data.valor_total).toFixed(2)}`} icon="💰" />
                )}
                {data.numero_vale_ticket && (
                  <InfoChip label="Nº Vale / Ticket" value={data.numero_vale_ticket} icon="#️⃣" />
                )}
              </>
            )}

            {/* Mantenimiento fields */}
            {isMantenimiento && (
              <>
                {data.fecha_realizada && (
                  <InfoChip
                    label="Fecha Realizada"
                    value={new Date(data.fecha_realizada).toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" })}
                    icon="📅"
                  />
                )}
                {data.costo_real != null && (
                  <InfoChip label="Costo Real" value={`$${parseFloat(data.costo_real).toFixed(2)}`} icon="💰" />
                )}
              </>
            )}

            {/* Transporte fields */}
            {isTransporte && data.updated_at && (
              <InfoChip
                label="Fecha Finalización"
                value={new Date(data.updated_at).toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                icon="📅"
              />
            )}
          </div>

          {/* ── Galería de archivos ─────────────────────────── */}
          {archivos.length > 0 && (
            <div className="mt-8">
              <p className="mb-4 text-[11px] font-bold uppercase tracking-widest text-slate-400">
                {isCombustible ? "Comprobantes adjuntos" : "Archivos adjuntos"}
                <span className="ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-[10px] font-black text-slate-500">
                  {archivos.length}
                </span>
              </p>

              {/* Image gallery */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {archivos.map((path: string, i: number) => {
                  const url = storageUrl(path);
                  const name = path.split("/").pop() ?? `archivo-${i + 1}`;

                  if (isImage(path)) {
                    return (
                      <a
                        key={i}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative overflow-hidden rounded-xl shadow-sm ring-1 ring-slate-200/80 transition-all hover:shadow-lg hover:ring-slate-300"
                      >
                        <div className="aspect-square bg-slate-100">
                          <img
                            src={url}
                            alt={name}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            onError={(e) => {
                              const el = e.target as HTMLImageElement;
                              el.parentElement!.innerHTML = `<div class="flex h-full w-full flex-col items-center justify-center gap-2 text-slate-400"><svg class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg><span class="text-xs font-medium">No disponible</span></div>`;
                            }}
                          />
                        </div>
                        {/* Hover overlay */}
                        <div className="absolute inset-0 flex items-end bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100">
                          <div className="flex w-full items-center justify-between p-3">
                            <span className="truncate text-xs font-semibold text-white/90">{name}</span>
                            <svg className="h-4 w-4 flex-shrink-0 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </div>
                        </div>
                      </a>
                    );
                  }

                  // PDF / non-image file
                  return (
                    <a
                      key={i}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex aspect-square flex-col items-center justify-center gap-3 rounded-xl bg-slate-50 ring-1 ring-slate-200/80 transition-all hover:bg-slate-100 hover:shadow-md hover:ring-slate-300"
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-slate-200/60 transition group-hover:shadow-md">
                        <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                        </svg>
                      </div>
                      <div className="w-full px-3 text-center">
                        <p className="truncate text-xs font-bold text-slate-600 group-hover:text-slate-800">{name}</p>
                        <p className="mt-0.5 text-[10px] text-slate-400">PDF • Abrir ↗</p>
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function InfoChip({ label, value, icon }: { label: string; value: string; icon?: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-slate-50/80 px-4 py-3.5 ring-1 ring-slate-100">
      {icon && <span className="text-lg">{icon}</span>}
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">{label}</p>
        <p className="mt-0.5 text-sm font-bold text-slate-800">{value}</p>
      </div>
    </div>
  );
}