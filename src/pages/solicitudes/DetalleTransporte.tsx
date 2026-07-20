import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Check, User, Building2, Calendar, Users, MapPin, Wrench } from "lucide-react";
import { completeRequest } from "../../services/requests.service";
import { str, DetailItem, FinalizacionDataSection } from "./components/SharedDetailComponents";
import type { GenericRequest } from "./components/SharedDetailComponents";
import { getStatusStyle } from "../../lib/format";
import AsignacionBloque from "../../components/ui/AsignacionBloque";
import MapViewer from "../../components/transport/MapViewer";
import type { MapPoint } from "../../components/transport/MapViewer";
import { Spinner } from "./Combustible/components/FormUI";

interface Props {
  data: GenericRequest;
  isOwner: boolean;
  onRefresh: () => void;
}

export default function DetalleTransporte({ data, isOwner, onRefresh }: Props) {
  const navigate = useNavigate();
  const [showConfirmTransporte, setShowConfirmTransporte] = useState(false);
  const [finalizandoTransporte, setFinalizandoTransporte] = useState(false);

  const canFinalizar = data.estado === "asignada" && isOwner;

  const handleFinalizarTransporte = async () => {
    setFinalizandoTransporte(true);
    try {
      await completeRequest(data.codigo);
      setShowConfirmTransporte(false);
      onRefresh();
    } catch (err) {
      const detail = err instanceof Error ? err.message : "Error al finalizar el viaje.";
      alert(detail);
    } finally {
      setFinalizandoTransporte(false);
    }
  };

  const mapOrigin: MapPoint = { address: data.origen || "", lat: data.origen_lat, lng: data.origen_lng };
  const mapDestinations: MapPoint[] = [
    ...(data.destino ? [{ address: data.destino, lat: data.destino_lat, lng: data.destino_lng }] : []),
    ...(data.destino_adicional
      ? data.destino_adicional.split("|").map((s) => ({ address: s.trim(), lat: null, lng: null }))
      : []),
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-12 animate-fade-in">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="group flex items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-slate-900">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white shadow-sm transition group-hover:bg-slate-50">
            <ChevronLeft className="h-4 w-4" />
          </div>
          Volver
        </button>
        <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider shadow-sm ${getStatusStyle(data.estado)}`}>
          <span className="h-1.5 w-1.5 rounded-full bg-current" />
          {data.estado.replace("_", " ")}
        </span>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50">
        <div className="h-2 w-full bg-blue-500" />
        <div className="p-6 md:p-8">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-start">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <span className="rounded-lg px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-white bg-blue-600">transporte</span>
                <span className="text-sm font-bold text-slate-400">#{data.codigo}</span>
              </div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900 md:text-3xl">{str(data.motivo_actividad)}</h1>
              <p className="mt-2 text-slate-500">Servicio de transporte institucional</p>
            </div>

            {canFinalizar && !showConfirmTransporte && (
              <button onClick={() => setShowConfirmTransporte(true)} className="inline-flex shrink-0 items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5 hover:bg-blue-700 active:translate-y-0">
                <Check className="h-5 w-5" />
                Finalizar Viaje
              </button>
            )}
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <DetailItem icon={<User className="h-4 w-4" />} label="Solicitante" value={str(data.solicitante?.name ?? data.solicitante)} />
            <DetailItem icon={<Building2 className="h-4 w-4" />} label="Unidad" value={str(data.unidad?.nombre ?? data.unidad)} />
            <DetailItem icon={<Calendar className="h-4 w-4" />} label="Fecha" value={data.fecha_salida ? new Date(data.fecha_salida).toLocaleDateString() : "No disponible"} />
            <DetailItem icon={<Users className="h-4 w-4" />} label="Pasajeros" value={`${data.cantidad_personas} Personas`} />
            <DetailItem icon={<MapPin className="h-4 w-4" />} label="Origen" value={str(data.origen)} />
            <DetailItem icon={<MapPin className="h-4 w-4" />} label="Destino" value={str(data.destino)} />
          </div>

          {data.motivo_actividad && (
            <div className="mt-10 rounded-2xl bg-slate-50 p-6 ring-1 ring-slate-100">
              <h3 className="mb-3 text-xs font-black uppercase tracking-widest text-slate-400">Motivo de actividad</h3>
              <p className="text-sm leading-relaxed text-slate-600">{str(data.motivo_actividad)}</p>
            </div>
          )}
        </div>
      </div>

      {(data.origen || data.destino) && (
        <section className="animate-fade-in-up">
          <h2 className="mb-4 flex items-center gap-2 px-1 text-sm font-bold uppercase tracking-widest text-slate-400">
            <MapPin className="h-4 w-4" />
            Itinerario en Mapa
          </h2>
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50">
            <MapViewer
              origin={mapOrigin}
              destinations={mapDestinations}
              className="h-[300px] sm:h-[450px]"
            />
            <div className="bg-slate-50/80 p-3.5 text-center border-t border-slate-100/80">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center justify-center gap-2">
                <span className="h-1 w-1 rounded-full bg-slate-300" />
                Ruta Institucional Optimizada
                <span className="h-1 w-1 rounded-full bg-slate-300" />
              </p>
            </div>
          </div>
        </section>
      )}

      {(data.vehiculo || data.motorista) && (
        <section className="animate-fade-in-up">
          <h2 className="mb-4 flex items-center gap-2 px-1 text-sm font-bold uppercase tracking-widest text-slate-400">
            <Wrench className="h-4 w-4" />
            Asignación de recursos
          </h2>
          <AsignacionBloque request={data} />
        </section>
      )}

      {["completada", "finalizada"].includes(data.estado) && <FinalizacionDataSection data={data} modulo="transporte" />}

      {showConfirmTransporte && (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg animate-fade-in-up">
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
                  <button onClick={() => setShowConfirmTransporte(false)} disabled={finalizandoTransporte} className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50">
                    Cancelar
                  </button>
                  <button onClick={handleFinalizarTransporte} disabled={finalizandoTransporte} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50">
                    {finalizandoTransporte ? <Spinner className="h-4 w-4 text-white" /> : <Check className="h-4 w-4" strokeWidth={2.5} />}
                    {finalizandoTransporte ? "Finalizando..." : "Sí, finalizar viaje"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
