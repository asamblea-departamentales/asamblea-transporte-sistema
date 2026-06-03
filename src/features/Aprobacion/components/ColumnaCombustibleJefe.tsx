import React from 'react';
import { DollarSign, ShieldAlert } from 'lucide-react';

interface ColumnaCombustibleJefeProps {
  montoActual: number | undefined;
  onMontoChange: (val: number) => void;
  isSelected: boolean;
  onSelect: () => void;
  isFaded: boolean;
}

export const ColumnaCombustibleJefe: React.FC<ColumnaCombustibleJefeProps> = ({ 
  montoActual, 
  onMontoChange, 
  isSelected, 
  onSelect, 
  isFaded 
}) => {
  return (
    <div 
      onClick={onSelect}
      className={`bg-white rounded-xl p-6 shadow-sm border-2 cursor-pointer transition-colors flex flex-col h-full ${
        isSelected ? 'border-success' : 'border-transparent hover:border-slate-300'
      } ${isFaded ? 'opacity-60 grayscale-[30%]' : ''}`}
      style={{
        boxShadow: isSelected ? '0 0 0 1px rgba(16, 185, 129, 0.1)' : '0 1px 3px rgba(0, 0, 0, 0.05)'
      }}
    >
      <div className="flex justify-between items-start mb-5 pb-4 border-b border-slate-200">
        <div>
          <h3 className="font-bold text-slate-800 text-lg tracking-tight">Re-asignar Manualmente</h3>
          <p className="text-xs text-slate-500 mt-1">Decisión del Jefe de Transporte</p>
        </div>
        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
          isSelected ? 'border-success bg-success' : 'border-slate-300'
        }`}>
          {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
        </div>
      </div>

      <div className="space-y-4 flex-1">
        <div className="border border-slate-200 rounded-lg p-5 flex flex-col gap-3 bg-slate-50">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <DollarSign size={14} /> Nuevo Monto a Aprobar
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">$</span>
            <input 
              type="number" 
              min="0"
              step="0.01"
              className="w-full pl-8 pr-4 py-3 text-2xl font-black text-slate-800 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-success focus:ring-1 focus:ring-success/20 transition-all"
              placeholder="0.00"
              value={montoActual || ''}
              onChange={(e) => onMontoChange(parseFloat(e.target.value))}
              onClick={(e) => {
                e.stopPropagation();
                onSelect();
              }}
            />
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Modifica este valor si no estás de acuerdo con la asignación del operativo.
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mt-auto">
          <p className="text-[11px] font-bold text-blue-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <ShieldAlert size={14} /> Autoridad
          </p>
          <p className="text-sm text-blue-900 leading-snug">
            Al seleccionar esta opción, el monto ingresado sobreescribirá la sugerencia del operativo.
          </p>
        </div>
      </div>
    </div>
  );
};
