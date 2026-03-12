import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getRequestById, type Request } from "../services/requests.service";

// Estados que muestran el bloque de asignación
const ESTADOS_CON_ASIGNACION = ["aprobada", "en_ejecucion", "completada", "finalizada"];

// ─── SKELETON ─────────────────────────────────────────────────────────────────

function SkeletonDetail() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-64 rounded-lg bg-slate-200 animate-pulse" />
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 w-24 rounded bg-slate-200 animate-pulse" />
            <div className="h-6 w-full rounded-lg bg-slate-300 animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── BLOQUE ASIGNACIÓN ────────────────────────────────────────────────────────

function AsignacionBloque({ request }: { request: Request }) {
  const [imgError, setImgError] = useState(false);
  const vehiculo = request.vehiculo;
  const motorista = request.motorista;

  return (
    <div>
      <h3 className="mb-4 text-lg font-black text-slate-900">Asignación de Transporte</h3>
      <div className="overflow-hidden rounded-2xl border border-emerald-100 bg-emerald-50/50">
        {/* Header */}
        <div className="flex items-center gap-2 border-b border-emerald-100 bg-emerald-50 px-5 py-3">
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500">
            <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-xs font-black uppercase tracking-wider text-emerald-700">
            Asignación confirmada
          </p>
        </div>

        <div className="p-5">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">

            {/* Imagen del vehículo */}
            <div className="flex-shrink-0">
              {vehiculo?.fotografia_url && !imgError ? (
                <img
                  src={vehiculo.fotografia_url}
                  alt={`${vehiculo.marca} ${vehiculo.modelo}`}
                  onError={() => setImgError(true)}
                  className="h-36 w-full rounded-xl object-cover shadow ring-2 ring-white sm:h-28 sm:w-48"
                />
              ) : (
                <div className="flex h-36 w-full items-center justify-center rounded-xl bg-slate-100 shadow-inner ring-2 ring-white sm:h-28 sm:w-48">
                  <svg className="h-12 w-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M19 9l-1-4H6L5 9M3 9h18v2a2 2 0 01-2 2H5a2 2 0 01-2-2V9zM7 15h2v2H7v-2zm8 0h2v2h-2v-2z"
                    />
                  </svg>
                </div>
              )}
            </div>

            {/* Datos */}
            <div className="flex flex-1 flex-col gap-5 sm:flex-row sm:gap-6">

              {/* Vehículo */}
              <div className="flex-1">
                <p className="mb-2 text-[10px] font-black uppercase tracking-wider text-emerald-600">
                  Vehículo asignado
                </p>
                {vehiculo ? (
                  <div className="space-y-2">
                    <p className="text-base font-black text-slate-900">
                      {vehiculo.marca} {vehiculo.modelo}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm ring-1 ring-slate-200">
                        <svg className="h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                          />
                        </svg>
                        {vehiculo.placa}
                      </span>
                      {vehiculo.tipo && (
                        <span className="inline-flex items-center rounded-lg bg-emerald-100 px-3 py-1.5 text-xs font-bold text-emerald-700">
                          {typeof vehiculo.tipo === 'object' ? vehiculo.tipo.nombre : vehiculo.tipo}
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm italic text-slate-400">Sin vehículo asignado</p>
                )}
              </div>

              {/* Divisor */}
              <div className="hidden w-px self-stretch bg-emerald-100 sm:block" />
              <div className="h-px w-full bg-emerald-100 sm:hidden" />

              {/* Motorista */}
              <div className="flex-1">
                <p className="mb-2 text-[10px] font-black uppercase tracking-wider text-emerald-600">
                  Motorista asignado
                </p>
                {motorista ? (
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-emerald-600 text-base font-black text-white shadow">
                      {motorista.nombre?.charAt(0).toUpperCase() ?? "?"}
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900">{motorista.nombre ?? "Sin nombre"}</p>
                      {motorista.telefono ? (
                        <a
                          href={`tel:${motorista.telefono}`}
                          className="flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:underline"
                        >
                          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.948V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                            />
                          </svg>
                          {motorista.telefono}
                        </a>
                      ) : (
                        <p className="text-xs text-slate-400">Sin teléfono registrado</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm italic text-slate-400">Sin motorista asignado</p>
                )}
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function getStatusBadge(status: string) {
  const s = status.toLowerCase();
  if (s === "aprobada") return "inline-flex items-center gap-2 rounded-2xl bg-emerald-100 px-4 py-2.5 text-sm font-bold text-emerald-700 ring-2 ring-emerald-200";
  if (s === "pendiente") return "inline-flex items-center gap-2 rounded-2xl bg-amber-100 px-4 py-2.5 text-sm font-bold text-amber-700 ring-2 ring-amber-200";
  if (s === "observada") return "inline-flex items-center gap-2 rounded-2xl bg-blue-100 px-4 py-2.5 text-sm font-bold text-blue-700 ring-2 ring-blue-200";
  if (s === "rechazada") return "inline-flex items-center gap-2 rounded-2xl bg-red-100 px-4 py-2.5 text-sm font-bold text-red-700 ring-2 ring-red-200";
  if (s === "en_ejecucion") return "inline-flex items-center gap-2 rounded-2xl bg-purple-100 px-4 py-2.5 text-sm font-bold text-purple-700 ring-2 ring-purple-200";
  if (s === "completada" || s === "finalizada") return "inline-flex items-center gap-2 rounded-2xl bg-slate-800 px-4 py-2.5 text-sm font-bold text-white ring-2 ring-slate-600";
  return "inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-4 py-2.5 text-sm font-bold text-slate-700 ring-2 ring-slate-200";
}

function getStatusIcon(status: string) {
  const s = status.toLowerCase();
  if (s === "aprobada" || s === "completada" || s === "finalizada") {
    return (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    );
  }
  if (s === "pendiente") {
    return (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
      </svg>
    );
  }
  if (s === "observada") {
    return (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
      </svg>
    );
  }
  return null;
}

// ─── PÁGINA ───────────────────────────────────────────────────────────────────

export default function RequestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [request, setRequest] = useState<Request | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) { navigate("/mis-solicitudes"); return; }

    let alive = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await getRequestById(id!);
        if (alive) setRequest(data);
      } catch (e: any) {
        if (alive) setError(e?.message ?? "No se pudo cargar la solicitud.");
      } finally {
        if (alive) setLoading(false);
      }
    }
    load();
    return () => { alive = false; };
  }, [id, navigate]);

  const formatFecha = (fecha: string) =>
    new Date(fecha).toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" });

  const mostrarAsignacion =
    request !== null && ESTADOS_CON_ASIGNACION.includes(request.estado.toLowerCase());

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/mis-solicitudes")}
          className="group flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-300 bg-white shadow-sm transition-all hover:bg-slate-50 hover:border-slate-400"
        >
          <svg className="h-5 w-5 text-slate-700 transition-transform group-hover:-translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex-1">
          <h1 className="text-4xl font-black tracking-tight text-slate-900">Detalle de Solicitud</h1>
          <p className="mt-1.5 text-base text-slate-600">Información completa de la solicitud de transporte</p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="overflow-hidden rounded-2xl border border-red-200 bg-gradient-to-br from-red-50 to-rose-50 shadow-sm">
          <div className="flex items-start gap-3 p-5">
            <svg className="h-6 w-6 flex-shrink-0 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <h4 className="font-bold text-red-900">Error al cargar</h4>
              <p className="mt-1 text-sm font-semibold text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Card principal */}
      <div className="overflow-hidden rounded-3xl border border-slate-200/60 bg-white/90 backdrop-blur-sm shadow-xl shadow-slate-200/50">
        {/* Subheader */}
        <div className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white px-8 py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-black tracking-tight text-slate-900">
                  {loading ? "Cargando..." : request?.codigo}
                </h2>
                {!loading && request && (
                  <span className={getStatusBadge(request.estado)}>
                    {getStatusIcon(request.estado)}
                    {request.estado.charAt(0).toUpperCase() + request.estado.slice(1)}
                  </span>
                )}
              </div>
              {!loading && request?.unidad && (
                <p className="mt-1.5 text-sm text-slate-600">{request.unidad.nombre}</p>
              )}
            </div>
          </div>
        </div>

        <div className="p-8">
          {loading ? (
            <SkeletonDetail />
          ) : request ? (
            <div className="space-y-8">

              {/* ── Bloque de asignación (solo cuando aplica) ── */}
              {mostrarAsignacion && <AsignacionBloque request={request} />}

              {/* Información General */}
              <div>
                <h3 className="mb-4 text-lg font-black text-slate-900">Información General</h3>
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-slate-600">Código de Solicitud</label>
                    <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                      <div className="h-2 w-2 rounded-full bg-blue-500" />
                      <span className="font-bold text-slate-900">{request.codigo}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-slate-600">Estado</label>
                    <div className="flex">
                      <span className={getStatusBadge(request.estado)}>
                        {getStatusIcon(request.estado)}
                        {request.estado.charAt(0).toUpperCase() + request.estado.slice(1)}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-slate-600">Unidad Solicitante</label>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                      <span className="font-semibold text-slate-900">{request.unidad?.nombre ?? "—"}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-slate-600">Prioridad</label>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                      <span className="font-semibold text-slate-900 capitalize">{request.prioridad}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detalles del Viaje */}
              <div>
                <h3 className="mb-4 text-lg font-black text-slate-900">Detalles del Viaje</h3>
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-slate-600">Origen</label>
                    <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                      <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="font-semibold text-slate-900">{request.origen}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-slate-600">Destino</label>
                    <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                      <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="font-semibold text-slate-900">{request.destino}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-slate-600">Fecha de Salida</label>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                      <span className="font-semibold text-slate-900">{formatFecha(request.fecha_salida)}</span>
                    </div>
                  </div>
                  {request.fecha_retorno && (
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-slate-600">Fecha de Retorno</label>
                      <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                        <span className="font-semibold text-slate-900">{formatFecha(request.fecha_retorno)}</span>
                      </div>
                    </div>
                  )}
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-slate-600">Cantidad de Personas</label>
                    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                      <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span className="font-bold text-slate-900">
                        {request.cantidad_personas} persona{request.cantidad_personas !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Motivo */}
              <div>
                <h3 className="mb-4 text-lg font-black text-slate-900">Motivo de la Actividad</h3>
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="font-medium text-slate-900 leading-relaxed whitespace-pre-wrap">{request.motivo_actividad}</p>
                </div>
              </div>

              {/* Solicitante */}
              {request.solicitante && (
                <div>
                  <h3 className="mb-4 text-lg font-black text-slate-900">Información del Solicitante</h3>
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-slate-600">Nombre</label>
                      <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                        <span className="font-semibold text-slate-900">{request.solicitante.name}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-slate-600">Correo Electrónico</label>
                      <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                        <span className="font-semibold text-slate-900">{request.solicitante.email}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Timestamps */}
              <div>
                <h3 className="mb-4 text-lg font-black text-slate-900">Fechas del Sistema</h3>
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-slate-600">Fecha de Creación</label>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                      <span className="font-semibold text-slate-900">
                        {new Date(request.created_at).toLocaleString("es-ES", { dateStyle: "medium", timeStyle: "short" })}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-slate-600">Última Actualización</label>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                      <span className="font-semibold text-slate-900">
                        {new Date(request.updated_at).toLocaleString("es-ES", { dateStyle: "medium", timeStyle: "short" })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Acciones */}
              <div className="flex flex-col gap-3 border-t border-slate-200 pt-6 sm:flex-row">
                <button
                  onClick={() => navigate("/mis-solicitudes")}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3 font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:border-slate-400"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                  Volver a Mis Solicitudes
                </button>
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-bold text-white shadow-md transition-all hover:bg-blue-700 hover:shadow-lg"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Imprimir
                </button>
              </div>

            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}