import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, AlertCircle } from 'lucide-react';

// Solución al problema de iconos por defecto de Leaflet con Vite/Webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Componente para ajustar los límites del mapa (zoom) a los marcadores
const MapBounds: React.FC<{ bounds: L.LatLngBoundsExpression }> = ({ bounds }) => {
  const map = useMap();
  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [bounds, map]);
  return null;
};

interface MapaViajeProps {
  origen: string;
  destino: string;
  origen_lat?: number | null;
  origen_lng?: number | null;
  destino_lat?: number | null;
  destino_lng?: number | null;
}

export const MapaViaje: React.FC<MapaViajeProps> = ({
  origen,
  destino,
  origen_lat,
  origen_lng,
  destino_lat,
  destino_lng
}) => {
  const hasCoordinates = origen_lat != null && origen_lng != null && destino_lat != null && destino_lng != null;

  // Centro por defecto: El Salvador
  const defaultCenter: [number, number] = [13.6929, -88.8181];
  const defaultZoom = 8;

  const originPos: [number, number] | null = (origen_lat != null && origen_lng != null) ? [origen_lat, origen_lng] : null;
  const destPos: [number, number] | null = (destino_lat != null && destino_lng != null) ? [destino_lat, destino_lng] : null;

  const bounds: L.LatLngTuple[] = [];
  if (originPos) bounds.push(originPos);
  if (destPos) bounds.push(destPos);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full relative">
      {!hasCoordinates && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-amber-50 border border-amber-200 shadow-md text-amber-800 px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2">
          <AlertCircle size={14} /> El sistema no registró coordenadas exactas para este viaje.
        </div>
      )}
      
      <div className="flex-1 w-full h-full min-h-[400px] z-0">
        <MapContainer 
          center={originPos || defaultCenter} 
          zoom={originPos ? 13 : defaultZoom} 
          scrollWheelZoom={true} 
          style={{ height: '100%', width: '100%', zIndex: 10 }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {originPos && (
            <Marker position={originPos}>
              <Popup>
                <div className="font-bold text-slate-800">Origen</div>
                <div className="text-xs text-slate-600">{origen}</div>
              </Popup>
            </Marker>
          )}
          
          {destPos && (
            <Marker position={destPos}>
              <Popup>
                <div className="font-bold text-slate-800">Destino</div>
                <div className="text-xs text-slate-600">{destino}</div>
              </Popup>
            </Marker>
          )}

          {bounds.length === 2 && <MapBounds bounds={bounds} />}
        </MapContainer>
      </div>

      <div className="bg-slate-50 p-4 border-t border-slate-200 z-20">
        <div className="flex items-start gap-3 mb-2">
          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-1">
            <MapPin size={16} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Punto de Partida</p>
            <p className="text-sm font-medium text-slate-800">{origen}</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0 mt-1">
            <MapPin size={16} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Destino Oficial</p>
            <p className="text-sm font-medium text-slate-800">{destino}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
