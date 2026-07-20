// src/components/transport/MapViewer.tsx
import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { geocodeAddress, getOSRMRoute, haversineKm } from "../../lib/geo";
import { makeIcon, SV_BOUNDS } from "../../pages/transport/mapIcons";

export type MapPoint = {
  address: string;
  lat?: number | null;
  lng?: number | null;
};

interface MapViewerProps {
  origin: MapPoint;
  destinations: MapPoint[];
  className?: string;
  onRouteCalculated?: (info: { distance: number; duration: number; isReal: boolean }) => void;
}

export default function MapViewer({ origin, destinations, className = "h-[400px]", onRouteCalculated }: MapViewerProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const routeLayerRef = useRef<L.Polyline | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      zoomControl: true,
      dragging: true,
      touchZoom: true,
      scrollWheelZoom: true,
      doubleClickZoom: true,
      zoomAnimation: false,
      fadeAnimation: false,
      markerZoomAnimation: false,
      maxBounds: SV_BOUNDS,
      maxBoundsViscosity: 1.0,
      minZoom: 8,
    }).setView([13.7942, -88.8965], 9);

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;

    setTimeout(() => {
      if (mapRef.current) mapRef.current.invalidateSize();
    }, 200);

    return () => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      routeLayerRef.current?.remove();
      routeLayerRef.current = null;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current || !origin.address) return;

    async function calculateAndRender() {
      const map = mapRef.current;
      if (!map) return;

      setLoading(true);

      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      routeLayerRef.current?.remove();
      routeLayerRef.current = null;

      const points: { lat: number; lng: number; label: string; iconColor: string }[] = [];
      const bounds: [number, number][] = [];

      // Origen
      let oLat = origin.lat;
      let oLng = origin.lng;
      if (oLat == null || oLng == null) {
        const coords = await geocodeAddress(origin.address);
        if (coords) { oLat = coords.lat; oLng = coords.lng; }
      }

      if (oLat != null && oLng != null) {
        points.push({ lat: oLat, lng: oLng, label: `Origen: ${origin.address}`, iconColor: "#0f2548" });
        bounds.push([oLat, oLng]);
      }

      // Destinos
      for (let i = 0; i < destinations.length; i++) {
        const d = destinations[i];
        if (!d.address?.trim()) continue;

        let dLat = d.lat;
        let dLng = d.lng;
        if (dLat == null || dLng == null) {
          const coords = await geocodeAddress(d.address);
          if (coords) { dLat = coords.lat; dLng = coords.lng; }
        }

        if (dLat != null && dLng != null) {
          points.push({
            lat: dLat,
            lng: dLng,
            label: `Destino ${i + 1}: ${d.address}`,
            iconColor: "#ef4444",
          });
          bounds.push([dLat, dLng]);
        }
      }

      // Dibujar marcadores
      points.forEach((p) => {
        const icon = makeIcon(p.iconColor);
        const marker = L.marker([p.lat, p.lng], { icon }).bindPopup(p.label).addTo(map);
        markersRef.current.push(marker);
      });

      // Calcular ruta
      if (points.length >= 2) {
        const routeData = await getOSRMRoute(points.map((p) => ({ lat: p.lat, lng: p.lng })));
        if (routeData?.geometry?.length) {
          const polyline = L.polyline(routeData.geometry, { color: "#3b82f6", weight: 6, opacity: 0.9, lineCap: "round", lineJoin: "round" }).addTo(map);
          routeLayerRef.current = polyline;
          onRouteCalculated?.({ distance: routeData.distanceKm, duration: routeData.durationMin, isReal: true });
        } else {
          const pathCoords: [number, number][] = points.map((p) => [p.lat, p.lng]);
          const polyline = L.polyline(pathCoords, { color: "#94a3b8", weight: 4, opacity: 0.8, dashArray: "8, 8", lineCap: "round" }).addTo(map);
          routeLayerRef.current = polyline;

          let distSum = 0;
          for (let i = 0; i < points.length - 1; i++) {
            distSum += haversineKm(points[i].lat, points[i].lng, points[i + 1].lat, points[i + 1].lng);
          }
          onRouteCalculated?.({ distance: distSum, duration: (distSum / 45) * 60, isReal: false });
        }
      }

      if (bounds.length > 0) {
        map.fitBounds(bounds as L.LatLngBoundsExpression, { padding: [50, 50], animate: false });
      }

      setTimeout(() => map.invalidateSize(), 100);
      setLoading(false);
    }

    calculateAndRender();
  }, [origin.address, origin.lat, origin.lng, destinations, onRouteCalculated]);

  return (
    <div className={`relative ${className} w-full bg-slate-100`}>
      {loading && (
        <div className="absolute inset-0 z-[400] flex items-center justify-center bg-white/60 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-2">
            <svg className="h-8 w-8 animate-spin text-blue-600" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Calculando ruta...</span>
          </div>
        </div>
      )}
      <div ref={containerRef} className="h-full w-full" />
    </div>
  );
}
