import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import { useEffect } from "react";
import MapSearch from "./MapSearch";

type Point = {
  id: string;
  lat: number;
  lng: number;
};

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function ClickHandler({ onAdd }: { onAdd: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onAdd(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// Componente interno para volar la cámara al último punto agregado
function MapFlyTo({ points }: { points: Point[] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length > 0) {
      const lastPoint = points[points.length - 1];
      map.flyTo([lastPoint.lat, lastPoint.lng], 16, { duration: 1.5 });
    }
  }, [points, map]);
  return null;
}

// Fronteras geográficas de El Salvador (SurOeste y NorEste)
const EL_SALVADOR_BOUNDS = L.latLngBounds(
  L.latLng(13.0, -90.2),
  L.latLng(14.5, -87.6)
);

export default function RouteMap({
  points,
  onAddPoint,
}: {
  points: Point[];
  onAddPoint: (lat: number, lng: number) => void;
}) {
  return (
    <div className="relative h-full w-full">
      {/* Buscador Inteligente en la parte superior */}
      <MapSearch onLocationSelect={onAddPoint} />

      <MapContainer
        center={[13.7942, -88.8965]}
        zoom={8}
        minZoom={8}
        maxBounds={EL_SALVADOR_BOUNDS}
        maxBoundsViscosity={1.0}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CartoDB</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        <ClickHandler onAdd={onAddPoint} />
        <MapFlyTo points={points} />

        {points.map((p) => (
          <Marker
            key={p.id}
            position={[p.lat, p.lng]}
            icon={markerIcon}
          />
        ))}
      </MapContainer>
    </div>
  );
}
