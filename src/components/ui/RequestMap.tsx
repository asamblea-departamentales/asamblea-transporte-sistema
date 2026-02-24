import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { geocodeAddress, getOSRMRoute, haversineKm } from "../../lib/geo";

type RouteInfo = {
  distance: number;
  duration: number;
  isReal: boolean;
};

// Iconos SVG inline para no depender de assets externos
const originIcon = L.icon({
  iconUrl:
    "data:image/svg+xml;base64," +
    btoa(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#4F46E5" width="32" height="32">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
      </svg>`
    ),
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  popupAnchor: [0, -28],
});

const destIcon = L.icon({
  iconUrl:
    "data:image/svg+xml;base64," +
    btoa(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#DC2626" width="32" height="32">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
      </svg>`
    ),
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  popupAnchor: [0, -28],
});

interface RequestMapProps {
  origen: string;
  destino: string;
}

/**
 * Mapa de solo lectura que muestra la ruta entre origen y destino.
 * Usa geocoding (Nominatim) + ruta real (OSRM) con fallback a línea recta.
 *
 * Diferente a RouteMap.tsx que es interactivo (click para agregar puntos).
 */
export default function RequestMap({ origen, destino }: RequestMapProps) {
  const mapId    = useRef(`map-detail-${Math.random().toString(36).slice(2)}`);
  const mapRef   = useRef<L.Map | null>(null);
  const [routeInfo, setRouteInfo]     = useState<RouteInfo | null>(null);
  const [isLoadingMap, setIsLoadingMap] = useState(true);

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
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
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
            color: "#4F46E5",
            weight: 5,
            opacity: 0.85,
          }).addTo(map);
          setRouteInfo({ distance: osrm.distanceKm, duration: osrm.durationMin, isReal: true });
        } else {
          // Fallback: línea recta punteada
          L.polyline(
            [
              [origenCoords.lat, origenCoords.lng],
              [destinoCoords.lat, destinoCoords.lng],
            ],
            { color: "#4F46E5", weight: 4, opacity: 0.7, dashArray: "10, 10" }
          ).addTo(map);
          const km = haversineKm(
            origenCoords.lat, origenCoords.lng,
            destinoCoords.lat, destinoCoords.lng
          );
          setRouteInfo({ distance: km, duration: (km / 45) * 60, isReal: false });
        }

        map.fitBounds(
          [
            [origenCoords.lat, origenCoords.lng],
            [destinoCoords.lat, destinoCoords.lng],
          ] as L.LatLngBoundsExpression,
          { padding: [40, 40] }
        );

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
      {/* Header */}
      <div className="border-b border-slate-200 bg-slate-50 px-4 py-2.5">
        <p className="text-xs font-bold text-slate-600">🗺️ Ruta en mapa</p>
      </div>

      {/* Mapa */}
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

      {/* Info de ruta */}
      {routeInfo && !isLoadingMap && (
        <div className="flex flex-wrap items-center gap-4 border-t border-slate-200 bg-white px-4 py-3 text-xs text-slate-700">
          <div className="flex items-center gap-1.5">
            <svg className="h-3.5 w-3.5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
              />
            </svg>
            <span>
              <span className="font-semibold">Distancia:</span>{" "}
              {routeInfo.distance.toFixed(1)} km
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <svg className="h-3.5 w-3.5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>
              <span className="font-semibold">Tiempo aprox.:</span>{" "}
              {Math.round(routeInfo.duration)} min
            </span>
          </div>
          <span className="text-slate-400">
            {routeInfo.isReal ? "Ruta real por carretera" : "Estimación en línea recta"}
          </span>
        </div>
      )}
    </div>
  );
}