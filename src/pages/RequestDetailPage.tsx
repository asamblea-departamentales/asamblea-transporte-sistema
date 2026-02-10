import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getRequestById, type Request } from "../services/requests.service";

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

export default function RequestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [request, setRequest] = useState<Request | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      navigate("/mis-solicitudes");
      return;
    }

    let alive = true;

    async function load() {
      if (!id) return; // TypeScript guard
      
      setLoading(true);
      setError(null);

      try {
        const data = await getRequestById(id);
        if (!alive) return;
        setRequest(data);
      } catch (e: any) {
        if (!alive) return;
        setError(e?.message ?? "No se pudo cargar la solicitud.");
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, [id, navigate]);

  const getStatusBadge = (status: string) => {
    const statusLower = status.toLowerCase();
    
    if (statusLower.includes("aprob") || statusLower.includes("aceptad")) {
      return "inline-flex items-center gap-2 rounded-2xl bg-emerald-100 px-4 py-2.5 text-sm font-bold text-emerald-700 ring-2 ring-emerald-200";
    }
    if (statusLower.includes("pend")) {
      return "inline-flex items-center gap-2 rounded-2xl bg-amber-100 px-4 py-2.5 text-sm font-bold text-amber-700 ring-2 ring-amber-200";
    }
    if (statusLower.includes("progres")) {
      return "inline-flex items-center gap-2 rounded-2xl bg-blue-100 px-4 py-2.5 text-sm font-bold text-blue-700 ring-2 ring-blue-200";
    }
    if (statusLower.includes("completad") || statusLower.includes("finalizad")) {
      return "inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-4 py-2.5 text-sm font-bold text-slate-700 ring-2 ring-slate-200";
    }
    if (statusLower.includes("rechazad")) {
      return "inline-flex items-center gap-2 rounded-2xl bg-red-100 px-4 py-2.5 text-sm font-bold text-red-700 ring-2 ring-red-200";
    }
    return "inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-4 py-2.5 text-sm font-bold text-slate-700 ring-2 ring-slate-200";
  };

  const getStatusIcon = (status: string) => {
    const statusLower = status.toLowerCase();
    
    if (statusLower.includes("aprob") || statusLower.includes("aceptad")) {
      return (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      );
    }
    if (statusLower.includes("pend")) {
      return (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
        </svg>
      );
    }
    if (statusLower.includes("progres")) {
      return (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
        </svg>
      );
    }
    if (statusLower.includes("completad") || statusLower.includes("finalizad")) {
      return (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
          <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
        </svg>
      );
    }
    return null;
  };

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
          <h1 className="text-4xl font-black tracking-tight text-slate-900">
            Detalle de Solicitud
          </h1>
          <p className="mt-1.5 text-base text-slate-600">
            Información completa de la solicitud
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="overflow-hidden rounded-2xl border border-red-200 bg-gradient-to-br from-red-50 to-rose-50 shadow-sm">
          <div className="flex items-start gap-3 p-5">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h4 className="font-bold text-red-900">Error al cargar</h4>
              <p className="mt-1 text-sm font-semibold text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="overflow-hidden rounded-3xl border border-slate-200/60 bg-white/90 backdrop-blur-sm shadow-xl shadow-slate-200/50">
        <div className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white px-8 py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-black tracking-tight text-slate-900">
                  {loading ? "Cargando..." : request?.code}
                </h2>
                {!loading && request && (
                  <span className={getStatusBadge(request.status)}>
                    {getStatusIcon(request.status)}
                    {request.status}
                  </span>
                )}
              </div>
              <p className="mt-1.5 text-sm text-slate-600">
                {loading ? "..." : request?.type}
              </p>
            </div>
          </div>
        </div>

        <div className="p-8">
          {loading ? (
            <SkeletonDetail />
          ) : request ? (
            <div className="space-y-8">
              {/* Main Info */}
              <div>
                <h3 className="mb-4 text-lg font-black text-slate-900">
                  Información General
                </h3>
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-slate-600">
                      Código de Solicitud
                    </label>
                    <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                      <div className="h-2 w-2 rounded-full bg-blue-500" />
                      <span className="font-bold text-slate-900">{request.code}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-slate-600">
                      Fecha de Solicitud
                    </label>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                      <span className="font-semibold text-slate-900">{request.date}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-slate-600">
                      Tipo de Solicitud
                    </label>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                      <span className="font-semibold text-slate-900">{request.type}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-slate-600">
                      Estado
                    </label>
                    <div className="flex">
                      <span className={getStatusBadge(request.status)}>
                        {getStatusIcon(request.status)}
                        {request.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Route Info */}
              {(request.origin || request.destination) && (
                <div>
                  <h3 className="mb-4 text-lg font-black text-slate-900">
                    Información de Ruta
                  </h3>
                  <div className="grid gap-6 sm:grid-cols-2">
                    {request.origin && (
                      <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-600">
                          Origen
                        </label>
                        <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                          <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="font-semibold text-slate-900">{request.origin}</span>
                        </div>
                      </div>
                    )}

                    {request.destination && (
                      <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-600">
                          Destino
                        </label>
                        <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                          <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="font-semibold text-slate-900">{request.destination}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Additional Info */}
              {(request.passengers || request.description) && (
                <div>
                  <h3 className="mb-4 text-lg font-black text-slate-900">
                    Información Adicional
                  </h3>
                  <div className="space-y-4">
                    {request.passengers && (
                      <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-600">
                          Número de Pasajeros
                        </label>
                        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                          <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          <span className="font-bold text-slate-900">{request.passengers} pasajero{request.passengers !== 1 ? "s" : ""}</span>
                        </div>
                      </div>
                    )}

                    {request.description && (
                      <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-600">
                          Descripción
                        </label>
                        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                          <p className="font-medium text-slate-900 leading-relaxed">{request.description}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Timestamps */}
              <div>
                <h3 className="mb-4 text-lg font-black text-slate-900">
                  Fechas del Sistema
                </h3>
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-slate-600">
                      Fecha de Creación
                    </label>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                      <span className="font-semibold text-slate-900">
                        {new Date(request.created_at).toLocaleString("es-ES", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </span>
                    </div>
                  </div>

                  {request.updated_at && (
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-slate-600">
                        Última Actualización
                      </label>
                      <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                        <span className="font-semibold text-slate-900">
                          {new Date(request.updated_at).toLocaleString("es-ES", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
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