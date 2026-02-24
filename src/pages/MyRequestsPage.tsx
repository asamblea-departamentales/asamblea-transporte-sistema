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
  { value: "",             label: "Todos"        },
  { value: "pendiente",    label: "Pendiente"    },
  { value: "aprobada",     label: "Aprobada"     },
  { value: "en_ejecucion", label: "En Ejecución" },
  { value: "completada",   label: "Completada"   },
  { value: "finalizada",   label: "Finalizada"   },
  { value: "rechazada",    label: "Rechazada"    },
  { value: "observada",    label: "Observada"    },
  { value: "borrador",     label: "Borrador"     },
];

const STATUS_STYLES: Record<string, string> = {
  pendiente:    "bg-amber-100 text-amber-700 border-amber-200",
  aprobada:     "bg-emerald-100 text-emerald-700 border-emerald-200",
  en_ejecucion: "bg-purple-100 text-purple-700 border-purple-200",
  completada:   "bg-slate-800 text-white border-slate-600",
  finalizada:   "bg-slate-800 text-white border-slate-600",
  rechazada:    "bg-red-100 text-red-700 border-red-200",
  observada:    "bg-blue-100 text-blue-700 border-blue-200",
  borrador:     "bg-gray-100 text-gray-600 border-gray-200",
};

// Estados que muestran el bloque de asignación
const ESTADOS_CON_ASIGNACION = ["aprobada", "en_ejecucion", "completada", "finalizada"];

function getStatusStyle(status: string): string {
  return STATUS_STYLES[status.toLowerCase()] ?? "bg-gray-100 text-gray-600 border-gray-200";
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
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
      <div className="border-b border-slate-200 bg-slate-50 px-4 py-2.5">
        <p className="text-xs font-bold text-slate-600">🗺️ Ruta en mapa</p>
      </div>
      <div className="relative">
        <div id={mapId.current} className="h-[260px] w-full bg-slate-100" />
        {isLoadingMap && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm">
            <div className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 shadow ring-1 ring-slate-200">
              <svg className="h-4 w-4 animate-spin text-indigo-600" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              <span className="text-xs font-semibold text-slate-700">Calculando ruta...</span>
            </div>
          </div>
        )}
      </div>
      {routeInfo && !isLoadingMap && (
        <div className="flex flex-wrap items-center gap-4 border-t border-slate-200 bg-white px-4 py-3 text-xs text-slate-700">
          <div className="flex items-center gap-1.5">
            <svg className="h-3.5 w-3.5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            <span><span className="font-semibold">Distancia:</span> {routeInfo.distance.toFixed(1)} km</span>
          </div>
          <div className="flex items-center gap-1.5">
            <svg className="h-3.5 w-3.5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span><span className="font-semibold">Tiempo aprox.:</span> {Math.round(routeInfo.duration)} min</span>
          </div>
          <span className="text-slate-400">
            {routeInfo.isReal ? "Ruta real por carretera" : "Estimación en línea recta"}
          </span>
        </div>
      )}
    </div>
  );
}

// ─── BLOQUE DE ASIGNACIÓN (vehículo + motorista) ──────────────────────────────

function AsignacionBloque({ request }: { request: Request }) {
  const [imgError, setImgError] = useState(false);

  const vehiculo = request.vehiculo;
  const motorista = request.motorista;

  return (
    <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4">
      {/* Encabezado */}
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500">
          <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-xs font-black uppercase tracking-wider text-emerald-700">
          Asignación confirmada
        </p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">

        {/* ── Imagen del vehículo ── */}
        <div className="flex-shrink-0">
          {vehiculo?.imagen_url && !imgError ? (
            <img
              src={vehiculo.imagen_url}
              alt={`${vehiculo.marca} ${vehiculo.modelo}`}
              onError={() => setImgError(true)}
              className="h-32 w-full rounded-xl object-cover shadow ring-2 ring-white sm:h-24 sm:w-44"
            />
          ) : (
            <div className="flex h-32 w-full items-center justify-center rounded-xl bg-slate-100 shadow-inner ring-2 ring-white sm:h-24 sm:w-44">
              <svg className="h-10 w-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M19 9l-1-4H6L5 9M3 9h18v2a2 2 0 01-2 2H5a2 2 0 01-2-2V9zM7 15h2v2H7v-2zm8 0h2v2h-2v-2z"
                />
              </svg>
            </div>
          )}
        </div>

        {/* ── Datos vehículo y motorista ── */}
        <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:gap-5">

          {/* Vehículo */}
          <div className="flex-1">
            <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-600">
              Vehículo asignado
            </p>
            {vehiculo ? (
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-900">
                  {vehiculo.marca} {vehiculo.modelo}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {/* Placa */}
                  <span className="inline-flex items-center gap-1 rounded-md bg-white px-2 py-0.5 text-xs font-bold text-slate-700 shadow-sm ring-1 ring-slate-200">
                    <svg className="h-3 w-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                      />
                    </svg>
                    {vehiculo.placa}
                  </span>
                  {/* Tipo */}
                  {vehiculo.tipo && (
                    <span className="inline-flex items-center rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                      {vehiculo.tipo}
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-sm italic text-slate-400">Sin vehículo asignado</p>
            )}
          </div>

          {/* Divisor solo en sm+ */}
          <div className="hidden w-px self-stretch bg-emerald-100 sm:block" />
          {/* Divisor solo en móvil */}
          <div className="h-px w-full bg-emerald-100 sm:hidden" />

          {/* Motorista */}
          <div className="flex-1">
            <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-600">
              Motorista asignado
            </p>
            {motorista ? (
              <div className="flex items-center gap-3">
                {/* Avatar inicial */}
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white shadow">
                  {motorista.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">{motorista.name}</p>
                  {motorista.telefono ? (
                    <a
                      href={`tel:${motorista.telefono}`}
                      className="flex items-center gap-1 text-xs font-medium text-emerald-600 hover:underline"
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
  const mostrarAsignacion = ESTADOS_CON_ASIGNACION.includes(request.estado?.toLowerCase());

  return (
    <div className="border-t border-slate-200 bg-slate-50 p-3 sm:p-6">
      <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm space-y-5">

        {/* ── Cabecera ── */}
        <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-base font-bold text-slate-800 sm:text-lg">
            Detalle #{request.codigo}
          </h3>
          {puedeFinalizarse && (
            <button
              onClick={handleCompleteClick}
              disabled={isUpdating}
              className={`inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold text-white shadow-md transition-all sm:w-auto
                ${isUpdating
                  ? "cursor-not-allowed bg-slate-400"
                  : "bg-slate-800 hover:-translate-y-0.5 hover:bg-black hover:shadow-lg"
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

        {/* ── Bloque vehículo + motorista (solo si está aprobada o más) ── */}
        {mostrarAsignacion && <AsignacionBloque request={request} />}

        {/* ── Info general ── */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <h4 className="mb-2 text-xs font-black uppercase tracking-wider text-slate-500">Ruta</h4>
            <div className="flex flex-col gap-3">
              <div className="flex items-start gap-2">
                <div className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-green-500" />
                <div>
                  <span className="block text-xs text-slate-400">Origen</span>
                  <span className="text-sm font-medium text-slate-900">{request.origen}</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-red-500" />
                <div>
                  <span className="block text-xs text-slate-400">Destino</span>
                  <span className="text-sm font-medium text-slate-900">{request.destino}</span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="mb-2 text-xs font-black uppercase tracking-wider text-slate-500">Datos Generales</h4>
            <div className="space-y-1.5 text-sm">
              <p><span className="font-semibold text-slate-600">Pasajeros:</span> <span className="text-slate-900">{request.cantidad_personas}</span></p>
              <p><span className="font-semibold text-slate-600">Motivo:</span> <span className="text-slate-900">{request.motivo_actividad}</span></p>
              {request.unidad && (
                <p><span className="font-semibold text-slate-600">Unidad:</span> <span className="text-slate-900">{request.unidad.nombre}</span></p>
              )}
            </div>
          </div>
        </div>

        {/* ── Mapa ── */}
        {request.origen && request.destino && (
          <RequestMap origen={request.origen} destino={request.destino} />
        )}

        <div className="text-right text-xs text-slate-400">
          Creado el {formatFecha(request.created_at)}
        </div>
      </div>
    </div>
  );
}

// ─── SKELETONS ────────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-xl border border-slate-100 bg-white p-4">
      <div className="flex items-center justify-between">
        <div className="h-4 w-32 rounded bg-slate-100" />
        <div className="h-5 w-20 rounded-full bg-slate-100" />
      </div>
      <div className="mt-3 h-3 w-48 rounded bg-slate-100" />
      <div className="mt-2 h-3 w-36 rounded bg-slate-100" />
    </div>
  );
}

function SkeletonRow() {
  return (
    <tr className="animate-pulse border-b border-slate-50">
      <td className="px-6 py-4"><div className="h-4 w-32 rounded bg-slate-100" /></td>
      <td className="px-6 py-4"><div className="h-4 w-28 rounded bg-slate-100" /></td>
      <td className="px-6 py-4"><div className="h-4 w-40 rounded bg-slate-100" /></td>
      <td className="px-6 py-4"><div className="h-4 w-20 rounded bg-slate-100" /></td>
      <td className="px-6 py-4"><div className="ml-auto h-6 w-24 rounded-full bg-slate-100" /></td>
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
    <div className="min-h-screen bg-background-light px-3 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-5">

        {/* ENCABEZADO */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-[34px]">
              Historial de Solicitudes
            </h1>
            <p className="mt-0.5 text-sm text-slate-500">
              {total > 0
                ? `${total} solicitud${total !== 1 ? "es" : ""} registradas`
                : "Sin solicitudes"}
            </p>
          </div>
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 self-start rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 sm:self-auto"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Dashboard
          </button>
        </div>

        {/* FILTROS */}
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm sm:px-5">
          <div className="relative mb-3">
            <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Buscar por código, origen, destino..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-4 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {ESTADOS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleEstadoChange(opt.value as RequestStatus | "")}
                className={`flex-shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition
                  ${filters.estado === opt.value
                    ? "border-indigo-500 bg-indigo-600 text-white shadow-sm"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── MÓVIL: tarjetas ── */}
        <div className="block sm:hidden space-y-2">
          {loading ? (
            <><SkeletonCard /><SkeletonCard /><SkeletonCard /></>
          ) : requests.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white px-6 py-14 text-center shadow-sm">
              <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-slate-100">
                <svg className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-slate-700">No hay solicitudes</p>
              <p className="mt-1 text-xs text-slate-500">{emptyMessage}</p>
            </div>
          ) : (
            requests.map((req) => (
              <div key={req.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <button
                  onClick={() => handleRowClick(req)}
                  className="flex w-full items-center justify-between px-4 py-3.5 text-left transition hover:bg-slate-50"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="h-2.5 w-2.5 flex-shrink-0 rounded-full bg-indigo-500 ring-2 ring-indigo-100" />
                    <div>
                      <p className="text-sm font-bold text-slate-900">{req.codigo}</p>
                      <p className="text-xs text-slate-500">{formatFechaCorta(req.fecha_salida)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold capitalize ${getStatusStyle(req.estado)}`}>
                      {isCompleted(req.estado) && (
                        <svg className="mr-1 h-3 w-3 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                      {req.estado}
                    </span>
                    <svg
                      className={`h-4 w-4 flex-shrink-0 text-slate-400 transition-transform ${expandedId === req.id ? "rotate-180" : ""}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>
                <div className="flex items-center gap-1.5 border-t border-slate-100 px-4 py-2.5 text-xs text-slate-600">
                  <span className="max-w-[120px] truncate">{req.origen}</span>
                  <svg className="h-3 w-3 flex-shrink-0 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                  <span className="max-w-[120px] truncate">{req.destino}</span>
                </div>
                {expandedId === req.id && expandedRequest && (
                  <RequestDetail request={expandedRequest} onComplete={handleCompleteRequest} />
                )}
              </div>
            ))
          )}
        </div>

        {/* ── DESKTOP: tabla ── */}
        <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm sm:block">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="px-6 py-4">Código</th>
                  <th className="px-6 py-4">Fecha de Salida</th>
                  <th className="px-6 py-4">Origen → Destino</th>
                  <th className="px-6 py-4">Tipo</th>
                  <th className="px-6 py-4 text-right">Estado</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <><SkeletonRow /><SkeletonRow /><SkeletonRow /><SkeletonRow /><SkeletonRow /></>
                ) : requests.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center">
                      <div className="mx-auto flex max-w-xs flex-col items-center gap-3">
                        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 ring-1 ring-slate-200">
                          <svg className="h-7 w-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <p className="text-sm font-semibold text-slate-700">No hay solicitudes</p>
                        <p className="text-xs text-slate-500">{emptyMessage}</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  requests.map((req) => (
                    <>
                      <tr
                        key={req.id}
                        onClick={() => handleRowClick(req)}
                        className={`cursor-pointer border-b border-slate-50 transition-all hover:bg-slate-50 ${expandedId === req.id ? "bg-slate-50" : ""}`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-2.5 w-2.5 rounded-full bg-indigo-500 ring-2 ring-indigo-100" />
                            <span className="font-bold text-slate-900">{req.codigo}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-medium text-slate-600">{formatFechaCorta(req.fecha_salida)}</span>
                        </td>
                        <td className="px-6 py-4 max-w-[280px]">
                          <div className="flex items-center gap-1.5 text-sm text-slate-700">
                            <span className="max-w-[120px] truncate font-medium" title={req.origen}>{req.origen}</span>
                            <svg className="h-3.5 w-3.5 flex-shrink-0 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                            <span className="max-w-[120px] truncate font-medium" title={req.destino}>{req.destino}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-bold text-slate-900">Transporte</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold capitalize ${getStatusStyle(req.estado)}`}>
                            {isCompleted(req.estado) && (
                              <svg className="mr-1 h-3 w-3 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                            {req.estado}
                          </span>
                        </td>
                      </tr>
                      {expandedId === req.id && expandedRequest && (
                        <tr key={`detail-${req.id}`} className="border-b border-slate-100">
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
            <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-6 py-4">
              <p className="text-sm text-slate-500">
                Página <span className="font-semibold text-slate-800">{page}</span> de{" "}
                <span className="font-semibold text-slate-800">{totalPages}</span>
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Anterior
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
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
          <div className="flex items-center justify-between sm:hidden">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Anterior
            </button>
            <span className="text-sm text-slate-500">{page} / {totalPages}</span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Siguiente
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}

        <footer className="py-3 text-center text-xs text-slate-400">
          © 2026 Sistema de Transporte Institucional
        </footer>
      </div>
    </div>
  );
}