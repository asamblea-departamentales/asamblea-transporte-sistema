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
  const generationRef = useRef(0);
  const sizeTimerRef = useRef<number | null>(null);

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

    sizeTimerRef.current = window.setTimeout(() => {
      if (mapRef.current) mapRef.current.invalidateSize();
      sizeTimerRef.current = null;
    }, 200);

    return () => {
      if (sizeTimerRef.current !== null) window.clearTimeout(sizeTimerRef.current);
      sizeTimerRef.current = null;
      generationRef.current += 1;
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      routeLayerRef.current?.remove();
      routeLayerRef.current = null;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const generation = ++generationRef.current;
    const renderMap = mapRef.current!;
    if (!renderMap) return;

    const isCurrent = () => generation === generationRef.current && mapRef.current === renderMap;
    const clearLayers = () => {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      routeLayerRef.current?.remove();
      routeLayerRef.current = null;
    };

    if (!origin.address) {
      clearLayers();
      queueMicrotask(() => {
        if (isCurrent()) setLoading(false);
      });
      return () => { generationRef.current += 1; };
    }

    async function calculateAndRender() {
      setLoading(true);
      clearLayers();

      const points: { lat: number; lng: number; label: string; iconColor: string }[] = [];
      const bounds: [number, number][] = [];

      let oLat = origin.lat;
      let oLng = origin.lng;
      if (oLat == null || oLng == null) {
        const coords = await geocodeAddress(origin.address);
        if (!isCurrent()) return;
        if (coords) { oLat = coords.lat; oLng = coords.lng; }
      }

      if (oLat != null && oLng != null) {
        points.push({ lat: oLat, lng: oLng, label: `Origen: ${origin.address}`, iconColor: "#0f2548" });
        bounds.push([oLat, oLng]);
      }

      for (let i = 0; i < destinations.length; i++) {
        const destination = destinations[i];
        if (!destination.address?.trim()) continue;

        let dLat = destination.lat;
        let dLng = destination.lng;
        if (dLat == null || dLng == null) {
          const coords = await geocodeAddress(destination.address);
          if (!isCurrent()) return;
          if (coords) { dLat = coords.lat; dLng = coords.lng; }
        }

        if (dLat != null && dLng != null) {
          points.push({ lat: dLat, lng: dLng, label: `Destino ${i + 1}: ${destination.address}`, iconColor: "#ef4444" });
          bounds.push([dLat, dLng]);
        }
      }

      if (!isCurrent()) return;
      points.forEach((point) => {
        const marker = L.marker([point.lat, point.lng], { icon: makeIcon(point.iconColor) })
          .bindPopup(point.label)
          .addTo(renderMap);
        markersRef.current.push(marker);
      });

      if (points.length >= 2) {
        const routeData = await getOSRMRoute(points.map((point) => ({ lat: point.lat, lng: point.lng })));
        if (!isCurrent()) return;
        if (routeData?.geometry?.length) {
          routeLayerRef.current = L.polyline(routeData.geometry, { color: "#3b82f6", weight: 6, opacity: 0.9, lineCap: "round", lineJoin: "round" }).addTo(renderMap);
          onRouteCalculated?.({ distance: routeData.distanceKm, duration: routeData.durationMin, isReal: true });
        } else {
          const pathCoords: [number, number][] = points.map((point) => [point.lat, point.lng]);
          routeLayerRef.current = L.polyline(pathCoords, { color: "#94a3b8", weight: 4, opacity: 0.8, dashArray: "8, 8", lineCap: "round" }).addTo(renderMap);
          const distance = points.slice(1).reduce((sum, point, index) => sum + haversineKm(points[index].lat, points[index].lng, point.lat, point.lng), 0);
          onRouteCalculated?.({ distance, duration: (distance / 45) * 60, isReal: false });
        }
      }

      if (!isCurrent()) return;
      if (bounds.length > 0) renderMap.fitBounds(bounds as L.LatLngBoundsExpression, { padding: [50, 50], animate: false });
      if (sizeTimerRef.current !== null) window.clearTimeout(sizeTimerRef.current);
      sizeTimerRef.current = window.setTimeout(() => {
        if (isCurrent()) renderMap.invalidateSize();
        sizeTimerRef.current = null;
      }, 100);
      setLoading(false);
    }

    void calculateAndRender();
    return () => { generationRef.current += 1; };
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
