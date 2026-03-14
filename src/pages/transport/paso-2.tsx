// src/pages/transport/paso-2.tsx
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import LocationInput from "../../components/transport/LocationInput";
import TransportWizard from "../../components/ui/TransportWizard";
import { haversineKm, reverseGeocode } from "@/lib/geo";

// ─── Tipos ─────────────────────────────────────────────────────────────────────

type DestinationPoint = {
  id: string;
  address: string;
  lat?: number;
  lng?: number;
};

type WizardData = {
  fecha?: string; hora?: string; encargado?: string; subencargado?: string; pasajeros?: string;
  origen?: string; origenLat?: number; origenLng?: number;
  destinos?: DestinationPoint[];
};

// ─── Constantes ────────────────────────────────────────────────────────────────

const STORAGE_KEY = "solicitud_transporte";

const WIZARD_STEPS = [
  { id: 1, label: "Datos"     },
  { id: 2, label: "Ruta"      },
  { id: 3, label: "Confirmar" },
];

// Iconos de mapa
const ICON_ORIGIN = L.icon({
  iconUrl: "data:image/svg+xml;base64," + btoa(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#0f2548" width="32" height="32">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
    </svg>`
  ),
  iconSize: [32, 32], iconAnchor: [16, 32], popupAnchor: [0, -32],
});

const ICON_DEST = L.icon({
  iconUrl: "data:image/svg+xml;base64," + btoa(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#ef4444" width="32" height="32">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
    </svg>`
  ),
  iconSize: [32, 32], iconAnchor: [16, 32], popupAnchor: [0, -32],
});

// ─── Utilidades ────────────────────────────────────────────────────────────────

const uid = () => Math.random().toString(16).slice(2) + Date.now().toString(16);
const safeParse = (json: string | null): WizardData => {
  try { return json ? JSON.parse(json) : {}; } catch { return {}; }
};

// ─── MapPanel ──────────────────────────────────────────────────────────────────

function MapPanel({ origenCoords, origenLabel, destinos }: { origenCoords: any; origenLabel: string; destinos: any[] }) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef          = useRef<L.Map | null>(null);
  const markersRef      = useRef<L.Marker[]>([]);
  const routeLayerRef   = useRef<L.Polyline | null>(null);

  const [routeInfo, setRouteInfo] = useState<{ distance: number; duration: number } | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;
    mapRef.current = L.map(mapContainerRef.current).setView([13.7942, -88.8965], 9);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(mapRef.current);

    mapRef.current.on("click", (e: L.LeafletMouseEvent) => {
      window.dispatchEvent(new CustomEvent("map:click", { detail: { lat: e.latlng.lat, lng: e.latlng.lng } }));
    });

    return () => { mapRef.current?.remove(); mapRef.current = null; };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];
    routeLayerRef.current?.remove();
    routeLayerRef.current = null;

    const bounds: [number, number][] = [];
    if (origenCoords) {
      const m = L.marker([origenCoords.lat, origenCoords.lng], { icon: ICON_ORIGIN })
        .addTo(mapRef.current)
        .bindPopup(`<b>Origen:</b><br>${origenLabel}`);
      markersRef.current.push(m);
      bounds.push([origenCoords.lat, origenCoords.lng]);
    }

    destinos.forEach((d, i) => {
      if (d.lat && d.lng) {
        const m = L.marker([d.lat, d.lng], { icon: ICON_DEST })
          .addTo(mapRef.current!)
          .bindPopup(`<b>Destino ${i + 1}:</b><br>${d.address}`);
        markersRef.current.push(m);
        bounds.push([d.lat, d.lng]);
      }
    });

    const withCoords = destinos.filter(d => d.lat && d.lng);
    if (origenCoords && withCoords.length > 0) {
      const pts: L.LatLngExpression[] = [[origenCoords.lat, origenCoords.lng], ...withCoords.map(d => [d.lat!, d.lng!] as L.LatLngExpression)];
      routeLayerRef.current = L.polyline(pts, { color: "#0f2548", weight: 4, opacity: 0.7, dashArray: "10,10" }).addTo(mapRef.current);
      let dist = 0;
      let prev = origenCoords;
      withCoords.forEach(d => {
        dist += haversineKm(prev.lat, prev.lng, d.lat!, d.lng!);
        prev = { lat: d.lat!, lng: d.lng! };
      });
      if (dist > 0) setRouteInfo({ distance: dist, duration: dist / 45 });
    } else {
      setRouteInfo(null);
    }
    if (bounds.length > 0) mapRef.current.fitBounds(bounds as L.LatLngBoundsExpression, { padding: [50, 50] });
  }, [origenCoords, origenLabel, destinos]);

  return (
    <div className="sticky top-24 space-y-4">
      <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl shadow-slate-200/40">
        <div className="border-b border-slate-100 px-6 py-4">
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-800">Mapa de Ruta</h3>
          <p className="mt-0.5 text-[11px] font-medium text-slate-400">Haz clic para fijar puntos en el mapa</p>
        </div>
        <div ref={mapContainerRef} className="h-[430px] bg-slate-50" />
        {routeInfo && (
          <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-6 py-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
              </div>
              <span className="text-xs font-bold text-slate-700">{routeInfo.distance.toFixed(1)} <span className="text-slate-400 font-medium tracking-normal">km</span></span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <span className="text-xs font-bold text-slate-700">{(routeInfo.duration * 60).toFixed(0)} <span className="text-slate-400 font-medium tracking-normal">min</span></span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── PÁGINA ────────────────────────────────────────────────────────────────────

export default function TransportStep2Page() {
  const navigate = useNavigate();
  const [origen,       setOrigen]       = useState("");
  const [origenCoords, setOrigenCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [destinos,     setDestinos]     = useState<DestinationPoint[]>([{ id: uid(), address: "" }]);
  const [,             setError]        = useState(false);

  const edenRef = useRef({ o: "", oc: null as any });
  useEffect(() => { edenRef.current = { o: origen, oc: origenCoords }; }, [origen, origenCoords]);

  useEffect(() => {
    const saved = safeParse(localStorage.getItem(STORAGE_KEY));
    if (saved.origen) { setOrigen(saved.origen); if (saved.origenLat) setOrigenCoords({ lat: saved.origenLat, lng: saved.origenLng! }); }
    if (saved.destinos?.length) setDestinos(saved.destinos);

    const onMapClick = (e: any) => {
      const { lat, lng } = e.detail;
      reverseGeocode(lat, lng).then(display_name => {
        const addr = display_name ?? `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        if (!edenRef.current.oc) { setOrigen(addr); setOrigenCoords({ lat, lng }); }
        else { setDestinos(ds => {
          const idx = ds.findIndex(d => !d.address.trim());
          if (idx !== -1) return ds.map((d, i) => i === idx ? { ...d, address: addr, lat, lng } : d);
          return [...ds, { id: uid(), address: addr, lat, lng }];
        }); }
      });
    };
    window.addEventListener("map:click", onMapClick);
    return () => window.removeEventListener("map:click", onMapClick);
  }, []);

  const save = () => {
    const curr = safeParse(localStorage.getItem(STORAGE_KEY));
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...curr, origen, origenLat: origenCoords?.lat, origenLng: origenCoords?.lng, destinos }));
  };

  const handleContinue = () => {
    if (!origen.trim() || !destinos[0]?.address.trim()) { setError(true); window.scrollTo({ top:0, behavior:"smooth"}); return; }
    save(); navigate("/solicitudes/transporte/paso-3");
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8 pb-12">
      <TransportWizard steps={WIZARD_STEPS} currentStep={2} />

      <div className="space-y-2">
        <h1 className="text-4xl font-black tracking-tight text-slate-900">Ubicaciones del Viaje</h1>
        <p className="text-sm font-medium text-slate-500">Define los puntos clave de la ruta física</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-5">
        <div className="lg:col-span-3 space-y-6">
          <div className="rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/30">
            {/* Origen */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0f2548] text-white shadow-lg shadow-[#0f2548]/20">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
                </div>
                <h2 className="text-xl font-black text-slate-900">Origen</h2>
              </div>
              <LocationInput id="origen" label="" required value={origen} onChange={(v, la, ln) => { setOrigen(v); setOrigenCoords(la? {lat:la, lng:ln!} : null); setError(false); }} placeholder="Sede de salida..." />
            </div>

            <div className="my-10 h-px w-full bg-slate-100" />

            {/* Destinos */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-500 text-white shadow-lg shadow-red-500/20">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" /></svg>
                </div>
                <h2 className="text-xl font-black text-slate-900">Destinos</h2>
              </div>
              <div className="space-y-5">
                {destinos.map((dest, i) => (
                  <div key={dest.id} className="group relative">
                    <div className="mb-2 flex items-center justify-between px-1">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Punto de Destino {i+1}</span>
                      {destinos.length > 1 && (
                        <button onClick={() => setDestinos(ds => ds.filter(d => d.id !== dest.id))} className="text-[10px] font-bold text-red-400 transition hover:text-red-600">Remover</button>
                      )}
                    </div>
                    <LocationInput id={`dest-${dest.id}`} value={dest.address} onChange={(v, la, ln) => { setDestinos(ds => ds.map(d => d.id === dest.id ? {...d, address: v, lat: la, lng: ln} : d)); setError(false); }} placeholder="Dirección de destino..." />
                  </div>
                ))}
                <button onClick={() => setDestinos(ds => [...ds, {id: uid(), address:""}])} className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 py-4 text-xs font-black uppercase tracking-widest text-slate-400 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-500">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M12 4v16m8-8H4" /></svg>
                  Añadir Parada
                </button>
              </div>
            </div>

            {/* Acciones */}
            <div className="mt-12 flex items-center justify-between gap-4">
              <button onClick={() => { save(); navigate("/solicitudes/transporte/paso-1"); }} className="flex h-12 items-center gap-2 px-6 text-sm font-black text-slate-400 transition hover:text-slate-900">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                Volver
              </button>
              <button onClick={handleContinue} className="flex h-14 items-center gap-2 rounded-2xl bg-[#0f2548] px-10 text-sm font-black text-white shadow-xl shadow-[#0f2548]/20 transition hover:-translate-y-0.5 active:translate-y-0">
                Siguiente Paso
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mapa */}
        <div className="lg:col-span-2">
          <MapPanel origenCoords={origenCoords} origenLabel={origen} destinos={destinos} />
        </div>
      </div>
    </div>
  );
}