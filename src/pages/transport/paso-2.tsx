//Src/pages/transport/paso-2.tsx
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

type DestinationPoint = {
  id: string;
  address: string;
  lat?: number;
  lng?: number;
};

type WizardData = {
  // Paso 1
  fecha?: string;
  hora?: string;
  encargado?: string;
  subencargado?: string;
  pasajeros?: string;

  // Paso 2
  origen?: string;
  origenLat?: number;
  origenLng?: number;
  destinos?: DestinationPoint[];
};

const STORAGE_KEY = "solicitud_transporte";
const NOMINATIM_EMAIL = "app@transporte.institucional.sv";

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

// Fórmula Haversine para calcular distancia entre dos coordenadas (en km)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function TransportStep2Page() {
  const navigate = useNavigate();
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const routeLayerRef = useRef<L.Polyline | null>(null);

  // AbortController como useRef para evitar conflictos entre instancias
  const geocodeControllerRef = useRef<AbortController | null>(null);
  const reverseGeoControllerRef = useRef<AbortController | null>(null);

  const [origen, setOrigen] = useState("");
  const [origenCoords, setOrigenCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [destinos, setDestinos] = useState<DestinationPoint[]>([
    { id: uid(), address: "" },
  ]);
  const [error, setError] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [routeInfo, setRouteInfo] = useState<{ distance: number; duration: number } | null>(null);

  // Función de geocodificación robusta con AbortController y email institucional
  async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
    try {
      if (geocodeControllerRef.current) {
        geocodeControllerRef.current.abort();
      }
      geocodeControllerRef.current = new AbortController();

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          address
        )}&countrycodes=sv&limit=1&email=${NOMINATIM_EMAIL}`,
        {
          signal: geocodeControllerRef.current.signal,
          headers: { "Accept-Language": "es" },
        }
      );

      const data = await response.json();

      if (data?.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
        };
      }
      return null;
    } catch (error: any) {
      if (error.name !== "AbortError") {
        console.error("Error geocoding:", error);
      }
      return null;
    }
  }

  // Iconos personalizados para los marcadores
  const originIcon = L.icon({
    iconUrl:
      "data:image/svg+xml;base64," +
      btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#4F46E5" width="32" height="32">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
      </svg>
    `),
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });

  const destinationIcon = L.icon({
    iconUrl:
      "data:image/svg+xml;base64," +
      btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#DC2626" width="32" height="32">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
      </svg>
    `),
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });

  // Inicializar mapa
  useEffect(() => {
    if (!mapRef.current) {
      const map = L.map("map").setView([13.7942, -88.8965], 9);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      mapRef.current = map;

      // Clic en el mapa para seleccionar ubicaciones
      map.on("click", async (e) => {
        const { lat, lng } = e.latlng;

        try {
          // Cancelar reverse geocoding anterior si existe
          if (reverseGeoControllerRef.current) {
            reverseGeoControllerRef.current.abort();
          }
          reverseGeoControllerRef.current = new AbortController();

          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&email=${NOMINATIM_EMAIL}`,
            {
              signal: reverseGeoControllerRef.current.signal,
              headers: { "Accept-Language": "es" },
            }
          );
          const data = await response.json();
          const address =
            data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;

          setOrigenCoords((currentOrigenCoords) => {
            if (!currentOrigenCoords) {
              setOrigen(address);
              return { lat, lng };
            }

            setDestinos((currentDestinos) => {
              const emptyIndex = currentDestinos.findIndex(
                (d) => !d.address.trim()
              );
              if (emptyIndex !== -1) {
                return currentDestinos.map((d, i) =>
                  i === emptyIndex ? { ...d, address, lat, lng } : d
                );
              } else {
                return [...currentDestinos, { id: uid(), address, lat, lng }];
              }
            });

            return currentOrigenCoords;
          });
        } catch (error: any) {
          if (error.name !== "AbortError") {
            console.error("Error reverse geocoding:", error);
          }
        }
      });
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Cargar desde localStorage
  useEffect(() => {
    const saved = safeParse(localStorage.getItem(STORAGE_KEY)) as WizardData;

    if (saved.origen) {
      setOrigen(saved.origen);
      if (saved.origenLat && saved.origenLng) {
        setOrigenCoords({ lat: saved.origenLat, lng: saved.origenLng });
      }
    }

    if (Array.isArray(saved.destinos) && saved.destinos.length > 0) {
      setDestinos(saved.destinos);
    }
  }, []);

  // Actualizar marcadores, ruta y calcular distancia/tiempo cuando cambien las coordenadas
  useEffect(() => {
    if (!mapRef.current) return;

    // Limpiar marcadores anteriores
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Limpiar ruta anterior
    if (routeLayerRef.current) {
      routeLayerRef.current.remove();
      routeLayerRef.current = null;
    }

    const bounds: [number, number][] = [];

    // Marcador de origen
    if (origenCoords) {
      const marker = L.marker([origenCoords.lat, origenCoords.lng], {
        icon: originIcon,
      })
        .addTo(mapRef.current)
        .bindPopup(`<b>Origen:</b><br>${origen}`);
      markersRef.current.push(marker);
      bounds.push([origenCoords.lat, origenCoords.lng]);
    }

    // Marcadores de destinos
    destinos.forEach((dest, index) => {
      if (dest.lat && dest.lng) {
        const marker = L.marker([dest.lat, dest.lng], { icon: destinationIcon })
          .addTo(mapRef.current!)
          .bindPopup(`<b>Destino ${index + 1}:</b><br>${dest.address}`);
        markersRef.current.push(marker);
        bounds.push([dest.lat, dest.lng]);
      }
    });

    // Dibujar ruta y calcular distancia
    const destinosConCoords = destinos.filter((d) => d.lat && d.lng);

    if (origenCoords && destinosConCoords.length > 0) {
      const routePoints: L.LatLngExpression[] = [
        [origenCoords.lat, origenCoords.lng],
        ...destinosConCoords.map((d) => [d.lat!, d.lng!] as L.LatLngExpression),
      ];

      routeLayerRef.current = L.polyline(routePoints, {
        color: "#4F46E5",
        weight: 4,
        opacity: 0.7,
        dashArray: "10, 10",
      }).addTo(mapRef.current);

      // Calcular distancia total de la ruta
      let totalDistance = 0;
      let prev = origenCoords;

      destinosConCoords.forEach((dest) => {
        totalDistance += calculateDistance(
          prev.lat,
          prev.lng,
          dest.lat!,
          dest.lng!
        );
        prev = { lat: dest.lat!, lng: dest.lng! };
      });

      if (totalDistance > 0) {
        // Velocidad promedio estimada (considerando tráfico urbano/interurbano de El Salvador)
        const avgSpeed = 45; // km/h
        const estimatedTime = totalDistance / avgSpeed;
        setRouteInfo({ distance: totalDistance, duration: estimatedTime });
      }
    } else {
      setRouteInfo(null);
    }

    // Ajustar vista del mapa
    if (bounds.length > 0) {
      mapRef.current.fitBounds(bounds as L.LatLngBoundsExpression, {
        padding: [50, 50],
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [origenCoords, destinos]);

  // Geocodificar origen cuando el usuario termina de escribir (debounce 1s)
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (origen.trim() && !origenCoords) {
        setIsGeocoding(true);
        const coords = await geocodeAddress(origen);
        if (coords) {
          setOrigenCoords(coords);
        }
        setIsGeocoding(false);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [origen, origenCoords]);

  function addDestination() {
    setDestinos((prev) => [...prev, { id: uid(), address: "" }]);
  }

  function updateDestination(id: string, address: string, lat?: number, lng?: number) {
    setDestinos((prev) =>
      prev.map((d) => (d.id === id ? { ...d, address, lat, lng } : d))
    );
    setError(false);

    // Geocodificar destino con debounce si no tiene coordenadas
    if (!lat || !lng) {
      setTimeout(async () => {
        if (!address.trim()) return;
        const coords = await geocodeAddress(address);
        if (coords) {
          setDestinos((prev) =>
            prev.map((d) =>
              d.id === id ? { ...d, lat: coords.lat, lng: coords.lng } : d
            )
          );
        }
      }, 1000);
    }
  }

  function removeDestination(id: string) {
    if (destinos.length > 1) {
      setDestinos((prev) => prev.filter((d) => d.id !== id));
    }
  }

  function saveToStorage() {
    const current = safeParse(localStorage.getItem(STORAGE_KEY)) as WizardData;
    const next: WizardData = {
      ...current,
      origen: origen.trim(),
      origenLat: origenCoords?.lat,
      origenLng: origenCoords?.lng,
      destinos,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  function handleContinue() {
    if (!origen.trim() || !destinos[0]?.address.trim()) {
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
              <span className="italic text-slate-400">Siguiente: Confirmación</span>
            </div>
          </div>
        </div>

        {/* TITULO */}
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-[34px]">
            Puntos de Ruta
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-slate-600">
            Indique el origen y destino(s) de su viaje. El mapa se actualizará automáticamente.
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
                  Complete el origen y al menos un destino antes de continuar.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* LAYOUT: Formulario + Mapa */}
        <div className="grid gap-6 lg:grid-cols-5">
          {/* FORMULARIO */}
          <div className="lg:col-span-3">
            <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="p-6 sm:p-8 space-y-8">
                {/* Sección: Origen */}
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
                        setOrigenCoords(null);
                        setError(false);
                      }}
                      placeholder="Ej: Asamblea Legislativa, San Salvador, El Salvador"
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                    />
                    <p className="mt-2 text-xs text-slate-500">
                      Ingrese la dirección completa o haga clic en el mapa para seleccionar.
                      {isGeocoding && (
                        <span className="ml-2 text-indigo-600">
                          Buscando ubicación...
                        </span>
                      )}
                    </p>
                  </div>
                </section>

                <div className="h-px w-full bg-slate-200/70" />

                {/* Sección: Destinos */}
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

                  <div className="space-y-4">
                    {destinos.map((dest, index) => (
                      <div key={dest.id}>
                        <div className="mb-2 flex items-center justify-between">
                          <label className="text-xs font-semibold text-slate-700">
                            Destino {index + 1}{" "}
                            {index === 0 && (
                              <span className="text-red-500">*</span>
                            )}
                          </label>
                          {destinos.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeDestination(dest.id)}
                              className="text-xs font-medium text-red-600 transition hover:text-red-700"
                            >
                              Eliminar
                            </button>
                          )}
                        </div>
                        <input
                          type="text"
                          value={dest.address}
                          onChange={(e) =>
                            updateDestination(dest.id, e.target.value)
                          }
                          placeholder="Ej: Santa Ana, El Salvador"
                          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                        />
                      </div>
                    ))}

                    {/* Botón agregar destino */}
                    <button
                      type="button"
                      onClick={addDestination}
                      className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-200"
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
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      Agregar destino adicional
                    </button>

                    <p className="text-xs text-slate-500">
                      Puede agregar múltiples destinos para su ruta o hacer clic en el mapa.
                    </p>
                  </div>
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
                    Mapa interactivo
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">
                    Haga clic en el mapa para seleccionar ubicaciones.
                  </p>
                </div>

                <div id="map" className="h-[500px] bg-slate-50"></div>

                {/* Distancia y tiempo estimado */}
                {routeInfo && (
                  <div className="border-t border-slate-200 bg-white px-6 py-4">
                    <div className="flex items-center gap-6 text-sm text-slate-700">
                      <div className="flex items-center gap-2">
                        <svg
                          className="h-4 w-4 text-indigo-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                          />
                        </svg>
                        <span>
                          <span className="font-semibold">Distancia:</span>{" "}
                          {routeInfo.distance.toFixed(1)} km
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <svg
                          className="h-4 w-4 text-indigo-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span>
                          <span className="font-semibold">Tiempo aprox.:</span>{" "}
                          {(routeInfo.duration * 60).toFixed(0)} min
                        </span>
                      </div>
                    </div>
                    <p className="mt-1.5 text-xs text-slate-400">
                      * Estimación sin considerar tráfico en tiempo real.
                    </p>
                  </div>
                )}

                {/* Info adicional */}
                <div className="border-t border-slate-200 bg-slate-50 px-6 py-4">
                  <div className="space-y-2 text-xs text-slate-600">
                    <p>
                      <span className="font-semibold">🗺️ Cómo usar:</span>
                    </p>
                    <ul className="ml-4 space-y-1 list-disc">
                      <li>Escriba direcciones completas en los campos de texto</li>
                      <li>
                        O haga clic directamente en el mapa para seleccionar ubicaciones
                      </li>
                      <li>El marcador azul 📍 indica el origen</li>
                      <li>Los marcadores rojos 📍 indican los destinos</li>
                    </ul>
                  </div>
                </div>
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