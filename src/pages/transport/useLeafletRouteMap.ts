import { useEffect, useRef, type RefObject } from "react";
import L from "leaflet";
import { ICON_DEST, ICON_ORIGIN, SV_BOUNDS } from "./mapIcons";
import { hasValidCoords, type DestinationPoint } from "./transportUtils";

type Coordinates = { lat: number; lng: number };
type Options = {
  origin: string;
  originCoordinates: Coordinates | null;
  destinations: DestinationPoint[];
  onMapPoint: (coordinates: Coordinates) => void;
};

export function useLeafletRouteMap(options: Options): RefObject<HTMLDivElement | null> {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const routeLayerRef = useRef<L.Polyline | null>(null);
  const fitBoundsTimerRef = useRef<number | null>(null);
  const onMapPointRef = useRef(options.onMapPoint);

  useEffect(() => {
    onMapPointRef.current = options.onMapPoint;
  }, [options.onMapPoint]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, {
      zoomControl: true, dragging: true, touchZoom: true, scrollWheelZoom: true,
      doubleClickZoom: true, zoomAnimation: false, fadeAnimation: false,
      markerZoomAnimation: false, maxBounds: SV_BOUNDS, maxBoundsViscosity: 1, minZoom: 8,
    }).setView([13.7942, -88.8965], 9);
    mapRef.current = map;
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>', maxZoom: 19,
    }).addTo(map);
    map.on("click", (event: L.LeafletMouseEvent) => {
      onMapPointRef.current({ lat: event.latlng.lat, lng: event.latlng.lng });
    });
    const invalidateTimer = window.setTimeout(() => map.invalidateSize(), 200);
    return () => {
      window.clearTimeout(invalidateTimer);
      if (fitBoundsTimerRef.current) window.clearTimeout(fitBoundsTimerRef.current);
      markersRef.current.forEach((marker) => marker.remove());
      routeLayerRef.current?.remove();
      map.off();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (fitBoundsTimerRef.current) window.clearTimeout(fitBoundsTimerRef.current);
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];
    routeLayerRef.current?.remove();
    routeLayerRef.current = null;
    const bounds: [number, number][] = [];
    if (options.originCoordinates && hasValidCoords(options.originCoordinates.lat, options.originCoordinates.lng)) {
      markersRef.current.push(L.marker([options.originCoordinates.lat, options.originCoordinates.lng], { icon: ICON_ORIGIN })
        .addTo(map).bindPopup(`<b>Origen:</b><br>${options.origin}`));
      bounds.push([options.originCoordinates.lat, options.originCoordinates.lng]);
    }
    const located = options.destinations.filter((item) => hasValidCoords(item.lat, item.lng));
    located.forEach((item, index) => {
      markersRef.current.push(L.marker([item.lat!, item.lng!], { icon: ICON_DEST })
        .addTo(map).bindPopup(`<b>Destino ${index + 1}:</b><br>${item.address}`));
      bounds.push([item.lat!, item.lng!]);
    });
    if (options.originCoordinates && located.length) {
      routeLayerRef.current = L.polyline([
        [options.originCoordinates.lat, options.originCoordinates.lng],
        ...located.map((item) => [item.lat!, item.lng!] as L.LatLngExpression),
      ], { color: "#3b82f6", weight: 5, opacity: 0.85, dashArray: "8, 8", lineCap: "round" }).addTo(map);
    }
    if (bounds.length) {
      const leafletBounds = L.latLngBounds(bounds);
      fitBoundsTimerRef.current = window.setTimeout(() => {
        if (!mapRef.current || !leafletBounds.isValid()) return;
        mapRef.current.invalidateSize();
        mapRef.current.fitBounds(leafletBounds, { padding: [50, 50], animate: false });
      }, 200);
    }
  }, [options.origin, options.originCoordinates, options.destinations]);
  return containerRef;
}
