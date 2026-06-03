import { useState, useEffect, useRef, useMemo } from "react";
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
import {
  ChevronLeft, CheckCircle2, Check, User, Building2, Calendar,
  Fuel, Clock, ClipboardList, Hash, Users, MapPin, Wrench,
  Receipt, CreditCard, DollarSign, Ticket, CalendarCheck,
  FileText,
} from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { geocodeAddress, getOSRMRoute, haversineKm } from "../../lib/geo";
import Lightbox from "../../components/ui/Lightbox";

// GenericRequest: A purposeful type covering the fields used by this detail view
// across the three modules (transporte, mantenimiento, combustible).
// Rather than intersecting incompatible types, we declare exactly what we read.
type GenericRequest = {
  // ------ Shared core fields ------
  id: number;
  codigo: string;
  estado: string;
  solicitante_id?: number | string;
  created_at?: string;
  updated_at?: string;
  // Related entities (present in all modules with slight shape differences)
  solicitante?: { id?: number | string; name?: string; nombre?: string };
  unidad?: { id?: number | string; nombre?: string };
  vehiculo?: { id?: number; placa?: string; marca?: unknown; modelo?: unknown } | null;
  motorista?: { id?: number; nombre?: string } | null;
  observaciones?: string | null;
  prioridad?: string;
  // ------ Transporte ------
  motivo_actividad?: string;
  origen?: string;
  destino?: string;
  fecha_salida?: string;
  cantidad_personas?: number;
  // ------ Mantenimiento ------
  descripcion?: string;
  tipo_mantenimiento?: string | { id?: number; nombre?: string } | null;
  fecha_sugerida?: string;
  // Finalization fields for mantenimiento
  fecha_realizada?: string | null;
  costo_real?: number | string | null;
  adjuntos?: string[] | null;
  // ------ Combustible ------
  destino_actividad?: string;
  fecha_solicitud?: string;
  cantidad_combustible?: number;
  cantidad_vales?: number | null;
  correlativo_inicio?: number | null;
  correlativo_fin?: number | null;
  forma_pago?: string | null;
  valor_total?: number | string | null;
  numero_vale_ticket?: string | null;
  comprobantes?: string[] | null;
  destino_adicional?: string | null;
};

// ─── HELPER ───────────────────────────────────────────────────────────────────
function str(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    const n = obj.nombre ?? obj.name;
    return typeof n === "string" ? n : String(value);
  }
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
      
      // Normalizar campos para asegurar que el mapa y los detalles tengan data
      const raw = res as any;
      const normalized: GenericRequest = {
        ...raw,
        origen: raw.origen || raw.punto_salida, // fallback por si acaso
        destino: raw.destino || raw.destino_principal || raw.destino_actividad,
      };
      
      setData(normalized);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al cargar el detalle";
      setError(msg);
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

  // ✅ Transporte: finalizar cuando está "asignada"
  const canFinalizarTransporte =
    isTransporte &&
    data.estado === "asignada" &&
    isOwner;

  // ✅ Mantenimiento: finalizar cuando está "aprobada", "programada" o "en_ejecucion"
  const canFinalizarMantenimiento =
    isMantenimiento &&
    ["aprobada", "programada", "en_ejecucion"].includes(data.estado) &&
    isOwner;

  const handleFinalizarTransporte = async () => {
    setFinalizandoTransporte(true);
    try {
      await completeRequest(data.codigo);
      setShowConfirmTransporte(false);
      fetchData();
    } catch (err) {
      const detail = err instanceof Error ? err.message : "Error al finalizar el viaje.";
      alert(err && typeof err === "object" && "response" in err
        ? ((err as { response?: { data?: { error?: string; message?: string } } }).response?.data?.error ||
          (err as { response?: { data?: { error?: string; message?: string } } }).response?.data?.message ||
          detail)
        : detail);
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
            <ChevronLeft className="h-4 w-4" />
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
                <CheckCircle2 className="h-5 w-5" />
                Finalizar Carga
              </button>
            )}

            {/* Botón Finalizar Transporte */}
            {canFinalizarTransporte && !showConfirmTransporte && (
              <button
                onClick={() => setShowConfirmTransporte(true)}
                className="inline-flex shrink-0 items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5 hover:bg-blue-700 active:translate-y-0"
              >
                <Check className="h-5 w-5" />
                Finalizar Viaje
              </button>
            )}

            {/* Botón Finalizar Mantenimiento */}
            {canFinalizarMantenimiento && (
              <button
                onClick={() => setIsFinalizarMantenimientoOpen(true)}
                className="inline-flex shrink-0 items-center gap-2 rounded-2xl bg-violet-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-violet-200 transition hover:-translate-y-0.5 hover:bg-violet-700 active:translate-y-0"
              >
                <CheckCircle2 className="h-5 w-5" />
                Finalizar Mantenimiento
              </button>
            )}
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Detalles Comunes */}
            <DetailItem icon={<User className="h-4 w-4" />} label="Solicitante" value={str(data.solicitante?.name ?? data.solicitante)} />
            <DetailItem icon={<Building2 className="h-4 w-4" />} label="Unidad" value={str(data.unidad?.nombre ?? data.unidad)} />
            <DetailItem icon={<Calendar className="h-4 w-4" />} label="Fecha" value={new Date(data.fecha_salida ?? data.fecha_solicitud ?? data.fecha_sugerida ?? Date.now()).toLocaleDateString()} />

            {/* Especiales Combustible */}
            {isCombustible && (
              <>
                <DetailItem icon={<Fuel className="h-4 w-4" />} label="Cantidad Solicitada" value={`${data.cantidad_combustible} Galones`} />
                {data.cantidad_vales != null && (
                  <DetailItem icon={<ClipboardList className="h-4 w-4" />} label="Cantidad de Vales" value={`${data.cantidad_vales} vales`} />
                )}
                {data.correlativo_inicio != null && (
                  <DetailItem icon={<Hash className="h-4 w-4" />} label="Correlativos" value={`${data.correlativo_inicio} — ${data.correlativo_fin}`} />
                )}
              </>
            )}

            {/* Especiales Transporte */}
            {modulo === 'transporte' && (
              <>
                <DetailItem icon={<Users className="h-4 w-4" />} label="Pasajeros" value={`${data.cantidad_personas} Personas`} />
                <DetailItem icon={<MapPin className="h-4 w-4" />} label="Origen" value={str(data.origen)} />
                <DetailItem icon={<MapPin className="h-4 w-4" />} label="Destino" value={str(data.destino)} />
              </>
            )}

            {/* Especiales Mantenimiento */}
            {modulo === 'mantenimiento' && (
              <>
                <DetailItem icon={<Wrench className="h-4 w-4" />} label="Tipo de Mantenimiento" value={str(data.tipo_mantenimiento)} />
                <DetailItem icon={<Clock className="h-4 w-4" />} label="Prioridad" value={str(data.prioridad)} />
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

      {/* Bloque de Mapa (Solo Transporte) */}
      {isTransporte && (data.origen || data.destino) && (
        <section className="animate-fade-in-up">
          <h2 className="mb-4 flex items-center gap-2 px-1 text-sm font-bold uppercase tracking-widest text-slate-400">
            <MapPin className="h-4 w-4" />
            Itinerario en Mapa
          </h2>
          <MapSection origen={data.origen!} destinosRaw={data.destino!} destinosAdicionales={data.destino_adicional} />
        </section>
      )}

      {/* Bloque de Asignación */}
      {(data.vehiculo || data.motorista) && (
        <section className="animate-fade-in-up">
          <h2 className="mb-4 flex items-center gap-2 px-1 text-sm font-bold uppercase tracking-widest text-slate-400">
            <Wrench className="h-4 w-4" />
            Asignación de recursos
          </h2>
          <AsignacionBloque request={data as Parameters<typeof AsignacionBloque>[0]["request"]} />
        </section>
      )}

      {/* ── Datos de Finalización ────────────────────────────────────── */}
      {["completada", "finalizada"].includes(data.estado) && (
        <FinalizacionDataSection data={data} modulo={modulo!} />
      )}

      {/* Confirmación inline Transporte */}
      {showConfirmTransporte && (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
          <div className="h-1.5 w-full bg-blue-500" />
          <div className="p-6 md:p-8">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <Check className="h-6 w-6" strokeWidth={2.5} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-900">¿Finalizar este viaje?</h3>
                <p className="mt-1 text-sm text-slate-500">
                  La solicitud <strong className="text-slate-700">{data.codigo}</strong> pasará a estado <strong className="text-slate-700">Completada</strong>. Esta acción no se puede deshacer.
                </p>
                <div className="mt-5 flex gap-3">
                  <button
                    onClick={() => setShowConfirmTransporte(false)}
                    disabled={finalizandoTransporte}
                    className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleFinalizarTransporte}
                    disabled={finalizandoTransporte}
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
                  >
                    {finalizandoTransporte
                      ? <Spinner className="h-4 w-4 text-white" />
                      : <Check className="h-4 w-4" strokeWidth={2.5} />
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

function DetailItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: unknown }) {
  const safe = (v: unknown): string => {
    if (v === null || v === undefined) return "—";
    if (typeof v === "object") {
      const obj = v as Record<string, unknown>;
      const n = obj.nombre ?? obj.name;
      return typeof n === "string" ? n : String(v);
    }
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

const FORMA_PAGO_MAP: Record<string, { label: string; Icon: typeof Receipt }> = {
  vale: { label: "Vale", Icon: Receipt },
  ticket: { label: "Ticket", Icon: Ticket },
  tarjeta: { label: "Tarjeta", Icon: CreditCard },
  efectivo: { label: "Efectivo", Icon: DollarSign },
  otro: { label: "Otro", Icon: FileText },
};

function storageUrl(path: string): string {
  const base = import.meta.env.VITE_API_BASE_URL || "";
  return `${base}/storage/${path}`;
}

function isImage(path: string): boolean {
  return /\.(jpg|jpeg|png|gif|webp)$/i.test(path);
}

function FinalizacionDataSection({ data, modulo }: { data: GenericRequest; modulo: string }) {
  const isCombustible = modulo === "combustible";
  const isMantenimiento = modulo === "mantenimiento";
  const isTransporte = modulo === "transporte";

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

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

  // Prepare lightbox file list
  const lightboxFiles = useMemo(
    () =>
      archivos.map((path) => ({
        url: storageUrl(path),
        name: path.split("/").pop() ?? "archivo",
        isImage: isImage(path),
      })),
    [archivos],
  );

  function openLightbox(index: number) {
    setLightboxIndex(index);
    setLightboxOpen(true);
  }

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
                {data.forma_pago && (() => {
                  const key = String(data.forma_pago) as keyof typeof FORMA_PAGO_MAP;
                  const PayIcon = FORMA_PAGO_MAP[key]?.Icon ?? Receipt;
                  return (
                    <InfoChip
                      label="Forma de Pago"
                      value={FORMA_PAGO_MAP[key]?.label ?? String(data.forma_pago)}
                      icon={<PayIcon className="h-4 w-4" />}
                    />
                  );
                })()}
                {data.valor_total != null && (
                  <InfoChip label="Valor Total" value={`$${parseFloat(String(data.valor_total)).toFixed(2)}`} icon={<DollarSign className="h-4 w-4" />} />
                )}
                {data.numero_vale_ticket && (
                  <InfoChip label="Nº Vale / Ticket" value={data.numero_vale_ticket} icon={<Hash className="h-4 w-4" />} />
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
                    icon={<CalendarCheck className="h-4 w-4" />}
                  />
                )}
                {data.costo_real != null && (
                  <InfoChip label="Costo Real" value={`$${parseFloat(String(data.costo_real)).toFixed(2)}`} icon={<DollarSign className="h-4 w-4" />} />
                )}
              </>
            )}

            {/* Transporte fields */}
            {isTransporte && data.updated_at && (
              <InfoChip
                label="Fecha Finalización"
                value={new Date(data.updated_at).toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                icon={<CalendarCheck className="h-4 w-4" />}
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

              {/* Image gallery — now opens in-app lightbox */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {archivos.map((path: string, i: number) => {
                  const url = storageUrl(path);
                  const name = path.split("/").pop() ?? `archivo-${i + 1}`;

                  if (isImage(path)) {
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => openLightbox(i)}
                        className="group relative overflow-hidden rounded-xl shadow-sm ring-1 ring-slate-200/80 transition-all hover:shadow-lg hover:ring-slate-300 text-left cursor-pointer"
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
                              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                            </svg>
                          </div>
                        </div>
                      </button>
                    );
                  }

                  // PDF / non-image file — also opens in lightbox
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => openLightbox(i)}
                      className="group flex aspect-square flex-col items-center justify-center gap-3 rounded-xl bg-slate-50 ring-1 ring-slate-200/80 transition-all hover:bg-slate-100 hover:shadow-md hover:ring-slate-300 cursor-pointer"
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-slate-200/60 transition group-hover:shadow-md">
                        <FileText className="h-6 w-6 text-red-500" />
                      </div>
                      <div className="w-full px-3 text-center">
                        <p className="truncate text-xs font-bold text-slate-600 group-hover:text-slate-800">{name}</p>
                        <p className="mt-0.5 text-[10px] text-slate-400">Clic para ver</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Lightbox Viewer ──────────────────────────────── */}
      {lightboxOpen && lightboxFiles.length > 0 && (
        <Lightbox
          files={lightboxFiles}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </section>
  );
}

function InfoChip({ label, value, icon }: { label: string; value: string | number; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-slate-50/80 px-4 py-3.5 ring-1 ring-slate-100">
      {icon && <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-white text-slate-500 shadow-sm ring-1 ring-slate-200/50">{icon}</div>}
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">{label}</p>
        <p className="mt-0.5 text-sm font-bold text-slate-800">{value}</p>
      </div>
    </div>
  );
}

// ─── COMPONENTE DE MAPA ───────────────────────────────────────────────────────

function MapSection({ origen, destinosRaw, destinosAdicionales }: {
  origen: string;
  destinosRaw: string;
  destinosAdicionales?: string | null;
}) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const routeLayerRef = useRef<L.Polyline | null>(null);

  const [loading, setLoading] = useState(true);
  const [routeInfo, setRouteInfo] = useState<{ distance: number; duration: number } | null>(null);

  const makeIcon = (color: string) => L.icon({
    iconUrl: "data:image/svg+xml;base64," + btoa(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" width="32" height="32"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>`),
    iconSize: [32, 32], iconAnchor: [16, 32], popupAnchor: [0, -32],
  });

  // Límites geográficos de El Salvador (con margen)
  const SV_BOUNDS: L.LatLngBoundsExpression = [
    [12.97, -90.20], // Suroeste
    [14.55, -87.60], // Noreste
  ];

  // 1. Inicializar Mapa (Solo una vez)
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, {
      zoomControl: true,
      dragging: true,
      touchZoom: true,
      scrollWheelZoom: true,
      doubleClickZoom: true,
      maxBounds: SV_BOUNDS,
      maxBoundsViscosity: 1.0,
      minZoom: 8,
    }).setView([13.7942, -88.8965], 9);

    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20
    }).addTo(map);
    
    mapRef.current = map;

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  // 2. Calcular Capas (Cada vez que cambian los datos)
  useEffect(() => {
    if (!mapRef.current) return;

    async function compute() {
      if (!mapRef.current) return;
      setLoading(true);

      // Limpiar capas previas
      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];
      routeLayerRef.current?.remove();
      routeLayerRef.current = null;

      const adicStrings = destinosAdicionales ? destinosAdicionales.split("|").map(s => s.trim()).filter(Boolean) : [];
      const allStrings = [origen, destinosRaw, ...adicStrings].filter(s => s && s.trim().length > 0);

      if (allStrings.length === 0) {
        setLoading(false);
        return;
      }

      // Geocodificación paralela
      const results = await Promise.all(
        allStrings.map(async (s, i) => {
          const c = await geocodeAddress(s);
          return c ? { ...c, label: s, isOrigin: i === 0 } : null;
        })
      );

      const validCoords = results.filter((c): c is { lat: number; lng: number; label: string; isOrigin: boolean } => c !== null);
      const bounds: [number, number][] = [];

      validCoords.forEach((c, i) => {
        const color = c.isOrigin ? "#0f2548" : "#ef4444";
        const m = L.marker([c.lat, c.lng], { icon: makeIcon(color) })
          .addTo(mapRef.current!)
          .bindPopup(`<b>${c.isOrigin ? 'Origen' : `Destino ${i}`}:</b><br>${c.label}`);
        markersRef.current.push(m);
        bounds.push([c.lat, c.lng]);
      });

      if (validCoords.length >= 2) {
        // Añadir el origen al final para cerrar el circuito (Ida y Vuelta)
        const roundTripCoords = [...validCoords, validCoords[0]];

        const osrm = await getOSRMRoute(roundTripCoords);
        if (osrm?.geometry?.length) {
          routeLayerRef.current = L.polyline(osrm.geometry, { color: "#3b82f6", weight: 6, opacity: 0.9, lineCap: "round", lineJoin: "round" }).addTo(mapRef.current);
          setRouteInfo({ distance: osrm.distanceKm, duration: osrm.durationMin });
        } else {
          const pts: L.LatLngExpression[] = roundTripCoords.map(c => [c.lat, c.lng]);
          routeLayerRef.current = L.polyline(pts, { color: "#94a3b8", weight: 4, opacity: 0.8, dashArray: "8, 8", lineCap: "round" }).addTo(mapRef.current);
          let d = 0;
          for (let i = 0; i < roundTripCoords.length - 1; i++) d += haversineKm(roundTripCoords[i].lat, roundTripCoords[i].lng, roundTripCoords[i + 1].lat, roundTripCoords[i + 1].lng);
          setRouteInfo({ distance: d, duration: (d / 45) * 60 });
        }
      }

      if (bounds.length > 0) {
        mapRef.current.fitBounds(bounds as L.LatLngBoundsExpression, { padding: [50, 50], maxZoom: 15 });
      }

      // Pequeño delay para asegurar que el renderizado de Leaflet se asiente
      setTimeout(() => mapRef.current?.invalidateSize(), 100);
      setLoading(false);
    }

    compute();
  }, [origen, destinosRaw, destinosAdicionales]);

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50">
      <div className="relative">
        <div
          ref={containerRef}
          className="h-[300px] w-full z-0 sm:h-[450px] transition-all duration-500"
          style={{ filter: loading ? 'grayscale(0.5) blur(1px)' : 'none' }}
        />

        {loading && (
          <div className="absolute inset-0 z-[500] flex flex-col items-center justify-center bg-white/40 backdrop-blur-[2px]">
            <Spinner className="h-10 w-10 text-blue-600" />
            <p className="mt-3 text-[11px] font-bold uppercase tracking-widest text-blue-900 animate-pulse">
              Calculando ruta...
            </p>
          </div>
        )}

        {routeInfo && !loading && (
          <div className="absolute bottom-4 right-4 left-4 z-[400] flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white/90 px-6 py-4 shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-xl ring-1 ring-white/50 sm:bottom-6 sm:right-6 sm:left-auto sm:w-auto sm:justify-start transition-all hover:bg-white/95">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600 ring-1 ring-blue-100">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 leading-none">Kilometraje</span>
                <span className="mt-1 text-base font-extrabold text-slate-900 tracking-tight">{routeInfo.distance.toFixed(1)} <span className="text-xs font-bold text-slate-500">km</span></span>
              </div>
            </div>
            
            <div className="h-10 w-[1px] bg-slate-200/60 hidden sm:block" />
            
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 text-amber-600 ring-1 ring-amber-100">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 leading-none">Tiempo Redondo</span>
                <span className="mt-1 text-base font-extrabold text-slate-900 tracking-tight">{routeInfo.duration.toFixed(0)} <span className="text-xs font-bold text-slate-500">min</span></span>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="bg-slate-50/80 p-3.5 text-center border-t border-slate-100/80">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center justify-center gap-2">
          <span className="h-1 w-1 rounded-full bg-slate-300" />
          Ruta Institucional Optimizada
          <span className="h-1 w-1 rounded-full bg-slate-300" />
        </p>
      </div>
    </div>
  );
}