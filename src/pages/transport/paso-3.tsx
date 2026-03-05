// src/pages/transport/paso-3.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import { createRequest } from "../../services/requests.service";
import SuccessScreen from "../../components/transport/SuccessScreen";

// ─── Tipos ─────────────────────────────────────────────────────────────────────

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

// ─── Helpers ───────────────────────────────────────────────────────────────────

const STORAGE_KEY = "solicitud_transporte";
const NOMINATIM_EMAIL = "app@transporte.institucional.sv";

const VEHICULO_LABELS: Record<VehiculoId, string> = {
  sedan:    "Sedán",
  microbus: "Microbús",
  camion:   "Camión (Carga)",
};

function safeParse(json: string | null): WizardData {
  try { return json ? JSON.parse(json) : {}; } catch { return {}; }
}

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function makeIcon(color: string) {
  return L.icon({
    iconUrl: "data:image/svg+xml;base64," + btoa(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" width="32" height="32"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>`),
    iconSize: [32, 32], iconAnchor: [16, 32], popupAnchor: [0, -32],
  });
}

async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&countrycodes=sv&limit=1&email=${NOMINATIM_EMAIL}`,
      { headers: { "Accept-Language": "es" } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data?.length > 0 ? { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) } : null;
  } catch { return null; }
}

async function getOSRMRoute(points: { lat: number; lng: number }[]): Promise<{
  distanceKm: number; durationMin: number; geometry: [number, number][];
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
    const geometry: [number, number][] = (route.geometry?.coordinates ?? []).map(([lng, lat]: [number, number]) => [lat, lng]);
    return { distanceKm: route.distance / 1000, durationMin: route.duration / 60, geometry };
  } catch { return null; }
}

// ─── PÁGINA ────────────────────────────────────────────────────────────────────

export default function TransportStep3Page() {
  const navigate = useNavigate();

  const mapRef        = useRef<L.Map | null>(null);
  const markersRef    = useRef<L.Marker[]>([]);
  const routeLayerRef = useRef<L.Polyline | null>(null);
  const submittedRef  = useRef(false);

  const [wizardData,    setWizardData]    = useState<WizardData>({});
  const [loading,       setLoading]       = useState(true);
  const [submitting,    setSubmitting]    = useState(false);
  const [errorMsg,      setErrorMsg]      = useState<string | null>(null);
  const [routeInfo,     setRouteInfo]     = useState<{ distance: number; duration: number; isReal: boolean } | null>(null);
  const [isLoadingRoute,setIsLoadingRoute]= useState(false);
  const [successId,     setSuccessId]     = useState<string | undefined>(undefined);
  const [showSuccess,   setShowSuccess]   = useState(false);

  // ── Cargar storage ──────────────────────────────────────────────────────────
  useEffect(() => {
    const saved = safeParse(localStorage.getItem(STORAGE_KEY));
    const ok = !!saved.tipoVehiculo && !!saved.fecha && !!saved.hora && !!saved.encargado
              && !!saved.pasajeros && !!saved.origen
              && Array.isArray(saved.destinos) && !!saved.destinos[0]?.address?.trim();
    if (!ok) { navigate("/solicitudes/transporte/paso-1", { replace: true }); return; }
    setWizardData(saved);
    setLoading(false);
  }, [navigate]);

  // ── Mapa ────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (loading) return;
    if (!mapRef.current) {
      const map = L.map("map-resumen", { zoomControl: true, dragging: true, scrollWheelZoom: false })
        .setView([13.7942, -88.8965], 9);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);
      mapRef.current = map;
    }
    return () => { mapRef.current?.remove(); mapRef.current = null; };
  }, [loading]);

  // ── Render marcadores + ruta ────────────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current || !wizardData.origen) return;

    async function renderMap() {
      setIsLoadingRoute(true);
      markersRef.current.forEach((m) => m.remove()); markersRef.current = [];
      routeLayerRef.current?.remove(); routeLayerRef.current = null;

      const bounds: [number, number][] = [];

      let origenCoords: { lat: number; lng: number } | null = null;
      if (wizardData.origenLat && wizardData.origenLng) {
        origenCoords = { lat: wizardData.origenLat, lng: wizardData.origenLng };
      } else if (wizardData.origen) {
        origenCoords = await geocodeAddress(wizardData.origen);
      }

      if (origenCoords) {
        const m = L.marker([origenCoords.lat, origenCoords.lng], { icon: makeIcon("#4F46E5") })
          .addTo(mapRef.current!).bindPopup(`<b>Origen:</b><br>${wizardData.origen}`);
        markersRef.current.push(m);
        bounds.push([origenCoords.lat, origenCoords.lng]);
      }

      const destinosCoords: { address: string; lat: number; lng: number }[] = [];
      for (const [idx, dest] of (wizardData.destinos || []).entries()) {
        if (!dest.address?.trim()) continue;
        const coords = dest.lat && dest.lng ? { lat: dest.lat, lng: dest.lng } : await geocodeAddress(dest.address);
        if (coords) {
          destinosCoords.push({ address: dest.address, ...coords });
          const m = L.marker([coords.lat, coords.lng], { icon: makeIcon("#DC2626") })
            .addTo(mapRef.current!).bindPopup(`<b>Destino ${idx + 1}:</b><br>${dest.address}`);
          markersRef.current.push(m);
          bounds.push([coords.lat, coords.lng]);
        }
      }

      if (origenCoords && destinosCoords.length > 0) {
        const allPoints = [origenCoords, ...destinosCoords];
        const osrm = await getOSRMRoute(allPoints);

        if (osrm?.geometry?.length) {
          routeLayerRef.current = L.polyline(osrm.geometry, { color: "#4F46E5", weight: 5, opacity: 0.85 }).addTo(mapRef.current!);
          setRouteInfo({ distance: osrm.distanceKm, duration: osrm.durationMin, isReal: true });
        } else {
          const pts: L.LatLngExpression[] = allPoints.map((p) => [p.lat, p.lng]);
          routeLayerRef.current = L.polyline(pts, { color: "#4F46E5", weight: 4, opacity: 0.7, dashArray: "10,10" }).addTo(mapRef.current!);
          let km = 0, prev = origenCoords;
          destinosCoords.forEach((d) => { km += haversineKm(prev.lat, prev.lng, d.lat, d.lng); prev = d; });
          if (km > 0) setRouteInfo({ distance: km, duration: (km / 45) * 60, isReal: false });
        }
      }

      if (bounds.length > 0) mapRef.current!.fitBounds(bounds as L.LatLngBoundsExpression, { padding: [50, 50] });
      setIsLoadingRoute(false);
    }

    renderMap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wizardData]);

  const destinosValidos = useMemo(() => (wizardData.destinos || []).filter((d) => d.address?.trim()), [wizardData.destinos]);
  const mainDestino     = destinosValidos[0]?.address || "";
  const extraDestinos   = destinosValidos.slice(1);

  // ── Submit ──────────────────────────────────────────────────────────────────
  async function handleSubmit() {
    if (submittedRef.current || submitting) return;
    submittedRef.current = true;
    setErrorMsg(null);
    setSubmitting(true);
    try {
      const destinosVal     = (wizardData.destinos || []).filter((d) => d.address?.trim());
      const destinoPrincipal = destinosVal[0]?.address || "Destino pendiente";
      const destinosExtras  = destinosVal.slice(1).map((d) => d.address.trim()).join(" - ");

      let infoExtra = `Encargado: ${wizardData.encargado}`;
      if (wizardData.subencargado) infoExtra += ` / Sub: ${wizardData.subencargado}`;
      if (destinosExtras) infoExtra += ` / Ruta Extra: ${destinosExtras}`;

      const fechaStr = wizardData.fecha || new Date().toISOString().split("T")[0];
      const horaStr  = wizardData.hora || "08:00";
      const horaFinal = horaStr.length === 5 ? `${horaStr}:00` : horaStr;

      const resp = await createRequest({
        destino_principal:     destinoPrincipal,
        encargado:             wizardData.encargado || "Sin encargado",
        tipo_vehiculo:         wizardData.tipoVehiculo || "sedan",
        fecha_salida:          `${fechaStr}T${horaFinal}`,
        hora_salida:           horaStr,
        fecha_retorno:         `${fechaStr}T23:59:59`,
        destino_adicional:     destinosExtras || null,
        motivo_actividad:      `Actividad de transporte. ${infoExtra}`,
        cantidad_personas:     parseInt(wizardData.pasajeros || "1"),
        origen:                wizardData.origen || "Sin origen",
        subencargado:          wizardData.subencargado,
        unidad_solicitante_id: 1,
        prioridad:             "media",
      });

      localStorage.removeItem(STORAGE_KEY);
      setSuccessId(resp.solicitudId?.toString());
      setShowSuccess(true);
    } catch (e: unknown) {
      submittedRef.current = false; // permite reintentar si hubo error
      setErrorMsg((e as Error)?.message || "Ocurrió un error al enviar la solicitud.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSubmitting(false);
    }
  }

  // ── Cancelar → siempre al dashboard ─────────────────────────────────────────
  function handleCancel() { navigate("/dashboard"); }

  // ── Loading skeleton ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="mx-auto max-w-7xl py-10">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="h-4 w-40 animate-pulse rounded bg-slate-200" />
          <div className="mt-5 h-2 w-full animate-pulse rounded bg-slate-100" />
          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            <div className="h-48 animate-pulse rounded-3xl bg-slate-100" />
            <div className="h-48 animate-pulse rounded-3xl bg-slate-100" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* ── Pantalla de éxito (full-screen overlay) ── */}
      {showSuccess && (
        <SuccessScreen
          solicitudId={successId}
        />
      )}

      <div className="mx-auto max-w-7xl space-y-7 pb-10">

        {/* Progreso */}
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm sm:px-7">
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
            <span className="text-slate-600">Actual: <span className="font-semibold text-indigo-700">Confirmación</span></span>
            <span className="italic text-slate-400">Listo para enviar</span>
          </div>
        </div>

        {/* Título */}
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-[34px]">
            Confirmación de Solicitud
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-slate-600">
            Verifique la información antes de enviar. Si algo está incorrecto, regrese al paso anterior.
          </p>
        </div>

        {/* Error */}
        {errorMsg && (
          <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="font-bold text-red-900">No se pudo enviar</p>
              <p className="mt-0.5">{errorMsg}</p>
            </div>
          </div>
        )}

        {/* Grid */}
        <div className="grid gap-6 lg:grid-cols-5">

          {/* Resumen */}
          <div className="lg:col-span-3">
            <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">

              {/* Datos del viaje */}
              <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400">Datos del viaje</p>
                <div className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                  <p className="text-slate-700 sm:col-span-2">
                    <span className="font-semibold text-slate-900">Tipo de vehículo:</span>{" "}
                    {wizardData.tipoVehiculo ? VEHICULO_LABELS[wizardData.tipoVehiculo] : "—"}
                  </p>
                  <p className="text-slate-700"><span className="font-semibold text-slate-900">Fecha:</span> {wizardData.fecha}</p>
                  <p className="text-slate-700"><span className="font-semibold text-slate-900">Hora:</span> {wizardData.hora}</p>
                  <p className="text-slate-700"><span className="font-semibold text-slate-900">Pasajeros:</span> {wizardData.pasajeros}</p>
                </div>
              </section>

              {/* Encargados */}
              <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400">Encargados</p>
                <div className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                  <p className="text-slate-700"><span className="font-semibold text-slate-900">Encargado:</span> {wizardData.encargado}</p>
                  <p className="text-slate-700"><span className="font-semibold text-slate-900">Subencargado:</span> {wizardData.subencargado?.trim() || "—"}</p>
                </div>
              </section>

              {/* Ruta */}
              <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400">Ruta</p>
                <div className="mt-4 space-y-2 text-sm text-slate-700">
                  <p><span className="font-semibold text-slate-900">Origen:</span> {wizardData.origen}</p>
                  <p><span className="font-semibold text-slate-900">Destino 1:</span> {mainDestino}</p>
                  {extraDestinos.length > 0 && (
                    <div className="pt-2">
                      <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">Destinos adicionales</p>
                      <ul className="space-y-2">
                        {extraDestinos.map((d, idx) => (
                          <li key={d.id} className="flex items-start gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3">
                            <span className="mt-0.5 inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-indigo-50 text-[11px] font-extrabold text-indigo-700 ring-1 ring-indigo-100">
                              {idx + 2}
                            </span>
                            <span>{d.address}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </section>

              {/* Acciones */}
              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                {/* Cancelar → siempre al dashboard */}
                <button
                  onClick={handleCancel}
                  disabled={submitting}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 disabled:opacity-50"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Cancelar
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate("/solicitudes/transporte/paso-2")}
                    disabled={submitting}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Anterior
                  </button>

                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
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

          {/* Mapa */}
          <div className="lg:col-span-2">
            <div className="sticky top-24">
              <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 px-6 py-4">
                  <h3 className="text-sm font-bold text-slate-900">Vista previa del mapa</h3>
                  <p className="mt-0.5 text-xs text-slate-500">Ruta real por carretera con todos los puntos del viaje.</p>
                </div>

                <div className="relative">
                  <div id="map-resumen" className="h-[400px] bg-slate-50" />
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
                  <div className="border-t border-slate-200 px-6 py-4">
                    <div className="flex items-center gap-6 text-sm text-slate-700">
                      <div className="flex items-center gap-2">
                        <svg className="h-4 w-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                        </svg>
                        <span><span className="font-semibold">Distancia:</span> {routeInfo.distance.toFixed(1)} km</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <svg className="h-4 w-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span><span className="font-semibold">Tiempo aprox.:</span> {Math.round(routeInfo.duration)} min</span>
                      </div>
                    </div>
                    <p className="mt-1.5 text-xs text-slate-400">
                      {routeInfo.isReal ? "* Ruta real por carretera." : "* Estimación en línea recta."} Sin considerar tráfico.
                    </p>
                  </div>
                )}

                <div className="border-t border-slate-200 bg-slate-50 px-6 py-4">
                  <p className="mb-1.5 text-xs font-semibold text-slate-700">Resumen de ruta:</p>
                  <div className="space-y-1 text-xs text-slate-600">
                    <p><span className="font-semibold">📍 Origen:</span> {wizardData.origen}</p>
                    <p><span className="font-semibold">🔴 Destino 1:</span> {mainDestino}</p>
                    {extraDestinos.map((d, idx) => (
                      <p key={d.id}><span className="font-semibold">🔴 Destino {idx + 2}:</span> {d.address}</p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}