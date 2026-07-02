import React from 'react';
import { AsignacionOperativoCombustible } from '../types';
import { DollarSign, MessageSquare, User } from 'lucide-react';

interface ColumnaCombustibleOperativoProps {
  data: AsignacionOperativoCombustible | null;
  isSelected: boolean;
  onSelect: () => void;
  isFaded: boolean;
}

export const ColumnaCombustibleOperativo: React.FC<ColumnaCombustibleOperativoProps> = ({ data, isSelected, onSelect, isFaded }) => {
  if (!data) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 flex flex-col h-full items-center justify-center text-center">
        <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mb-4">
          <User className="text-slate-400" size={24} />
        </div>
        <p className="text-sm font-bold text-slate-800">Sin Asignación de Carga</p>
        <p className="text-xs text-slate-500 mt-1">Aún no hay asignación de cargas por parte de operaciones.</p>
      </div>
    );
  }

  return (
    <div 
      onClick={onSelect}
      className={`bg-white rounded-xl p-6 shadow-sm border-2 cursor-pointer transition-colors flex flex-col h-full ${
        isSelected ? 'border-primary' : 'border-transparent hover:border-slate-300'
      } ${isFaded ? 'opacity-60 grayscale-[30%]' : ''}`}
      style={{
        boxShadow: isSelected ? '0 0 0 1px rgba(59, 130, 246, 0.1)' : '0 1px 3px rgba(0, 0, 0, 0.05)'
      }}
    >
      <div className="flex justify-between items-start mb-5 pb-4 border-b border-slate-200">
        <div>
          <h3 className="font-bold text-slate-800 text-lg tracking-tight">Asignación del Operativo</h3>
          <p className="text-xs text-slate-500 mt-1">Sugerido por: {data.autor}</p>
        </div>
        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
          isSelected ? 'border-primary bg-primary' : 'border-slate-300'
        }`}>
          {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
        </div>
      </div>

      <div className="space-y-4 flex-1">
        <div className="border border-slate-200 rounded-lg p-4 flex gap-4 bg-slate-50 items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
            <DollarSign size={24} />
          </div>
          <div className="flex-1">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cargas Asignadas</p>
            <p className="text-2xl font-black text-slate-800">${data.monto_aprobado.toFixed(2)}</p>
          </div>
        </div>

        {data.justificacion && (
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg mt-auto">
            <p className="text-[11px] font-bold text-amber-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <MessageSquare size={14} /> Justificación
            </p>
            <p className="text-sm text-amber-900 italic">"{data.justificacion}"</p>
          </div>
        )}
      </div>
    </div>
  );
};
