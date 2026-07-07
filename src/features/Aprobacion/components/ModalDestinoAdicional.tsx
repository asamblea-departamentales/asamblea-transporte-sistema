import React, { useState } from 'react';
import { X, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { solicitudApi } from '../api/solicitudApi';

interface ModalDestinoAdicionalProps {
  isOpen: boolean;
  onClose: () => void;
  solicitudId: string;
  onSuccess: () => void;
}

export function ModalDestinoAdicional({ isOpen, onClose, solicitudId, onSuccess }: ModalDestinoAdicionalProps) {
  const [destino, setDestino] = useState('');
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
      await solicitudApi.addDestinoEnEjecucion(solicitudId, destino);
      toast.success('Destino adicional registrado y motorista notificado');
      setDestino('');
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al añadir el destino');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
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
          <div className="mb-6">
            <label className="block text-sm font-bold text-slate-700 mb-2">Nuevo Destino Adicional</label>
            <textarea
              value={destino}
              onChange={(e) => setDestino(e.target.value)}
              placeholder="Ej: Ministerio de Hacienda, San Salvador..."
              className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-[#859BFF] focus:ring-2 focus:ring-[#859BFF]/20 transition-all resize-none min-h-[100px]"
              autoFocus
            />
            <p className="text-xs text-slate-500 mt-2">
              Se enviará una notificación push inmediatamente al dispositivo del motorista con esta actualización.
            </p>
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
