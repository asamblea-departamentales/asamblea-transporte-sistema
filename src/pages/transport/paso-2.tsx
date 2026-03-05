// src/pages/transport/paso-2.tsx
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import LocationInput from "../../components/transport/LocationInput";

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

// ─── Utilidades ────────────────────────────────────────────────────────────────

const STORAGE_KEY = "solicitud_transporte";
const uid = () => Math.random().toString(16).slice(2) + Date.now().toString(16);
const safeParse = (json: string | null): WizardData => { try { return json ? JSON.parse(json) : {}; } catch { return {}; } };

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371, dLat = ((lat2 - lat1) * Math.PI) / 180, dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function makeIcon(color: string) {
  return L.icon({
    iconUrl: "data:image/svg+xml;base64," + btoa(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" width="32" height="32"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>`),
    iconSize: [32, 32], iconAnchor: [16, 32], popupAnchor: [0, -32],
  });
}

const NOMINATIM_EMAIL = "app@transporte.institucional.sv";

// ─── Mapa (componente interno separado) ────────────────────────────────────────

type MapPanelProps = {
  origenCoords: { lat: number; lng: number } | null;
  origenLabel: string;
  destinos: DestinationPoint[];
};

function MapPanel({ origenCoords, origenLabel, destinos }: MapPanelProps) {
  const mapRef         = useRef<L.Map | null>(null);
  const markersRef     = useRef<L.Marker[]>([]);
  const routeLayerRef  = useRef<L.Polyline | null>(null);
  const [routeInfo, setRouteInfo] = useState<{ distance: number; duration: number } | null>(null);

  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = L.map("map-paso2").setView([13.7942, -88.8965], 9);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(mapRef.current);
    }
    return () => { mapRef.current?.remove(); mapRef.current = null; };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];
    routeLayerRef.current?.remove();
    routeLayerRef.current = null;

    const bounds: [number, number][] = [];

    if (origenCoords) {
      const m = L.marker([origenCoords.lat, origenCoords.lng], { icon: makeIcon("#4F46E5") })
        .addTo(mapRef.current).bindPopup(`<b>Origen:</b><br>${origenLabel}`);
      markersRef.current.push(m);
      bounds.push([origenCoords.lat, origenCoords.lng]);
    }

    destinos.forEach((d, i) => {
      if (d.lat && d.lng) {
        const m = L.marker([d.lat, d.lng], { icon: makeIcon("#DC2626") })
          .addTo(mapRef.current!).bindPopup(`<b>Destino ${i + 1}:</b><br>${d.address}`);
        markersRef.current.push(m);
        bounds.push([d.lat, d.lng]);
      }
    });

    const withCoords = destinos.filter((d) => d.lat && d.lng);
    if (origenCoords && withCoords.length > 0) {
      const pts: L.LatLngExpression[] = [
        [origenCoords.lat, origenCoords.lng],
        ...withCoords.map((d) => [d.lat!, d.lng!] as L.LatLngExpression),
      ];
      routeLayerRef.current = L.polyline(pts, { color: "#4F46E5", weight: 4, opacity: 0.7, dashArray: "10,10" }).addTo(mapRef.current);

      let dist = 0, prev = origenCoords;
      withCoords.forEach((d) => { dist += haversine(prev.lat, prev.lng, d.lat!, d.lng!); prev = { lat: d.lat!, lng: d.lng! }; });
      if (dist > 0) setRouteInfo({ distance: dist, duration: dist / 45 });
    } else {
      setRouteInfo(null);
    }

    if (bounds.length > 0) mapRef.current.fitBounds(bounds as L.LatLngBoundsExpression, { padding: [50, 50] });
  }, [origenCoords, origenLabel, destinos]);

  return (
    <div className="sticky top-24 space-y-4">
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-4">
          <h3 className="text-sm font-bold text-slate-900">Mapa interactivo</h3>
          <p className="mt-0.5 text-xs text-slate-500">Haga clic en el mapa para seleccionar ubicaciones.</p>
        </div>

        <div id="map-paso2" className="h-[420px] bg-slate-50" />

        {routeInfo && (
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
                <span><span className="font-semibold">Tiempo aprox.:</span> {(routeInfo.duration * 60).toFixed(0)} min</span>
              </div>
            </div>
            <p className="mt-1.5 text-xs text-slate-400">* Estimación sin tráfico en tiempo real.</p>
          </div>
        )}

        <div className="border-t border-slate-200 bg-slate-50 px-6 py-4">
          <p className="mb-1.5 text-xs font-semibold text-slate-600">Cómo usar el mapa:</p>
          <ul className="ml-3 list-disc space-y-1 text-xs text-slate-500">
            <li>Escribe en los campos para autocompletar con sedes o direcciones.</li>
            <li>O haz clic directamente en el mapa para fijar ubicaciones.</li>
            <li>Marcador <span className="font-medium text-indigo-600">azul</span> = origen · <span className="font-medium text-red-600">rojo</span> = destino</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// ─── PÁGINA ────────────────────────────────────────────────────────────────────

export default function TransportStep2Page() {
  const navigate = useNavigate();
  const reverseAbortRef = useRef<AbortController | null>(null);

  const [origen, setOrigen]               = useState("");
  const [origenCoords, setOrigenCoords]   = useState<{ lat: number; lng: number } | null>(null);
  const [destinos, setDestinos]           = useState<DestinationPoint[]>([{ id: uid(), address: "" }]);
  const [error, setError]                 = useState(false);

  // Cargar desde storage
  useEffect(() => {
    const saved = safeParse(localStorage.getItem(STORAGE_KEY));
    if (saved.origen) { setOrigen(saved.origen); if (saved.origenLat && saved.origenLng) setOrigenCoords({ lat: saved.origenLat, lng: saved.origenLng }); }
    if (Array.isArray(saved.destinos) && saved.destinos.length > 0) setDestinos(saved.destinos);
  }, []);

  // Click en mapa → reverse geocode (escuchamos evento custom desde MapPanel)
  // En su lugar usamos un hook de comunicación simple: el mapa emite
  // un evento en window con las coords
  useEffect(() => {
    function onMapClick(e: CustomEvent<{ lat: number; lng: number }>) {
      const { lat, lng } = e.detail;
      reverseAbortRef.current?.abort();
      reverseAbortRef.current = new AbortController();

      fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&email=${NOMINATIM_EMAIL}`,
        { signal: reverseAbortRef.current.signal, headers: { "Accept-Language": "es" } }
      )
        .then((r) => r.json())
        .then((data) => {
          const address = data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
          setOrigenCoords((oc) => {
            if (!oc) { setOrigen(address); return { lat, lng }; }
            setDestinos((ds) => {
              const idx = ds.findIndex((d) => !d.address.trim());
              if (idx !== -1) return ds.map((d, i) => i === idx ? { ...d, address, lat, lng } : d);
              return [...ds, { id: uid(), address, lat, lng }];
            });
            return oc;
          });
        })
        .catch((err) => { if (err.name !== "AbortError") console.error(err); });
    }
    window.addEventListener("map:click", onMapClick as EventListener);
    return () => window.removeEventListener("map:click", onMapClick as EventListener);
  }, []);

  function handleOrigenChange(value: string, lat?: number, lng?: number) {
    setOrigen(value);
    setOrigenCoords(lat && lng ? { lat, lng } : null);
    setError(false);
  }

  function handleDestinoChange(id: string, value: string, lat?: number, lng?: number) {
    setDestinos((ds) => ds.map((d) => d.id === id ? { ...d, address: value, lat, lng } : d));
    setError(false);
  }

  function addDestino() { setDestinos((ds) => [...ds, { id: uid(), address: "" }]); }
  function removeDestino(id: string) { if (destinos.length > 1) setDestinos((ds) => ds.filter((d) => d.id !== id)); }

  function save() {
    const current = safeParse(localStorage.getItem(STORAGE_KEY));
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      ...current,
      origen: origen.trim(),
      origenLat: origenCoords?.lat,
      origenLng: origenCoords?.lng,
      destinos,
    }));
  }

  function handleContinue() {
    if (!origen.trim() || !destinos[0]?.address.trim()) { setError(true); window.scrollTo({ top: 0, behavior: "smooth" }); return; }
    save();
    navigate("/solicitudes/transporte/paso-3");
  }

  function handleBack() { save(); navigate("/solicitudes/transporte/paso-1"); }

  return (
    <div className="mx-auto max-w-7xl space-y-7 pb-10">

      {/* Progreso */}
      <div className="rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm sm:px-7">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-base font-bold text-slate-900">Progreso de la Solicitud</h3>
          <span className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 ring-1 ring-indigo-100">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-600" />
            Paso 2 de 3
          </span>
        </div>
        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div className="h-full w-2/3 rounded-full bg-indigo-600" />
        </div>
        <div className="mt-3 flex items-center justify-between text-sm">
          <span className="text-slate-600">Actual: <span className="font-semibold text-indigo-700">Puntos de Ruta</span></span>
          <span className="italic text-slate-400">Siguiente: Confirmación</span>
        </div>
      </div>

      {/* Título */}
      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-[34px]">Puntos de Ruta</h1>
        <p className="max-w-2xl text-sm leading-relaxed text-slate-600">
          Indique el origen y destino(s). Escriba "Departamental" para ver las sedes de la Asamblea Legislativa.
        </p>
      </div>

      {/* Alerta */}
      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <p className="font-bold text-red-900">Atención</p>
            <p className="mt-0.5">Complete el origen y al menos un destino antes de continuar.</p>
          </div>
        </div>
      )}

      {/* Grid: formulario + mapa */}
      <div className="grid gap-6 lg:grid-cols-5">

        {/* Formulario */}
        <div className="lg:col-span-3">
          <div className="space-y-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">

            {/* Origen */}
            <section>
              <div className="mb-4 flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-2xl bg-indigo-50 ring-1 ring-indigo-100">
                  <svg className="h-5 w-5 text-indigo-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h2 className="text-base font-bold text-slate-900">Punto de origen</h2>
              </div>

              <LocationInput
                id="origen"
                label="Origen"
                required
                value={origen}
                onChange={handleOrigenChange}
                placeholder="Ej: Departamental La Libertad, Palacio Legislativo..."
              />
              <p className="mt-2 text-xs text-slate-400">
                Escribe "Departamental" + nombre del departamento para encontrar sedes de la Asamblea.
              </p>
            </section>

            <div className="h-px w-full bg-slate-200/70" />

            {/* Destinos */}
            <section>
              <div className="mb-4 flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-2xl bg-indigo-50 ring-1 ring-indigo-100">
                  <svg className="h-5 w-5 text-indigo-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                  </svg>
                </div>
                <h2 className="text-base font-bold text-slate-900">Punto(s) de destino</h2>
              </div>

              <div className="space-y-4">
                {destinos.map((dest, idx) => (
                  <div key={dest.id}>
                    <div className="mb-2 flex items-center justify-between">
                      <label className="text-xs font-semibold text-slate-700">
                        Destino {idx + 1} {idx === 0 && <span className="text-red-500">*</span>}
                      </label>
                      {destinos.length > 1 && (
                        <button type="button" onClick={() => removeDestino(dest.id)} className="text-xs font-medium text-red-500 transition hover:text-red-700">
                          Eliminar
                        </button>
                      )}
                    </div>
                    <LocationInput
                      id={`destino-${dest.id}`}
                      value={dest.address}
                      onChange={(val, lat, lng) => handleDestinoChange(dest.id, val, lat, lng)}
                      placeholder="Ej: Departamental Santa Ana, San Miguel..."
                    />
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addDestino}
                  className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-200"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Agregar destino adicional
                </button>

                <p className="text-xs text-slate-400">
                  Puede agregar múltiples destinos o hacer clic en el mapa para ubicarlos.
                </p>
              </div>
            </section>

            {/* Acciones */}
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button onClick={handleBack} className="inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Anterior
              </button>
              <button onClick={handleContinue} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-700 active:scale-[0.99]">
                Continuar
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
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