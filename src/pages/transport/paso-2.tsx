// src/pages/transport/paso-2.tsx
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet";
import L from "leaflet";

/* =====================
   TIPOS
===================== */
type DestinationPoint = {
  id: string;
  address: string;
};

type MapPoint = {
  id: string;
  lat: number;
  lng: number;
};

type WizardData = {
  // Paso 1 (no se usan aquí pero se conservan en storage)
  fecha?: string;
  hora?: string;
  encargado?: string;
  subencargado?: string;
  pasajeros?: string;

  // Paso 2
  origen?: string;
  destinos?: DestinationPoint[];
  puntosMapa?: MapPoint[];
};

/* =====================
   UTILS
===================== */
const STORAGE_KEY = "solicitud_transporte";

function uid() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

function safeParse(json: string | null): any {
  try {
    return json ? JSON.parse(json) : {};
  } catch {
    return {};
  }
}

/* =====================
   ICONO LEAFLET
===================== */
const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

/* =====================
   CAPTURA CLIC MAPA
===================== */
function MapClickHandler({
  onAdd,
}: {
  onAdd: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      onAdd(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

/* =====================
   GUARDA MAP EN REF (React-Leaflet v4+)
===================== */
function MapRefHandler({
  mapRef,
}: {
  mapRef: React.MutableRefObject<L.Map | null>;
}) {
  const map = useMap();

  useEffect(() => {
    mapRef.current = map;
  }, [map, mapRef]);

  return null;
}

/* =====================
   PÁGINA
===================== */
export default function TransportStep2Page() {
  const navigate = useNavigate();

  const mapRef = useRef<L.Map | null>(null);

  const [origen, setOrigen] = useState("");
  const [destinos, setDestinos] = useState<DestinationPoint[]>([]);
  const [mapPoints, setMapPoints] = useState<MapPoint[]>([]);
  const [error, setError] = useState(false);

  /* =====================
     CARGAR STORAGE
  ===================== */
  useEffect(() => {
    const saved = safeParse(localStorage.getItem(STORAGE_KEY)) as WizardData;

    if (saved.origen) setOrigen(saved.origen);

    if (Array.isArray(saved.destinos)) setDestinos(saved.destinos);

    if (Array.isArray(saved.puntosMapa)) setMapPoints(saved.puntosMapa);
  }, []);

  /* =====================
     AJUSTAR MAPA A PUNTOS
  ===================== */
  useEffect(() => {
    if (!mapRef.current) return;
    if (mapPoints.length === 0) return;

    const pts = mapPoints
      .filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lng))
      .map((p) => L.latLng(p.lat, p.lng));

    if (pts.length === 0) return;

    const bounds = L.latLngBounds(pts);
    mapRef.current.fitBounds(bounds, { padding: [50, 50] });
  }, [mapPoints]);

  /* =====================
     GUARDAR STORAGE
  ===================== */
  function saveToStorage() {
    const current = safeParse(localStorage.getItem(STORAGE_KEY)) as WizardData;

    const next: WizardData = {
      ...current,
      origen: origen.trim(),
      destinos,
      puntosMapa: mapPoints,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  /* =====================
     CLICK EN MAPA => AGREGA DESTINO
  ===================== */
  function addPoint(lat: number, lng: number) {
    const id = uid();

    setMapPoints((prev) => [...prev, { id, lat, lng }]);

    // también agrega un destino textual (podés luego geocodificar si querés)
    setDestinos((prev) => [
      ...prev,
      { id, address: `Lat ${lat.toFixed(5)}, Lng ${lng.toFixed(5)}` },
    ]);

    setError(false);
  }

  /* =====================
     ACCIONES
  ===================== */
  function handleContinue() {
    if (!origen.trim() || destinos.length === 0) {
      setError(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    saveToStorage();
    navigate("/solicitudes/transporte/paso-3");
  }

  function handleBack() {
    saveToStorage();
    navigate("/solicitudes/transporte/paso-1");
  }

  return (
    <div className="min-h-screen bg-background-light px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-7">
        {/* PROGRESO */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="p-6 sm:p-7">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-base font-bold text-slate-900">
                Progreso de la Solicitud
              </h3>

              <span className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 ring-1 ring-indigo-100">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-600" />
                Paso 2 de 3
              </span>
            </div>

            <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div className="h-full w-2/3 rounded-full bg-indigo-600" />
            </div>

            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="text-slate-600">
                Actual:{" "}
                <span className="font-semibold text-indigo-700">
                  Puntos de Ruta
                </span>
              </span>
              <span className="italic text-slate-400">
                Siguiente: Confirmación
              </span>
            </div>
          </div>
        </div>

        {/* TITULO */}
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-[34px]">
            Puntos de Ruta
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-slate-600">
            Indique el origen y agregue destino(s) haciendo clic en el mapa.
          </p>
        </div>

        {/* ALERTA */}
        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            <div className="flex items-start gap-3">
              <svg
                className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <div>
                <p className="font-bold text-red-900">Atención</p>
                <p className="mt-0.5">
                  Complete el origen y agregue al menos un destino en el mapa
                  antes de continuar.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* LAYOUT */}
        <div className="grid gap-6 lg:grid-cols-5">
          {/* FORMULARIO */}
          <div className="lg:col-span-3">
            <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="p-6 sm:p-8 space-y-8">
                {/* Origen */}
                <section>
                  <div className="mb-4 flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-2xl bg-indigo-50 ring-1 ring-indigo-100">
                      <svg
                        className="h-5 w-5 text-indigo-700"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </div>
                    <h2 className="text-base font-bold text-slate-900">
                      Punto de origen
                    </h2>
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold text-slate-700">
                      Origen <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={origen}
                      onChange={(e) => {
                        setOrigen(e.target.value);
                        setError(false);
                      }}
                      placeholder='Ej: "Asamblea Legislativa, San Salvador"'
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                    />
                    <p className="mt-2 text-xs text-slate-500">
                      Ingrese la dirección completa del punto de partida.
                    </p>
                  </div>
                </section>

                <div className="h-px w-full bg-slate-200/70" />

                {/* Destinos (desde mapa) */}
                <section>
                  <div className="mb-4 flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-2xl bg-indigo-50 ring-1 ring-indigo-100">
                      <svg
                        className="h-5 w-5 text-indigo-700"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"
                        />
                      </svg>
                    </div>
                    <h2 className="text-base font-bold text-slate-900">
                      Punto(s) de destino
                    </h2>
                  </div>

                  {destinos.length === 0 ? (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                      Aún no hay destinos. Haga clic en el mapa para agregar.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {destinos.map((d, i) => (
                        <div
                          key={d.id}
                          className="rounded-2xl border border-slate-200 bg-white px-4 py-3"
                        >
                          <p className="text-xs font-semibold text-slate-700">
                            Destino {i + 1}
                          </p>
                          <p className="mt-1 text-sm font-semibold text-slate-900">
                            {d.address}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  <p className="mt-3 text-xs text-slate-500">
                    💡 Tip: puede hacer zoom y mover el mapa libremente, luego
                    haga clic para añadir paradas.
                  </p>
                </section>

                {/* Acciones */}
                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    onClick={handleBack}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                  >
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 19l-7-7m0 0l7-7m-7 7h18"
                      />
                    </svg>
                    Anterior
                  </button>

                  <button
                    onClick={handleContinue}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-primary/90 active:scale-[0.99]"
                  >
                    Continuar
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* MAPA */}
          <div className="lg:col-span-2">
            <div className="sticky top-24 space-y-4">
              <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200">
                  <h3 className="text-sm font-bold text-slate-900">
                    Vista previa del mapa
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">
                    Haga clic para colocar destinos. El mapa se ajusta a los
                    puntos automáticamente.
                  </p>
                </div>

                <div className="h-[500px] bg-slate-50">
                  <MapContainer
                    center={[13.7942, -88.8965]}
                    zoom={8}
                    className="h-full w-full"
                  >
                    <TileLayer
                      attribution="© OpenStreetMap"
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {/* ✅ guarda instancia del mapa (React-Leaflet v4+) */}
                    <MapRefHandler mapRef={mapRef} />

                    {/* ✅ click para agregar puntos */}
                    <MapClickHandler onAdd={addPoint} />

                    {mapPoints.map((p) => (
                      <Marker
                        key={p.id}
                        position={[p.lat, p.lng]}
                        icon={markerIcon}
                      />
                    ))}
                  </MapContainer>
                </div>

                {mapPoints.length > 0 && (
                  <div className="border-t border-slate-200 bg-slate-50 px-6 py-4">
                    <p className="text-xs text-slate-600">
                      <span className="font-semibold">Puntos:</span>{" "}
                      {mapPoints.length} destino(s) agregado(s).
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <footer className="py-3 text-center text-xs text-slate-400">
          © 2026 Sistema de Transporte Institucional
        </footer>
      </div>
    </div>
  );
}
