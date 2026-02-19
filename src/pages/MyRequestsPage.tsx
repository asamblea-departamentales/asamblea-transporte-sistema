import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  getAllRequests,
  completeRequest,
  type Request,
  type RequestStatus,
  type RequestFilters,
} from "../services/requests.service";

// ─── TIPOS ────────────────────────────────────────────────────────────────────
type FilterState = {
  estado: RequestStatus | "";
  search: string;
};

type RouteInfo = {
  distance: number;
  duration: number;
  isReal: boolean;
};

// ─── CONSTANTES ───────────────────────────────────────────────────────────────
const NOMINATIM_EMAIL = "app@transporte.institucional.sv";

const ESTADOS: { value: RequestStatus | ""; label: string }[] = [
  { value: "", label: "Todos" },
  { value: "pendiente", label: "Pendiente" },
  { value: "aprobada", label: "Aprobada" },
  { value: "en_ejecucion", label: "En Ejecución" },
  { value: "completada", label: "Completada" },
  { value: "finalizada", label: "Finalizada" },
  { value: "rechazada", label: "Rechazada" },
  { value: "observada", label: "Observada" },
  { value: "borrador", label: "Borrador" },
];

const STATUS_STYLES: Record<string, string> = {
  pendiente: "bg-amber-100/80 text-amber-800 border-amber-200/60 backdrop-blur-sm",
  aprobada: "bg-emerald-100/80 text-emerald-800 border-emerald-200/60 backdrop-blur-sm",
  en_ejecucion: "bg-purple-100/80 text-purple-800 border-purple-200/60 backdrop-blur-sm",
  completada: "bg-emerald-500/90 text-white border-emerald-400/60 backdrop-blur-sm shadow-emerald-500/25",
  finalizada: "bg-slate-800/95 text-white border-slate-600/60 backdrop-blur-sm shadow-slate-500/25",
  rechazada: "bg-red-100/80 text-red-800 border-red-200/60 backdrop-blur-sm",
  observada: "bg-blue-100/80 text-blue-800 border-blue-200/60 backdrop-blur-sm",
  borrador: "bg-gray-100/80 text-gray-700 border-gray-200/60 backdrop-blur-sm",
};

function getStatusStyle(status: string): string {
  return STATUS_STYLES[status.toLowerCase()] ?? "bg-gray-100/80 text-gray-700 border-gray-200/60 backdrop-blur-sm";
}

function isCompleted(status: string): boolean {
  return ["completada", "finalizada"].includes(status.toLowerCase());
}

// ─── GEOCODING / OSRM ─────────────────────────────────────────────────────────
async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const res = await fetch(
      `/nominatim/search?format=json&q=${encodeURIComponent(address)}&countrycodes=sv&limit=1&email=${NOMINATIM_EMAIL}`,
      { headers: { "Accept-Language": "es" } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (data?.length > 0) {
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    }
    return null;
  } catch {
    return null;
  }
}

async function getOSRMRoute(points: { lat: number; lng: number }[]): Promise<{
  distanceKm: number;
  durationMin: number;
  geometry: [number, number][];
} | null> {
  if (points.length < 2) return null;
  try {
    const coords = points.map((p) => `${p.lng},${p.lat}`).join(";");
    const res = await fetch(
      `/osrm/route/v1/driving/${coords}?overview=full&geometries=geojson`,
      { headers: { Accept: "application/json" } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (data?.code !== "Ok" || !data.routes?.[0]) return null;
    const route = data.routes[0];
    const geometry: [number, number][] =
      (route.geometry?.coordinates ?? []).map(([lng, lat]: [number, number]) => [lat, lng]);
    return {
      distanceKm: route.distance / 1000,
      durationMin: route.duration / 60,
      geometry,
    };
  } catch {
    return null;
  }
}

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ─── MAPA EN DETALLE FLOWUBER ─────────────────────────────────────────────────
function RequestMap({ origen, destino }: { origen: string; destino: string }) {
  const mapId = useRef(`map-detail-${Math.random().toString(36).slice(2)}`);
  const mapRef = useRef<L.Map | null>(null);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [isLoadingMap, setIsLoadingMap] = useState(true);

  const originIcon = L.icon({
    iconUrl:
      "data:image/svg+xml;base64," +
      btoa(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36" fill="none">
        <circle cx="18" cy="18" r="16" fill="#4F46E5" opacity="0.9"/>
        <circle cx="18" cy="18" r="12" fill="#667EEA" opacity="0.7"/>
        <path d="M18 4C13.58 4 10 7.58 10 12c0 6.5 8 15 8 15s8-8.5 8-15c0-4.42-3.58-8-8-8zm0 11.5c-2.49 0-4.5-2.01-4.5-4.5s2.01-4.5 4.5-4.5 4.5 2.01 4.5 4.5-2.01 4.5-4.5 4.5z" fill="#fff"/>
        <circle cx="18" cy="18" r="18" fill="#4F46E5" opacity="0.15"/>
      </svg>`),
    iconSize: [36, 36], iconAnchor: [18, 36], popupAnchor: [0, -36],
    className: "animate-bounce [animation-duration:2s]",
  });

  const destIcon = L.icon({
    iconUrl:
      "data:image/svg+xml;base64," +
      btoa(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36" fill="none">
        <circle cx="18" cy="18" r="16" fill="#DC2626" opacity="0.9"/>
        <circle cx="18" cy="18" r="12" fill="#FCA5A5" opacity="0.7"/>
        <path d="M18 4C13.58 4 10 7.58 10 12c0 6.5 8 15 8 15s8-8.5 8-15c0-4.42-3.58-8-8-8zm0 11.5c-2.49 0-4.5-2.01-4.5-4.5s2.01-4.5 4.5-4.5 4.5 2.01 4.5 4.5-2.01 4.5-4.5 4.5z" fill="#fff"/>
        <circle cx="18" cy="18" r="18" fill="#DC2626" opacity="0.15"/>
      </svg>`),
    iconSize: [36, 36], iconAnchor: [18, 36], popupAnchor: [0, -36],
  });

  useEffect(() => {
    const currentMapId = mapId.current;

    const initTimeout = setTimeout(() => {
      if (mapRef.current) return;

      const map = L.map(currentMapId, {
        zoomControl: true,
        dragging: true,
        scrollWheelZoom: false,
      }).setView([13.7942, -88.8965], 9);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      mapRef.current = map;

      (async () => {
        const [origenCoords, destinoCoords] = await Promise.all([
          geocodeAddress(origen),
          geocodeAddress(destino),
        ]);

        if (!origenCoords || !destinoCoords) {
          setIsLoadingMap(false);
          return;
        }

        L.marker([origenCoords.lat, origenCoords.lng], { icon: originIcon })
          .addTo(map)
          .bindPopup(`<b>🚀 Origen:</b><br>${origen}`);

        L.marker([destinoCoords.lat, destinoCoords.lng], { icon: destIcon })
          .addTo(map)
          .bindPopup(`<b>🎯 Destino:</b><br>${destino}`);

        const osrm = await getOSRMRoute([origenCoords, destinoCoords]);

        if (osrm && osrm.geometry.length > 0) {
          L.polyline(osrm.geometry, {
            color: "#4F46E5", weight: 6, opacity: 0.9,
          }).addTo(map);
          setRouteInfo({ distance: osrm.distanceKm, duration: osrm.durationMin, isReal: true });
        } else {
          L.polyline(
            [[origenCoords.lat, origenCoords.lng], [destinoCoords.lat, destinoCoords.lng]],
            { color: "#4F46E5", weight: 5, opacity: 0.8, dashArray: "12, 8" }
          ).addTo(map);
          const km = haversineKm(origenCoords.lat, origenCoords.lng, destinoCoords.lat, destinoCoords.lng);
          setRouteInfo({ distance: km, duration: (km / 45) * 60, isReal: false });
        }

        map.fitBounds([
          [origenCoords.lat, origenCoords.lng],
          [destinoCoords.lat, destinoCoords.lng],
        ] as L.LatLngBoundsExpression, { padding: [50, 50] });

        setIsLoadingMap(false);
      })();
    }, 150);

    return () => {
      clearTimeout(initTimeout);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return (
    <div className="mt-6 group/map overflow-hidden rounded-2xl border border-slate-200/60 bg-gradient-to-br from-slate-50/80 to-indigo-50/50 shadow-xl backdrop-blur-sm hover:shadow-2xl hover:border-indigo-300/60 hover:shadow-indigo-500/10 transition-all duration-700">
      <div className="border-b border-slate-200/50 bg-gradient-to-r from-slate-50/90 to-indigo-50/70 px-5 py-3.5 backdrop-blur-sm">
        <p className="text-sm font-bold bg-gradient-to-r from-slate-800 to-indigo-900 bg-clip-text text-transparent">
          🗺️ Ruta en tiempo real
        </p>
      </div>

      <div className="relative">
        <div id={mapId.current} className="h-[300px] w-full bg-gradient-to-br from-slate-100 to-slate-200" />
        {isLoadingMap && (
          <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-indigo-50/90 backdrop-blur-xl border border-white/60">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex items-center gap-3 rounded-2xl bg-white/95 backdrop-blur-2xl px-8 py-4 shadow-2xl border border-slate-200/50 ring-2 ring-white/60">
                <div className="h-6 w-6 animate-spin rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600" />
                <span className="text-sm font-bold bg-gradient-to-r from-slate-800 to-slate-900 bg-clip-text text-transparent">
                  Calculando ruta óptima...
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {routeInfo && !isLoadingMap && (
        <div className="flex flex-col gap-3 border-t border-slate-200/50 bg-gradient-to-r from-white/95 via-slate-50/80 to-indigo-50/50 px-6 py-5 backdrop-blur-sm group-hover/map:shadow-inner">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-sm font-bold text-slate-800">
              <div className="h-2.5 w-2.5 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 shadow-lg ring-2 ring-emerald-100/50" />
              <span className="group-hover/map:text-indigo-700 transition-colors">
                {routeInfo.isReal ? "✅ Ruta confirmada" : "📏 Trayecto estimado"}
              </span>
            </div>
            <div className="h-2 w-2 rounded-full bg-emerald-400 animate-ping [animation-duration:2s]" />
          </div>
          
          <div className="grid grid-cols-2 gap-6 text-sm font-semibold">
            <div className="flex items-center gap-2.5 text-indigo-700 hover:scale-105 transition-all group-hover/map:translate-x-1">
              <svg className="h-4.5 w-4.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              <span>{routeInfo.distance.toFixed(1)} km</span>
            </div>
            <div className="flex items-center gap-2.5 text-emerald-700 hover:scale-105 transition-all group-hover/map:translate-x-1">
              <svg className="h-4.5 w-4.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{Math.round(routeInfo.duration)} min</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── DETALLE EXPANDIDO FLOWUBER ─────────────────────────────────────────────────
function RequestDetail({
  request,
  onComplete,
}: {
  request: Request;
  onComplete: (id: number) => Promise<void>;
}) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleCompleteClick = async () => {
    if (!confirm("¿Confirmas que el viaje ha finalizado correctamente?")) return;
    setIsUpdating(true);
    try {
      await onComplete(request.id);
    } finally {
      setIsUpdating(false);
    }
  };

  const formatFecha = (fecha: string) =>
    new Date(fecha).toLocaleString("es-ES", {
      dateStyle: "medium",
      timeStyle: "short",
    });

  const puedeFinalizarse = request.estado?.toLowerCase() === "en_ejecucion";

  return (
    <div className="border-t border-slate-200/50 bg-gradient-to-b from-slate-50/80 to-white/90 backdrop-blur-sm p-1 sm:p-0">
      <div className="rounded-2xl border border-slate-200/60 bg-gradient-to-br from-white/95 to-slate-50/80 p-6 sm:p-8 shadow-2xl backdrop-blur-xl hover:shadow-3xl hover:border-slate-300/70 transition-all duration-500">
        
        {/* Cabecera FLOWUBER */}
        <div className="mb-6 flex flex-col gap-4 border-b border-slate-200/50 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="group/header">
            <h3 className="text-xl sm:text-2xl font-black bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-900 bg-clip-text text-transparent group-hover/header:scale-[1.02] transition-all">
              Detalle #{request.codigo}
            </h3>
            <p className="mt-1 text-xs font-semibold text-emerald-600 bg-emerald-100/60 px-2.5 py-1 rounded-full inline-block">
              {request.estado}
            </p>
          </div>
          {puedeFinalizarse && (
            <button
              onClick={handleCompleteClick}
              disabled={isUpdating}
              className={`group/btn relative inline-flex w-full items-center justify-center gap-3 rounded-2xl px-8 py-4 text-lg font-black text-white shadow-2xl transition-all backdrop-blur-xl overflow-hidden sm:w-auto sm:px-6
                ${isUpdating
                  ? "cursor-not-allowed bg-gradient-to-r from-slate-400/80 to-slate-500/80 ring-2 ring-slate-400/50 scale-95"
                  : "bg-gradient-to-r from-slate-800 via-slate-900 to-black hover:from-slate-900 hover:to-slate-950 hover:shadow-3xl hover:shadow-slate-900/40 hover:ring-4 hover:ring-slate-400/30 hover:scale-[1.02] active:scale-[0.98]"
                }`}
            >
              {isUpdating ? (
                <>
                  <div className="h-6 w-6 animate-spin rounded-2xl border-3 border-white/20 border-t-white" />
                  <span>Procesando finalización...</span>
                </>
              ) : (
                <>
                  <svg className="h-5 w-5 text-emerald-400 group-hover/btn:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>✓ Finalizar Viaje</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 via-transparent to-emerald-400/20 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
                </>
              )}
            </button>
          )}
        </div>

        {/* Info principal */}
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 bg-gradient-to-r from-slate-500 to-slate-700 bg-clip-text">
              📍 Ruta
            </h4>
            <div className="space-y-4">
              <div className="group flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-emerald-50/80 to-emerald-50/50 border border-emerald-100/50 hover:bg-emerald-50/90 transition-all">
                <div className="h-3 w-3 rounded-full bg-emerald-500 shadow-lg ring-2 ring-emerald-200/50 group-hover:scale-110 transition-all" />
                <div>
                  <span className="block text-xs text-emerald-700 font-semibold">Origen</span>
                  <span className="text-base font-bold text-slate-900">{request.origen}</span>
                </div>
              </div>
              <div className="group flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-red-50/80 to-red-50/50 border border-red-100/50 hover:bg-red-50/90 transition-all">
                <div className="h-3 w-3 rounded-full bg-red-500 shadow-lg ring-2 ring-red-200/50 group-hover:scale-110 transition-all" />
                <div>
                  <span className="block text-xs text-red-700 font-semibold">Destino</span>
                  <span className="text-base font-bold text-slate-900">{request.destino}</span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 bg-gradient-to-r from-slate-500 to-slate-700 bg-clip-text mb-4">
              📋 Datos Generales
            </h4>
            <div className="space-y-3 text-sm backdrop-blur-sm">
              <div className="group flex items-center justify-between p-3 rounded-xl bg-indigo-50/80 border border-indigo-100/50 hover:bg-indigo-50/90 hover:shadow-md transition-all">
                <span className="font-bold text-slate-700">👥 Pasajeros</span>
                <span className="font-black text-2xl text-indigo-700">{request.cantidad_personas}</span>
              </div>
              <div className="group flex items-start justify-between p-3 rounded-xl bg-slate-50/80 border border-slate-200/50 hover:bg-slate-50/90 hover:shadow-md transition-all">
                <span className="font-semibold text-slate-700 max-w-[200px]">{request.motivo_actividad}</span>
                <span className="px-2.5 py-1 bg-emerald-100/60 text-emerald-800 text-xs font-bold rounded-full">Actividad</span>
              </div>
              {request.unidad && (
                <div className="group flex items-center justify-between p-3 rounded-xl bg-purple-50/80 border border-purple-100/50 hover:bg-purple-50/90 hover:shadow-md transition-all">
                  <span className="font-semibold text-slate-700">🚗 {request.unidad.nombre}</span>
                  <div className="h-2 w-8 bg-gradient-to-r from-purple-400 to-indigo-500 rounded-full shadow-lg" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* MAPA */}
        {request.origen && request.destino && <RequestMap origen={request.origen} destino={request.destino} />}

        <div className="mt-6 pt-6 border-t border-slate-200/50 text-center">
          <p className="text-xs font-semibold text-slate-500 bg-slate-100/60 px-4 py-2 inline-block rounded-full backdrop-blur-sm">
            📅 Creado el {formatFecha(request.created_at)}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── SKELETONS ───────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-2xl border border-slate-200/60 bg-gradient-to-br from-white/90 to-slate-50/80 shadow-lg p-6 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="h-5 w-40 rounded-xl bg-slate-200/70" />
        <div className="h-6 w-24 rounded-2xl bg-slate-200/70" />
      </div>
      <div className="space-y-3">
        <div className="h-4 w-64 rounded-lg bg-slate-200/70" />
        <div className="h-4 w-48 rounded-lg bg-slate-200/70" />
        <div className="h-4 w-32 rounded-lg bg-slate-200/70" />
      </div>
    </div>
  );
}

function SkeletonRow() {
  return (
    <tr className="animate-pulse border-b border-slate-100/50">
      <td className="px-6 py-5"><div className="h-5 w-36 rounded-xl bg-slate-200/70" /></td>
      <td className="px-6 py-5"><div className="h-5 w-32 rounded-xl bg-slate-200/70" /></td>
      <td className="px-6 py-5"><div className="h-5 w-72 rounded-xl bg-slate-200/70" /></td>
      <td className="px-6 py-5"><div className="h-5 w-24 rounded-xl bg-slate-200/70" /></td>
      <td className="px-6 py-5"><div className="ml-auto h-8 w-28 rounded-2xl bg-slate-200/70" /></td>
    </tr>
  );
}

// ─── PÁGINA PRINCIPAL FLOWUBER ─────────────────────────────────────────────────
export default function AllRequestsPage() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<Request[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<FilterState>({ estado: "", search: "" });
  const [searchInput, setSearchInput] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [expandedRequest, setExpandedRequest] = useState<Request | null>(null);

  const loadRequests = useCallback(async (currentPage: number, currentFilters: FilterState) => {
    setLoading(true);
    try {
      const params: RequestFilters = { page: currentPage, per_page: 10 };
      if (currentFilters.estado) params.estado = currentFilters.estado;
      if (currentFilters.search.trim()) params.search = currentFilters.search.trim();
      const result = await getAllRequests(params);
      setRequests(result.data);
      setTotal(result.total);
      setTotalPages(result.total_pages);
    } catch {
      setRequests([]);
      setTotal(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRequests(page, filters);
  }, [page, filters, loadRequests]);

  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      setFilters((prev) => ({ ...prev, search: searchInput }));
    }, 500);
    return () => clearTimeout(t);
  }, [searchInput]);

  const handleRowClick = (req: Request) => {
    if (expandedId === req.id) {
      setExpandedId(null);
      setExpandedRequest(null);
      return;
    }
    setExpandedId(req.id);
    setExpandedRequest(req);
  };

  const handleCompleteRequest = async (id: number) => {
    await completeRequest(id);
    setRequests((curr) =>
      curr.map((r) => (r.id === id ? { ...r, estado: "completada" } : r))
    );
    if (expandedRequest?.id === id) {
      setExpandedRequest({ ...expandedRequest, estado: "completada" });
    }
  };

  const handleEstadoChange = (estado: RequestStatus | "") => {
    setPage(1);
    setExpandedId(null);
    setExpandedRequest(null);
    setFilters((prev) => ({ ...prev, estado }));
  };

  const formatFechaCorta = (fecha: string) =>
    new Date(fecha).toISOString().slice(0, 16).replace("T", " ");

  const emptyMessage =
    filters.estado || filters.search
      ? "Cambia los filtros para ver resultados."
      : "Aún no tienes solicitudes registradas.";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        
        {/* HEADER FLOWUBER */}
        <div className="group/header flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between p-6 rounded-3xl bg-white/80 backdrop-blur-xl border border-slate-200/50 shadow-2xl hover:shadow-3xl hover:border-indigo-200/50 transition-all duration-700">
          <div>
            <h1 className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-800 bg-clip-text text-transparent group-hover/header:scale-[1.02] transition-all">
              Historial de Solicitudes
            </h1>
            <p className="mt-2 text-lg font-semibold text-slate-600 bg-slate-100/60 px-4 py-1.5 rounded-2xl inline-block backdrop-blur-sm">
              {total > 0
                ? `${total.toLocaleString()} solicitud${total !== 1 ? "es" : ""} registradas`
                : "Sin solicitudes activas"}
            </p>
          </div>
          <button
            onClick={() => navigate("/")}
            className="group/btn inline-flex items-center gap-3 self-start rounded-3xl border-2 border-slate-200/60 bg-white/90 px-8 py-4 text-lg font-bold text-slate-800 shadow-xl backdrop-blur-xl hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 hover:border-indigo-300/60 hover:shadow-2xl hover:shadow-indigo-200/30 hover:translate-y-0.5 hover:scale-[1.02] transition-all duration-500 sm:self-auto"
          >
            <svg className="h-5 w-5 group-hover/btn:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Dashboard
          </button>
        </div>

        {/* FILTROS FLOWUBER */}
        <div className="rounded-3xl border border-slate-200/60 bg-gradient-to-br from-white/95 via-slate-50/80 to-indigo-50/40 p-8 shadow-2xl backdrop-blur-xl hover:shadow-3xl hover:border-indigo-200/50 transition-all duration-700">
          <div className="relative mb-6">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-indigo-500/10 ring-2 ring-indigo-200/40 shadow-xl" />
            <svg className="absolute left-6 top-1/2 h-6 w-6 -translate-y-1/2 text-indigo-500 drop-shadow-lg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="🔍 Buscar por código, origen, destino o motivo..."
              className="relative w-full rounded-3xl border-2 border-slate-200/50 bg-white/90 py-5 pl-16 pr-6 text-lg font-semibold backdrop-blur-xl transition-all focus:border-indigo-400/80 focus:ring-4 focus:ring-indigo-100/60 focus:shadow-3xl focus:shadow-indigo-200/40 hover:border-indigo-300/60 hover:shadow-xl"
            />
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 -mb-3 scrollbar-hide">
            {ESTADOS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleEstadoChange(opt.value as RequestStatus | "")}
                className={`group/btn flex-shrink-0 relative rounded-2xl border-2 px-6 py-3.5 text-base font-bold transition-all backdrop-blur-xl shadow-lg hover:shadow-xl hover:shadow-indigo-200/50 hover:scale-[1.05] hover:-translate-y-1 duration-300
                  ${filters.estado === opt.value
                    ? "border-indigo-500/80 bg-gradient-to-r from-indigo-600/95 to-purple-600/90 text-white shadow-indigo-500/40 ring-4 ring-indigo-500/40 shadow-2xl"
                    : "border-slate-200/60 bg-white/90 text-slate-800 hover:border-indigo-400/70 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50/70 hover:text-indigo-800"
                  }`}
              >
                <span className="relative z-10">{opt.label}</span>
                {filters.estado === opt.value && (
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-400/30 to-indigo-400/30 backdrop-blur-sm animate-pulse [animation-duration:2s]" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ── MÓVIL: tarjetas FLOWUBER ──────────────────────────────────────── */}
        <div className="block sm:hidden space-y-4">
          {loading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : requests.length === 0 ? (
            <div className="rounded-3xl border border-slate-200/60 bg-gradient-to-br from-white/90 to-slate-50/80 px-12 py-20 text-center shadow-2xl backdrop-blur-xl">
              <div className="mx-auto mb-6 grid h-20 w-20 place-items-center rounded-3xl bg-slate-100/70 ring-2 ring-slate-200/50 shadow-xl">
                <svg className="h-10 w-10 text-slate-400 drop-shadow-lg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-xl font-black text-slate-800 mb-2 bg-gradient-to-r from-slate-800 to-slate-900 bg-clip-text">No hay solicitudes</p>
              <p className="text-sm text-slate-500 max-w-sm mx-auto">{emptyMessage}</p>
            </div>
          ) : (
            requests.map((req) => (
              <div 
                key={req.id} 
                className="group/card overflow-hidden rounded-3xl border border-slate-200/60 bg-gradient-to-b from-white/95 via-slate-50/80 to-indigo-50/40 shadow-xl backdrop-blur-xl hover:shadow-3xl hover:border-indigo-300/60 hover:shadow-indigo-200/20 hover:bg-indigo-50/50 transition-all duration-700"
              >
                <button
                  onClick={() => handleRowClick(req)}
                  className="flex w-full items-center justify-between p-6 transition-all group-hover/card:-translate-y-1 group-hover/card:scale-[1.01]"
                >
                  <div className="flex items-center gap-4">
                    <div className="relative flex-shrink-0">
                      <div className="h-4 w-4 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 shadow-xl ring-3 ring-indigo-100/60 group-hover/card:shadow-indigo-500/40 group-hover/card:scale-125 transition-all duration-500" />
                      <div className="absolute -inset-1 h-4 w-4 rounded-full bg-gradient-to-r from-emerald-400 to-indigo-400 blur animate-ping opacity-0 group-hover/card:opacity-100 transition-all [animation-duration:2s]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-lg font-black bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-900 bg-clip-text group-hover/card:scale-[1.02] transition-all">
                        {req.codigo}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-600">{formatFechaCorta(req.fecha_salida)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`group/status inline-flex items-center gap-2 rounded-2xl border-2 px-4 py-2.5 text-sm font-black capitalize shadow-lg transition-all backdrop-blur-xl ${getStatusStyle(req.estado)} group-hover/card:scale-105 group-hover/card:shadow-xl`}>
                      {isCompleted(req.estado) && (
                        <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-lg ring-2 ring-emerald-200/50 animate-ping [animation-duration:1.5s]" />
                      )}
                      {req.estado}
                    </span>
                    <svg
                      className={`h-6 w-6 flex-shrink-0 text-slate-500 transition-all duration-500 group-hover/card:scale-110 ${expandedId === req.id ? "rotate-180" : ""}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>
                
                {/* Preview ruta */}
                <div className="border-t border-slate-200/50 bg-gradient-to-r from-slate-50/70 to-indigo-50/50 backdrop-blur-sm px-6 py-4">
                  <div className="flex items-center gap-3 text-sm text-slate-700 font-semibold group-hover/card:shadow-inner transition-all">
                    <span className="max-w-[140px] truncate font-bold bg-gradient-to-r from-slate-900 to-slate-800 bg-clip-text">{req.origen}</span>
                    <svg className="h-4 w-4 flex-shrink-0 text-indigo-500 drop-shadow-lg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                    <span className="max-w-[140px] truncate font-bold bg-gradient-to-r from-slate-900 to-slate-800 bg-clip-text">{req.destino}</span>
                  </div>
                </div>
                
                {expandedId === req.id && expandedRequest && (
                  <RequestDetail request={expandedRequest} onComplete={handleCompleteRequest} />
                )}
              </div>
            ))
          )}
        </div>

        {/* ── DESKTOP: tabla FLOWUBER ───────────────────────────────────────── */}
        <div className="hidden sm:block rounded-3xl border border-slate-200/60 bg-gradient-to-b from-white/95 to-slate-50/70 shadow-2xl backdrop-blur-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-slate-200/50 bg-gradient-to-r from-slate-50/80 to-indigo-50/60 backdrop-blur-sm text-left text-xs font-black uppercase tracking-widest text-slate-600">
                  <th className="px-8 py-6 font-black">Código</th>
                  <th className="px-8 py-6 font-black">Fecha Salida</th>
                  <th className="px-8 py-6 font-black">Ruta</th>
                  <th className="px-8 py-6 font-black">Tipo</th>
                  <th className="px-8 py-6 font-black text-right">Estado</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <>
                    <SkeletonRow />
                    <SkeletonRow />
                    <SkeletonRow />
                    <SkeletonRow />
                    <SkeletonRow />
                  </>
                ) : requests.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-24 text-center">
                      <div className="mx-auto flex max-w-md flex-col items-center gap-4 p-8 bg-gradient-to-br from-slate-50/80 to-indigo-50/50 rounded-3xl backdrop-blur-xl border border-slate-200/50 shadow-2xl">
                        <div className="grid h-20 w-20 place-items-center rounded-3xl bg-slate-100/70 ring-2 ring-slate-200/50 shadow-xl">
                          <svg className="h-12 w-12 text-slate-400 drop-shadow-lg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <p className="text-2xl font-black text-slate-800 bg-gradient-to-r from-slate-800 to-slate-900 bg-clip-text">No hay solicitudes</p>
                        <p className="text-sm text-slate-500 max-w-sm">{emptyMessage}</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  requests.map((req) => (
                    <>
                      <tr
                        key={req.id}
                        onClick={() => handleRowClick(req)}
                        className={`cursor-pointer border-b border-slate-100/30 transition-all duration-300 hover:bg-gradient-to-r hover:from-indigo-50/70 hover:to-purple-50/50 hover:shadow-inner hover:border-indigo-200/50 ${expandedId === req.id ? "bg-gradient-to-r from-slate-50/80 to-indigo-50/60 shadow-lg" : ""}`}
                      >
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="h-3.5 w-3.5 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 ring-3 ring-indigo-100/60 shadow-lg hover:scale-125 transition-all" />
                            <span className="text-lg font-black text-slate-900 bg-gradient-to-r from-slate-900 to-slate-800 bg-clip-text">{req.codigo}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <span className="text-base font-semibold text-slate-700 bg-slate-100/60 px-3 py-1.5 rounded-xl inline-block backdrop-blur-sm">{formatFechaCorta(req.fecha_salida)}</span>
                        </td>
                        <td className="px-8 py-6 max-w-[320px]">
                          <div className="flex items-center gap-3 text-base font-semibold text-slate-800">
                            <span className="max-w-[140px] truncate font-black bg-gradient-to-r from-slate-900 to-slate-800 bg-clip-text" title={req.origen}>{req.origen}</span>
                            <svg className="h-5 w-5 flex-shrink-0 text-indigo-500 drop-shadow-lg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                            <span className="max-w-[140px] truncate font-black bg-gradient-to-r from-slate-900 to-slate-800 bg-clip-text" title={req.destino}>{req.destino}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <span className="px-4 py-2 bg-gradient-to-r from-emerald-100/80 to-emerald-50/80 text-emerald-800 text-sm font-black rounded-2xl border border-emerald-200/60 shadow-md backdrop-blur-sm">
                            🚗 Transporte
                          </span>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <span className={`inline-flex items-center gap-2 rounded-2xl border-2 px-5 py-2.5 text-sm font-black capitalize shadow-xl transition-all backdrop-blur-xl ${getStatusStyle(req.estado)} hover:scale-105 hover:shadow-2xl`}>
                            {isCompleted(req.estado) && (
                              <div className="h-3 w-3 rounded-full bg-emerald-400 shadow-lg ring-2 ring-emerald-200/60 animate-ping [animation-duration:1.5s]" />
                            )}
                            {req.estado}
                          </span>
                        </td>
                      </tr>
                      {expandedId === req.id && expandedRequest && (
                        <tr key={`detail-${req.id}`} className="border-b-2 border-slate-200/50 bg-gradient-to-r from-slate-50/90 to-indigo-50/70">
                          <td colSpan={5} className="p-0">
                            <RequestDetail request={expandedRequest} onComplete={handleCompleteRequest} />
                          </td>
                        </tr>
                      )}
                    </>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {!loading && totalPages > 1 && (
            <div className="flex items-center justify-between border-t-2 border-slate-200/50 bg-gradient-to-r from-slate-50/90 to-indigo-50/60 px-8 py-6 backdrop-blur-xl shadow-inner">
              <p className="text-lg font-bold text-slate-700">
                Página <span className="text-2xl text-indigo-700">{page}</span> de <span className="text-2xl text-indigo-700">{totalPages}</span>
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="group disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2.5 rounded-3xl border-2 border-slate-200/60 bg-white/90 px-6 py-3.5 text-lg font-black text-slate-800 shadow-xl backdrop-blur-xl hover:bg-gradient-to-r hover:from-slate-50 hover:to-indigo-50 hover:border-indigo-300/70 hover:shadow-2xl hover:shadow-indigo-200/30 hover:translate-y-0.5 hover:scale-[1.02] transition-all duration-300 disabled:hover:scale-100"
                >
                  <svg className="h-5 w-5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                  Anterior
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="group disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2.5 rounded-3xl border-2 border-slate-200/60 bg-white/90 px-6 py-3.5 text-lg font-black text-slate-800 shadow-xl backdrop-blur-xl hover:bg-gradient-to-r hover:from-slate-50 hover:to-indigo-50 hover:border-indigo-300/70 hover:shadow-2xl hover:shadow-indigo-200/30 hover:translate-y-0.5 hover:scale-[1.02] transition-all duration-300 disabled:hover:scale-100"
                >
                  Siguiente
                  <svg className="h-5 w-5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Paginación móvil FLOWUBER */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between sm:hidden p-4 bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200/60">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="group disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2.5 rounded-3xl border-2 border-slate-200/60 bg-white/90 px-6 py-4 text-lg font-bold text-slate-800 shadow-xl backdrop-blur-xl hover:bg-gradient-to-r hover:from-slate-50 hover:to-indigo-50 hover:border-indigo-300/70 hover:shadow-2xl hover:shadow-indigo-200/30 hover:translate-y-0.5 hover:scale-[1.02] transition-all duration-300"
            >
              <svg className="h-5 w-5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Anterior
            </button>
            <span className="text-xl font-black text-slate-800 bg-gradient-to-r from-slate-800 to-indigo-800 bg-clip-text">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="group disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2.5 rounded-3xl border-2 border-slate-200/60 bg-white/90 px-6 py-4 text-lg font-bold text-slate-800 shadow-xl backdrop-blur-xl hover:bg-gradient-to-r hover:from-slate-50 hover:to-indigo-50 hover:border-indigo-300/70 hover:shadow-2xl hover:shadow-indigo-200/30 hover:translate-y-0.5 hover:scale-[1.02] transition-all duration-300"
            >
              Siguiente
              <svg className="h-5 w-5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}

        <footer className="py-8 text-center">
          <p className="text-sm font-bold text-slate-500 bg-slate-100/60 px-6 py-3 inline-block rounded-2xl backdrop-blur-xl border border-slate-200/50 shadow-lg">
            © 2026 Sistema de Transporte Institucional 
          </p>
        </footer>
      </div>
    </div>
  );
}
