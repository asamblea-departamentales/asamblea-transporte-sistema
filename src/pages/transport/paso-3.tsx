// src/pages/transport/paso-3.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import { createRequest } from "../../services/requests.service";
import SuccessScreen from "../../components/transport/SuccessScreen";
import TransportWizard from "../../components/ui/TransportWizard";

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

  const [successId,     setSuccessId]     = useState<string | undefined>(undefined);
  const [showSuccess,   setShowSuccess]   = useState(false);

  useEffect(() => {
    const saved = safeParse(localStorage.getItem(STORAGE_KEY));
    const ok = !!saved.tipoVehiculo && !!saved.fecha && !!saved.hora && !!saved.encargado
              && !!saved.pasajeros && !!saved.origen
              && Array.isArray(saved.destinos) && !!saved.destinos[0]?.address?.trim();
    if (!ok) { navigate("/solicitudes/transporte/paso-1", { replace: true }); return; }
    setWizardData(saved);
    setLoading(false);
  }, [navigate]);

  useEffect(() => {
    if (loading) return;
    if (!mapRef.current) {
      const mapDiv = document.getElementById("map-resumen");
      if (!mapDiv) return;
      const map = L.map(mapDiv, { zoomControl: true, dragging: true, scrollWheelZoom: false })
        .setView([13.7942, -88.8965], 9);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);
      mapRef.current = map;
    }
    return () => { mapRef.current?.remove(); mapRef.current = null; };
  }, [loading]);

  useEffect(() => {
    if (!mapRef.current || !wizardData.origen) return;

    async function renderMap() {
      if (!mapRef.current) return;
      if (!mapRef.current) return;
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
        const m = L.marker([origenCoords.lat, origenCoords.lng], { icon: makeIcon("#0f2548") })
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
          const m = L.marker([coords.lat, coords.lng], { icon: makeIcon("#ef4444") })
            .addTo(mapRef.current!).bindPopup(`<b>Destino ${idx + 1}:</b><br>${dest.address}`);
          markersRef.current.push(m);
          bounds.push([coords.lat, coords.lng]);
        }
      }

      if (origenCoords && destinosCoords.length > 0) {
        const allPoints = [origenCoords, ...destinosCoords];
        const osrm = await getOSRMRoute(allPoints);
        if (osrm?.geometry?.length) {
          routeLayerRef.current = L.polyline(osrm.geometry, { color: "#0f2548", weight: 5, opacity: 0.85 }).addTo(mapRef.current!);
          setRouteInfo({ distance: osrm.distanceKm, duration: osrm.durationMin, isReal: true });
        } else {
          const pts: L.LatLngExpression[] = allPoints.map((p) => [p.lat, p.lng]);
          routeLayerRef.current = L.polyline(pts, { color: "#0f2548", weight: 4, opacity: 0.7, dashArray: "10,10" }).addTo(mapRef.current!);
          let km = 0, prev = origenCoords;
          destinosCoords.forEach((d) => { km += haversineKm(prev.lat, prev.lng, d.lat, d.lng); prev = d; });
          if (km > 0) setRouteInfo({ distance: km, duration: (km / 45) * 60, isReal: false });
        }
      }
      if (bounds.length > 0) mapRef.current!.fitBounds(bounds as L.LatLngBoundsExpression, { padding: [50, 50] });
      if (bounds.length > 0) mapRef.current!.fitBounds(bounds as L.LatLngBoundsExpression, { padding: [50, 50] });
    }
    renderMap();
  }, [wizardData, loading]);

  const destinosValidos = useMemo(() => (wizardData.destinos || []).filter((d) => d.address?.trim()), [wizardData.destinos]);

  async function handleSubmit() {
    if (submittedRef.current || submitting) return;
    submittedRef.current = true;
    setErrorMsg(null);
    setSubmitting(true);
    try {
      const fechaStr = wizardData.fecha || new Date().toISOString().split("T")[0];
      const horaStr  = wizardData.hora || "08:00";
      const horaFinal = horaStr.length === 5 ? `${horaStr}:00` : horaStr;

      const resp = await createRequest({
        destino_principal:     destinosValidos[0]?.address || "Sin destino",
        encargado:             wizardData.encargado || "Sin encargado",
        tipo_vehiculo:         wizardData.tipoVehiculo || "sedan",
        fecha_salida:          `${fechaStr}T${horaFinal}`,
        hora_salida:           horaStr,
        fecha_retorno:         `${fechaStr}T23:59:59`,
        destino_adicional:     destinosValidos.slice(1).map(d => d.address).join(" | ") || null,
        motivo_actividad:      `Soli. Transporte - ${wizardData.encargado}`,
        cantidad_personas:     parseInt(wizardData.pasajeros || "1"),
        origen:                wizardData.origen || "Sin origen",
        subencargado:          wizardData.subencargado,
        unidad_solicitante_id: 1,
        prioridad:             "media",
      });

      localStorage.removeItem(STORAGE_KEY);
      setSuccessId(resp.solicitudId?.toString());
      setShowSuccess(true);
    } catch (e: any) {
      submittedRef.current = false;
      setErrorMsg(e.message || "Error al enviar la solicitud.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return (
    <div className="mx-auto max-w-7xl py-10">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="h-4 w-40 animate-pulse rounded bg-slate-200" />
        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          <div className="h-48 animate-pulse rounded-3xl bg-slate-100" />
          <div className="h-48 animate-pulse rounded-3xl bg-slate-100" />
        </div>
      </div>
    </div>
  );

  if (showSuccess) return <SuccessScreen solicitudId={successId} />;

  return (
    <div className="mx-auto max-w-7xl space-y-8 pb-12">
      <TransportWizard steps={[{id:1,label:"Datos"},{id:2,label:"Ruta"},{id:3,label:"Confirmar"}]} currentStep={3} />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <h1 className="text-4xl font-black tracking-tight text-slate-900">Confirmación</h1>
          <p className="text-sm font-medium text-slate-500">Revisa los datos antes de enviar la solicitud institucional</p>
        </div>
        <div className="flex h-10 items-center gap-2 rounded-full bg-blue-50 px-4 text-[10px] font-bold uppercase tracking-widest text-[#0f2548] ring-1 ring-blue-100">
          <div className="h-2 w-2 animate-pulse rounded-full bg-[#0f2548]" />
          Paso Final
        </div>
      </div>

      {errorMsg && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {errorMsg}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-5">
        <div className="lg:col-span-3 space-y-8">
          <div className="rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/30">
            <h2 className="mb-8 text-xl font-black text-slate-900">Resumen del Viaje</h2>
            
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tipo de Vehículo</span>
                <p className="font-bold text-slate-700">{wizardData.tipoVehiculo ? VEHICULO_LABELS[wizardData.tipoVehiculo] : "—"}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Fecha y Hora</span>
                <p className="font-bold text-slate-700">{wizardData.fecha} a las {wizardData.hora}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Encargado</span>
                <p className="font-bold text-slate-700">{wizardData.encargado}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Pasajeros</span>
                <p className="font-bold text-slate-700">{wizardData.pasajeros} personas</p>
              </div>
            </div>

            <div className="my-10 h-px w-full bg-slate-100" />

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="mt-1 h-3 w-3 rounded-full bg-[#0f2548] shadow-lg shadow-[#0f2548]/40" />
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Punto de Origen</span>
                  <p className="text-sm font-bold text-slate-700">{wizardData.origen}</p>
                </div>
              </div>

              {destinosValidos.map((d, i) => (
                <div key={d.id} className="flex items-start gap-4">
                  <div className="mt-1 h-3 w-3 rounded-full bg-red-500 shadow-lg shadow-red-500/40" />
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Destino {i + 1}</span>
                    <p className="text-sm font-medium text-slate-600">{d.address}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 flex items-center justify-between gap-4 border-t border-slate-100 pt-8">
              <button onClick={() => navigate("/solicitudes/transporte/paso-2")} className="flex h-12 items-center gap-2 px-6 text-sm font-black text-slate-400 transition hover:text-slate-900">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                Corregir
              </button>
              <button onClick={handleSubmit} disabled={submitting} className="flex h-14 items-center gap-2 rounded-2xl bg-[#0f2548] px-10 text-sm font-black text-white shadow-xl shadow-[#0f2548]/20 transition hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50">
                {submitting ? "Enviando..." : "Enviar Solicitud"}
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="sticky top-24 space-y-4">
            <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl shadow-slate-200/40">
              <div className="border-b border-slate-100 px-6 py-4">
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-800">Mapa de Confirmación</h3>
                <p className="mt-0.5 text-[11px] font-medium text-slate-400">Ruta calculada para el vehículo</p>
              </div>
              <div id="map-resumen" className="h-[400px] bg-slate-50" />
              {routeInfo && (
                <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-6 py-4">
                   <div className="text-xs font-bold text-slate-700">Distancia: {routeInfo.distance.toFixed(1)} km</div>
                   <div className="text-xs font-bold text-slate-700">Tiempo: {routeInfo.duration.toFixed(0)} min</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}