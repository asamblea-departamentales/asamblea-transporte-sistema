import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getRequestById,
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
import { useAuth } from "../../auth/AuthContext";

type GenericRequest = any;

export default function RequestDetailPage() {
  const { modulo, id } = useParams<{ modulo: string; id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<GenericRequest | null>(null);
  const [isFinalizarModalOpen, setIsFinalizarModalOpen] = useState(false);

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
  const canFinalizar = isCombustible && data.estado === "aprobada" && data.solicitante_id === user?.id;

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
        {/* Banner de Color según Módulo */}
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
                  modulo === "mantenimiento" ? data.descripcion :
                    data.motivo_actividad}
              </h1>
              <p className="mt-2 text-slate-500">
                {modulo === "transporte" ? "Servicio de transporte institucional" :
                  isCombustible ? data.destino_actividad :
                    modulo === "mantenimiento" ? (typeof data.tipo_mantenimiento === 'object' ? data.tipo_mantenimiento.nombre : data.tipo_mantenimiento) :
                      "Detalle de solicitud"}
              </p>
            </div>

            {canFinalizar && (
              <button
                onClick={() => setIsFinalizarModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-200 transition hover:bg-emerald-700 hover:-translate-y-0.5 active:translate-y-0"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Finalizar Carga
              </button>
            )}
          </div>

          <div className="mt-10 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Detalles Comunes */}
            <DetailItem
              icon={<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
              label="Solicitante"
              value={data.solicitante?.name || "—"}
            />
            <DetailItem
              icon={<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>}
              label="Unidad"
              value={data.unidad?.nombre || "—"}
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
                  value={data.prioridad}
                />
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
                  value={data.origen}
                />
                <DetailItem
                  icon={<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
                  label="Destino"
                  value={data.destino}
                />
              </>
            )}

            {/* Especiales Mantenimiento */}
            {modulo === 'mantenimiento' && (
              <>
                <DetailItem
                  icon={<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
                  label="Tipo de Mantenimiento"
                  value={typeof data.tipo_mantenimiento === 'object' ? data.tipo_mantenimiento.nombre : (data.tipo_mantenimiento || "General")}
                />
                <DetailItem
                  icon={<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                  label="Prioridad"
                  value={data.prioridad}
                />
              </>
            )}
          </div>

          {/* Información Adicional / Observaciones */}
          {(data.observaciones || data.motivo_actividad) && (
            <div className="mt-10 rounded-2xl bg-slate-50 p-6 ring-1 ring-slate-100">
              <h3 className="mb-3 text-xs font-black uppercase tracking-widest text-slate-400">
                Observaciones / Motivo
              </h3>
              <p className="text-sm leading-relaxed text-slate-600">
                {data.observaciones || data.motivo_actividad}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Bloque de Asignación (Si aplica) */}
      {(data.vehiculo || data.motorista) && (
        <section className="animate-fade-in-up">
          <h2 className="mb-4 flex items-center gap-2 px-1 text-sm font-black uppercase tracking-widest text-slate-400">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" /><path d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" /></svg>
            Asignación de recursos
          </h2>
          <AsignacionBloque request={data} />
        </section>
      )}

      {/* Modal de Finalización */}
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
    </div>
  );
}

// Función helper para resolver cualquier valor (objeto, string, número)
function resolveValue(value: any): string | number {
  if (value === null || value === undefined) return "—";
  if (typeof value === "object") return value.nombre ?? value.name ?? String(value);
  return value;
}

function DetailItem({ icon, label, value }: { icon: React.ReactNode, label: string, value: any }) {
  return (
    <div className="flex items-start gap-4">
      <div className="mt-0.5 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 ring-1 ring-slate-200/50">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">{label}</p>
        <p className="mt-0.5 truncate text-sm font-bold text-slate-900">{resolveValue(value)}</p>
      </div>
    </div>
  );
}
