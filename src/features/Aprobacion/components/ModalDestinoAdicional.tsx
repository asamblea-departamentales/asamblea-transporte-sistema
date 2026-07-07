import React, { useState } from 'react';
import { X, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { solicitudApi } from '../api/solicitudApi';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Solución al problema de iconos por defecto de Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function LocationMarker({ position, setPosition, setDestino }: { position: L.LatLng | null, setPosition: (pos: L.LatLng) => void, setDestino: (dest: string) => void }) {
  useMapEvents({
    async click(e) {
      setPosition(e.latlng);
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${e.latlng.lat}&lon=${e.latlng.lng}`);
        const data = await response.json();
        if (data && data.display_name) {
          // Tomamos el nombre, pero lo limpiamos un poco si es muy largo
          const address = data.display_name.split(',').slice(0, 3).join(',');
          setDestino(address);
        }
      } catch (error) {
        console.error("Error al obtener la dirección:", error);
      }
    },
  });
  return position === null ? null : <Marker position={position}></Marker>;
}

interface ModalDestinoAdicionalProps {
  isOpen: boolean;
  onClose: () => void;
  solicitudId: string;
  onSuccess: () => void;
}

export function ModalDestinoAdicional({ isOpen, onClose, solicitudId, onSuccess }: ModalDestinoAdicionalProps) {
  const [destino, setDestino] = useState('');
  const [position, setPosition] = useState<L.LatLng | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!destino.trim()) {
      toast.error('El destino es obligatorio');
      return;
    }

    try {
      setIsSubmitting(true);
      await solicitudApi.addDestinoEnEjecucion(solicitudId, destino, position?.lat, position?.lng);
      toast.success('Destino adicional registrado y motorista notificado');
      setDestino('');
      setPosition(null);
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al añadir el destino');
    } finally {
      setIsSubmitting(false);
    }
  };

  const defaultCenter: [number, number] = [13.6929, -88.8181]; // Centro de El Salvador

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 my-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#859BFF]/10 flex items-center justify-center text-[#859BFF]">
              <MapPin size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Añadir Destino</h2>
              <p className="text-sm text-slate-500">Modificar ruta en ejecución</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <label className="block text-sm font-bold text-slate-700 mb-2">Nuevo Destino Adicional</label>
            <textarea
              value={destino}
              onChange={(e) => setDestino(e.target.value)}
              placeholder="Ej: Ministerio de Hacienda, San Salvador..."
              className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-[#859BFF] focus:ring-2 focus:ring-[#859BFF]/20 transition-all resize-none min-h-[80px]"
              autoFocus
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-bold text-slate-700 mb-2">Punto en el Mapa (Opcional)</label>
            <p className="text-xs text-slate-500 mb-2">Haz clic en el mapa para marcar la ubicación exacta del destino.</p>
            <div className="w-full h-[250px] rounded-xl overflow-hidden border border-slate-300 relative z-0">
              <MapContainer 
                center={defaultCenter} 
                zoom={8} 
                scrollWheelZoom={true} 
                style={{ height: '100%', width: '100%', zIndex: 10 }}
              >
                <TileLayer
                  attribution='&copy; OpenStreetMap'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationMarker position={position} setPosition={setPosition} setDestino={setDestino} />
              </MapContainer>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 text-slate-600 font-bold bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors text-sm disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !destino.trim()}
              className="px-5 py-2.5 text-white font-bold bg-[#859BFF] hover:bg-[#7288f5] rounded-lg shadow-md transition-all text-sm flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Procesando...
                </>
              ) : (
                'Guardar y Notificar'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
