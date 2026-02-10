import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";

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

export default function RouteMap({
  points,
  onAddPoint,
}: {
  points: Point[];
  onAddPoint: (lat: number, lng: number) => void;
}) {
  return (
    <MapContainer
      center={[13.7942, -88.8965]}
      zoom={8}
      className="h-full w-full"
    >
      <TileLayer
        attribution="© OpenStreetMap"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <ClickHandler onAdd={onAddPoint} />

      {points.map((p) => (
        <Marker
          key={p.id}
          position={[p.lat, p.lng]}
          icon={markerIcon}
        />
      ))}
    </MapContainer>
  );
}
