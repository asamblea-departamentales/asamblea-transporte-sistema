import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Check, User, Building2, Calendar, Users, MapPin, Wrench } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { geocodeAddress, getOSRMRoute, haversineKm } from "../../lib/geo";
import { completeRequest } from "../../services/requests.service";
import { str, DetailItem, FinalizacionDataSection } from "./components/SharedDetailComponents";
import type { GenericRequest } from "./components/SharedDetailComponents";
import { getStatusStyle } from "../../lib/format";
import AsignacionBloque from "../../components/ui/AsignacionBloque";
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
            <DetailItem icon={<Calendar className="h-4 w-4" />} label="Fecha" value={new Date(data.fecha_salida ?? Date.now()).toLocaleDateString()} />
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
          <MapSection 
            origen={data.origen!} 
            origenLat={data.origen_lat}
            origenLng={data.origen_lng}
            destinosRaw={data.destino!} 
            destinoLat={data.destino_lat}
            destinoLng={data.destino_lng}
            destinosAdicionales={data.destino_adicional} 
            destinoAdicionalLat={data.destino_adicional_lat}
            destinoAdicionalLng={data.destino_adicional_lng}
          />
        </section>
      )}

      {(data.vehiculo || data.motorista) && (
        <section className="animate-fade-in-up">
          <h2 className="mb-4 flex items-center gap-2 px-1 text-sm font-bold uppercase tracking-widest text-slate-400">
            <Wrench className="h-4 w-4" />
            Asignación de recursos
          </h2>
          <AsignacionBloque request={data as any} />
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

// ─── COMPONENTE DE MAPA ───────────────────────────────────────────────────────
function MapSection({ 
  origen, origenLat, origenLng, 
  destinosRaw, destinoLat, destinoLng, 
  destinosAdicionales, destinoAdicionalLat, destinoAdicionalLng 
}: {
  origen: string;
  origenLat?: number | null;
  origenLng?: number | null;
  destinosRaw: string;
  destinoLat?: number | null;
  destinoLng?: number | null;
  destinosAdicionales?: string | null;
  destinoAdicionalLat?: number | null;
  destinoAdicionalLng?: number | null;
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

  const SV_BOUNDS: L.LatLngBoundsExpression = [[12.97, -90.20], [14.55, -87.60]];

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, {
      zoomControl: true, dragging: true, touchZoom: true, scrollWheelZoom: true, doubleClickZoom: true,
      maxBounds: SV_BOUNDS, maxBoundsViscosity: 1.0, minZoom: 8,
    }).setView([13.7942, -88.8965], 9);

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; OpenStreetMap', maxZoom: 19
    }).addTo(map);
    
    mapRef.current = map;
    return () => { mapRef.current?.remove(); mapRef.current = null; };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;
    async function compute() {
      if (!mapRef.current) return;
      setLoading(true);
      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];
      routeLayerRef.current?.remove();
      routeLayerRef.current = null;

      const adicStrings = destinosAdicionales ? destinosAdicionales.split("|").map(s => s.trim()).filter(Boolean) : [];
      const validCoords: { lat: number; lng: number; label: string; isOrigin: boolean }[] = [];

      if (origenLat && origenLng) validCoords.push({ lat: origenLat, lng: origenLng, label: origen, isOrigin: true });
      else if (origen) { const c = await geocodeAddress(origen); if (c) validCoords.push({ ...c, label: origen, isOrigin: true }); }

      if (destinoLat && destinoLng) validCoords.push({ lat: destinoLat, lng: destinoLng, label: destinosRaw, isOrigin: false });
      else if (destinosRaw) { const c = await geocodeAddress(destinosRaw); if (c) validCoords.push({ ...c, label: destinosRaw, isOrigin: false }); }

      if (adicStrings.length > 0) {
        if (destinoAdicionalLat && destinoAdicionalLng) validCoords.push({ lat: destinoAdicionalLat, lng: destinoAdicionalLng, label: adicStrings[0], isOrigin: false });
        else { const c = await geocodeAddress(adicStrings[0]); if (c) validCoords.push({ ...c, label: adicStrings[0], isOrigin: false }); }
        
        if (adicStrings.length > 1) {
          for (let i = 1; i < adicStrings.length; i++) {
            const c = await geocodeAddress(adicStrings[i]);
            if (c) validCoords.push({ ...c, label: adicStrings[i], isOrigin: false });
          }
        }
      }

      if (validCoords.length === 0) { setLoading(false); return; }
      const bounds: [number, number][] = [];

      validCoords.forEach((c, i) => {
        const color = c.isOrigin ? "#0f2548" : "#ef4444";
        const m = L.marker([c.lat, c.lng], { icon: makeIcon(color) }).addTo(mapRef.current!).bindPopup(`<b>${c.isOrigin ? 'Origen' : `Destino ${i}`}:</b><br>${c.label}`);
        markersRef.current.push(m);
        bounds.push([c.lat, c.lng]);
      });

      if (validCoords.length >= 2) {
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

      if (bounds.length > 0) mapRef.current.fitBounds(bounds as L.LatLngBoundsExpression, { padding: [50, 50], maxZoom: 15 });
      setTimeout(() => mapRef.current?.invalidateSize(), 100);
      setLoading(false);
    }
    compute();
  }, [origen, destinosRaw, destinosAdicionales]);

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50">
      <div className="relative">
        <div ref={containerRef} className="h-[300px] w-full z-0 sm:h-[450px] transition-all duration-500" style={{ filter: loading ? 'grayscale(0.5) blur(1px)' : 'none' }} />
        {loading && (
          <div className="absolute inset-0 z-[500] flex flex-col items-center justify-center bg-white/40 backdrop-blur-[2px]">
            <Spinner className="h-10 w-10 text-blue-600" />
            <p className="mt-3 text-[11px] font-bold uppercase tracking-widest text-blue-900 animate-pulse">Calculando ruta...</p>
          </div>
        )}
        {routeInfo && !loading && (
          <div className="absolute bottom-4 right-4 left-4 z-[400] flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white/90 px-6 py-4 shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-xl ring-1 ring-white/50 sm:bottom-6 sm:right-6 sm:left-auto sm:w-auto sm:justify-start transition-all hover:bg-white/95">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600 ring-1 ring-blue-100">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 leading-none">Kilometraje</span>
                <span className="mt-1 text-base font-extrabold text-slate-900 tracking-tight">{routeInfo.distance.toFixed(1)} <span className="text-xs font-bold text-slate-500">km</span></span>
              </div>
            </div>
            <div className="h-10 w-[1px] bg-slate-200/60 hidden sm:block" />
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 text-amber-600 ring-1 ring-amber-100">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
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
