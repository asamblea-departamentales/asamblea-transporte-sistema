import { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import { createRequest } from "../../services/requests.service";

type VehiculoId = "sedan" | "microbus" | "camion";

type DestinationPoint = {
  id: string;
  address: string;
  lat?: number;
  lng?: number;
};

type WizardData = {
  tipoVehiculo?: VehiculoId;
  fecha?: string;
  hora?: string;
  encargado?: string;
  subencargado?: string;
  pasajeros?: string;
  origen?: string;
  origenLat?: number;
  origenLng?: number;
  destinos?: DestinationPoint[];
};

const STORAGE_KEY = "solicitud_transporte";
const NOMINATIM_EMAIL = "app@transporte.institucional.sv";

const VEHICULO_LABELS: Record<VehiculoId, string> = {
  sedan:    "Sedán",
  microbus: "Microbús",
  camion:   "Camión (Carga)",
};

function safeParse(json: string | null): any {
  try {
    return json ? JSON.parse(json) : {};
  } catch {
    return {};
  }
}

type RouteInfo = {
  distance: number;
  duration: number;
  isReal: boolean;
};

async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&countrycodes=sv&limit=1&email=${NOMINATIM_EMAIL}`,
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

async function getOSRMRoute(points: { lat: number; lng: number }[]): Promise<{
  distanceKm: number;
  durationMin: number;
  geometry: [number, number][];
} | null> {
  if (points.length < 2) return null;
  try {
    const coords = points.map((p) => `${p.lng},${p.lat}`).join(";");
    const res = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`,
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

export default function TransportStep3Page() {
  const navigate = useNavigate();

  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const routeLayerRef = useRef<L.Polyline | null>(null);

  const [data, setData] = useState<WizardData>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ open: boolean; solicitudId?: string }>({ open: false });
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);

  const originIcon = L.icon({
    iconUrl:
      "data:image/svg+xml;base64," +
      btoa(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#4F46E5" width="32" height="32"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>`),
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });

  const destinationIcon = L.icon({
    iconUrl:
      "data:image/svg+xml;base64," +
      btoa(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#DC2626" width="32" height="32"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>`),
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });

  useEffect(() => {
    const saved = safeParse(localStorage.getItem(STORAGE_KEY)) as WizardData;
    const hasBasics =
      !!saved.tipoVehiculo &&
      !!saved.fecha &&
      !!saved.hora &&
      !!saved.encargado &&
      !!saved.pasajeros &&
      !!saved.origen &&
      Array.isArray(saved.destinos) &&
      saved.destinos.length > 0 &&
      !!saved.destinos[0]?.address?.trim();

    if (!hasBasics) {
      navigate("/solicitudes/transporte/paso-1", { replace: true });
      return;
    }
    setData(saved);
    setLoading(false);
  }, [navigate]);

  useEffect(() => {
    if (loading) return;
    if (!mapRef.current) {
      const map = L.map("map-resumen", {
        zoomControl: true,
        dragging: true,
        scrollWheelZoom: false,
      }).setView([13.7942, -88.8965], 9);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      mapRef.current = map;
    }
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [loading]);

  useEffect(() => {
    if (!mapRef.current || !data.origen) return;

    async function renderMap() {
      setIsLoadingRoute(true);

      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      if (routeLayerRef.current) {
        routeLayerRef.current.remove();
        routeLayerRef.current = null;
      }

      const bounds: [number, number][] = [];

      let origenCoords: { lat: number; lng: number } | null = null;
      if (data.origenLat && data.origenLng) {
        origenCoords = { lat: data.origenLat, lng: data.origenLng };
      } else if (data.origen) {
        origenCoords = await geocodeAddress(data.origen);
      }

      if (origenCoords) {
        const m = L.marker([origenCoords.lat, origenCoords.lng], { icon: originIcon })
          .addTo(mapRef.current!)
          .bindPopup(`<b>Origen:</b><br>${data.origen}`);
        markersRef.current.push(m);
        bounds.push([origenCoords.lat, origenCoords.lng]);
      }

      const destinosCoords: { address: string; lat: number; lng: number }[] = [];
      for (const [idx, dest] of (data.destinos || []).entries()) {
        if (!dest.address?.trim()) continue;
        let coords: { lat: number; lng: number } | null = null;
        if (dest.lat && dest.lng) {
          coords = { lat: dest.lat, lng: dest.lng };
        } else {
          coords = await geocodeAddress(dest.address);
        }
        if (coords) {
          destinosCoords.push({ address: dest.address, ...coords });
          const m = L.marker([coords.lat, coords.lng], { icon: destinationIcon })
            .addTo(mapRef.current!)
            .bindPopup(`<b>Destino ${idx + 1}:</b><br>${dest.address}`);
          markersRef.current.push(m);
          bounds.push([coords.lat, coords.lng]);
        }
      }

      if (origenCoords && destinosCoords.length > 0) {
        const allPoints = [origenCoords, ...destinosCoords];
        const osrm = await getOSRMRoute(allPoints);

        if (osrm && osrm.geometry.length > 0) {
          routeLayerRef.current = L.polyline(osrm.geometry, {
            color: "#4F46E5",
            weight: 5,
            opacity: 0.85,
          }).addTo(mapRef.current!);

          setRouteInfo({
            distance: osrm.distanceKm,
            duration: osrm.durationMin,
            isReal: true,
          });
        } else {
          const routePoints: L.LatLngExpression[] = allPoints.map(
            (p) => [p.lat, p.lng] as L.LatLngExpression
          );
          routeLayerRef.current = L.polyline(routePoints, {
            color: "#4F46E5",
            weight: 4,
            opacity: 0.7,
            dashArray: "10, 10",
          }).addTo(mapRef.current!);

          let totalKm = 0;
          let prev = origenCoords;
          destinosCoords.forEach((d) => {
            totalKm += haversineKm(prev.lat, prev.lng, d.lat, d.lng);
            prev = d;
          });

          if (totalKm > 0) {
            setRouteInfo({ distance: totalKm, duration: (totalKm / 45) * 60, isReal: false });
          }
        }
      }

      if (bounds.length > 0) {
        mapRef.current!.fitBounds(bounds as L.LatLngBoundsExpression, { padding: [50, 50] });
      }

      setIsLoadingRoute(false);
    }

    renderMap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const destinosValidos = useMemo(() => {
    return (data.destinos || []).filter((d) => d.address?.trim());
  }, [data.destinos]);

  const mainDestino = destinosValidos[0]?.address || "";
  const extraDestinos = destinosValidos.slice(1);

  function handleBack() {
    navigate("/solicitudes/transporte/paso-2");
  }

  async function handleSubmit() {
    setErrorMsg(null);
    setSubmitting(true);
    try {
      const rawDestinos = data.destinos || [];
      const destinosVal = rawDestinos.filter((d) => d.address?.trim());
      const destinoPrincipal =
        destinosVal.length > 0 ? destinosVal[0].address : "Destino pendiente de asignar";
      const destinosExtras = destinosVal.slice(1).map((d) => d.address.trim()).join(" - ");

      let infoExtra = `Encargado: ${data.encargado}`;
      if (data.subencargado) infoExtra += ` / Sub: ${data.subencargado}`;
      if (destinosExtras.length > 0) infoExtra += ` / Ruta Extra: ${destinosExtras}`;
      const motivoFinal = `Actividad de transporte. ${infoExtra}`;

      const fechaStr = data.fecha || new Date().toISOString().split("T")[0];
      const horaStr = data.hora || "08:00";
      const horaFinal = horaStr.length === 5 ? `${horaStr}:00` : horaStr;

      const resp = await createRequest({
        destino_principal:      destinoPrincipal,
        encargado:              data.encargado || "Sin encargado",
        tipo_vehiculo:          data.tipoVehiculo || "sedan",
        fecha_salida:           `${fechaStr}T${horaFinal}`,
        hora_salida:            horaStr,
        fecha_retorno:          `${fechaStr}T23:59:59`,
        destino_adicional:      destinosExtras.length > 0 ? destinosExtras : null,
        motivo_actividad:       motivoFinal,
        cantidad_personas:      parseInt(data.pasajeros || "1"),
        origen:                 data.origen || "Sin origen",
        subencargado:           data.subencargado,
        unidad_solicitante_id:  1,
        prioridad:              "media",
      });

      localStorage.removeItem(STORAGE_KEY);
      // ✅ FIX: convert solicitudId to string to satisfy type `string | undefined`
      setSuccess({ open: true, solicitudId: resp.solicitudId?.toString() });
    } catch (e: any) {
      setErrorMsg(e?.message || "Ocurrió un error al enviar la solicitud.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSubmitting(false);
    }
  }

  function closeModal() {
    setSuccess({ open: false, solicitudId: success.solicitudId });
  }

  function goHome() {
    closeModal();
    navigate("/");
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background-light px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="h-4 w-40 animate-pulse rounded bg-slate-200" />
            <div className="mt-5 h-2 w-full animate-pulse rounded bg-slate-100" />
            <div className="mt-8 grid gap-4 lg:grid-cols-2">
              <div className="h-48 animate-pulse rounded-3xl bg-slate-100" />
              <div className="h-48 animate-pulse rounded-3xl bg-slate-100" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-7">

        {/* PROGRESO */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="p-6 sm:p-7">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-base font-bold text-slate-900">Progreso de la Solicitud</h3>
              <span className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 ring-1 ring-indigo-100">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-600" />
                Paso 3 de 3
              </span>
            </div>
            <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div className="h-full w-full rounded-full bg-indigo-600" />
            </div>
            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="text-slate-600">
                Actual: <span className="font-semibold text-indigo-700">Confirmación</span>
              </span>
              <span className="italic text-slate-400">Listo para enviar</span>
            </div>
          </div>
        </div>

        {/* TITULO */}
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-[34px]">
            Confirmación de Solicitud
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-slate-600">
            Verifique la información antes de enviar. Si algo está incorrecto,
            regrese al paso anterior.
          </p>
        </div>

        {/* ERROR */}
        {errorMsg && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            <div className="flex items-start gap-3">
              <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p className="font-bold text-red-900">No se pudo enviar</p>
                <p className="mt-0.5">{errorMsg}</p>
              </div>
            </div>
          </div>
        )}

        {/* LAYOUT */}
        <div className="grid gap-6 lg:grid-cols-5">

          {/* RESUMEN */}
          <div className="lg:col-span-3">
            <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="p-6 sm:p-8 space-y-8">

                <section className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-xs font-extrabold tracking-wider text-slate-500">DATOS DEL VIAJE</p>
                  <div className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                    <p className="text-slate-700 sm:col-span-2">
                      <span className="font-semibold text-slate-900">Tipo de vehículo:</span>{" "}
                      {data.tipoVehiculo ? VEHICULO_LABELS[data.tipoVehiculo] : "—"}
                    </p>
                    <p className="text-slate-700">
                      <span className="font-semibold text-slate-900">Fecha:</span> {data.fecha}
                    </p>
                    <p className="text-slate-700">
                      <span className="font-semibold text-slate-900">Hora:</span> {data.hora}
                    </p>
                    <p className="text-slate-700">
                      <span className="font-semibold text-slate-900">Pasajeros:</span> {data.pasajeros}
                    </p>
                  </div>
                </section>

                <section className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-xs font-extrabold tracking-wider text-slate-500">ENCARGADOS</p>
                  <div className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                    <p className="text-slate-700">
                      <span className="font-semibold text-slate-900">Encargado:</span> {data.encargado}
                    </p>
                    <p className="text-slate-700">
                      <span className="font-semibold text-slate-900">Subencargado:</span>{" "}
                      {data.subencargado?.trim() ? data.subencargado : "—"}
                    </p>
                  </div>
                </section>

                <section className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-xs font-extrabold tracking-wider text-slate-500">RUTA</p>
                  <div className="mt-4 space-y-2 text-sm text-slate-700">
                    <p>
                      <span className="font-semibold text-slate-900">Origen:</span> {data.origen}
                    </p>
                    <p>
                      <span className="font-semibold text-slate-900">Destino 1:</span> {mainDestino}
                    </p>
                    {extraDestinos.length > 0 && (
                      <div className="pt-2">
                        <p className="mb-2 text-xs font-bold text-slate-500">DESTINOS ADICIONALES</p>
                        <ul className="space-y-2">
                          {extraDestinos.map((d, idx) => (
                            <li key={d.id} className="flex items-start gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3">
                              <span className="mt-0.5 inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-indigo-50 text-[11px] font-extrabold text-indigo-700 ring-1 ring-indigo-100">
                                {idx + 2}
                              </span>
                              <span className="text-slate-700">{d.address}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </section>

                {/* Acciones */}
                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    onClick={handleBack}
                    disabled={submitting}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Anterior
                  </button>

                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-primary/90 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {submitting ? (
                      <>
                        <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                        Enviando...
                      </>
                    ) : (
                      <>
                        Enviar solicitud
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* MAPA */}
          <div className="lg:col-span-2">
            <div className="sticky top-24 space-y-4">
              <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 px-6 py-4">
                  <h3 className="text-sm font-bold text-slate-900">Vista previa del mapa</h3>
                  <p className="mt-1 text-xs text-slate-500">
                    Ruta real por carretera con todos los puntos del viaje.
                  </p>
                </div>

                <div className="relative">
                  <div id="map-resumen" className="h-[500px] bg-slate-50" />
                  {isLoadingRoute && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-sm">
                      <div className="flex items-center gap-3 rounded-2xl bg-white px-5 py-3 shadow-md ring-1 ring-slate-200">
                        <svg className="h-5 w-5 animate-spin text-indigo-600" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                        <span className="text-sm font-semibold text-slate-700">Calculando ruta...</span>
                      </div>
                    </div>
                  )}
                </div>

                {routeInfo && !isLoadingRoute && (
                  <div className="border-t border-slate-200 bg-white px-6 py-4">
                    <div className="flex items-center gap-6 text-sm text-slate-700">
                      <div className="flex items-center gap-2">
                        <svg className="h-4 w-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                        </svg>
                        <span>
                          <span className="font-semibold">Distancia:</span>{" "}
                          {routeInfo.distance.toFixed(1)} km
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <svg className="h-4 w-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>
                          <span className="font-semibold">Tiempo aprox.:</span>{" "}
                          {Math.round(routeInfo.duration)} min
                        </span>
                      </div>
                    </div>
                    <p className="mt-1.5 text-xs text-slate-400">
                      {routeInfo.isReal
                        ? "* Ruta real por carretera. Sin considerar tráfico en tiempo real."
                        : "* Estimación en línea recta. Sin considerar tráfico en tiempo real."}
                    </p>
                  </div>
                )}

                <div className="border-t border-slate-200 bg-slate-50 px-6 py-4">
                  <div className="space-y-1.5 text-xs text-slate-600">
                    <p className="font-semibold text-slate-700">Resumen de ruta:</p>
                    <p><span className="font-semibold">📍 Origen:</span> {data.origen}</p>
                    <p><span className="font-semibold">🔴 Destino 1:</span> {mainDestino}</p>
                    {extraDestinos.map((d, idx) => (
                      <p key={d.id}>
                        <span className="font-semibold">🔴 Destino {idx + 2}:</span> {d.address}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <footer className="py-3 text-center text-xs text-slate-400">
          © 2026 Sistema de Transporte Institucional
        </footer>

        {/* MODAL ÉXITO */}
        {success.open && (
          <div className="fixed inset-0 z-50">
            <div className="absolute inset-0 bg-black/40" onClick={closeModal} />
            <div className="relative mx-auto mt-24 max-w-lg px-4 sm:px-6">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
                <div className="flex items-start gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-2xl bg-indigo-50 ring-1 ring-indigo-100">
                    <svg className="h-6 w-6 text-indigo-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-extrabold text-slate-900">Solicitud enviada</h3>
                    <p className="mt-1 text-sm text-slate-600">
                      Se registró correctamente la solicitud.
                      {success.solicitudId && (
                        <> ID: <span className="font-bold text-slate-900">{success.solicitudId}</span></>
                      )}
                    </p>
                  </div>
                </div>
                <div className="mt-6 flex justify-end gap-3">
                  <button
                    onClick={closeModal}
                    className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Cerrar
                  </button>
                  <button
                    onClick={goHome}
                    className="rounded-2xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-primary/90"
                  >
                    Ir a Inicio
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}