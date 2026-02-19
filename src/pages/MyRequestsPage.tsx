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
  pendiente: "bg-amber-100 text-amber-700 border-amber-200 hover:shadow-md",
  aprobada: "bg-emerald-100 text-emerald-700 border-emerald-200 hover:shadow-md",
  en_ejecucion: "bg-purple-100 text-purple-700 border-purple-200 hover:shadow-md",
  completada: "bg-slate-800 text-white border-slate-600 hover:shadow-md",
  finalizada: "bg-slate-800 text-white border-slate-600 hover:shadow-md",
  rechazada: "bg-red-100 text-red-700 border-red-200 hover:shadow-md",
  observada: "bg-blue-100 text-blue-700 border-blue-200 hover:shadow-md",
  borrador: "bg-gray-100 text-gray-600 border-gray-200 hover:shadow-md",
};

function getStatusStyle(status: string): string {
  return STATUS_STYLES[status.toLowerCase()] ?? "bg-gray-100 text-gray-600 border-gray-200 hover:shadow-md";
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

// ─── MAPA EN DETALLE ──────────────────────────────────────────────────────────
function RequestMap({ origen, destino }: { origen: string; destino: string }) {
  const mapId = useRef(`map-detail-${Math.random().toString(36).slice(2)}`);
  const mapRef = useRef<L.Map | null>(null);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [isLoadingMap, setIsLoadingMap] = useState(true);

  const originIcon = L.icon({
    iconUrl:
      "data:image/svg+xml;base64," +
      btoa(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#4F46E5" width="32" height="32"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>`),
    iconSize: [28, 28], iconAnchor: [14, 28], popupAnchor: [0, -28],
  });

  const destIcon = L.icon({
    iconUrl:
      "data:image/svg+xml;base64," +
      btoa(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#DC2626" width="32" height="32"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>`),
    iconSize: [28, 28], iconAnchor: [14, 28], popupAnchor: [0, -28],
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
          .bindPopup(`<b>Origen:</b><br>${origen}`);

        L.marker([destinoCoords.lat, destinoCoords.lng], { icon: destIcon })
          .addTo(map)
          .bindPopup(`<b>Destino:</b><br>${destino}`);

        const osrm = await getOSRMRoute([origenCoords, destinoCoords]);

        if (osrm && osrm.geometry.length > 0) {
          L.polyline(osrm.geometry, {
            color: "#4F46E5", weight: 5, opacity: 0.85,
          }).addTo(map);
          setRouteInfo({ distance: osrm.distanceKm, duration: osrm.durationMin, isReal: true });
        } else {
          L.polyline(
            [[origenCoords.lat, origenCoords.lng], [destinoCoords.lat, destinoCoords.lng]],
            { color: "#4F46E5", weight: 4, opacity: 0.7, dashArray: "10, 10" }
          ).addTo(map);
          const km = haversineKm(origenCoords.lat, origenCoords.lng, destinoCoords.lat, destinoCoords.lng);
          setRouteInfo({ distance: km, duration: (km / 45) * 60, isReal: false });
        }

        map.fitBounds([
          [origenCoords.lat, origenCoords.lng],
          [destinoCoords.lat, destinoCoords.lng],
        ] as L.LatLngBoundsExpression, { padding: [40, 40] });

        setIsLoadingMap(false);
      })();
    }, 100);

    return () => {
      clearTimeout(initTimeout);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return (
    <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 hover:shadow-lg transition-shadow">
      <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 hover:bg-slate-50">
        <p className="text-sm font-semibold text-slate-700">🗺️ Ruta en mapa</p>
      </div>

      <div className="relative">
        <div id={mapId.current} className="h-[280px] w-full bg-slate-100" />
        {isLoadingMap && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/90">
            <div className="flex items-center gap-3 rounded-xl bg-white px-6 py-3 shadow-lg border ring-1 ring-slate-200">
              <svg className="h-5 w-5 animate-spin text-indigo-600" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              <span className="font-semibold text-slate-700">Calculando ruta...</span>
            </div>
          </div>
        )}
      </div>

      {routeInfo && !isLoadingMap && (
        <div className="grid grid-cols-2 gap-4 border-t border-slate-200 bg-slate-50 px-4 py-3 text-sm">
          <div className="flex items-center gap-2 text-indigo-700 font-semibold">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            <span>{routeInfo.distance.toFixed(1)} km</span>
          </div>
          <div className="flex items-center gap-2 text-emerald-700 font-semibold">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{Math.round(routeInfo.duration)} min</span>
          </div>
          <div className="col-span-2 text-xs text-slate-500 pt-1">
            {routeInfo.isReal ? "Ruta real por carretera" : "Estimación en línea recta"}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── DETALLE EXPANDIDO ────────────────────────────────────────────────────────
function RequestDetail({
  request,
  onComplete,
}: {
  request: Request;
  onComplete: (id: number) => Promise<void>;
}) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleCompleteClick = async () => {
    if (!confirm("¿Confirmas que el viaje ha finalizado?")) return;
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
    <div className="border-t border-slate-200 bg-slate-50 p-4 sm:p-6">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
        
        {/* Cabecera */}
        <div className="mb-6 flex flex-col gap-4 border-b border-slate-100 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-lg font-bold text-slate-900">
            Detalle #{request.codigo}
          </h3>
          {puedeFinalizarse && (
            <button
              onClick={handleCompleteClick}
              disabled={isUpdating}
              className={`inline-flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-white shadow-lg transition-all sm:w-auto
                ${isUpdating
                  ? "cursor-not-allowed bg-slate-400"
                  : "bg-slate-900 hover:bg-black hover:shadow-xl hover:-translate-y-0.5 hover:ring-2 hover:ring-slate-200"
                }`}
            >
              {isUpdating ? (
                <>
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Procesando...
                </>
              ) : (
                <>
                  <svg className="h-4 w-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Finalizar Viaje
                </>
              )}
            </button>
          )}
        </div>

        {/* Info */}
        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-500">Ruta</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                <div className="mt-2 h-3 w-3 flex-shrink-0 rounded-full bg-emerald-500 ring-2 ring-emerald-100" />
                <div>
                  <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wide">Origen</span>
                  <span className="text-base font-semibold text-slate-900">{request.origen}</span>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                <div className="mt-2 h-3 w-3 flex-shrink-0 rounded-full bg-red-500 ring-2 ring-red-100" />
                <div>
                  <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wide">Destino</span>
                  <span className="text-base font-semibold text-slate-900">{request.destino}</span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-500">Datos Generales</h4>
            <div className="space-y-3">
              <div className="p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-slate-600">👥 Pasajeros</span>
                  <span className="text-2xl font-bold text-slate-900">{request.cantidad_personas}</span>
                </div>
              </div>
              <div className="p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                <div className="flex justify-between items-start">
                  <span className="font-semibold text-slate-600">📋 Motivo</span>
                  <span className="font-semibold text-slate-900">{request.motivo_actividad}</span>
                </div>
              </div>
              {request.unidad && (
                <div className="p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-slate-600">🚗 Unidad</span>
                    <span className="font-semibold text-slate-900">{request.unidad.nombre}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* MAPA */}
        {request.origen && request.destino && (
          <RequestMap origen={request.origen} destino={request.destino} />
        )}

        <div className="mt-6 pt-6 border-t border-slate-200 text-right">
          <p className="text-xs font-semibold text-slate-500">
            📅 Creado el {formatFecha(request.created_at)}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── SKELETONS ────────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="h-5 w-40 rounded-lg bg-slate-100" />
        <div className="h-6 w-24 rounded-full bg-slate-100" />
      </div>
      <div className="space-y-3">
        <div className="h-4 w-64 rounded-lg bg-slate-100" />
        <div className="h-4 w-48 rounded-lg bg-slate-100" />
        <div className="h-4 w-32 rounded-lg bg-slate-100" />
      </div>
    </div>
  );
}

function SkeletonRow() {
  return (
    <tr className="animate-pulse border-b border-slate-50 hover:bg-transparent">
      <td className="px-6 py-5"><div className="h-5 w-36 rounded-lg bg-slate-100" /></td>
      <td className="px-6 py-5"><div className="h-5 w-32 rounded-lg bg-slate-100" /></td>
      <td className="px-6 py-5"><div className="h-5 w-72 rounded-lg bg-slate-100" /></td>
      <td className="px-6 py-5"><div className="h-5 w-24 rounded-lg bg-slate-100" /></td>
      <td className="px-6 py-5"><div className="ml-auto h-8 w-28 rounded-full bg-slate-100" /></td>
    </tr>
  );
}

// ─── PÁGINA PRINCIPAL ─────────────────────────────────────────────────────────
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
    <div className="min-h-screen bg-slate-50/50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        
        {/* ENCABEZADO */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Historial de Solicitudes
            </h1>
            <p className="mt-2 text-sm font-semibold text-slate-600">
              {total > 0
                ? `${total.toLocaleString()} solicitud${total !== 1 ? "es" : ""} registradas`
                : "Sin solicitudes"}
            </p>
          </div>
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm hover:shadow-md hover:bg-slate-50 hover:-translate-y-0.5 transition-all"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Dashboard
          </button>
        </div>

        {/* FILTROS */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="relative mb-4">
            <svg className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Buscar por código, origen, destino..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-12 pr-4 text-sm font-semibold text-slate-900 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {ESTADOS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleEstadoChange(opt.value as RequestStatus | "")}
                className={`flex-shrink-0 rounded-full border-2 px-4 py-2 text-sm font-semibold transition-all hover:scale-105 hover:shadow-md hover:-translate-y-0.5
                  ${filters.estado === opt.value
                    ? "border-indigo-500 bg-indigo-600 text-white shadow-md"
                    : "border-slate-200 bg-white text-slate-700 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700"
                  }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── MÓVIL: tarjetas ──────────────────────────────────────── */}
        <div className="block sm:hidden space-y-3">
          {loading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : requests.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white px-8 py-16 text-center shadow-sm">
              <div className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-2xl bg-slate-100 border">
                <svg className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-lg font-semibold text-slate-900 mb-2">No hay solicitudes</p>
              <p className="text-sm text-slate-500">{emptyMessage}</p>
            </div>
          ) : (
            requests.map((req) => (
              <div key={req.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-all">
                <button
                  onClick={() => handleRowClick(req)}
                  className="flex w-full items-center justify-between p-6 text-left transition-all hover:bg-slate-50 hover:-translate-y-0.5"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-3 w-3 flex-shrink-0 rounded-full bg-indigo-500 ring-2 ring-indigo-100 shadow-md hover:scale-110 transition-transform" />
                    <div>
                      <p className="text-base font-bold text-slate-900">{req.codigo}</p>
                      <p className="text-sm text-slate-600">{formatFechaCorta(req.fecha_salida)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-bold capitalize shadow-sm transition-all ${getStatusStyle(req.estado)} hover:scale-105`}>
                      {isCompleted(req.estado) && (
                        <svg className="h-3 w-3 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                      {req.estado}
                    </span>
                    <svg
                      className={`h-5 w-5 text-slate-400 transition-transform hover:scale-110 ${expandedId === req.id ? "rotate-180" : ""}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>
                <div className="flex items-center gap-3 border-t border-slate-100 px-6 py-4 bg-slate-50">
                  <span className="max-w-[45%] truncate font-semibold text-slate-900">{req.origen}</span>
                  <svg className="h-4 w-4 flex-shrink-0 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                  <span className="max-w-[45%] truncate font-semibold text-slate-900">{req.destino}</span>
                </div>
                {expandedId === req.id && expandedRequest && (
                  <RequestDetail request={expandedRequest} onComplete={handleCompleteRequest} />
                )}
              </div>
            ))
          )}
        </div>

        {/* ── DESKTOP: tabla ───────────────────────────────────────── */}
        <div className="hidden sm:block rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-slate-200 bg-slate-50 text-left text-xs font-bold uppercase tracking-wider text-slate-600">
                  <th className="px-8 py-4">Código</th>
                  <th className="px-8 py-4">Fecha de Salida</th>
                  <th className="px-8 py-4">Origen → Destino</th>
                  <th className="px-8 py-4">Tipo</th>
                  <th className="px-8 py-4 text-right">Estado</th>
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
                    <td colSpan={5} className="px-8 py-20 text-center">
                      <div className="mx-auto flex max-w-sm flex-col items-center gap-4 p-8 rounded-2xl bg-slate-50 border border-slate-200">
                        <div className="grid h-16 w-16 place-items-center rounded-2xl bg-slate-100 border">
                          <svg className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <p className="text-lg font-semibold text-slate-900">No hay solicitudes</p>
                        <p className="text-sm text-slate-500">{emptyMessage}</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  requests.map((req) => (
                    <>
                      <tr
                        key={req.id}
                        onClick={() => handleRowClick(req)}
                        className={`cursor-pointer border-b border-slate-100 transition-all hover:bg-slate-50 hover:shadow-sm ${expandedId === req.id ? "bg-slate-50 shadow-sm" : ""}`}
                      >
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-4">
                            <div className="h-3 w-3 rounded-full bg-indigo-500 ring-2 ring-indigo-100 shadow-md hover:scale-110 transition-transform" />
                            <span className="font-bold text-slate-900 text-lg">{req.codigo}</span>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <span className="text-sm font-semibold text-slate-700">{formatFechaCorta(req.fecha_salida)}</span>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-3 text-sm font-semibold text-slate-800">
                            <span className="max-w-[140px] truncate font-semibold" title={req.origen}>{req.origen}</span>
                            <svg className="h-4 w-4 flex-shrink-0 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                            <span className="max-w-[140px] truncate font-semibold" title={req.destino}>{req.destino}</span>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <span className="px-3 py-1.5 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full border border-emerald-200">
                            🚗 Transporte
                          </span>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <span className={`inline-flex items-center gap-1 rounded-full border px-4 py-1.5 text-xs font-bold capitalize shadow-sm transition-all ${getStatusStyle(req.estado)} hover:scale-105`}>
                            {isCompleted(req.estado) && (
                              <svg className="h-3 w-3 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                            {req.estado}
                          </span>
                        </td>
                      </tr>
                      {expandedId === req.id && expandedRequest && (
                        <tr key={`detail-${req.id}`} className="border-b border-slate-200">
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
            <div className="flex items-center justify-between border-t-2 border-slate-200 bg-slate-50 px-8 py-6">
              <p className="text-sm font-semibold text-slate-700">
                Página <span className="font-bold text-lg text-slate-900">{page}</span> de{" "}
                <span className="font-bold text-lg text-slate-900">{totalPages}</span>
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:shadow-md hover:bg-slate-50 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Anterior
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:shadow-md hover:bg-slate-50 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Siguiente
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Paginación móvil */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between sm:hidden p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm hover:shadow-md hover:bg-slate-50 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Anterior
            </button>
            <span className="text-lg font-bold text-slate-900">{page} / {totalPages}</span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm hover:shadow-md hover:bg-slate-50 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Siguiente
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}

        <footer className="py-6 text-center">
          <p className="text-sm text-slate-500">
            © 2026 Sistema de Transporte Institucional
          </p>
        </footer>
      </div>
    </div>
  );
}
