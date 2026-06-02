import React from 'react';
import { AsignacionOperativo } from '../types';
import { Car, User, MessageSquare } from 'lucide-react';

interface ColumnaOperativoProps {
  data: AsignacionOperativo | null;
  isSelected: boolean;
  onSelect: () => void;
  isFaded: boolean;
}

export const ColumnaOperativo: React.FC<ColumnaOperativoProps> = ({ data, isSelected, onSelect, isFaded }) => {
  if (!data) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 flex flex-col h-full items-center justify-center text-center">
        <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mb-4">
          <User className="text-slate-400" size={24} />
        </div>
        <p className="text-sm font-bold text-slate-800">Sin Asignación Manual</p>
        <p className="text-xs text-slate-500 mt-1">Aún no hay asignación por parte de operaciones.</p>
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
          <h3 className="font-bold text-slate-800 text-lg tracking-tight">Asignación Manual</h3>
          <p className="text-xs text-slate-500 mt-1">Por Operador: {data.autor}</p>
        </div>
        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
          isSelected ? 'border-primary bg-primary' : 'border-slate-300'
        }`}>
          {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
        </div>
      </div>

      <div className="space-y-4 flex-1">
        <ResourceCard 
          icon={<Car size={16} />} 
          title="Vehículo Asignado"
          name={data.vehiculo.placa}
          subtitle={data.vehiculo.modelo}
          fuel={data.vehiculo.combustible_porcentaje}
        />

        <ResourceCard 
          icon={<User size={16} />} 
          title="Motorista Asignado"
          name={data.motorista.nombre}
          hours={data.motorista.horas_periodo_7d}
        />

        {data.cambio_detectado !== 'ninguno' && data.justificacion && (
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg mt-auto">
            <p className="text-[11px] font-bold text-amber-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <MessageSquare size={14} /> Justificación Operativa
            </p>
            <p className="text-sm text-amber-900 italic">"{data.justificacion}"</p>
          </div>
        )}
      </div>
    </div>
  );
};

const ResourceCard = ({ icon, title, name, subtitle, fuel, hours }: any) => (
  <div className="border border-slate-200 rounded-lg p-3 flex gap-3 bg-slate-50">
    <div className="w-10 h-10 rounded text-slate-500 bg-white border border-slate-200 flex items-center justify-center shrink-0">
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{title}</p>
      <p className="text-sm font-semibold text-slate-800 truncate">{name}</p>
      {subtitle && <p className="text-xs text-slate-500 truncate mt-0.5">{subtitle}</p>}
      {hours !== undefined && <p className="text-xs text-slate-500 mt-0.5 font-medium">Manejo 7D: <span className="text-slate-800">{hours} hrs</span></p>}
    </div>
    {fuel !== undefined && (
      <div className="flex flex-col items-end justify-center shrink-0">
        <span className="text-xs font-bold text-slate-800">{fuel}%</span>
        <div className="w-8 h-1.5 bg-slate-200 rounded-sm mt-1 overflow-hidden">
          <div className={`h-full ${fuel > 20 ? 'bg-success' : 'bg-danger'}`} style={{ width: `${fuel}%` }} />
        </div>
      </div>
    )}
  </div>
);
