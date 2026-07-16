import React from 'react';
import { X, Car, User, RefreshCw } from 'lucide-react';
import { RecursoDisponible } from '../api/solicitudApi';

interface ModalReasignarViajeProps {
  isOpen: boolean;
  onClose: () => void;
  loadingRecursos: boolean;
  recursos: RecursoDisponible | null;
  selectedVehiculo: number | '';
  setSelectedVehiculo: (val: number | '') => void;
  selectedMotorista: number | '';
  setSelectedMotorista: (val: number | '') => void;
  motivoReasignacion: string;
  setMotivoReasignacion: (val: string) => void;
  isSubmitting: boolean;
  onConfirm: () => void;
}

export const ModalReasignarViaje: React.FC<ModalReasignarViajeProps> = ({
  isOpen, onClose, loadingRecursos, recursos, selectedVehiculo, setSelectedVehiculo,
  selectedMotorista, setSelectedMotorista, motivoReasignacion, setMotivoReasignacion,
  isSubmitting, onConfirm
}) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-slate-800 text-lg">Reasignar Recursos</h3>
            <p className="text-xs text-slate-500 mt-1">Selecciona el nuevo motorista y vehículo disponible.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {loadingRecursos ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4F46E5]"></div>
            </div>
          ) : (
            <>
              {/* Selector de Vehículo */}
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <Car size={12} /> Nuevo Vehículo
                </label>
                <select
                  value={selectedVehiculo}
                  onChange={(e) => setSelectedVehiculo(e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                >
                  <option value="">-- Seleccionar vehículo --</option>
                  {recursos?.vehiculos.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.label || `${v.placa} — ${v.marca}`} {v.nivel_combustible ? `(Combustible: ${v.nivel_combustible.label})` : ''}
                    </option>
                  ))}
                </select>
                {recursos?.vehiculos.length === 0 && (
                  <p className="text-xs text-amber-600 mt-1">No hay vehículos disponibles en este horario.</p>
                )}
              </div>

              {/* Selector de Motorista */}
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <User size={12} /> Nuevo Motorista
                </label>
                <select
                  value={selectedMotorista}
                  onChange={(e) => setSelectedMotorista(e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                >
                  <option value="">-- Seleccionar motorista --</option>
                  {recursos?.motoristas.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.nombre} {m.dui ? `(${m.dui})` : ''}
                    </option>
                  ))}
                </select>
                {recursos?.motoristas.length === 0 && (
                  <p className="text-xs text-amber-600 mt-1">No hay motoristas disponibles en este horario.</p>
                )}
              </div>

              {/* Motivo */}
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">
                  Motivo de la reasignación (obligatorio)
                </label>
                <textarea
                  value={motivoReasignacion}
                  onChange={(e) => setMotivoReasignacion(e.target.value)}
                  placeholder="Ej: Motorista original reportó enfermedad..."
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
                />
                <div className="flex justify-between items-center mt-1">
                  <p className={`text-[10px] font-medium ${motivoReasignacion.trim().length < 10 ? 'text-amber-500' : 'text-emerald-500'}`}>
                    Mínimo 10 caracteres
                  </p>
                  <p className={`text-[10px] font-bold ${motivoReasignacion.trim().length < 10 ? 'text-slate-400' : 'text-emerald-600'}`}>
                    {motivoReasignacion.trim().length}/10
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="p-6 border-t border-slate-200 flex flex-col sm:flex-row gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-colors text-sm"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={isSubmitting || !selectedVehiculo || !selectedMotorista || motivoReasignacion.trim().length < 10}
            className="flex-1 px-4 py-2.5 bg-gradient-to-r from-[#4F46E5] to-[#3b32c9] text-white font-bold rounded-xl hover:shadow-lg transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> Procesando...</>
            ) : (
              <><RefreshCw size={16} /> Confirmar Reasignación</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
